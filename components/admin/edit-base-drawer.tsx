"use client";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Dispatch, ReactNode, SetStateAction, useEffect } from "react";

export default function EditBaseDrawer({
  open,
  setOpen,
  content,
  title = "Edit Item",
  handler,
  isLoading,
  onClose,
}: {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
  content: ReactNode;
  title?: string;
  handler: () => void;
  onClose?: () => void;
  isLoading?: boolean;
}) {
  useEffect(() => {
    if (!open) {
      onClose?.();
    }
  }, [open]);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent className="flex flex-col gap-6">
        <SheetHeader>
          <SheetTitle className="capitalize">{title}</SheetTitle>
        </SheetHeader>

        <div className="flex flex-col gap-4 w-full h-full justify-between">
          {content}
          <Button disabled={isLoading} className="w-full" onClick={handler}>
            Save Changes
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
