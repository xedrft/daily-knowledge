import { Button, HStack, Text, Box } from "@chakra-ui/react";
import { LuCheck } from "react-icons/lu";
import type { PropsWithChildren } from "react";

interface Props {
  label: string;
  active?: boolean;
  onClick?: () => void;
}

export default function FieldOptionCard({ label, active, onClick }: PropsWithChildren<Props>) {
  return (
    <Button
      type="button"
      variant={active ? 'solid' : 'outline'}
      colorPalette="sage"
      size="sm"
      w="full"
      mx="auto"
      justifyContent="space-between"
      alignSelf="center"
      onClick={onClick}
    >
      <HStack justify="space-between" w="full">
        <Text>{label}</Text>
        {active && (
          <Box as="span" display="inline-flex" aria-hidden>
            <LuCheck size={18} />
          </Box>
        )}
      </HStack>
    </Button>
  );
}
