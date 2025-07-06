'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { TemplateType, PortfolioStatus } from '@/types';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  Save, 
  Eye, 
  X, 
  Loader2, 
  Settings, 
  User, 
  Camera, 
  Tag, 
  Globe,
  DollarSign,
  MapPin,
  Phone,
  Mail,
  Palette
} from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { portfolioSchema, PortfolioForm } from '@/lib/validations';
import { useToast } from '@/hooks/use-toast';
// import { getAllTemplates, getTemplateConfig } from '@/lib/templates/registry';

interface Portfolio extends PortfolioForm {
  id: string;
  slug: string;
  created_at: string;
  updated_at: string;
  user_id: string;
  view_count: number;
  is_published: boolean;
}

interface PortfolioEditFormProps {
  portfolio?: Portfolio;
  onSave?: (portfolio: Portfolio) => void;
  onCancel?: () => void;
  className?: string;
}

export function PortfolioEditForm({
  portfolio,
  onSave,
  onCancel,
  className
}: PortfolioEditFormProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [skills, setSkills] = useState<string[]>(portfolio?.skills || []);
  const [newSkill, setNewSkill] = useState('');
  const [seoKeywords, setSeoKeywords] = useState<string[]>(portfolio?.seo_keywords || []);
  const [newKeyword, setNewKeyword] = useState('');
  const { toast } = useToast();

  const form = useForm<PortfolioForm>({
    resolver: zodResolver(portfolioSchema),
    defaultValues: {
      title: portfolio?.title || '',
      template: portfolio?.template || 'T1',
      status: portfolio?.status || 'draft',
      bio: portfolio?.bio || '',
      skills: portfolio?.skills || [],
      experience_years: portfolio?.experience_years || 0,
      height: portfolio?.height || '',
      weight: portfolio?.weight || '',
      hair_color: portfolio?.hair_color || '',
      eye_color: portfolio?.eye_color || '',
      clothing_size: portfolio?.clothing_size || '',
      shoe_size: portfolio?.shoe_size || '',
      contact_email: portfolio?.contact_email || '',
      contact_phone: portfolio?.contact_phone || '',
      availability_status: portfolio?.availability_status || 'available',
      location_preferences: portfolio?.location_preferences || [],
      rate_per_hour: portfolio?.rate_per_hour || undefined,
      rate_per_day: portfolio?.rate_per_day || undefined,
      currency: portfolio?.currency || 'USD',
      seo_title: portfolio?.seo_title || '',
      seo_description: portfolio?.seo_description || '',
      seo_keywords: portfolio?.seo_keywords || [],
    }
  });

  const handleSave = async (data: PortfolioForm) => {
    try {
      setIsSaving(true);

      const portfolioData = {
        ...data,
        skills,
        seo_keywords: seoKeywords
      };

      const url = portfolio ? `/api/portfolios/${portfolio.id}` : '/api/portfolios';
      const method = portfolio ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(portfolioData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save portfolio');
      }

      const { data: savedPortfolio } = await response.json();
      onSave?.(savedPortfolio);

      toast({
        title: 'Portfolio Saved',
        description: 'Your portfolio has been saved successfully.',
      });

    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to save portfolio',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const addSkill = () => {
    if (newSkill.trim() && !skills.includes(newSkill.trim()) && skills.length < 20) {
      setSkills([...skills, newSkill.trim()]);
      setNewSkill('');
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setSkills(skills.filter(skill => skill !== skillToRemove));
  };

  const addKeyword = () => {
    if (newKeyword.trim() && !seoKeywords.includes(newKeyword.trim()) && seoKeywords.length < 10) {
      setSeoKeywords([...seoKeywords, newKeyword.trim()]);
      setNewKeyword('');
    }
  };

  const removeKeyword = (keywordToRemove: string) => {
    setSeoKeywords(seoKeywords.filter(keyword => keyword !== keywordToRemove));
  };

  const availableTemplates = ['T1', 'T2', 'T3', 'T4']; // getAllTemplates();

  return (
    <div className={cn('max-w-4xl mx-auto space-y-6', className)}>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {portfolio ? 'Edit Portfolio' : 'Create Portfolio'}
          </h1>
          <p className="text-gray-600">
            {portfolio ? 'Update your portfolio information' : 'Fill out the details for your new portfolio'}
          </p>
        </div>
        
        <div className="flex gap-2">
          {onCancel && (
            <Button variant="outline" onClick={onCancel}>
              <X className="h-4 w-4 mr-1" />
              Cancel
            </Button>
          )}
          <Button onClick={form.handleSubmit(handleSave)} disabled={isSaving}>
            {isSaving ? (
              <Loader2 className="h-4 w-4 mr-1 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-1" />
            )}
            Save Portfolio
          </Button>
        </div>
      </div>

      <form onSubmit={form.handleSubmit(handleSave)} className="space-y-6">
        <Tabs defaultValue="basic" className="space-y-4">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="basic">Basic</TabsTrigger>
            <TabsTrigger value="physical">Physical</TabsTrigger>
            <TabsTrigger value="skills">Skills</TabsTrigger>
            <TabsTrigger value="contact">Contact</TabsTrigger>
            <TabsTrigger value="rates">Rates</TabsTrigger>
            <TabsTrigger value="seo">SEO</TabsTrigger>
          </TabsList>

          {/* Basic Information */}
          <TabsContent value="basic">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Basic Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Portfolio Title</Label>
                    <Input
                      id="title"
                      {...form.register('title')}
                      placeholder="Enter portfolio title"
                    />
                    {form.formState.errors.title && (
                      <p className="text-sm text-red-600">{form.formState.errors.title.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="template">Template</Label>
                    <Select 
                      value={form.watch('template')} 
                      onValueChange={(value) => form.setValue('template', value as TemplateType)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {availableTemplates.map((template) => {
                          return (
                            <SelectItem key={template} value={template}>
                              Template {template}
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select 
                      value={form.watch('status')} 
                      onValueChange={(value) => form.setValue('status', value as PortfolioStatus)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="published">Published</SelectItem>
                        <SelectItem value="archived">Archived</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="experience_years">Experience (Years)</Label>
                    <Input
                      id="experience_years"
                      type="number"
                      min="0"
                      max="50"
                      {...form.register('experience_years', { valueAsNumber: true })}
                      placeholder="0"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    {...form.register('bio')}
                    placeholder="Tell your story..."
                    rows={4}
                    maxLength={2000}
                  />
                  <p className="text-sm text-gray-500">
                    {form.watch('bio')?.length || 0}/2000 characters
                  </p>
                  {form.formState.errors.bio && (
                    <p className="text-sm text-red-600">{form.formState.errors.bio.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="availability_status">Availability</Label>
                  <Select 
                    value={form.watch('availability_status')} 
                    onValueChange={(value) => form.setValue('availability_status', value as 'available' | 'busy' | 'unavailable')}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="available">Available</SelectItem>
                      <SelectItem value="busy">Busy</SelectItem>
                      <SelectItem value="unavailable">Unavailable</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Physical Attributes */}
          <TabsContent value="physical">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Camera className="h-5 w-5" />
                  Physical Attributes
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="height">Height</Label>
                    <Input
                      id="height"
                      {...form.register('height')}
                      placeholder="e.g., 5'8\" or 173cm"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="weight">Weight</Label>
                    <Input
                      id="weight"
                      {...form.register('weight')}
                      placeholder="e.g., 140 lbs or 64 kg"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="hair_color">Hair Color</Label>
                    <Input
                      id="hair_color"
                      {...form.register('hair_color')}
                      placeholder="e.g., Brown, Blonde, Black"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="eye_color">Eye Color</Label>
                    <Input
                      id="eye_color"
                      {...form.register('eye_color')}
                      placeholder="e.g., Blue, Brown, Green"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="clothing_size">Clothing Size</Label>
                    <Input
                      id="clothing_size"
                      {...form.register('clothing_size')}
                      placeholder="e.g., S, M, L, XL"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="shoe_size">Shoe Size</Label>
                    <Input
                      id="shoe_size"
                      {...form.register('shoe_size')}
                      placeholder="e.g., 8, 9.5, 42"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Skills */}
          <TabsContent value="skills">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Tag className="h-5 w-5" />
                  Skills & Talents
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Add Skills</Label>
                  <div className="flex gap-2">
                    <Input
                      value={newSkill}
                      onChange={(e) => setNewSkill(e.target.value)}
                      placeholder="Enter a skill"
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                    />
                    <Button type="button" onClick={addSkill} disabled={!newSkill.trim() || skills.length >= 20}>
                      Add
                    </Button>
                  </div>
                  <p className="text-sm text-gray-500">
                    {skills.length}/20 skills added
                  </p>
                </div>

                {skills.length > 0 && (
                  <div className="space-y-2">
                    <Label>Current Skills</Label>
                    <div className="flex flex-wrap gap-2">
                      {skills.map((skill) => (
                        <Badge key={skill} variant="secondary" className="gap-1">
                          {skill}
                          <button
                            type="button"
                            onClick={() => removeSkill(skill)}
                            className="ml-1 text-gray-500 hover:text-gray-700"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Contact Information */}
          <TabsContent value="contact">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5" />
                  Contact Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="contact_email">Contact Email</Label>
                    <Input
                      id="contact_email"
                      type="email"
                      {...form.register('contact_email')}
                      placeholder="your@email.com"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="contact_phone">Contact Phone</Label>
                    <Input
                      id="contact_phone"
                      {...form.register('contact_phone')}
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Rates & Pricing */}
          <TabsContent value="rates">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Rates & Pricing
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="rate_per_hour">Hourly Rate</Label>
                    <Input
                      id="rate_per_hour"
                      type="number"
                      min="0"
                      step="0.01"
                      {...form.register('rate_per_hour', { valueAsNumber: true })}
                      placeholder="0.00"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="rate_per_day">Daily Rate</Label>
                    <Input
                      id="rate_per_day"
                      type="number"
                      min="0"
                      step="0.01"
                      {...form.register('rate_per_day', { valueAsNumber: true })}
                      placeholder="0.00"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="currency">Currency</Label>
                    <Select 
                      value={form.watch('currency')} 
                      onValueChange={(value) => form.setValue('currency', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="USD">USD</SelectItem>
                        <SelectItem value="EUR">EUR</SelectItem>
                        <SelectItem value="GBP">GBP</SelectItem>
                        <SelectItem value="CAD">CAD</SelectItem>
                        <SelectItem value="AUD">AUD</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* SEO Settings */}
          <TabsContent value="seo">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  SEO Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="seo_title">SEO Title</Label>
                  <Input
                    id="seo_title"
                    {...form.register('seo_title')}
                    placeholder="Custom title for search engines"
                    maxLength={255}
                  />
                  <p className="text-sm text-gray-500">
                    {form.watch('seo_title')?.length || 0}/255 characters
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="seo_description">SEO Description</Label>
                  <Textarea
                    id="seo_description"
                    {...form.register('seo_description')}
                    placeholder="Brief description for search engine results"
                    rows={3}
                    maxLength={500}
                  />
                  <p className="text-sm text-gray-500">
                    {form.watch('seo_description')?.length || 0}/500 characters
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>SEO Keywords</Label>
                  <div className="flex gap-2">
                    <Input
                      value={newKeyword}
                      onChange={(e) => setNewKeyword(e.target.value)}
                      placeholder="Enter a keyword"
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addKeyword())}
                    />
                    <Button type="button" onClick={addKeyword} disabled={!newKeyword.trim() || seoKeywords.length >= 10}>
                      Add
                    </Button>
                  </div>
                  <p className="text-sm text-gray-500">
                    {seoKeywords.length}/10 keywords added
                  </p>
                </div>

                {seoKeywords.length > 0 && (
                  <div className="space-y-2">
                    <Label>Current Keywords</Label>
                    <div className="flex flex-wrap gap-2">
                      {seoKeywords.map((keyword) => (
                        <Badge key={keyword} variant="outline" className="gap-1">
                          {keyword}
                          <button
                            type="button"
                            onClick={() => removeKeyword(keyword)}
                            className="ml-1 text-gray-500 hover:text-gray-700"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Save Actions */}
        <div className="flex justify-end gap-2 pt-4 border-t">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          )}
          <Button type="submit" disabled={isSaving}>
            {isSaving ? (
              <Loader2 className="h-4 w-4 mr-1 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-1" />
            )}
            Save Portfolio
          </Button>
        </div>
      </form>
    </div>
  );
}