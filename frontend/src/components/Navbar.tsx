import { Button, Stack, Heading, Box } from "@chakra-ui/react"
import { useColorModeValue } from "@/components/ui/color-mode"
import { useNavigate } from "react-router-dom"

const Navbar = () => {
  const navigate = useNavigate()
  const navBorder = useColorModeValue("gray.200", "gray.700")
  const navShadow = useColorModeValue("0 2px 6px rgba(15, 23, 42, 0.04)", "0 2px 10px rgba(2,6,23,0.6)")

  const handleSignOut = () => {
    localStorage.removeItem("jwt")
    navigate("/")
  }

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
          <Heading size="lg" cursor="pointer" onClick={() => navigate("/")}>
            Daily Knowledge
          </Heading>
          <Stack direction="row" gap={2}>
            <Button variant="outline" onClick={() => navigate("/")}>
              Home
            </Button>
            <Button variant="outline" onClick={() => navigate("/questions")}>
              Questions
            </Button>
            <Button variant="outline" onClick={() => navigate("/library")}>
              Library
            </Button>
            <Button variant="outline" onClick={() => localStorage.getItem("jwt") ? handleSignOut() : navigate("/signin")}>
              {localStorage.getItem("jwt") ? "Sign Out" : "Sign In"}
            </Button>
          </Stack>
        </Stack>
      </Box>
    </Box>
  )
}

export default Navbar
