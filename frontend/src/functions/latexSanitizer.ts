// Frontend LaTeX sanitizer: fix escape sequence corruption
// Backend sends: "\text" in JSON → JSON.parse interprets \t as TAB → we receive [TAB]+"ext"
// We need to convert back: [TAB]+"ext" → "\text" (1 runtime backslash)

const COMMANDS_TO_FIX = [
  { escaped: '\t', command: 'text' },      // tab character
  { escaped: '\t', command: 'times' },
  { escaped: '\n', command: 'nabla' },     // newline character (if \nabla exists)
  // Add more if needed: \r → \rho, etc.
];

export function sanitizeLatexBackslashes(input: string): string {

  
  let result = input;
  
  // Step 1: Fix OpenAI's double-escaping of LaTeX commands
  // Convert \\\\ → \\ (4 typed backslashes → 2 typed, which is 2 runtime → 1 runtime)
  // But only when followed by a character (not whitespace/end of string - preserve line breaks in math)
  result = result.replace(/\\\\(?=\S)/g, '\\');
  
  // Step 2: Fix escape sequence corruption
  for (const { escaped, command } of COMMANDS_TO_FIX) {
    const searchStr = escaped + command.substring(1); // e.g., [TAB] + "ext"
    if (result.includes(searchStr)) {
      // Replace with backslash + full command (1 runtime backslash)
      const regex = new RegExp(escapeRegex(searchStr), 'g');
      result = result.replace(regex, '\\' + command);
    }
  }
  
  return result;
}

// Helper to escape special regex characters
function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export default sanitizeLatexBackslashes;
