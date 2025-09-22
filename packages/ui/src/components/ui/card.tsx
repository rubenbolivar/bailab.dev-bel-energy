import React from "react"
import { cn } from "../../lib/utils"

interface BaseProps {
  className?: string
  [key: string]: any
}

const Card = ({ className, ...props }: BaseProps) => (
  <div
    className={cn("rounded-lg border bg-card text-card-foreground shadow-sm", className)}
    {...props}
  />
)

const CardHeader = ({ className, ...props }: BaseProps) => (
  <div
    className={cn("flex flex-col space-y-1.5 p-6", className)}
    {...props}
  />
)

const CardTitle = ({ className, ...props }: BaseProps) => (
  <h3
    className={cn("text-2xl font-semibold leading-none tracking-tight", className)}
    {...props}
  />
)

const CardDescription = ({ className, ...props }: BaseProps) => (
  <p
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
)

const CardContent = ({ className, ...props }: BaseProps) => (
  <div
    className={cn("p-6 pt-0", className)}
    {...props}
  />
)

const CardFooter = ({ className, ...props }: BaseProps) => (
  <div
    className={cn("flex items-center p-6 pt-0", className)}
    {...props}
  />
)

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }