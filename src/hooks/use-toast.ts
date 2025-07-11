
import * as React from "react";
import { toast as sonnerToast } from "sonner";

const TOAST_LIMIT = 20;
export type ToasterToast = ReturnType<typeof createToast>;

interface Toast {
  id: string;
  title?: string;
  description?: string;
  action?: React.ReactNode;
  variant?: "default" | "destructive";
}

// Initialize the toast state with an empty array
const toastState = {
  toasts: [] as Toast[],
  listeners: new Set<() => void>(),
};

export type ToastProps = {
  title?: string;
  description?: string;
  variant?: "default" | "destructive";
};

// Helper function to create a toast object - this doesn't use hooks
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
  sonnerToast(title || "", {
    description,
    className: variant === "destructive" ? "bg-red-50 border-red-200" : "",
  });

  return toast;
};

// Hook to subscribe to toast updates - can only be used inside components
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

  return {
    toast: (props: ToastProps) => createToast(props),
    toasts: toasts || [], // Ensure toasts is never undefined
  };
};

// Direct access to toast function - doesn't use hooks so can be called anywhere
export const toast = (props: ToastProps) => {
  return createToast(props);
};
