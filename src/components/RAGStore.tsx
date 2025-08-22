"use client";

import { useState, useEffect } from "react";
import ConfirmationModal from "./ConfirmationModal";
import { useToast } from "@/contexts/ToastContext";

interface Document {
  id: string;
  title: string;
  type: "text" | "file" | "website";
  content: string;
  timestamp: string;
  metadata?: {
    chunksCount?: number;
    [key: string]: any;
  };
}

export default function RAGStore() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    document?: Document;
    type: "single" | "all";
  }>({ isOpen: false, type: "single" });

  const { showToast } = useToast();

  useEffect(() => {
    fetchDocuments();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchDocuments = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/documents");
      if (response.ok) {
        const data = await response.json();
        console.log(data.documents);
        setDocuments(data.documents || []);

        // Show info toast on successful refresh
        if (data.documents && data.documents.length > 0) {
          showToast(
            "info",
            "Documents Refreshed",
            `Found ${data.documents.length} documents in your knowledge base`,
            { duration: 3000 }
          );
        }
      } else {
        showToast(
          "error",
          "Refresh Failed",
          "Unable to fetch documents from the server"
        );
      }
    } catch (error) {
      console.error("Error fetching documents:", error);
      showToast(
        "error",
        "Connection Error",
        "Failed to connect to the document server"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const openDeleteModal = (document: Document) => {
    setDeleteModal({
      isOpen: true,
      document,
      type: "single",
    });
  };

  const openClearAllModal = () => {
    setDeleteModal({
      isOpen: true,
      type: "all",
    });
  };

  const closeDeleteModal = () => {
    setDeleteModal({ isOpen: false, type: "single" });
  };

  const handleConfirmDelete = async () => {
    try {
      if (deleteModal.type === "single" && deleteModal.document) {
        const response = await fetch(
          `/api/documents/${deleteModal.document.id}`,
          {
            method: "DELETE",
          }
        );
        if (response.ok) {
          setDocuments((prev) =>
            prev.filter((doc) => doc.id !== deleteModal.document!.id)
          );
          const chunkCount = deleteModal.document.metadata?.totalChunks || 1;
          showToast(
            "success",
            "Document Deleted",
            `${deleteModal.document.title} and ${chunkCount} chunks removed successfully`,
            {
              action: {
                label: "Undo",
                action: () => {
                  showToast(
                    "info",
                    "Undo Requested",
                    "Restore functionality coming soon"
                  );
                },
              },
            }
          );
        } else {
          showToast(
            "error",
            "Delete Failed",
            "Unable to delete document from the database"
          );
        }
      } else if (deleteModal.type === "all") {
        const response = await fetch("/api/documents", {
          method: "DELETE",
        });
        if (response.ok) {
          const deletedCount = documents.length;
          setDocuments([]);
          showToast(
            "success",
            "All Documents Cleared",
            `Successfully removed ${deletedCount} documents from your knowledge base`,
            {
              duration: 6000,
            }
          );
        } else {
          showToast(
            "error",
            "Clear Failed",
            "Unable to clear all documents from the database"
          );
        }
      }
    } catch (error) {
      console.error("Error deleting:", error);
      showToast(
        "error",
        "System Error",
        "An unexpected error occurred during deletion"
      );
    } finally {
      closeDeleteModal();
    }
  };

  const getModalProps = () => {
    if (deleteModal.type === "single" && deleteModal.document) {
      const doc = deleteModal.document;
      const chunkCount = doc.metadata?.totalChunks || 1;
      return {
        title: doc.title,
        type:
          doc.type === "text"
            ? "Text Content"
            : doc.type === "file"
            ? "File Content"
            : "Web Content",
        detail: `${chunkCount} chunks containing document data will be permanently removed. This action cannot be undone.`,
      };
    } else {
      return {
        title: "All Documents",
        type: "Complete Database",
        detail: `${documents.length} documents and all their chunks will be permanently removed. This action cannot be undone.`,
      };
    }
  };

  const filteredDocuments = documents.filter(
    (doc) =>
      doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      {/* Search Section */}
      <div className="hc-card">
        <div style={{ position: "relative" }}>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search chunks..."
            className="hc-input"
            style={{ paddingLeft: "2.5rem" }}
          />
        </div>
      </div>

      {/* Stored Data with strategic color coding */}
      <div className="hc-card">
        <h3 className="hc-card-header">Stored Documents</h3>

        {isLoading ? (
          <div
            style={{
              textAlign: "center",
              padding: "1rem",
              color: "var(--gray)",
              textTransform: "uppercase",
            }}
          >
            LOADING DOCUMENTS...
          </div>
        ) : filteredDocuments.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: "1rem",
              color: "var(--gray)",
              textTransform: "uppercase",
            }}
          >
            {documents.length === 0
              ? "NO DOCUMENTS STORED YET"
              : "NO DOCUMENTS MATCH YOUR SEARCH"}
          </div>
        ) : (
          <div style={{ flex: 1, overflowY: "auto" }}>
            {filteredDocuments.map((doc, index) => {
              const fileTypeClass =
                doc.type === "file" && doc.title.endsWith(".pdf")
                  ? "file-type-pdf"
                  : doc.type === "text"
                  ? "file-type-txt"
                  : doc.type === "website"
                  ? "file-type-web"
                  : "file-type-csv";

              return (
                <div
                  key={doc.id}
                  className={`hc-data-item ${fileTypeClass} ${
                    index === 0 ? "active" : ""
                  }`}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: "0.5rem",
                    }}
                  >
                    <h4
                      style={{
                        fontSize: "0.875rem",
                        fontWeight: 600,
                        color: "var(--black)",
                        textTransform: "uppercase",
                      }}
                    >
                      ■ {doc.title.toUpperCase()}
                    </h4>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.75rem",
                      }}
                    >
                      <span
                        style={{
                          fontSize: "0.75rem",
                          color: "var(--gray)",
                          textTransform: "uppercase",
                        }}
                      >
                        {doc.metadata?.totalChunks || 1} CHUNKS
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openDeleteModal(doc);
                        }}
                        className="hc-delete-icon"
                        title="DELETE DOCUMENT"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                  <div
                    style={{
                      fontSize: "0.8125rem",
                      color: "var(--davys-gray)",
                      textTransform: "uppercase",
                      letterSpacing: "0.025em",
                    }}
                  >
                    {doc.type === "text"
                      ? "TEXT CONTENT • USER INPUT"
                      : doc.type === "file"
                      ? "FILE CONTENT • PROCESSED DOCUMENT"
                      : "WEB CONTENT • SCRAPED DATA"}
                  </div>
                  {doc.content && (
                    <div
                      style={{
                        fontSize: "0.75rem",
                        color: "var(--gray)",
                        marginTop: "0.5rem",
                        textTransform: "uppercase",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {doc.content.substring(0, 50)}...
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Management Actions */}
      <div style={{ display: "flex", gap: "0.5rem" }}>
        <button
          onClick={openClearAllModal}
          className="hc-button-secondary"
          style={{ flex: 1 }}
        >
          DELETE ALL
        </button>
        <button
          onClick={fetchDocuments}
          className="hc-button-secondary"
          style={{ flex: 1 }}
        >
          REFRESH
        </button>
      </div>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={closeDeleteModal}
        onConfirm={handleConfirmDelete}
        {...getModalProps()}
      />
    </>
  );
}
