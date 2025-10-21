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

  // Fallback: always show something by loading the last learned concept
  const loadLastLearnedConcept = async () => {
    try {
      const ok = await redirectCheck();
      if (!ok) return;
      const jwt = localStorage.getItem('jwt');
      if (!jwt) return;

      // Fetch current field to filter concepts from the same field
      const fieldRes = await fetch('http://127.0.0.1:1337/api/check-field', {
        method: 'GET',
        credentials: 'include',
        headers: { Authorization: `Bearer ${jwt}` },
      });
      if (!fieldRes.ok) return;
      const fieldJson = await fieldRes.json();
      const currentFieldName: string | null = fieldJson?.currentField || null;

      const listRes = await fetch('http://127.0.0.1:1337/api/list-concepts', {
        credentials: 'include',
        headers: { Authorization: `Bearer ${jwt}` },
      });
      if (!listRes.ok) return;
  const listJson = await listRes.json();
  const items: Array<{ documentId: string; title: string; fields?: string[]; recentOrder?: number }>= listJson.concepts || [];
      if (!items.length) return;

      // If we know the current field, prefer items that include it in their fields array
      let candidates = items;
      if (currentFieldName) {
        const cf = currentFieldName.toLowerCase();
        const filtered = items.filter(it => Array.isArray(it.fields) && it.fields.some(f => f?.toLowerCase() === cf));
        if (filtered.length > 0) candidates = filtered;
      }

  // Choose the most recent by highest recentOrder; fallback to last item if unavailable
  const orderOf = (it: { recentOrder?: number }) => (typeof it.recentOrder === 'number' ? it.recentOrder : -1);
  const mostRecent = candidates.reduce((best, it) => (orderOf(it) >= orderOf(best) ? it : best), candidates[0]);

      // fetch full content from new endpoint
      const contentRes = await fetch('http://127.0.0.1:1337/api/concept/get', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${jwt}`,
        },
        credentials: 'include',
        body: JSON.stringify({ documentId: mostRecent.documentId }),
      });
      if (!contentRes.ok) return;
      const payload = await contentRes.json();
      setConcept(payload);
    } catch (e) {
      console.error('Failed to load last learned concept', e);
    }
  };

  // On mount, if no concept is present, try to load last learned
  useEffect(() => {
    if (!concept) {
      loadLastLearnedConcept();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [concept]);

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
          {!concept && (
            <Button onClick={fetchConcept} colorPalette="sage" disabled={isLoading} {...(isLoading ? { loading: true, loadingText: 'Fetching concept...' } : {})}>
              Get Concept
            </Button>
          )}
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
          <Box bg="panel" p={6} borderRadius="md">
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

        {!concept && !isLoading && (
          <Box bg="subtle" p={4} borderRadius="md" border="1px solid" borderColor="muted">
            <Text>Learn your first concept in this field to see it here.</Text>
          </Box>
        )}

      </Stack>
    </>
  )
}

export default QuestionsPage