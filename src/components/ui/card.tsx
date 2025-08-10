// src/components/ui/card.tsx
import * as React from "react";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export function Card({ children, className, style }: CardProps) {
  const baseClasses = "border bg-white dark:bg-black dark:border-white";
  const combinedClasses = className ? `${baseClasses} ${className}` : baseClasses;

  return (
    <div className={combinedClasses} style={style}>
      {children}
    </div>
  );
}
