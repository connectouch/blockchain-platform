const https = require('https');

async function testJSFile() {
  console.log('🔍 Testing JavaScript file loading...');
  
  const jsUrl = 'https://connectouch.vercel.app/assets/index-CvJ8GBf9.js';
  
  return new Promise((resolve, reject) => {
    https.get(jsUrl, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        console.log(`📊 JS File Status Code: ${res.statusCode}`);
        console.log(`📋 Content-Type: ${res.headers['content-type']}`);
        console.log(`📏 Content Length: ${data.length} bytes`);
        
        if (res.statusCode === 200) {
          console.log('✅ SUCCESS: JavaScript file is accessible!');
          
          // Check if it contains React code
          if (data.includes('React') || data.includes('createElement')) {
            console.log('✅ SUCCESS: Contains React code!');
          } else {
            console.log('❌ WARNING: No React code found');
          }
          
          // Check if it contains our app code
          if (data.includes('Connectouch') || data.includes('Dashboard')) {
            console.log('✅ SUCCESS: Contains our app code!');
          } else {
            console.log('❌ CRITICAL: No app code found!');
          }
          
          console.log('\n📄 JS File Preview (first 200 chars):');
          console.log(data.substring(0, 200) + '...');
          
        } else {
          console.log(`❌ FAILED: HTTP ${res.statusCode}`);
        }
        
        resolve();
      });
    }).on('error', (err) => {
      console.error('❌ Request failed:', err.message);
      reject(err);
    });
  });
}

async function testCSSFile() {
  console.log('\n🎨 Testing CSS file loading...');
  
  const cssUrl = 'https://connectouch.vercel.app/assets/index-DoPNr-30.css';
  
  return new Promise((resolve, reject) => {
    https.get(cssUrl, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        console.log(`📊 CSS File Status Code: ${res.statusCode}`);
        console.log(`📋 Content-Type: ${res.headers['content-type']}`);
        console.log(`📏 Content Length: ${data.length} bytes`);
        
        if (res.statusCode === 200) {
          console.log('✅ SUCCESS: CSS file is accessible!');
          
          console.log('\n📄 CSS File Preview (first 200 chars):');
          console.log(data.substring(0, 200) + '...');
          
        } else {
          console.log(`❌ FAILED: HTTP ${res.statusCode}`);
        }
        
        resolve();
      });
    }).on('error', (err) => {
      console.error('❌ Request failed:', err.message);
      reject(err);
    });
  });
}

async function runTests() {
  await testJSFile();
  await testCSSFile();
}

runTests().catch(console.error);
