// Comprehensive command buckets for when JSON escapes (\t, \n, \r, \b, \f) corrupt initial backslashes
const T_COMMANDS = [
  'text', 'textbf', 'textit', 'texttt', 'textcolor', 'textrm', 'textsf', 'textsc',
  'textsuperscript', 'textsubscript', 'textwidth', 'tfrac', 'times', 'tan', 'tau',
  'therefore', 'theta', 'top', 'to', 'triangle', 'tiny', 'ttfamily'
];
const N_COMMANDS = [
  'nabla', 'neq', 'ne', 'ni', 'nmid', 'not', 'notin', 'nsubseteq', 'nsupseteq',
  'nu', 'nwarrow', 'nearrow', 'nrightarrow'
];
const R_COMMANDS = [
  'rho', 'rightarrow', 'Rightarrow', 'rangle', 'rceil', 'rfloor', 'rm', 'rhd',
  'rVert', 'rvert', 'rbrace', 'rbrack'
];
const B_COMMANDS = [
  'beta', 'backslash', 'bf', 'boldsymbol', 'bmod', 'big', 'Big', 'bigg', 'Bigg',
  'binom', 'boxed', 'bar', 'because', 'beth', 'bot', 'biguplus', 'bigcup', 'bigcap',
  'begin'
];
const F_COMMANDS = [
  'frac', 'fbox', 'footnotesize', 'flat', 'forall', 'frown', 'frak'
];

const COMMANDS_TO_FIX = [
  ...T_COMMANDS.map(command => ({ escaped: '\t', command })),
  ...N_COMMANDS.map(command => ({ escaped: '\n', command })),
  ...R_COMMANDS.map(command => ({ escaped: '\r', command })),
  ...B_COMMANDS.map(command => ({ escaped: '\b', command })),
  ...F_COMMANDS.map(command => ({ escaped: '\f', command })),
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

  // Step 5: Trim trailing LaTeX line breaks (\\) or stray backslashes at the end of inline math to avoid KaTeX inline errors
  // Only operate inside inline math delimiters: \( ... \)
  result = result.replace(/\\\((.+?)\\\)/g, (_m, inner: string) => {
    let cleaned = inner;
    cleaned = cleaned.replace(/\\\\\s*$/, ''); // remove trailing \\
    cleaned = cleaned.replace(/\\\s*$/, '');    // then trailing \
    return `\\(${cleaned}\\)`;
  });

  // Step 5: Wrap standalone \text{...} with \( \)
  // Find \text{...} that is NOT preceded by \( or \[ and NOT followed by \) or \]
  // This catches bare \text{} commands outside of math mode
  // result = result.replace(/(?<!\\[\(\[])\\text\{[^}]*\}(?![\)\]])/g, (match) => {
  //   return `\\(${match}\\)`;
  // });
  
  return result;
}



export default sanitizeLatexBackslashes;
