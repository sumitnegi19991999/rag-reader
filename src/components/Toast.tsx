"use client";

import { useEffect, useState } from "react";
import { Toast as ToastType } from "@/types/toast";

interface ToastProps {
  toast: ToastType;
  onClose: (id: string) => void;
}

export default function Toast({ toast, onClose }: ToastProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isHiding, setIsHiding] = useState(false);
  const [progress, setProgress] = useState(100);

  const { id, type, title, message, timestamp, duration = 5000, action, isPersistent } = toast;

  useEffect(() => {
    // Show toast with entrance animation
    const showTimer = setTimeout(() => {
      setIsVisible(true);
    }, 50);

    return () => clearTimeout(showTimer);
  }, []);

  useEffect(() => {
    if (!isPersistent && duration > 0) {
      // Start progress bar animation
      const progressTimer = setTimeout(() => {
        setProgress(0);
      }, 100);

      // Auto-hide after duration
      const hideTimer = setTimeout(() => {
        handleClose();
      }, duration);

      return () => {
        clearTimeout(progressTimer);
        clearTimeout(hideTimer);
      };
    }
  }, [duration, isPersistent]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleClose = () => {
    setIsHiding(true);
    setTimeout(() => {
      onClose(id);
    }, 400);
  };

  const handleAction = () => {
    if (action) {
      action.action();
      handleClose();
    }
  };

  const getIcon = () => {
    switch (type) {
      case "success":
        return "✓";
      case "error":
        return "⚠";
      case "info":
        return "ℹ";
      default:
        return "●";
    }
  };

  const getToastClasses = () => {
    let classes = `toast ${type}`;
    if (isVisible) classes += " show";
    if (isHiding) classes += " hide";
    return classes;
  };

  return (
    <div className={getToastClasses()}>
      <div className="toast-icon">{getIcon()}</div>
      <div className="toast-content">
        <div className="toast-title">{title.toUpperCase()}</div>
        <div className="toast-message">{message.toUpperCase()}</div>
        <div className="toast-timestamp">TODAY {timestamp}</div>
      </div>
      <div className="toast-actions">
        {action && (
          <button className="toast-action-btn" onClick={handleAction}>
            {action.label.toUpperCase()}
          </button>
        )}
        <button className="toast-close" onClick={handleClose}>
          ✕
        </button>
      </div>
      {!isPersistent && (
        <div className="toast-progress">
          <div
            className="toast-progress-bar"
            style={{
              transform: `scaleX(${progress / 100})`,
              transitionDuration: `${duration - 100}ms`,
            }}
          />
        </div>
      )}
    </div>
  );
}