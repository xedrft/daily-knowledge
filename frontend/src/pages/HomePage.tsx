import { Button, Stack, Text, Heading } from "@chakra-ui/react"
import { Link, useNavigate } from "react-router-dom"

const HomePage = () => {
  const navigate = useNavigate()

  return (
    <Stack gap={8} align="center" justify="center" minH="100vh" p={8}>
      <Heading size="2xl" textAlign="center">
        Daily Knowledge
      </Heading>
      
      <Text fontSize="lg" textAlign="center" maxW="md">
        Educate yourself with AI-powered learning. 
        Discover new concepts and test your knowledge daily.
      </Text>

      <Stack direction="row" gap={4}>
        <Link to="/signin" style={{ textDecoration: "none" }}>
          <Button colorScheme="blue" size="lg">
            Get Started
          </Button>
        </Link>
        <Link to="/questions" style={{ textDecoration: "none" }}>
          <Button variant="outline" size="lg">
            Browse Questions
          </Button>
        </Link>
      </Stack>

      <Stack gap={4} align="center" mt={12}>
        <Heading size="md">Features</Heading>
        <Stack gap={2} textAlign="center">
          <Text>📚 AI-generated educational content</Text>
          <Text>🎯 Personalized learning paths</Text>
          <Text>💡 Daily knowledge challenges</Text>
          <Text>📊 Track your progress</Text>
        </Stack>
      </Stack>
    </Stack>
  )
}

export default HomePage