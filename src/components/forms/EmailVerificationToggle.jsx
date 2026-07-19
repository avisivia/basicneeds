"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";

import { updateAppSettings } from "@/actions/admin";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

export function EmailVerificationToggle({ initialValue }) {
  const [requireVerification, setRequireVerification] = useState(initialValue);
  const [isPending, startTransition] = useTransition();

  const onCheckedChange = (checked) => {
    setRequireVerification(checked);
    const formData = new FormData();
    formData.set("requireEmailVerification", String(checked));

    startTransition(async () => {
      const result = await updateAppSettings(null, formData);
      if (result?.error) {
        toast.error(result.error);
        setRequireVerification(!checked);
        return;
      }
      toast.success(
        checked
          ? "New sign-ups will need to verify their email."
          : "New sign-ups will skip email verification."
      );
    });
  };

  return (
    <div className="flex items-center justify-between gap-4 rounded-lg border border-border p-4">
      <div>
        <Label htmlFor="require-email-verification" className="text-sm font-medium">
          Require email verification
        </Label>
        <p className="mt-1 text-sm text-muted-foreground">
          When off, new students and teachers are signed in immediately after
          signing up — no confirmation email required.
        </p>
      </div>
      <Switch
        id="require-email-verification"
        checked={requireVerification}
        onCheckedChange={onCheckedChange}
        disabled={isPending}
      />
    </div>
  );
}
