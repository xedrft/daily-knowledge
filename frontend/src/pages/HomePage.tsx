import { Button, Stack, Text, Heading } from "@chakra-ui/react"
import { Link } from "react-router-dom"

const HomePage = () => {
  return (
    <Stack spacing={8} align="center" justify="center" minH="100vh" p={8}>
      <Heading size="2xl" textAlign="center">
        Daily Knowledge
      </Heading>
      
      <Text fontSize="lg" textAlign="center" maxW="md">
        Educate yourself with AI-powered learning. 
        Discover new concepts and test your knowledge daily.
      </Text>

      <Stack direction="row" spacing={4}>
        <Button as={Link} to="/signin" colorScheme="blue" size="lg">
          Get Started
        </Button>
        <Button as={Link} to="/questions" variant="outline" size="lg">
          Browse Questions
        </Button>
      </Stack>

      <Stack spacing={4} align="center" mt={12}>
        <Heading size="md">Features</Heading>
        <Stack spacing={2} textAlign="center">
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