import React, { useState } from "react";
import * as AlertDialog from "@radix-ui/react-alert-dialog";
import { AlertTriangle, AlertCircle, Info, Loader2 } from "lucide-react";

export interface ConfirmDialogProps {
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "warning" | "default";
  onConfirm: () => Promise<void> | void;
  disabled?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children?: React.ReactNode;
}

export const ConfirmButton: React.FC<ConfirmDialogProps> = ({
  title,
  description,
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  variant = "default",
  onConfirm,
  disabled = false,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
  children,
}) => {
  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;
  const setOpen = isControlled ? controlledOnOpenChange || (() => {}) : setInternalOpen;
  const [isLoading, setIsLoading] = useState(false);

  const handleAction = async (e: React.MouseEvent) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      await onConfirm();
      setOpen(false);
    } catch (err) {
      console.error("Action error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const getVariantStyles = () => {
    switch (variant) {
      case "danger":
        return {
          btn: "bg-red-600 hover:bg-red-700 text-white focus:ring-red-500",
          icon: <AlertTriangle className="h-6 w-6 text-red-500 shrink-0" />,
        };
      case "warning":
        return {
          btn: "bg-amber-600 hover:bg-amber-700 text-white focus:ring-amber-500",
          icon: <AlertCircle className="h-6 w-6 text-amber-500 shrink-0" />,
        };
      default:
        return {
          btn: "bg-neutral-900 hover:bg-black dark:bg-white dark:hover:bg-neutral-100 text-white dark:text-neutral-900 focus:ring-zinc-500",
          icon: <Info className="h-6 w-6 text-accent shrink-0" />,
        };
    }
  };

  const variantStyles = getVariantStyles();

  return (
    <AlertDialog.Root open={open} onOpenChange={setOpen}>
      {children && (
        <AlertDialog.Trigger asChild disabled={disabled}>
          {children}
        </AlertDialog.Trigger>
      )}
      <AlertDialog.Portal>
        <AlertDialog.Overlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <AlertDialog.Content className="fixed left-[50%] top-[50%] z-50 w-full max-w-md translate-x-[-50%] translate-y-[-50%] rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 shadow-2xl duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95">
          <div className="flex items-start gap-4">
            <div className="rounded-full bg-zinc-100 dark:bg-zinc-800 p-2.5">
              {variantStyles.icon}
            </div>
            <div className="flex-1">
              <AlertDialog.Title className="text-lg font-black tracking-tight text-zinc-900 dark:text-white">
                {title}
              </AlertDialog.Title>
              <AlertDialog.Description className="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                {description}
              </AlertDialog.Description>
            </div>
          </div>

          <div className="mt-6 flex items-center justify-end gap-3">
            <AlertDialog.Cancel asChild>
              <button
                type="button"
                disabled={isLoading}
                className="rounded-xl border border-zinc-300 dark:border-zinc-700 bg-transparent px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 transition hover:bg-zinc-100 dark:hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-400"
              >
                {cancelText}
              </button>
            </AlertDialog.Cancel>
            <AlertDialog.Action asChild>
              <button
                type="button"
                disabled={isLoading}
                onClick={handleAction}
                className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-black uppercase tracking-wider transition shadow-md focus:outline-none focus:ring-2 disabled:opacity-50 ${variantStyles.btn}`}
              >
                {isLoading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                <span>{confirmText}</span>
              </button>
            </AlertDialog.Action>
          </div>
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
};

export default ConfirmButton;
