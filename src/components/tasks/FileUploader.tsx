
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Upload, X, FileText } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface FileUploaderProps {
  onFileChange: (files: File[]) => void;
  multiple?: boolean;
  maxFileSize?: number; // In megabytes
}

export const FileUploader = ({
  onFileChange,
  multiple = false,
  maxFileSize = 10, // Default 10MB max file size
}: FileUploaderProps) => {
  const [files, setFiles] = useState<File[]>([]);
  const { toast } = useToast();
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    
    // Check file size limits
    const oversizedFiles = selectedFiles.filter(file => 
      file.size > maxFileSize * 1024 * 1024
    );
    
    if (oversizedFiles.length > 0) {
      toast({
        title: "File too large",
        description: `Some files exceed the ${maxFileSize}MB size limit and were not added.`,
        variant: "destructive"
      });
      
      // Filter out oversized files
      const validFiles = selectedFiles.filter(file => 
        file.size <= maxFileSize * 1024 * 1024
      );
      
      // Add valid files to state
      if (multiple) {
        const newFiles = [...files, ...validFiles];
        setFiles(newFiles);
        onFileChange(newFiles);
      } else if (validFiles.length > 0) {
        setFiles([validFiles[0]]);
        onFileChange([validFiles[0]]);
      }
    } else {
      // All files are within size limit
      if (multiple) {
        const newFiles = [...files, ...selectedFiles];
        setFiles(newFiles);
        onFileChange(newFiles);
      } else {
        setFiles(selectedFiles);
        onFileChange(selectedFiles);
      }
    }
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
              {multiple ? 'Upload files' : 'Upload a file'} (any type accepted)
            </p>
          </div>
          <Input
            id="file-upload"
            type="file"
            className="hidden"
            onChange={handleFileChange}
            multiple={multiple}
            accept="*/*" // Accept all file types
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
