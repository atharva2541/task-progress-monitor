
import React, { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/components/ui/use-toast";
import { PlaceholderList } from "./PlaceholderList";
import { availablePlaceholders, formatTemplateKey } from "@/lib/email-template-utils";

export interface Template {
  subject: string;
  body: string;
  enabled: boolean;
}

interface TemplateEditorProps {
  templateKey: string;
  template: Template;
  onTemplateUpdate: (key: string, updatedTemplate: Template) => void;
  onTemplateToggle: (key: string) => void;
}

export function TemplateEditor({ 
  templateKey,
  template, 
  onTemplateUpdate, 
  onTemplateToggle 
}: TemplateEditorProps) {
  const subjectRef = useRef<HTMLInputElement>(null);
  const bodyRef = useRef<HTMLTextAreaElement>(null);

  const handleUpdate = () => {
    if (!subjectRef.current || !bodyRef.current) return;

    const updatedTemplate = {
      ...template,
      subject: subjectRef.current.value,
      body: bodyRef.current.value
    };

    onTemplateUpdate(templateKey, updatedTemplate);
    
    toast({
      title: "Template updated",
      description: `The ${templateKey.replace(/([A-Z])/g, ' $1').toLowerCase()} email template has been updated.`,
    });
  };

  const placeholders = availablePlaceholders[templateKey] || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">{formatTemplateKey(templateKey)} Email</h3>
        <div className="flex items-center space-x-2">
          <Label htmlFor={`enable-${templateKey}`}>
            {template.enabled ? "Enabled" : "Disabled"}
          </Label>
          <Switch
            id={`enable-${templateKey}`}
            checked={template.enabled}
            onCheckedChange={() => onTemplateToggle(templateKey)}
          />
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor={`subject-${templateKey}`}>Email Subject</Label>
          <Input
            id={`subject-${templateKey}`}
            defaultValue={template.subject}
            className="mt-1"
            ref={subjectRef}
          />
          <PlaceholderList placeholders={placeholders} />
        </div>
        
        <div>
          <Label htmlFor={`body-${templateKey}`}>Email Body (HTML)</Label>
          <Textarea
            id={`body-${templateKey}`}
            defaultValue={template.body}
            className="min-h-[300px] font-mono text-sm mt-1"
            ref={bodyRef}
          />
          <PlaceholderList placeholders={placeholders} />
        </div>
      </div>
      
      <div className="flex justify-between">
        <Button variant="outline">Preview</Button>
        <Button onClick={handleUpdate}>Save Template</Button>
      </div>
    </div>
  );
}
