"use client";

import { useTransition } from "react";
import { toast } from "sonner";

import { setUserRole } from "@/actions/admin";
import { Button } from "@/components/ui/button";

export function RoleToggleButton({ userId, currentRole }) {
  const [isPending, startTransition] = useTransition();
  const nextRole = currentRole === "admin" ? "teacher" : "admin";

  const onClick = () => {
    const formData = new FormData();
    formData.set("userId", userId);
    formData.set("newRole", nextRole);

    startTransition(async () => {
      const result = await setUserRole(null, formData);
      if (result?.error) {
        toast.error(result.error);
        return;
      }
      toast.success(`Role updated to ${nextRole}.`);
    });
  };

  return (
    <Button variant="outline" size="sm" onClick={onClick} disabled={isPending}>
      {isPending
        ? "Updating…"
        : currentRole === "admin"
          ? "Revoke admin"
          : "Make admin"}
    </Button>
  );
}
