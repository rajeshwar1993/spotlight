import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, simulateUserInteraction, waitFor } from '@/test/utils';
import { SigninForm } from '../signin-form';

// Mock the auth hook
const mockSignIn = vi.fn();
vi.mock('@/hooks/use-auth', () => ({
  useAuth: () => ({
    signIn: mockSignIn,
    loading: false,
  }),
}));

describe('SigninForm Component', () => {
  beforeEach(() => {
    mockSignIn.mockClear();
  });

  it('renders signin form fields', () => {
    render(<SigninForm />);
    
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  it('validates required fields', async () => {
    render(<SigninForm />);
    
    const submitButton = screen.getByRole('button', { name: /sign in/i });
    await simulateUserInteraction(submitButton, 'click');
    
    expect(await screen.findByText(/email is required/i)).toBeInTheDocument();
    expect(await screen.findByText(/password is required/i)).toBeInTheDocument();
    expect(mockSignIn).not.toHaveBeenCalled();
  });

  it('validates email format', async () => {
    render(<SigninForm />);
    
    const emailInput = screen.getByLabelText(/email/i);
    const submitButton = screen.getByRole('button', { name: /sign in/i });
    
    await simulateUserInteraction(emailInput, 'type', 'invalid-email');
    await simulateUserInteraction(submitButton, 'click');
    
    expect(await screen.findByText(/invalid email/i)).toBeInTheDocument();
    expect(mockSignIn).not.toHaveBeenCalled();
  });

  it('validates password length', async () => {
    render(<SigninForm />);
    
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /sign in/i });
    
    await simulateUserInteraction(passwordInput, 'type', '123');
    await simulateUserInteraction(submitButton, 'click');
    
    expect(await screen.findByText(/password must be at least/i)).toBeInTheDocument();
    expect(mockSignIn).not.toHaveBeenCalled();
  });

  it('submits form with valid data', async () => {
    mockSignIn.mockResolvedValueOnce({ success: true });
    
    render(<SigninForm />);
    
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /sign in/i });
    
    await simulateUserInteraction(emailInput, 'type', 'test@example.com');
    await simulateUserInteraction(passwordInput, 'type', 'password123');
    await simulateUserInteraction(submitButton, 'click');
    
    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      });
    });
  });

  it('displays error message on signin failure', async () => {
    mockSignIn.mockResolvedValueOnce({ 
      success: false, 
      error: 'Invalid credentials' 
    });
    
    render(<SigninForm />);
    
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /sign in/i });
    
    await simulateUserInteraction(emailInput, 'type', 'test@example.com');
    await simulateUserInteraction(passwordInput, 'type', 'wrongpassword');
    await simulateUserInteraction(submitButton, 'click');
    
    expect(await screen.findByText(/invalid credentials/i)).toBeInTheDocument();
  });

  it('shows loading state during signin', async () => {
    mockSignIn.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 1000)));
    
    render(<SigninForm />);
    
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /sign in/i });
    
    await simulateUserInteraction(emailInput, 'type', 'test@example.com');
    await simulateUserInteraction(passwordInput, 'type', 'password123');
    await simulateUserInteraction(submitButton, 'click');
    
    expect(screen.getByText(/signing in/i)).toBeInTheDocument();
    expect(submitButton).toBeDisabled();
  });

  it('has forgot password link', () => {
    render(<SigninForm />);
    
    const forgotPasswordLink = screen.getByRole('link', { name: /forgot password/i });
    expect(forgotPasswordLink).toBeInTheDocument();
    expect(forgotPasswordLink).toHaveAttribute('href', '/auth/reset-password');
  });

  it('has signup link', () => {
    render(<SigninForm />);
    
    const signupLink = screen.getByRole('link', { name: /sign up/i });
    expect(signupLink).toBeInTheDocument();
    expect(signupLink).toHaveAttribute('href', '/auth/signup');
  });

  it('handles keyboard navigation', async () => {
    render(<SigninForm />);
    
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /sign in/i });
    
    emailInput.focus();
    expect(emailInput).toHaveFocus();
    
    // Tab to password field
    await simulateUserInteraction(emailInput, 'type', 'test@example.com');
    passwordInput.focus();
    expect(passwordInput).toHaveFocus();
    
    // Tab to submit button
    await simulateUserInteraction(passwordInput, 'type', 'password123');
    submitButton.focus();
    expect(submitButton).toHaveFocus();
  });

  it('shows/hides password when toggle is clicked', async () => {
    render(<SigninForm />);
    
    const passwordInput = screen.getByLabelText(/password/i);
    const toggleButton = screen.getByRole('button', { name: /show password/i });
    
    expect(passwordInput).toHaveAttribute('type', 'password');
    
    await simulateUserInteraction(toggleButton, 'click');
    expect(passwordInput).toHaveAttribute('type', 'text');
    
    await simulateUserInteraction(toggleButton, 'click');
    expect(passwordInput).toHaveAttribute('type', 'password');
  });

  it('is accessible', () => {
    render(<SigninForm />);
    
    const form = screen.getByRole('form');
    expect(form).toBeInTheDocument();
    
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    
    expect(emailInput).toHaveAttribute('type', 'email');
    expect(emailInput).toHaveAttribute('autoComplete', 'email');
    expect(passwordInput).toHaveAttribute('type', 'password');
    expect(passwordInput).toHaveAttribute('autoComplete', 'current-password');
  });

  it('prevents multiple submissions', async () => {
    mockSignIn.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 1000)));
    
    render(<SigninForm />);
    
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /sign in/i });
    
    await simulateUserInteraction(emailInput, 'type', 'test@example.com');
    await simulateUserInteraction(passwordInput, 'type', 'password123');
    
    // Click submit button multiple times
    await simulateUserInteraction(submitButton, 'click');
    await simulateUserInteraction(submitButton, 'click');
    await simulateUserInteraction(submitButton, 'click');
    
    expect(mockSignIn).toHaveBeenCalledTimes(1);
  });
});