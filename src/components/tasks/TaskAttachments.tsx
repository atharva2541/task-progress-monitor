
import React from 'react';
import { TaskAttachment } from '@/types';
import { Button } from '@/components/ui/button';
import { FileUp, Trash2, Download, File, FileText, FileImage, FileArchive } from 'lucide-react';
import { useTask } from '@/contexts/TaskContext';

interface TaskAttachmentsProps {
  taskId: string;
  attachments: TaskAttachment[];
  canUpload: boolean;
  canDelete: boolean;
}

export const TaskAttachments: React.FC<TaskAttachmentsProps> = ({ 
  taskId,
  attachments,
  canUpload,
  canDelete
}) => {
  const { uploadTaskAttachment, deleteTaskAttachment, getUserById } = useTask();

  // Handle file upload
  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        await uploadTaskAttachment(taskId, file);
      } catch (error) {
        console.error("Error uploading file:", error);
      }
    }
  };

  // Get icon based on file type
  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) {
      return <FileImage className="h-4 w-4" />;
    } else if (fileType === 'application/pdf') {
      return <FileText className="h-4 w-4" />;
    } else if (fileType.startsWith('application/zip')) {
      return <FileArchive className="h-4 w-4" />;
    } else {
      return <File className="h-4 w-4" />;
    }
  };

  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold">Attachments</h3>
        {canUpload && (
          <Button variant="outline" size="sm" onClick={() => document.getElementById('fileUpload')?.click()}>
            <FileUp className="mr-2 h-4 w-4" />
            Upload File
            <input
              type="file"
              id="fileUpload"
              className="hidden"
              onChange={handleFileChange}
            />
          </Button>
        )}
      </div>
      
      {attachments.length > 0 ? (
        <div className="space-y-2">
          {attachments.map((attachment) => {
            // Get user name from userId
            const uploader = getUserById(attachment.userId);
            
            return (
              <div key={attachment.id} className="flex items-center justify-between p-3 border rounded-md bg-gray-50">
                <div className="flex items-center space-x-3">
                  {getFileIcon(attachment.fileType)}
                  <div>
                    <p className="font-medium">{attachment.fileName}</p>
                    <p className="text-xs text-gray-500">
                      Uploaded by {uploader?.name || 'Unknown'} on {formatDate(attachment.uploadedAt)}
                    </p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button variant="ghost" size="icon" onClick={() => window.open(attachment.fileUrl, '_blank')}>
                    <Download className="h-4 w-4" />
                  </Button>
                  
                  {canDelete && (
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => deleteTaskAttachment(taskId, attachment.id)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-8 text-muted-foreground border rounded-md">
          <File className="mx-auto h-8 w-8 mb-2" />
          <p>No attachments yet</p>
        </div>
      )}
    </div>
  );
};
