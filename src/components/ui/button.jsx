import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-white dark:ring-offset-gray-950 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-950 dark:focus-visible:ring-gray-300 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-gray-900 dark:bg-gray-50 text-gray-50 dark:text-gray-900 hover:bg-gray-900/90 dark:hover:bg-gray-50/90",
        destructive:
          "bg-red-500 dark:bg-red-900 text-gray-50 hover:bg-red-500/90 dark:hover:bg-red-900/90",
        outline:
          "border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-50",
        secondary:
          "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-50 hover:bg-gray-100/80 dark:hover:bg-gray-800/80",
        ghost: "hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-50",
        link: "text-gray-900 dark:text-gray-50 underline-offset-4 hover:underline",
        hero: "bg-gray-900 dark:bg-gray-50 text-gray-50 dark:text-gray-900 hover:bg-gray-900/90 dark:hover:bg-gray-50/90 font-semibold px-8 py-6 text-lg shadow-card hover:shadow-card-hover transition-all duration-300 hover:scale-105",
        "hero-outline":
          "border-2 border-gray-50 dark:border-gray-900 text-gray-50 dark:text-gray-900 bg-transparent hover:bg-gray-50 dark:hover:bg-gray-900 hover:text-gray-900 dark:hover:text-gray-50 font-semibold px-8 py-6 text-lg transition-all duration-300 hover:scale-105",
        cta: "bg-gradient-to-r from-gray-900 to-gray-700 dark:from-gray-50 dark:to-gray-300 text-gray-50 dark:text-gray-900 hover:opacity-90 font-bold px-12 py-6 text-xl shadow-card-hover transition-all duration-300 hover:scale-105",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

const Button = React.forwardRef(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }