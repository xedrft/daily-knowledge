import { createSystem, defaultConfig, defineConfig } from "@chakra-ui/react"

const customConfig = defineConfig({
  theme: {
    tokens: {
      fonts: {
        heading: { value: `'Inter', sans-serif` },
        body: { value: `'Inter', sans-serif` },
      },
      colors: {
        emerald: {
          50: { value: "#f0f4f1" },
          100: { value: "#dce6de" },
          200: { value: "#b8cdbf" },
          300: { value: "#8fb49a" },
          400: { value: "#6b9b7a" },
          500: { value: "#4d8260" },
          600: { value: "#3d6a4d" },
          700: { value: "#2f5239" },
          800: { value: "#223b28" },
          900: { value: "#17291c" },
          950: { value: "#0d1810" },
        },
      },
    },
    semanticTokens: {
      colors: {
        emerald: {
          solid: { 
            value: { 
              _light: "{colors.emerald.500}", 
              _dark: "{colors.emerald.400}" 
            } 
          },
          contrast: { 
            value: { 
              _light: "white", 
              _dark: "{colors.emerald.950}" 
            } 
          },
          fg: { 
            value: { 
              _light: "{colors.emerald.700}", 
              _dark: "{colors.emerald.300}" 
            } 
          },
          muted: { 
            value: { 
              _light: "{colors.emerald.100}", 
              _dark: "{colors.emerald.900}" 
            } 
          },
          subtle: { 
            value: { 
              _light: "{colors.emerald.200}", 
              _dark: "{colors.emerald.800}" 
            } 
          },
          emphasized: { 
            value: { 
              _light: "{colors.emerald.300}", 
              _dark: "{colors.emerald.600}" 
            } 
          },
          focusRing: { 
            value: { 
              _light: "{colors.emerald.500}", 
              _dark: "{colors.emerald.400}" 
            } 
          },
        },
      },
    },
  },
})

export const system = createSystem(defaultConfig, customConfig)
