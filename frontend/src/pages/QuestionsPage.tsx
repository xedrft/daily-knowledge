import { Button, Stack, Heading, Text, Box } from "@chakra-ui/react"
import { useColorModeValue } from "@/components/ui/color-mode"
import { useState } from "react"
import { useNavigate } from "react-router-dom"

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
      console.log(conceptJson);
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

  // fetchConcept is called only when the user clicks a button now

  const navBorder = useColorModeValue("gray.200", "gray.700")
  const navShadow = useColorModeValue("0 2px 6px rgba(15, 23, 42, 0.04)", "0 2px 10px rgba(2,6,23,0.6)")

  return (
    <>
      {/* Full-bleed nav (line/shadow spans viewport) */}
      <Box
        as="nav"
        w="100%"
        borderBottomWidth="1px"
        borderBottomColor={navBorder}
        boxShadow={navShadow}
      >
        {/* keep nav content centered */}
        <Box maxW="4xl" mx="auto" px={8} py={4}>
          <Stack direction="row" justify="space-between" align="center">
            <Heading size="lg">Daily Knowledge</Heading>
            <Stack direction="row" gap={2}>
              <Button variant="outline" onClick={() => navigate("/")}>
                Home
              </Button>
              <Button variant="outline" onClick={handleSignOut}>
                Sign Out
              </Button>
            </Stack>
          </Stack>
        </Box>
      </Box>
      
      {/* Page container */}
      <Stack gap={6} p={8} maxW="4xl" mx="auto">
        <Stack gap={2}>
          <Heading size="md">Today's Concept</Heading>
          <Text color="gray.600">
            Learn something new and expand your knowledge
          </Text>
          {!concept && !isLoading ? (
            <Button onClick={fetchConcept} colorPalette="cyan">
              Get Concept
            </Button>
          ) : !concept &&
          <Button colorPalette="cyan" loading loadingText="Fetching concept...">
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
              <Heading size="2xl" >Content:</Heading>
              <Text whiteSpace="pre-line">
                {concept.content || "No content available"}
              </Text>

              {concept.problemset && (
                <>
                  <Heading size="2xl">Practice Problems: </Heading>
                  <Text whiteSpace="pre-line">{concept.problemset.map((item, idx) => (`${idx+1}: ${item.problem} \n Answer: ${item.answer}\n \n Solution: ${item.solution}\n\n`))}</Text>
                </>
              )}
            </Stack>
          </Box>
        )}

        {concept && (
          <Stack direction="row" gap={4}>
            <Button onClick={fetchConcept} colorScheme="blue">
              Get New Concept
            </Button>
            <Button variant="outline">Mark as Completed</Button>
          </Stack>
        )}
      </Stack>
    </>
  )
}

export default QuestionsPage