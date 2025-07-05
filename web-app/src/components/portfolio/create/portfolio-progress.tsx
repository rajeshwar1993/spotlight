'use client';

import { useParams } from 'next/navigation';
import { cn } from '@/lib/utils';
import { usePortfolioCreation } from './portfolio-creation-context';

const steps = [
  {
    number: 1,
    title: 'Basic Info',
    description: 'Name, profession & location',
  },
  {
    number: 2,
    title: 'Template',
    description: 'Choose your design',
  },
  {
    number: 3,
    title: 'Details',
    description: 'Bio & portfolio title',
  },
];

export function PortfolioProgress() {
  const params = useParams();
  const { isStepValid, canProceedToStep } = usePortfolioCreation();
  
  const currentStep = params?.step ? parseInt(params.step as string) : 1;

  return (
    <div className="hidden sm:block">
      <nav aria-label="Portfolio creation progress">
        <ol className="flex items-center space-x-6">
          {steps.map((step, stepIdx) => {
            const isCurrentStep = step.number === currentStep;
            const isCompleted = step.number < currentStep && isStepValid(step.number);
            const isAccessible = canProceedToStep(step.number);

            return (
              <li key={step.number} className="flex items-center">
                {stepIdx !== 0 && (
                  <div
                    className={cn(
                      'h-0.5 w-16 mr-6',
                      isCompleted ? 'bg-blue-600' : 'bg-gray-300'
                    )}
                  />
                )}
                
                <div className="flex items-center space-x-3">
                  {/* Step Circle */}
                  <div
                    className={cn(
                      'flex h-10 w-10 items-center justify-center rounded-full border-2 text-sm font-medium',
                      {
                        'border-blue-600 bg-blue-600 text-white': isCurrentStep || isCompleted,
                        'border-gray-300 bg-white text-gray-500': !isCurrentStep && !isCompleted && isAccessible,
                        'border-gray-200 bg-gray-50 text-gray-400': !isAccessible,
                      }
                    )}
                  >
                    {isCompleted ? (
                      <svg
                        className="h-5 w-5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        aria-hidden="true"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    ) : (
                      <span>{step.number}</span>
                    )}
                  </div>

                  {/* Step Info */}
                  <div className="hidden lg:block">
                    <p
                      className={cn(
                        'text-sm font-medium',
                        {
                          'text-blue-600': isCurrentStep || isCompleted,
                          'text-gray-500': !isCurrentStep && !isCompleted && isAccessible,
                          'text-gray-400': !isAccessible,
                        }
                      )}
                    >
                      {step.title}
                    </p>
                    <p
                      className={cn(
                        'text-xs',
                        {
                          'text-gray-600': isCurrentStep || isCompleted,
                          'text-gray-400': !isCurrentStep && !isCompleted,
                        }
                      )}
                    >
                      {step.description}
                    </p>
                  </div>
                </div>
              </li>
            );
          })}
        </ol>
      </nav>

      {/* Mobile Progress Bar */}
      <div className="sm:hidden mt-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">
            Step {currentStep} of {steps.length}
          </span>
          <span className="text-gray-600">
            {steps[currentStep - 1]?.title}
          </span>
        </div>
        <div className="mt-2">
          <div className="flex rounded-full bg-gray-200 h-2">
            <div
              className="rounded-full bg-blue-600 h-2 transition-all duration-300 ease-in-out"
              style={{ width: `${(currentStep / steps.length) * 100}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}