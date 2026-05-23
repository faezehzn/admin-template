"use client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Dispatch, ReactNode, SetStateAction } from "react";

export default function CreateBaseModal({
  open,
  setOpen,
  title = "Create Item",
  description = "Create a new item by filling out the form below.",
  handler,
  content,
}: {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
  title?: string;
  description?: string;
  handler: () => void;
  content: ReactNode;
}) {
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="capitalize">{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          {content}
          <Button className="w-full" onClick={handler}>
            Create
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
