
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { Trash2, Plus } from "lucide-react";

interface FileSettings {
  maxFileSizeKb: number;
  allowedFileTypes: string[];
  maxFilesPerTask: number;
  enableFileUploads: boolean;
}

const defaultFileTypes = [
  'pdf', 'doc', 'docx', 'txt', 'jpg', 'jpeg', 'png', 'gif', 
  'xlsx', 'xls', 'csv', 'zip', 'rar', 'mp4', 'mp3'
];

export const FileManagementSettings = () => {
  const [settings, setSettings] = useState<FileSettings>({
    maxFileSizeKb: 1,
    allowedFileTypes: ['pdf', 'doc', 'docx', 'txt', 'jpg', 'png', 'xlsx', 'csv'],
    maxFilesPerTask: 5,
    enableFileUploads: true
  });
  const [isLoading, setIsLoading] = useState(false);
  const [newFileType, setNewFileType] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const response = await fetch('/api/system/settings/file-management');
      if (response.ok) {
        const data = await response.json();
        setSettings(data);
      }
    } catch (error) {
      console.error('Failed to load file settings:', error);
    }
  };

  const saveSettings = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/system/settings/file-management', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(settings)
      });

      if (response.ok) {
        toast({
          title: "Settings Updated",
          description: "File management settings have been saved successfully.",
        });
      } else {
        throw new Error('Failed to save settings');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save file management settings.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const addFileType = () => {
    if (newFileType && !settings.allowedFileTypes.includes(newFileType.toLowerCase())) {
      setSettings(prev => ({
        ...prev,
        allowedFileTypes: [...prev.allowedFileTypes, newFileType.toLowerCase()]
      }));
      setNewFileType('');
    }
  };

  const removeFileType = (typeToRemove: string) => {
    setSettings(prev => ({
      ...prev,
      allowedFileTypes: prev.allowedFileTypes.filter(type => type !== typeToRemove)
    }));
  };

  const addDefaultFileType = (type: string) => {
    if (!settings.allowedFileTypes.includes(type)) {
      setSettings(prev => ({
        ...prev,
        allowedFileTypes: [...prev.allowedFileTypes, type]
      }));
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>File Upload Settings</CardTitle>
          <CardDescription>
            Configure file upload limits and restrictions for the entire system.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Enable/Disable File Uploads */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Enable File Uploads</Label>
              <p className="text-sm text-muted-foreground">
                Allow users to upload files to tasks
              </p>
            </div>
            <Switch
              checked={settings.enableFileUploads}
              onCheckedChange={(checked) => 
                setSettings(prev => ({ ...prev, enableFileUploads: checked }))
              }
            />
          </div>

          {/* Max File Size */}
          <div className="space-y-2">
            <Label htmlFor="maxFileSize">Maximum File Size</Label>
            <div className="flex items-center space-x-2">
              <Input
                id="maxFileSize"
                type="number"
                min="1"
                max="10240"
                value={settings.maxFileSizeKb}
                onChange={(e) => 
                  setSettings(prev => ({ ...prev, maxFileSizeKb: parseInt(e.target.value) || 1 }))
                }
                className="w-32"
              />
              <span className="text-sm text-muted-foreground">KB</span>
              <span className="text-sm text-muted-foreground">
                ({(settings.maxFileSizeKb / 1024).toFixed(2)} MB)
              </span>
            </div>
          </div>

          {/* Max Files Per Task */}
          <div className="space-y-2">
            <Label htmlFor="maxFiles">Maximum Files Per Task</Label>
            <Input
              id="maxFiles"
              type="number"
              min="1"
              max="20"
              value={settings.maxFilesPerTask}
              onChange={(e) => 
                setSettings(prev => ({ ...prev, maxFilesPerTask: parseInt(e.target.value) || 1 }))
              }
              className="w-32"
            />
          </div>

          {/* Allowed File Types */}
          <div className="space-y-4">
            <Label>Allowed File Types</Label>
            
            {/* Current file types */}
            <div className="flex flex-wrap gap-2">
              {settings.allowedFileTypes.map((type) => (
                <Badge key={type} variant="secondary" className="flex items-center gap-1">
                  .{type}
                  <button
                    onClick={() => removeFileType(type)}
                    className="ml-1 hover:text-destructive"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>

            {/* Add new file type */}
            <div className="flex items-center space-x-2">
              <Input
                placeholder="e.g., pdf, jpg, doc"
                value={newFileType}
                onChange={(e) => setNewFileType(e.target.value)}
                className="w-40"
                onKeyPress={(e) => e.key === 'Enter' && addFileType()}
              />
              <Button type="button" size="sm" onClick={addFileType}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {/* Quick add common types */}
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Quick add common types:</p>
              <div className="flex flex-wrap gap-2">
                {defaultFileTypes
                  .filter(type => !settings.allowedFileTypes.includes(type))
                  .map((type) => (
                    <Button
                      key={type}
                      variant="outline"
                      size="sm"
                      onClick={() => addDefaultFileType(type)}
                    >
                      + .{type}
                    </Button>
                  ))}
              </div>
            </div>
          </div>

          <Button onClick={saveSettings} disabled={isLoading}>
            {isLoading ? 'Saving...' : 'Save Settings'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
