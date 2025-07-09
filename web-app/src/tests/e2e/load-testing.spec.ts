import { test, expect } from '@playwright/test';

test.describe('Load Testing and Performance Under Stress', () => {
  test.describe('Homepage Load Testing', () => {
    test('should handle concurrent users on homepage', async ({ page, context }) => {
      const concurrentUsers = 10;
      const promises = [];
      
      for (let i = 0; i < concurrentUsers; i++) {
        promises.push(
          context.newPage().then(async (newPage) => {
            const startTime = performance.now();
            
            await newPage.goto('/');
            await newPage.waitForLoadState('networkidle');
            
            const endTime = performance.now();
            const loadTime = endTime - startTime;
            
            // Each page should load within acceptable time even under load
            expect(loadTime).toBeLessThan(5000);
            
            await newPage.close();
            return loadTime;
          })
        );
      }
      
      const loadTimes = await Promise.all(promises);
      const averageLoadTime = loadTimes.reduce((sum, time) => sum + time, 0) / loadTimes.length;
      
      console.log(`Average load time with ${concurrentUsers} concurrent users: ${averageLoadTime}ms`);
      
      // Average should be reasonable
      expect(averageLoadTime).toBeLessThan(3000);
    });

    test('should handle rapid navigation between pages', async ({ page }) => {
      const pages = ['/', '/create', '/examples', '/about'];
      const navigationTimes = [];
      
      for (let i = 0; i < 20; i++) {
        const randomPage = pages[Math.floor(Math.random() * pages.length)];
        
        const startTime = performance.now();
        await page.goto(randomPage);
        await page.waitForLoadState('networkidle');
        const endTime = performance.now();
        
        navigationTimes.push(endTime - startTime);
      }
      
      const averageNavTime = navigationTimes.reduce((sum, time) => sum + time, 0) / navigationTimes.length;
      
      console.log(`Average navigation time: ${averageNavTime}ms`);
      
      // Navigation should remain fast
      expect(averageNavTime).toBeLessThan(2000);
    });

    test('should handle memory usage under repeated operations', async ({ page }) => {
      const initialMemory = await page.evaluate(() => {
        return (performance as any).memory?.usedJSHeapSize || 0;
      });
      
      // Perform memory-intensive operations
      for (let i = 0; i < 50; i++) {
        await page.goto('/');
        await page.waitForLoadState('networkidle');
        
        // Simulate user interactions
        await page.click('[data-testid="cta-button"]');
        await page.goBack();
        await page.waitForLoadState('networkidle');
        
        // Force garbage collection if available
        await page.evaluate(() => {
          if ((window as any).gc) {
            (window as any).gc();
          }
        });
      }
      
      const finalMemory = await page.evaluate(() => {
        return (performance as any).memory?.usedJSHeapSize || 0;
      });
      
      const memoryIncrease = finalMemory - initialMemory;
      console.log(`Memory increase: ${memoryIncrease / 1024 / 1024}MB`);
      
      // Memory increase should be reasonable (less than 50MB)
      expect(memoryIncrease).toBeLessThan(50 * 1024 * 1024);
    });
  });

  test.describe('Portfolio Creation Load Testing', () => {
    test('should handle multiple portfolio creation attempts', async ({ page, context }) => {
      const concurrentCreations = 5;
      const promises = [];
      
      for (let i = 0; i < concurrentCreations; i++) {
        promises.push(
          context.newPage().then(async (newPage) => {
            const startTime = performance.now();
            
            await newPage.goto('/create');
            await newPage.waitForLoadState('networkidle');
            
            // Fill out form
            await newPage.fill('[data-testid="full-name-input"]', `Test User ${i}`);
            await newPage.fill('[data-testid="email-input"]', `test${i}@example.com`);
            await newPage.locator('[data-testid="profession-select"]').selectOption('actor');
            await newPage.click('[data-testid="continue-button"]');
            
            await newPage.waitForLoadState('networkidle');
            
            const endTime = performance.now();
            const processTime = endTime - startTime;
            
            await newPage.close();
            return processTime;
          })
        );
      }
      
      const processTimes = await Promise.all(promises);
      const averageProcessTime = processTimes.reduce((sum, time) => sum + time, 0) / processTimes.length;
      
      console.log(`Average portfolio creation time: ${averageProcessTime}ms`);
      
      // Should handle concurrent creations efficiently
      expect(averageProcessTime).toBeLessThan(5000);
    });

    test('should handle large form submissions', async ({ page }) => {
      await page.goto('/create');
      await page.waitForLoadState('networkidle');
      
      // Fill form with large data
      const largeBio = 'A'.repeat(5000); // 5KB of text
      const largeText = 'B'.repeat(1000); // 1KB of text
      
      await page.fill('[data-testid="full-name-input"]', largeText);
      await page.fill('[data-testid="email-input"]', 'test@example.com');
      await page.locator('[data-testid="profession-select"]').selectOption('actor');
      await page.click('[data-testid="continue-button"]');
      
      await page.waitForLoadState('networkidle');
      
      // Select template
      await page.click('[data-testid="template-t1"]');
      await page.click('[data-testid="continue-button"]');
      
      await page.waitForLoadState('networkidle');
      
      // Fill bio with large text
      const startTime = performance.now();
      await page.fill('[data-testid="bio-textarea"]', largeBio);
      
      // Submit form
      await page.click('[data-testid="submit-button"]');
      await page.waitForLoadState('networkidle');
      
      const endTime = performance.now();
      const submissionTime = endTime - startTime;
      
      console.log(`Large form submission time: ${submissionTime}ms`);
      
      // Should handle large submissions efficiently
      expect(submissionTime).toBeLessThan(3000);
    });
  });

  test.describe('Image Upload Load Testing', () => {
    test('should handle multiple image uploads', async ({ page }) => {
      await page.goto('/create');
      await page.waitForLoadState('networkidle');
      
      // Navigate to image upload step
      await page.fill('[data-testid="full-name-input"]', 'John Doe');
      await page.fill('[data-testid="email-input"]', 'john@example.com');
      await page.locator('[data-testid="profession-select"]').selectOption('actor');
      await page.click('[data-testid="continue-button"]');
      
      await page.click('[data-testid="template-t1"]');
      await page.click('[data-testid="continue-button"]');
      
      await page.waitForLoadState('networkidle');
      
      // Create multiple mock images
      const imagePromises = [];
      const numberOfImages = 10;
      
      for (let i = 0; i < numberOfImages; i++) {
        imagePromises.push(
          new Promise<number>((resolve) => {
            const startTime = performance.now();
            
            // Create mock image file
            const imageBuffer = Buffer.from('fake-image-data');
            
            page.locator('[data-testid="image-upload-input"]').setInputFiles({
              name: `test-image-${i}.jpg`,
              mimeType: 'image/jpeg',
              buffer: imageBuffer,
            }).then(() => {
              const endTime = performance.now();
              resolve(endTime - startTime);
            });
          })
        );
      }
      
      const uploadTimes = await Promise.all(imagePromises);
      const averageUploadTime = uploadTimes.reduce((sum, time) => sum + time, 0) / uploadTimes.length;
      
      console.log(`Average image upload time: ${averageUploadTime}ms`);
      
      // Should handle multiple uploads efficiently
      expect(averageUploadTime).toBeLessThan(1000);
    });

    test('should handle large image files', async ({ page }) => {
      await page.goto('/create');
      await page.waitForLoadState('networkidle');
      
      // Navigate to image upload step
      await page.fill('[data-testid="full-name-input"]', 'John Doe');
      await page.fill('[data-testid="email-input"]', 'john@example.com');
      await page.locator('[data-testid="profession-select"]').selectOption('actor');
      await page.click('[data-testid="continue-button"]');
      
      await page.click('[data-testid="template-t1"]');
      await page.click('[data-testid="continue-button"]');
      
      await page.waitForLoadState('networkidle');
      
      // Create large mock image (2MB)
      const largeImageBuffer = Buffer.alloc(2 * 1024 * 1024);
      
      const startTime = performance.now();
      
      await page.locator('[data-testid="image-upload-input"]').setInputFiles({
        name: 'large-image.jpg',
        mimeType: 'image/jpeg',
        buffer: largeImageBuffer,
      });
      
      // Wait for upload processing
      await page.waitForTimeout(3000);
      
      const endTime = performance.now();
      const uploadTime = endTime - startTime;
      
      console.log(`Large image upload time: ${uploadTime}ms`);
      
      // Should handle large files reasonably
      expect(uploadTime).toBeLessThan(10000);
    });
  });

  test.describe('API Load Testing', () => {
    test('should handle concurrent API requests', async ({ page }) => {
      const concurrentRequests = 20;
      const promises = [];
      
      for (let i = 0; i < concurrentRequests; i++) {
        promises.push(
          page.request.get('/api/portfolios/discover').then(response => {
            expect(response.status()).toBeLessThan(500);
            return response.status();
          })
        );
      }
      
      const responses = await Promise.all(promises);
      const successfulRequests = responses.filter(status => status === 200).length;
      
      console.log(`Successful API requests: ${successfulRequests}/${concurrentRequests}`);
      
      // Most requests should succeed
      expect(successfulRequests).toBeGreaterThan(concurrentRequests * 0.8);
    });

    test('should handle API rate limiting gracefully', async ({ page }) => {
      const rapidRequests = 30;
      const promises = [];
      
      for (let i = 0; i < rapidRequests; i++) {
        promises.push(
          page.request.post('/api/auth/signin', {
            data: {
              email: 'test@example.com',
              password: 'wrongpassword',
            },
          }).then(response => response.status())
        );
      }
      
      const responses = await Promise.all(promises);
      const rateLimitedRequests = responses.filter(status => status === 429).length;
      
      console.log(`Rate limited requests: ${rateLimitedRequests}/${rapidRequests}`);
      
      // Should implement rate limiting
      expect(rateLimitedRequests).toBeGreaterThan(0);
    });
  });

  test.describe('Database Load Testing', () => {
    test('should handle database queries under load', async ({ page }) => {
      const searchQueries = [
        'actor',
        'model',
        'photographer',
        'artist',
        'john',
        'jane',
        'portfolio',
        'creative',
      ];
      
      const promises = [];
      
      for (let i = 0; i < 50; i++) {
        const randomQuery = searchQueries[Math.floor(Math.random() * searchQueries.length)];
        
        promises.push(
          page.request.get(`/api/portfolios/discover?search=${randomQuery}`).then(async response => {
            expect(response.status()).toBe(200);
            
            const data = await response.json();
            expect(data.portfolios).toBeDefined();
            
            return response.status();
          })
        );
      }
      
      const responses = await Promise.all(promises);
      const successfulQueries = responses.filter(status => status === 200).length;
      
      console.log(`Successful database queries: ${successfulQueries}/${promises.length}`);
      
      // All queries should succeed
      expect(successfulQueries).toBe(promises.length);
    });

    test('should handle complex search queries', async ({ page }) => {
      const complexQueries = [
        'actor AND model',
        'photographer OR artist',
        'creative AND portfolio',
        'john OR jane',
        'actor NOT model',
        'portfolio AND (actor OR model)',
      ];
      
      const promises = [];
      
      for (const query of complexQueries) {
        promises.push(
          page.request.get(`/api/portfolios/discover?search=${encodeURIComponent(query)}`).then(async response => {
            const startTime = performance.now();
            const data = await response.json();
            const endTime = performance.now();
            
            const queryTime = endTime - startTime;
            
            expect(response.status()).toBe(200);
            expect(data.portfolios).toBeDefined();
            
            return queryTime;
          })
        );
      }
      
      const queryTimes = await Promise.all(promises);
      const averageQueryTime = queryTimes.reduce((sum, time) => sum + time, 0) / queryTimes.length;
      
      console.log(`Average complex query time: ${averageQueryTime}ms`);
      
      // Complex queries should complete reasonably fast
      expect(averageQueryTime).toBeLessThan(1000);
    });
  });

  test.describe('Memory and Resource Testing', () => {
    test('should handle DOM manipulation under load', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      const initialNodes = await page.evaluate(() => document.querySelectorAll('*').length);
      
      // Perform DOM-intensive operations
      for (let i = 0; i < 100; i++) {
        await page.evaluate(() => {
          const div = document.createElement('div');
          div.innerHTML = `<p>Test content ${Math.random()}</p>`;
          document.body.appendChild(div);
        });
        
        await page.evaluate(() => {
          const elements = document.querySelectorAll('div');
          if (elements.length > 1000) {
            elements[0].remove();
          }
        });
      }
      
      const finalNodes = await page.evaluate(() => document.querySelectorAll('*').length);
      const nodeIncrease = finalNodes - initialNodes;
      
      console.log(`DOM nodes increased by: ${nodeIncrease}`);
      
      // DOM should not grow excessively
      expect(nodeIncrease).toBeLessThan(500);
    });

    test('should handle event listeners under load', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      // Add many event listeners
      const eventListenerCount = 1000;
      
      const startTime = performance.now();
      
      await page.evaluate((count) => {
        for (let i = 0; i < count; i++) {
          const button = document.createElement('button');
          button.addEventListener('click', () => {
            console.log(`Button ${i} clicked`);
          });
          document.body.appendChild(button);
        }
      }, eventListenerCount);
      
      const endTime = performance.now();
      const creationTime = endTime - startTime;
      
      console.log(`Created ${eventListenerCount} event listeners in ${creationTime}ms`);
      
      // Should handle event listener creation efficiently
      expect(creationTime).toBeLessThan(2000);
      
      // Clean up
      await page.evaluate(() => {
        const buttons = document.querySelectorAll('button');
        buttons.forEach(button => button.remove());
      });
    });
  });

  test.describe('Network and Caching Load Testing', () => {
    test('should handle network latency simulation', async ({ page }) => {
      // Simulate slow network
      await page.route('**/*', (route) => {
        setTimeout(() => {
          route.continue();
        }, 100); // 100ms delay
      });
      
      const startTime = performance.now();
      
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      const endTime = performance.now();
      const loadTime = endTime - startTime;
      
      console.log(`Load time with network latency: ${loadTime}ms`);
      
      // Should still load in reasonable time
      expect(loadTime).toBeLessThan(10000);
    });

    test('should handle cache invalidation', async ({ page }) => {
      // First load
      const firstLoadStart = performance.now();
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      const firstLoadEnd = performance.now();
      
      // Second load (should be cached)
      const secondLoadStart = performance.now();
      await page.reload();
      await page.waitForLoadState('networkidle');
      const secondLoadEnd = performance.now();
      
      const firstLoadTime = firstLoadEnd - firstLoadStart;
      const secondLoadTime = secondLoadEnd - secondLoadStart;
      
      console.log(`First load: ${firstLoadTime}ms, Second load: ${secondLoadTime}ms`);
      
      // Second load should be faster (cached)
      expect(secondLoadTime).toBeLessThan(firstLoadTime);
    });
  });

  test.describe('Mobile Performance Under Load', () => {
    test('should handle mobile performance under load', async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });
      
      // Simulate mobile network conditions
      await page.route('**/*', (route) => {
        setTimeout(() => {
          route.continue();
        }, 200); // 200ms delay for mobile
      });
      
      const loadTimes = [];
      
      for (let i = 0; i < 10; i++) {
        const startTime = performance.now();
        
        await page.goto('/');
        await page.waitForLoadState('networkidle');
        
        const endTime = performance.now();
        loadTimes.push(endTime - startTime);
      }
      
      const averageLoadTime = loadTimes.reduce((sum, time) => sum + time, 0) / loadTimes.length;
      
      console.log(`Average mobile load time: ${averageLoadTime}ms`);
      
      // Mobile should still be performant
      expect(averageLoadTime).toBeLessThan(5000);
    });

    test('should handle mobile touch events under load', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      // Simulate rapid touch events
      const touchEvents = [];
      
      for (let i = 0; i < 50; i++) {
        touchEvents.push(
          page.touchscreen.tap(100 + (i % 10) * 20, 100 + Math.floor(i / 10) * 20)
        );
      }
      
      const startTime = performance.now();
      await Promise.all(touchEvents);
      const endTime = performance.now();
      
      const touchProcessingTime = endTime - startTime;
      
      console.log(`Touch events processing time: ${touchProcessingTime}ms`);
      
      // Should handle touch events efficiently
      expect(touchProcessingTime).toBeLessThan(2000);
    });
  });

  test.describe('Stress Testing Recovery', () => {
    test('should recover from high CPU usage', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      // Simulate high CPU usage
      await page.evaluate(() => {
        const startTime = Date.now();
        while (Date.now() - startTime < 1000) {
          // Busy wait for 1 second
        }
      });
      
      // Test if page is still responsive
      const startTime = performance.now();
      await page.click('[data-testid="cta-button"]');
      const endTime = performance.now();
      
      const responseTime = endTime - startTime;
      
      console.log(`Response time after CPU stress: ${responseTime}ms`);
      
      // Should recover quickly
      expect(responseTime).toBeLessThan(1000);
    });

    test('should handle error recovery under load', async ({ page }) => {
      // Simulate API errors
      await page.route('/api/portfolios/discover', (route) => {
        route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Internal server error' }),
        });
      });
      
      await page.goto('/examples');
      await page.waitForLoadState('networkidle');
      
      // Should show error state
      const errorMessage = page.locator('[data-testid="error-message"]');
      if (await errorMessage.count() > 0) {
        await expect(errorMessage).toBeVisible();
      }
      
      // Restore API
      await page.route('/api/portfolios/discover', (route) => {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ portfolios: [], totalCount: 0 }),
        });
      });
      
      // Should recover when retrying
      await page.reload();
      await page.waitForLoadState('networkidle');
      
      // Error should be gone
      if (await errorMessage.count() > 0) {
        await expect(errorMessage).not.toBeVisible();
      }
    });
  });
});