
import React from "react";

interface PlaceholderListProps {
  placeholders: string[];
}

export function PlaceholderList({ placeholders }: PlaceholderListProps) {
  return (
    <div className="mt-2 text-xs text-muted-foreground">
      <p>Available placeholders:</p>
      <div className="flex flex-wrap gap-1 mt-1">
        {placeholders.map(placeholder => (
          <span key={placeholder} className="bg-muted px-2 py-1 rounded-md">{placeholder}</span>
        ))}
      </div>
    </div>
  );
}
