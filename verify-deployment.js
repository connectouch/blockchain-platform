const https = require('https');

async function verifyDeployment() {
  console.log('🚀 EMERGENCY DIAGNOSIS: Checking Connectouch deployment...');

  const url = 'https://connectouch.vercel.app';

  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        console.log(`📊 Status Code: ${res.statusCode}`);
        console.log(`📋 Content-Type: ${res.headers['content-type']}`);

        if (res.statusCode === 200) {
          console.log('✅ SUCCESS: Deployment is accessible!');

          // Check if HTML contains React root
          if (data.includes('<div id="root">')) {
            console.log('✅ SUCCESS: HTML contains React root element!');
          } else {
            console.log('❌ CRITICAL: HTML missing React root element');
          }

          // Check if HTML contains script tags
          const scriptMatches = data.match(/<script[^>]*src="([^"]*)"[^>]*>/g);
          if (scriptMatches) {
            console.log('✅ SUCCESS: HTML contains script tags!');
            console.log('📜 Script files found:');
            scriptMatches.forEach(script => {
              const srcMatch = script.match(/src="([^"]*)"/);
              if (srcMatch) {
                console.log(`   - ${srcMatch[1]}`);
              }
            });
          } else {
            console.log('❌ CRITICAL: HTML missing script tags');
          }

          // Check if HTML contains CSS
          const cssMatches = data.match(/<link[^>]*rel="stylesheet"[^>]*href="([^"]*)"[^>]*>/g);
          if (cssMatches) {
            console.log('✅ SUCCESS: HTML contains CSS links!');
            console.log('🎨 CSS files found:');
            cssMatches.forEach(css => {
              const hrefMatch = css.match(/href="([^"]*)"/);
              if (hrefMatch) {
                console.log(`   - ${hrefMatch[1]}`);
              }
            });
          } else {
            console.log('❌ WARNING: HTML missing CSS links');
          }

          console.log('\n📄 FULL HTML CONTENT:');
          console.log(data);

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

verifyDeployment().catch(console.error);
