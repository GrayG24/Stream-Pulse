import React, { useState, useRef } from 'react';
import { UploadCloud, Image as ImageIcon, X, Link as LinkIcon, Check, AlertCircle } from 'lucide-react';

interface AvatarUploaderProps {
  avatar: string;
  onChange: (avatarUrl: string) => void;
  label?: string;
  required?: boolean;
}

export const AvatarUploader: React.FC<AvatarUploaderProps> = ({
  avatar,
  onChange,
  label = 'Profile Picture (Upload your own)',
  required = false,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processImageFile = (file: File) => {
    setError(null);
    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file (PNG, JPG, WebP, GIF).');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError('File is too large! Maximum image size is 10MB.');
      return;
    }

    setIsProcessing(true);
    const reader = new FileReader();

    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (!result) {
        setError('Failed to read image file.');
        setIsProcessing(false);
        return;
      }

      // Resize image to max 320x320 for clean avatar and optimal storage
      const img = new Image();
      img.onload = () => {
        try {
          const targetSize = 320;
          const canvas = document.createElement('canvas');
          canvas.width = targetSize;
          canvas.height = targetSize;
          const ctx = canvas.getContext('2d');

          if (!ctx) {
            onChange(result);
            setIsProcessing(false);
            return;
          }

          // Center-crop to square
          const minDim = Math.min(img.width, img.height);
          const startX = (img.width - minDim) / 2;
          const startY = (img.height - minDim) / 2;

          ctx.drawImage(img, startX, startY, minDim, minDim, 0, 0, targetSize, targetSize);
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.88);
          onChange(compressedDataUrl);
        } catch {
          onChange(result);
        } finally {
          setIsProcessing(false);
        }
      };

      img.onerror = () => {
        setError('Failed to process image.');
        setIsProcessing(false);
      };

      img.src = result;
    };

    reader.onerror = () => {
      setError('Error reading file.');
      setIsProcessing(false);
    };

    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processImageFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processImageFile(e.target.files[0]);
    }
  };

  const handleApplyUrl = () => {
    const trimmed = urlInput.trim();
    if (!trimmed) {
      setError('Please enter a valid image URL.');
      return;
    }
    setError(null);
    onChange(trimmed);
    setShowUrlInput(false);
    setUrlInput('');
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-[11px] font-semibold text-gray-300 flex items-center gap-1">
          <span>{label}</span>
          {required && <span className="text-red-400">*</span>}
        </label>
        <button
          type="button"
          onClick={() => setShowUrlInput(!showUrlInput)}
          className="text-[10px] text-purple-400 hover:text-purple-300 font-medium cursor-pointer flex items-center gap-1"
        >
          <LinkIcon className="w-3 h-3" />
          <span>{showUrlInput ? 'Hide URL input' : 'Paste Image URL'}</span>
        </button>
      </div>

      {showUrlInput && (
        <div className="flex items-center gap-2 bg-[#0e0e10] p-2 rounded-xl border border-[#2f2f35]">
          <input
            type="url"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            placeholder="https://example.com/avatar.jpg"
            className="flex-1 bg-transparent text-xs text-white placeholder-gray-500 focus:outline-none px-2"
          />
          <button
            type="button"
            onClick={handleApplyUrl}
            className="px-3 py-1 bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
          >
            Apply
          </button>
        </div>
      )}

      {/* Upload Dropzone / Preview */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-2xl p-4 text-center cursor-pointer transition-all ${
          isDragging
            ? 'border-purple-500 bg-purple-950/30'
            : avatar
            ? 'border-[#2f2f35] bg-[#0e0e10] hover:border-purple-500/50'
            : 'border-[#3f3f46] bg-[#0e0e10]/60 hover:border-purple-500 hover:bg-purple-950/10'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileInputChange}
        />

        {avatar ? (
          <div className="flex items-center gap-4 text-left">
            <div className="relative shrink-0">
              <img
                src={avatar}
                alt="Avatar Preview"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src =
                    'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=160&q=80';
                }}
                className="w-14 h-14 rounded-full object-cover ring-2 ring-purple-500 shadow-md shadow-purple-900/30 bg-[#18181b]"
              />
              <div className="absolute -bottom-1 -right-1 bg-purple-600 text-white p-1 rounded-full text-[10px] shadow">
                <Check className="w-3 h-3" />
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-white truncate">Photo Ready</p>
              <p className="text-[10px] text-gray-400 mt-0.5">
                Click or drag & drop a new photo to replace
              </p>
              <div className="mt-1.5 flex items-center gap-2">
                <span className="text-[10px] text-purple-400 font-semibold hover:underline">
                  Browse file
                </span>
                <span className="text-gray-600 text-[10px]">•</span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onChange('');
                  }}
                  className="text-[10px] text-red-400 hover:underline cursor-pointer"
                >
                  Remove
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="py-2 space-y-2">
            <div className="w-10 h-10 mx-auto rounded-full bg-purple-600/20 text-purple-400 flex items-center justify-center">
              {isProcessing ? (
                <div className="w-5 h-5 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" />
              ) : (
                <UploadCloud className="w-5 h-5" />
              )}
            </div>
            <div>
              <p className="text-xs font-bold text-white">
                {isProcessing ? 'Processing image...' : 'Upload your custom profile photo'}
              </p>
              <p className="text-[10px] text-gray-400 mt-0.5">
                Drag & drop your picture here, or click to browse files
              </p>
            </div>
            <p className="text-[9px] text-gray-500">Supports JPG, PNG, WebP or GIF</p>
          </div>
        )}
      </div>

      {error && (
        <div className="p-2 bg-red-950/50 border border-red-800 rounded-xl text-red-300 text-[11px] flex items-center gap-1.5">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};
