"use client";

import { useState, useRef, useEffect } from "react";

interface Message {
  id: string;
  type: "user" | "assistant";
  content: string;
  timestamp: string;
  sources?: string[];
}

export default function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content: inputMessage,
      timestamp: new Date().toLocaleTimeString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage("");
    setIsLoading(true);

    try {
      // TODO: Implement API call to get RAG response
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: inputMessage,
          conversationHistory: messages.slice(-5), // Send last 5 messages for context
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          type: "assistant",
          content:
            data.response ||
            "I apologize, but I encountered an error processing your request.",
          timestamp: new Date().toLocaleTimeString(),
          sources: data.sources || [],
        };
        setMessages((prev) => [...prev, assistantMessage]);
      } else {
        throw new Error("Failed to get response");
      }
    } catch (error) {
      console.error("Error sending message:", error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: "assistant",
        content:
          "I apologize, but I encountered an error processing your request. Please try again.",
        timestamp: new Date().toLocaleTimeString(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([]);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      {/* Chat Messages */}
      <div
        style={{
          height: "60%",
          overflowY: "scroll",
          marginBottom: "1rem",
          padding: "0.5rem",
        }}
      >
        {messages.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              color: "var(--gray)",
              marginTop: "2rem",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
            }}
          >
            SYSTEM READY. ASK QUESTIONS ABOUT YOUR DATA.
          </div>
        ) : (
          messages.map((message) => (
            <div key={message.id} className={`hc-chat-message ${message.type}`}>
              <div className="avatar">
                {message.type === "user" ? "YOU" : "AI"}
              </div>
              <div className="content">
                <div>{message.content}</div>
                {message.sources && message.sources.length > 0 && (
                  <div
                    style={{
                      marginTop: "0.5rem",
                      fontSize: "0.75rem",
                      opacity: 0.75,
                    }}
                  >
                    <p>SOURCES:</p>
                    <ul style={{ listStyle: "none", padding: 0 }}>
                      {message.sources.map((source, index) => (
                        <li key={index} style={{ marginTop: "0.25rem" }}>
                          • {source.toUpperCase()}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                <div
                  style={{
                    fontSize: "0.75rem",
                    opacity: 0.75,
                    marginTop: "0.5rem",
                  }}
                >
                  {message.timestamp}
                </div>
              </div>
            </div>
          ))
        )}

        {isLoading && (
          <div className="hc-chat-message assistant">
            <div className="avatar">AI</div>
            <div className="content">
              <div
                style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
              >
                <div className="animate-pulse">ANALYZING...</div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Chat Input */}
      <div style={{ display: "flex", gap: "0.5rem" }}>
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="TYPE YOUR MESSAGE..."
          className="hc-input"
          style={{ flex: 1 }}
          disabled={isLoading}
        />
        <button
          onClick={sendMessage}
          disabled={!inputMessage.trim() || isLoading}
          className="hc-button"
        >
          SEND
        </button>
      </div>
    </>
  );
}
