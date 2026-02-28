import * as React from "react"
import { cn } from "@/lib/utils"

interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Maximum width variant
   * - full: No max-width constraint
   * - 7xl: 1280px (default, for main content)
   * - 6xl: 1152px (for narrower content)
   * - 5xl: 1024px (for compact content)
   * - 4xl: 896px (for focused content)
   */
  maxWidth?: "full" | "7xl" | "6xl" | "5xl" | "4xl"
  /**
   * Padding variant
   * - none: No padding
   * - sm: Small padding (16px mobile, 24px tablet, 32px desktop)
   * - md: Medium padding (24px mobile, 32px tablet, 48px desktop) - default
   * - lg: Large padding (32px mobile, 48px tablet, 64px desktop)
   */
  padding?: "none" | "sm" | "md" | "lg"
  /**
   * Whether to center content horizontally
   */
  center?: boolean
}

const Container = React.forwardRef<HTMLDivElement, ContainerProps>(
  ({ className, maxWidth = "7xl", padding = "md", center = true, ...props }, ref) => {
    const maxWidthClasses = {
      full: "max-w-full",
      "7xl": "max-w-7xl",
      "6xl": "max-w-6xl",
      "5xl": "max-w-5xl",
      "4xl": "max-w-4xl",
    }

    const paddingClasses = {
      none: "",
      sm: "px-4 sm:px-6 lg:px-8",
      md: "px-4 sm:px-6 lg:px-8 xl:px-12",
      lg: "px-6 sm:px-8 lg:px-12 xl:px-16",
    }

    return (
      <div
        ref={ref}
        className={cn(
          "w-full",
          maxWidthClasses[maxWidth],
          paddingClasses[padding],
          center && "mx-auto",
          className
        )}
        {...props}
      />
    )
  }
)
Container.displayName = "Container"

export { Container }







