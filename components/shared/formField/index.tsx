import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface FormFieldProps {
  label?: string;
  description?: string;
  error?: string;
  children: React.ReactNode;
  className?: string;
  classNameLabel?: string;
  id?: string;
  // disabled?: boolean;
}

export function FormField({
  label,
  description,
  error,
  children,
  className,
  classNameLabel,
  id,
  // disabled = false,
}: FormFieldProps) {
  return (
    <div className={cn("w-full space-y-1", className)}>
      {label && (
        <Label htmlFor={id} className={cn(classNameLabel)}>
          {label}
        </Label>
      )}
      {description && <p className="text-xs text-primary-400">{description}</p>}

      {children}

      {error && <p className="text-sm text-error">{error}</p>}
    </div>
  );
}
