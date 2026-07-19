"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { RotateCcw } from "lucide-react";

import { reReflectToday } from "@/actions/reflections";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";

export function ReReflectButton() {
  const [isPending, startTransition] = useTransition();

  const onConfirm = () => {
    startTransition(async () => {
      const result = await reReflectToday();
      if (result?.error) {
        toast.error(result.error);
        return;
      }
      toast.success("Starting over — let's reflect again.");
    });
  };

  return (
    <Dialog>
      <DialogTrigger render={<Button variant="outline" size="sm" />}>
        <RotateCcw /> Re-reflect
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Start today&apos;s reflection over?</DialogTitle>
          <DialogDescription>
            This replaces the answers and comments you already submitted
            today. It can&apos;t be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose render={<Button variant="outline" />}>Cancel</DialogClose>
          <Button onClick={onConfirm} disabled={isPending} variant="destructive">
            {isPending ? "Starting over…" : "Yes, start over"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
