import { Button, Stack, Heading, Box } from "@chakra-ui/react"
import { useColorModeValue } from "@/components/ui/color-mode"
import { useNavigate } from "react-router-dom"

const Navbar = () => {
  const navigate = useNavigate()
  const navBorder = useColorModeValue("gray.200", "gray.700")
  const navShadow = useColorModeValue("0 2px 6px rgba(15, 23, 42, 0.04)", "0 2px 10px rgba(2,6,23,0.6)")

  const isLoggedIn = !!localStorage.getItem("jwt")

  return (
    <Box
      as="nav"
      w="100%"
      borderBottomWidth="1px"
      borderBottomColor={navBorder}
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
          <Stack direction="row" gap={1}>
            {!isLoggedIn && (
              <Button 
                variant="ghost" 
                onClick={() => navigate("/")}
                size="sm"
                borderRadius="md"
                _hover={{ bg: "gray.800" }}
              >
                Home
              </Button>
            )}
            <Button 
              variant="ghost" 
              onClick={() => navigate("/questions")}
              size="sm"
              borderRadius="md"
              _hover={{ bg: "gray.800" }}
            >
              Concept
            </Button>
            <Button 
              variant="ghost" 
              onClick={() => navigate("/library")}
              size="sm"
              borderRadius="md"
              _hover={{ bg: "gray.800" }}
            >
              Library
            </Button>
            <Button 
              variant={isLoggedIn ? "ghost" : "outline"} 
              onClick={() => navigate(isLoggedIn ? "/settings" : "/signin")}
              size="sm"
              borderRadius="md"
              _hover={{ bg: isLoggedIn ? "gray.800" : "sage.50" }}
              colorPalette={isLoggedIn ? "gray" : "sage"}
            >
              {isLoggedIn ? "Settings" : "Sign In"}
            </Button>
          </Stack>
        </Stack>
      </Box>
    </Box>
  )
}

export default Navbar
