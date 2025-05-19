
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from '@/components/ui/card';

export const NoCheckerRoleMessage = () => {
  return (
    <div className="container mx-auto py-6">
      <Card>
        <CardHeader>
          <CardTitle>Tasks to Review</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center py-8">
            You don't have any checker roles assigned. Contact an administrator if you believe this is an error.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
