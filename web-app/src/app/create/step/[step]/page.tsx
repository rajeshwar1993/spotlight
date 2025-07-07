'use client';

import { notFound } from 'next/navigation';
import { Step1BasicInfo } from '@/components/portfolio/create/step-1-basic-info';
import { Step2TemplateSelection } from '@/components/portfolio/create/step-2-template-selection';
import { Step3BioDetails } from '@/components/portfolio/create/step-3-bio-details';

interface StepPageProps {
  params: Promise<{
    step: string;
  }>;
}

export default async function StepPage({ params }: StepPageProps) {
  const { step } = await params;
  const stepNumber = parseInt(step);

  // Validate step number
  if (isNaN(stepNumber) || stepNumber < 1 || stepNumber > 3) {
    notFound();
  }

  const renderStep = () => {
    switch (stepNumber) {
      case 1:
        return <Step1BasicInfo />;
      case 2:
        return <Step2TemplateSelection />;
      case 3:
        return <Step3BioDetails />;
      default:
        notFound();
    }
  };

  return (
    <div className="w-full">
      {renderStep()}
    </div>
  );
}