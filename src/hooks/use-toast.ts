
import { toast as sonnerToast } from "sonner";

type ToastProps = {
  title?: string;
  description?: string;
  variant?: "default" | "destructive";
};

const useToast = () => {
  const toast = ({ title, description, variant = "default" }: ToastProps) => {
    sonnerToast(title, {
      description,
      className: variant === "destructive" ? "bg-red-50 border-red-200" : "",
    });
  };

  return { toast };
};

export { useToast };
export const toast = ({ title, description, variant = "default" }: ToastProps) => {
  sonnerToast(title, {
    description,
    className: variant === "destructive" ? "bg-red-50 border-red-200" : "",
  });
};
