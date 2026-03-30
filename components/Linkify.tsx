'use client';

import React from 'react';

interface LinkifyProps {
  text: string;
}

export default function Linkify({ text }: LinkifyProps) {
  if (!text) return null;

  // Pattern to match URLs starting with http or https
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  
  // Split the text by URLs while keeping the URLs in the result array
  const parts = text.split(urlRegex);

  return (
    <>
      {parts.map((part, i) => {
        // If the part matches the URL pattern, render it as an anchor tag
        if (part.match(urlRegex)) {
          return (
            <a
              key={i}
              href={part}
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:opacity-80 transition-opacity break-all"
              style={{ color: 'var(--color-accent)' }}
              onClick={(e) => e.stopPropagation()}
            >
              {part}
            </a>
          );
        }
        // Otherwise, render it as plain text
        return part;
      })}
    </>
  );
}
