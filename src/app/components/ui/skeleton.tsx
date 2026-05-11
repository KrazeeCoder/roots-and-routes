import { cn } from "./utils";

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      className={cn("bg-[#E7D9C3] animate-pulse rounded-md", className)}
      {...props}
    />
  );
}

export function CardSkeleton() {
  return (
    <div className="flex flex-col bg-white rounded-3xl border border-[#E7D9C3] shadow-sm overflow-hidden">
      <Skeleton className="h-40 w-full" />
      <div className="p-6 flex flex-col flex-grow space-y-4">
        <div className="space-y-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-6 w-3/4" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-5/6" />
          <Skeleton className="h-3 w-4/6" />
        </div>
        <div className="space-y-2 pt-4 border-t border-[#E7D9C3]">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-8 w-24" />
        </div>
      </div>
    </div>
  );
}

export function EventCardSkeleton() {
  return (
    <div className="flex flex-col lg:flex-row gap-6 lg:gap-10 bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-[#E7D9C3]">
      <div className="flex-grow flex flex-col justify-center space-y-4">
        <div className="flex items-center gap-4">
          <Skeleton className="h-6 w-16 rounded-full" />
          <Skeleton className="h-4 w-24" />
        </div>
        <Skeleton className="h-8 w-3/4" />
        <div className="flex items-center gap-6">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-32" />
        </div>
        <Skeleton className="h-4 w-28" />
      </div>
      <div className="w-full lg:w-1/3 h-48 lg:h-auto rounded-2xl overflow-hidden flex-shrink-0 hidden sm:block">
        <Skeleton className="w-full h-full" />
      </div>
    </div>
  );
}

