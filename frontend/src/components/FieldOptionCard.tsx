import { Box, Text } from "@chakra-ui/react";
import type { PropsWithChildren } from "react";

interface Props {
  label: string;
  active?: boolean;
  onClick?: () => void;
}

export default function FieldOptionCard({ label, active, onClick }: PropsWithChildren<Props>) {
  return (
    <Box
      p={4}
      border="1px solid"
      borderColor={active ? "sage.400" : "muted"}
      bg={active ? "sage.50" : "panel"}
      borderRadius="md"
      cursor="pointer"
      w="100%"
      maxW="480px"
      mx="auto"
      transition="all 0.15s ease-in-out"
      _hover={{ borderColor: 'border.emphasized', boxShadow: 'md' }}
      onClick={onClick}
    >
      <label style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 12, width: '100%' }}>
        <input type="radio" checked={!!active} readOnly />
        <Text color={active ? "sage.500" : "fg"}>{label}</Text>
      </label>
    </Box>
  );
}
