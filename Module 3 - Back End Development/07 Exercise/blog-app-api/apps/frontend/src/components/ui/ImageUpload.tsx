// src/components/ui/ImageUpload.tsx
// Component for handling image selection and uploading to the backend.
// Logic:
//   - Uses a hidden file input triggered by a stylized "Upload" area.
//   - Displays a preview of the selected/uploaded image.
//   - Handles the upload process to /api/uploads and returns the resulting URL via onUploadSuccess.

import { useState, useRef, ChangeEvent } from 'react';
import { Upload, X, ImageIcon, Loader2 } from 'lucide-react';
import apiClient from '@/api/client';
import toast from 'react-hot-toast';

interface ImageUploadProps {
  value?: string;
  onUploadSuccess: (url: string) => void;
  onClear: () => void;
  label?: string;
}

export default function ImageUpload({ value, onUploadSuccess, onClear, label }: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Check file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB');
      return;
    }

    const formData = new FormData();
    formData.append('image', file);

    setIsUploading(true);
    try {
      const res = await apiClient.post('/uploads', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      onUploadSuccess(res.data.url);
      toast.success('Image uploaded');
    } catch (err: any) {
      const msg = err.response?.data?.error || 'Failed to upload image';
      toast.error(msg);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-2">
      {label && <label className="block text-sm font-medium text-gray-400">{label}</label>}
      
      <div className="relative group">
        {value ? (
          <div className="relative aspect-video w-full overflow-hidden rounded-lg border border-white/10 glass-card">
            <img 
              src={value.startsWith('/') ? `http://localhost:3000${value}` : value} 
              alt="Preview" 
              className="h-full w-full object-cover"
            />
            <button
              type="button"
              onClick={onClear}
              className="absolute top-2 right-2 p-1.5 bg-dark/80 text-white rounded-full hover:bg-red-500 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="flex flex-col items-center justify-center aspect-video w-full rounded-lg border-2 border-dashed border-white/10 bg-white/5 hover:bg-white/10 hover:border-violet-500/50 transition-all cursor-pointer"
          >
            {isUploading ? (
              <Loader2 className="h-8 w-8 text-violet-500 animate-spin" />
            ) : (
              <>
                <div className="p-3 bg-violet-500/10 rounded-full mb-3 group-hover:scale-110 transition-transform">
                  <Upload className="h-6 w-6 text-violet-400" />
                </div>
                <p className="text-sm font-medium text-gray-300">Click to upload cover image</p>
                <p className="text-xs text-gray-500 mt-1">SVG, PNG, JPG (max 5MB)</p>
              </>
            )}
          </div>
        )}
        
        <input 
          type="file" 
          ref={fileInputRef}
          className="hidden" 
          accept="image/*"
          onChange={handleFileChange}
          disabled={isUploading}
        />
      </div>
    </div>
  );
}
