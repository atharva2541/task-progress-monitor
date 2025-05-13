
import { useState } from 'react';
import { TaskAttachment } from '@/types';
import { Button } from '@/components/ui/button';
import { FileUploader } from '@/components/tasks/FileUploader';
import { useTask } from '@/contexts/TaskContext';
import { useAuth } from '@/contexts/AuthContext';
import { Download, FileText, Trash2 } from 'lucide-react';
import { uploadFileToS3, deleteFileFromS3 } from '@/utils/aws-s3';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface TaskAttachmentsProps {
  taskId: string;
  attachments: TaskAttachment[];
  canUpload?: boolean; // Control whether upload is allowed
  canDelete?: boolean; // Control whether deletion is allowed
}

export const TaskAttachments = ({ 
  taskId, 
  attachments, 
  canUpload = false,
  canDelete = false 
}: TaskAttachmentsProps) => {
  const { addTaskAttachment, removeTaskAttachment } = useTask();
  const { user } = useAuth();
  const [isUploading, setIsUploading] = useState(false);
  const [viewAttachment, setViewAttachment] = useState<TaskAttachment | null>(null);
  
  const handleFileChange = async (files: File[]) => {
    if (!files.length) return;
    
    setIsUploading(true);
    
    try {
      // Upload each file in sequence to S3
      for (const file of files) {
        // Create a unique S3 key for the file
        const s3Key = `tasks/${taskId}/${Date.now()}-${file.name}`;
        
        // Upload to S3 and get signed URL
        const fileUrl = await uploadFileToS3(file, s3Key);
        
        // Save the attachment reference
        await addTaskAttachment(taskId, file, fileUrl, s3Key);
      }
    } catch (error) {
      console.error('Error uploading files:', error);
    } finally {
      setIsUploading(false);
    }
  };
  
  const handleDelete = async (attachmentId: string) => {
    if (window.confirm('Are you sure you want to remove this attachment?')) {
      try {
        // Find the attachment to get the S3 key
        const attachment = attachments.find(a => a.id === attachmentId);
        if (attachment && attachment.s3Key) {
          // Delete from S3
          await deleteFileFromS3(attachment.s3Key);
        }
        
        // Remove from task
        removeTaskAttachment(taskId, attachmentId);
      } catch (error) {
        console.error('Error deleting attachment:', error);
      }
    }
  };

  const formatFileSize = (dataUrl: string): string => {
    // Estimate size for data URLs
    const base64 = dataUrl.split(',')[1];
    const sizeInBytes = (base64.length * 3) / 4;
    
    if (sizeInBytes < 1024) return sizeInBytes.toFixed(0) + ' B';
    else if (sizeInBytes < 1048576) return (sizeInBytes / 1024).toFixed(1) + ' KB';
    else return (sizeInBytes / 1048576).toFixed(1) + ' MB';
  };
  
  const getFileIcon = (fileType: string) => {
    return <FileText className="h-5 w-5 text-blue-500" />;
  };
  
  const isImage = (fileType: string) => {
    return fileType.startsWith('image/');
  };
  
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium">Task Attachments</h3>
      
      {canUpload && (
        <div className="border rounded-md p-4 bg-gray-50">
          <h4 className="text-sm font-medium mb-2">Upload Documentation</h4>
          <FileUploader
            onFileChange={handleFileChange}
            multiple={true}
          />
          {isUploading && (
            <div className="mt-2 text-sm text-blue-600">
              Uploading files...
            </div>
          )}
        </div>
      )}
      
      <div>
        {attachments && attachments.length > 0 ? (
          <div className="space-y-2">
            {attachments.map((attachment) => (
              <div key={attachment.id} className="flex items-center justify-between p-3 border rounded-md bg-white">
                <div className="flex items-center space-x-3">
                  {getFileIcon(attachment.fileType)}
                  <div>
                    <p className="font-medium text-sm">{attachment.fileName}</p>
                    <p className="text-xs text-gray-500">
                      {formatFileSize(attachment.fileUrl)} • Uploaded by {
                        user?.id === attachment.uploadedBy ? 'you' : 'another user'
                      }
                    </p>
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setViewAttachment(attachment)}
                      >
                        View
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-auto">
                      <DialogHeader>
                        <DialogTitle>{attachment.fileName}</DialogTitle>
                        <DialogDescription>
                          Uploaded {new Date(attachment.uploadedAt).toLocaleString()}
                        </DialogDescription>
                      </DialogHeader>
                      
                      <div className="mt-4">
                        {isImage(attachment.fileType) ? (
                          <img 
                            src={attachment.fileUrl} 
                            alt={attachment.fileName}
                            className="max-w-full h-auto"
                          />
                        ) : (
                          <div className="flex flex-col items-center justify-center p-8 border rounded-md bg-gray-50">
                            <FileText className="h-16 w-16 text-blue-500 mb-4" />
                            <p className="text-lg font-medium mb-1">{attachment.fileName}</p>
                            <p className="text-sm text-gray-500 mb-4">{attachment.fileType}</p>
                            <a 
                              href={attachment.fileUrl} 
                              download={attachment.fileName}
                              className="flex items-center space-x-2 text-blue-600 hover:underline"
                            >
                              <Download className="h-4 w-4" />
                              <span>Download File</span>
                            </a>
                          </div>
                        )}
                      </div>
                    </DialogContent>
                  </Dialog>
                  
                  <a 
                    href={attachment.fileUrl} 
                    download={attachment.fileName}
                    className="inline-flex items-center justify-center h-8 px-3 text-sm font-medium text-blue-700 bg-white border border-blue-200 rounded-md hover:bg-blue-50"
                  >
                    <Download className="h-4 w-4 mr-1" />
                    Download
                  </a>
                  
                  {canDelete && (
                    <Button 
                      variant="destructive" 
                      size="sm"
                      onClick={() => handleDelete(attachment.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center p-8 border rounded-md bg-gray-50">
            <FileText className="h-10 w-10 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-500">No attachments have been uploaded yet.</p>
          </div>
        )}
      </div>
    </div>
  );
};
