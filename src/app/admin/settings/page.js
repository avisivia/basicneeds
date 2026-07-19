import { getAppSettings } from "@/services/admin";
import { EmailVerificationToggle } from "@/components/forms/EmailVerificationToggle";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";

export const metadata = { title: "Settings — Basic Needs Tracker" };

export default async function AdminSettingsPage() {
  const settings = await getAppSettings();

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-xl font-semibold">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          App-wide configuration.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Account sign-up</CardTitle>
          <CardDescription>
            Controls how new accounts are activated.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <EmailVerificationToggle
            initialValue={settings.require_email_verification}
          />
        </CardContent>
      </Card>
    </div>
  );
}
