const COMMANDS_TO_FIX = [
  { escaped: '\t', command: 'text' },      
  { escaped: '\t', command: 'times' },
  { escaped: '\b', command: 'beta' },
  { escaped: '\n', command: 'nabla' },
  { escaped: '\r', command: 'rho' },
  { escaped: '\t', command: 'theta' },

];

export function sanitizeLatexBackslashes(input: string): string {

  
  let result = input;

  result = result.replace(/\\{2,}(?=[A-Za-z()\[,])/g, '\\'); // change to all characters
  
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
