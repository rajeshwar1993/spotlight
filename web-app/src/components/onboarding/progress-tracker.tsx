'use client';

import { motion } from 'framer-motion';
import { Check, Circle } from 'lucide-react';

interface ProgressTrackerProps {
  currentStep: number;
  totalSteps: number;
  completedSteps: number[];
  stepNames?: string[];
}

const DEFAULT_STEP_NAMES = [
  'Welcome',
  'Profile',
  'Template',
  'Features',
  'Portfolio',
  'Complete'
];

export function ProgressTracker({ 
  currentStep, 
  totalSteps, 
  completedSteps,
  stepNames = DEFAULT_STEP_NAMES 
}: ProgressTrackerProps) {
  const progressPercentage = ((currentStep + 1) / totalSteps) * 100;

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Progress Bar */}
      <div className="relative mb-8">
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-spotlight-500 to-spotlight-600 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progressPercentage}%` }}
            transition={{ duration: 0.5, ease: 'easeInOut' }}
          />
        </div>
        
        {/* Progress Text */}
        <div className="flex justify-between mt-2 text-sm text-muted-foreground">
          <span>Step {currentStep + 1} of {totalSteps}</span>
          <span>{Math.round(progressPercentage)}% complete</span>
        </div>
      </div>

      {/* Step Indicators */}
      <div className="flex items-center justify-between">
        {Array.from({ length: totalSteps }, (_, index) => {
          const isCompleted = completedSteps.includes(index);
          const isCurrent = index === currentStep;
          const isPast = index < currentStep;
          
          return (
            <div key={index} className="flex items-center">
              {/* Step Circle */}
              <motion.div
                className={`
                  relative w-10 h-10 rounded-full flex items-center justify-center
                  transition-all duration-300 border-2
                  ${
                    isCompleted 
                      ? 'bg-green-500 border-green-500 text-white'
                      : isCurrent
                        ? 'bg-spotlight-600 border-spotlight-600 text-white'
                        : isPast
                          ? 'bg-spotlight-100 border-spotlight-300 text-spotlight-600'
                          : 'bg-gray-100 border-gray-300 text-gray-400'
                  }
                `}
                initial={{ scale: 0.8 }}
                animate={{ 
                  scale: isCurrent ? 1.1 : 1,
                }}
                transition={{ duration: 0.3 }}
              >
                {isCompleted ? (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    <Check className="h-5 w-5" />
                  </motion.div>
                ) : (
                  <span className="text-sm font-medium">{index + 1}</span>
                )}
                
                {/* Current step pulse effect */}
                {isCurrent && (
                  <motion.div
                    className="absolute inset-0 rounded-full border-2 border-spotlight-600"
                    animate={{
                      scale: [1, 1.2, 1],
                      opacity: [0.7, 0, 0.7],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    }}
                  />
                )}
              </motion.div>

              {/* Step Label */}
              <div className="ml-3 min-w-0 flex-1">
                <motion.p
                  className={`
                    text-sm font-medium transition-colors
                    ${
                      isCompleted
                        ? 'text-green-600'
                        : isCurrent
                          ? 'text-spotlight-600'
                          : isPast
                            ? 'text-spotlight-500'
                            : 'text-gray-400'
                    }
                  `}
                  animate={{
                    scale: isCurrent ? 1.05 : 1,
                  }}
                  transition={{ duration: 0.3 }}
                >
                  {stepNames[index]}
                </motion.p>
                
                {/* Step Status */}
                <p className={`
                  text-xs transition-colors
                  ${
                    isCompleted
                      ? 'text-green-500'
                      : isCurrent
                        ? 'text-spotlight-500'
                        : 'text-gray-400'
                  }
                `}>
                  {isCompleted 
                    ? 'Completed' 
                    : isCurrent 
                      ? 'In Progress' 
                      : isPast 
                        ? 'Completed'
                        : 'Pending'
                  }
                </p>
              </div>

              {/* Connection Line */}
              {index < totalSteps - 1 && (
                <div className="flex-1 mx-4">
                  <div className="relative">
                    <div className="h-0.5 bg-gray-200 w-full" />
                    <motion.div
                      className="h-0.5 bg-spotlight-600 absolute top-0 left-0"
                      initial={{ width: '0%' }}
                      animate={{ 
                        width: index < currentStep ? '100%' : '0%'
                      }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                    />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Motivational Message */}
      <motion.div
        className="mt-6 text-center"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        {currentStep === 0 && (
          <p className="text-sm text-muted-foreground">
            Let's get you started with a professional portfolio
          </p>
        )}
        {currentStep === 1 && (
          <p className="text-sm text-muted-foreground">
            Tell us about yourself and your professional background
          </p>
        )}
        {currentStep === 2 && (
          <p className="text-sm text-muted-foreground">
            Choose a template that represents your style
          </p>
        )}
        {currentStep === 3 && (
          <p className="text-sm text-muted-foreground">
            Discover the powerful features that will help you succeed
          </p>
        )}
        {currentStep === 4 && (
          <p className="text-sm text-muted-foreground">
            You're ready to create your first portfolio!
          </p>
        )}
        {currentStep === 5 && (
          <p className="text-sm text-spotlight-600 font-medium">
            🎉 Congratulations! You're all set up and ready to go
          </p>
        )}
      </motion.div>

      {/* Time Estimate */}
      <motion.div
        className="mt-4 text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
      >
        <div className="inline-flex items-center space-x-2 text-xs text-muted-foreground bg-gray-50 px-3 py-1 rounded-full">
          <Circle className="h-3 w-3 fill-current" />
          <span>
            {totalSteps - currentStep - 1} steps remaining • ~{(totalSteps - currentStep - 1) * 1} minute{totalSteps - currentStep - 1 !== 1 ? 's' : ''}
          </span>
        </div>
      </motion.div>
    </div>
  );
}