import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';

describe('Basic Test Setup', () => {
  it('should render a simple component', () => {
    render(<div>Hello World</div>);
    expect(screen.getByText('Hello World')).toBeInTheDocument();
  });

  it('should handle basic assertions', () => {
    expect(1 + 1).toBe(2);
    expect('hello').toMatch(/hello/);
    expect([1, 2, 3]).toContain(2);
  });

  it('should work with async/await', async () => {
    const promise = Promise.resolve('test');
    await expect(promise).resolves.toBe('test');
  });
});