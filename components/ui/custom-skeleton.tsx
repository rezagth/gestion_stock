"use client"

import { cn } from "@/lib/utils"

interface CustomSkeletonProps extends React.HTMLAttributes<HTMLDivElement> {}

export function CustomSkeleton({
  className,
  ...props
}: CustomSkeletonProps) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-gray-200 dark:bg-gray-700",
        className
      )}
      {...props}
    />
  )
}
