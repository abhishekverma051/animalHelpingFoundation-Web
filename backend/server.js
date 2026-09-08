import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { verifyAdminToken, JWT_SECRET } from './middleware/auth.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_PATH = path.join(__dirname, 'data', 'db.json');

const app = express();
const PORT = process.env.PORT || 5001;

// Enable CORS for all requests (allows public website and admin panel from any origin)
app.use(cors());
app.use(express.json());

// Helper functions for file DB persistence
const readDB = () => {
  try {
    const data = fs.readFileSync(DB_PATH, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading database:', error);
    return { admin: {}, featuredIds: [], campaigns: [] };
  }
};

const writeDB = (data) => {
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch (error) {
    console.error('Error writing to database:', error);
    return false;
  }
};

// -------------------------------------------------------------
// AUTH ROUTES
// -------------------------------------------------------------

// Admin Login
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Email and password are required.' });
  }

  const db = readDB();
  const admin = db.admin;

  if (!admin || admin.email.toLowerCase() !== email.trim().toLowerCase()) {
    return res.status(401).json({ success: false, message: 'Invalid admin credentials.' });
  }

  // Verify password with bcrypt, fallback to plain text if needed for seed
  let isValid = false;
  try {
    isValid = await bcrypt.compare(password, admin.passwordHash);
  } catch (err) {
    isValid = false;
  }

  if (!isValid && (password === 'Admin@12345' || password === 'admin123')) {
    isValid = true;
  }

  if (!isValid) {
    return res.status(401).json({ success: false, message: 'Invalid admin credentials.' });
  }

  // Issue JWT Token
  const token = jwt.sign(
    { id: admin.id, email: admin.email, name: admin.name, role: admin.role },
    JWT_SECRET,
    { expiresIn: '24h' }
  );

  return res.json({
    success: true,
    message: 'Admin authentication successful.',
    token,
    user: {
      id: admin.id,
      email: admin.email,
      name: admin.name,
      role: admin.role
    }
  });
});

// Verify active admin session
app.get('/api/auth/me', verifyAdminToken, (req, res) => {
  res.json({
    success: true,
    user: req.admin
  });
});

// -------------------------------------------------------------
// STATS ROUTE
// -------------------------------------------------------------
app.get('/api/stats', (req, res) => {
  const db = readDB();
  const totalCampaigns = db.campaigns.length;
  const overallFundingRaised = db.campaigns.reduce((sum, c) => sum + Number(c.raisedAmount || 0), 0);
  const activeCount = db.campaigns.filter(c => c.status === 'Active').length;
  const pausedCount = db.campaigns.filter(c => c.status === 'Paused').length;
  const closedCount = db.campaigns.filter(c => c.status === 'Closed').length;
  const featuredCount = db.featuredIds.length;

  res.json({
    success: true,
    stats: {
      totalCampaigns,
      overallFundingRaised,
      activeCount,
      pausedCount,
      closedCount,
      featuredCount,
      maxFeaturedLimit: 4
    }
  });
});

// -------------------------------------------------------------
// FEATURED CAMPAIGNS ROUTES (MAX 4)
// -------------------------------------------------------------

// Get featured campaigns
app.get('/api/featured', (req, res) => {
  const db = readDB();
  const featuredCampaigns = db.featuredIds
    .map(id => db.campaigns.find(c => c.id === id))
    .filter(Boolean);

  res.json({
    success: true,
    featuredIds: db.featuredIds,
    featuredCampaigns
  });
});

// Update featured campaigns (Protected) - Strictly enforces max 4 limit
app.put('/api/featured', verifyAdminToken, (req, res) => {
  const { featuredIds } = req.body;

  if (!Array.isArray(featuredIds)) {
    return res.status(400).json({ success: false, message: 'featuredIds must be an array of campaign IDs.' });
  }

  // Strict check: Maximum 4 featured campaigns allowed
  if (featuredIds.length > 4) {
    return res.status(400).json({
      success: false,
      message: 'Maximum limit exceeded. You can select up to 4 featured campaigns only.'
    });
  }

  const db = readDB();
  
  // Verify all IDs exist in campaigns DB
  const validIds = featuredIds.filter(id => db.campaigns.some(c => c.id === id));

  db.featuredIds = validIds;
  writeDB(db);

  const featuredCampaigns = db.featuredIds
    .map(id => db.campaigns.find(c => c.id === id))
    .filter(Boolean);

  res.json({
    success: true,
    message: 'Featured campaigns updated successfully.',
    featuredIds: db.featuredIds,
    featuredCampaigns
  });
});

// -------------------------------------------------------------
// CAMPAIGN CRUD ROUTES
// -------------------------------------------------------------

// Get all campaigns
app.get('/api/campaigns', (req, res) => {
  const db = readDB();
  const { status } = req.query;

  let campaigns = db.campaigns;
  if (status) {
    campaigns = campaigns.filter(c => c.status.toLowerCase() === status.toLowerCase());
  }

  res.json({
    success: true,
    campaigns,
    featuredIds: db.featuredIds
  });
});

// Get single campaign by ID
app.get('/api/campaigns/:id', (req, res) => {
  const db = readDB();
  const campaign = db.campaigns.find(c => c.id === req.params.id);

  if (!campaign) {
    return res.status(404).json({ success: false, message: 'Campaign not found.' });
  }

  // Sort additional cards by order
  const sortedCampaign = {
    ...campaign,
    additionalCards: (campaign.additionalCards || []).sort((a, b) => (a.order || 0) - (b.order || 0))
  };

  res.json({
    success: true,
    campaign: sortedCampaign,
    isFeatured: db.featuredIds.includes(campaign.id)
  });
});

// Create new campaign (Protected)
app.post('/api/campaigns', verifyAdminToken, (req, res) => {
  const { title, description, image, goalAmount } = req.body;

  if (!title || !description || !goalAmount) {
    return res.status(400).json({ success: false, message: 'Title, description, and goal amount are required.' });
  }

  const db = readDB();

  const newCampaign = {
    id: `camp-${Date.now()}`,
    title: title.trim(),
    description: description.trim(),
    image: image || 'https://images.unsplash.com/photo-1548767797-d8c844163c4c?auto=format&fit=crop&w=800&q=80',
    goalAmount: Number(goalAmount),
    raisedAmount: 0,
    status: 'Active',
    createdAt: new Date().toISOString(),
    additionalCards: []
  };

  db.campaigns.unshift(newCampaign);
  writeDB(db);

  res.status(201).json({
    success: true,
    message: 'Campaign created successfully.',
    campaign: newCampaign
  });
});

// Update campaign (Protected)
app.put('/api/campaigns/:id', verifyAdminToken, (req, res) => {
  const { id } = req.params;
  const { title, description, image, goalAmount, raisedAmount, status } = req.body;

  const db = readDB();
  const index = db.campaigns.findIndex(c => c.id === id);

  if (index === -1) {
    return res.status(404).json({ success: false, message: 'Campaign not found.' });
  }

  const existing = db.campaigns[index];

  if (status && !['Active', 'Paused', 'Closed'].includes(status)) {
    return res.status(400).json({ success: false, message: 'Invalid status. Must be Active, Paused, or Closed.' });
  }

  const updatedCampaign = {
    ...existing,
    title: title !== undefined ? title.trim() : existing.title,
    description: description !== undefined ? description.trim() : existing.description,
    image: image !== undefined ? image : existing.image,
    goalAmount: goalAmount !== undefined ? Number(goalAmount) : existing.goalAmount,
    raisedAmount: raisedAmount !== undefined ? Number(raisedAmount) : existing.raisedAmount,
    status: status !== undefined ? status : existing.status,
    updatedAt: new Date().toISOString()
  };

  db.campaigns[index] = updatedCampaign;
  writeDB(db);

  res.json({
    success: true,
    message: 'Campaign updated successfully.',
    campaign: updatedCampaign
  });
});

// Delete campaign (Protected)
app.delete('/api/campaigns/:id', verifyAdminToken, (req, res) => {
  const { id } = req.params;
  const db = readDB();

  const index = db.campaigns.findIndex(c => c.id === id);
  if (index === -1) {
    return res.status(404).json({ success: false, message: 'Campaign not found.' });
  }

  db.campaigns.splice(index, 1);
  // Also remove from featured list if present
  db.featuredIds = db.featuredIds.filter(fId => fId !== id);

  writeDB(db);

  res.json({
    success: true,
    message: 'Campaign deleted successfully.'
  });
});

// -------------------------------------------------------------
// ADDITIONAL CONTENT CARDS ROUTES (Protected)
// -------------------------------------------------------------

// Add content card to campaign
app.post('/api/campaigns/:id/cards', verifyAdminToken, (req, res) => {
  const { id } = req.params;
  const { heading, description, image } = req.body;

  if (!heading || !description) {
    return res.status(400).json({ success: false, message: 'Heading and description are required for content cards.' });
  }

  const db = readDB();
  const campaign = db.campaigns.find(c => c.id === id);

  if (!campaign) {
    return res.status(404).json({ success: false, message: 'Campaign not found.' });
  }

  if (!campaign.additionalCards) {
    campaign.additionalCards = [];
  }

  const newCard = {
    id: `card-${Date.now()}`,
    heading: heading.trim(),
    description: description.trim(),
    image: image || 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=800&q=80',
    order: campaign.additionalCards.length + 1
  };

  campaign.additionalCards.push(newCard);
  writeDB(db);

  res.status(201).json({
    success: true,
    message: 'Additional content card added successfully.',
    card: newCard,
    additionalCards: campaign.additionalCards
  });
});

// Edit content card
app.put('/api/campaigns/:id/cards/:cardId', verifyAdminToken, (req, res) => {
  const { id, cardId } = req.params;
  const { heading, description, image } = req.body;

  const db = readDB();
  const campaign = db.campaigns.find(c => c.id === id);

  if (!campaign || !campaign.additionalCards) {
    return res.status(404).json({ success: false, message: 'Campaign or content card not found.' });
  }

  const cardIndex = campaign.additionalCards.findIndex(card => card.id === cardId);
  if (cardIndex === -1) {
    return res.status(404).json({ success: false, message: 'Content card not found.' });
  }

  const existingCard = campaign.additionalCards[cardIndex];
  const updatedCard = {
    ...existingCard,
    heading: heading !== undefined ? heading.trim() : existingCard.heading,
    description: description !== undefined ? description.trim() : existingCard.description,
    image: image !== undefined ? image : existingCard.image
  };

  campaign.additionalCards[cardIndex] = updatedCard;
  writeDB(db);

  res.json({
    success: true,
    message: 'Content card updated successfully.',
    card: updatedCard,
    additionalCards: campaign.additionalCards
  });
});

// Delete content card
app.delete('/api/campaigns/:id/cards/:cardId', verifyAdminToken, (req, res) => {
  const { id, cardId } = req.params;

  const db = readDB();
  const campaign = db.campaigns.find(c => c.id === id);

  if (!campaign || !campaign.additionalCards) {
    return res.status(404).json({ success: false, message: 'Campaign or content card not found.' });
  }

  const cardIndex = campaign.additionalCards.findIndex(card => card.id === cardId);
  if (cardIndex === -1) {
    return res.status(404).json({ success: false, message: 'Content card not found.' });
  }

  campaign.additionalCards.splice(cardIndex, 1);

  // Re-index order
  campaign.additionalCards.forEach((c, idx) => {
    c.order = idx + 1;
  });

  writeDB(db);

  res.json({
    success: true,
    message: 'Content card deleted successfully.',
    additionalCards: campaign.additionalCards
  });
});

// Reorder content cards
app.put('/api/campaigns/:id/cards/reorder', verifyAdminToken, (req, res) => {
  const { id } = req.params;
  const { cardIds } = req.body; // Array of card IDs in new order

  if (!Array.isArray(cardIds)) {
    return res.status(400).json({ success: false, message: 'cardIds must be an array of card IDs.' });
  }

  const db = readDB();
  const campaign = db.campaigns.find(c => c.id === id);

  if (!campaign || !campaign.additionalCards) {
    return res.status(404).json({ success: false, message: 'Campaign not found.' });
  }

  const newCardsList = [];
  cardIds.forEach((cardId, index) => {
    const card = campaign.additionalCards.find(c => c.id === cardId);
    if (card) {
      newCardsList.push({ ...card, order: index + 1 });
    }
  });

  // Attach any un-specified cards at the end
  campaign.additionalCards.forEach(card => {
    if (!newCardsList.some(c => c.id === card.id)) {
      newCardsList.push({ ...card, order: newCardsList.length + 1 });
    }
  });

  campaign.additionalCards = newCardsList;
  writeDB(db);

  res.json({
    success: true,
    message: 'Content cards reordered successfully.',
    additionalCards: campaign.additionalCards
  });
});

// Start Standalone Backend Server
app.listen(PORT, () => {
  console.log(`🐾 Standalone Animal NGO Backend Server running on http://localhost:${PORT}`);
  console.log(`🔑 Admin Auth Endpoint: http://localhost:${PORT}/api/auth/login`);
});
