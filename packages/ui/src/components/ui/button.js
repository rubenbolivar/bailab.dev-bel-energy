import React from "react"

const Button = ({ className = "", variant = "default", size = "default", ...props }) => {
  const baseClasses = "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"

  let variantClass = ""
  switch (variant) {
    case "outline":
      variantClass = "border border-input bg-background hover:bg-accent hover:text-accent-foreground"
      break
    case "secondary":
      variantClass = "bg-secondary text-secondary-foreground hover:bg-secondary/80"
      break
    case "ghost":
      variantClass = "hover:bg-accent hover:text-accent-foreground"
      break
    case "link":
      variantClass = "text-primary underline-offset-4 hover:underline"
      break
    default:
      variantClass = "bg-primary text-primary-foreground hover:bg-primary/90"
  }

  let sizeClass = ""
  switch (size) {
    case "sm":
      sizeClass = "h-9 rounded-md px-3"
      break
    case "lg":
      sizeClass = "h-11 rounded-md px-8"
      break
    case "icon":
      sizeClass = "h-10 w-10"
      break
    default:
      sizeClass = "h-10 px-4 py-2"
  }

  const allClasses = [baseClasses, variantClass, sizeClass, className].filter(Boolean).join(" ")

  return React.createElement("button", { className: allClasses, ...props })
}

export { Button }