
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AwsSettingsForm } from "./aws/AwsSettingsForm";

export function AwsSettings() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>AWS Integration</CardTitle>
        <CardDescription>
          Configure AWS services integration for storage and email capabilities.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <AwsSettingsForm />
      </CardContent>
    </Card>
  );
}
