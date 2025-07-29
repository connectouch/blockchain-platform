const fs = require('fs');
const path = require('path');

function getAllTsFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      getAllTsFiles(filePath, fileList);
    } else if (file.endsWith('.ts')) {
      fileList.push(filePath);
    }
  });
  
  return fileList;
}

function fixImportsInFile(filePath) {
  console.log(`Fixing imports in ${filePath}...`);
  
  let content = fs.readFileSync(filePath, 'utf8');
  let changed = false;
  
  // Fix @/utils/* imports
  if (content.includes("from '@/utils/")) {
    content = content.replace(/from '@\/utils\//g, "from '../utils/");
    changed = true;
  }
  
  // Fix @/services/* imports
  if (content.includes("from '@/services/")) {
    content = content.replace(/from '@\/services\//g, "from '../services/");
    changed = true;
  }
  
  // Fix @/middleware/* imports
  if (content.includes("from '@/middleware/")) {
    content = content.replace(/from '@\/middleware\//g, "from '../middleware/");
    changed = true;
  }
  
  // Fix @/routes/* imports
  if (content.includes("from '@/routes/")) {
    content = content.replace(/from '@\/routes\//g, "from '../routes/");
    changed = true;
  }
  
  // Fix @/controllers/* imports
  if (content.includes("from '@/controllers/")) {
    content = content.replace(/from '@\/controllers\//g, "from '../controllers/");
    changed = true;
  }
  
  // Fix @/types/* imports
  if (content.includes("from '@/types/")) {
    content = content.replace(/from '@\/types\//g, "from '../types/");
    changed = true;
  }

  // Fix @/config/* imports
  if (content.includes("from '@/config/")) {
    content = content.replace(/from '@\/config\//g, "from '../config/");
    changed = true;
  }

  // Fix @/* imports (catch-all for any remaining)
  if (content.includes("from '@/")) {
    content = content.replace(/from '@\//g, "from '../");
    changed = true;
  }

  if (changed) {
    fs.writeFileSync(filePath, content);
    console.log(`Fixed imports in ${filePath}`);
  }
}

// Get all TypeScript files in the backend src directory
const backendSrcDir = path.join(__dirname, 'apps', 'backend', 'src');
const tsFiles = getAllTsFiles(backendSrcDir);

console.log(`Found ${tsFiles.length} TypeScript files`);

// Fix imports in all files
tsFiles.forEach(fixImportsInFile);

console.log('All imports fixed!');
