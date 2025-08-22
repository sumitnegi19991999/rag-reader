"use client";

import { useState } from "react";
import { useToast } from "@/contexts/ToastContext";

export default function DataSourceInput() {
  const [textData, setTextData] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [isTextLoading, setIsTextLoading] = useState(false);
  const [isWebsiteLoading, setIsWebsiteLoading] = useState(false);
  const [textProgress, setTextProgress] = useState(0);
  const [websiteProgress, setWebsiteProgress] = useState(0);
  const { showToast } = useToast();

  const handleTextSubmit = async () => {
    if (!textData.trim()) return;

    const wordCount = textData.trim().split(/\s+/).length;
    setIsTextLoading(true);
    setTextProgress(0);

    // Show initial toast
    showToast("info", "Processing Text", `Analyzing ${wordCount} words for knowledge base integration`, {
      duration: 3000
    });

    try {
      // Simulate progress steps
      const progressSteps = [20, 40, 60, 80, 95];
      for (let i = 0; i < progressSteps.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 300));
        setTextProgress(progressSteps[i]);
      }

      const response = await fetch("/api/data/text", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: textData }),
      });

      setTextProgress(100);

      if (response.ok) {
        const result = await response.json();
        console.log("Text data stored:", result);
        
        showToast("success", "Text Processed", 
          `Successfully processed ${wordCount} words and added to knowledge base`, {
            action: {
              label: "View",
              action: () => {
                showToast("info", "Navigation", "Switch to RAG Store to view processed content");
              }
            },
            duration: 6000
          });
        
        setTextData("");
      } else {
        throw new Error(`Server responded with status: ${response.status}`);
      }
    } catch (error) {
      console.error("Error storing text data:", error);
      showToast("error", "Processing Failed", 
        "Unable to process text content. Please check the format and try again", {
          duration: 5000
        });
    } finally {
      setTimeout(() => {
        setIsTextLoading(false);
        setTextProgress(0);
      }, 500);
    }
  };

  const handleWebsiteSubmit = async () => {
    if (!websiteUrl.trim()) return;

    // Validate URL format
    try {
      new URL(websiteUrl);
    } catch {
      showToast("error", "Invalid URL", "Please enter a valid website URL (e.g., https://example.com)", {
        duration: 4000
      });
      return;
    }

    setIsWebsiteLoading(true);
    setWebsiteProgress(0);

    // Show initial toast
    showToast("info", "Scraping Started", `Extracting content from ${new URL(websiteUrl).hostname}`, {
      duration: 3000
    });

    try {
      // Simulate realistic scraping progress
      const progressSteps = [15, 30, 45, 65, 80, 95];
      const stepDescriptions = [
        "Connecting to website...",
        "Downloading page content...",
        "Parsing HTML structure...",
        "Extracting text content...",
        "Processing data...",
        "Finalizing..."
      ];

      for (let i = 0; i < progressSteps.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 600));
        setWebsiteProgress(progressSteps[i]);
      }

      const response = await fetch("/api/data/website", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: websiteUrl }),
      });

      setWebsiteProgress(100);

      if (response.ok) {
        const result = await response.json();
        console.log("Website data stored:", result);
        
        const siteName = new URL(websiteUrl).hostname;
        showToast("success", "Website Scraped", 
          `Successfully extracted and processed content from ${siteName}`, {
            action: {
              label: "View",
              action: () => {
                showToast("info", "Navigation", "Check RAG Store to see the scraped content");
              }
            },
            duration: 6000
          });
        
        setWebsiteUrl("");
      } else {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Server responded with status: ${response.status}`);
      }
    } catch (error) {
      console.error("Error storing website data:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
      
      if (errorMessage.includes("network") || errorMessage.includes("fetch")) {
        showToast("error", "Connection Failed", 
          "Unable to connect to the website. Check the URL and your internet connection", {
            duration: 6000
          });
      } else if (errorMessage.includes("timeout")) {
        showToast("error", "Scraping Timeout", 
          "Website took too long to respond. Try again or use a different URL", {
            duration: 6000
          });
      } else {
        showToast("error", "Scraping Failed", 
          "Unable to extract content from this website. The site may block automated access", {
            duration: 6000
          });
      }
    } finally {
      setTimeout(() => {
        setIsWebsiteLoading(false);
        setWebsiteProgress(0);
      }, 500);
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
          className="hc-input"
          disabled={isTextLoading}
          style={{ marginBottom: isTextLoading ? "1rem" : "1.5rem" }}
        />

        {/* Text Processing Progress */}
        {isTextLoading && (
          <div style={{ marginBottom: "1.5rem" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: "0.5rem",
                fontSize: "0.75rem",
                textTransform: "uppercase",
                fontWeight: 600,
              }}
            >
              <span style={{ color: "var(--black)" }}>
                PROCESSING TEXT CONTENT...
              </span>
              <span style={{ color: "var(--davys-gray)" }}>{textProgress}%</span>
            </div>
            <div className="hc-progress-container">
              <div 
                className="hc-progress-bar" 
                style={{ 
                  width: `${textProgress}%`,
                  transition: "width 0.3s ease"
                }}
              />
            </div>
            <div
              style={{
                fontSize: "0.7rem",
                color: "var(--gray)",
                textTransform: "uppercase",
                letterSpacing: "0.025em",
                marginTop: "0.25rem",
              }}
            >
              ANALYZING CONTENT • CREATING EMBEDDINGS • INDEXING DATA
            </div>
          </div>
        )}

        <button
          onClick={handleTextSubmit}
          disabled={!textData.trim() || isTextLoading}
          className="hc-button"
          style={{ width: "100%" }}
        >
          {isTextLoading ? "PROCESSING..." : "PROCESS TEXT"}
        </button>

        {textData.trim() && !isTextLoading && (
          <div
            style={{
              fontSize: "0.75rem",
              color: "var(--gray)",
              textTransform: "uppercase",
              letterSpacing: "0.025em",
              marginTop: "0.5rem",
              textAlign: "center",
            }}
          >
            {textData.trim().split(/\s+/).length} WORDS READY FOR PROCESSING
          </div>
        )}
      </div>

      {/* Website Scraper Section */}
      <div className="hc-card">
        <h3 className="hc-card-header">Website Scraper</h3>
        
        <input
          type="url"
          value={websiteUrl}
          onChange={(e) => setWebsiteUrl(e.target.value)}
          placeholder="https://example.com/article"
          className="hc-input"
          disabled={isWebsiteLoading}
          style={{ marginBottom: isWebsiteLoading ? "1rem" : "1.5rem" }}
        />

        {/* Website Scraping Progress */}
        {isWebsiteLoading && (
          <div style={{ marginBottom: "1.5rem" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: "0.5rem",
                fontSize: "0.75rem",
                textTransform: "uppercase",
                fontWeight: 600,
              }}
            >
              <span style={{ color: "var(--black)" }}>
                SCRAPING WEBSITE CONTENT...
              </span>
              <span style={{ color: "var(--davys-gray)" }}>{websiteProgress}%</span>
            </div>
            <div className="hc-progress-container">
              <div 
                className="hc-progress-bar" 
                style={{ 
                  width: `${websiteProgress}%`,
                  transition: "width 0.3s ease"
                }}
              />
            </div>
            <div
              style={{
                fontSize: "0.7rem",
                color: "var(--gray)",
                textTransform: "uppercase",
                letterSpacing: "0.025em",
                marginTop: "0.25rem",
              }}
            >
              {websiteProgress < 30 ? "CONNECTING TO WEBSITE" :
               websiteProgress < 50 ? "DOWNLOADING CONTENT" :
               websiteProgress < 70 ? "PARSING HTML STRUCTURE" :
               websiteProgress < 90 ? "EXTRACTING TEXT CONTENT" :
               "FINALIZING PROCESSING"}
            </div>
          </div>
        )}

        <button
          onClick={handleWebsiteSubmit}
          disabled={!websiteUrl.trim() || isWebsiteLoading}
          className="hc-button-accent"
          style={{ width: "100%" }}
        >
          {isWebsiteLoading ? "SCRAPING..." : "SCRAPE WEBSITE"}
        </button>

        {websiteUrl.trim() && !isWebsiteLoading && (
          <div
            style={{
              fontSize: "0.75rem",
              color: "var(--gray)",
              textTransform: "uppercase",
              letterSpacing: "0.025em",
              marginTop: "0.5rem",
              textAlign: "center",
            }}
          >
            {(() => {
              try {
                return `READY TO SCRAPE: ${new URL(websiteUrl).hostname}`;
              } catch {
                return "ENTER A VALID URL TO CONTINUE";
              }
            })()}
          </div>
        )}

        <div
          style={{
            fontSize: "0.7rem",
            color: "var(--gray)",
            textTransform: "uppercase",
            letterSpacing: "0.025em",
            marginTop: "1rem",
            padding: "0.75rem",
            background: "var(--muted)",
            border: "1px solid var(--gray)",
            borderLeft: "4px solid var(--gray)",
          }}
        >
          ⚠ SUPPORTED: ARTICLES • BLOGS • DOCUMENTATION • NEWS SITES
        </div>
      </div>
    </>
  );
}
