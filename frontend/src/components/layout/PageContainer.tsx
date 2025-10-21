import type { PropsWithChildren } from "react";
import { Stack } from "@chakra-ui/react";

export default function PageContainer({ children }: PropsWithChildren) {
  return (
    <Stack gap={6} p={8} maxW="8xl" mx="auto">
      {children}
    </Stack>
  );
}
