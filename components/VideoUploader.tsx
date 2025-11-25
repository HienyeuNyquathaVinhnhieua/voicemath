import React, { useCallback, useState } from 'react';
import { UploadCloud, FileVideo, X, AlertCircle, Plus } from 'lucide-react';
import { formatBytes } from '../utils/fileHelper';
import { MAX_VIDEO_SIZE_MB, MAX_TOTAL_SIZE_MB } from '../constants';

interface VideoUploaderProps {
  onFilesSelect: (files: File[]) => void;
  selectedFiles: File[];
  disabled?: boolean;
}

const VideoUploader: React.FC<VideoUploaderProps> = ({ onFilesSelect, selectedFiles, disabled }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateFiles = (newFiles: File[], currentFiles: File[]): boolean => {
    setError(null);
    const allFiles = [...currentFiles, ...newFiles];
    
    // Check total size
    const totalSize = allFiles.reduce((acc, file) => acc + file.size, 0);
    const totalSizeMB = totalSize / (1024 * 1024);

    if (totalSizeMB > MAX_TOTAL_SIZE_MB) {
      setError(`Total size exceeds ${MAX_TOTAL_SIZE_MB}MB. Please split videos or compress them.`);
      return false;
    }

    // Check individual files
    for (const file of newFiles) {
       if (!file.type.startsWith('video/')) {
        setError("Only video files are supported.");
        return false;
      }
      if (file.size > MAX_VIDEO_SIZE_MB * 1024 * 1024) {
        setError(`File "${file.name}" is too large (${formatBytes(file.size)}). Max single file size is ${MAX_VIDEO_SIZE_MB}MB.`);
        return false;
      }
    }

    return true;
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) setIsDragging(true);
  }, [disabled]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (disabled) return;

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const filesArray = Array.from(e.dataTransfer.files) as File[];
      if (validateFiles(filesArray, selectedFiles)) {
        onFilesSelect([...selectedFiles, ...filesArray]);
      }
    }
  }, [onFilesSelect, selectedFiles, disabled]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const filesArray = Array.from(e.target.files) as File[];
      if (validateFiles(filesArray, selectedFiles)) {
        onFilesSelect([...selectedFiles, ...filesArray]);
      }
    }
    // Reset input value to allow selecting the same file again if needed
    e.target.value = '';
  }, [onFilesSelect, selectedFiles]);

  const removeFile = (index: number) => {
    const newFiles = [...selectedFiles];
    newFiles.splice(index, 1);
    onFilesSelect(newFiles);
    setError(null);
  };

  return (
    <div className="w-full space-y-4">
      {selectedFiles.length > 0 && (
        <div className="space-y-2">
          {selectedFiles.map((file, index) => (
            <div key={`${file.name}-${index}`} className="w-full p-3 bg-slate-800/50 border border-slate-700 rounded-xl flex items-center justify-between group animate-in slide-in-from-left-2 duration-300">
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="p-2 bg-blue-500/20 rounded-lg text-blue-400 shrink-0">
                  <FileVideo size={20} />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="font-medium text-sm text-slate-200 truncate max-w-[200px] md:max-w-xs">{file.name}</span>
                  <span className="text-xs text-slate-400">{formatBytes(file.size)} • Part {index + 1}</span>
                </div>
              </div>
              {!disabled && (
                <button 
                  onClick={() => removeFile(index)}
                  className="p-2 hover:bg-red-500/20 text-slate-400 hover:text-red-400 rounded-lg transition-colors"
                >
                  <X size={18} />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      <label 
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          relative flex flex-col items-center justify-center w-full 
          ${selectedFiles.length > 0 ? 'h-32' : 'h-64'}
          border-2 border-dashed rounded-xl cursor-pointer transition-all duration-300
          ${isDragging 
            ? 'border-blue-500 bg-blue-500/10' 
            : 'border-slate-700 bg-slate-800/30 hover:bg-slate-800/50 hover:border-slate-600'
          }
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        <div className="flex flex-col items-center justify-center py-4 text-center px-4">
          {selectedFiles.length > 0 ? (
             <Plus className={`w-8 h-8 mb-2 ${isDragging ? 'text-blue-400' : 'text-slate-400'}`} />
          ) : (
             <UploadCloud className={`w-12 h-12 mb-4 ${isDragging ? 'text-blue-400' : 'text-slate-400'}`} />
          )}
          
          <p className="mb-1 text-sm text-slate-300 font-medium">
            <span className="font-semibold text-blue-400">Click to upload</span> {selectedFiles.length === 0 && "or drag and drop"}
          </p>
          <p className="text-xs text-slate-500">
            {selectedFiles.length > 0 ? "Add another video part" : "Upload Video or Multiple Parts"}
          </p>
           {selectedFiles.length === 0 && (
            <p className="text-xs text-slate-600 mt-2 max-w-xs">
              If your video is too long, you can upload it as multiple split parts (Part 1, Part 2...).
            </p>
           )}
        </div>
        <input 
          type="file" 
          className="hidden" 
          accept="video/*"
          multiple
          onChange={handleInputChange}
          disabled={disabled}
        />
      </label>
      
      {error && (
        <div className="flex items-center gap-2 text-sm text-red-400 animate-pulse bg-red-500/10 p-2 rounded-lg border border-red-500/20">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};

export default VideoUploader;