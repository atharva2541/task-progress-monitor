
import { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/components/ui/use-toast";

export function EmailTemplates() {
  const [activeTemplate, setActiveTemplate] = useState("welcome");
  
  // Refs to access input values
  const subjectRefs = useRef({});
  const bodyRefs = useRef({});
  
  // Mock template data
  const [templates, setTemplates] = useState({
    welcome: {
      subject: "Welcome to Audit Tracker",
      body: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
        <h2 style="color: #5a3FFF;">Welcome to Audit Tracker</h2>
        <p>Hello {{name}},</p>
        <p>Your account has been created in Audit Tracker. Here are your login details:</p>
        <ul>
          <li><strong>Email:</strong> {{email}}</li>
          <li><strong>Temporary Password:</strong> {{password}}</li>
        </ul>
        <p>For security reasons, you will be required to change your password on your first login.</p>
        <p>Thank you,<br/>Audit Tracker Team</p>
      </div>`,
      enabled: true
    },
    taskAssignment: {
      subject: "New Task Assignment: {{taskName}}",
      body: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
        <h2 style="color: #5a3FFF;">New Task Assigned</h2>
        <p>Hello {{name}},</p>
        <p>A new task has been assigned to you:</p>
        <div style="background-color: #f7f7f7; padding: 15px; margin: 15px 0; border-radius: 5px;">
          <p><strong>Task:</strong> {{taskName}}</p>
          <p><strong>Due Date:</strong> {{dueDate}}</p>
          <p><strong>Priority:</strong> {{priority}}</p>
        </div>
        <p>Please login to the Audit Tracker system to view and manage this task.</p>
        <p>Thank you,<br/>Audit Tracker Team</p>
      </div>`,
      enabled: true
    },
    taskReminder: {
      subject: "Task Reminder: {{taskName}}",
      body: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
        <h2 style="color: #5a3FFF;">Task Reminder</h2>
        <p>Hello {{name}},</p>
        <p>This is a reminder about your upcoming task:</p>
        <div style="background-color: #f7f7f7; padding: 15px; margin: 15px 0; border-radius: 5px;">
          <p><strong>Task:</strong> {{taskName}}</p>
          <p><strong>Due Date:</strong> {{dueDate}}</p>
          <p><strong>Days Remaining:</strong> {{daysRemaining}}</p>
        </div>
        <p>Please login to the Audit Tracker system to complete this task.</p>
        <p>Thank you,<br/>Audit Tracker Team</p>
      </div>`,
      enabled: true
    },
    taskOverdue: {
      subject: "OVERDUE: {{taskName}}",
      body: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
        <h2 style="color: #FF3A33;">Task Overdue</h2>
        <p>Hello {{name}},</p>
        <p>The following task is now overdue:</p>
        <div style="background-color: #fff1f0; padding: 15px; margin: 15px 0; border-radius: 5px; border-left: 4px solid #FF3A33;">
          <p><strong>Task:</strong> {{taskName}}</p>
          <p><strong>Due Date:</strong> {{dueDate}}</p>
          <p><strong>Days Overdue:</strong> {{daysOverdue}}</p>
        </div>
        <p>Please login to the Audit Tracker system to complete this task as soon as possible.</p>
        <p>Thank you,<br/>Audit Tracker Team</p>
      </div>`,
      enabled: true
    },
  });
  
  const updateTemplate = (templateKey) => {
    // Use refs to safely access input values
    const subjectRef = subjectRefs.current[templateKey] as HTMLInputElement;
    const bodyRef = bodyRefs.current[templateKey] as HTMLTextAreaElement;
    
    if (!subjectRef || !bodyRef) return;
    
    const updatedTemplates = { ...templates };
    updatedTemplates[templateKey] = {
      ...updatedTemplates[templateKey],
      subject: subjectRef.value,
      body: bodyRef.value
    };
    
    setTemplates(updatedTemplates);
    toast({
      title: "Template updated",
      description: `The ${templateKey.replace(/([A-Z])/g, ' $1').toLowerCase()} email template has been updated.`,
    });
  };
  
  const toggleTemplate = (templateKey) => {
    const updatedTemplates = { ...templates };
    updatedTemplates[templateKey] = {
      ...updatedTemplates[templateKey],
      enabled: !updatedTemplates[templateKey].enabled
    };
    setTemplates(updatedTemplates);
    
    const status = updatedTemplates[templateKey].enabled ? "enabled" : "disabled";
    toast({
      title: `Template ${status}`,
      description: `The ${templateKey.replace(/([A-Z])/g, ' $1').toLowerCase()} email template has been ${status}.`,
    });
  };

  const formatTemplateKey = (key) => {
    return key
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, (str) => str.toUpperCase());
  };
  
  // Available placeholders for each template type
  const availablePlaceholders = {
    welcome: ["{{name}}", "{{email}}", "{{password}}"],
    taskAssignment: ["{{name}}", "{{taskName}}", "{{dueDate}}", "{{priority}}"],
    taskReminder: ["{{name}}", "{{taskName}}", "{{dueDate}}", "{{daysRemaining}}"],
    taskOverdue: ["{{name}}", "{{taskName}}", "{{dueDate}}", "{{daysOverdue}}"],
  };
  
  // Custom component for displaying placeholders
  const PlaceholderList = ({ placeholders }) => (
    <div className="mt-2 text-xs text-muted-foreground">
      <p>Available placeholders:</p>
      <div className="flex flex-wrap gap-1 mt-1">
        {placeholders.map(placeholder => (
          <span key={placeholder} className="bg-muted px-2 py-1 rounded-md">{placeholder}</span>
        ))}
      </div>
    </div>
  );
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Email Templates</CardTitle>
          <CardDescription>
            Customize the email templates sent to users.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTemplate} onValueChange={setActiveTemplate}>
            <TabsList className="grid grid-cols-4 mb-6">
              {Object.keys(templates).map(key => (
                <TabsTrigger key={key} value={key}>
                  {formatTemplateKey(key)}
                </TabsTrigger>
              ))}
            </TabsList>
            
            {Object.entries(templates).map(([key, template]) => (
              <TabsContent key={key} value={key} className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium">{formatTemplateKey(key)} Email</h3>
                  <div className="flex items-center space-x-2">
                    <Label htmlFor={`enable-${key}`}>
                      {template.enabled ? "Enabled" : "Disabled"}
                    </Label>
                    <Switch
                      id={`enable-${key}`}
                      checked={template.enabled}
                      onCheckedChange={() => toggleTemplate(key)}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor={`subject-${key}`}>Email Subject</Label>
                    <Input
                      id={`subject-${key}`}
                      defaultValue={template.subject}
                      className="mt-1"
                      ref={el => subjectRefs.current[key] = el}
                    />
                    <PlaceholderList placeholders={availablePlaceholders[key]} />
                  </div>
                  
                  <div>
                    <Label htmlFor={`body-${key}`}>Email Body (HTML)</Label>
                    <Textarea
                      id={`body-${key}`}
                      defaultValue={template.body}
                      className="min-h-[300px] font-mono text-sm mt-1"
                      ref={el => bodyRefs.current[key] = el}
                    />
                    <PlaceholderList placeholders={availablePlaceholders[key]} />
                  </div>
                </div>
                
                <div className="flex justify-between">
                  <Button variant="outline">Preview</Button>
                  <Button onClick={() => updateTemplate(key)}>Save Template</Button>
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Email Settings</CardTitle>
          <CardDescription>
            Configure email sender details and global settings.
          </CardDescription>
        </CardHeader>
        <CardContent>
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
        </CardContent>
      </Card>
    </div>
  );
}
