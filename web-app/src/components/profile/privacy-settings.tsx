'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  Shield, 
  Eye, 
  EyeOff, 
  Globe, 
  Users, 
  Lock,
  AlertTriangle,
  CheckCircle,
  Info
} from 'lucide-react';
import { useUser } from '@/hooks/use-user';
import { userService } from '@/lib/services/user';

interface PrivacySettingsProps {
  onSettingsChange?: (settings: PrivacySettings) => void;
}

interface PrivacySettings {
  profile_visibility: 'public' | 'private';
  show_email: boolean;
  show_phone: boolean;
  show_location: boolean;
  show_social_links: boolean;
  searchable: boolean;
  allow_contact: boolean;
  show_last_active: boolean;
}

export function PrivacySettings({ onSettingsChange }: PrivacySettingsProps) {
  const { user, refreshUser } = useUser();
  const [settings, setSettings] = useState<PrivacySettings>({
    profile_visibility: (user?.profile_visibility as 'public' | 'private') || 'public',
    show_email: user?.show_email ?? false,
    show_phone: user?.show_phone ?? false,
    show_location: user?.show_location ?? true,
    show_social_links: user?.show_social_links ?? true,
    searchable: user?.searchable ?? true,
    allow_contact: user?.allow_contact ?? true,
    show_last_active: user?.show_last_active ?? false,
  });
  
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  const handleSettingChange = async (key: keyof PrivacySettings, value: boolean | string) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    
    try {
      setSaving(true);
      await userService.updateUser({ [key]: value });
      await refreshUser();
      setLastSaved(new Date());
      onSettingsChange?.(newSettings);
    } catch (error) {
      console.error('Failed to update privacy setting:', error);
      // Revert the setting on error
      setSettings(settings);
    } finally {
      setSaving(false);
    }
  };

  const getVisibilityInfo = () => {
    if (settings.profile_visibility === 'private') {
      return {
        icon: <Lock className="h-4 w-4" />,
        text: 'Private Profile',
        description: 'Only you can see your full profile. Others see limited information.',
        color: 'text-red-600',
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200'
      };
    }
    
    return {
      icon: <Globe className="h-4 w-4" />,
      text: 'Public Profile',
      description: 'Your profile is visible to everyone on the internet.',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200'
    };
  };

  const visibilityInfo = getVisibilityInfo();

  return (
    <div className="space-y-6">
      {/* Main Privacy Control */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Shield className="h-5 w-5 mr-2" />
            Profile Visibility
          </CardTitle>
          <CardDescription>
            Control who can see your profile and personal information
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className={`p-4 rounded-lg border ${visibilityInfo.bgColor} ${visibilityInfo.borderColor}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className={visibilityInfo.color}>
                  {visibilityInfo.icon}
                </div>
                <div>
                  <p className={`font-medium ${visibilityInfo.color}`}>
                    {visibilityInfo.text}
                  </p>
                  <p className="text-sm text-gray-600">
                    {visibilityInfo.description}
                  </p>
                </div>
              </div>
              <Switch
                checked={settings.profile_visibility === 'public'}
                onCheckedChange={(checked) => 
                  handleSettingChange('profile_visibility', checked ? 'public' : 'private')
                }
                disabled={saving}
              />
            </div>
          </div>

          {lastSaved && (
            <div className="flex items-center space-x-2 mt-3 text-sm text-green-600">
              <CheckCircle className="h-4 w-4" />
              <span>Settings saved at {lastSaved.toLocaleTimeString()}</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Detailed Privacy Controls */}
      <Card>
        <CardHeader>
          <CardTitle>Privacy Controls</CardTitle>
          <CardDescription>
            Fine-tune what information is visible to others
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Contact Information */}
          <div className="space-y-4">
            <h4 className="font-medium flex items-center">
              <Users className="h-4 w-4 mr-2" />
              Contact Information
            </h4>
            
            <div className="space-y-3 ml-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="show-email">Show Email Address</Label>
                  <p className="text-sm text-gray-500">
                    Allow others to see your email address on your profile
                  </p>
                </div>
                <Switch
                  id="show-email"
                  checked={settings.show_email}
                  onCheckedChange={(checked) => handleSettingChange('show_email', checked)}
                  disabled={saving}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="show-phone">Show Phone Number</Label>
                  <p className="text-sm text-gray-500">
                    Display your phone number for direct contact
                  </p>
                </div>
                <Switch
                  id="show-phone"
                  checked={settings.show_phone}
                  onCheckedChange={(checked) => handleSettingChange('show_phone', checked)}
                  disabled={saving}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="show-location">Show Location</Label>
                  <p className="text-sm text-gray-500">
                    Display your city/location on your profile
                  </p>
                </div>
                <Switch
                  id="show-location"
                  checked={settings.show_location}
                  onCheckedChange={(checked) => handleSettingChange('show_location', checked)}
                  disabled={saving}
                />
              </div>
            </div>
          </div>

          {/* Social Media */}
          <div className="space-y-4">
            <h4 className="font-medium flex items-center">
              <Eye className="h-4 w-4 mr-2" />
              Social Media & Links
            </h4>
            
            <div className="space-y-3 ml-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="show-social">Show Social Media Links</Label>
                  <p className="text-sm text-gray-500">
                    Display your Instagram, LinkedIn, Twitter, and website links
                  </p>
                </div>
                <Switch
                  id="show-social"
                  checked={settings.show_social_links}
                  onCheckedChange={(checked) => handleSettingChange('show_social_links', checked)}
                  disabled={saving}
                />
              </div>
            </div>
          </div>

          {/* Discoverability */}
          <div className="space-y-4">
            <h4 className="font-medium flex items-center">
              <Globe className="h-4 w-4 mr-2" />
              Discoverability
            </h4>
            
            <div className="space-y-3 ml-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="searchable">Searchable Profile</Label>
                  <p className="text-sm text-gray-500">
                    Allow your profile to appear in search results and discovery pages
                  </p>
                </div>
                <Switch
                  id="searchable"
                  checked={settings.searchable}
                  onCheckedChange={(checked) => handleSettingChange('searchable', checked)}
                  disabled={saving}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="allow-contact">Allow Direct Contact</Label>
                  <p className="text-sm text-gray-500">
                    Let others contact you through the platform
                  </p>
                </div>
                <Switch
                  id="allow-contact"
                  checked={settings.allow_contact}
                  onCheckedChange={(checked) => handleSettingChange('allow_contact', checked)}
                  disabled={saving}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="show-activity">Show Last Active</Label>
                  <p className="text-sm text-gray-500">
                    Display when you were last active on the platform
                  </p>
                </div>
                <Switch
                  id="show-activity"
                  checked={settings.show_last_active}
                  onCheckedChange={(checked) => handleSettingChange('show_last_active', checked)}
                  disabled={saving}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Privacy Tips */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Info className="h-5 w-5 mr-2" />
            Privacy Tips
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="h-5 w-5 text-yellow-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium">Public Profile Benefits</p>
                <p className="text-sm text-gray-600">
                  Public profiles get more visibility, leading to better opportunities and connections.
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <Lock className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium">Private Profile Security</p>
                <p className="text-sm text-gray-600">
                  Private profiles are only visible to you and won't appear in search results.
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium">Recommended Settings</p>
                <p className="text-sm text-gray-600">
                  For professional purposes, we recommend keeping your profile public with location visible.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Current Status Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Privacy Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="font-semibold">
                {settings.profile_visibility === 'public' ? (
                  <Badge variant="default">Public</Badge>
                ) : (
                  <Badge variant="secondary">Private</Badge>
                )}
              </div>
              <div className="text-xs text-gray-600 mt-1">Profile</div>
            </div>
            
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="font-semibold">
                {settings.searchable ? (
                  <Badge variant="default">Yes</Badge>
                ) : (
                  <Badge variant="secondary">No</Badge>
                )}
              </div>
              <div className="text-xs text-gray-600 mt-1">Searchable</div>
            </div>
            
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="font-semibold">
                {settings.allow_contact ? (
                  <Badge variant="default">Open</Badge>
                ) : (
                  <Badge variant="secondary">Closed</Badge>
                )}
              </div>
              <div className="text-xs text-gray-600 mt-1">Contact</div>
            </div>
            
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="font-semibold">
                {[settings.show_email, settings.show_phone, settings.show_location].filter(Boolean).length}
              </div>
              <div className="text-xs text-gray-600 mt-1">Visible Fields</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}