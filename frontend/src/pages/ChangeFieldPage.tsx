import { Button, Field, Input, Stack, Heading, Text, Box } from "@chakra-ui/react"
import { useForm } from "react-hook-form"
import { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"

interface FormValues {
  generalArea: string
}

interface SelectFieldValues {
  selectedField: string
}

interface UserFieldData {
  hasField: boolean
  currentField: string | null
  pastFields: string[]
  currentFieldConcepts: string[]
  allPastConcepts: string[]
  conceptStats: {
    currentFieldCount: number
    totalConceptsCount: number
  }
}

interface FieldSuggestions {
  generalArea: string
  suggestions: string[]
}

const ChangeFieldPage = () => {
  const {
    register: registerGeneralArea,
    handleSubmit: handleSubmitGeneralArea,
    formState: { errors: generalAreaErrors },
  } = useForm<FormValues>()
  
  const {
    register: registerFieldSelection,
    handleSubmit: handleSubmitFieldSelection,
    formState: { errors: fieldSelectionErrors },
  } = useForm<SelectFieldValues>()
  
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string>("")
  const [success, setSuccess] = useState<string>("")
  const [userFieldData, setUserFieldData] = useState<UserFieldData | null>(null)
  const [fieldSuggestions, setFieldSuggestions] = useState<FieldSuggestions | null>(null)
  const [step, setStep] = useState<'general' | 'select'>('general')
  const navigate = useNavigate()

  useEffect(() => {
    const jwt = localStorage.getItem("jwt")
    if (!jwt) {
      navigate("/signin")
      return
    }

    // Fetch current user field data
    fetchUserFieldData()
  }, [navigate])

  const fetchUserFieldData = async () => {
    try {
      const jwt = localStorage.getItem("jwt")
      if (!jwt) {
        navigate("/signin")
        return
      }

      const response = await fetch("http://127.0.0.1:1337/api/check-field", {
        method: "GET",
        credentials: "include",
        headers: {
          Authorization: `Bearer ${jwt}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setUserFieldData(data)
      } else {
        console.error("Failed to fetch user field data:", response.status, await response.text())
        if (response.status === 401) {
          navigate("/signin")
        }
      }
    } catch (err) {
      console.error("Error fetching user field data:", err)
    }
  }

  async function onSubmitGeneralArea(data: FormValues) {
    setIsLoading(true)
    setError("")
    setSuccess("")
    
    try {
      const jwt = localStorage.getItem("jwt")
      if (!jwt) {
        navigate("/signin")
        return
      }

      const response = await fetch("http://127.0.0.1:1337/api/get-field-suggestions", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${jwt}`,
        },
        credentials: "include",
        body: JSON.stringify({
          generalArea: data.generalArea,
        }),
      })

      if (response.ok) {
        const suggestions = await response.json()
        setFieldSuggestions(suggestions)
        setStep('select')
      } else {
        const errorData = await response.json()
        setError(errorData.error || "Failed to get field suggestions")
        if (response.status === 401) {
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

  async function onSubmitFieldSelection(data: SelectFieldValues) {
    setIsLoading(true)
    setError("")
    setSuccess("")
    
    try {
      const jwt = localStorage.getItem("jwt")
      if (!jwt) {
        navigate("/signin")
        return
      }

      const response = await fetch("http://127.0.0.1:1337/api/change-field", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${jwt}`,
        },
        credentials: "include",
        body: JSON.stringify({
          field: data.selectedField,
        }),
      })

      if (response.ok) {
        await response.json()
        setSuccess("Field changed successfully! You can now explore new topics.")
        fetchUserFieldData()
        setTimeout(() => navigate("/questions"), 2000)
      } else {
        const errorData = await response.json()
        setError(errorData.error || "Failed to change field")
        if (response.status === 401) {
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

  return (
    <Stack gap={8} align="center" justify="center" minH="100vh" p={8}>
      <Stack gap={4} align="center" maxW="2xl">
        <Heading size="xl">Change Your Field of Study</Heading>
        <Text color="gray.400" textAlign="center">
          Switch to a new area of science to explore different concepts and expand your knowledge
        </Text>
      </Stack>

      {userFieldData && (
        <Box bg="#1a1a1a" border="1px solid #4A4A4A" p={6} borderRadius="md" maxW="md" w="full">
          <Stack gap={4}>
            <Text fontWeight="bold">Current Status:</Text>
            {userFieldData.hasField ? (
              <>
                <Box>
                  <Text><strong>Current Field:</strong> <span style={{color: "#7dd3fc"}}>{userFieldData.currentField}</span></Text>
                  <Text fontSize="sm" color="gray.400">
                    {userFieldData.conceptStats.currentFieldCount} concepts learned in this field
                  </Text>
                </Box>
                
                {userFieldData.pastFields.length > 0 && (
                  <Box>
                    <Text><strong>Past Fields:</strong> <span style={{color: "#d1d5db"}}>{userFieldData.pastFields.join(", ")}</span></Text>
                    <Text fontSize="sm" color="gray.400">
                      {userFieldData.conceptStats.totalConceptsCount - userFieldData.conceptStats.currentFieldCount} concepts from past fields
                    </Text>
                  </Box>
                )}
                
                <Box pt={2} borderTop="1px solid #4A4A4A">
                  <Text fontSize="sm" color="emerald.300">
                    <strong>Total Learning Progress:</strong> {userFieldData.conceptStats.totalConceptsCount} concepts explored
                  </Text>
                </Box>
              </>
            ) : (
              <Text color="orange.400">No field selected yet</Text>
            )}
          </Stack>
        </Box>
      )}

      {step === 'general' ? (
        <form onSubmit={handleSubmitGeneralArea(onSubmitGeneralArea)}>
          <Stack gap="4" align="flex-start" maxW="md" w="full">
            {error && (
              <Text color="red.500" fontSize="sm">{error}</Text>
            )}
            
            <Field.Root invalid={!!generalAreaErrors.generalArea}>
              <Field.Label>General Area of Science</Field.Label>
              <Input
                {...registerGeneralArea("generalArea", {
                  required: "General area is required",
                  minLength: { value: 2, message: "General area must be at least 2 characters" }
                })}
                placeholder="e.g., Physics, Mathematics, Chemistry, Biology..."
              />
              <Field.ErrorText>{generalAreaErrors.generalArea?.message}</Field.ErrorText>
              <Field.HelperText>
                Enter a broad scientific area to get specific field suggestions
              </Field.HelperText>
            </Field.Root>

            <Button type="submit" w="full" loading={isLoading} colorPalette="emerald">
              Get Field Suggestions
            </Button>
          </Stack>
        </form>
      ) : (
        <form onSubmit={handleSubmitFieldSelection(onSubmitFieldSelection)}>
          <Stack gap="4" align="flex-start" maxW="md" w="full">
            {error && (
              <Text color="red.500" fontSize="sm">{error}</Text>
            )}
            
            {success && (
              <Text color="green.500" fontSize="sm">{success}</Text>
            )}

            <Field.Root invalid={!!fieldSelectionErrors.selectedField}>
              <Field.Label>Choose Your Field of Study</Field.Label>
              <Stack gap={3}>
                {fieldSuggestions?.suggestions.map((field, index) => (
                  <Box 
                    key={index} 
                    p={3} 
                    bg="#1a1a1a" 
                    border="1px solid #4A4A4A" 
                    borderRadius="md"
                    cursor="pointer"
                    _hover={{ bg: "#2a2a2a" }}
                  >
                    <label style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                      <input
                        type="radio"
                        {...registerFieldSelection("selectedField", {
                          required: "Please select a field"
                        })}
                        value={field}
                        style={{ marginRight: '12px', accentColor: '#7dd3fc' }}
                      />
                      <Text color="white">{field}</Text>
                    </label>
                  </Box>
                ))}
              </Stack>
              <Field.ErrorText>{fieldSelectionErrors.selectedField?.message}</Field.ErrorText>
              <Field.HelperText>
                Select the specific field you'd like to explore from the suggestions above
              </Field.HelperText>
            </Field.Root>

            <Stack direction="row" gap={2} w="full">
              <Button 
                variant="outline" 
                onClick={() => setStep('general')} 
                w="full"
                colorPalette="gray"
              >
                Back
              </Button>
              <Button type="submit" w="full" loading={isLoading} colorPalette="emerald">
                Change Field
              </Button>
            </Stack>
          </Stack>
        </form>
      )}

      <Stack gap={2} align="center">
        <Text fontSize="sm">
          <Link to="/questions">← Back to Questions</Link>
        </Text>
        <Text fontSize="sm">
          <Link to="/">← Back to Home</Link>
        </Text>
      </Stack>
    </Stack>
  )
}

export default ChangeFieldPage