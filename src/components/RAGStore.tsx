"use client";

import { useState, useEffect } from "react";

interface Document {
  id: string;
  title: string;
  type: "text" | "file" | "website";
  content: string;
  timestamp: string;
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
      // TODO: Implement API call to delete document
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
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">RAG Store</h2>
        <div className="flex gap-2">
          <button
            onClick={fetchDocuments}
            className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
          >
            Refresh
          </button>
          <button
            onClick={clearAllDocuments}
            className="px-3 py-1 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm"
          >
            Clear All
          </button>
        </div>
      </div>

      <div className="mb-4">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search documents..."
          className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      <div className="text-sm text-gray-600 mb-3">
        Total Documents: {documents.length}
      </div>

      {isLoading ? (
        <div className="text-center py-4">Loading documents...</div>
      ) : filteredDocuments.length === 0 ? (
        <div className="text-center py-4 text-gray-500">
          {documents.length === 0
            ? "No documents stored yet"
            : "No documents match your search"}
        </div>
      ) : (
        <div className="space-y-3 max-h-60 overflow-y-auto">
          {filteredDocuments.map((doc) => (
            <div key={doc.id} className="border border-gray-200 rounded-md p-3">
              <div className="flex justify-between items-start mb-2">
                <div className="flex-1">
                  <h3 className="font-medium text-sm">{doc.title}</h3>
                  <span
                    className={`inline-block px-2 py-1 rounded text-xs ${
                      doc.type === "text"
                        ? "bg-blue-100 text-blue-800"
                        : doc.type === "file"
                        ? "bg-green-100 text-green-800"
                        : "bg-purple-100 text-purple-800"
                    }`}
                  >
                    {doc.type}
                  </span>
                </div>
                <button
                  onClick={() => deleteDocument(doc.id)}
                  className="text-red-600 hover:text-red-800 text-sm"
                >
                  Delete
                </button>
              </div>
              <p className="text-sm text-gray-700 truncate">{doc.content}</p>
              <p className="text-xs text-gray-500 mt-1">{doc.timestamp}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
