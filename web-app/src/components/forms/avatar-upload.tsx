'use client';

import { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/use-auth';
import { useUser } from '@/hooks/use-user';

interface AvatarUploadProps {
  onSuccess?: (avatarUrl: string) => void;
  onError?: (error: string) => void;
}

export function AvatarUpload({ onSuccess, onError }: AvatarUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { user } = useUser();
  const { uploadUserAvatar, deleteUserAvatar } = useAuth();

  const handleFileSelect = useCallback(async (file: File) => {
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      const errorMsg = 'Please select an image file';
      setMessage({ type: 'error', text: errorMsg });
      onError?.(errorMsg);
      return;
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      const errorMsg = 'File size must be less than 5MB';
      setMessage({ type: 'error', text: errorMsg });
      onError?.(errorMsg);
      return;
    }

    // Show preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Upload the file
    setIsUploading(true);
    setMessage(null);

    try {
      const result = await uploadUserAvatar(file);

      if (result.error) {
        setMessage({
          type: 'error',
          text: result.error.message || 'Failed to upload avatar',
        });
        onError?.(result.error.message || 'Failed to upload avatar');
        setPreview(null);
      } else if (result.url) {
        setMessage({
          type: 'success',
          text: 'Avatar uploaded successfully!',
        });
        onSuccess?.(result.url);
      }
    } catch {
      const errorMsg = 'An unexpected error occurred during upload';
      setMessage({ type: 'error', text: errorMsg });
      onError?.(errorMsg);
      setPreview(null);
    } finally {
      setIsUploading(false);
    }
  }, [uploadUserAvatar, onSuccess, onError]);

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = e.dataTransfer.files;
    if (files && files[0]) {
      handleFileSelect(files[0]);
    }
  };

  const handleDeleteAvatar = async () => {
    setIsUploading(true);
    setMessage(null);

    try {
      const result = await deleteUserAvatar();

      if (result.error) {
        setMessage({
          type: 'error',
          text: result.error.message || 'Failed to delete avatar',
        });
      } else {
        setMessage({
          type: 'success',
          text: 'Avatar deleted successfully!',
        });
        setPreview(null);
      }
    } catch {
      setMessage({
        type: 'error',
        text: 'An unexpected error occurred while deleting avatar',
      });
    } finally {
      setIsUploading(false);
    }
  };

  const currentAvatar = preview || user?.avatar_url;

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Profile Photo</CardTitle>
        <CardDescription>
          Upload a photo to personalize your profile
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current Avatar Display */}
        <div className="flex justify-center">
          <div className="relative">
            <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-100 border-4 border-white shadow-lg">
              {currentAvatar ? (
                <img
                  src={currentAvatar}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-200">
                  <svg
                    className="w-12 h-12 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Upload Area */}
        <div
          className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
            dragActive
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-300 hover:border-gray-400'
          } ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          <div className="space-y-2">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              stroke="currentColor"
              fill="none"
              viewBox="0 0 48 48"
            >
              <path
                d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <div className="text-sm text-gray-600">
              <span className="font-medium text-blue-600 hover:text-blue-500 cursor-pointer">
                Click to upload
              </span>{' '}
              or drag and drop
            </div>
            <p className="text-xs text-gray-500">
              PNG, JPG, GIF up to 5MB
            </p>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileInputChange}
            className="hidden"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center space-x-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
          >
            {isUploading ? 'Uploading...' : 'Choose File'}
          </Button>
          
          {user?.avatar_url && (
            <Button
              type="button"
              variant="outline"
              onClick={handleDeleteAvatar}
              disabled={isUploading}
              className="text-red-600 hover:text-red-700"
            >
              Remove
            </Button>
          )}
        </div>

        {/* Status Message */}
        {message && (
          <div
            className={`p-3 rounded-md text-sm ${
              message.type === 'success'
                ? 'bg-green-50 text-green-700 border border-green-200'
                : 'bg-red-50 text-red-700 border border-red-200'
            }`}
          >
            {message.text}
          </div>
        )}

        {/* Upload Progress */}
        {isUploading && (
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-blue-600 h-2 rounded-full animate-pulse w-1/2"></div>
          </div>
        )}

        {/* Guidelines */}
        <div className="text-xs text-gray-500 space-y-1">
          <p>• Use a high-quality photo where your face is clearly visible</p>
          <p>• Square images work best (1:1 aspect ratio)</p>
          <p>• Professional headshots are recommended</p>
        </div>
      </CardContent>
    </Card>
  );
}