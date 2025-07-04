// Database-specific types that match the Supabase schema exactly
// This file should be auto-generated from the database schema

// Database Enums
export type Profession = 'ACTOR' | 'MODEL' | 'BOTH';
export type GenderType = 'MALE' | 'FEMALE' | 'NON_BINARY' | 'PREFER_NOT_TO_SAY';
export type ImageType = 'PROFILE' | 'HERO' | 'GALLERY' | 'INTERNAL';
export type TemplateType = 'T1' | 'T2' | 'T3' | 'T4';
export type PortfolioStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';

// Database Tables
export interface DatabaseUser {
  id: string;
  email: string;
  full_name: string | null;
  profession: Profession;
  gender: GenderType | null;
  date_of_birth: string | null;
  location: string | null;
  phone: string | null;
  bio: string | null;
  avatar_url: string | null;
  website_url: string | null;
  social_instagram: string | null;
  social_twitter: string | null;
  social_tiktok: string | null;
  social_linkedin: string | null;
  is_email_verified: boolean;
  is_profile_complete: boolean;
  created_at: string;
  updated_at: string;
}

export interface DatabasePortfolio {
  id: string;
  user_id: string;
  title: string;
  slug: string;
  template: TemplateType;
  status: PortfolioStatus;
  bio: string | null;
  skills: string[] | null;
  experience_years: number;
  height: string | null;
  weight: string | null;
  measurements: Record<string, any> | null;
  hair_color: string | null;
  eye_color: string | null;
  clothing_size: string | null;
  shoe_size: string | null;
  is_published: boolean;
  view_count: number;
  seo_title: string | null;
  seo_description: string | null;
  seo_keywords: string[] | null;
  created_at: string;
  updated_at: string;
}

export interface DatabaseImage {
  id: string;
  user_id: string;
  portfolio_id: string | null;
  type: ImageType;
  file_name: string;
  file_path: string;
  file_size: number;
  width: number | null;
  height: number | null;
  alt_text: string | null;
  is_primary: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface DatabaseAnnouncement {
  id: string;
  title: string;
  content: string;
  type: string;
  is_active: boolean;
  start_date: string;
  end_date: string | null;
  created_at: string;
  updated_at: string;
}

// Supabase Database Schema
export interface Database {
  public: {
    Tables: {
      users: {
        Row: DatabaseUser;
        Insert: Omit<DatabaseUser, 'id' | 'created_at' | 'updated_at'> & {
          id: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<DatabaseUser, 'id' | 'created_at' | 'updated_at'>>;
      };
      portfolios: {
        Row: DatabasePortfolio;
        Insert: Omit<DatabasePortfolio, 'id' | 'created_at' | 'updated_at'> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<DatabasePortfolio, 'id' | 'created_at' | 'updated_at'>>;
      };
      images: {
        Row: DatabaseImage;
        Insert: Omit<DatabaseImage, 'id' | 'created_at' | 'updated_at'> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<DatabaseImage, 'id' | 'created_at' | 'updated_at'>>;
      };
      announcements: {
        Row: DatabaseAnnouncement;
        Insert: Omit<DatabaseAnnouncement, 'id' | 'created_at' | 'updated_at'> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<DatabaseAnnouncement, 'id' | 'created_at' | 'updated_at'>>;
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      profession: Profession;
      gender_type: GenderType;
      image_type: ImageType;
      template_type: TemplateType;
      portfolio_status: PortfolioStatus;
    };
  };
}

// Helper types for common operations
export type UserInsert = Database['public']['Tables']['users']['Insert'];
export type UserUpdate = Database['public']['Tables']['users']['Update'];
export type UserRow = Database['public']['Tables']['users']['Row'];

export type PortfolioInsert = Database['public']['Tables']['portfolios']['Insert'];
export type PortfolioUpdate = Database['public']['Tables']['portfolios']['Update'];
export type PortfolioRow = Database['public']['Tables']['portfolios']['Row'];

export type ImageInsert = Database['public']['Tables']['images']['Insert'];
export type ImageUpdate = Database['public']['Tables']['images']['Update'];
export type ImageRow = Database['public']['Tables']['images']['Row'];

export type AnnouncementInsert = Database['public']['Tables']['announcements']['Insert'];
export type AnnouncementUpdate = Database['public']['Tables']['announcements']['Update'];
export type AnnouncementRow = Database['public']['Tables']['announcements']['Row'];