import { useState } from 'react';
import sanitizeLatexBackslashes from '@/functions/latexSanitizer';
import latexFormatter from '@/functions/latexFormatter';
import { Box, Grid, Heading, Stack, Text, Textarea } from "@chakra-ui/react";
import Navbar from "@/components/Navbar";
import PageContainer from "@/components/layout/PageContainer";
import Panel from "@/components/layout/Panel";

export default function SanitizerTestPage() {
  const [custom, setCustom] = useState('Type/paste here, e.g. \\nabla or TAB→"\\text":  v = 10 \\t' + 'ext{ m/s } in \\(\\)');

  return (
    <>
      <Navbar />
      <PageContainer>
        <Panel maxW="4xl" mx="auto">
          <Stack gap={6}>
            <Stack gap={1}>
              <Heading size="lg">LaTeX Sanitizer Test</Heading>
              <Text color="fg.muted">Quick harness to visualize how the sanitizer transforms tricky inputs.</Text>
            </Stack>

            <Stack gap={4}>
              <Text fontWeight="medium">Playground</Text>
              <Textarea value={custom} onChange={(e) => setCustom(e.target.value)} rows={5} fontFamily="mono" />

              <Grid templateColumns={{ base: '1fr', md: 'repeat(3, 1fr)' }} gap={3}>
                <Box>
                  <Text fontSize="xs" color="fg.muted">Before</Text>
                  <Box as="pre" whiteSpace="pre-wrap" wordBreak="break-word">{custom}</Box>
                </Box>
                <Box>
                  <Text fontSize="xs" color="fg.muted">After</Text>
                  <Box as="pre" whiteSpace="pre-wrap" wordBreak="break-word">{sanitizeLatexBackslashes(custom)}</Box>
                  <Text fontSize="xs" color="fg.muted" mt={1}>
                    {(() => {
                      const after = sanitizeLatexBackslashes(custom);
                      const hasInline = after.includes('\\(') && after.includes('\\)');
                      const hasBlock = after.includes('\\[') && after.includes('\\]');
                      return <>delims: inline {hasInline ? 'yes' : 'no'} | block {hasBlock ? 'yes' : 'no'}</>;
                    })()}
                  </Text>
                </Box>
                <Box>
                  <Text fontSize="xs" color="fg.muted">Rendered</Text>
                  <Box className="math-content-container">{latexFormatter(custom)}</Box>
                </Box>
              </Grid>
            </Stack>
          </Stack>
        </Panel>
      </PageContainer>
    </>
  );
}
