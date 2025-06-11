
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/components/ui/use-toast";
import { TemplateEditor, type Template } from "./email/TemplateEditor";
import { EmailSettingsForm } from "./email/EmailSettingsForm";
import { defaultTemplates } from "@/lib/email-template-utils";

export interface TemplateMap {
  [key: string]: Template;
}

export function EmailTemplates() {
  const [activeTemplate, setActiveTemplate] = useState("welcome");
  const [templates, setTemplates] = useState<TemplateMap>(defaultTemplates);
  
  const updateTemplate = (templateKey: string, updatedTemplate: Template) => {
    setTemplates({
      ...templates,
      [templateKey]: updatedTemplate
    });
  };
  
  const toggleTemplate = (templateKey: string) => {
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
                  {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                </TabsTrigger>
              ))}
            </TabsList>
            
            {Object.entries(templates).map(([key, template]) => (
              <TabsContent key={key} value={key} className="space-y-6">
                <TemplateEditor
                  templateKey={key}
                  template={template}
                  onTemplateUpdate={updateTemplate}
                  onTemplateToggle={toggleTemplate}
                />
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
          <EmailSettingsForm />
        </CardContent>
      </Card>
    </div>
  );
}
