
import * as React from "react";
import { sonner } from "sonner";

const TOAST_LIMIT = 20;
export type ToasterToast = ReturnType<typeof createToast>;

interface Toast {
  id: string;
  title?: string;
  description?: string;
  action?: React.ReactNode;
  variant?: "default" | "destructive";
}

const toastState = {
  toasts: [] as Toast[],
  listeners: new Set<() => void>(),
};

export type ToastProps = {
  title?: string;
  description?: string;
  variant?: "default" | "destructive";
};

// Helper function to create a toast object
const createToast = ({ title, description, variant = "default" }: ToastProps) => {
  const id = Math.random().toString(36).substring(2, 9);
  const toast: Toast = {
    id,
    title,
    description,
    variant,
  };

  // Add toast to state and notify listeners
  toastState.toasts = [toast, ...toastState.toasts].slice(0, TOAST_LIMIT);
  toastState.listeners.forEach((listener) => listener());

  // Also use sonner toast for visual display
  sonner.toast(title, {
    description,
    className: variant === "destructive" ? "bg-red-50 border-red-200" : "",
  });

  return toast;
};

// Hook to subscribe to toast updates
export const useToast = () => {
  const [toasts, setToasts] = React.useState<Toast[]>(toastState.toasts);

  React.useEffect(() => {
    const listener = () => {
      setToasts([...toastState.toasts]);
    };

    toastState.listeners.add(listener);
    return () => {
      toastState.listeners.delete(listener);
    };
  }, []);

  const toast = (props: ToastProps) => {
    return createToast(props);
  };

  return {
    toast,
    toasts,
  };
};

// Direct access to toast function
export const toast = (props: ToastProps) => {
  return createToast(props);
};
