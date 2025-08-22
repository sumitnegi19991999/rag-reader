"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import { Toast, ToastAction, ToastContextType, ToastType } from "@/types/toast";

const ToastContext = createContext<ToastContextType | undefined>(undefined);

interface ToastProviderProps {
  children: ReactNode;
}

export function ToastProvider({ children }: ToastProviderProps) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = (
    type: ToastType,
    title: string,
    message: string,
    options: {
      duration?: number;
      action?: ToastAction;
      isPersistent?: boolean;
    } = {}
  ) => {
    const id = Math.random().toString(36).substring(2, 11);
    const timestamp = new Date().toLocaleTimeString("en-US", {
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
    });

    const newToast: Toast = {
      id,
      type,
      title,
      message,
      timestamp,
      duration: options.duration || 5000,
      action: options.action,
      isPersistent: options.isPersistent || false,
    };

    setToasts((prev) => [...prev, newToast]);
  };

  const hideToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  const clearAllToasts = () => {
    setToasts([]);
  };

  const value: ToastContextType = {
    toasts,
    showToast,
    hideToast,
    clearAllToasts,
  };

  return <ToastContext.Provider value={value}>{children}</ToastContext.Provider>;
}

export function useToast() {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}