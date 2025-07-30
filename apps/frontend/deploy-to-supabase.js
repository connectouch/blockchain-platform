/**
 * Deploy React Frontend to Supabase Storage
 * This script uploads the built React app to Supabase Storage for hosting
 */

import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { glob } from 'glob'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Supabase configuration
const supabaseUrl = 'https://aompecyfgnakkmldhidg.supabase.co'
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseServiceKey) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY environment variable is required')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

const BUCKET_NAME = 'frontend-app'
const DIST_PATH = path.join(__dirname, 'dist')

async function createBucketIfNotExists() {
  console.log('🔍 Checking if bucket exists...')
  
  const { data: buckets, error: listError } = await supabase.storage.listBuckets()
  
  if (listError) {
    console.error('❌ Error listing buckets:', listError)
    return false
  }

  const bucketExists = buckets.some(bucket => bucket.name === BUCKET_NAME)
  
  if (!bucketExists) {
    console.log('📦 Creating bucket...')
    const { error: createError } = await supabase.storage.createBucket(BUCKET_NAME, {
      public: true,
      allowedMimeTypes: ['text/html', 'text/css', 'application/javascript', 'image/*', 'application/json'],
      fileSizeLimit: 52428800 // 50MB
    })
    
    if (createError) {
      console.error('❌ Error creating bucket:', createError)
      return false
    }
    
    console.log('✅ Bucket created successfully')
  } else {
    console.log('✅ Bucket already exists')
  }
  
  return true
}

async function uploadFile(filePath, bucketPath) {
  try {
    const fileBuffer = fs.readFileSync(filePath)
    const contentType = getContentType(filePath)
    
    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(bucketPath, fileBuffer, {
        contentType,
        upsert: true,
        cacheControl: contentType.includes('html') ? '300' : '31536000' // 5min for HTML, 1year for assets
      })
    
    if (error) {
      console.error(`❌ Error uploading ${bucketPath}:`, error)
      return false
    }
    
    return true
  } catch (err) {
    console.error(`❌ Error reading file ${filePath}:`, err)
    return false
  }
}

function getContentType(filePath) {
  const ext = path.extname(filePath).toLowerCase()
  const contentTypes = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'application/javascript',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
    '.woff': 'font/woff',
    '.woff2': 'font/woff2',
    '.ttf': 'font/ttf',
    '.eot': 'application/vnd.ms-fontobject'
  }
  
  return contentTypes[ext] || 'application/octet-stream'
}

async function clearBucket() {
  console.log('🧹 Clearing existing files...')
  
  const { data: files, error: listError } = await supabase.storage
    .from(BUCKET_NAME)
    .list('', { limit: 1000 })
  
  if (listError) {
    console.error('❌ Error listing files:', listError)
    return false
  }
  
  if (files && files.length > 0) {
    const filePaths = files.map(file => file.name)
    const { error: removeError } = await supabase.storage
      .from(BUCKET_NAME)
      .remove(filePaths)
    
    if (removeError) {
      console.error('❌ Error removing files:', removeError)
      return false
    }
    
    console.log(`✅ Removed ${filePaths.length} existing files`)
  }
  
  return true
}

async function uploadDistFiles() {
  console.log('📁 Finding files to upload...')
  
  const files = glob.sync('**/*', { 
    cwd: DIST_PATH,
    nodir: true,
    dot: false
  })
  
  console.log(`📤 Uploading ${files.length} files...`)
  
  let successCount = 0
  let errorCount = 0
  
  for (const file of files) {
    const filePath = path.join(DIST_PATH, file)
    const bucketPath = file.replace(/\\/g, '/') // Normalize path separators
    
    const success = await uploadFile(filePath, bucketPath)
    if (success) {
      successCount++
      console.log(`✅ ${bucketPath}`)
    } else {
      errorCount++
    }
  }
  
  console.log(`\n📊 Upload Summary:`)
  console.log(`✅ Successful: ${successCount}`)
  console.log(`❌ Failed: ${errorCount}`)
  
  return errorCount === 0
}

async function setIndexHtmlAsDefault() {
  console.log('🔧 Setting up index.html as default...')
  
  // Note: Supabase Storage doesn't support default index files like traditional hosting
  // Users will need to access the full URL with index.html
  // For SPA routing, we'll need to use Edge Functions or configure redirects
  
  console.log('ℹ️  Note: Access your app at: https://aompecyfgnakkmldhidg.supabase.co/storage/v1/object/public/frontend-app/index.html')
  
  return true
}

async function main() {
  console.log('🚀 Starting Supabase deployment...')
  console.log(`📂 Deploying from: ${DIST_PATH}`)
  console.log(`🪣 Target bucket: ${BUCKET_NAME}`)
  
  // Check if dist directory exists
  if (!fs.existsSync(DIST_PATH)) {
    console.error('❌ Dist directory not found. Please run "npm run build" first.')
    process.exit(1)
  }
  
  try {
    // Step 1: Create bucket if needed
    const bucketReady = await createBucketIfNotExists()
    if (!bucketReady) {
      console.error('❌ Failed to prepare bucket')
      process.exit(1)
    }
    
    // Step 2: Clear existing files
    const cleared = await clearBucket()
    if (!cleared) {
      console.error('❌ Failed to clear bucket')
      process.exit(1)
    }
    
    // Step 3: Upload new files
    const uploaded = await uploadDistFiles()
    if (!uploaded) {
      console.error('❌ Some files failed to upload')
      process.exit(1)
    }
    
    // Step 4: Set up default routing
    await setIndexHtmlAsDefault()
    
    console.log('\n🎉 Deployment completed successfully!')
    console.log('\n📱 Your app is now hosted on Supabase!')
    console.log(`🌐 URL: https://aompecyfgnakkmldhidg.supabase.co/storage/v1/object/public/frontend-app/index.html`)
    console.log('\n💡 For custom domain and SPA routing, consider using Supabase Edge Functions.')
    
  } catch (error) {
    console.error('❌ Deployment failed:', error)
    process.exit(1)
  }
}

main()
