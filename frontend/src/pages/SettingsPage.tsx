import { Button, Stack, Heading, Text, Box } from "@chakra-ui/react"
import { useState, useEffect } from "react"
import Navbar from "../components/Navbar"
import PageContainer from "@/components/layout/PageContainer"
import Panel from "@/components/layout/Panel"
import { api } from "@/lib/api/client"
import { endpoints } from "@/lib/api/endpoints"
import type { UserData } from "@/types/domain"
import { useAuthGate } from "@/hooks/useAuthGate"

const SettingsPage = () => {
  const [userData, setUserData] = useState<UserData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string>("")
  const { check } = useAuthGate()

  useEffect(() => {
    const fetchUserData = async () => {
      const { ok } = await check()
      if (!ok) return
      try {
        const data = await api.get<UserData>(endpoints.checkField())
        setUserData(data)
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
