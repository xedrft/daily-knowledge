import { Button, Stack, Heading, Text, Box, HStack, VStack } from "@chakra-ui/react"
import { Link, useNavigate } from "react-router-dom"
import { useState, useEffect } from "react"
import Navbar from "../components/Navbar"

const HomePage = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    const jwt = localStorage.getItem("jwt")
    if (jwt) {
      navigate("/questions")
    } else {
      setIsLoggedIn(false)
    }
  }, [navigate])

  return (
    <>
      <Navbar />
      <Stack 
        gap={0} 
        align="center" 
        justify="center" 
        minH="100vh" 
        position="relative"
        overflow="hidden"
      >
        {/* Background gradient effect */}
        <Box
          position="absolute"
          top="20%"
          left="50%"
          transform="translateX(-50%)"
          width="800px"
          height="800px"
          borderRadius="full"
          bg={{ _light: "sage.600", _dark: "sage.500" }}
          opacity={{ _light: "0.12", _dark: "0.08" }}
          filter="blur(100px)"
          pointerEvents="none"
          zIndex={0}
        />

        {/* Hero content */}
        <VStack gap={8} align="center" maxW="5xl" px={8} py={20} position="relative" zIndex={1}>
          {/* Hero heading */}
          <VStack gap={4} textAlign="center">
            <Heading
              size="7xl"
              fontWeight="700"
              lineHeight="1.1"
              letterSpacing="tight"
              bgGradient="to-br"
              gradientFrom="sage.300"
              gradientTo="sage.500"
              bgClip="text"
            >
              Verocity
            </Heading>
            
            <Text
              fontSize={{ base: "xl", md: "2xl" }}
              color="fg.muted"
              maxW="2xl"
              lineHeight="1.6"
            >
              Discover something new.
            </Text>
          </VStack>

          {/* CTA buttons */}
          <HStack gap={4} mt={4} wrap="wrap" justify="center">
            {!isLoggedIn ? (
              <>
                <Link to="/signin" style={{ textDecoration: "none" }}>
                  <Button 
                    colorPalette="sage" 
                    size="xl"
                    px={8}
                    h={14}
                    fontSize="md"
                  >
                    Get Started
                  </Button>
                </Link>
                <Link to="/signin" style={{ textDecoration: "none" }}>
                  <Button 
                    variant="outline" 
                    colorPalette="sage"
                    size="xl"
                    px={8}
                    h={14}
                    fontSize="md"
                  >
                    Sign In
                  </Button>
                </Link>
              </>
            ) : (
              <>
                <Link to="/questions" style={{ textDecoration: "none" }}>
                  <Button 
                    colorPalette="sage" 
                    size="xl"
                    px={8}
                    h={14}
                    fontSize="md"
                  >
                    Start Learning
                  </Button>
                </Link>
                <Link to="/library" style={{ textDecoration: "none" }}>
                  <Button 
                    variant="outline" 
                    colorPalette="sage"
                    size="xl"
                    px={8}
                    h={14}
                    fontSize="md"
                  >
                    View Library
                  </Button>
                </Link>
              </>
            )}
          </HStack>
        </VStack>
      </Stack>
    </>
  )
}

export default HomePage