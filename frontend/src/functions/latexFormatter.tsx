import 'katex/dist/katex.min.css';
// @ts-ignore: no type definitions for react-katex
import { BlockMath, InlineMath } from 'react-katex';
import type { ReactElement } from 'react';
import { Heading } from '@chakra-ui/react';
import sanitizeLatexBackslashes from './latexSanitizer';

export default function latexFormatter(input: string): ReactElement[] {
  // Regex patterns for inline and block LaTeX
  const inlinePattern = /\\\((.+?)\\\)/g; // Matches \(...\)
  const blockPattern = /\\\[(.+?)\\\]/gs; // Matches \[...\] with dotall flag
  // Bold will be processed inline during plain text handling now

  const elements: ReactElement[] = [];
  let lastIndex = 0;
  let key = 0;

  // Preprocess the string to collapse stray quadruple backslashes per our rules
  const source = sanitizeLatexBackslashes(input);


  // First, handle block math
  let blockMatch;
  const blockMatches: { start: number; end: number; latex: string }[] = [];
  
  // Reset regex lastIndex to ensure proper matching
  blockPattern.lastIndex = 0;
  while ((blockMatch = blockPattern.exec(source)) !== null) {
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
  while ((inlineMatch = inlinePattern.exec(source)) !== null) {
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
  const allMatches = [
    ...blockMatches.map(m => ({ ...m, type: 'block' })), 
    ...inlineMatches.map(m => ({ ...m, type: 'inline' }))
  ].sort((a, b) => a.start - b.start);

  // Helper to push plain text with markdown heading support
  const pushPlainText = (text: string) => {
    if (!text) return;
    const lines = text.split('\n');
    lines.forEach((line, lineIdx) => {
      if (line.trim().length === 0) {
        // blank line -> just a break (unless it's the very first element)
        if (elements.length && (lineIdx < lines.length - 1)) {
          elements.push(<br key={key++} />);
        }
        return;
      }

      // Detect markdown headings ###, ##, # at start of line (not inside math because this is plain text phase)
      const h3 = /^###\s+(.+)/.exec(line);
      const h2 = /^##\s+(.+)/.exec(line);
      const h1 = /^#\s+(.+)/.exec(line);
      if (h3) {
        elements.push(<Heading as="h3" size="md" key={key++}>{h3[1]}</Heading>);
      } else if (h2) {
        elements.push(<Heading as="h2" size="lg" key={key++}>{h2[1]}</Heading>);
      } else if (h1) {
        elements.push(<Heading as="h1" size="xl" key={key++}>{h1[1]}</Heading>);
      } else {
        // Inline bold parsing: split by **...** while preserving order
        const parts: ReactElement[] = [];
        const boldRegex = /\*\*([^*]+)\*\*/g;
        let last = 0;
        let m: RegExpExecArray | null;
        while ((m = boldRegex.exec(line)) !== null) {
          if (m.index > last) {
            parts.push(<span key={key++}>{line.slice(last, m.index)}</span>);
          }
            parts.push(<strong key={key++}>{m[1]}</strong>);
          last = m.index + m[0].length;
        }
        if (last < line.length) {
          parts.push(<span key={key++}>{line.slice(last)}</span>);
        }
        // Wrap line fragment group
        elements.push(<span key={key++}>{parts}</span>);
      }
      if (lineIdx < lines.length - 1) elements.push(<br key={key++} />);
    });
  };

  // Process the string with matches
  for (const match of allMatches) {
    // Add text before the match
    if (lastIndex < match.start) {
      const textBefore = source.substring(lastIndex, match.start);
      pushPlainText(textBefore);
    }

    // Add the math or bold component
    if (match.type === 'block') {
      elements.push(<BlockMath key={key++} math={(match as any).latex} />);
    } else if (match.type === 'inline') {
      const latexStr = (match as any).latex as string;
      elements.push(<InlineMath key={key++} math={latexStr} />);
    }

    lastIndex = match.end;
  }

  // Add remaining text
  if (lastIndex < source.length) {
    pushPlainText(source.substring(lastIndex));
  }

  return elements;
}