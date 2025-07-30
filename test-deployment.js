const puppeteer = require('puppeteer');

async function testDeployment() {
  console.log('🚀 Testing Connectouch deployment...');
  
  const browser = await puppeteer.launch({ 
    headless: false,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  try {
    const page = await browser.newPage();
    
    // Set viewport
    await page.setViewport({ width: 1920, height: 1080 });
    
    // Navigate to the deployment
    console.log('📍 Navigating to deployment...');
    await page.goto('https://connectouch-cl19f3v7o-connectouchs-projects.vercel.app', {
      waitUntil: 'networkidle0',
      timeout: 30000
    });
    
    // Wait for React to load
    console.log('⏳ Waiting for React app to load...');
    await page.waitForSelector('#root', { timeout: 10000 });
    
    // Check if the app content is loaded
    const hasContent = await page.evaluate(() => {
      const root = document.getElementById('root');
      return root && root.children.length > 0;
    });
    
    if (hasContent) {
      console.log('✅ SUCCESS: React app is loaded and rendering!');
      
      // Take a screenshot
      await page.screenshot({ path: 'deployment-test.png', fullPage: true });
      console.log('📸 Screenshot saved as deployment-test.png');
      
      // Check for specific elements
      const navbar = await page.$('nav');
      const main = await page.$('main');
      
      if (navbar) console.log('✅ Navbar found');
      if (main) console.log('✅ Main content found');
      
    } else {
      console.log('❌ FAILED: React app is not rendering content');
    }
    
    // Check console errors
    const logs = await page.evaluate(() => {
      return window.console.logs || [];
    });
    
    console.log('📋 Console logs:', logs);
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    await browser.close();
  }
}

testDeployment();
