import { Button, Stack, Heading, Text, Box } from "@chakra-ui/react"
import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import latexFormatter from "@/functions/latexFormatter"
import "@/styles/math.css"
import ProblemSet from "@/components/ProblemSet"
import Navbar from "@/components/Navbar"

const QuestionsPage = () => {
  const [concept, setConcept] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string>("")
  const navigate = useNavigate()

  // NEW: unified auth + field presence gate
  const redirectCheck = async (): Promise<boolean> => {
    const jwt = localStorage.getItem("jwt")
    if (!jwt) {
      navigate("/signin")
      return false
    }
    try {
      const resp = await fetch("http://127.0.0.1:1337/api/check-field", {
        method: "GET",
        credentials: "include",
        headers: { Authorization: `Bearer ${jwt}` }
      })
      if (!resp.ok) {
        if (resp.status === 401 || resp.status === 403) {
          navigate("/signin")
          return false
        }
        // backend error: silently stop
        return false
      }
      const data = await resp.json()
      if (data.hasField === false) {
        navigate("/change-field")
        return false
      }
      return true
    } catch (e) {
      console.error("Field check failed:", e)
      return false
    }
  }

  useEffect(() => {
    redirectCheck()
  }, [])

  const fetchConcept = async () => {
    setIsLoading(true)
    setError("")
    try {
      // Re-use the unified gate; abort if redirect happened
      const ok = await redirectCheck()
      if (!ok) return

      const jwt = localStorage.getItem("jwt")
      if (!jwt) {
        navigate("/signin")
        return
      }

      const conceptRes = await fetch("http://127.0.0.1:1337/api/get-concept", {
        credentials: "include",
        headers: { Authorization: `Bearer ${jwt}` }
      })
      const conceptJson = await conceptRes.json()
      if (conceptRes.ok) {
        setConcept(conceptJson)
      } else {
        setError(conceptJson.error || "Failed to fetch concept")
        if (conceptRes.status === 401 || conceptRes.status === 403) navigate("/signin")
      }
    } catch (err) {
      console.error("Error:", err)
      setError("Network error. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <Navbar />
      
      {/* Page container */}
      <Stack gap={6} p={8} maxW="8xl" mx="auto">
        <Stack gap={2}>
          <Heading size="md">Today's Concept</Heading>
          <Text color="gray.600">
            Learn something new and expand your knowledge
          </Text>
          {!concept && !isLoading ? (
            <Button onClick={fetchConcept} colorPalette="sage">
              Get Concept
            </Button>
          ) : !concept &&
          <Button colorPalette="sage" loading loadingText="Fetching concept...">
            Get Concept 
          </Button>}
        </Stack>

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
            <Stack gap={4}>
              <Heading size="3xl" color="sage.400">{concept.title}</Heading>
              <Box 
                className="math-content-container"
              >
                {latexFormatter(concept.content || "No content available")}
              </Box>

              {concept.problemset && (
                <ProblemSet problemset={concept.problemset} />
              )}
            </Stack>
          </Box>
        )}

        {concept && !isLoading ?(
          <Stack gap={4}>
            <Button onClick={fetchConcept} colorPalette="sage">
              Get New Concept
            </Button>
            <Button 
              onClick={() => navigate("/change-field")} 
              variant="outline" 
              colorPalette="sage"
            >
              Change Field of Study
            </Button>
          </Stack>
        ) : concept && (
          <Button colorPalette="sage" loading loadingText="Fetching new concept...">
            Get New Concept
          </Button>
        )}

      </Stack>
    </>
  )
}

export default QuestionsPage