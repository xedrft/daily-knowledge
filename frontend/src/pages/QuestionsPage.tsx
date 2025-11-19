import { Button, Stack, Heading, Text, Box, HStack, IconButton } from "@chakra-ui/react"
import { toaster } from "@/components/ui/toaster"
import { StreakToastContent, TodayCountToastContent } from "@/components/ui/ActivityToast"
import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { LuInfo, LuX } from "react-icons/lu"
import latexFormatter from "@/functions/latexFormatter"
import "@/styles/math.css"
import ProblemSet from "@/components/ProblemSet"
import Navbar from "@/components/Navbar"
import PageContainer from "@/components/layout/PageContainer"
import Panel from "@/components/layout/Panel"
import { api } from "@/lib/api/client"
import { endpoints } from "@/lib/api/endpoints"
import type { ConceptFull, ConceptSummary } from "@/types/domain"
import { useAuthGate } from "@/hooks/useAuthGate"

const QuestionsPage = () => {
  const [concept, setConcept] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string>("")
  const [showInfoBanner, setShowInfoBanner] = useState(() => {
    const dismissed = localStorage.getItem("info-banner-dismissed")
    return dismissed !== "true"
  })
  const navigate = useNavigate()

  const { check } = useAuthGate()

  useEffect(() => {
    check()
  }, [])

  const fetchConcept = async () => {
    setIsLoading(true)
    setError("")
    try {
      // Re-use the unified gate; abort if redirect happened
      const { ok } = await check()
      if (!ok) return
      const conceptJson = await api.get<ConceptFull>(endpoints.getConcept())
      setConcept(conceptJson)
      // Record activity for today and possibly show streak toast
      try {
        const today = new Date()
        const dateKey = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`
        const res = await api.post<{ date: string; todayCount: number; firstOfDay: boolean; streak: number }>(endpoints.recordActivity(), { date: dateKey })
        if (res.firstOfDay) {
          // Fetch last 7 days including today to show which days had activity
          const end = dateKey
          const startDate = new Date(today)
          startDate.setDate(today.getDate() - 6)
          const start = `${startDate.getFullYear()}-${String(startDate.getMonth()+1).padStart(2,'0')}-${String(startDate.getDate()).padStart(2,'0')}`
          let week: Array<{ date: string; count: number }> = []
          try {
            const a = await api.get<{ activities: Array<{ date: string; count: number }> }>(endpoints.getActivity(start, end))
            week = a.activities || []
          } catch {}
          toaster.create({
            type: 'success',
            title: 'Streak +1',
            description: (<StreakToastContent streak={res.streak} week={week} />),
          })
        } else {
          toaster.create({
            title: 'Nice progress',
            description: (<TodayCountToastContent count={res.todayCount} />),
          })
        }
      } catch (e) {
        // Non-fatal
        console.warn('Failed to record activity', e)
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
      const { ok, currentField } = await check();
      if (!ok) return;
      const currentFieldName: string | null = currentField || null;

      const listJson = await api.get<{ concepts: ConceptSummary[] }>(endpoints.listConcepts());
      const items: ConceptSummary[] = listJson.concepts || [];
      if (!items.length) return;

      // Only allow items from the current field
      if (!currentFieldName) return;
      const cf = currentFieldName.toLowerCase();
      const candidates = items.filter(it => Array.isArray(it.fields) && it.fields.some(f => f?.toLowerCase() === cf));
      if (candidates.length === 0) return;

  // Choose the most recent by highest recentOrder; fallback to last item if unavailable
  const orderOf = (it: { recentOrder?: number }) => (typeof it.recentOrder === 'number' ? it.recentOrder : -1);
  const mostRecent = candidates.reduce((best, it) => (orderOf(it) >= orderOf(best) ? it : best), candidates[0]);

      // fetch full content from new endpoint
      const payload = await api.post<ConceptFull>(endpoints.conceptGet(), { documentId: mostRecent.documentId });
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
      <PageContainer>
        {showInfoBanner && (
          <Box 
            bg={{ _light: "sage.50", _dark: "sage.950" }} 
            border="1px solid" 
            borderColor={{ _light: "sage.200", _dark: "sage.800" }} 
            p={4} 
            borderRadius="md"
            mb={4}
            position="relative"
          >
            <IconButton
              aria-label="Dismiss"
              size="sm"
              variant="ghost"
              position="absolute"
              top={2}
              right={2}
              onClick={() => {
                setShowInfoBanner(false)
                localStorage.setItem("info-banner-dismissed", "true")
              }}
            >
              <LuX />
            </IconButton>
            <Stack gap={2}>
              <HStack gap={2} align="center">
                <Box as="span" color="sage.500" display="inline-flex">
                  <LuInfo size={20} />
                </Box>
                <Text fontSize="sm" fontWeight="semibold" color="sage.700" _dark={{ color: "sage.300" }}>
                  How Verocity works
                </Text>
              </HStack>
              <Box 
                fontSize="sm" 
                color="fg.muted" 
                lineHeight="1.7"
                pl={2}
              >
                <Text>
                  <Text as="span" fontWeight="bold">Area</Text>
                  <Text as="span" color="fg.subtle"> — the broad domain (e.g., Mathematics, Physics)</Text>
                </Text>
                <Text pl={4}>
                  <Text as="span" color="sage.500">└─</Text> <Text as="span" fontWeight="bold">Field</Text>
                  <Text as="span" color="fg.subtle"> — a specific subject within that area</Text>
                </Text>
                <Text pl={8}>
                  <Text as="span" color="sage.500">└─</Text> <Text as="span" fontWeight="bold">Concepts</Text>
                  <Text as="span" color="fg.subtle"> — individual topics to learn at your own pace</Text>
                </Text>
              </Box>
              <Text fontSize="sm" color="fg.muted" lineHeight="1.6" pl={2}>
                You can change your field anytime from Settings.
              </Text>
            </Stack>
          </Box>
        )}
        <Stack gap={2}>
          <Heading size="md">Your Concept</Heading>
          <Text color="fg.muted">
            Wise words go here
          </Text>
          {!concept && (
            <Button onClick={fetchConcept} colorPalette="sage" disabled={isLoading} {...(isLoading ? { loading: true, loadingText: 'Fetching concept...' } : {})}>
              Get Concept
            </Button>
          )}
        </Stack>

        {error && (
          <Box bg={{ _light: "red.100", _dark: "red.950" }} p={4} borderRadius="md" border="1px solid" borderColor={{ _light: "red.300", _dark: "red.800" }}>
            <Text color={{ _light: "red.700", _dark: "red.400" }}>{error}</Text>
            <Button mt={2} size="sm" onClick={fetchConcept}>
              Try Again
            </Button>
          </Box>
        )}

        {concept && !isLoading && (
          <Panel>
            <Stack gap={4}>
              <Stack direction="row" justify="space-between" align="center">
                <Heading size="3xl" color="sage.400">{concept.title}</Heading>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={async () => {
                    try {
                      setIsLoading(true)
                      const refreshed = await api.post<ConceptFull>(endpoints.regenerateConcept(), { title: concept.title })
                      setConcept(refreshed)
                      toaster.create({ title: 'Content refreshed', description: 'This concept was regenerated and saved.' })
                    } catch (e) {
                      toaster.create({ type: 'error', title: 'Failed to refresh content' })
                    } finally {
                      setIsLoading(false)
                    }
                  }}
                >
                  ↻ Regenerate
                </Button>
              </Stack>
              <Box 
                className="math-content-container"
              >
                {latexFormatter(concept.content || "No content available")}
              </Box>

              {concept.problemset && (
                <ProblemSet problemset={concept.problemset} />
              )}
            </Stack>
          </Panel>
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
          <Panel p={4}>
            <Text>Learn your first concept in this field to see it here.</Text>
          </Panel>
        )}
      </PageContainer>
    </>
  )
}

export default QuestionsPage