"use client";

import { useState, useRef } from "react";

export default function FileUpload() {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);

    try {
      for (const file of Array.from(files)) {
        const formData = new FormData();
        formData.append("file", file);

        // TODO: Implement API call to upload and process file
        const response = await fetch("/api/data/upload", {
          method: "POST",
          body: formData,
        });

        if (response.ok) {
          setUploadedFiles((prev) => [...prev, file.name]);
          console.log(`File ${file.name} uploaded successfully`);
        } else {
          console.error(`Failed to upload ${file.name}`);
        }
      }
    } catch (error) {
      console.error("Error uploading files:", error);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const clearUploadedFiles = () => {
    setUploadedFiles([]);
  };

  return (
    <div className="hc-card">
      <h3 className="hc-card-header">File Upload</h3>

      <div className="hc-upload-area mb-4">
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".pdf,.csv,.txt,.doc,.docx"
          onChange={handleFileUpload}
          hidden
          id="file-upload"
        />
        <div
          style={{
            fontSize: "2rem",
            color: "var(--gray)",
            marginBottom: "1.5rem",
          }}
        >
          ↑
        </div>
        <p
          style={{
            marginBottom: "1rem",
            color: "var(--black)",
            fontWeight: 600,
            textTransform: "uppercase",
            letterSpacing: "0.05em",
          }}
        >
          Drop files here or
        </p>
        <label
          htmlFor="file-upload"
          className="hc-button-secondary"
          style={{ cursor: "pointer" }}
        >
          {isUploading ? "UPLOADING..." : "CHOOSE FILES"}
        </label>
        <p
          style={{
            fontSize: "0.75rem",
            color: "var(--gray)",
            marginTop: "1rem",
            textTransform: "uppercase",
            letterSpacing: "0.05em",
          }}
        >
          PDF • TXT • CSV • DOC • DOCX
        </p>
      </div>

      {/* Progress with color gradient */}
      {isUploading && (
        <div className="mb-4">
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: "0.25rem",
              fontSize: "0.75rem",
              textTransform: "uppercase",
              fontWeight: 600,
            }}
          >
            <span style={{ color: "var(--black)" }}>UPLOADING...</span>
            <span style={{ color: "var(--davys-gray)" }}>75%</span>
          </div>
          <div className="hc-progress-container">
            <div className="hc-progress-bar" style={{ width: "75%" }}></div>
          </div>
        </div>
      )}

      {uploadedFiles.length > 0 && (
        <div>
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
              UPLOADED FILES:
            </h4>
            <button
              onClick={clearUploadedFiles}
              className="hc-button-secondary"
              style={{ padding: "0.25rem 0.75rem", fontSize: "0.75rem" }}
            >
              CLEAR ALL
            </button>
          </div>
          <div style={{ maxHeight: "150px", overflowY: "auto" }}>
            {uploadedFiles.map((fileName, index) => (
              <div key={index} className="hc-data-item">
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <span
                    style={{
                      fontSize: "0.875rem",
                      fontWeight: 600,
                      color: "var(--black)",
                      textTransform: "uppercase",
                    }}
                  >
                    ■ {fileName}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
