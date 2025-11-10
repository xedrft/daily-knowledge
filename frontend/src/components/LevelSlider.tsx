import { Box, Input, Text, Stack, Field } from "@chakra-ui/react"

interface LevelSliderProps {
  value: number
  onChange: (value: number) => void
  showLabel?: boolean
  showTooltip?: boolean
}

const LevelSlider = ({ value, onChange, showLabel = true, showTooltip = true }: LevelSliderProps) => {
  return (
    <Field.Root>
      {showLabel && (
        <Field.Label>Level (1–15)</Field.Label>
      )}
      {showTooltip && (
        <Field.HelperText mb={2}>
          <Text fontSize="xs" color="fg.muted">
            <strong>1–5:</strong> High school or introductory • <strong>6–10:</strong> Undergraduate or intermediate • <strong>11–15:</strong> Graduate, advanced, or professional
          </Text>
        </Field.HelperText>
      )}
      <Stack w="full" gap={3}>
        <Box 
          position="relative" 
          w="full" 
          px={2}
        >
          {/* Track background */}
          <Box
            position="absolute"
            top="50%"
            left={0}
            right={0}
            h="8px"
            bg={{ _light: "#e5e7eb", _dark: "#374151" }}
            borderRadius="full"
            transform="translateY(-50%)"
          />
          
          {/* Filled track */}
          <Box
            position="absolute"
            top="50%"
            left={0}
            h="8px"
            bg="sage.500"
            borderRadius="full"
            transform="translateY(-50%)"
            width={`${((value - 1) / 14) * 100}%`}
            transition="width 0.2s"
          />
          
          {/* Slider input */}
          <Input
            type="range"
            min={1}
            max={15}
            value={value}
            onChange={(e) => onChange(Number(e.target.value))}
            position="relative"
            zIndex={2}
            opacity={0}
            cursor="pointer"
            h="32px"
          />
          
          {/* Thumb indicator with level number inside */}
          <Box
            position="absolute"
            top="50%"
            left={`${((value - 1) / 14) * 100}%`}
            w="32px"
            h="32px"
            bg="sage.500"
            border="3px solid"
            borderColor={{ _light: "white", _dark: "#141413" }}
            borderRadius="full"
            transform="translate(-50%, -50%)"
            boxShadow="0 2px 8px rgba(0,0,0,0.15)"
            pointerEvents="none"
            transition="left 0.2s"
            display="flex"
            alignItems="center"
            justifyContent="center"
          >
            <Text 
              fontSize="sm" 
              fontWeight="bold" 
              color="white"
              lineHeight="1"
            >
              {value}
            </Text>
          </Box>
        </Box>
      </Stack>
    </Field.Root>
  )
}

export default LevelSlider
