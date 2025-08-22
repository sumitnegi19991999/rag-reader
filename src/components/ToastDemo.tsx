"use client";

import { useToast } from "@/contexts/ToastContext";

export default function ToastDemo() {
  const { showToast } = useToast();

  const showSuccessToast = () => {
    showToast(
      "success",
      "Document Processed",
      "Your document has been successfully analyzed and indexed in the knowledge base",
      {
        action: {
          label: "View",
          action: () => {
            showToast("info", "Navigation", "Redirecting to document viewer");
          },
        },
      }
    );
  };

  const showErrorToast = () => {
    showToast(
      "error",
      "Upload Failed",
      "Unable to process document due to unsupported file format or corruption",
      {
        duration: 6000,
      }
    );
  };

  const showInfoToast = () => {
    showToast(
      "info",
      "Sync in Progress",
      "Your files are being synchronized with the cloud storage. This may take a few minutes",
      {
        duration: 8000,
        isPersistent: false,
      }
    );
  };

  const showMultipleToasts = () => {
    showToast("info", "Process Started", "Beginning batch operation");
    
    setTimeout(() => {
      showToast("success", "Step 1 Complete", "Document analysis finished");
    }, 1000);

    setTimeout(() => {
      showToast("success", "Step 2 Complete", "Indexing completed successfully");
    }, 2000);

    setTimeout(() => {
      showToast("success", "All Done", "Batch operation completed successfully", {
        action: {
          label: "Review",
          action: () => showToast("info", "Review Mode", "Opening results panel"),
        },
      });
    }, 3000);
  };

  return (
    <div className="hc-card">
      <h3 className="hc-card-header">Toast Demo</h3>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
        <button className="hc-button" onClick={showSuccessToast}>
          SUCCESS TOAST
        </button>
        <button className="hc-button-secondary" onClick={showErrorToast}>
          ERROR TOAST
        </button>
        <button className="hc-button-accent" onClick={showInfoToast}>
          INFO TOAST
        </button>
        <button className="hc-button" onClick={showMultipleToasts}>
          MULTIPLE TOASTS
        </button>
      </div>
    </div>
  );
}