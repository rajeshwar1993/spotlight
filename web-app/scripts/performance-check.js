#!/usr/bin/env node

/**
 * Performance check script for CI/CD pipeline
 * Analyzes bundle size, performance metrics, and generates reports
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Performance thresholds
const PERFORMANCE_THRESHOLDS = {
  bundleSize: {
    total: 1000000, // 1MB
    gzipped: 500000, // 500KB
    individual: 250000, // 250KB per chunk
  },
  lighthouse: {
    performance: 90,
    accessibility: 95,
    bestPractices: 90,
    seo: 95,
    fcp: 1800, // First Contentful Paint
    lcp: 2500, // Largest Contentful Paint
    cls: 0.1,  // Cumulative Layout Shift
    fid: 100,  // First Input Delay
    ttfb: 800, // Time to First Byte
  },
  loadTime: {
    homePage: 3000,
    portfolioPage: 2000,
    dashboardPage: 4000,
  },
};

class PerformanceChecker {
  constructor() {
    this.results = {
      bundleSize: {},
      lighthouse: {},
      loadTime: {},
      recommendations: [],
      passed: true,
      score: 0,
    };
  }

  async run() {
    console.log('🚀 Starting performance check...');
    
    try {
      await this.checkBundleSize();
      await this.runLighthouseAudit();
      await this.checkLoadTimes();
      await this.generateRecommendations();
      await this.calculateScore();
      await this.generateReport();
      
      console.log(`✅ Performance check completed with score: ${this.results.score}/100`);
      
      if (!this.results.passed) {
        console.error('❌ Performance check failed!');
        process.exit(1);
      }
      
    } catch (error) {
      console.error('❌ Performance check failed:', error);
      process.exit(1);
    }
  }

  async checkBundleSize() {
    console.log('📦 Checking bundle size...');
    
    try {
      // Read Next.js build output
      const buildOutputPath = path.join(process.cwd(), '.next', 'build-manifest.json');
      const buildManifest = JSON.parse(fs.readFileSync(buildOutputPath, 'utf8'));
      
      // Calculate bundle sizes
      const bundleStats = this.calculateBundleStats(buildManifest);
      
      this.results.bundleSize = {
        total: bundleStats.total,
        gzipped: Math.round(bundleStats.total * 0.3), // Estimate gzipped size
        chunks: bundleStats.chunks,
        change: this.calculateBundleChange(bundleStats.total),
        passed: bundleStats.total <= PERFORMANCE_THRESHOLDS.bundleSize.total,
      };
      
      console.log(`📊 Bundle size: ${this.formatBytes(bundleStats.total)}`);
      
    } catch (error) {
      console.error('❌ Bundle size check failed:', error);
      this.results.bundleSize.passed = false;
    }
  }

  calculateBundleStats(manifest) {
    const stats = {
      total: 0,
      chunks: {},
    };
    
    // Process all pages
    Object.entries(manifest.pages).forEach(([page, files]) => {
      files.forEach(file => {
        try {
          const filePath = path.join(process.cwd(), '.next', file);
          const size = fs.statSync(filePath).size;
          stats.total += size;
          stats.chunks[file] = size;
        } catch (error) {
          // File might not exist, skip
        }
      });
    });
    
    return stats;
  }

  calculateBundleChange(currentSize) {
    try {
      const previousSizePath = path.join(process.cwd(), 'performance-baseline.json');
      if (fs.existsSync(previousSizePath)) {
        const baseline = JSON.parse(fs.readFileSync(previousSizePath, 'utf8'));
        const change = ((currentSize - baseline.bundleSize) / baseline.bundleSize) * 100;
        return `${change > 0 ? '+' : ''}${change.toFixed(1)}%`;
      }
    } catch (error) {
      console.warn('Could not calculate bundle size change:', error);
    }
    return 'N/A';
  }

  async runLighthouseAudit() {
    console.log('🔍 Running Lighthouse audit...');
    
    try {
      // Run Lighthouse CLI
      const lighthouseResult = execSync(
        'npx lighthouse http://localhost:3000 --output=json --quiet --chrome-flags="--headless"',
        { encoding: 'utf8' }
      );
      
      const lighthouse = JSON.parse(lighthouseResult);
      const audits = lighthouse.audits;
      
      this.results.lighthouse = {
        performance: Math.round(lighthouse.categories.performance.score * 100),
        accessibility: Math.round(lighthouse.categories.accessibility.score * 100),
        bestPractices: Math.round(lighthouse.categories['best-practices'].score * 100),
        seo: Math.round(lighthouse.categories.seo.score * 100),
        fcp: Math.round(audits['first-contentful-paint'].numericValue),
        lcp: Math.round(audits['largest-contentful-paint'].numericValue),
        cls: parseFloat(audits['cumulative-layout-shift'].numericValue.toFixed(3)),
        fid: Math.round(audits['first-input-delay']?.numericValue || 0),
        ttfb: Math.round(audits['time-to-first-byte']?.numericValue || 0),
        passed: lighthouse.categories.performance.score >= PERFORMANCE_THRESHOLDS.lighthouse.performance / 100,
      };
      
      console.log(`⚡ Performance score: ${this.results.lighthouse.performance}/100`);
      
    } catch (error) {
      console.error('❌ Lighthouse audit failed:', error);
      this.results.lighthouse.passed = false;
    }
  }

  async checkLoadTimes() {
    console.log('⏱️ Checking load times...');
    
    const pages = [
      { url: 'http://localhost:3000', name: 'homePage' },
      { url: 'http://localhost:3000/examples', name: 'portfolioPage' },
      { url: 'http://localhost:3000/dashboard', name: 'dashboardPage' },
    ];
    
    this.results.loadTime = {};
    
    for (const page of pages) {
      try {
        const startTime = Date.now();
        await this.fetchPage(page.url);
        const loadTime = Date.now() - startTime;
        
        this.results.loadTime[page.name] = {
          time: loadTime,
          passed: loadTime <= PERFORMANCE_THRESHOLDS.loadTime[page.name],
        };
        
        console.log(`📄 ${page.name}: ${loadTime}ms`);
        
      } catch (error) {
        console.error(`❌ Load time check failed for ${page.name}:`, error);
        this.results.loadTime[page.name] = { passed: false };
      }
    }
  }

  async fetchPage(url) {
    return new Promise((resolve, reject) => {
      const http = require('http');
      const request = http.get(url, (response) => {
        let data = '';
        response.on('data', (chunk) => data += chunk);
        response.on('end', () => resolve(data));
      });
      
      request.on('error', reject);
      request.setTimeout(10000, () => {
        request.abort();
        reject(new Error('Request timeout'));
      });
    });
  }

  async generateRecommendations() {
    console.log('💡 Generating recommendations...');
    
    const recommendations = [];
    
    // Bundle size recommendations
    if (this.results.bundleSize.total > PERFORMANCE_THRESHOLDS.bundleSize.total) {
      recommendations.push('Bundle size exceeds threshold. Consider code splitting and tree shaking.');
    }
    
    // Performance recommendations
    if (this.results.lighthouse.performance < PERFORMANCE_THRESHOLDS.lighthouse.performance) {
      recommendations.push('Performance score is below threshold. Optimize images and reduce JavaScript.');
    }
    
    if (this.results.lighthouse.fcp > PERFORMANCE_THRESHOLDS.lighthouse.fcp) {
      recommendations.push('First Contentful Paint is slow. Optimize above-the-fold content.');
    }
    
    if (this.results.lighthouse.lcp > PERFORMANCE_THRESHOLDS.lighthouse.lcp) {
      recommendations.push('Largest Contentful Paint is slow. Optimize largest elements and images.');
    }
    
    if (this.results.lighthouse.cls > PERFORMANCE_THRESHOLDS.lighthouse.cls) {
      recommendations.push('Cumulative Layout Shift is high. Stabilize layout during load.');
    }
    
    // Load time recommendations
    Object.entries(this.results.loadTime).forEach(([page, result]) => {
      if (!result.passed) {
        recommendations.push(`${page} load time is slow. Consider lazy loading and caching.`);
      }
    });
    
    this.results.recommendations = recommendations;
  }

  async calculateScore() {
    let score = 0;
    let maxScore = 0;
    
    // Bundle size score (20 points)
    maxScore += 20;
    if (this.results.bundleSize.passed) {
      score += 20;
    } else {
      // Partial score based on how close to threshold
      const ratio = PERFORMANCE_THRESHOLDS.bundleSize.total / this.results.bundleSize.total;
      score += Math.max(0, Math.min(20, Math.round(ratio * 20)));
    }
    
    // Lighthouse score (60 points)
    maxScore += 60;
    if (this.results.lighthouse.performance) {
      score += Math.round((this.results.lighthouse.performance / 100) * 60);
    }
    
    // Load time score (20 points)
    maxScore += 20;
    const loadTimeResults = Object.values(this.results.loadTime);
    const passedLoadTimes = loadTimeResults.filter(r => r.passed).length;
    if (loadTimeResults.length > 0) {
      score += Math.round((passedLoadTimes / loadTimeResults.length) * 20);
    }
    
    this.results.score = Math.round((score / maxScore) * 100);
    this.results.passed = this.results.score >= 80; // 80% threshold
  }

  async generateReport() {
    console.log('📄 Generating performance report...');
    
    const report = {
      timestamp: new Date().toISOString(),
      ...this.results,
      detailedReportUrl: process.env.LIGHTHOUSE_REPORT_URL || '#',
    };
    
    // Save report
    const reportPath = path.join(process.cwd(), 'performance-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    
    // Update baseline if this is main branch
    if (process.env.GITHUB_REF === 'refs/heads/main') {
      const baselinePath = path.join(process.cwd(), 'performance-baseline.json');
      fs.writeFileSync(baselinePath, JSON.stringify({
        bundleSize: this.results.bundleSize.total,
        performanceScore: this.results.lighthouse.performance,
        timestamp: new Date().toISOString(),
      }, null, 2));
    }
    
    // Generate human-readable report
    const humanReport = this.generateHumanReadableReport();
    fs.writeFileSync(path.join(process.cwd(), 'performance-report.md'), humanReport);
    
    console.log('✅ Performance report generated');
  }

  generateHumanReadableReport() {
    const { bundleSize, lighthouse, loadTime, recommendations, score, passed } = this.results;
    
    return `
# Performance Report

**Overall Score**: ${score}/100 ${passed ? '✅' : '❌'}

## Bundle Size Analysis
- **Total Size**: ${this.formatBytes(bundleSize.total)} ${bundleSize.passed ? '✅' : '❌'}
- **Gzipped Size**: ${this.formatBytes(bundleSize.gzipped)}
- **Change**: ${bundleSize.change}

## Lighthouse Scores
- **Performance**: ${lighthouse.performance}/100 ${lighthouse.passed ? '✅' : '❌'}
- **Accessibility**: ${lighthouse.accessibility}/100
- **Best Practices**: ${lighthouse.bestPractices}/100
- **SEO**: ${lighthouse.seo}/100

## Core Web Vitals
- **First Contentful Paint**: ${lighthouse.fcp}ms
- **Largest Contentful Paint**: ${lighthouse.lcp}ms
- **Cumulative Layout Shift**: ${lighthouse.cls}
- **First Input Delay**: ${lighthouse.fid}ms
- **Time to First Byte**: ${lighthouse.ttfb}ms

## Load Times
${Object.entries(loadTime).map(([page, result]) => 
  `- **${page}**: ${result.time}ms ${result.passed ? '✅' : '❌'}`
).join('\n')}

## Recommendations
${recommendations.length > 0 ? recommendations.map(rec => `- ${rec}`).join('\n') : 'No recommendations - great job! 🎉'}

---
*Generated on ${new Date().toLocaleString()}*
`;
  }

  formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}

// Run performance check
if (require.main === module) {
  const checker = new PerformanceChecker();
  checker.run();
}

module.exports = PerformanceChecker;