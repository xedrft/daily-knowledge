import { useState } from 'react';
import sanitizeLatexBackslashes from '@/functions/latexSanitizer';
import latexFormatter from '@/functions/latexFormatter';
import { Box } from "@chakra-ui/react";



export default function SanitizerTestPage() {
  const [custom, setCustom] = useState('Type/paste here, e.g. \\nabla or TAB→"\text":  v = 10 \t' + 'ext{ m/s } in \\(\)');

  return (
    <div style={{ padding: 16, maxWidth: 900, margin: '0 auto', fontFamily: 'system-ui, sans-serif' }}>
      <h1>LaTeX Sanitizer Test</h1>
      <p style={{ color: '#666' }}>Quick harness to visualize how sanitizer transforms tricky inputs.</p>
      <section style={{ marginTop: 24 }}>
        <h2>Playground</h2>
        <textarea
          value={custom}
          onChange={(e) => setCustom(e.target.value)}
          rows={5}
          style={{ width: '100%', fontFamily: 'monospace', padding: 8 }}
        />

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginTop: 8 }}>
          <div>
            <div style={{ fontSize: 12, color: '#888' }}>Before</div>
            <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{custom}</pre>
          </div>
          <div>
            <div style={{ fontSize: 12, color: '#888' }}>After</div>
            <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{sanitizeLatexBackslashes(custom)}</pre>
            <div style={{ fontSize: 11, color: '#999', marginTop: 4 }}>
              {/* quick delimiter checks to explain non-rendering */}
              {(() => {
                const after = sanitizeLatexBackslashes(custom);
                const hasInline = after.includes('\\(') && after.includes('\\)');
                const hasBlock = after.includes('\\[') && after.includes('\\]');
                return <span>delims: inline {hasInline ? 'yes' : 'no'} | block {hasBlock ? 'yes' : 'no'}</span>;
              })()}
            </div>
          </div>
          <div>
            <div style={{ fontSize: 12, color: '#888' }}>Rendered</div>
            {/* use sanitized string for rendering to match production path */}
            <Box className="math-content-container">{latexFormatter(custom)}</Box>
          </div>
        </div>
      </section>
    </div>
  );
}
