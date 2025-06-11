
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "@/components/ui/use-toast";
import { AlertTriangle } from "lucide-react";
import { useState } from "react";

export function DataManagementSettings() {
  const [openDialog, setOpenDialog] = useState<string | null>(null);
  const [confirmInput, setConfirmInput] = useState("");
  
  const handleBackup = () => {
    toast({
      title: "Backup initiated",
      description: "System data backup has been initiated. This may take several minutes.",
    });
    setTimeout(() => {
      toast({
        title: "Backup completed",
        description: "System data has been successfully backed up.",
      });
    }, 3000);
  };
  
  const handleDataPurge = () => {
    if (confirmInput !== "PURGE") {
      toast({
        title: "Confirmation failed",
        description: "You must type PURGE to confirm this action.",
        variant: "destructive",
      });
      return;
    }
    
    toast({
      title: "Data purge initiated",
      description: "Old data purge has been initiated. This may take several minutes.",
    });
    
    setOpenDialog(null);
    setConfirmInput("");
    
    setTimeout(() => {
      toast({
        title: "Data purge completed",
        description: "Old data has been successfully purged from the system.",
      });
    }, 3000);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Data Backup</CardTitle>
          <CardDescription>
            Configure and manage system data backups.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="backupFrequency">Backup Frequency</Label>
                <Select defaultValue="daily">
                  <SelectTrigger id="backupFrequency">
                    <SelectValue placeholder="Select frequency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hourly">Hourly</SelectItem>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="retentionPeriod">Retention Period (days)</Label>
                <Input id="retentionPeriod" type="number" defaultValue="30" />
              </div>
            </div>
            
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <Label className="text-base">Automatic Backups</Label>
                <p className="text-sm text-muted-foreground">
                  Enable scheduled automatic backups of system data.
                </p>
              </div>
              <Switch defaultChecked />
            </div>
            
            <div>
              <Button 
                variant="outline" 
                onClick={handleBackup}
                className="w-full"
              >
                Run Manual Backup Now
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Data Archiving</CardTitle>
          <CardDescription>
            Configure data archiving policies.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <Label className="text-base">Auto-Archive Old Tasks</Label>
                <p className="text-sm text-muted-foreground">
                  Automatically archive tasks older than the specified period.
                </p>
              </div>
              <Switch defaultChecked />
            </div>
            
            <div>
              <Label htmlFor="archivePeriod">Archive Tasks Older Than</Label>
              <Select defaultValue="365">
                <SelectTrigger id="archivePeriod">
                  <SelectValue placeholder="Select period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="30">30 days</SelectItem>
                  <SelectItem value="90">90 days</SelectItem>
                  <SelectItem value="180">180 days</SelectItem>
                  <SelectItem value="365">1 year</SelectItem>
                  <SelectItem value="730">2 years</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <Label className="text-base">Compress Archived Data</Label>
                <p className="text-sm text-muted-foreground">
                  Apply compression to archived data to save storage space.
                </p>
              </div>
              <Switch defaultChecked />
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Data Maintenance</CardTitle>
          <CardDescription>
            Perform database maintenance operations.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Button 
              variant="outline" 
              className="w-full" 
              onClick={() => {
                toast({
                  title: "Optimization initiated",
                  description: "Database optimization has been started. This may take a few minutes.",
                });
                setTimeout(() => {
                  toast({
                    title: "Optimization complete",
                    description: "Database has been successfully optimized.",
                  });
                }, 2000);
              }}
            >
              Optimize Database
            </Button>
          </div>
          
          <Dialog open={openDialog === "purge"} onOpenChange={(open) => {
            if (!open) setOpenDialog(null);
            else setOpenDialog("purge");
          }}>
            <DialogTrigger asChild>
              <Button 
                variant="destructive" 
                className="w-full"
              >
                Purge Old Data
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <div className="flex items-center gap-2 text-destructive">
                  <AlertTriangle />
                  <DialogTitle>Warning: Destructive Action</DialogTitle>
                </div>
                <DialogDescription>
                  This will permanently delete all data older than the specified retention period. 
                  This action cannot be undone. To confirm, type "PURGE" below.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div>
                  <Label htmlFor="purgeConfirm">Type "PURGE" to confirm</Label>
                  <Input 
                    id="purgeConfirm" 
                    value={confirmInput} 
                    onChange={(e) => setConfirmInput(e.target.value)} 
                    className="mt-2" 
                  />
                </div>
                <div>
                  <Label htmlFor="purgeAge">Purge data older than</Label>
                  <Select defaultValue="730">
                    <SelectTrigger id="purgeAge" className="mt-2">
                      <SelectValue placeholder="Select period" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="365">1 year</SelectItem>
                      <SelectItem value="730">2 years</SelectItem>
                      <SelectItem value="1095">3 years</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setOpenDialog(null)}>Cancel</Button>
                <Button variant="destructive" onClick={handleDataPurge}>Confirm Purge</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>
    </div>
  );
}
