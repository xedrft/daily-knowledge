import { Button, Field, Input, Stack, Heading, Text, Box, Badge, Grid } from "@chakra-ui/react"
import { useForm } from "react-hook-form"
import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import InlineLink from "@/components/ui/InlineLink"
import { toaster } from "@/components/ui/toaster"
import Navbar from "@/components/Navbar"
import PageContainer from "@/components/layout/PageContainer"
import Panel from "@/components/layout/Panel"
import { api } from "@/lib/api/client"
import { endpoints } from "@/lib/api/endpoints"
import { useAuthGate } from "@/hooks/useAuthGate"
import FieldOptionCard from "@/components/FieldOptionCard"

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
  current_level?: number | null
  previouslyLearned?: string[]
}

interface FieldSuggestions {
  generalArea: string
  suggestions: string[]
  cot?: string
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
    watch: watchFieldSelection,
    setValue,
    formState: { errors: fieldSelectionErrors },
  } = useForm<SelectFieldValues>()
  
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string>("")
  const [userFieldData, setUserFieldData] = useState<UserFieldData | null>(null)
  const [fieldSuggestions, setFieldSuggestions] = useState<FieldSuggestions | null>(null)
  const [step, setStep] = useState<'general' | 'select' | 'success'>('general')
  const navigate = useNavigate()
  const { check } = useAuthGate()

  useEffect(() => {
    (async () => {
      const { ok } = await check()
      if (!ok) return
      // Fetch current user field data
      fetchUserFieldData()
    })()
  }, [check])

  const fetchUserFieldData = async () => {
    try {
      const jwt = localStorage.getItem("jwt")
      if (!jwt) {
        navigate("/signin")
        return
      }
      const data = await api.get<UserFieldData>(endpoints.checkField())
      setUserFieldData(data)
    } catch (err: any) {
      const msg = String(err?.message || "")
      console.error("Error fetching user field data:", err)
      if (msg.includes("HTTP 401") || msg.includes("HTTP 403")) {
        navigate("/signin")
      }
    }
  }

  async function onSubmitGeneralArea(data: FormValues) {
    setIsLoading(true)
    setError("")
    
    try {
      const jwt = localStorage.getItem("jwt")
      if (!jwt) {
        navigate("/signin")
        return
      }

  const suggestions = await api.post<FieldSuggestions>(endpoints.getFieldSuggestions(), {
    generalArea: data.generalArea,
    level: typeof userFieldData?.current_level === 'number' ? userFieldData?.current_level : undefined,
    previouslyLearned: Array.isArray(userFieldData?.previouslyLearned) ? userFieldData?.previouslyLearned : []
  })
  setFieldSuggestions(suggestions)
  setStep('select')

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
    
    try {
      const jwt = localStorage.getItem("jwt")
      if (!jwt) {
        navigate("/signin")
        return
      }
      // Change field only (do not update level here)
      await api.post(endpoints.changeField(), { field: data.selectedField })
      
      // Show success toast and provide user choice
      toaster.create({
        title: "Field changed successfully!",
        description: "Ready to explore new topics in your field.",
        type: "success",
        duration: 4000,
      })
      
      fetchUserFieldData()
      
      // Give user control over next action
      setStep('success')

    } catch (err) {
      console.error("Error:", err)
      setError("Network error. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const selectedField = watchFieldSelection("selectedField")

  return (
    <>
      <Navbar />
      <PageContainer>
        <Stack gap={6} align="center">
          <Stack gap={2} align="center">
            <Heading size="2xl">Change Your Field</Heading>
            <Text color="fg.muted">Pick a new area to study. We’ll tailor concepts to your selection.</Text>
          </Stack>

          {userFieldData && (
            <Panel w="full" maxW="3xl" mx="auto">
              <Stack gap={4}>
                <Heading size="sm">Your Current Status</Heading>
                {userFieldData.hasField ? (
                  <Stack gap={3}>
                    <Stack direction="row" gap={2} align="center">
                      <Text fontWeight="bold">Current field:</Text>
                      <Badge colorPalette="blue">{userFieldData.currentField}</Badge>
                    </Stack>
                    <Text fontSize="sm" color="fg.muted">
                      {userFieldData.conceptStats.currentFieldCount} concepts learned in this field
                    </Text>
                    {userFieldData.pastFields.length > 0 && (
                      <Stack gap={2}>
                        <Text fontWeight="bold">Past fields</Text>
                        <Stack direction="row" gap={2} flexWrap="wrap">
                          {userFieldData.pastFields.map((pf, i) => (
                            <Badge key={i} colorPalette="gray">{pf}</Badge>
                          ))}
                        </Stack>
                      </Stack>
                    )}
                    <Box borderTop="1px solid" borderColor="muted" />
                    <Text fontSize="sm" color="fg.muted">
                      Total progress: <strong>{userFieldData.conceptStats.totalConceptsCount}</strong> concepts explored
                    </Text>
                  </Stack>
                ) : (
                  <Text color="orange.400">No field selected yet</Text>
                )}
              </Stack>
            </Panel>
          )}

          {step === 'general' ? (
            <Panel w="full" maxW="3xl" mx="auto">
              <form onSubmit={handleSubmitGeneralArea(onSubmitGeneralArea)}>
                <Stack gap={4}>
                  {error && (
                    <Box bg={{ _light: "red.100", _dark: "red.950" }} border="1px solid" borderColor={{ _light: "red.300", _dark: "red.800" }} p={3} borderRadius="md">
                      <Text color={{ _light: "red.700", _dark: "red.400" }} fontSize="sm">{error}</Text>
                    </Box>
                  )}
                  <Text fontSize="sm" color="fg.muted">Step 1 of 2</Text>
                  <Field.Root invalid={!!generalAreaErrors.generalArea}>
                    <Field.Label>General Area</Field.Label>
                    <Input
                      {...registerGeneralArea("generalArea", {
                        required: "General area is required",
                        minLength: { value: 2, message: "Must be at least 2 characters" }
                      })}
                      placeholder="e.g., Physics, Mathematics, Chemistry, Biology..."
                      bg="bg"
                    />
                    <Field.ErrorText>{generalAreaErrors.generalArea?.message}</Field.ErrorText>
                    <Field.HelperText>We’ll propose specific fields within this area.</Field.HelperText>
                  </Field.Root>

                  <Button type="submit" loading={isLoading} variant="solid" colorPalette="sage" size="lg" alignSelf="center" minW="180px">
                    Get Suggestions
                  </Button>
                </Stack>
              </form>
            </Panel>
          ) : step === 'select' ? (
              <Panel w="full" maxW="3xl" mx="auto">
                <form onSubmit={handleSubmitFieldSelection(onSubmitFieldSelection)}>
                  <Stack gap={4}>
                    {error && (
                      <Box bg={{ _light: "red.100", _dark: "red.950" }} border="1px solid" borderColor={{ _light: "red.300", _dark: "red.800" }} p={3} borderRadius="md">
                        <Text color={{ _light: "red.700", _dark: "red.400" }} fontSize="sm">{error}</Text>
                      </Box>
                    )}

                    <Text fontSize="sm" color="fg.muted">Step 2 of 2</Text>
                    {fieldSuggestions?.generalArea && (
                      <Box bg="bg" border="1px solid" borderColor="muted" p={2} borderRadius="md">
                        <Text fontSize="sm" color="fg.muted">General area: <strong>{fieldSuggestions.generalArea}</strong></Text>
                      </Box>
                    )}
                    <Field.Root invalid={!!fieldSelectionErrors.selectedField}>
                      <Field.Label>Select your field</Field.Label>
                      <Grid w="full" templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap={3}>
                        {fieldSuggestions?.suggestions.map((fieldName) => {
                          const active = selectedField === fieldName
                          return (
                            <Box key={fieldName} onClick={() => setValue("selectedField", fieldName)}>
                              {/* Keep form registration intact for validation */}
                              <input
                                type="radio"
                                {...registerFieldSelection("selectedField", { required: "Please select a field" })}
                                value={fieldName}
                                style={{ display: 'none' }}
                                readOnly
                              />
                              <FieldOptionCard label={fieldName} active={active} />
                            </Box>
                          )
                        })}
                      </Grid>
                      <Field.ErrorText>{fieldSelectionErrors.selectedField?.message}</Field.ErrorText>
                      <Field.HelperText>Select a specific field to focus your learning.</Field.HelperText>
                    </Field.Root>

                    <Stack direction={{ base: 'column', sm: 'row' }} gap={3} justify="center" align="center" w="full">
                      <Button
                        variant="outline"
                        onClick={() => setStep('general')}
                        colorPalette="gray"
                        size="lg"
                        minW="160px"
                      >
                        Back
                      </Button>
                      <Button type="submit" loading={isLoading} variant="solid" colorPalette="sage" size="lg" minW="160px">
                        Change Field
                      </Button>
                    </Stack>
                  </Stack>
                </form>
              </Panel>
          ) : (
            // Success step - give user control over next action
            <Panel w="full" maxW="3xl" mx="auto">
              <Stack gap={6} align="center" textAlign="center">
                <Stack gap={2}>
                  <Heading size="lg" color={{ _light: "sage.700", _dark: "sage.300" }}>Field Changed Successfully! 🎉</Heading>
                  <Text color="fg.muted">
                    You're now studying <strong>{userFieldData?.currentField}</strong>. 
                    Ready to explore new concepts in your field?
                  </Text>
                </Stack>
                
                <Stack direction={{ base: 'column', sm: 'row' }} gap={4} w="full" justify="center">
                  <Button
                    onClick={() => navigate("/questions")}
                    variant="solid"
                    colorPalette="sage"
                    size="lg"
                    minW="200px"
                  >
                    Start Learning Questions
                  </Button>
                  <Button
                    onClick={() => navigate("/")}
                    variant="outline"
                    colorPalette="sage"
                    size="lg"
                    minW="160px"
                  >
                    Go to Home
                  </Button>
                </Stack>
                
                <Button
                  onClick={() => setStep('general')}
                  variant="ghost"
                  size="sm"
                  color="fg.muted"
                >
                  Change to a different field
                </Button>
              </Stack>
            </Panel>
          )}

          <Stack gap={2} align="flex-start">
            <Text fontSize="sm">
              <InlineLink to="/questions" leadingArrow>Back to Questions</InlineLink>
            </Text>
          </Stack>
        </Stack>
      </PageContainer>
    </>
  )
}

export default ChangeFieldPage