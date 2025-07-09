import { render, RenderResult } from '@testing-library/react';
import { ReactElement } from 'react';

/**
 * Accessibility testing utilities for ensuring components meet WCAG guidelines
 */

export interface AccessibilityTestOptions {
  skipColorContrast?: boolean;
  skipAriaLabels?: boolean;
  skipKeyboardNavigation?: boolean;
  skipFocusManagement?: boolean;
  skipSemanticHTML?: boolean;
}

export interface AccessibilityTestResult {
  passed: boolean;
  errors: string[];
  warnings: string[];
  suggestions: string[];
}

/**
 * Comprehensive accessibility test suite
 */
export async function testAccessibility(
  component: ReactElement,
  options: AccessibilityTestOptions = {}
): Promise<AccessibilityTestResult> {
  const { container } = render(component);
  const result: AccessibilityTestResult = {
    passed: true,
    errors: [],
    warnings: [],
    suggestions: [],
  };

  // Test semantic HTML structure
  if (!options.skipSemanticHTML) {
    const semanticResults = testSemanticHTML(container);
    result.errors.push(...semanticResults.errors);
    result.warnings.push(...semanticResults.warnings);
    result.suggestions.push(...semanticResults.suggestions);
  }

  // Test ARIA labels and attributes
  if (!options.skipAriaLabels) {
    const ariaResults = testAriaLabels(container);
    result.errors.push(...ariaResults.errors);
    result.warnings.push(...ariaResults.warnings);
    result.suggestions.push(...ariaResults.suggestions);
  }

  // Test keyboard navigation
  if (!options.skipKeyboardNavigation) {
    const keyboardResults = testKeyboardNavigation(container);
    result.errors.push(...keyboardResults.errors);
    result.warnings.push(...keyboardResults.warnings);
    result.suggestions.push(...keyboardResults.suggestions);
  }

  // Test focus management
  if (!options.skipFocusManagement) {
    const focusResults = testFocusManagement(container);
    result.errors.push(...focusResults.errors);
    result.warnings.push(...focusResults.warnings);
    result.suggestions.push(...focusResults.suggestions);
  }

  // Test color contrast (basic checks)
  if (!options.skipColorContrast) {
    const contrastResults = testColorContrast(container);
    result.warnings.push(...contrastResults.warnings);
    result.suggestions.push(...contrastResults.suggestions);
  }

  result.passed = result.errors.length === 0;
  return result;
}

/**
 * Test semantic HTML structure
 */
function testSemanticHTML(container: HTMLElement): Omit<AccessibilityTestResult, 'passed'> {
  const errors: string[] = [];
  const warnings: string[] = [];
  const suggestions: string[] = [];

  // Check for proper heading hierarchy
  const headings = container.querySelectorAll('h1, h2, h3, h4, h5, h6');
  let previousLevel = 0;
  
  headings.forEach((heading, index) => {
    const currentLevel = parseInt(heading.tagName.charAt(1));
    
    if (index === 0 && currentLevel !== 1) {
      warnings.push('First heading should be h1');
    }
    
    if (currentLevel - previousLevel > 1) {
      errors.push(`Heading level jumps from h${previousLevel} to h${currentLevel}`);
    }
    
    previousLevel = currentLevel;
  });

  // Check for proper list structure
  const lists = container.querySelectorAll('ul, ol');
  lists.forEach((list) => {
    const directChildren = Array.from(list.children);
    const nonListItems = directChildren.filter(child => child.tagName !== 'LI');
    
    if (nonListItems.length > 0) {
      errors.push('Lists should only contain <li> elements as direct children');
    }
  });

  // Check for proper form structure
  const forms = container.querySelectorAll('form');
  forms.forEach((form) => {
    const inputs = form.querySelectorAll('input, textarea, select');
    inputs.forEach((input) => {
      const id = input.id;
      const label = form.querySelector(`label[for="${id}"]`);
      const ariaLabel = input.getAttribute('aria-label');
      const ariaLabelledBy = input.getAttribute('aria-labelledby');
      
      if (!label && !ariaLabel && !ariaLabelledBy) {
        errors.push(`Form input without proper label: ${input.outerHTML}`);
      }
    });
  });

  // Check for proper table structure
  const tables = container.querySelectorAll('table');
  tables.forEach((table) => {
    const headers = table.querySelectorAll('th');
    const hasCaption = table.querySelector('caption');
    
    if (headers.length === 0) {
      errors.push('Table without header cells');
    }
    
    if (!hasCaption) {
      suggestions.push('Consider adding a caption to table for better accessibility');
    }
  });

  return { errors, warnings, suggestions };
}

/**
 * Test ARIA labels and attributes
 */
function testAriaLabels(container: HTMLElement): Omit<AccessibilityTestResult, 'passed'> {
  const errors: string[] = [];
  const warnings: string[] = [];
  const suggestions: string[] = [];

  // Check for required ARIA labels
  const interactiveElements = container.querySelectorAll('button, [role="button"], a, input, textarea, select');
  
  interactiveElements.forEach((element) => {
    const hasAriaLabel = element.hasAttribute('aria-label');
    const hasAriaLabelledBy = element.hasAttribute('aria-labelledby');
    const hasTextContent = element.textContent?.trim().length > 0;
    const hasAltText = element.hasAttribute('alt');
    
    if (!hasAriaLabel && !hasAriaLabelledBy && !hasTextContent && !hasAltText) {
      errors.push(`Interactive element without accessible name: ${element.outerHTML}`);
    }
  });

  // Check for proper ARIA roles
  const customRoles = container.querySelectorAll('[role]');
  customRoles.forEach((element) => {
    const role = element.getAttribute('role');
    const validRoles = [
      'button', 'link', 'heading', 'listitem', 'list', 'menuitem', 'menu',
      'dialog', 'alertdialog', 'tab', 'tabpanel', 'tablist', 'navigation',
      'banner', 'contentinfo', 'main', 'complementary', 'form', 'search',
      'alert', 'status', 'progressbar', 'slider', 'spinbutton', 'checkbox',
      'radio', 'textbox', 'combobox', 'option', 'grid', 'cell', 'row',
      'columnheader', 'rowheader', 'img', 'figure', 'group', 'region'
    ];
    
    if (role && !validRoles.includes(role)) {
      warnings.push(`Unknown ARIA role: ${role}`);
    }
  });

  // Check for ARIA expanded on collapsible elements
  const collapsibleElements = container.querySelectorAll('[aria-expanded]');
  collapsibleElements.forEach((element) => {
    const expanded = element.getAttribute('aria-expanded');
    if (expanded !== 'true' && expanded !== 'false') {
      errors.push(`Invalid aria-expanded value: ${expanded}`);
    }
  });

  return { errors, warnings, suggestions };
}

/**
 * Test keyboard navigation
 */
function testKeyboardNavigation(container: HTMLElement): Omit<AccessibilityTestResult, 'passed'> {
  const errors: string[] = [];
  const warnings: string[] = [];
  const suggestions: string[] = [];

  // Check for focusable elements
  const focusableElements = container.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );

  focusableElements.forEach((element) => {
    const tabIndex = element.getAttribute('tabindex');
    
    // Check for positive tabindex values (anti-pattern)
    if (tabIndex && parseInt(tabIndex) > 0) {
      warnings.push(`Positive tabindex found: ${tabIndex}. Consider using 0 or -1`);
    }
    
    // Check if element is visible and focusable
    const style = window.getComputedStyle(element as Element);
    const isVisible = style.display !== 'none' && style.visibility !== 'hidden';
    const isDisabled = element.hasAttribute('disabled');
    
    if (!isVisible && !isDisabled && tabIndex !== '-1') {
      warnings.push('Hidden element is still focusable');
    }
  });

  // Check for skip links
  const skipLinks = container.querySelectorAll('a[href^="#"]');
  if (skipLinks.length === 0 && focusableElements.length > 5) {
    suggestions.push('Consider adding skip links for better keyboard navigation');
  }

  return { errors, warnings, suggestions };
}

/**
 * Test focus management
 */
function testFocusManagement(container: HTMLElement): Omit<AccessibilityTestResult, 'passed'> {
  const errors: string[] = [];
  const warnings: string[] = [];
  const suggestions: string[] = [];

  // Check for focus trapping in modals
  const modals = container.querySelectorAll('[role="dialog"], [role="alertdialog"]');
  modals.forEach((modal) => {
    const focusableElements = modal.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    if (focusableElements.length === 0) {
      errors.push('Modal without focusable elements');
    }
  });

  // Check for focus indicators
  const buttons = container.querySelectorAll('button, [role="button"]');
  buttons.forEach((button) => {
    const style = window.getComputedStyle(button as Element);
    // This is a basic check - in reality, you'd need to check CSS focus styles
    suggestions.push('Ensure focus indicators are visible and have sufficient contrast');
  });

  return { errors, warnings, suggestions };
}

/**
 * Test color contrast (basic checks)
 */
function testColorContrast(container: HTMLElement): Omit<AccessibilityTestResult, 'passed'> {
  const warnings: string[] = [];
  const suggestions: string[] = [];

  // This is a simplified check - in practice, you'd use a proper color contrast analyzer
  const textElements = container.querySelectorAll('p, span, div, h1, h2, h3, h4, h5, h6, a, button');
  
  textElements.forEach((element) => {
    const style = window.getComputedStyle(element as Element);
    const color = style.color;
    const backgroundColor = style.backgroundColor;
    
    // Basic check for transparent or very light colors
    if (color === 'rgba(0, 0, 0, 0)' || backgroundColor === 'rgba(0, 0, 0, 0)') {
      suggestions.push('Consider checking color contrast ratios for text elements');
    }
  });

  return { warnings, suggestions };
}

/**
 * Test screen reader compatibility
 */
export function testScreenReaderCompatibility(container: HTMLElement): AccessibilityTestResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const suggestions: string[] = [];

  // Check for aria-hidden on focusable elements
  const focusableHidden = container.querySelectorAll('[aria-hidden="true"] button, [aria-hidden="true"] [href], [aria-hidden="true"] input');
  if (focusableHidden.length > 0) {
    errors.push('Focusable elements should not have aria-hidden="true"');
  }

  // Check for empty links
  const links = container.querySelectorAll('a[href]');
  links.forEach((link) => {
    const hasText = link.textContent?.trim().length > 0;
    const hasAriaLabel = link.hasAttribute('aria-label');
    const hasAriaLabelledBy = link.hasAttribute('aria-labelledby');
    
    if (!hasText && !hasAriaLabel && !hasAriaLabelledBy) {
      errors.push('Empty link without accessible name');
    }
  });

  // Check for proper image alt text
  const images = container.querySelectorAll('img');
  images.forEach((img) => {
    const alt = img.getAttribute('alt');
    const role = img.getAttribute('role');
    
    if (alt === null && role !== 'presentation') {
      errors.push('Image without alt attribute');
    }
    
    if (alt === '') {
      // Empty alt is okay for decorative images
      suggestions.push('Empty alt attribute found - ensure this is intentional for decorative images');
    }
  });

  return {
    passed: errors.length === 0,
    errors,
    warnings,
    suggestions,
  };
}

/**
 * Quick accessibility check function for use in tests
 */
export function expectAccessible(component: ReactElement, options?: AccessibilityTestOptions): Promise<void> {
  return testAccessibility(component, options).then((result) => {
    if (!result.passed) {
      throw new Error(`Accessibility test failed:\n${result.errors.join('\n')}`);
    }
  });
}

/**
 * Check if element has proper ARIA attributes
 */
export function hasProperAriaAttributes(element: HTMLElement): boolean {
  // Check for common ARIA attribute patterns
  const role = element.getAttribute('role');
  const ariaLabel = element.getAttribute('aria-label');
  const ariaLabelledBy = element.getAttribute('aria-labelledby');
  const ariaDescribedBy = element.getAttribute('aria-describedby');
  
  // If element has a role, it should have proper labeling
  if (role && !ariaLabel && !ariaLabelledBy && !element.textContent?.trim()) {
    return false;
  }
  
  return true;
}

/**
 * Check if element is keyboard accessible
 */
export function isKeyboardAccessible(element: HTMLElement): boolean {
  const tabIndex = element.getAttribute('tabindex');
  const tagName = element.tagName.toLowerCase();
  
  // Naturally focusable elements
  const naturallyFocusable = [
    'a', 'button', 'input', 'textarea', 'select', 'details', 'summary'
  ];
  
  if (naturallyFocusable.includes(tagName)) {
    return tabIndex !== '-1';
  }
  
  // Elements with explicit tabindex
  return tabIndex !== null && tabIndex !== '-1';
}

/**
 * Export all utility functions for individual use
 */
export {
  testSemanticHTML,
  testAriaLabels,
  testKeyboardNavigation,
  testFocusManagement,
  testColorContrast,
};