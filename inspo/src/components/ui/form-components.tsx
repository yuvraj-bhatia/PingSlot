import React from "react";
import { GradientButton } from "./gradient-button";

// Form Components
export const Form: React.FC<React.FormHTMLAttributes<HTMLFormElement>> = ({
  children,
  className,
  ...props
}) => (
  <form className={`form ${className ?? ""}`} {...props}>
    {children}
  </form>
);

export const FormField: React.FC<
  React.PropsWithChildren<{ className?: string }>
> = ({ children, className }) => (
  <div className={`field ${className ?? ""}`}>{children}</div>
);

export const Label: React.FC<React.LabelHTMLAttributes<HTMLLabelElement>> = ({
  children,
  className,
  htmlFor,
  ...props
}) => (
  <label
    className={`field-label ${className ?? ""}`}
    htmlFor={htmlFor}
    {...props}
  >
    {children}
  </label>
);

export const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = ({
  className,
  ...props
}) => <input className={`input ${className ?? ""}`} {...props} />;

export const Textarea: React.FC<
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
> = ({ className, ...props }) => (
  <textarea className={`textarea ${className ?? ""}`} {...props} />
);

// Button Components
type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "danger";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  asChild?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  className,
  variant = "primary",
  size = "md",
  asChild = false,
  ...props
}) => {
  // Map old variants to new gradient button variants
  // primary, secondary, danger -> default (red/black gradient)
  // outline, ghost -> variant (blue/black gradient)
  const gradientVariant =
    variant === "outline" || variant === "ghost"
      ? "variant" // Blue/black gradient
      : "default"; // Red/black gradient

  return (
    <GradientButton
      variant={gradientVariant}
      className={className}
      asChild={asChild}
      {...props}
    >
      {children}
    </GradientButton>
  );
};

// Container Components
type CardProps = React.HTMLAttributes<HTMLDivElement>;

export const Card: React.FC<CardProps> = ({
  children,
  className,
  ...props
}) => (
  <div className={`card ${className ?? ""}`} {...props}>
    {children}
  </div>
);

export const Container: React.FC<
  React.PropsWithChildren<{ className?: string }>
> = ({ children, className }) => (
  <div className={`container ${className ?? ""}`}>{children}</div>
);

// Layout Components
export const Section: React.FC<
  React.PropsWithChildren<{ className?: string }>
> = ({ children, className }) => (
  <section className={`section ${className ?? ""}`}>{children}</section>
);

export const Hero: React.FC<
  React.PropsWithChildren<{ className?: string }>
> = ({ children, className }) => (
  <div className={`hero ${className ?? ""}`}>{children}</div>
);

// Typography Components
export const Heading: React.FC<
  React.PropsWithChildren<{
    level?: 1 | 2 | 3 | 4;
    className?: string;
    style?: React.CSSProperties;
  }>
> = ({ children, level = 1, className, style }) => {
  const Tag = `h${level}` as "h1" | "h2" | "h3" | "h4";
  return React.createElement(
    Tag,
    {
      className: `heading heading-${level} ${className ?? ""}`,
      style,
    },
    children,
  );
};

export const Text: React.FC<
  React.PropsWithChildren<{
    muted?: boolean;
    className?: string;
    style?: React.CSSProperties;
  }>
> = ({ children, muted, className, style }) => (
  <p
    className={`text ${muted ? "muted" : ""} ${className ?? ""}`}
    style={style}
  >
    {children}
  </p>
);

// Divider
export const Divider: React.FC<{
  text?: string;
  className?: string;
  style?: React.CSSProperties;
}> = ({ text, className, style }) => (
  <div className={`divider ${className ?? ""}`} style={style}>
    {text}
  </div>
);

// Link Component
export const LinkButton: React.FC<
  React.AnchorHTMLAttributes<HTMLAnchorElement> & { variant?: ButtonVariant }
> = ({ children, className, variant = "primary", ...props }) => (
  <a className={`btn btn-${variant} ${className ?? ""}`} {...props}>
    {children}
  </a>
);
