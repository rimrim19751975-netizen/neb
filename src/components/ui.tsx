import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "../utils/cn";

export function Button({
  variant = "primary",
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger" | "outline";
}) {
  const styles = {
    primary:
      "bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white shadow-lg shadow-indigo-500/20",
    secondary: "bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700",
    ghost: "bg-transparent hover:bg-slate-800/50 text-slate-300",
    danger: "bg-rose-600/90 hover:bg-rose-600 text-white",
    outline: "border border-slate-600 hover:border-indigo-400 hover:text-indigo-300 text-slate-300",
  }[variant];
  return (
    <button
      {...props}
      className={cn(
        "px-4 py-2 rounded-lg text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2",
        styles,
        className,
      )}
    />
  );
}

export function Card({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        "bg-slate-900/60 backdrop-blur border border-slate-800 rounded-2xl p-5",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function Modal({
  open,
  onClose,
  children,
  title,
  size = "md",
}: {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  title?: string;
  size?: "sm" | "md" | "lg" | "xl";
}) {
  if (!open) return null;
  const sizes = { sm: "max-w-md", md: "max-w-2xl", lg: "max-w-4xl", xl: "max-w-6xl" };
  return (
    <div
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className={cn(
          "bg-slate-900 border border-slate-700 rounded-2xl w-full my-8 shadow-2xl",
          sizes[size],
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {title && (
          <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">{title}</h3>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white text-2xl leading-none"
            >
              ×
            </button>
          </div>
        )}
        <div className="p-6 max-h-[75vh] overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={cn(
        "w-full px-3 py-2 bg-slate-950/60 border border-slate-700 rounded-lg text-slate-100 text-sm placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500",
        props.className,
      )}
    />
  );
}

export function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={cn(
        "w-full px-3 py-2 bg-slate-950/60 border border-slate-700 rounded-lg text-slate-100 text-sm placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 min-h-[100px] font-mono",
        props.className,
      )}
    />
  );
}

export function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={cn(
        "w-full px-3 py-2 bg-slate-950/60 border border-slate-700 rounded-lg text-slate-100 text-sm focus:outline-none focus:border-indigo-500",
        props.className,
      )}
    />
  );
}

export function Label({ children }: { children: ReactNode }) {
  return <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wider">{children}</label>;
}

export function Badge({
  children,
  color = "slate",
}: {
  children: ReactNode;
  color?: "slate" | "indigo" | "emerald" | "amber" | "rose" | "violet" | "sky";
}) {
  const colors = {
    slate: "bg-slate-800 text-slate-300",
    indigo: "bg-indigo-500/15 text-indigo-300 border border-indigo-500/30",
    emerald: "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30",
    amber: "bg-amber-500/15 text-amber-300 border border-amber-500/30",
    rose: "bg-rose-500/15 text-rose-300 border border-rose-500/30",
    violet: "bg-violet-500/15 text-violet-300 border border-violet-500/30",
    sky: "bg-sky-500/15 text-sky-300 border border-sky-500/30",
  };
  return (
    <span className={cn("px-2 py-0.5 rounded-md text-xs font-medium inline-flex items-center", colors[color])}>
      {children}
    </span>
  );
}
