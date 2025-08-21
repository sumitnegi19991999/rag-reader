"use client";

import { useState, useEffect } from "react";

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

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    setIsLoading(true);
    try {
      // TODO: Implement API call to fetch stored documents
      const response = await fetch("/api/documents");
      if (response.ok) {
        const data = await response.json();
        console.log(data.documents);
        setDocuments(data.documents || []);
      }
    } catch (error) {
      console.error("Error fetching documents:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteDocument = async (id: string) => {
    try {
      const response = await fetch(`/api/documents/${id}`, {
        method: "DELETE",
      });
      if (response.ok) {
        setDocuments((prev) => prev.filter((doc) => doc.id !== id));
      }
    } catch (error) {
      console.error("Error deleting document:", error);
    }
  };

  const clearAllDocuments = async () => {
    try {
      // TODO: Implement API call to clear all documents
      const response = await fetch("/api/documents", {
        method: "DELETE",
      });
      if (response.ok) {
        setDocuments([]);
      }
    } catch (error) {
      console.error("Error clearing documents:", error);
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
                        {doc.metadata?.chunksCount || 1} CHUNKS
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteDocument(doc.id);
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
          onClick={clearAllDocuments}
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
    </>
  );
}
