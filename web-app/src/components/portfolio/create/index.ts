// Portfolio creation components exports
export { PortfolioCreationProvider, usePortfolioCreation } from './portfolio-creation-context';
export { PortfolioProgress } from './portfolio-progress';
export { Step1BasicInfo } from './step-1-basic-info';
export { Step2TemplateSelection } from './step-2-template-selection';
export { Step3BioDetails } from './step-3-bio-details';
export { StepNavigation } from './step-navigation';
export { CreationSuccess } from './creation-success';
export { AuthGuard } from './auth-guard';
export { AuthReturnHandler, useAuthReturn } from './auth-return-handler';

// Type exports
export type { 
  Step1Data, 
  Step2Data, 
  Step3Data, 
  PortfolioFormData 
} from './portfolio-creation-context';