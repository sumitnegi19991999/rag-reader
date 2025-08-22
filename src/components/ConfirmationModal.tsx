"use client";

import { useEffect } from "react";

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  type: string;
  detail: string;
}

export default function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  type,
  detail,
}: ConfirmationModalProps) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="modal-overlay active" onClick={handleOverlayClick}>
      <div className="modal">
        <div className="modal-side">
          <div className="modal-side-icon">⚠</div>
          <div className="modal-side-text">
            PERMANENT
            <br />
            ACTION
          </div>
        </div>
        <div className="modal-main">
          <h3 className="modal-title">CONFIRM DELETION</h3>
          <div className="modal-message">YOU ARE ABOUT TO DELETE:</div>
          <div className="modal-item-info">
            <div className="modal-item-name">■ {title.toUpperCase()}</div>
            <div className="modal-item-desc">{type.toUpperCase()}</div>
          </div>
          <div className="modal-detail">{detail.toUpperCase()}</div>
          <div className="modal-actions">
            <button className="modal-btn-cancel" onClick={onClose}>
              CANCEL
            </button>
            <button className="modal-btn-danger" onClick={onConfirm}>
              DELETE
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}