
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { 
  parseExcelFile, 
  generateExcelTemplate, 
  TaskExcelRow, 
  convertRowToTask 
} from "@/utils/excel-import";
import { useTask } from "@/contexts/TaskContext";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Download, Upload } from "lucide-react";

interface TaskExcelUploaderProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const TaskExcelUploader: React.FC<TaskExcelUploaderProps> = ({ 
  open, 
  onOpenChange 
}) => {
  const { addTask } = useTask();
  const { users, getUserById } = useAuth();
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [errors, setErrors] = useState<string[]>([]);
  const [parsedData, setParsedData] = useState<TaskExcelRow[]>([]);
  const [status, setStatus] = useState<'idle' | 'preview' | 'processing' | 'complete' | 'error'>('idle');
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setStatus('idle');
      setErrors([]);
      setParsedData([]);
    }
  };
  
  const handleFileUpload = async () => {
    if (!file) return;
    
    try {
      setProcessing(true);
      setProgress(10);
      setStatus('processing');
      
      const result = await parseExcelFile(file, users);
      setProgress(50);
      
      if (result.errors.length > 0) {
        setErrors(result.errors);
        setStatus('error');
      } else if (result.data.length === 0) {
        setErrors(['No valid tasks found in the file']);
        setStatus('error');
      } else {
        setParsedData(result.data);
        setStatus('preview');
      }
    } catch (error) {
      console.error('Error parsing Excel file:', error);
      setErrors([`Failed to parse Excel file: ${error instanceof Error ? error.message : 'Unknown error'}`]);
      setStatus('error');
    } finally {
      setProcessing(false);
      setProgress(100);
    }
  };
  
  const handleImportTasks = async () => {
    try {
      setProcessing(true);
      setStatus('processing');
      setProgress(0);
      
      const total = parsedData.length;
      let completed = 0;
      
      // Process each task with a small delay to avoid UI freezing
      for (const row of parsedData) {
        const taskData = convertRowToTask(row, users);
        addTask(taskData);
        completed++;
        setProgress(Math.floor((completed / total) * 100));
        await new Promise(resolve => setTimeout(resolve, 50)); // Small delay
      }
      
      setStatus('complete');
      toast({
        title: "Import Complete",
        description: `Successfully imported ${parsedData.length} tasks`,
      });
      
      // Reset state after successful import
      setTimeout(() => {
        onOpenChange(false);
        setFile(null);
        setStatus('idle');
        setParsedData([]);
        setErrors([]);
      }, 2000);
    } catch (error) {
      console.error('Error importing tasks:', error);
      setStatus('error');
      setErrors([`Failed to import tasks: ${error instanceof Error ? error.message : 'Unknown error'}`]);
    } finally {
      setProcessing(false);
    }
  };
  
  const handleDownloadTemplate = () => {
    try {
      const templateBlob = generateExcelTemplate(users);
      const url = window.URL.createObjectURL(templateBlob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = 'task_import_template.xlsx';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast({
        title: "Template Downloaded",
        description: "Task import template has been downloaded successfully",
      });
    } catch (error) {
      console.error('Error downloading template:', error);
      toast({
        title: "Download Failed",
        description: `Failed to download template: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive"
      });
    }
  };
  
  // Helper to get user name from email or ID
  const getUserDisplayName = (emailOrId: string) => {
    const userByEmail = users.find(u => u.email.toLowerCase() === emailOrId.toLowerCase());
    if (userByEmail) return userByEmail.name;
    
    const userById = getUserById(emailOrId);
    return userById ? userById.name : emailOrId;
  };
  
  const renderContent = () => {
    switch (status) {
      case 'processing':
        return (
          <div className="py-10 space-y-6 text-center">
            <h3 className="text-lg font-medium">Processing your file...</h3>
            <Progress value={progress} className="w-full" />
            <p className="text-sm text-muted-foreground">{progress}% complete</p>
          </div>
        );
        
      case 'error':
        return (
          <div className="py-4 space-y-4">
            <Alert variant="destructive">
              <AlertTitle>There were problems with your file</AlertTitle>
              <AlertDescription>
                <div className="mt-2 max-h-48 overflow-y-auto text-sm">
                  {errors.map((error, index) => (
                    <div key={index} className="py-1">{error}</div>
                  ))}
                </div>
              </AlertDescription>
            </Alert>
            <div className="text-sm text-muted-foreground">
              Please fix the errors and try uploading again, or download the template for the correct format.
            </div>
          </div>
        );
        
      case 'preview':
        return (
          <div className="py-4 space-y-4">
            <Alert>
              <AlertTitle>Ready to import {parsedData.length} tasks</AlertTitle>
              <AlertDescription>
                Review the tasks below before importing.
              </AlertDescription>
            </Alert>
            
            <div className="mt-4 max-h-64 overflow-y-auto border rounded-md">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-muted sticky top-0">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Name</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Assigned To</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Priority</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Due Date</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {parsedData.slice(0, 10).map((task, index) => (
                    <tr key={index}>
                      <td className="px-4 py-2 whitespace-nowrap text-sm">{task.name || 'N/A'}</td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm">{getUserDisplayName(task.assignedTo)}</td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm">{task.priority || 'N/A'}</td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm">{task.dueDate || 'N/A'}</td>
                    </tr>
                  ))}
                  {parsedData.length > 10 && (
                    <tr>
                      <td colSpan={4} className="px-4 py-2 text-sm text-center text-muted-foreground">
                        And {parsedData.length - 10} more tasks...
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        );
        
      case 'complete':
        return (
          <div className="py-10 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-lg font-medium mb-2">Import Complete!</h3>
            <p className="text-sm text-muted-foreground">Successfully imported {parsedData.length} tasks</p>
          </div>
        );
        
      default:
        return (
          <Tabs defaultValue="upload" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="upload">Upload File</TabsTrigger>
              <TabsTrigger value="template">Get Template</TabsTrigger>
            </TabsList>
            
            <TabsContent value="upload" className="space-y-4 py-4">
              <div className="flex items-center justify-center w-full">
                <label
                  htmlFor="excel-file"
                  className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-muted/30 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Upload className="w-8 h-8 mb-2 text-gray-500" />
                    <p className="mb-2 text-sm text-muted-foreground">
                      <span className="font-semibold">Click to upload</span> or drag and drop
                    </p>
                    <p className="text-xs text-muted-foreground">Excel files only (*.xlsx)</p>
                  </div>
                  <input
                    id="excel-file"
                    type="file"
                    accept=".xlsx,.xls"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                </label>
              </div>
              
              {file && (
                <div className="flex items-center justify-between p-2 border rounded-md bg-muted/30">
                  <span className="text-sm truncate max-w-[80%]">{file.name}</span>
                  <Button
                    type="button"
                    variant="default"
                    size="sm"
                    onClick={() => setFile(null)}
                  >
                    Change
                  </Button>
                </div>
              )}
              
              {/* Add help text about user email requirements */}
              <div className="text-sm text-muted-foreground p-2 bg-blue-50 border border-blue-200 rounded-md">
                <p className="font-medium text-blue-700 mb-1">Important:</p>
                <p>Use valid user email addresses for Assigned To, Checker1, and Checker2 fields.</p>
                <p>Download the template for reference of available users.</p>
              </div>
            </TabsContent>
            
            <TabsContent value="template" className="py-4 space-y-4">
              <p className="text-sm text-muted-foreground">
                Download our Excel template to ensure your data is formatted correctly for import. 
                The template includes sample data, instructions, and a list of all users.
              </p>
              
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={handleDownloadTemplate}
              >
                <Download className="mr-2 h-4 w-4" />
                Download Template
              </Button>
            </TabsContent>
          </Tabs>
        );
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md md:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {status === 'preview' ? 'Review Tasks' : 
             status === 'complete' ? 'Import Complete' : 
             status === 'error' ? 'Import Errors' : 
             'Import Tasks from Excel'}
          </DialogTitle>
          <DialogDescription>
            {status === 'preview' ? 'Review the tasks before importing them to the system.' : 
             status === 'complete' ? 'All tasks have been successfully imported.' : 
             status === 'error' ? 'Please fix the errors and try again.' : 
             'Upload an Excel file with your tasks or download our template.'}
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex-1">
          {renderContent()}
        </div>
        
        <DialogFooter className="gap-2 sm:gap-0">
          {status === 'idle' && (
            <>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={processing}
              >
                Cancel
              </Button>
              <Button
                type="button"
                disabled={!file || processing}
                onClick={handleFileUpload}
              >
                Validate File
              </Button>
            </>
          )}
          
          {status === 'preview' && (
            <>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={processing}
              >
                Cancel
              </Button>
              <Button
                type="button"
                disabled={processing}
                onClick={handleImportTasks}
              >
                Import {parsedData.length} Tasks
              </Button>
            </>
          )}
          
          {status === 'error' && (
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Close
            </Button>
          )}
          
          {status === 'complete' && (
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Close
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
