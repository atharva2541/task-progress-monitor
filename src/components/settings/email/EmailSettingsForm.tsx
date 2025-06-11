
import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

export function EmailSettingsForm() {
  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="senderName">Sender Name</Label>
        <Input
          id="senderName"
          defaultValue="Audit Tracker"
          className="mt-1"
        />
      </div>
      
      <div>
        <Label htmlFor="footerText">Email Footer Text</Label>
        <Textarea
          id="footerText"
          defaultValue="© 2025 Audit Tracker. All rights reserved."
          className="mt-1"
        />
      </div>
      
      <div className="flex justify-end">
        <Button>Save Email Settings</Button>
      </div>
    </div>
  );
}
