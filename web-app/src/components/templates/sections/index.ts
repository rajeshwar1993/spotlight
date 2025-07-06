// Hero Sections
export { HeroSection } from './hero-section';
export { CreativeIntroSection } from './creative-intro-section';

// About/Bio Sections  
export { AboutSection } from './about-section';
export { IntroSection } from './intro-section';
export { ArtisticAboutSection } from './artistic-about-section';

// Experience/Skills Sections
export { ExperienceSection } from './experience-section';
export { SkillsSection } from './skills-section';
export { ShowcaseSection } from './showcase-section';

// Gallery/Portfolio Sections
export { GallerySection } from './gallery-section';
export { PortfolioSection } from './portfolio-section';
export { WorkSection } from './work-section';
export { PortfolioGridSection } from './portfolio-grid-section';

// Contact Sections
export { ContactSection } from './contact-section';
export { CreativeContactSection } from './creative-contact-section';

// Additional Sections
export { TestimonialsSection } from './testimonials-section';

// Section component mapping for template registry
export const SECTION_COMPONENTS = {
  // Hero sections
  'hero-section': HeroSection,
  'creative-intro-section': CreativeIntroSection,
  
  // About sections
  'about-section': AboutSection,
  'intro-section': IntroSection,
  'artistic-about-section': ArtisticAboutSection,
  
  // Experience sections
  'experience-section': ExperienceSection,
  'skills-section': SkillsSection,
  'showcase-section': ShowcaseSection,
  
  // Gallery sections
  'gallery-section': GallerySection,
  'portfolio-section': PortfolioSection,
  'work-section': WorkSection,
  'portfolio-grid-section': PortfolioGridSection,
  
  // Contact sections
  'contact-section': ContactSection,
  'creative-contact-section': CreativeContactSection,
  
  // Additional sections
  'testimonials-section': TestimonialsSection,
} as const;

// Type for section component keys
export type SectionComponentKey = keyof typeof SECTION_COMPONENTS;

// Helper function to get section component
export function getSectionComponent(key: SectionComponentKey) {
  return SECTION_COMPONENTS[key];
}

// Section metadata for template builder
export const SECTION_METADATA = {
  'hero-section': {
    name: 'Hero Section',
    description: 'Standard hero section with profile image and introduction',
    category: 'hero',
    templateCompatibility: ['T1'],
    requiredProps: ['portfolio', 'user'],
  },
  'creative-intro-section': {
    name: 'Creative Intro',
    description: 'Artistic hero section with animated background elements',
    category: 'hero',
    templateCompatibility: ['T4'],
    requiredProps: ['portfolio', 'user'],
  },
  'about-section': {
    name: 'About Section',
    description: 'Comprehensive about section with profile information',
    category: 'about',
    templateCompatibility: ['T1'],
    requiredProps: ['portfolio', 'user'],
  },
  'intro-section': {
    name: 'Introduction',
    description: 'Minimal introduction section with quote-style layout',
    category: 'about',
    templateCompatibility: ['T3'],
    requiredProps: ['portfolio', 'user'],
  },
  'artistic-about-section': {
    name: 'Artistic About',
    description: 'Creative about section with artistic styling',
    category: 'about',
    templateCompatibility: ['T4'],
    requiredProps: ['portfolio', 'user'],
  },
  'experience-section': {
    name: 'Experience Timeline',
    description: 'Professional experience with timeline layout',
    category: 'experience',
    templateCompatibility: ['T1'],
    requiredProps: ['portfolio', 'user'],
  },
  'skills-section': {
    name: 'Skills & Expertise',
    description: 'Detailed skills showcase with proficiency levels',
    category: 'experience',
    templateCompatibility: ['T1'],
    requiredProps: ['portfolio', 'user'],
  },
  'showcase-section': {
    name: 'Featured Showcase',
    description: 'Dark-themed showcase of featured projects',
    category: 'experience',
    templateCompatibility: ['T2'],
    requiredProps: ['portfolio', 'user'],
  },
  'gallery-section': {
    name: 'Photo Gallery',
    description: 'Standard gallery with category filtering',
    category: 'gallery',
    templateCompatibility: ['T1'],
    requiredProps: ['portfolio', 'user'],
  },
  'portfolio-section': {
    name: 'Professional Portfolio',
    description: 'Project-focused portfolio with detailed information',
    category: 'gallery',
    templateCompatibility: ['T2'],
    requiredProps: ['portfolio', 'user'],
  },
  'work-section': {
    name: 'Selected Work',
    description: 'Minimal work showcase with elegant styling',
    category: 'gallery',
    templateCompatibility: ['T3'],
    requiredProps: ['portfolio', 'user'],
  },
  'portfolio-grid-section': {
    name: 'Creative Portfolio Grid',
    description: 'Artistic portfolio grid with interactive elements',
    category: 'gallery',
    templateCompatibility: ['T4'],
    requiredProps: ['portfolio', 'user'],
  },
  'contact-section': {
    name: 'Contact Form',
    description: 'Professional contact section with form',
    category: 'contact',
    templateCompatibility: ['T1', 'T3'],
    requiredProps: ['portfolio', 'user'],
  },
  'creative-contact-section': {
    name: 'Creative Contact',
    description: 'Artistic contact section with project brief form',
    category: 'contact',
    templateCompatibility: ['T4'],
    requiredProps: ['portfolio', 'user'],
  },
  'testimonials-section': {
    name: 'Client Testimonials',
    description: 'Testimonials carousel with reviews and ratings',
    category: 'additional',
    templateCompatibility: ['T2'],
    requiredProps: ['portfolio', 'user'],
  },
} as const;

// Helper function to get sections by category
export function getSectionsByCategory(category: string) {
  return Object.entries(SECTION_METADATA)
    .filter(([, metadata]) => metadata.category === category)
    .map(([key]) => key as SectionComponentKey);
}

// Helper function to get sections by template compatibility
export function getSectionsByTemplate(templateId: string) {
  return Object.entries(SECTION_METADATA)
    .filter(([, metadata]) => metadata.templateCompatibility.includes(templateId))
    .map(([key]) => key as SectionComponentKey);
}