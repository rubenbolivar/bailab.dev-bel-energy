// Fix for @bel-energy/ui package types
declare module '@bel-energy/ui' {
  import { ReactNode, InputHTMLAttributes, ButtonHTMLAttributes } from 'react'

  export interface CardProps {
    className?: string
    children?: ReactNode
  }

  export interface CardHeaderProps {
    className?: string
    children?: ReactNode
  }

  export interface CardTitleProps {
    className?: string
    children?: ReactNode
  }

  export interface CardDescriptionProps {
    className?: string
    children?: ReactNode
  }

  export interface CardContentProps {
    className?: string
    children?: ReactNode
  }

  export interface CardFooterProps {
    className?: string
    children?: ReactNode
  }

  export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
    className?: string
  }

  export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    className?: string
    variant?: 'default' | 'outline' | 'ghost' | 'link'
    size?: 'default' | 'sm' | 'lg'
  }

  export const Card: React.ComponentType<CardProps>
  export const CardHeader: React.ComponentType<CardHeaderProps>
  export const CardTitle: React.ComponentType<CardTitleProps>
  export const CardDescription: React.ComponentType<CardDescriptionProps>
  export const CardContent: React.ComponentType<CardContentProps>
  export const CardFooter: React.ComponentType<CardFooterProps>
  export const Input: React.ComponentType<InputProps>
  export const Button: React.ComponentType<ButtonProps>
}