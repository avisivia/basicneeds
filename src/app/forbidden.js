import Link from "next/link";
import { ShieldAlert } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";

export default function Forbidden() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 px-4 text-center">
      <ShieldAlert className="size-8 text-muted-foreground" />
      <h1 className="text-lg font-semibold">You don&apos;t have access</h1>
      <p className="max-w-sm text-sm text-muted-foreground">
        This page isn&apos;t available for your account type.
      </p>
      <Link href="/" className={buttonVariants()}>
        Return home
      </Link>
    </div>
  );
}
