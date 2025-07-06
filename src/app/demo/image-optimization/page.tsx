'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { EnhancedImageUpload } from '@/components/upload/enhanced-image-upload';
import { ResponsiveImage } from '@/components/ui/responsive-image';
import { ImageOptimizationService } from '@/lib/image-optimization';
import { ImageFormatDetector } from '@/utils/image-format';
import { useImageMetrics } from '@/lib/image-metrics';
import { ImageType } from '@/types/database';
import { Zap, Image, BarChart3, Settings, Monitor } from 'lucide-react';

export default function ImageOptimizationDemo() {
  const [uploadedImages, setUploadedImages] = useState<any[]>([]);
  const [performanceMetrics, setPerformanceMetrics] = useState<any>(null);
  const [browserCapabilities, setBrowserCapabilities] = useState<any>(null);
  const [optimizationStats, setOptimizationStats] = useState({
    totalSavings: 0,
    imagesOptimized: 0,
    averageCompressionRatio: 0,
  });
  
  const { getSummary, getRecommendations, measureCoreWebVitals } = useImageMetrics();

  useEffect(() => {
    // Initialize performance monitoring
    const initializeMetrics = async () => {
      const capabilities = await ImageFormatDetector.detectBrowserCapabilities();
      setBrowserCapabilities(capabilities);
      
      const summary = getSummary();
      setPerformanceMetrics(summary);
      
      const vitals = await measureCoreWebVitals();
      console.log('Core Web Vitals:', vitals);
    };

    initializeMetrics();
  }, []);

  const handleFilesUploaded = (files: any[]) => {
    setUploadedImages(prev => [...prev, ...files]);
    
    // Update optimization stats
    const totalSavings = files.reduce((sum, file) => sum + (file.compressionSavings || 0), 0);
    setOptimizationStats(prev => ({
      totalSavings: prev.totalSavings + totalSavings,
      imagesOptimized: prev.imagesOptimized + files.length,
      averageCompressionRatio: (prev.averageCompressionRatio + totalSavings) / 2,
    }));
  };

  const runPerformanceTest = async () => {
    const testUrls = [
      'https://images.unsplash.com/photo-1494790108755-2616b23b0a85?w=800',
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800',
      'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=800',
    ];

    const results = [];
    
    for (const url of testUrls) {
      const startTime = performance.now();
      
      try {
        await new Promise((resolve, reject) => {
          const img = new Image();
          img.onload = resolve;
          img.onerror = reject;
          img.src = url;
        });
        
        const loadTime = performance.now() - startTime;
        results.push({ url, loadTime, success: true });
      } catch (error) {
        results.push({ url, loadTime: 0, success: false });
      }
    }

    const averageLoadTime = results
      .filter(r => r.success)
      .reduce((sum, r) => sum + r.loadTime, 0) / results.length;

    setPerformanceMetrics({
      ...performanceMetrics,
      testResults: results,
      averageLoadTime,
    });
  };

  const clearDemo = () => {
    setUploadedImages([]);
    setOptimizationStats({
      totalSavings: 0,
      imagesOptimized: 0,
      averageCompressionRatio: 0,
    });
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Image Optimization Demo</h1>
        <p className="text-lg text-gray-600">
          Part 4.3: Advanced image optimization features with real-time performance monitoring
        </p>
      </div>

      {/* Performance Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Savings</p>
                <p className="text-2xl font-bold text-green-600">
                  {optimizationStats.totalSavings.toFixed(1)}%
                </p>
              </div>
              <Zap className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Images Optimized</p>
                <p className="text-2xl font-bold">{optimizationStats.imagesOptimized}</p>
              </div>
              <Image className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg Load Time</p>
                <p className="text-2xl font-bold">
                  {performanceMetrics?.averageLoadTime?.toFixed(0) || 0}ms
                </p>
              </div>
              <BarChart3 className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Cache Hit Rate</p>
                <p className="text-2xl font-bold">
                  {((performanceMetrics?.cacheHitRate || 0) * 100).toFixed(0)}%
                </p>
              </div>
              <Monitor className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="upload" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="upload">Upload & Optimize</TabsTrigger>
          <TabsTrigger value="gallery">Optimized Gallery</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="browser">Browser Support</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5" />
                Enhanced Image Upload with Optimization
              </CardTitle>
            </CardHeader>
            <CardContent>
              <EnhancedImageUpload
                imageType={ImageType.PORTFOLIO}
                portfolioId="demo-portfolio"
                maxFiles={10}
                onFilesUploaded={handleFilesUploaded}
                showOptimizationSettings={true}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="gallery" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Optimized Image Gallery</CardTitle>
                <Button variant="outline" onClick={clearDemo}>
                  Clear Demo
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {uploadedImages.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <Image className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Upload some images to see the optimized gallery</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {uploadedImages.map((image, index) => (
                    <Card key={index}>
                      <CardContent className="p-4">
                        <div className="aspect-square mb-4">
                          <ResponsiveImage
                            src={`demo-image-${index}.jpg`}
                            alt={`Demo image ${index + 1}`}
                            bucketName="demo-bucket"
                            imageType={ImageType.PORTFOLIO}
                            width={400}
                            height={400}
                            enableProgressive={true}
                            showLoadingState={true}
                            className="w-full h-full rounded-lg"
                          />
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">{image.name}</span>
                            {image.compressionSavings > 0 && (
                              <Badge variant="secondary" className="text-xs">
                                -{image.compressionSavings.toFixed(0)}%
                              </Badge>
                            )}
                          </div>
                          <div className="text-xs text-gray-500">
                            Size: {(image.size / 1024 / 1024).toFixed(2)} MB
                          </div>
                          {image.optimizedUrls && (
                            <div className="text-xs text-green-600">
                              ✓ Multiple variants generated
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Performance Monitoring</CardTitle>
                <Button onClick={runPerformanceTest}>
                  Run Performance Test
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {performanceMetrics && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium mb-4">Performance Summary</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm">Total Images:</span>
                        <span className="font-medium">{performanceMetrics.totalImages || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Average Load Time:</span>
                        <span className="font-medium">{(performanceMetrics.averageLoadTime || 0).toFixed(0)}ms</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Total File Size:</span>
                        <span className="font-medium">
                          {((performanceMetrics.totalFileSize || 0) / 1024 / 1024).toFixed(2)} MB
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Cache Hit Rate:</span>
                        <span className="font-medium">
                          {((performanceMetrics.cacheHitRate || 0) * 100).toFixed(0)}%
                        </span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-4">Format Distribution</h4>
                    <div className="space-y-2">
                      {Object.entries(performanceMetrics.formatDistribution || {}).map(([format, count]) => (
                        <div key={format} className="flex items-center justify-between">
                          <span className="text-sm capitalize">{format}:</span>
                          <div className="flex items-center gap-2">
                            <Progress 
                              value={(count as number / performanceMetrics.totalImages) * 100} 
                              className="w-20 h-2"
                            />
                            <span className="text-sm font-medium">{count as number}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {performanceMetrics?.testResults && (
                <div>
                  <h4 className="font-medium mb-4">Load Time Test Results</h4>
                  <div className="space-y-2">
                    {performanceMetrics.testResults.map((result: any, index: number) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="text-sm">Test Image {index + 1}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">
                            {result.success ? `${result.loadTime.toFixed(0)}ms` : 'Failed'}
                          </span>
                          <Badge variant={result.success ? 'secondary' : 'destructive'}>
                            {result.success ? 'Success' : 'Error'}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <h4 className="font-medium mb-4">Optimization Recommendations</h4>
                <div className="space-y-2">
                  {getRecommendations().map((recommendation, index) => (
                    <div key={index} className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <p className="text-sm text-blue-800">{recommendation}</p>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="browser" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Browser Capabilities</CardTitle>
            </CardHeader>
            <CardContent>
              {browserCapabilities ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium mb-4">Format Support</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">WebP:</span>
                        <Badge variant={browserCapabilities.supportsWebP ? 'default' : 'secondary'}>
                          {browserCapabilities.supportsWebP ? 'Supported' : 'Not Supported'}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">AVIF:</span>
                        <Badge variant={browserCapabilities.supportsAVIF ? 'default' : 'secondary'}>
                          {browserCapabilities.supportsAVIF ? 'Supported' : 'Not Supported'}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">JPEG:</span>
                        <Badge variant="default">Always Supported</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">PNG:</span>
                        <Badge variant="default">Always Supported</Badge>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-4">Connection Info</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Connection Speed:</span>
                        <Badge variant={
                          browserCapabilities.connection === 'fast' ? 'default' :
                          browserCapabilities.connection === 'slow' ? 'destructive' : 'secondary'
                        }>
                          {browserCapabilities.connection}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="animate-spin w-8 h-8 border-2 border-gray-300 border-t-gray-600 rounded-full mx-auto mb-4"></div>
                  <p className="text-gray-500">Detecting browser capabilities...</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Optimization Configuration
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h4 className="font-medium mb-4">Current Configuration</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <h5 className="font-medium mb-2">Upload Settings</h5>
                      <ul className="text-sm space-y-1 text-gray-600">
                        <li>✓ Auto-optimization enabled</li>
                        <li>✓ Multiple variant generation</li>
                        <li>✓ Format detection and conversion</li>
                        <li>✓ Progressive loading</li>
                      </ul>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <h5 className="font-medium mb-2">Performance Features</h5>
                      <ul className="text-sm space-y-1 text-gray-600">
                        <li>✓ Lazy loading with Intersection Observer</li>
                        <li>✓ Real-time performance monitoring</li>
                        <li>✓ CDN-optimized delivery</li>
                        <li>✓ Cache optimization</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-4">Quality Settings</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Profile Images:</span>
                      <span className="text-sm font-medium">90% quality</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Portfolio Images:</span>
                      <span className="text-sm font-medium">85% quality</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Thumbnails:</span>
                      <span className="text-sm font-medium">75% quality</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}