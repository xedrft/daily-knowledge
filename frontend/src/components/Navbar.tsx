import { Button, Stack, Heading, Box, IconButton } from "@chakra-ui/react"
import { useColorModeValue } from "@/components/ui/color-mode"
import { useNavigate } from "react-router-dom"
import { useState } from "react"
import { LuMenu, LuX } from "react-icons/lu"

const Navbar = () => {
  const navigate = useNavigate()
  const navShadow = useColorModeValue("0 2px 6px rgba(15, 23, 42, 0.04)", "0 2px 10px rgba(2,6,23,0.6)")
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const isLoggedIn = !!localStorage.getItem("jwt")

  const handleNavigation = (path: string) => {
    navigate(path)
    setIsMenuOpen(false)
  }

  return (
    <Box
      as="nav"
      w="100%"
      borderBottomWidth="1px"
      borderBottomColor="subtle"
      boxShadow={navShadow}
    >
      <Box maxW="8xl" mx="auto" px={8} py={4}>
        <Stack direction="row" justify="space-between" align="center">
          <Heading 
            size="lg" 
            cursor="pointer" 
            onClick={() => navigate(isLoggedIn ? "/questions" : "/")} 
            color="sage.400"
            _hover={{ color: "sage.500" }}
            transition="color 0.2s"
          >
            Verocity
          </Heading>
          
          {/* Desktop Navigation */}
          <Stack direction="row" gap={1} display={{ base: "none", sm: "flex" }}>
            {!isLoggedIn && (
              <Button 
                variant="ghost" 
                onClick={() => navigate("/")}
                size="sm"
                borderRadius="md"
                _hover={{ bg: { _light: "muted", _dark: "gray.800" } }}
              >
                Home
              </Button>
            )}
            <Button 
              variant="ghost" 
              onClick={() => navigate("/questions")}
              size="sm"
              borderRadius="md"
              _hover={{ bg: { _light: "muted", _dark: "gray.800" } }}
            >
              Concept
            </Button>
            <Button 
              variant="ghost" 
              onClick={() => navigate("/library")}
              size="sm"
              borderRadius="md"
              _hover={{ bg: { _light: "muted", _dark: "gray.800" } }}
            >
              Library
            </Button>
            <Button 
              variant={isLoggedIn ? "ghost" : "outline"} 
              onClick={() => navigate(isLoggedIn ? "/settings" : "/signin")}
              size="sm"
              borderRadius="md"
              _hover={{ bg: isLoggedIn ? { _light: "muted", _dark: "gray.800" } : "sage.50" }}
              colorPalette={isLoggedIn ? "gray" : "sage"}
              color={!isLoggedIn ? "sage.solid" : undefined}
            >
              {isLoggedIn ? "Settings" : "Sign In"}
            </Button>
          </Stack>

          {/* Mobile Hamburger */}
          <IconButton
            aria-label="Toggle menu"
            display={{ base: "flex", sm: "none" }}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            variant="ghost"
            size="sm"
          >
            {isMenuOpen ? <LuX /> : <LuMenu />}
          </IconButton>
        </Stack>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <Stack
            mt={4}
            gap={2}
            display={{ base: "flex", sm: "none" }}
            pb={2}
          >
            {!isLoggedIn && (
              <Button 
                variant="ghost" 
                onClick={() => handleNavigation("/")}
                size="sm"
                borderRadius="md"
                _hover={{ bg: { _light: "muted", _dark: "gray.800" } }}
                justifyContent="flex-start"
              >
                Home
              </Button>
            )}
            <Button 
              variant="ghost" 
              onClick={() => handleNavigation("/questions")}
              size="sm"
              borderRadius="md"
              _hover={{ bg: { _light: "muted", _dark: "gray.800" } }}
              justifyContent="flex-start"
            >
              Concept
            </Button>
            <Button 
              variant="ghost" 
              onClick={() => handleNavigation("/library")}
              size="sm"
              borderRadius="md"
              _hover={{ bg: { _light: "muted", _dark: "gray.800" } }}
              justifyContent="flex-start"
            >
              Library
            </Button>
            <Button 
              variant={isLoggedIn ? "ghost" : "outline"} 
              onClick={() => handleNavigation(isLoggedIn ? "/settings" : "/signin")}
              size="sm"
              borderRadius="md"
              _hover={{ bg: isLoggedIn ? { _light: "muted", _dark: "gray.800" } : "sage.50" }}
              colorPalette={isLoggedIn ? "gray" : "sage"}
              color={!isLoggedIn ? "sage.solid" : undefined}
              justifyContent="flex-start"
            >
              {isLoggedIn ? "Settings" : "Sign In"}
            </Button>
          </Stack>
        )}
      </Box>
    </Box>
  )
}

export default Navbar
