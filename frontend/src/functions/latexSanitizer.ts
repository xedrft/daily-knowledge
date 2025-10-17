// Frontend LaTeX sanitizer: fix escape sequence corruption
// Backend sends: "\text" in JSON → JSON.parse interprets \t as TAB → we receive [TAB]+"ext"
// We need to convert back: [TAB]+"ext" → "\text" (1 runtime backslash)

const COMMANDS_TO_FIX = [
  { escaped: '\t', command: 'text' },      // tab character
  { escaped: '\t', command: 'times' },
  { escaped: '\b', command: 'beta' },
  { escaped: '\n', command: 'nabla' },     // newline character (if \nabla exists)
  // Add more if needed: \r → \rho, etc.
];

export function sanitizeLatexBackslashes(input: string): string {

  
  let result = input;
  
  // Step 1: Collapse backslash runs for LaTeX commands/delimiters ONLY
  // Any 2+ backslashes immediately before a command or delimiter becomes a SINGLE backslash.
  // This avoids breaking LaTeX line breaks (\\) since those are usually followed by whitespace/newline, not a letter or ( [
  // Regex notes:
  // - /\\{2,}/ matches two or more backslashes
  // - (?=[A-Za-z()\[]) ensures the next char is a letter or one of ( [
  result = result.replace(/\\{2,}(?=[A-Za-z()\[])/g, '\\');
  
  // Step 2: Fix escape sequence corruption
  for (const { escaped, command } of COMMANDS_TO_FIX) {
    const searchStr = escaped + command.substring(1); // e.g., [TAB] + "ext"
    if (searchStr) {
      // Replace ALL occurrences with backslash + full command (one runtime backslash)
      result = result.split(searchStr).join('\\' + command);
    }
  }
  
  return result;
}



export default sanitizeLatexBackslashes;
