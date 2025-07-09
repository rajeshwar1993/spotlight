import { describe, it, expect, vi } from 'vitest';
import { render, screen, simulateUserInteraction, waitFor } from '@/test/utils';
import { Step1BasicInfo } from '../step-1-basic-info';

// Mock portfolio creation context
const mockUpdateFormData = vi.fn();
const mockNextStep = vi.fn();

const mockPortfolioCreationContext = {
  formData: {
    basicInfo: {
      fullName: '',
      profession: '',
      location: '',
      email: '',
      phone: '',
    },
    templateSelection: {
      templateId: '',
    },
    bioDetails: {
      bio: '',
      experience: '',
      skills: [],
      achievements: [],
    },
    images: [],
  },
  updateFormData: mockUpdateFormData,
  nextStep: mockNextStep,
  previousStep: vi.fn(),
  currentStep: 1,
  isStepValid: vi.fn(() => true),
};

vi.mock('../portfolio-creation-context', () => ({
  usePortfolioCreation: () => mockPortfolioCreationContext,
}));

describe('Step1BasicInfo Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders all form fields', () => {
    render(<Step1BasicInfo />);
    
    expect(screen.getByLabelText(/full name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/profession/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/location/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/phone/i)).toBeInTheDocument();
  });

  it('validates required fields', async () => {
    render(<Step1BasicInfo />);
    
    const continueButton = screen.getByRole('button', { name: /continue/i });
    await simulateUserInteraction(continueButton, 'click');
    
    expect(await screen.findByText(/full name is required/i)).toBeInTheDocument();
    expect(await screen.findByText(/profession is required/i)).toBeInTheDocument();
    expect(await screen.findByText(/email is required/i)).toBeInTheDocument();
    expect(mockNextStep).not.toHaveBeenCalled();
  });

  it('validates email format', async () => {
    render(<Step1BasicInfo />);
    
    const emailInput = screen.getByLabelText(/email/i);
    const continueButton = screen.getByRole('button', { name: /continue/i });
    
    await simulateUserInteraction(emailInput, 'type', 'invalid-email');
    await simulateUserInteraction(continueButton, 'click');
    
    expect(await screen.findByText(/invalid email/i)).toBeInTheDocument();
    expect(mockNextStep).not.toHaveBeenCalled();
  });

  it('validates phone number format', async () => {
    render(<Step1BasicInfo />);
    
    const phoneInput = screen.getByLabelText(/phone/i);
    const continueButton = screen.getByRole('button', { name: /continue/i });
    
    await simulateUserInteraction(phoneInput, 'type', '123');
    await simulateUserInteraction(continueButton, 'click');
    
    expect(await screen.findByText(/invalid phone number/i)).toBeInTheDocument();
    expect(mockNextStep).not.toHaveBeenCalled();
  });

  it('updates form data on input change', async () => {
    render(<Step1BasicInfo />);
    
    const fullNameInput = screen.getByLabelText(/full name/i);
    await simulateUserInteraction(fullNameInput, 'type', 'John Doe');
    
    await waitFor(() => {
      expect(mockUpdateFormData).toHaveBeenCalledWith('basicInfo', {
        fullName: 'John Doe',
      });
    });
  });

  it('shows profession dropdown options', async () => {
    render(<Step1BasicInfo />);
    
    const professionSelect = screen.getByLabelText(/profession/i);
    await simulateUserInteraction(professionSelect, 'click');
    
    expect(screen.getByText(/actor/i)).toBeInTheDocument();
    expect(screen.getByText(/model/i)).toBeInTheDocument();
    expect(screen.getByText(/photographer/i)).toBeInTheDocument();
    expect(screen.getByText(/artist/i)).toBeInTheDocument();
  });

  it('submits form with valid data', async () => {
    render(<Step1BasicInfo />);
    
    const fullNameInput = screen.getByLabelText(/full name/i);
    const professionSelect = screen.getByLabelText(/profession/i);
    const locationInput = screen.getByLabelText(/location/i);
    const emailInput = screen.getByLabelText(/email/i);
    const phoneInput = screen.getByLabelText(/phone/i);
    const continueButton = screen.getByRole('button', { name: /continue/i });
    
    await simulateUserInteraction(fullNameInput, 'type', 'John Doe');
    await simulateUserInteraction(professionSelect, 'click');
    await simulateUserInteraction(screen.getByText(/actor/i), 'click');
    await simulateUserInteraction(locationInput, 'type', 'New York, NY');
    await simulateUserInteraction(emailInput, 'type', 'john@example.com');
    await simulateUserInteraction(phoneInput, 'type', '+1234567890');
    await simulateUserInteraction(continueButton, 'click');
    
    await waitFor(() => {
      expect(mockUpdateFormData).toHaveBeenCalledWith('basicInfo', {
        fullName: 'John Doe',
        profession: 'actor',
        location: 'New York, NY',
        email: 'john@example.com',
        phone: '+1234567890',
      });
      expect(mockNextStep).toHaveBeenCalled();
    });
  });

  it('shows character count for text fields', async () => {
    render(<Step1BasicInfo />);
    
    const fullNameInput = screen.getByLabelText(/full name/i);
    await simulateUserInteraction(fullNameInput, 'type', 'John Doe');
    
    expect(screen.getByText(/8 \/ 100/)).toBeInTheDocument();
  });

  it('prevents submission when character limits are exceeded', async () => {
    render(<Step1BasicInfo />);
    
    const fullNameInput = screen.getByLabelText(/full name/i);
    const continueButton = screen.getByRole('button', { name: /continue/i });
    
    const longName = 'a'.repeat(101);
    await simulateUserInteraction(fullNameInput, 'type', longName);
    await simulateUserInteraction(continueButton, 'click');
    
    expect(await screen.findByText(/full name is too long/i)).toBeInTheDocument();
    expect(mockNextStep).not.toHaveBeenCalled();
  });

  it('auto-saves form data on change', async () => {
    render(<Step1BasicInfo />);
    
    const fullNameInput = screen.getByLabelText(/full name/i);
    await simulateUserInteraction(fullNameInput, 'type', 'John');
    
    // Should auto-save after debounce
    await waitFor(() => {
      expect(mockUpdateFormData).toHaveBeenCalledWith('basicInfo', {
        fullName: 'John',
      });
    }, { timeout: 3000 });
  });

  it('shows loading state during submission', async () => {
    mockNextStep.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 1000)));
    
    render(<Step1BasicInfo />);
    
    const fullNameInput = screen.getByLabelText(/full name/i);
    const professionSelect = screen.getByLabelText(/profession/i);
    const emailInput = screen.getByLabelText(/email/i);
    const continueButton = screen.getByRole('button', { name: /continue/i });
    
    await simulateUserInteraction(fullNameInput, 'type', 'John Doe');
    await simulateUserInteraction(professionSelect, 'click');
    await simulateUserInteraction(screen.getByText(/actor/i), 'click');
    await simulateUserInteraction(emailInput, 'type', 'john@example.com');
    await simulateUserInteraction(continueButton, 'click');
    
    expect(screen.getByText(/continuing/i)).toBeInTheDocument();
    expect(continueButton).toBeDisabled();
  });

  it('handles form errors gracefully', async () => {
    mockNextStep.mockRejectedValue(new Error('Validation failed'));
    
    render(<Step1BasicInfo />);
    
    const fullNameInput = screen.getByLabelText(/full name/i);
    const professionSelect = screen.getByLabelText(/profession/i);
    const emailInput = screen.getByLabelText(/email/i);
    const continueButton = screen.getByRole('button', { name: /continue/i });
    
    await simulateUserInteraction(fullNameInput, 'type', 'John Doe');
    await simulateUserInteraction(professionSelect, 'click');
    await simulateUserInteraction(screen.getByText(/actor/i), 'click');
    await simulateUserInteraction(emailInput, 'type', 'john@example.com');
    await simulateUserInteraction(continueButton, 'click');
    
    expect(await screen.findByText(/validation failed/i)).toBeInTheDocument();
  });

  it('is accessible', async () => {
    render(<Step1BasicInfo />);
    
    const form = screen.getByRole('form');
    expect(form).toBeInTheDocument();
    
    const fullNameInput = screen.getByLabelText(/full name/i);
    const professionSelect = screen.getByLabelText(/profession/i);
    const emailInput = screen.getByLabelText(/email/i);
    
    expect(fullNameInput).toHaveAttribute('type', 'text');
    expect(fullNameInput).toHaveAttribute('required');
    expect(professionSelect).toHaveAttribute('required');
    expect(emailInput).toHaveAttribute('type', 'email');
    expect(emailInput).toHaveAttribute('required');
  });

  it('restores form data from context on mount', () => {
    const mockContextWithData = {
      ...mockPortfolioCreationContext,
      formData: {
        ...mockPortfolioCreationContext.formData,
        basicInfo: {
          fullName: 'Jane Doe',
          profession: 'model',
          location: 'Los Angeles, CA',
          email: 'jane@example.com',
          phone: '+1987654321',
        },
      },
    };
    
    vi.mocked(mockPortfolioCreationContext).mockReturnValue(mockContextWithData);
    
    render(<Step1BasicInfo />);
    
    expect(screen.getByDisplayValue('Jane Doe')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Los Angeles, CA')).toBeInTheDocument();
    expect(screen.getByDisplayValue('jane@example.com')).toBeInTheDocument();
    expect(screen.getByDisplayValue('+1987654321')).toBeInTheDocument();
  });
});