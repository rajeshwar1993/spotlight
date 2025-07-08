/**
 * Tree shaking optimization utilities and configurations
 */

// Export configurations for better tree shaking
export const treeShakingConfig = {
  // Optimize imports for commonly used libraries
  optimizedImports: {
    // Lucide React - import only specific icons
    'lucide-react': {
      transform: 'lucide-react/dist/esm/icons/[kebab-case]',
      skipDefaultConversion: true,
    },
    
    // Radix UI - import only specific components
    '@radix-ui/react-dialog': {
      transform: '@radix-ui/react-dialog/dist/[kebab-case]',
    },
    
    // Date-fns - import only specific functions
    'date-fns': {
      transform: 'date-fns/[camelCase]',
    },
    
    // React Hook Form - optimize imports
    'react-hook-form': {
      transform: 'react-hook-form/dist/[camelCase]',
    },
  },

  // Libraries that support tree shaking
  treeshakableLibraries: [
    'lucide-react',
    'date-fns',
    'react-hook-form',
    'zod',
    'class-variance-authority',
    'clsx',
    'tailwind-merge',
  ],

  // Libraries that don't support tree shaking well
  nonTreeshakableLibraries: [
    'react',
    'react-dom',
    'next',
    '@supabase/supabase-js',
    'react-image-crop',
  ],

  // Webpack optimization settings
  webpack: {
    usedExports: true,
    sideEffects: false,
    optimization: {
      usedExports: true,
      providedExports: true,
      sideEffects: false,
    },
  },
};

/**
 * Tree shaking analyzer
 */
export class TreeShakingAnalyzer {
  private importMap = new Map<string, string[]>();
  private unusedExports = new Set<string>();
  private sideEffects = new Set<string>();

  /**
   * Analyze imports in a file
   */
  analyzeImports(fileContent: string, filePath: string): void {
    const importRegex = /import\s+(?:{([^}]+)}|\*\s+as\s+(\w+)|(\w+))\s+from\s+['"]([^'"]+)['"]/g;
    let match;

    while ((match = importRegex.exec(fileContent)) !== null) {
      const [, namedImports, namespaceImport, defaultImport, moduleName] = match;
      
      if (namedImports) {
        const imports = namedImports.split(',').map(imp => imp.trim());
        this.importMap.set(moduleName, imports);
      } else if (namespaceImport) {
        this.importMap.set(moduleName, ['*']);
      } else if (defaultImport) {
        this.importMap.set(moduleName, ['default']);
      }
    }
  }

  /**
   * Check for unused exports
   */
  checkUnusedExports(exports: string[], used: string[]): string[] {
    return exports.filter(exp => !used.includes(exp));
  }

  /**
   * Detect side effects
   */
  detectSideEffects(fileContent: string): string[] {
    const sideEffectPatterns = [
      /console\./g,
      /window\./g,
      /document\./g,
      /localStorage\./g,
      /sessionStorage\./g,
      /fetch\(/g,
      /XMLHttpRequest/g,
    ];

    const sideEffects: string[] = [];
    
    sideEffectPatterns.forEach(pattern => {
      const matches = fileContent.match(pattern);
      if (matches) {
        sideEffects.push(...matches);
      }
    });

    return sideEffects;
  }

  /**
   * Generate optimization recommendations
   */
  generateRecommendations(): string[] {
    const recommendations: string[] = [];

    // Check for commonly over-imported libraries
    this.importMap.forEach((imports, moduleName) => {
      if (imports.includes('*')) {
        recommendations.push(
          `Consider using named imports instead of namespace import for ${moduleName}`
        );
      }

      if (moduleName === 'lucide-react' && imports.length > 10) {
        recommendations.push(
          `Consider lazy loading some lucide-react icons to reduce bundle size`
        );
      }

      if (moduleName === 'date-fns' && imports.includes('*')) {
        recommendations.push(
          `Use specific date-fns imports instead of importing everything`
        );
      }
    });

    return recommendations;
  }

  /**
   * Get bundle impact analysis
   */
  getBundleImpact(): {
    heavyImports: string[];
    optimizableImports: string[];
    sideEffectImports: string[];
  } {
    const heavyImports: string[] = [];
    const optimizableImports: string[] = [];
    const sideEffectImports: string[] = [];

    this.importMap.forEach((imports, moduleName) => {
      // Heavy libraries
      if (treeShakingConfig.nonTreeshakableLibraries.includes(moduleName)) {
        heavyImports.push(moduleName);
      }

      // Optimizable libraries
      if (treeShakingConfig.treeshakableLibraries.includes(moduleName)) {
        optimizableImports.push(moduleName);
      }

      // Side effect imports
      if (this.sideEffects.has(moduleName)) {
        sideEffectImports.push(moduleName);
      }
    });

    return {
      heavyImports,
      optimizableImports,
      sideEffectImports,
    };
  }
}

/**
 * Tree shaking utilities
 */
export const treeShakingUtils = {
  /**
   * Optimize lucide-react imports
   */
  optimizeLucideImports: (icons: string[]) => {
    return icons.map(icon => `import { ${icon} } from 'lucide-react';`).join('\n');
  },

  /**
   * Optimize date-fns imports
   */
  optimizeDateFnsImports: (functions: string[]) => {
    return functions.map(fn => `import { ${fn} } from 'date-fns';`).join('\n');
  },

  /**
   * Create optimized barrel exports
   */
  createBarrelExports: (exports: string[]) => {
    return exports.map(exp => `export { ${exp} } from './${exp}';`).join('\n');
  },

  /**
   * Generate import analysis report
   */
  generateImportReport: (analyzer: TreeShakingAnalyzer) => {
    const impact = analyzer.getBundleImpact();
    const recommendations = analyzer.generateRecommendations();

    return {
      summary: {
        totalImports: analyzer.importMap.size,
        heavyImports: impact.heavyImports.length,
        optimizableImports: impact.optimizableImports.length,
        sideEffectImports: impact.sideEffectImports.length,
      },
      details: {
        heavyImports: impact.heavyImports,
        optimizableImports: impact.optimizableImports,
        sideEffectImports: impact.sideEffectImports,
      },
      recommendations,
    };
  },

  /**
   * Check if module supports tree shaking
   */
  supportsTreeShaking: (moduleName: string) => {
    return treeShakingConfig.treeshakableLibraries.includes(moduleName);
  },

  /**
   * Get optimized import suggestion
   */
  getOptimizedImportSuggestion: (moduleName: string, imports: string[]) => {
    const config = treeShakingConfig.optimizedImports[moduleName];
    if (!config) return null;

    return imports.map(imp => 
      config.transform.replace('[kebab-case]', imp.toLowerCase().replace(/([A-Z])/g, '-$1'))
    );
  },
};

/**
 * Webpack tree shaking configuration
 */
export const webpackTreeShakingConfig = {
  optimization: {
    usedExports: true,
    sideEffects: false,
    providedExports: true,
    innerGraph: true,
    mangleExports: true,
  },
  
  module: {
    rules: [
      {
        test: /\.js$/,
        sideEffects: false,
      },
      {
        test: /\.tsx?$/,
        sideEffects: false,
      },
      {
        test: /\.css$/,
        sideEffects: true,
      },
    ],
  },
};

/**
 * Package.json sideEffects configuration
 */
export const packageJsonSideEffects = {
  sideEffects: [
    "*.css",
    "*.scss",
    "*.sass",
    "*.less",
    "./src/app/globals.css",
    "./src/styles/**/*",
  ],
};

/**
 * ESLint rules for tree shaking optimization
 */
export const eslintTreeShakingRules = {
  rules: {
    // Prefer named imports over default imports
    'import/prefer-default-export': 'off',
    'import/no-default-export': 'error',
    
    // Avoid importing entire modules
    'import/no-namespace': 'error',
    
    // Ensure imports are used
    'import/no-unused-modules': 'error',
    
    // Prefer specific imports
    'no-restricted-imports': [
      'error',
      {
        patterns: [
          {
            group: ['lucide-react'],
            message: 'Import specific icons from lucide-react instead of the entire library',
          },
          {
            group: ['date-fns'],
            message: 'Import specific functions from date-fns instead of the entire library',
          },
        ],
      },
    ],
  },
};

/**
 * Rollup tree shaking configuration
 */
export const rollupTreeShakingConfig = {
  treeshake: {
    moduleSideEffects: false,
    propertyReadSideEffects: false,
    tryCatchDeoptimization: false,
    unknownGlobalSideEffects: false,
  },
  
  external: [
    'react',
    'react-dom',
    'next',
  ],
  
  output: {
    preserveModules: true,
    preserveModulesRoot: 'src',
  },
};

/**
 * Bundle analyzer configuration
 */
export const bundleAnalyzerConfig = {
  analyzerMode: 'static',
  reportFilename: 'bundle-report.html',
  openAnalyzer: false,
  generateStatsFile: true,
  statsFilename: 'bundle-stats.json',
  logLevel: 'info',
};

/**
 * Tree shaking best practices
 */
export const treeShakingBestPractices = {
  // Import patterns to prefer
  goodPatterns: [
    // Named imports
    "import { Button } from '@/components/ui/button';",
    "import { format } from 'date-fns';",
    "import { Calendar } from 'lucide-react';",
    
    // Dynamic imports for code splitting
    "const Component = lazy(() => import('./Component'));",
    
    // Conditional imports
    "if (condition) { import('./module').then(module => {}); }",
  ],
  
  // Import patterns to avoid
  badPatterns: [
    // Namespace imports
    "import * as Icons from 'lucide-react';",
    "import * as DateFns from 'date-fns';",
    
    // Full library imports
    "import _ from 'lodash';",
    "import moment from 'moment';",
    
    // Side effect imports in modules
    "import 'some-library/side-effect';",
  ],
  
  // Optimization tips
  tips: [
    "Use named imports instead of default imports where possible",
    "Avoid importing entire libraries - import only what you need",
    "Use dynamic imports for code splitting",
    "Mark packages as side-effect free in package.json",
    "Use babel-plugin-import for automatic import optimization",
    "Regularly audit your bundle with webpack-bundle-analyzer",
    "Consider using smaller alternative libraries",
    "Use tree-shakable versions of libraries (e.g., date-fns instead of moment)",
  ],
};

export default treeShakingConfig;