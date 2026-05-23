"use client";

import { toast } from "sonner";
import { ReactNode } from "react";
import {
  AiOutlineCloseCircle,
  AiOutlineInfoCircle,
  AiOutlineWarning,
  AiOutlineCheckCircle,
} from "react-icons/ai";
import { cn } from "@/lib/utils";

export const statusIcons = {
  close: AiOutlineCloseCircle,
  info: AiOutlineInfoCircle,
  warning: AiOutlineWarning,
  success: AiOutlineCheckCircle,
};

// Base component
const BaseToast = ({
  title,
  description,
  icon,
  className,
}: {
  title: ReactNode;
  description?: string;
  icon: ReactNode;
  className: string;
}) => (
  <div
    className={cn(
      "flex items-start gap-3 py-2 px-3 rounded-md border shadow-lg w-full ",
      className,
    )}
  >
    <div className="text-sm">{icon}</div>

    <div className="flex flex-col">
      <span className="font-semibold">{title}</span>
      {description && <span className="text-sm opacity-80">{description}</span>}
    </div>
  </div>
);

// SUCCESS
export const useSuccessToast = () => {
  const show = (title: ReactNode, description?: string) => {
    toast.custom(() => (
      <BaseToast
        title={title}
        description={description}
        icon={<statusIcons.success />}
        className="bg-green-600 text-white border-green-700"
      />
    ));
  };
  return { show };
};

// ERROR
export const useErrorToast = () => {
  const show = (title: ReactNode, description?: string) => {
    toast.custom(() => (
      <BaseToast
        title={title}
        description={description}
        icon={<statusIcons.close />}
        className="bg-red-600 text-white border-red-700"
      />
    ));
  };
  return { show };
};

// WARNING
export const useWarningToast = () => {
  const show = (title: ReactNode, description?: string) => {
    toast.custom(() => (
      <BaseToast
        title={title}
        description={description}
        icon={<statusIcons.warning />}
        className="bg-yellow-500 text-black border-yellow-600"
      />
    ));
  };
  return { show };
};

// INFO
export const useInfoToast = () => {
  const show = (title: ReactNode, description?: string) => {
    toast.custom(() => (
      <BaseToast
        title={title}
        description={description}
        icon={<statusIcons.info />}
        className="bg-blue-600 text-white border-blue-700"
      />
    ));
  };
  return { show };
};
