
import { useToast as useToastHook, toast as toastFunc, type ToastProps } from "@/hooks/use-toast";

export const useToast = useToastHook;
export const toast = toastFunc;
export type { ToastProps };
