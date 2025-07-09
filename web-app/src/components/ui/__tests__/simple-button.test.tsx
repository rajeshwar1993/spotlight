import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

// Simple button component for testing
const SimpleButton = ({ 
  children, 
  onClick, 
  disabled = false,
  className = '',
  variant = 'default'
}: {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  variant?: 'default' | 'primary' | 'secondary';
}) => {
  return (
    <button 
      onClick={onClick}
      disabled={disabled}
      className={`btn btn-${variant} ${className}`}
    >
      {children}
    </button>
  );
};

describe('SimpleButton Component', () => {
  it('renders with default props', () => {
    render(<SimpleButton>Click me</SimpleButton>);
    
    const button = screen.getByRole('button', { name: 'Click me' });
    expect(button).toBeInTheDocument();
    expect(button).toHaveClass('btn', 'btn-default');
  });

  it('handles click events', async () => {
    const handleClick = vi.fn();
    render(<SimpleButton onClick={handleClick}>Click me</SimpleButton>);
    
    const button = screen.getByRole('button', { name: 'Click me' });
    button.click();
    
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('can be disabled', () => {
    render(<SimpleButton disabled>Disabled</SimpleButton>);
    
    const button = screen.getByRole('button', { name: 'Disabled' });
    expect(button).toBeDisabled();
  });

  it('applies custom className', () => {
    render(<SimpleButton className="custom-class">Custom</SimpleButton>);
    
    const button = screen.getByRole('button', { name: 'Custom' });
    expect(button).toHaveClass('custom-class');
  });

  it('supports different variants', () => {
    const { rerender } = render(<SimpleButton variant="primary">Primary</SimpleButton>);
    expect(screen.getByRole('button')).toHaveClass('btn-primary');

    rerender(<SimpleButton variant="secondary">Secondary</SimpleButton>);
    expect(screen.getByRole('button')).toHaveClass('btn-secondary');
  });

  it('is accessible', () => {
    render(<SimpleButton>Accessible button</SimpleButton>);
    
    const button = screen.getByRole('button', { name: 'Accessible button' });
    expect(button).toBeInTheDocument();
  });
});