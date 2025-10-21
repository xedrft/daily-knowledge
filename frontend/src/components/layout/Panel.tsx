import type { PropsWithChildren } from "react";
import { Box } from "@chakra-ui/react";

export default function Panel({ children, ...rest }: PropsWithChildren & Record<string, any>) {
  return (
    <Box bg="panel" border="1px solid" borderColor="muted" borderRadius="lg" p={6} {...rest}>
      {children}
    </Box>
  );
}
