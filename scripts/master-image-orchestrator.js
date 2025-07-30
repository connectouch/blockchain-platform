const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

// Master Image Orchestrator - Coordinates all image scraping and management systems
class MasterImageOrchestrator {
  constructor() {
    this.scriptsDir = __dirname;
    this.assetsDir = path.join(__dirname, '../apps/frontend/public/assets');
    this.logFile = path.join(this.assetsDir, 'orchestration-log.json');
    
    this.systems = {
      'dynamic-scraper': {
        script: 'dynamic-image-scraper.js',
        description: 'Comprehensive dynamic image scraping',
        priority: 1,
        estimatedTime: '5-10 minutes'
      },
      'smart-manager': {
        script: 'smart-image-manager.js',
        description: 'Intelligent content analysis and targeted fetching',
        priority: 2,
        estimatedTime: '2-5 minutes'
      },
      'crypto-generator': {
        script: 'generate-crypto-svgs.js',
        description: 'High-quality cryptocurrency SVG generation',
        priority: 3,
        estimatedTime: '1-2 minutes'
      },
      'update-collection': {
        script: 'update-image-collection.js',
        description: 'Update existing image collection',
        priority: 4,
        estimatedTime: '3-7 minutes'
      }
    };

    this.orchestrationLog = {
      startTime: null,
      endTime: null,
      systems: {},
      summary: {},
      errors: []
    };
  }

  // Main orchestration method
  async orchestrate(options = {}) {
    console.log('🎭 Master Image Orchestrator Starting...\n');
    console.log('🎯 Mission: Complete platform image coverage');
    console.log('📊 Systems: 4 specialized image management systems');
    console.log('⏱️ Estimated total time: 10-25 minutes\n');

    this.orchestrationLog.startTime = new Date().toISOString();

    try {
      // Phase 1: Smart Analysis
      if (!options.skipAnalysis) {
        await this.runSmartAnalysis();
      }

      // Phase 2: Dynamic Scraping
      if (!options.skipScraping) {
        await this.runDynamicScraping();
      }

      // Phase 3: SVG Generation
      if (!options.skipGeneration) {
        await this.runSVGGeneration();
      }

      // Phase 4: Collection Update
      if (!options.skipUpdate) {
        await this.runCollectionUpdate();
      }

      // Phase 5: Verification & Optimization
      await this.runVerification();

      // Phase 6: Generate comprehensive report
      await this.generateMasterReport();

      this.orchestrationLog.endTime = new Date().toISOString();
      console.log('\n🎉 Master orchestration completed successfully!');
      
    } catch (error) {
      this.orchestrationLog.errors.push({
        timestamp: new Date().toISOString(),
        error: error.message,
        stack: error.stack
      });
      console.error('\n❌ Orchestration failed:', error.message);
      throw error;
    } finally {
      this.saveOrchestrationLog();
    }
  }

  // Phase 1: Smart Analysis
  async runSmartAnalysis() {
    console.log('🧠 Phase 1: Smart Content Analysis');
    console.log('━'.repeat(50));
    
    const startTime = Date.now();
    
    try {
      await this.executeScript('smart-image-manager.js');
      
      const duration = Math.round((Date.now() - startTime) / 1000);
      this.orchestrationLog.systems['smart-analysis'] = {
        status: 'completed',
        duration: `${duration}s`,
        timestamp: new Date().toISOString()
      };
      
      console.log(`✅ Smart analysis completed in ${duration}s\n`);
    } catch (error) {
      console.error('❌ Smart analysis failed:', error.message);
      this.orchestrationLog.systems['smart-analysis'] = {
        status: 'failed',
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  // Phase 2: Dynamic Scraping
  async runDynamicScraping() {
    console.log('🌐 Phase 2: Dynamic Image Scraping');
    console.log('━'.repeat(50));
    
    const startTime = Date.now();
    
    try {
      await this.executeScript('dynamic-image-scraper.js');
      
      const duration = Math.round((Date.now() - startTime) / 1000);
      this.orchestrationLog.systems['dynamic-scraping'] = {
        status: 'completed',
        duration: `${duration}s`,
        timestamp: new Date().toISOString()
      };
      
      console.log(`✅ Dynamic scraping completed in ${duration}s\n`);
    } catch (error) {
      console.error('❌ Dynamic scraping failed:', error.message);
      this.orchestrationLog.systems['dynamic-scraping'] = {
        status: 'failed',
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  // Phase 3: SVG Generation
  async runSVGGeneration() {
    console.log('🎨 Phase 3: High-Quality SVG Generation');
    console.log('━'.repeat(50));
    
    const startTime = Date.now();
    
    try {
      await this.executeScript('generate-crypto-svgs.js');
      
      const duration = Math.round((Date.now() - startTime) / 1000);
      this.orchestrationLog.systems['svg-generation'] = {
        status: 'completed',
        duration: `${duration}s`,
        timestamp: new Date().toISOString()
      };
      
      console.log(`✅ SVG generation completed in ${duration}s\n`);
    } catch (error) {
      console.error('❌ SVG generation failed:', error.message);
      this.orchestrationLog.systems['svg-generation'] = {
        status: 'failed',
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  // Phase 4: Collection Update
  async runCollectionUpdate() {
    console.log('🔄 Phase 4: Collection Update & Maintenance');
    console.log('━'.repeat(50));
    
    const startTime = Date.now();
    
    try {
      await this.executeScript('update-image-collection.js');
      
      const duration = Math.round((Date.now() - startTime) / 1000);
      this.orchestrationLog.systems['collection-update'] = {
        status: 'completed',
        duration: `${duration}s`,
        timestamp: new Date().toISOString()
      };
      
      console.log(`✅ Collection update completed in ${duration}s\n`);
    } catch (error) {
      console.error('❌ Collection update failed:', error.message);
      this.orchestrationLog.systems['collection-update'] = {
        status: 'failed',
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  // Phase 5: Verification
  async runVerification() {
    console.log('🔍 Phase 5: Verification & Quality Check');
    console.log('━'.repeat(50));
    
    const verification = await this.verifyImageCollection();
    
    this.orchestrationLog.verification = verification;
    
    console.log(`✅ Verification completed`);
    console.log(`   Total images: ${verification.totalImages}`);
    console.log(`   Categories covered: ${verification.categoriesCovered}`);
    console.log(`   Quality score: ${verification.qualityScore}/100\n`);
  }

  // Execute a script and capture output
  async executeScript(scriptName) {
    return new Promise((resolve, reject) => {
      const scriptPath = path.join(this.scriptsDir, scriptName);
      
      if (!fs.existsSync(scriptPath)) {
        reject(new Error(`Script not found: ${scriptName}`));
        return;
      }

      console.log(`🚀 Executing: ${scriptName}`);
      
      const child = spawn('node', [scriptPath], {
        stdio: 'inherit',
        cwd: path.dirname(scriptPath)
      });

      child.on('close', (code) => {
        if (code === 0) {
          resolve();
        } else {
          reject(new Error(`Script ${scriptName} exited with code ${code}`));
        }
      });

      child.on('error', (error) => {
        reject(new Error(`Failed to execute ${scriptName}: ${error.message}`));
      });
    });
  }

  // Verify the complete image collection
  async verifyImageCollection() {
    const categories = [
      'crypto', 'nft', 'defi', 'gamefi', 'chains', 
      'exchanges', 'dao', 'infrastructure', 'tools', 'backgrounds'
    ];

    let totalImages = 0;
    let categoriesCovered = 0;
    const categoryStats = {};

    for (const category of categories) {
      const categoryDir = path.join(this.assetsDir, category);
      
      if (fs.existsSync(categoryDir)) {
        const files = fs.readdirSync(categoryDir);
        const imageFiles = files.filter(file => 
          file.endsWith('.png') || file.endsWith('.svg') || file.endsWith('.jpg')
        );
        
        if (imageFiles.length > 0) {
          categoriesCovered++;
          totalImages += imageFiles.length;
          categoryStats[category] = imageFiles.length;
        }
      }
    }

    const qualityScore = Math.round((categoriesCovered / categories.length) * 100);

    return {
      totalImages,
      categoriesCovered,
      totalCategories: categories.length,
      qualityScore,
      categoryStats
    };
  }

  // Generate comprehensive master report
  async generateMasterReport() {
    console.log('📊 Phase 6: Master Report Generation');
    console.log('━'.repeat(50));

    const report = {
      orchestration: this.orchestrationLog,
      imageInventory: await this.generateImageInventory(),
      platformCoverage: await this.analyzePlatformCoverage(),
      recommendations: this.generateRecommendations(),
      nextSteps: this.generateNextSteps()
    };

    const reportPath = path.join(this.assetsDir, 'master-image-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

    console.log('📋 Master Report Generated:');
    console.log(`   Total execution time: ${this.calculateTotalTime()}`);
    console.log(`   Systems executed: ${Object.keys(this.orchestrationLog.systems).length}`);
    console.log(`   Total images collected: ${report.imageInventory.totalImages}`);
    console.log(`   Platform coverage: ${report.platformCoverage.coveragePercentage}%`);
    console.log(`   Report saved to: ${reportPath}`);
  }

  async generateImageInventory() {
    const verification = await this.verifyImageCollection();
    return {
      ...verification,
      lastUpdated: new Date().toISOString(),
      storageSize: this.calculateStorageSize()
    };
  }

  async analyzePlatformCoverage() {
    // Analyze how well the images cover the platform's needs
    const requiredCategories = ['crypto', 'nft', 'defi', 'gamefi', 'chains'];
    const verification = await this.verifyImageCollection();
    
    const coveredRequired = requiredCategories.filter(cat => 
      verification.categoryStats[cat] > 0
    ).length;

    return {
      coveragePercentage: Math.round((coveredRequired / requiredCategories.length) * 100),
      requiredCategories,
      coveredCategories: coveredRequired,
      missingCategories: requiredCategories.filter(cat => 
        !verification.categoryStats[cat] || verification.categoryStats[cat] === 0
      )
    };
  }

  generateRecommendations() {
    return [
      'Run orchestration weekly to keep images updated',
      'Monitor API rate limits and adjust scraping intervals',
      'Implement image optimization for better performance',
      'Add automated quality checks for downloaded images',
      'Consider CDN integration for faster image delivery'
    ];
  }

  generateNextSteps() {
    return [
      'Deploy updated image collection to production',
      'Update LocalImageService to handle new categories',
      'Implement automated monitoring for missing images',
      'Set up scheduled orchestration runs',
      'Add image compression and optimization pipeline'
    ];
  }

  calculateTotalTime() {
    if (!this.orchestrationLog.startTime || !this.orchestrationLog.endTime) {
      return 'Unknown';
    }
    
    const start = new Date(this.orchestrationLog.startTime);
    const end = new Date(this.orchestrationLog.endTime);
    const diffMs = end - start;
    const diffMins = Math.round(diffMs / 60000);
    
    return `${diffMins} minutes`;
  }

  calculateStorageSize() {
    let totalSize = 0;
    
    const calculateDirSize = (dirPath) => {
      if (!fs.existsSync(dirPath)) return 0;
      
      const files = fs.readdirSync(dirPath);
      let size = 0;
      
      for (const file of files) {
        const filePath = path.join(dirPath, file);
        const stats = fs.statSync(filePath);
        
        if (stats.isFile()) {
          size += stats.size;
        } else if (stats.isDirectory()) {
          size += calculateDirSize(filePath);
        }
      }
      
      return size;
    };

    totalSize = calculateDirSize(this.assetsDir);
    
    // Convert to MB
    return `${(totalSize / (1024 * 1024)).toFixed(2)} MB`;
  }

  saveOrchestrationLog() {
    fs.writeFileSync(this.logFile, JSON.stringify(this.orchestrationLog, null, 2));
  }

  // Quick run for specific systems
  async quickRun(systems = []) {
    console.log(`🚀 Quick run for systems: ${systems.join(', ')}\n`);
    
    for (const system of systems) {
      if (this.systems[system]) {
        try {
          await this.executeScript(this.systems[system].script);
          console.log(`✅ ${system} completed\n`);
        } catch (error) {
          console.error(`❌ ${system} failed:`, error.message);
        }
      }
    }
  }

  // Status check
  async status() {
    console.log('📊 Image Collection Status\n');
    
    const verification = await this.verifyImageCollection();
    
    console.log('Categories:');
    Object.entries(verification.categoryStats).forEach(([category, count]) => {
      console.log(`  ${category}: ${count} images`);
    });
    
    console.log(`\nTotal: ${verification.totalImages} images`);
    console.log(`Coverage: ${verification.qualityScore}%`);
    console.log(`Storage: ${this.calculateStorageSize()}`);
  }
}

// CLI interface
if (require.main === module) {
  const orchestrator = new MasterImageOrchestrator();
  const args = process.argv.slice(2);
  
  if (args.includes('--status')) {
    orchestrator.status().catch(console.error);
  } else if (args.includes('--quick')) {
    const systems = args.filter(arg => !arg.startsWith('--'));
    orchestrator.quickRun(systems).catch(console.error);
  } else {
    const options = {
      skipAnalysis: args.includes('--skip-analysis'),
      skipScraping: args.includes('--skip-scraping'),
      skipGeneration: args.includes('--skip-generation'),
      skipUpdate: args.includes('--skip-update')
    };
    
    orchestrator.orchestrate(options).catch(console.error);
  }
}

module.exports = MasterImageOrchestrator;
