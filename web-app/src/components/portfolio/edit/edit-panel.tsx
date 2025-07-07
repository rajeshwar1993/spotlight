'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Save, 
  Undo2, 
  Redo2, 
  Settings, 
  Image, 
  User,
  FileText,
  Palette,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react';
import type { PortfolioData } from '@/lib/templates/types';

interface EditPanelProps {
  portfolioData: PortfolioData;
  onDataChange: (data: Partial<PortfolioData>) => void;
  onSave: () => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  autoSaveStatus: 'idle' | 'saving' | 'saved' | 'error';
  lastSaved: Date | null;
  className?: string;
}

export function EditPanel({
  portfolioData,
  onDataChange,
  onSave,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  autoSaveStatus,
  lastSaved,
  className = ''
}: EditPanelProps) {
  const [activeTab, setActiveTab] = useState('basic');

  const handleBasicInfoChange = (field: string, value: string) => {
    onDataChange({
      portfolio: {
        ...portfolioData.portfolio,
        [field]: value
      }
    });
  };

  const handleUserInfoChange = (field: string, value: string) => {
    onDataChange({
      user: {
        ...portfolioData.user,
        [field]: value
      }
    });
  };


  const handleContactInfoChange = (field: string, value: string) => {
    onDataChange({
      contact_info: {
        ...portfolioData.contact_info,
        [field]: value
      }
    });
  };

  const getAutoSaveStatusIcon = () => {
    switch (autoSaveStatus) {
      case 'saving':
        return <Clock className="h-4 w-4 animate-spin" />;
      case 'saved':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return null;
    }
  };

  const getAutoSaveStatusText = () => {
    switch (autoSaveStatus) {
      case 'saving':
        return 'Saving...';
      case 'saved':
        return lastSaved ? `Saved ${lastSaved.toLocaleTimeString()}` : 'Saved';
      case 'error':
        return 'Save failed';
      default:
        return 'No changes';
    }
  };

  return (
    <div className={`flex flex-col h-full ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white">
        <div className="flex items-center space-x-3">
          <h2 className="text-lg font-semibold text-gray-900">Edit Portfolio</h2>
          <div className="flex items-center space-x-2">
            {getAutoSaveStatusIcon()}
            <span className="text-sm text-gray-500">{getAutoSaveStatusText()}</span>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={onUndo}
            disabled={!canUndo}
            title="Undo (Ctrl+Z)"
          >
            <Undo2 className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onRedo}
            disabled={!canRedo}
            title="Redo (Ctrl+Y)"
          >
            <Redo2 className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onSave}
            disabled={autoSaveStatus === 'saving'}
          >
            <Save className="h-4 w-4 mr-2" />
            Save
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
          <TabsList className="grid w-full grid-cols-5 sticky top-0 bg-white border-b">
            <TabsTrigger value="basic" className="flex items-center space-x-2">
              <User className="h-4 w-4" />
              <span className="hidden sm:inline">Basic</span>
            </TabsTrigger>
            <TabsTrigger value="bio" className="flex items-center space-x-2">
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">Bio</span>
            </TabsTrigger>
            <TabsTrigger value="images" className="flex items-center space-x-2">
              <Image className="h-4 w-4" />
              <span className="hidden sm:inline">Images</span>
            </TabsTrigger>
            <TabsTrigger value="style" className="flex items-center space-x-2">
              <Palette className="h-4 w-4" />
              <span className="hidden sm:inline">Style</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center space-x-2">
              <Settings className="h-4 w-4" />
              <span className="hidden sm:inline">Settings</span>
            </TabsTrigger>
          </TabsList>

          {/* Basic Info Tab */}
          <TabsContent value="basic" className="space-y-6 p-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Portfolio Title</Label>
                  <Input
                    id="title"
                    value={portfolioData.portfolio.title}
                    onChange={(e) => handleBasicInfoChange('title', e.target.value)}
                    placeholder="Enter portfolio title"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="slug">URL Slug</Label>
                  <Input
                    id="slug"
                    value={portfolioData.portfolio.slug}
                    onChange={(e) => handleBasicInfoChange('slug', e.target.value)}
                    placeholder="your-portfolio-url"
                  />
                  <p className="text-sm text-gray-500">
                    Your portfolio will be available at: mypage/{portfolioData.portfolio.slug}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="template">Template</Label>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline">{portfolioData.portfolio.template}</Badge>
                    <Button variant="ghost" size="sm" disabled>
                      Change Template
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Personal Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    value={portfolioData.user.full_name || ''}
                    onChange={(e) => handleUserInfoChange('full_name', e.target.value)}
                    placeholder="Full name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="profession">Profession</Label>
                  <Input
                    id="profession"
                    value={portfolioData.user.profession || ''}
                    onChange={(e) => handleUserInfoChange('profession', e.target.value)}
                    placeholder="Actor, Model, etc."
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={portfolioData.user.location || ''}
                    onChange={(e) => handleUserInfoChange('location', e.target.value)}
                    placeholder="City, State/Country"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Bio Tab */}
          <TabsContent value="bio" className="space-y-6 p-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Biography</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    value={portfolioData.portfolio.bio || ''}
                    onChange={(e) => handleBasicInfoChange('bio', e.target.value)}
                    placeholder="Tell your story..."
                    rows={8}
                    className="resize-none"
                  />
                  <p className="text-sm text-gray-500">
                    {(portfolioData.portfolio.bio || '').length}/500 characters
                  </p>
                </div>

              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={portfolioData.contact_info.email || ''}
                    onChange={(e) => handleContactInfoChange('email', e.target.value)}
                    placeholder="your@email.com"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={portfolioData.contact_info.phone || ''}
                    onChange={(e) => handleContactInfoChange('phone', e.target.value)}
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Images Tab */}
          <TabsContent value="images" className="space-y-6 p-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Portfolio Images</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Image className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-500 mb-4">Image management coming soon</p>
                  <Button variant="outline" disabled>
                    Upload Images
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Style Tab */}
          <TabsContent value="style" className="space-y-6 p-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Template Customization</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Palette className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-500 mb-4">Template customization coming soon</p>
                  <Button variant="outline" disabled>
                    Customize Template
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6 p-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Portfolio Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <div className="flex items-center space-x-2">
                    <Badge variant={portfolioData.portfolio.status === 'PUBLISHED' ? 'default' : 'secondary'}>
                      {portfolioData.portfolio.status}
                    </Badge>
                    <Button variant="ghost" size="sm" disabled>
                      Change Status
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>SEO Settings</Label>
                  <div className="text-sm text-gray-500">
                    <p>• Title: {portfolioData.portfolio.title}</p>
                    <p>• URL: mypage/{portfolioData.portfolio.slug}</p>
                    <p>• Description: {portfolioData.portfolio.bio?.substring(0, 160) || 'No bio provided'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}