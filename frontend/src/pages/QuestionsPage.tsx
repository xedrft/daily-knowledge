import { Button, Stack, Heading, Text, Box, Spinner } from "@chakra-ui/react"
import { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"

const QuestionsPage = () => {
  const [concept, setConcept] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string>("")
  const navigate = useNavigate()

  const fetchConcept = async () => {
    setIsLoading(true)
    setError("")
    
    try {
      const jwt = localStorage.getItem("jwt")
      if (!jwt) {
        navigate("/signin")
        return
      }

      const conceptRes = await fetch("http://127.0.0.1:1337/api/get-concept", {
        credentials: "include",
        headers: {
          Authorization: `Bearer ${jwt}`,
        },
      });
      
      const conceptJson = await conceptRes.json();
      
      if (conceptRes.ok) {
        setConcept(conceptJson);
      } else {
        setError(conceptJson.error || "Failed to fetch concept");
        if (conceptRes.status === 401 || conceptRes.status === 403) {
          navigate("/signin")
        }
      }

    } catch (err) {
      console.error("Error:", err);
      setError("Network error. Please try again.");
    } finally {
      setIsLoading(false)
    }
  }

  const handleSignOut = () => {
    localStorage.removeItem("jwt")
    navigate("/")
  }

  useEffect(() => {
    fetchConcept()
  }, [])

  return (
    <Stack spacing={6} p={8} maxW="4xl" mx="auto">
      {/* Header */}
      <Stack direction="row" justify="space-between" align="center">
        <Heading size="lg">Daily Knowledge</Heading>
        <Stack direction="row" spacing={2}>
          <Button variant="outline" onClick={() => navigate("/")}>
            Home
          </Button>
          <Button variant="outline" onClick={handleSignOut}>
            Sign Out
          </Button>
        </Stack>
      </Stack>

      {/* Main Content */}
      <Stack spacing={6}>
        <Stack spacing={2}>
          <Heading size="md">Today's Concept</Heading>
          <Text color="gray.600">
            Learn something new and expand your knowledge
          </Text>
        </Stack>

        {isLoading && (
          <Box textAlign="center" py={8}>
            <Spinner size="lg" />
            <Text mt={4}>Loading your concept...</Text>
          </Box>
        )}

        {error && (
          <Box bg="red.50" p={4} borderRadius="md" border="1px solid" borderColor="red.200">
            <Text color="red.600">{error}</Text>
            <Button mt={2} size="sm" onClick={fetchConcept}>
              Try Again
            </Button>
          </Box>
        )}

        {concept && !isLoading && (
          <Box bg="#2E2E2E" p={6} borderRadius="md">
            <Stack spacing={4}>
              <Heading size="sm">Content:</Heading>
              <Text whiteSpace="pre-line">
                {concept.content || "No content available"}
              </Text>
              
              {concept.problems && (
                <>
                  <Heading size="sm">Practice Problems:</Heading>
                  <Text whiteSpace="pre-line">
                    {concept.problems}
                  </Text>
                </>
              )}
            </Stack>
          </Box>
        )}

        {concept && (
          <Stack direction="row" spacing={4}>
            <Button onClick={fetchConcept} colorScheme="blue">
              Get New Concept
            </Button>
            <Button variant="outline">
              Mark as Completed
            </Button>
          </Stack>
        )}
      </Stack>
    </Stack>
  )
}

export default QuestionsPage