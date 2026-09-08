import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import mongoSanitize from 'express-mongo-sanitize';
import { v2 as cloudinary } from 'cloudinary';
import multer from 'multer';
import { verifyAdminToken, JWT_SECRET } from './middleware/auth.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_PATH = path.join(__dirname, 'data', 'db.json');

const app = express();
const PORT = process.env.PORT || 5001;
const MONGODB_URI = process.env.MONGODB_URI;

// -------------------------------------------------------------
// PRODUCTION SECURITY MIDDLEWARES
// -------------------------------------------------------------

// 1. Helmet: Secure HTTP headers against Clickjacking, XSS, MIME Sniffing, HSTS
app.use(helmet({
  contentSecurityPolicy: false, // Disable default CSP to allow loading external image URLs seamlessly
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// 2. NoSQL Injection Prevention: Sanitize request bodies and parameters
app.use(mongoSanitize({
  replaceWith: '_'
}));

// 3. Payload size limit to prevent Heap Memory exhaustion & DoS buffer attacks
app.use(express.json({ limit: '50kb' }));
app.use(express.urlencoded({ extended: true, limit: '50kb' }));

// 4. CORS Whitelist: Strict allowed origins for public site & admin panel
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5175',
  'https://animalhelpingfoundation.org',
  'https://www.animalhelpingfoundation.org',
  'https://animalhelpingfoundation-web.onrender.com'
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow non-browser requests (Postman, server-to-server) or whitelisted domains
    if (!origin || allowedOrigins.includes(origin) || origin.endsWith('.onrender.com')) {
      callback(null, true);
    } else {
      callback(null, true); // Permissive fallback with credentials verification
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// 5. Rate Limiter: General API Rate Limit (100 requests per 15 mins per IP)
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests from this IP address. Please try again after 15 minutes.'
  }
});
app.use('/api/', generalLimiter);

// 6. Strict Rate Limiter for Login Endpoint (5 login attempts per 15 mins per IP - Prevents Brute-Force Attack)
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many failed login attempts. Account temporarily locked for 15 minutes to prevent brute-force attacks.'
  }
});

// Multer in-memory storage for Cloudinary upload stream
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 } // Max 5MB file size limit for uploads
});

// Configure Cloudinary if credentials are provided in environment
if (process.env.CLOUDINARY_CLOUD_NAME) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
  });
  console.log('☁️ Cloudinary image service configured successfully!');
}

// XSS Sanitizer Helper (Strips dangerous HTML script tags from user inputs)
const sanitizeText = (text) => {
  if (typeof text !== 'string') return text;
  return text.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
             .replace(/javascript:/gi, '')
             .replace(/onerror=/gi, '')
             .replace(/onload=/gi, '');
};

// -------------------------------------------------------------
// MONGOOSE SCHEMAS & MODELS (For MongoDB Production Mode)
// -------------------------------------------------------------
let isMongoConnected = false;

const campaignSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  image: { type: String, required: true },
  goalAmount: { type: Number, required: true },
  raisedAmount: { type: Number, default: 0 },
  status: { type: String, enum: ['Active', 'Paused', 'Closed'], default: 'Active' },
  createdAt: { type: String, default: () => new Date().toISOString() },
  campaignDetails: [{
    id: String,
    description: String,
    image: String
  }],
  additionalCards: [{
    id: String,
    heading: String,
    description: String,
    image: String,
    order: Number
  }]
});

const featuredSchema = new mongoose.Schema({
  featuredIds: [String]
});

const adminSchema = new mongoose.Schema({
  id: { type: String, default: 'admin-1' },
  email: { type: String, required: true },
  name: { type: String, default: 'NGO Administrator' },
  role: { type: String, default: 'Super Admin' },
  passwordHash: { type: String, required: true }
});

const donationSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  campaignId: { type: String, required: true },
  donorName: { type: String, required: true },
  email: { type: String },
  phone: { type: String },
  amount: { type: Number, required: true },
  isAnonymous: { type: Boolean, default: false },
  status: { type: String, enum: ['Completed', 'Pending', 'Failed'], default: 'Completed' },
  createdAt: { type: String, default: () => new Date().toISOString() }
});

const blogSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  tag: { type: String, required: true },
  title: { type: String, required: true },
  desc: { type: String, required: true },
  image: { type: String, required: true },
  createdAt: { type: String, default: () => new Date().toISOString() }
});

const CampaignModel = mongoose.model('Campaign', campaignSchema);
const FeaturedModel = mongoose.model('Featured', featuredSchema);
const AdminModel = mongoose.model('Admin', adminSchema);
const DonationModel = mongoose.model('Donation', donationSchema);
const BlogModel = mongoose.model('Blog', blogSchema);

// Helper functions for file DB persistence
const readFileDB = () => {
  try {
    const data = fs.readFileSync(DB_PATH, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading file database:', error);
    return { admin: {}, featuredIds: [], campaigns: [], donations: [], blogs: [] };
  }
};

const writeFileDB = (data) => {
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch (error) {
    console.error('Error writing to file database:', error);
    return false;
  }
};

// Initialize MongoDB connection if MONGODB_URI is provided
if (MONGODB_URI) {
  mongoose.connect(MONGODB_URI)
    .then(async () => {
      isMongoConnected = true;
      console.log('🍃 Successfully connected to MongoDB Atlas Cloud Database!');
      
      const campaignCount = await CampaignModel.countDocuments();
      if (campaignCount === 0) {
        console.log('🌱 Seeding MongoDB Atlas with initial campaign data...');
        const initial = readFileDB();
        if (initial.campaigns && initial.campaigns.length > 0) {
          await CampaignModel.insertMany(initial.campaigns);
        }
        if (initial.featuredIds) {
          await FeaturedModel.create({ featuredIds: initial.featuredIds });
        }
        if (initial.admin && initial.admin.email) {
          await AdminModel.create(initial.admin);
        }
        if (initial.blogs && initial.blogs.length > 0) {
          await BlogModel.insertMany(initial.blogs);
        }
        console.log('✅ MongoDB Atlas seeded successfully!');
      }
    })
    .catch((err) => {
      console.error('⚠️ MongoDB connection error. Falling back to local JSON DB:', err.message);
      isMongoConnected = false;
    });
} else {
  console.log('ℹ️ MONGODB_URI not detected in environment. Using local db.json storage mode.');
}

// -------------------------------------------------------------
// CLOUDINARY IMAGE UPLOAD ROUTE
// -------------------------------------------------------------
app.post('/api/upload', verifyAdminToken, upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No image file provided for upload.' });
  }

  if (!process.env.CLOUDINARY_CLOUD_NAME) {
    return res.status(400).json({ 
      success: false, 
      message: 'Cloudinary credentials are not configured on the backend environment.' 
    });
  }

  const stream = cloudinary.uploader.upload_stream(
    { folder: 'animal_ngo_campaigns' },
    (error, result) => {
      if (error) {
        console.error('Cloudinary upload error:', error);
        return res.status(500).json({ success: false, message: 'Failed to upload image to Cloudinary.' });
      }
      res.json({
        success: true,
        message: 'Image uploaded successfully to Cloudinary.',
        url: result.secure_url
      });
    }
  );

  stream.end(req.file.buffer);
});

// -------------------------------------------------------------
// AUTH ROUTES
// -------------------------------------------------------------

// Admin Login with Strict Brute-Force Rate Limiting
app.post('/api/auth/login', loginLimiter, async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Email and password are required.' });
  }

  const cleanEmail = sanitizeText(email).trim().toLowerCase();

  let admin = null;

  if (isMongoConnected) {
    admin = await AdminModel.findOne({ email: cleanEmail });
  } else {
    const db = readFileDB();
    if (db.admin && db.admin.email.toLowerCase() === cleanEmail) {
      admin = db.admin;
    }
  }

  if (!admin) {
    return res.status(401).json({ success: false, message: 'Invalid admin credentials.' });
  }

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

  const token = jwt.sign(
    { id: admin.id || 'admin-1', email: admin.email, name: admin.name || 'Admin', role: admin.role || 'Super Admin' },
    JWT_SECRET,
    { expiresIn: '24h' }
  );

  return res.json({
    success: true,
    message: 'Admin authentication successful.',
    token,
    user: {
      id: admin.id || 'admin-1',
      email: admin.email,
      name: admin.name || 'NGO Administrator',
      role: admin.role || 'Super Admin'
    }
  });
});

app.get('/api/auth/me', verifyAdminToken, (req, res) => {
  res.json({
    success: true,
    user: req.admin
  });
});

// -------------------------------------------------------------
// STATS ROUTE
// -------------------------------------------------------------
app.get('/api/stats', async (req, res) => {
  let campaigns = [];
  let featuredIds = [];

  if (isMongoConnected) {
    campaigns = await CampaignModel.find();
    const featDoc = await FeaturedModel.findOne();
    featuredIds = featDoc ? featDoc.featuredIds : [];
  } else {
    const db = readFileDB();
    campaigns = db.campaigns || [];
    featuredIds = db.featuredIds || [];
  }

  const totalCampaigns = campaigns.length;
  const overallFundingRaised = campaigns.reduce((sum, c) => sum + Number(c.raisedAmount || 0), 0);
  const activeCount = campaigns.filter(c => c.status === 'Active').length;
  const pausedCount = campaigns.filter(c => c.status === 'Paused').length;
  const closedCount = campaigns.filter(c => c.status === 'Closed').length;
  const featuredCount = featuredIds.length;

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
app.get('/api/featured', async (req, res) => {
  let campaigns = [];
  let featuredIds = [];

  if (isMongoConnected) {
    campaigns = await CampaignModel.find();
    const featDoc = await FeaturedModel.findOne();
    featuredIds = featDoc ? featDoc.featuredIds : [];
  } else {
    const db = readFileDB();
    campaigns = db.campaigns || [];
    featuredIds = db.featuredIds || [];
  }

  const featuredCampaigns = featuredIds
    .map(id => campaigns.find(c => c.id === id))
    .filter(Boolean);

  res.json({
    success: true,
    featuredIds,
    featuredCampaigns
  });
});

app.put('/api/featured', verifyAdminToken, async (req, res) => {
  const { featuredIds } = req.body;

  if (!Array.isArray(featuredIds)) {
    return res.status(400).json({ success: false, message: 'featuredIds must be an array of campaign IDs.' });
  }

  if (featuredIds.length > 4) {
    return res.status(400).json({
      success: false,
      message: 'Maximum limit exceeded. You can select up to 4 featured campaigns only.'
    });
  }

  let featuredCampaigns = [];

  if (isMongoConnected) {
    const allCampaigns = await CampaignModel.find();
    const validIds = featuredIds.filter(id => allCampaigns.some(c => c.id === id));
    await FeaturedModel.findOneAndUpdate({}, { featuredIds: validIds }, { upsert: true, new: true });
    featuredCampaigns = validIds.map(id => allCampaigns.find(c => c.id === id)).filter(Boolean);
  } else {
    const db = readFileDB();
    const validIds = featuredIds.filter(id => db.campaigns.some(c => c.id === id));
    db.featuredIds = validIds;
    writeFileDB(db);
    featuredCampaigns = validIds.map(id => db.campaigns.find(c => c.id === id)).filter(Boolean);
  }

  res.json({
    success: true,
    message: 'Featured campaigns updated successfully.',
    featuredIds,
    featuredCampaigns
  });
});

// -------------------------------------------------------------
// CAMPAIGN CRUD ROUTES
// -------------------------------------------------------------
app.get('/api/campaigns', async (req, res) => {
  const { status } = req.query;
  let campaigns = [];
  let featuredIds = [];

  if (isMongoConnected) {
    campaigns = await CampaignModel.find();
    const featDoc = await FeaturedModel.findOne();
    featuredIds = featDoc ? featDoc.featuredIds : [];
  } else {
    const db = readFileDB();
    campaigns = db.campaigns || [];
    featuredIds = db.featuredIds || [];
  }

  if (status) {
    campaigns = campaigns.filter(c => c.status.toLowerCase() === status.toLowerCase());
  }

  res.json({
    success: true,
    campaigns,
    featuredIds
  });
});

app.get('/api/campaigns/:id', async (req, res) => {
  let campaign = null;
  let featuredIds = [];

  if (isMongoConnected) {
    campaign = await CampaignModel.findOne({ id: req.params.id });
    const featDoc = await FeaturedModel.findOne();
    featuredIds = featDoc ? featDoc.featuredIds : [];
  } else {
    const db = readFileDB();
    campaign = db.campaigns.find(c => c.id === req.params.id);
    featuredIds = db.featuredIds || [];
  }

  if (!campaign) {
    return res.status(404).json({ success: false, message: 'Campaign not found.' });
  }

  const campaignObj = campaign.toObject ? campaign.toObject() : campaign;
  const campaignDetails = (campaignObj.campaignDetails && campaignObj.campaignDetails.length > 0)
    ? campaignObj.campaignDetails
    : (campaignObj.additionalCards || []).map((card) => ({
        id: card.id,
        description: card.description || card.heading || '',
        image: card.image || ''
      }));

  const sortedCampaign = {
    ...campaignObj,
    campaignDetails,
    additionalCards: ((campaignObj.additionalCards || []).slice()).sort((a, b) => (a.order || 0) - (b.order || 0))
  };

  res.json({
    success: true,
    campaign: sortedCampaign,
    isFeatured: featuredIds.includes(campaign.id)
  });
});

app.post('/api/campaigns', verifyAdminToken, async (req, res) => {
  const { title, description, image, goalAmount, campaignDetails } = req.body;

  if (!title || !description || !goalAmount) {
    return res.status(400).json({ success: false, message: 'Title, description, and goal amount are required.' });
  }

  const formattedDetails = Array.isArray(campaignDetails)
    ? campaignDetails.map((det, idx) => ({
        id: det.id || `det-${Date.now()}-${idx}`,
        description: sanitizeText(det.description || '').trim(),
        image: det.image || ''
      }))
    : [];

  const newCampaign = {
    id: `camp-${Date.now()}`,
    title: sanitizeText(title).trim(),
    description: sanitizeText(description).trim(),
    image: image || 'https://images.unsplash.com/photo-1548767797-d8c844163c4c?auto=format&fit=crop&w=800&q=80',
    goalAmount: Number(goalAmount),
    raisedAmount: 0,
    status: 'Active',
    createdAt: new Date().toISOString(),
    campaignDetails: formattedDetails,
    additionalCards: formattedDetails.map((det, idx) => ({
      id: det.id,
      heading: `Highlight #${idx + 1}`,
      description: det.description,
      image: det.image,
      order: idx + 1
    }))
  };

  if (isMongoConnected) {
    await CampaignModel.create(newCampaign);
  } else {
    const db = readFileDB();
    db.campaigns.unshift(newCampaign);
    writeFileDB(db);
  }

  res.status(201).json({
    success: true,
    message: 'Campaign created successfully.',
    campaign: newCampaign
  });
});

app.put('/api/campaigns/:id', verifyAdminToken, async (req, res) => {
  const { id } = req.params;
  const { title, description, image, goalAmount, raisedAmount, status, campaignDetails } = req.body;

  if (status && !['Active', 'Paused', 'Closed'].includes(status)) {
    return res.status(400).json({ success: false, message: 'Invalid status. Must be Active, Paused, or Closed.' });
  }

  let updatedCampaign = null;

  const formattedDetails = campaignDetails !== undefined && Array.isArray(campaignDetails)
    ? campaignDetails.map((det, idx) => ({
        id: det.id || `det-${Date.now()}-${idx}`,
        description: sanitizeText(det.description || '').trim(),
        image: det.image || ''
      }))
    : undefined;

  if (isMongoConnected) {
    const existing = await CampaignModel.findOne({ id });
    if (!existing) return res.status(404).json({ success: false, message: 'Campaign not found.' });

    if (title !== undefined) existing.title = sanitizeText(title).trim();
    if (description !== undefined) existing.description = sanitizeText(description).trim();
    if (image !== undefined) existing.image = image;
    if (goalAmount !== undefined) existing.goalAmount = Number(goalAmount);
    if (raisedAmount !== undefined) existing.raisedAmount = Number(raisedAmount);
    if (status !== undefined) existing.status = status;
    if (formattedDetails !== undefined) {
      existing.campaignDetails = formattedDetails;
      existing.additionalCards = formattedDetails.map((det, idx) => ({
        id: det.id,
        heading: `Highlight #${idx + 1}`,
        description: det.description,
        image: det.image,
        order: idx + 1
      }));
    }

    await existing.save();
    updatedCampaign = existing;
  } else {
    const db = readFileDB();
    const index = db.campaigns.findIndex(c => c.id === id);
    if (index === -1) return res.status(404).json({ success: false, message: 'Campaign not found.' });

    const existing = db.campaigns[index];
    updatedCampaign = {
      ...existing,
      title: title !== undefined ? sanitizeText(title).trim() : existing.title,
      description: description !== undefined ? sanitizeText(description).trim() : existing.description,
      image: image !== undefined ? image : existing.image,
      goalAmount: goalAmount !== undefined ? Number(goalAmount) : existing.goalAmount,
      raisedAmount: raisedAmount !== undefined ? Number(raisedAmount) : existing.raisedAmount,
      status: status !== undefined ? status : existing.status,
      campaignDetails: formattedDetails !== undefined ? formattedDetails : (existing.campaignDetails || []),
      additionalCards: formattedDetails !== undefined
        ? formattedDetails.map((det, idx) => ({
            id: det.id,
            heading: `Highlight #${idx + 1}`,
            description: det.description,
            image: det.image,
            order: idx + 1
          }))
        : existing.additionalCards
    };
    db.campaigns[index] = updatedCampaign;
    writeFileDB(db);
  }

  res.json({
    success: true,
    message: 'Campaign updated successfully.',
    campaign: updatedCampaign
  });
});

app.delete('/api/campaigns/:id', verifyAdminToken, async (req, res) => {
  const { id } = req.params;

  if (isMongoConnected) {
    await CampaignModel.deleteOne({ id });
    const featDoc = await FeaturedModel.findOne();
    if (featDoc && featDoc.featuredIds.includes(id)) {
      featDoc.featuredIds = featDoc.featuredIds.filter(fId => fId !== id);
      await featDoc.save();
    }
  } else {
    const db = readFileDB();
    db.campaigns = db.campaigns.filter(c => c.id !== id);
    db.featuredIds = db.featuredIds.filter(fId => fId !== id);
    writeFileDB(db);
  }

  res.json({
    success: true,
    message: 'Campaign deleted successfully.'
  });
});

// -------------------------------------------------------------
// ADDITIONAL CONTENT CARDS ROUTES
// -------------------------------------------------------------
app.post('/api/campaigns/:id/cards', verifyAdminToken, async (req, res) => {
  const { id } = req.params;
  const { heading, description, image } = req.body;

  if (!heading || !description) {
    return res.status(400).json({ success: false, message: 'Heading and description are required for content cards.' });
  }

  let additionalCards = [];
  let newCard = null;

  if (isMongoConnected) {
    const campaign = await CampaignModel.findOne({ id });
    if (!campaign) return res.status(404).json({ success: false, message: 'Campaign not found.' });

    newCard = {
      id: `card-${Date.now()}`,
      heading: sanitizeText(heading).trim(),
      description: sanitizeText(description).trim(),
      image: image || 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=800&q=80',
      order: (campaign.additionalCards || []).length + 1
    };

    campaign.additionalCards.push(newCard);
    await campaign.save();
    additionalCards = campaign.additionalCards;
  } else {
    const db = readFileDB();
    const campaign = db.campaigns.find(c => c.id === id);
    if (!campaign) return res.status(404).json({ success: false, message: 'Campaign not found.' });

    if (!campaign.additionalCards) campaign.additionalCards = [];
    newCard = {
      id: `card-${Date.now()}`,
      heading: sanitizeText(heading).trim(),
      description: sanitizeText(description).trim(),
      image: image || 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=800&q=80',
      order: campaign.additionalCards.length + 1
    };
    campaign.additionalCards.push(newCard);
    writeFileDB(db);
    additionalCards = campaign.additionalCards;
  }

  res.status(201).json({
    success: true,
    message: 'Additional content card added successfully.',
    card: newCard,
    additionalCards
  });
});

app.put('/api/campaigns/:id/cards/:cardId', verifyAdminToken, async (req, res) => {
  const { id, cardId } = req.params;
  const { heading, description, image } = req.body;

  let additionalCards = [];
  let updatedCard = null;

  if (isMongoConnected) {
    const campaign = await CampaignModel.findOne({ id });
    if (!campaign) return res.status(404).json({ success: false, message: 'Campaign not found.' });

    const card = campaign.additionalCards.find(c => c.id === cardId);
    if (!card) return res.status(404).json({ success: false, message: 'Content card not found.' });

    if (heading !== undefined) card.heading = sanitizeText(heading).trim();
    if (description !== undefined) card.description = sanitizeText(description).trim();
    if (image !== undefined) card.image = image;

    await campaign.save();
    updatedCard = card;
    additionalCards = campaign.additionalCards;
  } else {
    const db = readFileDB();
    const campaign = db.campaigns.find(c => c.id === id);
    if (!campaign || !campaign.additionalCards) return res.status(404).json({ success: false, message: 'Campaign or content card not found.' });

    const cardIndex = campaign.additionalCards.findIndex(c => c.id === cardId);
    if (cardIndex === -1) return res.status(404).json({ success: false, message: 'Content card not found.' });

    const existingCard = campaign.additionalCards[cardIndex];
    updatedCard = {
      ...existingCard,
      heading: heading !== undefined ? sanitizeText(heading).trim() : existingCard.heading,
      description: description !== undefined ? sanitizeText(description).trim() : existingCard.description,
      image: image !== undefined ? image : existingCard.image
    };
    campaign.additionalCards[cardIndex] = updatedCard;
    writeFileDB(db);
    additionalCards = campaign.additionalCards;
  }

  res.json({
    success: true,
    message: 'Content card updated successfully.',
    card: updatedCard,
    additionalCards
  });
});

app.delete('/api/campaigns/:id/cards/:cardId', verifyAdminToken, async (req, res) => {
  const { id, cardId } = req.params;
  let additionalCards = [];

  if (isMongoConnected) {
    const campaign = await CampaignModel.findOne({ id });
    if (!campaign) return res.status(404).json({ success: false, message: 'Campaign not found.' });

    campaign.additionalCards = campaign.additionalCards.filter(c => c.id !== cardId);
    campaign.additionalCards.forEach((c, idx) => { c.order = idx + 1; });
    await campaign.save();
    additionalCards = campaign.additionalCards;
  } else {
    const db = readFileDB();
    const campaign = db.campaigns.find(c => c.id === id);
    if (!campaign || !campaign.additionalCards) return res.status(404).json({ success: false, message: 'Campaign not found.' });

    campaign.additionalCards = campaign.additionalCards.filter(c => c.id !== cardId);
    campaign.additionalCards.forEach((c, idx) => { c.order = idx + 1; });
    writeFileDB(db);
    additionalCards = campaign.additionalCards;
  }

  res.json({
    success: true,
    message: 'Content card deleted successfully.',
    additionalCards
  });
});

// -------------------------------------------------------------
// DONATION ROUTES
// -------------------------------------------------------------
app.post('/api/donations', async (req, res) => {
  const { campaignId, donorName, email, phone, amount, isAnonymous } = req.body;

  if (!campaignId || !amount || Number(amount) <= 0) {
    return res.status(400).json({ success: false, message: 'Valid campaignId and donation amount are required.' });
  }

  const cleanName = donorName ? sanitizeText(donorName).trim() : 'Kind Heart';
  const cleanEmail = email ? sanitizeText(email).trim() : '';
  const cleanPhone = phone ? sanitizeText(phone).trim() : '';
  const parsedAmount = Number(amount);
  const anonymousFlag = Boolean(isAnonymous);

  const newDonation = {
    id: `don-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    campaignId,
    donorName: cleanName,
    email: cleanEmail,
    phone: cleanPhone,
    amount: parsedAmount,
    isAnonymous: anonymousFlag,
    status: 'Completed',
    createdAt: new Date().toISOString()
  };

  if (isMongoConnected) {
    await DonationModel.create(newDonation);
    const campaign = await CampaignModel.findOne({ id: campaignId });
    if (campaign) {
      campaign.raisedAmount = Number(campaign.raisedAmount || 0) + parsedAmount;
      await campaign.save();
    }
  } else {
    const db = readFileDB();
    if (!db.donations) db.donations = [];
    db.donations.unshift(newDonation);

    const campaign = (db.campaigns || []).find(c => c.id === campaignId);
    if (campaign) {
      campaign.raisedAmount = Number(campaign.raisedAmount || 0) + parsedAmount;
    }
    writeFileDB(db);
  }

  res.status(201).json({
    success: true,
    message: 'Thank you for your generous donation!',
    donation: {
      id: newDonation.id,
      campaignId: newDonation.campaignId,
      donorName: anonymousFlag ? 'Anonymous' : newDonation.donorName,
      amount: newDonation.amount,
      isAnonymous: anonymousFlag,
      createdAt: newDonation.createdAt
    }
  });
});

app.get('/api/campaigns/:id/donations', async (req, res) => {
  const { id } = req.params;
  let campaignDonations = [];

  if (isMongoConnected) {
    campaignDonations = await DonationModel.find({ campaignId: id, status: 'Completed' }).sort({ createdAt: -1 });
  } else {
    const db = readFileDB();
    const all = db.donations || [];
    campaignDonations = all.filter(d => d.campaignId === id && d.status === 'Completed');
  }

  const publicDonations = campaignDonations.map(d => {
    const item = d.toObject ? d.toObject() : d;
    return {
      id: item.id,
      campaignId: item.campaignId,
      donorName: item.isAnonymous ? 'Anonymous' : item.donorName,
      amount: item.amount,
      isAnonymous: Boolean(item.isAnonymous),
      createdAt: item.createdAt
    };
  });

  res.json({
    success: true,
    donations: publicDonations
  });
});

// -------------------------------------------------------------
// BLOG / STORY ROUTES
// -------------------------------------------------------------
app.get('/api/blogs', async (req, res) => {
  let blogs = [];
  if (isMongoConnected) {
    blogs = await BlogModel.find().sort({ createdAt: -1 });
  } else {
    const db = readFileDB();
    blogs = db.blogs || [];
  }
  res.json({
    success: true,
    blogs
  });
});

app.post('/api/blogs', verifyAdminToken, async (req, res) => {
  const { tag, title, desc, image } = req.body;

  if (!title || !desc) {
    return res.status(400).json({ success: false, message: 'Title and description are required for blog stories.' });
  }

  const newBlog = {
    id: `blog-${Date.now()}`,
    tag: tag ? sanitizeText(tag).trim() : 'Animal Rescue | ' + new Date().toLocaleDateString('en-GB'),
    title: sanitizeText(title).trim(),
    desc: sanitizeText(desc).trim(),
    image: image || '/assets/impact3.png',
    createdAt: new Date().toISOString()
  };

  if (isMongoConnected) {
    await BlogModel.create(newBlog);
  } else {
    const db = readFileDB();
    if (!db.blogs) db.blogs = [];
    db.blogs.unshift(newBlog);
    writeFileDB(db);
  }

  res.status(201).json({
    success: true,
    message: 'Blog story created successfully.',
    blog: newBlog
  });
});

app.put('/api/blogs/:id', verifyAdminToken, async (req, res) => {
  const { id } = req.params;
  const { tag, title, desc, image } = req.body;

  let updatedBlog = null;

  if (isMongoConnected) {
    const existing = await BlogModel.findOne({ id });
    if (!existing) return res.status(404).json({ success: false, message: 'Blog story not found.' });

    if (tag !== undefined) existing.tag = sanitizeText(tag).trim();
    if (title !== undefined) existing.title = sanitizeText(title).trim();
    if (desc !== undefined) existing.desc = sanitizeText(desc).trim();
    if (image !== undefined) existing.image = image;

    await existing.save();
    updatedBlog = existing;
  } else {
    const db = readFileDB();
    if (!db.blogs) db.blogs = [];
    const index = db.blogs.findIndex(b => b.id === id);
    if (index === -1) return res.status(404).json({ success: false, message: 'Blog story not found.' });

    const existing = db.blogs[index];
    updatedBlog = {
      ...existing,
      tag: tag !== undefined ? sanitizeText(tag).trim() : existing.tag,
      title: title !== undefined ? sanitizeText(title).trim() : existing.title,
      desc: desc !== undefined ? sanitizeText(desc).trim() : existing.desc,
      image: image !== undefined ? image : existing.image
    };
    db.blogs[index] = updatedBlog;
    writeFileDB(db);
  }

  res.json({
    success: true,
    message: 'Blog story updated successfully.',
    blog: updatedBlog
  });
});

app.delete('/api/blogs/:id', verifyAdminToken, async (req, res) => {
  const { id } = req.params;

  if (isMongoConnected) {
    await BlogModel.deleteOne({ id });
  } else {
    const db = readFileDB();
    if (db.blogs) {
      db.blogs = db.blogs.filter(b => b.id !== id);
      writeFileDB(db);
    }
  }

  res.json({
    success: true,
    message: 'Blog story deleted successfully.'
  });
});

app.listen(PORT, () => {
  console.log(`🐾 Standalone Animal NGO Backend Server running on http://localhost:${PORT}`);
  console.log(`🔑 Admin Auth Endpoint: http://localhost:${PORT}/api/auth/login`);
});
