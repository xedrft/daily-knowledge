const COMMANDS_TO_FIX = [
  { escaped: '\t', command: 'text' },      
  { escaped: '\t', command: 'times' },
  { escaped: '\b', command: 'beta' },
  { escaped: '\n', command: 'nabla' },
  { escaped: '\r', command: 'rho' },
  { escaped: '\t', command: 'theta' },
  { escaped: '\f', command: 'frac'}

];

export function sanitizeLatexBackslashes(input: string): string {

  
  let result = input;

  // Step 1: Protect LaTeX line breaks (\\) by temporarily replacing them
  result = result.replace(/\\\\(?=\s)/g, '___LINEBREAK___');

  // Step 2: Replace multiple backslashes with single backslash when NOT followed by whitespace
  // Using negative lookahead (?!...) to check it's not followed by whitespace
  result = result.replace(/\\{2,}(?!\s)/g, '\\');
  
  // Step 3: Restore LaTeX line breaks
  result = result.replace(/___LINEBREAK___/g, '\\\\');
  
  // Step 4: Fix escape sequence corruption
  for (const { escaped, command } of COMMANDS_TO_FIX) {
    const searchStr = escaped + command.substring(1); // e.g., [TAB] + "ext"
    if (searchStr) {
      // Replace ALL occurrences with backslash + full command (one runtime backslash)
      result = result.split(searchStr).join('\\' + command);
    }
  }

  // Step 5: Wrap standalone \text{...} with \( \)
  // Find \text{...} that is NOT preceded by \( or \[ and NOT followed by \) or \]
  // This catches bare \text{} commands outside of math mode
  // result = result.replace(/(?<!\\[\(\[])\\text\{[^}]*\}(?![\)\]])/g, (match) => {
  //   return `\\(${match}\\)`;
  // });
  
  return result;
}



export default sanitizeLatexBackslashes;
