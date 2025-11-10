import { Button, Stack, Heading, Text, Box, Badge, Input } from "@chakra-ui/react"
import { toaster } from "@/components/ui/toaster"
import { useState, useEffect } from "react"
import Navbar from "../components/Navbar"
import PageContainer from "@/components/layout/PageContainer"
import Panel from "@/components/layout/Panel"
import { api } from "@/lib/api/client"
import { endpoints } from "@/lib/api/endpoints"
import type { UserData } from "@/types/domain"
import { useAuthGate } from "@/hooks/useAuthGate"
import PreviouslyLearnedSelector from "@/components/PreviouslyLearnedSelector"
import ActivityGrid, { type ActivityDay } from "@/components/ActivityGrid"
import { useTheme } from "next-themes"

// Removed local COURSE_CATALOG in favor of shared catalog + UI from onboarding

const SettingsPage = () => {
  const [userData, setUserData] = useState<UserData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string>("")
  const [level, setLevel] = useState<number>(7)
  const [prevLearned, setPrevLearned] = useState<string[]>([])
  const [baselinePrevLearned, setBaselinePrevLearned] = useState<string[]>([])
  const [activity, setActivity] = useState<ActivityDay[]>([])
  const [streak, setStreak] = useState<number>(0)
  const { check } = useAuthGate()
  const { theme, setTheme } = useTheme()

  useEffect(() => {
    const fetchUserData = async () => {
      const { ok } = await check()
      if (!ok) return
      try {
  const data = await api.get<UserData>(endpoints.checkField())
  setUserData(data)
  if (typeof data.current_level === 'number') setLevel(data.current_level)
  if (Array.isArray(data.previouslyLearned)) {
    setPrevLearned(data.previouslyLearned)
    setBaselinePrevLearned(data.previouslyLearned)
  }
  // Also fetch activity for the last 26 weeks
  const today = new Date()
  const to = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`
  const start = new Date(today)
  start.setUTCDate(start.getUTCDate() - 26 * 7)
  const from = `${start.getUTCFullYear()}-${String(start.getUTCMonth()+1).padStart(2,'0')}-${String(start.getUTCDate()).padStart(2,'0')}`
  const a = await api.get<{ activities: ActivityDay[] }>(endpoints.getActivity(from, to))
  setActivity(a.activities || [])
  const s = await api.get<{ streak: number }>(endpoints.getStreak())
  setStreak(s.streak || 0)
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
            <Box bg={{ _light: "red.100", _dark: "red.950" }} p={4} borderRadius="md" border="1px solid" borderColor={{ _light: "red.300", _dark: "red.800" }}>
              <Text color={{ _light: "red.700", _dark: "red.400" }}>{error}</Text>
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
                    alignSelf="center"
                    minW="160px"
                    fontWeight="semibold"
                    borderWidth="2px"
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
                        <Button size="sm" variant="outline" colorPalette="sage" alignSelf="center" minW="140px" fontWeight="semibold" borderWidth="2px" onClick={async () => {
                          try { await api.post(endpoints.updateLevel(), { level }); toaster.create({ title: 'Level saved', type: 'success' }); }
                          catch (e) { setError('Failed to update level'); toaster.create({ title: 'Failed to update level', type: 'error' }); }
                        }}>Save Level</Button>
                      </Stack>
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

              {/* Activity Calendar Section */}
              <Panel>
                <Stack gap={3}>
                  <Heading size="md">Activity</Heading>
                  <Text fontWeight="semibold" color="sage.600">Current streak: {streak} day{streak===1?'':'s'}</Text>
                  <Text color="fg.muted" fontSize="sm" textAlign="center">Your recent learning activity (last 6 months)</Text>
                  <ActivityGrid activities={activity} weeks={30} cellSize={16} gap={3} />
                </Stack>
              </Panel>

              {/* Previously Learned Courses Section */}
              <Panel>
                <Stack gap={3}>
                  <Heading size="md">Previously Learned Courses</Heading>
                  <Box w="full" my="8">
                    <Box w="full" maxW="3xl" mx="auto">
                      <PreviouslyLearnedSelector
                        selected={prevLearned}
                        onChange={setPrevLearned}
                        secondaryActionLabel="Reset"
                        onSecondaryAction={() => setPrevLearned(baselinePrevLearned)}
                      />
                    </Box>
                    <Box mt={6} display="flex" justifyContent="center">
                      <Button
                        size="sm"
                        variant="outline"
                        colorPalette="sage"
                        minW="160px"
                        fontWeight="semibold"
                        borderWidth="2px"
                        onClick={async () => {
                          try {
                            await api.post(endpoints.updatePreviouslyLearned(), { courses: prevLearned });
                            setBaselinePrevLearned(prevLearned);
                            toaster.create({ title: 'Courses saved', type: 'success' });
                          } catch (e) {
                            setError('Failed to update courses');
                            toaster.create({ title: 'Failed to update courses', type: 'error' });
                          }
                        }}
                      >
                        Save Courses
                      </Button>
                    </Box>
                  </Box>
                </Stack>
              </Panel>

              {/* Appearance Section */}
              <Panel>
                <Stack gap={3}>
                  <Heading size="md">Appearance</Heading>
                  <Text fontSize="sm" color="fg.muted">Choose your preferred color mode</Text>
                  <Stack direction="row" gap={2}>
                    <Button
                      size="sm"
                      variant={theme === "light" ? "solid" : "outline"}
                      colorPalette="sage"
                      onClick={() => setTheme("light")}
                      flex={1}
                    >
                      Light
                    </Button>
                    <Button
                      size="sm"
                      variant={theme === "dark" ? "solid" : "outline"}
                      colorPalette="sage"
                      onClick={() => setTheme("dark")}
                      flex={1}
                    >
                      Dark
                    </Button>
                    <Button
                      size="sm"
                      variant={theme === "system" ? "solid" : "outline"}
                      colorPalette="sage"
                      onClick={() => setTheme("system")}
                      flex={1}
                    >
                      System
                    </Button>
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
