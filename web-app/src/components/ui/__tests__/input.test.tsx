import { describe, it, expect, vi } from 'vitest';
import { render, screen, simulateUserInteraction } from '@/test/utils';
import { Input } from '../input';

describe('Input Component', () => {
  it('renders with default props', () => {
    render(<Input placeholder="Enter text" />);
    
    const input = screen.getByPlaceholderText('Enter text');
    expect(input).toBeInTheDocument();
    expect(input).toHaveClass('flex');
  });

  it('handles value changes', async () => {
    const handleChange = vi.fn();
    render(<Input onChange={handleChange} />);
    
    const input = screen.getByRole('textbox');
    await simulateUserInteraction(input, 'type', 'Hello world');
    
    expect(handleChange).toHaveBeenCalled();
  });

  it('can be disabled', () => {
    render(<Input disabled />);
    
    const input = screen.getByRole('textbox');
    expect(input).toBeDisabled();
    expect(input).toHaveClass('disabled:cursor-not-allowed');
  });

  it('supports different input types', () => {
    const { rerender } = render(<Input type="email" />);
    expect(screen.getByRole('textbox')).toHaveAttribute('type', 'email');

    rerender(<Input type="password" />);
    expect(screen.getByLabelText(/password/i) || screen.getByDisplayValue('')).toHaveAttribute('type', 'password');

    rerender(<Input type="number" />);
    expect(screen.getByRole('spinbutton')).toHaveAttribute('type', 'number');
  });

  it('applies custom className', () => {
    render(<Input className="custom-class" />);
    
    const input = screen.getByRole('textbox');
    expect(input).toHaveClass('custom-class');
  });

  it('forwards ref correctly', () => {
    const ref = vi.fn();
    render(<Input ref={ref} />);
    
    expect(ref).toHaveBeenCalled();
  });

  it('supports controlled input', () => {
    const { rerender } = render(<Input value="controlled" readOnly />);
    
    const input = screen.getByRole('textbox');
    expect(input).toHaveValue('controlled');

    rerender(<Input value="updated" readOnly />);
    expect(input).toHaveValue('updated');
  });

  it('handles focus and blur events', async () => {
    const handleFocus = vi.fn();
    const handleBlur = vi.fn();
    
    render(<Input onFocus={handleFocus} onBlur={handleBlur} />);
    
    const input = screen.getByRole('textbox');
    
    input.focus();
    expect(handleFocus).toHaveBeenCalledTimes(1);
    
    input.blur();
    expect(handleBlur).toHaveBeenCalledTimes(1);
  });

  it('supports required attribute', () => {
    render(<Input required />);
    
    const input = screen.getByRole('textbox');
    expect(input).toBeRequired();
  });

  it('supports maxLength attribute', () => {
    render(<Input maxLength={10} />);
    
    const input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('maxLength', '10');
  });

  it('supports autoComplete attribute', () => {
    render(<Input autoComplete="email" />);
    
    const input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('autoComplete', 'email');
  });

  it('is accessible with aria attributes', () => {
    render(<Input aria-label="Email input" aria-describedby="email-help" />);
    
    const input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('aria-label', 'Email input');
    expect(input).toHaveAttribute('aria-describedby', 'email-help');
  });

  it('handles keyboard navigation', async () => {
    const handleKeyDown = vi.fn();
    render(<Input onKeyDown={handleKeyDown} />);
    
    const input = screen.getByRole('textbox');
    input.focus();
    
    // Simulate key press
    const event = new KeyboardEvent('keydown', { key: 'Enter' });
    input.dispatchEvent(event);
    
    expect(handleKeyDown).toHaveBeenCalledTimes(1);
  });

  it('clears input when clear button is clicked', async () => {
    const handleChange = vi.fn();
    render(<Input value="test" onChange={handleChange} />);
    
    const input = screen.getByRole('textbox');
    await simulateUserInteraction(input, 'clear');
    
    expect(handleChange).toHaveBeenCalled();
  });
});