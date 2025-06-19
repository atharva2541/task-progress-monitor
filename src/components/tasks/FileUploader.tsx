
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Upload, X, FileText } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface FileUploaderProps {
  onFileChange: (files: File[]) => void;
  multiple?: boolean;
  maxFileSize?: number; // In kilobytes (will be overridden by system settings)
}

interface FileSettings {
  maxFileSizeKb: number;
  allowedFileTypes: string[];
  maxFilesPerTask: number;
  enableFileUploads: boolean;
}

export const FileUploader = ({
  onFileChange,
  multiple = false,
  maxFileSize = 1, // Default 1KB
}: FileUploaderProps) => {
  const [files, setFiles] = useState<File[]>([]);
  const [settings, setSettings] = useState<FileSettings>({
    maxFileSizeKb: 1,
    allowedFileTypes: ['pdf', 'doc', 'docx', 'txt', 'jpg', 'png', 'xlsx', 'csv'],
    maxFilesPerTask: 5,
    enableFileUploads: true
  });
  const [isLoadingSettings, setIsLoadingSettings] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadFileSettings();
  }, []);
  
  const loadFileSettings = async () => {
    try {
      const response = await fetch('/api/system/settings/file-management', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const fileSettings = await response.json();
        setSettings(fileSettings);
      }
    } catch (error) {
      console.error('Failed to load file settings:', error);
    } finally {
      setIsLoadingSettings(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    
    if (!settings.enableFileUploads) {
      toast({
        title: "File uploads disabled",
        description: "File uploads are currently disabled by the administrator.",
        variant: "destructive"
      });
      return;
    }

    // Check if adding these files would exceed the limit
    const totalFiles = multiple ? files.length + selectedFiles.length : selectedFiles.length;
    if (totalFiles > settings.maxFilesPerTask) {
      toast({
        title: "Too many files",
        description: `Maximum ${settings.maxFilesPerTask} files allowed per task.`,
        variant: "destructive"
      });
      return;
    }
    
    // Check file size limits
    const oversizedFiles = selectedFiles.filter(file => 
      file.size > settings.maxFileSizeKb * 1024
    );
    
    // Check file type restrictions
    const invalidTypeFiles = selectedFiles.filter(file => {
      const extension = file.name.split('.').pop()?.toLowerCase();
      return extension && !settings.allowedFileTypes.includes(extension);
    });
    
    if (oversizedFiles.length > 0) {
      toast({
        title: "File too large",
        description: `Some files exceed the ${settings.maxFileSizeKb}KB size limit and were not added.`,
        variant: "destructive"
      });
    }

    if (invalidTypeFiles.length > 0) {
      toast({
        title: "Invalid file type",
        description: `Only these file types are allowed: ${settings.allowedFileTypes.join(', ')}`,
        variant: "destructive"
      });
    }
      
    // Filter out oversized and invalid type files
    const validFiles = selectedFiles.filter(file => {
      const extension = file.name.split('.').pop()?.toLowerCase();
      return file.size <= settings.maxFileSizeKb * 1024 && 
             extension && settings.allowedFileTypes.includes(extension);
    });
    
    // Add valid files to state
    if (multiple) {
      const newFiles = [...files, ...validFiles];
      setFiles(newFiles);
      onFileChange(newFiles);
    } else if (validFiles.length > 0) {
      setFiles([validFiles[0]]);
      onFileChange([validFiles[0]]);
    }

    // Clear the input
    e.target.value = '';
  };
  
  const removeFile = (indexToRemove: number) => {
    const newFiles = files.filter((_, index) => index !== indexToRemove);
    setFiles(newFiles);
    onFileChange(newFiles);
  };
  
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    else return (bytes / 1048576).toFixed(1) + ' MB';
  };

  if (isLoadingSettings) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!settings.enableFileUploads) {
    return (
      <div className="text-center py-8 text-muted-foreground border rounded-md">
        <FileText className="mx-auto h-8 w-8 mb-2" />
        <p>File uploads are currently disabled</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-center w-full">
        <label
          htmlFor="file-upload"
          className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
        >
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            <Upload className="w-8 h-8 mb-3 text-gray-500" />
            <p className="mb-2 text-sm text-gray-500">
              <span className="font-semibold">Click to upload</span> or drag and drop
            </p>
            <p className="text-xs text-gray-500">
              Max {settings.maxFileSizeKb}KB • {settings.allowedFileTypes.join(', ')} files
            </p>
            <p className="text-xs text-gray-500">
              {multiple ? `Up to ${settings.maxFilesPerTask} files` : 'Single file upload'}
            </p>
          </div>
          <Input
            id="file-upload"
            type="file"
            className="hidden"
            onChange={handleFileChange}
            multiple={multiple}
            accept={settings.allowedFileTypes.map(type => `.${type}`).join(',')}
          />
        </label>
      </div>
      
      {files.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Selected Files:</h4>
          <ul className="space-y-2">
            {files.map((file, index) => (
              <li key={`${file.name}-${index}`} className="flex items-center justify-between p-2 rounded-md bg-gray-50">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-blue-500" />
                  <span className="text-sm font-medium">{file.name}</span>
                  <span className="text-xs text-gray-500">({formatFileSize(file.size)})</span>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => removeFile(index)}
                  className="h-8 w-8 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
