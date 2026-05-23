import Image from "next/image";
import loading from "../../../public/loading.png";
import { PROJECT_NAME } from "@/constants";
import { cn } from "@/lib/utils";

type LoadingProps = {
  className?: string;
  classNameImage?: string;
  title?: string;
  description?: string;
};

export const Loading = ({
  className,
  classNameImage,
  title = PROJECT_NAME,
  description = "",
}: LoadingProps) => {
  return (
    <section
      aria-busy="true"
      role="status"
      className={cn(
        "relative z-10000 flex flex-col items-center gap-3 text-center justify-center",
        className,
      )}
    >
      <div className="rounded-full animate-spin [animation-duration:2s] shadow-lg bg-background">
        <Image
          width={160}
          height={160}
          src={loading}
          alt="Loading animation"
          priority
          className={cn(
            "h-14 w-14 object-contain rounded-full",
            classNameImage,
          )}
        />
      </div>

      <div className="space-y-1">
        <h2 className="text-base font-semibold text-primary-800">{title}</h2>
        {description && (
          <p className="text-sm text-primary-400">{description}</p>
        )}
      </div>
    </section>
  );
};
