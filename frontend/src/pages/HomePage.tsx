import { Button, Stack, Heading } from "@chakra-ui/react"
import { Link } from "react-router-dom"
import { useState, useEffect } from "react"
import Navbar from "../components/Navbar"

const HomePage = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  useEffect(() => {
    const jwt = localStorage.getItem("jwt")
    setIsLoggedIn(!!jwt)
  }, [])
  return (
    <>
    <Navbar />
    <Stack gap={8} align="center" justify="center" minH="100vh" p={8}>
      <Heading size="5xl" textAlign="center">
        Daily Knowledge
      </Heading>
      

      <Stack direction={isLoggedIn ? "column" : "row"} gap={4} w={isLoggedIn ? "full" : "auto"} maxW="md">
        {!isLoggedIn && (
          <Link to="/signin" style={{ textDecoration: "none" }}>
            <Button colorPalette="cyan" size="lg">
              Get Started
            </Button>
          </Link>
        )}
        <Link to={isLoggedIn ? "/questions" : "/signin"} style={{ textDecoration: "none", width: isLoggedIn ? "100%" : "auto" }}>
          <Button 
            variant={isLoggedIn ? "solid" : "outline"} 
            colorPalette={isLoggedIn ? "cyan" : undefined}
            size="lg"
            w={isLoggedIn ? "full" : "auto"}
          >
            Browse Questions
          </Button>
        </Link>
        {isLoggedIn && (
          <>
            <Link to="/library" style={{ textDecoration: "none", width: "100%" }}>
              <Button 
                variant="outline" 
                colorPalette="cyan"
                size="lg"
                w="full"
              >
                Concept Library
              </Button>
            </Link>
            <Link to="/change-field" style={{ textDecoration: "none", width: "100%" }}>
              <Button 
                variant="outline" 
                colorPalette="cyan"
                size="lg"
                w="full"
              >
                Change Field of Study
              </Button>
            </Link>
          </>
        )}
      </Stack>

    </Stack>
    </>
  )
}

export default HomePage