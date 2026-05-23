"use client";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Dispatch, ReactNode, SetStateAction } from "react";

export default function EditBaseDrawer({
  open,
  setOpen,
  content,
  title = "Edit Item",
  handler,
}: {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
  content: ReactNode;
  title?: string;
  handler: () => void;
}) {
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent className="flex flex-col gap-6">
        <SheetHeader>
          <SheetTitle className="capitalize">{title}</SheetTitle>
        </SheetHeader>

        <div className="flex flex-col gap-4 w-full h-full justify-between">
          {content}
          <Button className="w-full" onClick={handler}>
            Save Changes
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
