import { createSystem, defaultConfig, defineConfig } from "@chakra-ui/react"

const customConfig = defineConfig({
  theme: {
    tokens: {
      fonts: {
        heading: { value: `'Inter', sans-serif` },
        body: { value: `'Inter', sans-serif` },
      },
      colors: {
        sage: {
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
        sage: {
          solid: { 
            value: { 
              _light: "{colors.sage.500}", 
              _dark: "{colors.sage.400}" 
            } 
          },
          contrast: { 
            value: { 
              _light: "white", 
              _dark: "{colors.sage.950}" 
            } 
          },
          fg: { 
            value: { 
              _light: "{colors.sage.700}", 
              _dark: "{colors.sage.300}" 
            } 
          },
          muted: { 
            value: { 
              _light: "{colors.sage.100}", 
              _dark: "{colors.sage.700}" 
            } 
          },
          subtle: { 
            value: { 
              _light: "{colors.sage.200}", 
              _dark: "{colors.sage.800}" 
            } 
          },
          emphasized: { 
            value: { 
              _light: "{colors.sage.300}", 
              _dark: "{colors.sage.600}" 
            } 
          },
          focusRing: { 
            value: { 
              _light: "{colors.sage.500}", 
              _dark: "{colors.sage.400}" 
            } 
          },
        },
        bg: {
          value: {
            _light: "white",
            _dark: "#141413"
          }
        },
        subtle: {
          value: {
            _light: "{colors.gray.50}",
            _dark: "#1a1a19"
          }
        },
        muted: {
          value: {
            _light: "{colors.gray.100}",
            _dark: "#1f1f1e"
          }
        },
        emphasized: {
          value: {
            _light: "{colors.gray.200}",
            _dark: "#252524"
          }
        },
        panel: {
          value: {
            _light: "white",
            _dark: "#0f0f0e"
          }
        },
      },
    },
  },
})

export const system = createSystem(defaultConfig, customConfig)
