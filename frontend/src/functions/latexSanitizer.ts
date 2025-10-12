// Frontend LaTeX sanitizer: collapse 4 backslashes to 2 in two cases:
// 1) Outside math environments entirely
// 2) Inside math, when four backslashes appear immediately before a symbol/letter (i.e., not a line break)
// Math environments detected: \( ... \) and \[ ... \]

const INLINE_MATH = /\\\((.*?)\\\)/gs;  // \( ... \)
const DISPLAY_MATH = /\\\[(.*?)\\\]/gs; // \[ ... \]

function replaceOutsideMath(input: string): string {
  // Temporarily extract math spans
  const mathSpans: string[] = [];
  let masked = input.replace(DISPLAY_MATH, (m) => {
    mathSpans.push(m);
    return `@@MATH${mathSpans.length - 1}@@`;
  });
  masked = masked.replace(INLINE_MATH, (m) => {
    mathSpans.push(m);
    return `@@MATH${mathSpans.length - 1}@@`;
  });

  // Rule 1: outside math, collapse 4 or more backslashes to exactly 2
  masked = masked.replace(/\\{4,}/g, "\\\\");

  // Restore math spans
  masked = masked.replace(/@@MATH(\d+)@@/g, (_, idx) => mathSpans[Number(idx)]);
  return masked;
}

function replaceInsideMath(input: string): string {
  // Process each math segment content
  input = input.replace(DISPLAY_MATH, (_m, inner) => {
    // Rule 2: inside math, if four backslashes are followed by a letter (command), reduce to 2
    const fixedInner = (inner as string).replace(/\\\\(?=[A-Za-z])/g, "\\\\");
    return `\\[${fixedInner}\\]`;
  });
  input = input.replace(INLINE_MATH, (_m, inner) => {
    const fixedInner = (inner as string).replace(/\\\\(?=[A-Za-z])/g, "\\\\");
    return `\\(${fixedInner}\\)`;
  });
  return input;
}

export function sanitizeLatexBackslashes(input: string): string {
  console.log('Sanitizer input:', input);
  let out = fixTripleBackslashN(input);
  out = replaceOutsideMath(out);
  out = replaceInsideMath(out);
  out = normalizeMathDelimiters(out);
//   out = fixStandaloneText(out);
  out = enforceMathForAnswerSolution(out);
  console.log('Sanitizer final output:', out);
  return out;
}

export default sanitizeLatexBackslashes;

// Normalize sequences of three backslashes followed by 'n' to a literal \n
function fixTripleBackslashN(input: string): string {
  // Normalize 3 or more backslashes followed by 'n' into a single literal \n
  return input.replace(/(\\){3,}n/g, "\\n");
}

// Reduce excessive backslashes before math delimiters \( \) \[ \] to a single backslash
function normalizeMathDelimiters(input: string): string {
  return input.replace(/(\\){2,}(?=[\(\)\[\]])/g, "\\");
}

// Ensure single-backslash \text{...} becomes \\text{...} without touching existing \\text{...}
// (Removed) ensureDoubleBackslashText: We now enforce double backslashes for commands strictly inside math spans.

// Fix standalone \text{} to \\text{} but leave \\text{} alone
// FIX THIS IN FUTURE
// function fixStandaloneText(input: string): string {
//   console.log('fixStandaloneText input:', input);
//   // Match single backslash + text{ that is NOT preceded by another backslash
//   const result = input.replace(/(^|[^\\])\\text\{/g, (match, pre) => {
//     console.log('Found \\text{ match:', match, 'replacing with:', `${pre}\\\\text{`);
//     return `${pre}\\\\text{`;
//   });
//   console.log('fixStandaloneText output:', result);
//   return result;
// }

// Ensure Answer/Solution sections are in inline math if they contain LaTeX commands
function enforceMathForAnswerSolution(input: string): string {
  const hasLatexCommand = (s: string) => /\\[A-Za-z]+/.test(s);
  const hasMathDelimiters = (s: string) => /\\\(|\\\[|\$/.test(s);

  // 1) Inline label format: "Answer: ..." or "Solution: ..."
  const inlineLabel = /^(\s*)(Answer|Solution)\s*:\s*(.+)$/gmi;
  input = input.replace(inlineLabel, (_m, leading, label, rest) => {
    const body = String(rest).trim();
    if (hasLatexCommand(body) && !hasMathDelimiters(body)) {
      return `${leading}${label}: \\(${body}\\)`;
    }
    return `${leading}${label}: ${rest}`;
  });

  // 2) Heading format: "### Answer" (apply to the next non-empty, non-heading line only)
  const lines = input.split(/\r?\n/);
  for (let i = 0; i < lines.length; i++) {
    const headingMatch = /^\s*#{1,6}\s*(Answer|Solution)\s*$/i.exec(lines[i]);
    if (!headingMatch) continue;

    // find next meaningful line
    let j = i + 1;
    while (j < lines.length && lines[j].trim() === '') j++;
    if (j >= lines.length) continue;
    // stop if next is also a heading
    if (/^\s*#{1,6}\s+/.test(lines[j])) continue;

    const body = lines[j];
    if (hasLatexCommand(body) && !hasMathDelimiters(body)) {
      lines[j] = `\\(${body.trim()}\\)`;
    }
  }
  return lines.join('\n');
}
