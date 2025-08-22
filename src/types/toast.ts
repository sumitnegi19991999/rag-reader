export type ToastType = "success" | "error" | "info";

export interface ToastAction {
  label: string;
  action: () => void;
}

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message: string;
  timestamp: string;
  duration?: number;
  action?: ToastAction;
  isPersistent?: boolean;
}

export interface ToastContextType {
  toasts: Toast[];
  showToast: (
    type: ToastType,
    title: string,
    message: string,
    options?: {
      duration?: number;
      action?: ToastAction;
      isPersistent?: boolean;
    }
  ) => void;
  hideToast: (id: string) => void;
  clearAllToasts: () => void;
}