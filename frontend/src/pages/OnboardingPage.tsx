import { useEffect, useState } from "react";
import { Box, Button, Field, Heading, Input as CInput, Stack, Text, Grid, Spinner, HStack } from "@chakra-ui/react";
import { Tooltip } from "@/components/ui/tooltip";
import { LuInfo } from "react-icons/lu";
import PageContainer from "@/components/layout/PageContainer";
import Panel from "@/components/layout/Panel";
import { api } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";
import { useNavigate } from "react-router-dom";
import FieldOptionCard from "@/components/FieldOptionCard";
import PreviouslyLearnedSelector from "@/components/PreviouslyLearnedSelector";
import LevelSlider from "@/components/LevelSlider";

export default function OnboardingPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [level, setLevel] = useState<number>(7);
  const [generalArea, setGeneralArea] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [suggestionsLoading, setSuggestionsLoading] = useState(false);
  const [selectedField, setSelectedField] = useState<string>("");
  const [selectedCourses, setSelectedCourses] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [submitLoading, setSubmitLoading] = useState(false);
  // Previously learned selector UI is now a reusable component

  useEffect(() => {
    const jwt = localStorage.getItem("jwt");
    if (!jwt) navigate("/signin");
  }, [navigate]);

  const fetchSuggestions = async (area: string, lvl: number, prevCourses: string[] = []) => {
    try {
      setSuggestionsLoading(true);
      const res = await api.post<{ suggestions: string[] }>(endpoints.getFieldSuggestions(), { generalArea: area, level: lvl, previouslyLearned: prevCourses });
      setSuggestions(res.suggestions || []);
    } catch (e) {
      setError("Failed to get suggestions");
    } finally {
      setSuggestionsLoading(false);
    }
  };

  // selection handling moved inside the reusable component via onChange

  // filtering is handled inside the selector component now

  return (
    <>
      <PageContainer>
        <Stack gap={6} align="center">
          <Stack gap={2} align="center">
            <Heading size="2xl">Welcome</Heading>
            <Text color="fg.muted">Let's set up your learning profile</Text>
            <Box 
              bg={{ _light: "sage.50", _dark: "sage.950" }} 
              border="1px solid" 
              borderColor={{ _light: "sage.200", _dark: "sage.800" }} 
              p={4} 
              borderRadius="md"
              maxW="2xl"
              mt={2}
            >
              <Stack gap={2}>
                <HStack gap={2} align="center">
                  <Box as="span" color="sage.500" display="inline-flex">
                    <LuInfo size={20} />
                  </Box>
                  <Text fontSize="sm" fontWeight="semibold" color="sage.700" _dark={{ color: "sage.300" }}>
                    How Verocity Works
                  </Text>
                </HStack>
                <Box 
                  fontSize="sm" 
                  color="fg.muted" 
                  lineHeight="1.8"
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
                <Text fontSize="xs" color="fg.muted" fontStyle="italic" pl={2}>
                  Example: Mathematics → Linear Algebra → Eigenvalues, Matrix Transformations...
                </Text>
              </Stack>
            </Box>
          </Stack>

          {step === 1 && (
            <Panel w="full" maxW="3xl">
              <Stack gap={4}>
                <Text fontSize="sm" color="fg.muted">Step 1 of 3</Text>
                <LevelSlider value={level} onChange={setLevel} showTooltip={true} />
                <Field.Root>
                  <Tooltip 
                    content={<Text fontSize="sm">The broad subject domain you want to explore (e.g., Mathematics, Physics, Computer Science, Biology)</Text>}
                    openDelay={50}
                    closeDelay={100}
                  >
                    <HStack gap={2} align="center" tabIndex={0}>
                      <Field.Label>General Area</Field.Label>
                      <Box as="span" color="fg.muted" display="inline-flex" alignItems="center">
                        <LuInfo size={16} />
                      </Box>
                    </HStack>
                  </Tooltip>
                  <CInput placeholder="e.g., Mathematics, Physics, Biology" value={generalArea} onChange={(e) => setGeneralArea(e.target.value)} bg="bg" />
                  <Field.HelperText>We'll suggest specific fields within this area next.</Field.HelperText>
                </Field.Root>
                {error && (
                  <Box bg={{ _light: "red.100", _dark: "red.950" }} border="1px solid" borderColor={{ _light: "red.300", _dark: "red.800" }} p={3} borderRadius="md">
                    <Text color={{ _light: "red.700", _dark: "red.400" }} fontSize="sm">{error}</Text>
                  </Box>
                )}
                <Stack direction={{ base: 'column', sm: 'row' }} justify="center" align="center" gap={3}>
                  <Button
                    size="lg"
                    minW="160px"
                    colorPalette="sage"
                    variant="solid"
                    onClick={() => {
                      setError("");
                      if (!generalArea.trim()) { setError("Please enter a general area"); return; }
                      setStep(2);
                    }}
                  >
                    Continue
                  </Button>
                </Stack>
              </Stack>
            </Panel>
          )}

          {step === 2 && (
            <Panel w="full" maxW="3xl">
              <Stack gap={4}>
                <Text fontSize="sm" color="fg.muted">Step 2 of 3</Text>
                <Box bg="bg" border="1px solid" borderColor="muted" p={2} borderRadius="md">
                  <Text fontSize="sm" color="fg.muted">General area: <strong>{generalArea}</strong></Text>
                </Box>
                <PreviouslyLearnedSelector selected={selectedCourses} onChange={setSelectedCourses} />
                <Stack direction={{ base: 'column', sm: 'row' }} justify="center" align="center" gap={3}>
                  <Button size="lg" minW="160px" variant="outline" onClick={() => setStep(1)}>Back</Button>
                  <Button
                    size="lg"
                    minW="160px"
                    onClick={() => {
                      // Clear old suggestions so Step 3 shows a loading state
                      setSuggestions([]);
                      setStep(3);
                      fetchSuggestions(generalArea, level, selectedCourses);
                    }}
                    colorPalette="sage"
                    variant="solid"
                  >
                    Continue
                  </Button>
                </Stack>
              </Stack>
            </Panel>
          )}

          {step === 3 && (
            <Panel w="full" maxW="3xl">
              <Stack gap={4}>
                <Text fontSize="sm" color="fg.muted">Step 3 of 3</Text>
                <Box bg="bg" border="1px solid" borderColor="muted" p={2} borderRadius="md">
                  <Text fontSize="sm" color="fg.muted">General area: <strong>{generalArea}</strong></Text>
                </Box>
                <Field.Root>
                  <Tooltip 
                    content={<Text fontSize="sm">A specific subject within {generalArea} that you'll study. You'll learn individual concepts from this field.</Text>}
                    openDelay={50}
                    closeDelay={100}
                  >
                    <HStack gap={2} align="center" tabIndex={0}>
                      <Field.Label>Select Your Field</Field.Label>
                      <Box as="span" color="fg.muted" display="inline-flex" alignItems="center">
                        <LuInfo size={16} />
                      </Box>
                    </HStack>
                  </Tooltip>
                  {suggestionsLoading ? (
                    <Box w="full" minH="40vh" display="flex" alignItems="center" justifyContent="center">
                      <Stack gap={3} align="center">
                        <Spinner size="md" color="sage.500" />
                        <Text fontSize="sm" color="fg.muted">Preparing suggestions…</Text>
                      </Stack>
                    </Box>
                  ) : suggestions.length > 0 ? (
                    <Grid w="full" templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap={3}>
                      {suggestions.map((f) => (
                        <FieldOptionCard key={f} label={f} active={selectedField === f} onClick={() => setSelectedField(f)} />
                      ))}
                    </Grid>
                  ) : (
                    <Text fontSize="sm" color="fg.muted">No suggestions yet. Try going back to adjust your area or add some courses.</Text>
                  )}
                </Field.Root>
                <Stack direction={{ base: 'column', sm: 'row' }} justify="center" align="center" gap={3}>
                  <Button size="lg" minW="160px" variant="outline" onClick={() => setStep(2)}>Back</Button>
                  <Button size="lg" minW="160px" colorPalette="sage" variant="solid" onClick={async () => {
                    try {
                      setSubmitLoading(true);
                      await api.post(endpoints.initializeProfile(), {
                        level,
                        field: selectedField,
                        previouslyLearned: selectedCourses,
                      });
                      navigate('/questions');
                    } catch (e) {
                      setError('Failed to save profile');
                    } finally { setSubmitLoading(false); }
                  }} disabled={submitLoading} {...(submitLoading ? { loading: true } : {})}>Finish</Button>
                </Stack>
                {error && (
                  <Box bg={{ _light: "red.100", _dark: "red.950" }} border="1px solid" borderColor={{ _light: "red.300", _dark: "red.800" }} p={3} borderRadius="md">
                    <Text color={{ _light: "red.700", _dark: "red.400" }} fontSize="sm">{error}</Text>
                  </Box>
                )}
              </Stack>
            </Panel>
          )}
        </Stack>
      </PageContainer>
    </>
  );
}
