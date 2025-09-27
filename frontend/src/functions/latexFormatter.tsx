import 'katex/dist/katex.min.css';
import { BlockMath, InlineMath } from 'react-katex';
import type { ReactElement } from 'react';

export default function latexFormatter(input: string): ReactElement[] {
  // Regex patterns for inline and block LaTeX
  const inlinePattern = /\\\((.+?)\\\)/g; // Matches \(...\)
  const blockPattern = /\\\[(.+?)\\\]/gs; // Matches \[...\] with dotall flag

  const elements: ReactElement[] = [];
  let lastIndex = 0;
  let key = 0;

  // First, handle block math
  let blockMatch;
  const blockMatches: { start: number; end: number; latex: string }[] = [];
  
  // Reset regex lastIndex to ensure proper matching
  blockPattern.lastIndex = 0;
  while ((blockMatch = blockPattern.exec(input)) !== null) {
    blockMatches.push({
      start: blockMatch.index,
      end: blockMatch.index + blockMatch[0].length,
      latex: blockMatch[1].trim()
    });
  }

  // Then handle inline math, avoiding block math regions
  let inlineMatch;
  const inlineMatches: { start: number; end: number; latex: string }[] = [];
  
  // Reset regex lastIndex to ensure proper matching
  inlinePattern.lastIndex = 0;
  while ((inlineMatch = inlinePattern.exec(input)) !== null) {
    // Check if this inline match is inside a block match
    const isInsideBlock = blockMatches.some(block => 
      inlineMatch!.index >= block.start && inlineMatch!.index < block.end
    );
    
    if (!isInsideBlock) {
      inlineMatches.push({
        start: inlineMatch.index,
        end: inlineMatch.index + inlineMatch[0].length,
        latex: inlineMatch[1].trim()
      });
    }
  }

  // Combine and sort all matches
  const allMatches = [...blockMatches.map(m => ({ ...m, type: 'block' })), ...inlineMatches.map(m => ({ ...m, type: 'inline' }))]
    .sort((a, b) => a.start - b.start);

  // Process the string with matches
  for (const match of allMatches) {
    // Add text before the match
    if (lastIndex < match.start) {
      const textBefore = input.substring(lastIndex, match.start);
      if (textBefore) {
        // Split text by newlines and create proper line breaks
        const lines = textBefore.split('\n');
        lines.forEach((line, index) => {
          if (line || index === 0) { // Include empty lines except leading ones
            elements.push(<span key={key++}>{line}</span>);
          }
          if (index < lines.length - 1) {
            elements.push(<br key={key++} />);
          }
        });
      }
    }

    // Add the math component
    if (match.type === 'block') {
      elements.push(<BlockMath key={key++} math={match.latex} />);
    } else {
      elements.push(<InlineMath key={key++} math={match.latex} />);
    }

    lastIndex = match.end;
  }

  // Add remaining text
  if (lastIndex < input.length) {
    const remainingText = input.substring(lastIndex);
    if (remainingText) {
      // Split remaining text by newlines and create proper line breaks
      const lines = remainingText.split('\n');
      lines.forEach((line, index) => {
        if (line || index === 0) { // Include empty lines except leading ones
          elements.push(<span key={key++}>{line}</span>);
        }
        if (index < lines.length - 1) {
          elements.push(<br key={key++} />);
        }
      });
    }
  }

  return elements;
}