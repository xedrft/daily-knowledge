import { Box, HStack, Text } from "@chakra-ui/react";
import type { PropsWithChildren } from "react";

interface Props {
  label: string;
  active?: boolean;
  onClick?: () => void;
}

export default function FieldOptionCard({ label, active, onClick }: PropsWithChildren<Props>) {
  const handleKey = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick?.();
    }
  };

  return (
    <Box
      role="radio"
      aria-checked={!!active}
      tabIndex={0}
      onKeyDown={handleKey}
      p={3}
      border="1px solid"
      borderColor={active ? "sage.400" : "muted"}
      bg={active ? "sage.50" : "bg"}
      borderRadius="lg"
      cursor="pointer"
      w="100%"
      maxW="520px"
      mx="auto"
      transition="all 0.15s ease-in-out"
      _hover={{ borderColor: active ? 'sage.500' : 'border.emphasized', bg: active ? 'sage.50' : 'panel' }}
      onClick={onClick}
    >
      <HStack gap={3} align="center" justify="flex-start">
        <Box
          boxSize={4}
          borderRadius="full"
          border="2px solid"
          borderColor={active ? 'sage.500' : 'muted'}
          display="inline-flex"
          alignItems="center"
          justifyContent="center"
        >
          {active && (
            <Box boxSize={2} borderRadius="full" bg="sage.500" />
          )}
        </Box>
        <Text color={active ? "sage.600" : "fg"} fontWeight={active ? 'semibold' : 'normal'}>{label}</Text>
      </HStack>
    </Box>
  );
}
