import React, { ReactNode } from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface CardProps {
  children: ReactNode;
  className?: string;
}

export function Card({ children, className }: CardProps) {
  return (
    <div className={twMerge(clsx('bg-white border border-slate-200/80 rounded-xl shadow-sm overflow-hidden', className))}>
      {children}
    </div>
  );
}

export function CardHeader({ children, className }: CardProps) {
  return <div className={twMerge(clsx('p-5 border-b border-slate-100', className))}>{children}</div>;
}

export function CardTitle({ children, className }: CardProps) {
  return <h3 className={twMerge(clsx('text-lg font-semibold text-slate-900', className))}>{children}</h3>;
}

export function CardContent({ children, className }: CardProps) {
  return <div className={twMerge(clsx('p-5', className))}>{children}</div>;
}

export function CardFooter({ children, className }: CardProps) {
  return <div className={twMerge(clsx('p-4 bg-slate-50 border-t border-slate-100', className))}>{children}</div>;
}
