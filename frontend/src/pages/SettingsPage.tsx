import { Button, Stack, Heading, Text, Box } from "@chakra-ui/react"
import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import Navbar from "../components/Navbar"

interface UserData {
  hasField: boolean
  currentField: string | null
  pastFields: string[]
  conceptStats: {
    currentFieldCount: number
    totalConceptsCount: number
  }
}

const SettingsPage = () => {
  const [userData, setUserData] = useState<UserData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string>("")
  const navigate = useNavigate()

  useEffect(() => {
    const fetchUserData = async () => {
      const jwt = localStorage.getItem("jwt")
      if (!jwt) {
        navigate("/signin")
        return
      }

      try {
        const response = await fetch("http://127.0.0.1:1337/api/check-field", {
          method: "GET",
          credentials: "include",
          headers: { Authorization: `Bearer ${jwt}` }
        })

        if (response.ok) {
          const data = await response.json()
          setUserData(data)
        } else {
          setError("Failed to fetch user data")
          if (response.status === 401 || response.status === 403) {
            navigate("/signin")
          }
        }
      } catch (err) {
        console.error("Error:", err)
        setError("Network error. Please try again.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchUserData()
  }, [navigate])

  const handleSignOut = () => {
    localStorage.removeItem("jwt")
    navigate("/")
  }

  return (
    <>
      <Navbar />

      <Box maxW="4xl" mx="auto" px={8} py={6}>
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
              <Box p={6} bg="panel" borderRadius="lg" border="1px solid" borderColor="muted">
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
                    onClick={() => navigate("/change-field")}
                    alignSelf="flex-start"
                  >
                    Change Field
                  </Button>
                </Stack>
              </Box>

              {/* Learning Progress Section */}
              <Box p={6} bg="panel" borderRadius="lg" border="1px solid" borderColor="muted">
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
              </Box>

              {/* Account Actions Section */}
              <Box p={6} bg="panel" borderRadius="lg" border="1px solid" borderColor="muted">
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
              </Box>
            </Stack>
          )}
        </Stack>
      </Box>
    </>
  )
}

export default SettingsPage
