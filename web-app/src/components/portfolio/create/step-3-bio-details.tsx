'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ValidatedInput } from '@/components/forms/validated-input';
import { ValidatedTextarea } from '@/components/forms/validated-textarea';
import { FieldRequirement, useCharacterRequirements, FieldProgress } from '@/components/forms/field-requirement';
import { ErrorMessage } from '@/components/forms/validation-message';
import { useAuth } from '@/hooks/use-auth';
import { useFormExitConfirmation } from '@/hooks/use-form-exit-confirmation';
import { usePortfolioCreation } from './portfolio-creation-context';
import { portfolioStep3Schema, type PortfolioStep3Form } from '@/lib/validations';
import { createPortfolio, generateSlug } from '@/lib/services/portfolio';
import { StepNavigation } from './step-navigation';
import { AuthGuard } from './auth-guard';
import { FORM_LIMITS } from '@/lib/constants';

export function Step3BioDetails() {
  const router = useRouter();
  const { user } = useAuth();
  const { state, updateStep3, setErrors, clearErrors, canProceedToStep, setSubmitting, setPortfolioId, clearStorage } = usePortfolioCreation();
  const [isLoading, setIsLoading] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const form = useForm<PortfolioStep3Form>({
    resolver: zodResolver(portfolioStep3Schema),
    defaultValues: state.formData.step3,
    mode: 'onChange',
  });

  const { register, handleSubmit, watch, formState: { errors, isValid, isDirty } } = form;

  // Form exit confirmation
  useFormExitConfirmation({
    hasUnsavedChanges: hasUnsavedChanges && isDirty,
    onConfirm: () => setHasUnsavedChanges(false),
  });

  // Watch form values
  const title = watch('title') || '';
  const bio = watch('bio') || '';

  // Character requirements
  const titleRequirements = useCharacterRequirements(
    title,
    FORM_LIMITS.title.min,
    FORM_LIMITS.title.max
  );

  const bioRequirements = useCharacterRequirements(
    bio,
    FORM_LIMITS.bio.min,
    FORM_LIMITS.bio.max
  );

  // Check if user can access this step
  useEffect(() => {
    if (!canProceedToStep(3)) {
      router.push('/create/step/1');
    }
  }, [canProceedToStep, router]);

  // Watch form changes and update context
  useEffect(() => {
    const subscription = watch((value) => {
      updateStep3(value as PortfolioStep3Form);
      clearErrors();
      setHasUnsavedChanges(true);
    });
    return () => subscription.unsubscribe();
  }, [watch, updateStep3, clearErrors]);

  // Auto-suggest portfolio title based on user name and profession
  useEffect(() => {
    if (!state.formData.step3.title && state.formData.step1.full_name && state.formData.step1.profession) {
      const suggestedTitle = `${state.formData.step1.full_name} - ${state.formData.step1.profession === 'BOTH' ? 'Actor & Model' : state.formData.step1.profession === 'ACTOR' ? 'Actor' : 'Model'}`;
      updateStep3({ title: suggestedTitle });
      form.setValue('title', suggestedTitle);
    }
  }, [state.formData.step1, state.formData.step3.title, updateStep3, form]);


  const onSubmit = async (data: PortfolioStep3Form) => {
    if (!user) {
      setErrors({ submit: 'You must be logged in to create a portfolio' });
      return;
    }

    setIsLoading(true);
    setSubmitting(true);
    clearErrors();

    try {
      // Validate all form data
      const validatedData = portfolioStep3Schema.parse(data);
      updateStep3(validatedData);

      // Generate portfolio slug
      const slug = await generateSlug(validatedData.title);

      // Create portfolio
      const portfolioData = {
        title: validatedData.title,
        slug,
        bio: validatedData.bio,
        template_type: state.formData.step2.template_type!,
        is_published: false, // Start as draft
      };

      const { data: portfolio, error } = await createPortfolio(user.id, portfolioData);

      if (error || !portfolio) {
        throw new Error(error?.message || 'Failed to create portfolio');
      }

      // Set portfolio ID in context for image upload step
      setPortfolioId(portfolio.id);

      // Clear form data from storage and unsaved changes
      clearStorage();
      setHasUnsavedChanges(false);

      // Redirect to image upload step
      router.push('/create/step/4');
    } catch (error) {
      console.error('Portfolio creation error:', error);
      setErrors({ 
        submit: error instanceof Error ? error.message : 'Failed to create portfolio. Please try again.' 
      });
    } finally {
      setIsLoading(false);
      setSubmitting(false);
    }
  };

  const handleNext = () => {
    handleSubmit(onSubmit)();
  };

  return (
    <AuthGuard requireAuth={true}>
      <div className="max-w-2xl mx-auto space-y-6">
      {/* Step Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          Finish your portfolio
        </h2>
        <p className="text-lg text-gray-600">
          Add your portfolio title and bio to complete your professional profile
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Portfolio Details</CardTitle>
          <CardDescription>
            This information will be prominently displayed on your portfolio page.
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Portfolio Title */}
            <div className="space-y-3">
              <ValidatedInput
                id="title"
                label="Portfolio Title"
                isRequired={true}
                {...register('title')}
                placeholder="e.g., John Smith - Actor & Model"
                error={errors.title?.message}
                isValid={!errors.title && title.length >= FORM_LIMITS.title.min}
                characterLimit={FORM_LIMITS.title.max}
                characterCount={title.length}
                helperText="This will be the main headline for your portfolio"
              />
              
              {title.length > 0 && (
                <div className="flex gap-4">
                  <FieldRequirement 
                    requirements={titleRequirements}
                    compact={true}
                    className="flex-1"
                  />
                  <FieldProgress
                    current={title.length}
                    target={FORM_LIMITS.title.min}
                    label="Minimum length"
                    className="flex-1"
                  />
                </div>
              )}
            </div>

            {/* Bio */}
            <div className="space-y-3">
              <ValidatedTextarea
                id="bio"
                label="Professional Bio"
                isRequired={true}
                {...register('bio')}
                placeholder="Tell your story... Share your experience, training, achievements, and what makes you unique as a professional. This bio will help casting directors and clients understand your background and capabilities."
                className="min-h-[200px]"
                error={errors.bio?.message}
                isValid={!errors.bio && bio.length >= FORM_LIMITS.bio.min}
                characterLimit={FORM_LIMITS.bio.max}
                characterMinimum={FORM_LIMITS.bio.min}
                characterCount={bio.length}
                showCharacterProgress={true}
              />
              
              {bio.length > 0 && (
                <div className="space-y-3">
                  <div className="flex gap-4">
                    <FieldRequirement 
                      requirements={bioRequirements}
                      compact={true}
                      className="flex-1"
                    />
                    <FieldProgress
                      current={bio.length}
                      target={FORM_LIMITS.bio.min}
                      label="Minimum length"
                      className="flex-1"
                    />
                  </div>
                  
                  <div className="text-sm text-gray-500 space-y-1">
                    <p>Include details about:</p>
                    <ul className="list-disc list-inside ml-4 space-y-1">
                      <li>Your experience and training</li>
                      <li>Notable projects or achievements</li>
                      <li>Your unique skills and strengths</li>
                      <li>What you&apos;re passionate about in your work</li>
                    </ul>
                  </div>
                </div>
              )}
            </div>

            {/* Error Display */}
            {state.errors.submit && (
              <ErrorMessage 
                message={state.errors.submit}
                size="md"
              />
            )}

            {/* Preview Section */}
            <div className="bg-gray-50 rounded-lg p-6 space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Preview</h3>
              <div className="space-y-3">
                <div>
                  <h4 className="font-medium text-gray-700 text-sm">Portfolio Title:</h4>
                  <p className="text-gray-900 text-lg font-semibold">
                    {watch('title') || 'Your portfolio title will appear here'}
                  </p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-700 text-sm">Bio Preview:</h4>
                  <p className="text-gray-700 text-sm leading-relaxed">
                    {watch('bio') ? 
                      watch('bio')!.substring(0, 200) + (watch('bio')!.length > 200 ? '...' : '') :
                      'Your bio will appear here...'
                    }
                  </p>
                </div>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Summary Card */}
      <Card className="border-green-200 bg-green-50">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            🎉 Ready to Create Your Portfolio!
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
            <div>
              <p className="font-medium text-gray-700">Professional</p>
              <p className="text-gray-600">
                {state.formData.step1.full_name} • {state.formData.step1.profession === 'BOTH' ? 'Actor & Model' : state.formData.step1.profession}
              </p>
            </div>
            <div>
              <p className="font-medium text-gray-700">Template</p>
              <p className="text-gray-600">
                {state.formData.step2.template_type} Design
              </p>
            </div>
            <div>
              <p className="font-medium text-gray-700">Status</p>
              <p className="text-gray-600">Ready to publish</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Navigation */}
      <StepNavigation
        currentStep={3}
        canProceed={isValid}
        isLoading={isLoading}
        onNext={handleNext}
        nextLabel="Continue to Images"
      />

      {/* Progress Info */}
      <div className="text-center text-sm text-gray-500">
        <p>Step 3 of 4 • Almost done! Next you can add images to your portfolio.</p>
      </div>
      </div>
    </AuthGuard>
  );
}