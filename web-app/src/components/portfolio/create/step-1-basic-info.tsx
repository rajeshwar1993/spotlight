'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ValidatedInput } from '@/components/forms/validated-input';
import { FieldRequirement, useCharacterRequirements } from '@/components/forms/field-requirement';
import { useAuth } from '@/hooks/use-auth';
import { useFormExitConfirmation } from '@/hooks/use-form-exit-confirmation';
import { usePortfolioCreation } from './portfolio-creation-context';
import { portfolioStep1Schema, type PortfolioStep1Form } from '@/lib/validations';
import { Profession } from '@/types';
import { FORM_LIMITS } from '@/lib/constants';
import { StepNavigation } from './step-navigation';

export function Step1BasicInfo() {
  const router = useRouter();
  const { user } = useAuth();
  const { state, updateStep1, setStep, setErrors, clearErrors } = usePortfolioCreation();
  const [isLoading, setIsLoading] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const form = useForm<PortfolioStep1Form>({
    resolver: zodResolver(portfolioStep1Schema),
    defaultValues: state.formData.step1,
    mode: 'onChange',
  });

  const { register, handleSubmit, watch, setValue, formState: { errors, isValid, isDirty } } = form;

  // Form exit confirmation
  useFormExitConfirmation({
    hasUnsavedChanges: hasUnsavedChanges && isDirty,
    onConfirm: () => setHasUnsavedChanges(false),
  });

  // Watch all form values
  const fullName = watch('full_name') || '';
  const email = watch('email') || '';
  const location = watch('location') || '';

  // Character requirements for form fields
  const fullNameRequirements = useCharacterRequirements(
    fullName, 
    FORM_LIMITS.fullName.min, 
    FORM_LIMITS.fullName.max
  );

  const locationRequirements = useCharacterRequirements(
    location, 
    undefined, 
    FORM_LIMITS.location.max
  );

  // Auto-populate from user data if logged in
  useEffect(() => {
    if (user && !state.formData.step1.full_name) {
      const updates: Partial<PortfolioStep1Form> = {};
      
      if (user.full_name) {
        updates.full_name = user.full_name;
        setValue('full_name', user.full_name);
      }
      
      if (user.email) {
        updates.email = user.email;
        setValue('email', user.email);
      }
      
      if (user.profession) {
        updates.profession = user.profession;
        setValue('profession', user.profession);
      }
      
      if (user.location) {
        updates.location = user.location;
        setValue('location', user.location);
      }

      if (Object.keys(updates).length > 0) {
        updateStep1(updates);
      }
    }
  }, [user, setValue, updateStep1, state.formData.step1.full_name]);

  // Watch form changes and update context
  useEffect(() => {
    const subscription = watch((value) => {
      updateStep1(value as PortfolioStep1Form);
      clearErrors();
      setHasUnsavedChanges(true);
    });
    return () => subscription.unsubscribe();
  }, [watch, updateStep1, clearErrors]);

  const onSubmit = async (data: PortfolioStep1Form) => {
    setIsLoading(true);
    clearErrors();

    try {
      // Validate the data
      const validatedData = portfolioStep1Schema.parse(data);
      updateStep1(validatedData);
      
      // Clear unsaved changes flag
      setHasUnsavedChanges(false);
      
      // Move to next step
      setStep(2);
      router.push('/create/step/2');
    } catch (error) {
      console.error('Step 1 validation error:', error);
      setErrors({ submit: 'Please check your information and try again' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleNext = () => {
    handleSubmit(onSubmit)();
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Step Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          Let&apos;s start with the basics
        </h2>
        <p className="text-lg text-gray-600">
          Tell us about yourself so we can create your professional portfolio
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
          <CardDescription>
            This information will be displayed on your portfolio and used to create your profile.
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Full Name */}
            <div className="space-y-3">
              <ValidatedInput
                id="full_name"
                label="Full Name"
                isRequired={true}
                {...register('full_name')}
                placeholder="Enter your full name"
                error={errors.full_name?.message}
                isValid={!errors.full_name && fullName.length >= FORM_LIMITS.fullName.min}
                characterLimit={FORM_LIMITS.fullName.max}
                characterCount={fullName.length}
                helperText="This will be displayed prominently on your portfolio"
              />
              
              {fullName.length > 0 && (
                <FieldRequirement 
                  requirements={fullNameRequirements}
                  compact={true}
                />
              )}
            </div>

            {/* Email */}
            <div className="space-y-3">
              <ValidatedInput
                id="email"
                type="email"
                label="Email Address"
                isRequired={true}
                {...register('email')}
                placeholder="Enter your email address"
                error={errors.email?.message}
                isValid={!errors.email && email.includes('@')}
                disabled={!!user?.email}
                helperText={user?.email ? "Using your account email address" : "We'll use this to contact you about your portfolio"}
              />
            </div>

            {/* Profession */}
            <div className="space-y-2">
              <Label htmlFor="profession" className="text-sm font-medium">
                Profession *
              </Label>
              <Select
                value={watch('profession') || ''}
                onValueChange={(value) => setValue('profession', value as Profession)}
              >
                <SelectTrigger className={errors.profession ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Select your profession" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={Profession.ACTOR}>Actor</SelectItem>
                  <SelectItem value={Profession.MODEL}>Model</SelectItem>
                  <SelectItem value={Profession.BOTH}>Actor & Model</SelectItem>
                </SelectContent>
              </Select>
              {errors.profession && (
                <p className="text-sm text-red-600">{errors.profession.message}</p>
              )}
            </div>

            {/* Location */}
            <div className="space-y-3">
              <ValidatedInput
                id="location"
                label="Location"
                isRequired={false}
                {...register('location')}
                placeholder="City, State/Country (optional)"
                error={errors.location?.message}
                isValid={!errors.location}
                characterLimit={FORM_LIMITS.location.max}
                characterCount={location.length}
                helperText="This helps casting directors and clients find you"
              />
              
              {location.length > 0 && (
                <FieldRequirement 
                  requirements={locationRequirements}
                  compact={true}
                />
              )}
            </div>

            {/* Error Display */}
            {state.errors.submit && (
              <div className="p-4 border border-red-200 bg-red-50 rounded-md">
                <p className="text-sm text-red-600">{state.errors.submit}</p>
              </div>
            )}
          </form>
        </CardContent>
      </Card>

      {/* Navigation */}
      <StepNavigation
        currentStep={1}
        canProceed={isValid}
        isLoading={isLoading}
        onNext={handleNext}
        nextLabel="Continue to Template Selection"
      />

      {/* Progress Info */}
      <div className="text-center text-sm text-gray-500">
        <p>Step 1 of 3 • Your information is automatically saved</p>
      </div>
    </div>
  );
}