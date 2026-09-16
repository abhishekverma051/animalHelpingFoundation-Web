import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const screenshotsDir = path.join(__dirname, '..', 'test-screenshots');

const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const BASE_URL = 'http://localhost:5173';

async function capture() {
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 375, height: 812, isMobile: true, hasTouch: true });

  // 1. Homepage Full
  await page.goto(BASE_URL, { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: path.join(screenshotsDir, 'full_homepage_mobile.png'), fullPage: true });

  // 2. Campaign Detail Full
  await page.goto(`${BASE_URL}/campaign/camp-1`, { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: path.join(screenshotsDir, 'full_campaign_detail_mobile.png'), fullPage: true });

  // 3. Admin Login & Dashboard
  await page.goto(`${BASE_URL}/admin/login`, { waitUntil: 'networkidle2' });
  await page.type('input[type="email"]', 'admin@animalhelping.org');
  await page.type('input[type="password"]', 'admin123');
  await page.click('button[type="submit"]');
  await new Promise(r => setTimeout(r, 1200));
  await page.screenshot({ path: path.join(screenshotsDir, 'full_admin_dashboard_mobile.png'), fullPage: true });

  // 4. Admin Campaigns
  await page.goto(`${BASE_URL}/admin/campaigns`, { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: path.join(screenshotsDir, 'full_admin_campaigns_mobile.png'), fullPage: true });

  await browser.close();
  console.log('Screenshots captured successfully!');
}

capture();
