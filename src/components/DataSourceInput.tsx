"use client";

import { useState } from "react";

export default function DataSourceInput() {
  const [textData, setTextData] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleTextSubmit = async () => {
    if (!textData.trim()) return;

    setIsLoading(true);
    try {
      // TODO: Implement API call to store text data
      const response = await fetch("/api/data/text", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: textData }),
      });
      // Handle response
      console.log("Text data stored");
      setTextData("");
    } catch (error) {
      console.error("Error storing text data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleWebsiteSubmit = async () => {
    if (!websiteUrl.trim()) return;

    setIsLoading(true);
    try {
      // TODO: Implement API call to fetch and store website data
      const response = await fetch("/api/data/website", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: websiteUrl }),
      });
      // Handle response
      console.log("Website data stored");
      setWebsiteUrl("");
    } catch (error) {
      console.error("Error storing website data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Text Input Section */}
      <div className="hc-card">
        <h3 className="hc-card-header">Text Input</h3>
        <textarea
          value={textData}
          onChange={(e) => setTextData(e.target.value)}
          placeholder="Paste or type your text content here..."
          rows={4}
          className="hc-input mb-4"
        />
        <button
          onClick={handleTextSubmit}
          disabled={!textData.trim() || isLoading}
          className="hc-button"
        >
          {isLoading ? "PROCESSING..." : "PROCESS TEXT"}
        </button>
      </div>

      {/* Website Scraper Section */}
      <div className="hc-card">
        <h3 className="hc-card-header">Website Scraper</h3>
        <div className="mb-4">
          <input
            type="url"
            value={websiteUrl}
            onChange={(e) => setWebsiteUrl(e.target.value)}
            placeholder="https://example.com/article"
            className="hc-input mb-4"
          />
        </div>
        <button
          onClick={handleWebsiteSubmit}
          disabled={!websiteUrl.trim() || isLoading}
          className="hc-button-accent"
        >
          {isLoading ? "SCRAPING..." : "SCRAPE WEBSITE"}
        </button>
      </div>
    </>
  );
}
