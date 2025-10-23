import { Button, Stack, Heading, Text, Box, Grid, Badge, Input } from "@chakra-ui/react"
import { toaster } from "@/components/ui/toaster"
import { useState, useEffect } from "react"
import Navbar from "../components/Navbar"
import PageContainer from "@/components/layout/PageContainer"
import Panel from "@/components/layout/Panel"
import { api } from "@/lib/api/client"
import { endpoints } from "@/lib/api/endpoints"
import type { UserData } from "@/types/domain"
import { useAuthGate } from "@/hooks/useAuthGate"

const COURSE_CATALOG = [
  "Algebra I","Algebra II","Geometry","Trigonometry","Precalculus",
  "Calculus I","Calculus II","Calculus III","Linear Algebra","Differential Equations",
  "Probability","Statistics","Discrete Mathematics","Number Theory","Abstract Algebra",
  "Physics I","Physics II","Chemistry I","Biology I"
];

const SettingsPage = () => {
  const [userData, setUserData] = useState<UserData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string>("")
  const [level, setLevel] = useState<number>(7)
  const [prevLearned, setPrevLearned] = useState<string[]>([])
  const { check } = useAuthGate()

  useEffect(() => {
    const fetchUserData = async () => {
      const { ok } = await check()
      if (!ok) return
      try {
  const data = await api.get<UserData>(endpoints.checkField())
  setUserData(data)
  if (typeof data.current_level === 'number') setLevel(data.current_level)
  if (Array.isArray(data.previouslyLearned)) setPrevLearned(data.previouslyLearned)
      } catch (err) {
        console.error("Error:", err)
        setError("Network error. Please try again.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchUserData()
  }, [check])

  const handleSignOut = () => {
    localStorage.removeItem("jwt")
    window.location.href = "/"
  }

  return (
    <>
      <Navbar />

      <PageContainer>
        <Stack gap={6}>
          <Stack gap={2}>
            <Heading size="2xl">Settings</Heading>
            <Text color="fg.muted">Manage your account and preferences</Text>
          </Stack>

          {error && (
            <Box bg="red.50" p={4} borderRadius="md" border="1px solid" borderColor="red.200">
              <Text color="red.600">{error}</Text>
            </Box>
          )}

          {isLoading && (
            <Box textAlign="center" py={12}>
              <Text>Loading settings...</Text>
            </Box>
          )}

          {!isLoading && userData && (
            <Stack gap={4}>
              {/* Current Field Section */}
              <Panel>
                <Stack gap={3}>
                  <Heading size="md">Current Field of Study</Heading>
                  {userData.hasField ? (
                    <>
                      <Text fontSize="lg" fontWeight="bold" color="sage.600">
                        {userData.currentField}
                      </Text>
                      <Text fontSize="sm" color="fg.muted">
                        {userData.conceptStats.currentFieldCount} concepts learned in this field
                      </Text>
                    </>
                  ) : (
                    <Text color="orange.500">No field selected yet</Text>
                  )}
                  <Button
                    size="sm"
                    variant="outline"
                    colorPalette="sage"
                    onClick={() => (window.location.href = "/change-field")}
                    alignSelf="flex-start"
                  >
                    Change Field
                  </Button>
                </Stack>
              </Panel>

              {/* Learning Progress Section */}
              <Panel>
                <Stack gap={3}>
                  <Heading size="md">Learning Progress</Heading>
                  <Stack gap={2}>
                    <Box>
                      <Text fontSize="sm" fontWeight="bold" color="fg.muted">Total Concepts Learned</Text>
                      <Text fontSize="2xl" fontWeight="bold" color="sage.600">
                        {userData.conceptStats.totalConceptsCount}
                      </Text>
                    </Box>
                    <Box>
                      <Text fontSize="sm" fontWeight="bold" color="fg.muted">Current Field Progress</Text>
                      <Text fontSize="xl" fontWeight="bold">
                        {userData.conceptStats.currentFieldCount}
                      </Text>
                    </Box>
                    <Box>
                      <Text fontSize="sm" fontWeight="bold" color="fg.muted">Level</Text>
                      <Stack gap={2}>
                        <Input type="range" min={1} max={15} value={level} onChange={(e) => setLevel(Number(e.target.value))} w="full" style={{ accentColor: 'var(--chakra-colors-sage-500)' }} />
                        <Text>Selected: <Badge colorPalette="sage">{level}</Badge></Text>
                        <Button size="sm" variant="outline" colorPalette="sage" alignSelf="flex-start" onClick={async () => {
                          try { await api.post(endpoints.updateLevel(), { level }); toaster.create({ title: 'Level saved', type: 'success' }); }
                          catch (e) { setError('Failed to update level'); toaster.create({ title: 'Failed to update level', type: 'error' }); }
                        }}>Save Level</Button>
                      </Stack>
                    </Box>
                    <Box>
                      <Text fontSize="sm" fontWeight="bold" color="fg.muted">Previously Learned Courses</Text>
                      <Grid templateColumns={{ base: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' }} gap={2}>
                        {COURSE_CATALOG.map((c) => (
                          <label key={c} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <input type="checkbox" checked={prevLearned.includes(c)} onChange={() => setPrevLearned(prev => prev.includes(c) ? prev.filter(x=>x!==c) : [...prev, c])} />
                            {c}
                          </label>
                        ))}
                      </Grid>
                      <Button size="sm" variant="outline" colorPalette="sage" mt={2} onClick={async () => {
                        try { await api.post(endpoints.updatePreviouslyLearned(), { courses: prevLearned }); toaster.create({ title: 'Courses saved', type: 'success' }); }
                        catch (e) { setError('Failed to update courses'); toaster.create({ title: 'Failed to update courses', type: 'error' }); }
                      }}>Save Courses</Button>
                    </Box>
                    {userData.pastFields.length > 0 && (
                      <Box>
                        <Text fontSize="sm" fontWeight="bold" color="fg.muted">Past Fields Explored</Text>
                        <Text fontSize="md">
                          {userData.pastFields.join(", ")}
                        </Text>
                      </Box>
                    )}
                  </Stack>
                </Stack>
              </Panel>

              {/* Account Actions Section */}
              <Panel>
                <Stack gap={3}>
                  <Heading size="md">Account</Heading>
                  <Button
                    colorPalette="red"
                    variant="outline"
                    onClick={handleSignOut}
                    w="full"
                  >
                    Sign Out
                  </Button>
                </Stack>
              </Panel>
            </Stack>
          )}
        </Stack>
      </PageContainer>
    </>
  )
}

export default SettingsPage
