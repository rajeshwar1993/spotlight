import { test, expect } from '@playwright/test';

test.describe('Portfolio Creation Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the portfolio creation page
    await page.goto('/create');
  });

  test('should complete the full portfolio creation flow', async ({ page }) => {
    // Step 1: Basic Information
    await expect(page.getByText('Basic Information')).toBeVisible();
    
    await page.fill('input[name="fullName"]', 'John Doe');
    await page.selectOption('select[name="profession"]', 'actor');
    await page.fill('input[name="location"]', 'New York, NY');
    await page.fill('input[name="email"]', 'john.doe@example.com');
    await page.fill('input[name="phone"]', '+1234567890');
    
    await page.click('button:has-text("Continue")');

    // Step 2: Template Selection
    await expect(page.getByText('Choose Template')).toBeVisible();
    
    // Wait for templates to load
    await page.waitForSelector('[data-testid="template-t1"]');
    await page.click('[data-testid="template-t1"]');
    
    await page.click('button:has-text("Continue")');

    // Step 3: Bio and Details
    await expect(page.getByText('Bio & Details')).toBeVisible();
    
    await page.fill('textarea[name="bio"]', 'I am a passionate actor with over 10 years of experience in theater and film.');
    await page.fill('textarea[name="experience"]', 'Lead role in "Romeo and Juliet" at Broadway Theater');
    await page.fill('input[name="skills"]', 'Acting, Voice Acting, Stage Performance');
    
    await page.click('button:has-text("Continue")');

    // Step 4: Image Upload
    await expect(page.getByText('Upload Images')).toBeVisible();
    
    // Mock file upload
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles([{
      name: 'headshot.jpg',
      mimeType: 'image/jpeg',
      buffer: Buffer.from('fake-image-data')
    }]);
    
    // Wait for upload to complete
    await expect(page.getByText('Upload complete')).toBeVisible();
    
    await page.click('button:has-text("Create Portfolio")');

    // Success page
    await expect(page.getByText('Portfolio Created Successfully')).toBeVisible();
    await expect(page.getByText('Your portfolio has been created')).toBeVisible();
  });

  test('should validate required fields in each step', async ({ page }) => {
    // Step 1: Try to continue without filling required fields
    await page.click('button:has-text("Continue")');
    
    await expect(page.getByText('Full name is required')).toBeVisible();
    await expect(page.getByText('Profession is required')).toBeVisible();
    await expect(page.getByText('Email is required')).toBeVisible();
  });

  test('should validate email format', async ({ page }) => {
    await page.fill('input[name="email"]', 'invalid-email');
    await page.click('button:has-text("Continue")');
    
    await expect(page.getByText('Invalid email format')).toBeVisible();
  });

  test('should allow navigation between steps', async ({ page }) => {
    // Fill Step 1
    await page.fill('input[name="fullName"]', 'Jane Smith');
    await page.selectOption('select[name="profession"]', 'model');
    await page.fill('input[name="email"]', 'jane@example.com');
    await page.click('button:has-text("Continue")');

    // Go to Step 2
    await expect(page.getByText('Choose Template')).toBeVisible();
    
    // Go back to Step 1
    await page.click('button:has-text("Back")');
    await expect(page.getByText('Basic Information')).toBeVisible();
    
    // Verify form data is preserved
    await expect(page.locator('input[name="fullName"]')).toHaveValue('Jane Smith');
    await expect(page.locator('select[name="profession"]')).toHaveValue('model');
    await expect(page.locator('input[name="email"]')).toHaveValue('jane@example.com');
  });

  test('should show progress indicator', async ({ page }) => {
    // Check initial progress
    await expect(page.locator('[data-testid="progress-step-1"]')).toHaveClass(/active/);
    await expect(page.locator('[data-testid="progress-step-2"]')).not.toHaveClass(/active/);
    
    // Complete Step 1
    await page.fill('input[name="fullName"]', 'Test User');
    await page.selectOption('select[name="profession"]', 'actor');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.click('button:has-text("Continue")');
    
    // Check progress updated
    await expect(page.locator('[data-testid="progress-step-1"]')).toHaveClass(/completed/);
    await expect(page.locator('[data-testid="progress-step-2"]')).toHaveClass(/active/);
  });

  test('should handle template preview', async ({ page }) => {
    // Navigate to template selection
    await page.fill('input[name="fullName"]', 'Preview Test');
    await page.selectOption('select[name="profession"]', 'actor');
    await page.fill('input[name="email"]', 'preview@example.com');
    await page.click('button:has-text("Continue")');
    
    // Wait for templates to load
    await page.waitForSelector('[data-testid="template-t1"]');
    
    // Hover over template to see preview
    await page.hover('[data-testid="template-t1"]');
    await expect(page.locator('[data-testid="template-preview"]')).toBeVisible();
    
    // Click to select template
    await page.click('[data-testid="template-t1"]');
    await expect(page.locator('[data-testid="template-t1"]')).toHaveClass(/selected/);
  });

  test('should handle character limits in bio section', async ({ page }) => {
    // Navigate to bio section
    await page.fill('input[name="fullName"]', 'Bio Test');
    await page.selectOption('select[name="profession"]', 'actor');
    await page.fill('input[name="email"]', 'bio@example.com');
    await page.click('button:has-text("Continue")');
    
    await page.waitForSelector('[data-testid="template-t1"]');
    await page.click('[data-testid="template-t1"]');
    await page.click('button:has-text("Continue")');
    
    // Test character counter
    const bioText = 'a'.repeat(100);
    await page.fill('textarea[name="bio"]', bioText);
    await expect(page.getByText('100 / 500')).toBeVisible();
    
    // Test character limit
    const exceedsLimit = 'a'.repeat(501);
    await page.fill('textarea[name="bio"]', exceedsLimit);
    await expect(page.getByText('Bio is too long')).toBeVisible();
  });

  test('should handle authentication requirement', async ({ page }) => {
    // Mock unauthenticated state
    await page.route('**/api/auth/**', route => {
      route.fulfill({
        status: 401,
        body: JSON.stringify({ error: 'Unauthorized' })
      });
    });
    
    // Try to create portfolio
    await page.fill('input[name="fullName"]', 'Auth Test');
    await page.selectOption('select[name="profession"]', 'actor');
    await page.fill('input[name="email"]', 'auth@example.com');
    await page.click('button:has-text("Continue")');
    
    await page.waitForSelector('[data-testid="template-t1"]');
    await page.click('[data-testid="template-t1"]');
    await page.click('button:has-text("Continue")');
    
    await page.fill('textarea[name="bio"]', 'Test bio');
    await page.click('button:has-text("Continue")');
    
    // Should redirect to authentication
    await expect(page.getByText('Please sign in to continue')).toBeVisible();
  });

  test('should handle errors gracefully', async ({ page }) => {
    // Mock server error
    await page.route('**/api/portfolios', route => {
      route.fulfill({
        status: 500,
        body: JSON.stringify({ error: 'Server error' })
      });
    });
    
    // Complete the flow
    await page.fill('input[name="fullName"]', 'Error Test');
    await page.selectOption('select[name="profession"]', 'actor');
    await page.fill('input[name="email"]', 'error@example.com');
    await page.click('button:has-text("Continue")');
    
    await page.waitForSelector('[data-testid="template-t1"]');
    await page.click('[data-testid="template-t1"]');
    await page.click('button:has-text("Continue")');
    
    await page.fill('textarea[name="bio"]', 'Test bio');
    await page.click('button:has-text("Continue")');
    
    await page.click('button:has-text("Create Portfolio")');
    
    // Should show error message
    await expect(page.getByText('Failed to create portfolio')).toBeVisible();
  });

  test('should be mobile responsive', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Check mobile layout
    await expect(page.locator('[data-testid="mobile-header"]')).toBeVisible();
    await expect(page.locator('[data-testid="progress-indicator"]')).toBeVisible();
    
    // Test form interaction on mobile
    await page.fill('input[name="fullName"]', 'Mobile Test');
    await page.selectOption('select[name="profession"]', 'model');
    await page.fill('input[name="email"]', 'mobile@example.com');
    
    // Scroll to continue button
    await page.locator('button:has-text("Continue")').scrollIntoViewIfNeeded();
    await page.click('button:has-text("Continue")');
    
    await expect(page.getByText('Choose Template')).toBeVisible();
  });

  test('should handle keyboard navigation', async ({ page }) => {
    // Test tab navigation
    await page.press('body', 'Tab');
    await expect(page.locator('input[name="fullName"]')).toBeFocused();
    
    await page.press('body', 'Tab');
    await expect(page.locator('select[name="profession"]')).toBeFocused();
    
    await page.press('body', 'Tab');
    await expect(page.locator('input[name="location"]')).toBeFocused();
    
    // Test form submission with Enter
    await page.fill('input[name="fullName"]', 'Keyboard Test');
    await page.selectOption('select[name="profession"]', 'actor');
    await page.fill('input[name="email"]', 'keyboard@example.com');
    await page.press('button:has-text("Continue")', 'Enter');
    
    await expect(page.getByText('Choose Template')).toBeVisible();
  });

  test('should persist form data across page refreshes', async ({ page }) => {
    // Fill form data
    await page.fill('input[name="fullName"]', 'Persist Test');
    await page.selectOption('select[name="profession"]', 'artist');
    await page.fill('input[name="location"]', 'San Francisco, CA');
    await page.fill('input[name="email"]', 'persist@example.com');
    
    // Refresh page
    await page.reload();
    
    // Check if form data is restored
    await expect(page.locator('input[name="fullName"]')).toHaveValue('Persist Test');
    await expect(page.locator('select[name="profession"]')).toHaveValue('artist');
    await expect(page.locator('input[name="location"]')).toHaveValue('San Francisco, CA');
    await expect(page.locator('input[name="email"]')).toHaveValue('persist@example.com');
  });
});