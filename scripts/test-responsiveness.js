import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { spawn } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const screenshotsDir = path.join(__dirname, '..', 'test-screenshots');

if (!fs.existsSync(screenshotsDir)) {
  fs.mkdirSync(screenshotsDir, { recursive: true });
}

const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const BASE_URL = 'http://localhost:5173';

const VIEWPORTS = [
  { name: 'Mobile_iPhone_14_375x812', width: 375, height: 812, isMobile: true },
  { name: 'Mobile_Android_412x915', width: 412, height: 915, isMobile: true },
  { name: 'Tablet_iPad_768x1024', width: 768, height: 1024, isMobile: true },
  { name: 'Desktop_1280x800', width: 1280, height: 800, isMobile: false }
];

const results = [];

function recordTest(testName, passed, details = '') {
  results.push({ testName, passed, details });
  const icon = passed ? '✅ PASS' : '❌ FAIL';
  console.log(`${icon} - ${testName} ${details ? '(' + details + ')' : ''}`);
}

async function isServerRunning(url) {
  try {
    const res = await fetch(url);
    return res.ok || res.status === 200 || res.status === 304;
  } catch {
    return false;
  }
}

async function ensureServerRunning() {
  const running = await isServerRunning(BASE_URL);
  if (running) {
    console.log(`⚡ Vite dev server is already running on ${BASE_URL}\n`);
    return null;
  }

  console.log(`🌐 Vite dev server is not running. Automatically starting Vite on ${BASE_URL}...`);
  const projectRoot = path.join(__dirname, '..');
  const serverProcess = spawn('npx', ['vite', '--port', '5173'], {
    cwd: projectRoot,
    shell: true,
    stdio: 'ignore'
  });

  const start = Date.now();
  while (Date.now() - start < 15000) {
    await new Promise(r => setTimeout(r, 500));
    if (await isServerRunning(BASE_URL)) {
      console.log(`✅ Vite server started successfully on ${BASE_URL}!\n`);
      return serverProcess;
    }
  }

  throw new Error(`Failed to start Vite dev server on ${BASE_URL} within 15 seconds.`);
}

async function runTests() {
  console.log('🚀 Starting Automated Browser Responsiveness Tests...\n');

  let serverProcess = null;
  let browser = null;

  try {
    serverProcess = await ensureServerRunning();

    browser = await puppeteer.launch({
      executablePath: CHROME_PATH,
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
    });

    const page = await browser.newPage();

    // -------------------------------------------------------------
    // TEST 1: Homepage on Multiple Viewports (Overflow & Layout)
    // -------------------------------------------------------------
    console.log('\n--- 1. Testing Homepage Across Viewports ---');
    for (const vp of VIEWPORTS) {
      await page.setViewport({ width: vp.width, height: vp.height, isMobile: vp.isMobile });
      await page.goto(BASE_URL, { waitUntil: 'networkidle2' });
      await new Promise(r => setTimeout(r, 800));

      // Check for horizontal overflow
      const overflow = await page.evaluate(() => {
        return {
          windowWidth: window.innerWidth,
          scrollWidth: document.documentElement.scrollWidth,
          bodyScrollWidth: document.body.scrollWidth,
          hasOverflow: document.documentElement.scrollWidth > window.innerWidth + 2
        };
      });

      recordTest(
        `Homepage Horizontal Overflow [${vp.name}]`,
        !overflow.hasOverflow,
        `Viewport: ${overflow.windowWidth}px, Scroll: ${overflow.scrollWidth}px`
      );

      await page.screenshot({
        path: path.join(screenshotsDir, `homepage_${vp.name}.png`),
        fullPage: false
      });
    }

    // -------------------------------------------------------------
    // TEST 2: Public Navbar Mobile Menu Drawer
    // -------------------------------------------------------------
    console.log('\n--- 2. Testing Navbar Mobile Menu Drawer ---');
    await page.setViewport({ width: 375, height: 812, isMobile: true });
    await page.goto(BASE_URL, { waitUntil: 'networkidle2' });

    // Find and click mobile toggle button
    const toggleButton = await page.$('.mobile-toggle');
    if (toggleButton) {
      const isVisible = await toggleButton.isIntersectingViewport();
      recordTest('Navbar Mobile Hamburger Button Visible', isVisible);

      await toggleButton.click();
      await new Promise(r => setTimeout(r, 400));

      const isMenuOpen = await page.evaluate(() => {
        const menu = document.querySelector('.nav-menu.mobile-open');
        return Boolean(menu);
      });
      recordTest('Navbar Mobile Drawer Opened', isMenuOpen);

      await page.screenshot({
        path: path.join(screenshotsDir, 'navbar_mobile_drawer_open.png')
      });

      // Click toggle again to close
      await toggleButton.click();
      await new Promise(r => setTimeout(r, 400));
      const isMenuClosed = await page.evaluate(() => {
        const menu = document.querySelector('.nav-menu.mobile-open');
        return !menu;
      });
      recordTest('Navbar Mobile Drawer Closed cleanly', isMenuClosed);
    } else {
      recordTest('Navbar Mobile Hamburger Button Found', false, 'Selector .mobile-toggle not found');
    }

    // -------------------------------------------------------------
    // TEST 3: Donate Modal Responsiveness (Mobile 375px)
    // -------------------------------------------------------------
    console.log('\n--- 3. Testing Public Donate Modal on Mobile ---');
    await page.setViewport({ width: 375, height: 812, isMobile: true });
    const donateNavBtn = await page.$('.btn-donate-nav');
    if (donateNavBtn) {
      await donateNavBtn.click();
      await new Promise(r => setTimeout(r, 500));

      const modalCheck = await page.evaluate(() => {
        const modal = document.querySelector('.modal-card');
        if (!modal) return { found: false };
        const rect = modal.getBoundingClientRect();
        return {
          found: true,
          width: Math.round(rect.width),
          fitsViewport: rect.width <= window.innerWidth,
          buttonsCount: document.querySelectorAll('.amount-btn').length
        };
      });

      recordTest('Donate Modal Opened & Fits Viewport', modalCheck.found && modalCheck.fitsViewport, `Modal Width: ${modalCheck.width}px inside 375px`);

      await page.screenshot({
        path: path.join(screenshotsDir, 'donate_modal_mobile.png')
      });

      // Close modal
      const closeBtn = await page.$('.modal-close-btn');
      if (closeBtn) {
        await closeBtn.click();
        await new Promise(r => setTimeout(r, 400));
      }
    } else {
      recordTest('Donate Now Nav Button Found', false);
    }

    // -------------------------------------------------------------
    // TEST 4: Campaign Detail Page Responsiveness
    // -------------------------------------------------------------
    console.log('\n--- 4. Testing Campaign Detail Page on Mobile & Desktop ---');
    const campaignId = 'camp-1';
    for (const vp of [VIEWPORTS[0], VIEWPORTS[3]]) {
      await page.setViewport({ width: vp.width, height: vp.height, isMobile: vp.isMobile });
      await page.goto(`${BASE_URL}/campaign/${campaignId}`, { waitUntil: 'networkidle2' });
      await new Promise(r => setTimeout(r, 800));

      const detailCheck = await page.evaluate(() => {
        return {
          windowWidth: window.innerWidth,
          scrollWidth: document.documentElement.scrollWidth,
          hasOverflow: document.documentElement.scrollWidth > window.innerWidth + 2,
          hasFloatingBar: Boolean(document.querySelector('.no-scrollbar')),
          hasWhatsApp: Boolean(document.querySelector('a[href*="wa.me"]'))
        };
      });

      recordTest(
        `Campaign Detail Page Overflow [${vp.name}]`,
        !detailCheck.hasOverflow,
        `Width: ${detailCheck.windowWidth}px, ScrollWidth: ${detailCheck.scrollWidth}px`
      );
      recordTest(
        `Campaign Detail Floating Elements Present [${vp.name}]`,
        detailCheck.hasFloatingBar && detailCheck.hasWhatsApp
      );

      await page.screenshot({
        path: path.join(screenshotsDir, `campaign_detail_${vp.name}.png`),
        fullPage: false
      });
    }

    // -------------------------------------------------------------
    // TEST 5: Admin Login & Dashboard Responsiveness
    // -------------------------------------------------------------
    console.log('\n--- 5. Testing Admin Portal on Mobile (375x812) ---');
    await page.setViewport({ width: 375, height: 812, isMobile: true });
    await page.goto(`${BASE_URL}/admin/login`, { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 500));

    const loginCheck = await page.evaluate(() => {
      const card = document.querySelector('.login-card');
      const rect = card ? card.getBoundingClientRect() : null;
      return {
        cardFound: Boolean(card),
        fits: rect ? rect.width <= window.innerWidth : false,
        width: rect ? Math.round(rect.width) : 0
      };
    });
    recordTest('Admin Login Card Responsive', loginCheck.cardFound && loginCheck.fits, `Width: ${loginCheck.width}px`);

    await page.screenshot({
      path: path.join(screenshotsDir, 'admin_login_mobile.png')
    });

    // Simulate login
    await page.type('input[type="email"]', 'admin@animalhelping.org');
    await page.type('input[type="password"]', 'admin123');
    await page.click('button[type="submit"]');
    await new Promise(r => setTimeout(r, 1200));

    // Verify Admin Dashboard on Mobile
    const adminCheck = await page.evaluate(() => {
      const adminToggle = document.querySelector('.admin-mobile-toggle');
      const subnav = document.querySelector('.admin-layout div[style*="overflow-x: auto"], .admin-layout div[style*="overflowX: auto"], .admin-layout div[style*="overflowX"]');
      return {
        isDashboard: window.location.pathname.includes('/admin'),
        hasMobileToggle: Boolean(adminToggle),
        hasHorizontalSubnav: Boolean(subnav),
        scrollWidth: document.documentElement.scrollWidth,
        windowWidth: window.innerWidth,
        hasOverflow: document.documentElement.scrollWidth > window.innerWidth + 2
      };
    });

    recordTest('Admin Dashboard Loaded on Mobile', adminCheck.isDashboard);
    recordTest('Admin Dashboard No Horizontal Page Overflow', !adminCheck.hasOverflow, `Width: ${adminCheck.windowWidth}px, Scroll: ${adminCheck.scrollWidth}px`);
    recordTest('Admin Mobile Hamburger Toggle Present', adminCheck.hasMobileToggle);

    // Test clicking Admin mobile drawer
    const adminMobileToggle = await page.$('.admin-mobile-toggle');
    if (adminMobileToggle) {
      await adminMobileToggle.click();
      await new Promise(r => setTimeout(r, 400));
      const hasDrawerButtons = await page.evaluate(() => {
        const text = document.body.innerText;
        return text.includes('1. Dashboard') && text.includes('2. Campaigns') && text.includes('3. Blogs & Stories');
      });
      recordTest('Admin Mobile Drawer Opens with All Navigation Tabs', hasDrawerButtons);

      await page.screenshot({
        path: path.join(screenshotsDir, 'admin_dashboard_mobile_drawer.png')
      });
    }

    // -------------------------------------------------------------
    // TEST 6: Desktop Admin Dashboard (1280x800)
    // -------------------------------------------------------------
    console.log('\n--- 6. Testing Admin Dashboard on Desktop (1280x800) ---');
    await page.setViewport({ width: 1280, height: 800, isMobile: false });
    await new Promise(r => setTimeout(r, 500));

    const desktopAdminCheck = await page.evaluate(() => {
      const desktopControls = document.querySelector('.admin-desktop-header-controls');
      const isVisible = desktopControls && window.getComputedStyle(desktopControls).display !== 'none';
      return {
        hasDesktopNav: isVisible,
        hasOverflow: document.documentElement.scrollWidth > window.innerWidth + 2
      };
    });

    recordTest('Admin Desktop Controls Visible on Desktop', desktopAdminCheck.hasDesktopNav);
    recordTest('Admin Desktop No Horizontal Overflow', !desktopAdminCheck.hasOverflow);

    await page.screenshot({
      path: path.join(screenshotsDir, 'admin_dashboard_desktop.png')
    });

  } catch (err) {
    console.error('Test Execution Error:', err);
  } finally {
    if (browser) {
      await browser.close();
    }
    if (serverProcess) {
      console.log('🛑 Stopping automatically launched Vite server...');
      serverProcess.kill('SIGTERM');
    }
  }

  console.log('\n==========================================');
  console.log('       TEST EXECUTION SUMMARY');
  console.log('==========================================');
  const passedCount = results.filter(r => r.passed).length;
  const totalCount = results.length;
  console.log(`Total Tests Run: ${totalCount}`);
  console.log(`Passed: ${passedCount}`);
  console.log(`Failed: ${totalCount - passedCount}`);
  console.log(`Screenshots saved to: ${screenshotsDir}\n`);

  if (passedCount === totalCount && totalCount > 0) {
    console.log('🎉 ALL AUTOMATED RESPONSIVENESS TESTS PASSED SUCCESSFULLY!');
  } else {
    console.log('⚠️ Some tests reported issues.');
  }
}

runTests();
