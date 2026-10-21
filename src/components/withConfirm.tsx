import React from "react";
import ConfirmButton from "./ConfirmButton";

export interface ConfirmConfig<P> {
  title: string | ((props: P) => string);
  description: string | ((props: P) => string);
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "warning" | "default";
}

export function withConfirm<P extends { onClick?: (e: React.MouseEvent) => void }>(
  Component: React.ComponentType<P>,
  config: ConfirmConfig<P>
) {
  return function WithConfirmComponent(props: P) {
    const title = typeof config.title === "function" ? config.title(props) : config.title;
    const description = typeof config.description === "function" ? config.description(props) : config.description;

    const handleConfirm = () => {
      if (props.onClick) {
        props.onClick({} as React.MouseEvent);
      }
    };

    return (
      <ConfirmButton
        title={title}
        description={description}
        confirmText={config.confirmText}
        cancelText={config.cancelText}
        variant={config.variant}
        onConfirm={handleConfirm}
      >
        <Component {...props} onClick={undefined} />
      </ConfirmButton>
    );
  };
}
