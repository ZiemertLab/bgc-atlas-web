"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

interface TruncatedTextProps {
  text: string;
  maxLines?: number;
  className?: string;
}

export function TruncatedText({ text, maxLines = 2, className }: TruncatedTextProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Don't show expand button for short text
  const isLongText = text.length > 100; // Adjust threshold as needed
  
  if (!isLongText) {
    return (
      <span 
        className={cn("", className)}
        title={text}
      >
        {text}
      </span>
    );
  }

  return (
    <div className={cn("relative", className)}>
      <span
        className={cn(
          "inline-block",
          !isExpanded && `line-clamp-${maxLines}`,
          "pr-6" // Space for the icon
        )}
        style={{
          display: isExpanded ? "inline" : "-webkit-box",
          WebkitLineClamp: isExpanded ? "unset" : maxLines,
          WebkitBoxOrient: "vertical",
          overflow: isExpanded ? "visible" : "hidden",
          textOverflow: "ellipsis"
        }}
        title={!isExpanded ? text : undefined}
      >
        {text}
      </span>
      
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="inline-flex items-center justify-center w-4 h-4 ml-1 text-green-600 hover:text-green-700 transition-colors"
        title={isExpanded ? "Collapse text" : "Expand text"}
        aria-label={isExpanded ? "Collapse text" : "Expand text"}
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={cn(
            "transition-transform duration-200",
            isExpanded && "rotate-45"
          )}
        >
          <path d="M12 5v14M5 12h14" />
        </svg>
      </button>
    </div>
  );
}