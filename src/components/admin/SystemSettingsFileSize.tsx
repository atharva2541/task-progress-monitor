
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export function SystemSettingsFileSize() {
  const [maxFileSize, setMaxFileSize] = useState<string>('5120');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      const { data, error } = await supabase
        .from('system_settings')
        .select('setting_value')
        .eq('setting_key', 'max_file_size')
        .single();

      if (data && !error) {
        setMaxFileSize(data.setting_value);
      }
    };

    fetchSettings();
  }, []);

  const handleSave = async () => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('system_settings')
        .update({ setting_value: maxFileSize })
        .eq('setting_key', 'max_file_size');

      if (error) throw error;

      toast({
        title: "Settings Updated",
        description: `Maximum file size set to ${maxFileSize} bytes (${(parseInt(maxFileSize) / 1024).toFixed(1)} KB)`
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>File Upload Settings</CardTitle>
        <CardDescription>
          Configure maximum file size for task attachments
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="maxFileSize">Maximum File Size (bytes)</Label>
          <Input
            id="maxFileSize"
            type="number"
            value={maxFileSize}
            onChange={(e) => setMaxFileSize(e.target.value)}
            min="1"
            max="10485760" // 10MB max
          />
          <p className="text-sm text-muted-foreground">
            Current limit: {formatBytes(parseInt(maxFileSize) || 0)}
          </p>
        </div>
        
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            onClick={() => setMaxFileSize('2048')}
            size="sm"
          >
            2KB
          </Button>
          <Button 
            variant="outline" 
            onClick={() => setMaxFileSize('5120')}
            size="sm"
          >
            5KB
          </Button>
          <Button 
            variant="outline" 
            onClick={() => setMaxFileSize('10240')}
            size="sm"
          >
            10KB
          </Button>
          <Button 
            variant="outline" 
            onClick={() => setMaxFileSize('51200')}
            size="sm"
          >
            50KB
          </Button>
        </div>

        <Button onClick={handleSave} disabled={loading}>
          {loading ? 'Saving...' : 'Save Settings'}
        </Button>
      </CardContent>
    </Card>
  );
}
