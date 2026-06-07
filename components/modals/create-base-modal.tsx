"use client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Dispatch, ReactNode, SetStateAction, useEffect } from "react";

export default function CreateBaseModal({
  open,
  setOpen,
  title = "Create Item",
  description = "Create a new item by filling out the form below.",
  handler,
  isLoading,
  content,
  onClose,
}: {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
  title?: string;
  description?: string;
  handler: () => void;
  onClose?: () => void;
  content: ReactNode;
  isLoading?: boolean;
}) {
  useEffect(() => {
    if (!open) {
      onClose?.();
    }
  }, [open]);
  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="capitalize">{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          {content}
          <Button disabled={isLoading} className="w-full" onClick={handler}>
            Create
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
