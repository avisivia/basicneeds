import Link from "next/link";
import { LockKeyhole } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";

export default function Unauthorized() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 px-4 text-center">
      <LockKeyhole className="size-8 text-muted-foreground" />
      <h1 className="text-lg font-semibold">Please log in</h1>
      <p className="max-w-sm text-sm text-muted-foreground">
        You need to be signed in to view this page.
      </p>
      <Link href="/login" className={buttonVariants()}>
        Go to login
      </Link>
    </div>
  );
}
