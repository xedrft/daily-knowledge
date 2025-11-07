import { useEffect, useState } from "react";
import { Box, Button, Field, Heading, Input as CInput, Stack, Text, Grid, Badge, HStack, Tooltip, Spinner } from "@chakra-ui/react";
import PageContainer from "@/components/layout/PageContainer";
import Panel from "@/components/layout/Panel";
import { api } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";
import { useNavigate } from "react-router-dom";
import FieldOptionCard from "@/components/FieldOptionCard";
import { LuInfo } from "react-icons/lu";
import PreviouslyLearnedSelector from "@/components/PreviouslyLearnedSelector";

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
          <Stack gap={1} align="center">
            <Heading size="2xl">Welcome</Heading>
            <Text color="fg.muted">Let’s set up your learning profile</Text>
          </Stack>

          {step === 1 && (
            <Panel w="full" maxW="3xl">
              <Stack gap={4}>
                <Text fontSize="sm" color="fg.muted">Step 1 of 3</Text>
                <Field.Root>
                  <Tooltip.Root openDelay={50} closeDelay={100}>
                    <Tooltip.Trigger>
                      <HStack gap={2} align="center" tabIndex={0}>
                        <Field.Label>Level (1–15)</Field.Label>
                        <Box as="span" color="fg.muted" display="inline-flex" alignItems="center" aria-hidden>
                          <LuInfo size={16} />
                        </Box>
                      </HStack>
                    </Tooltip.Trigger>
                    <Tooltip.Positioner>
                      <Tooltip.Content bg="emphasized" color="fg" maxW="300px" px={3} py={2} borderRadius="md">
                        <Stack gap={1}>
                          <Text fontWeight="semibold" fontSize="sm">Choosing Your Level</Text>
                          <Text fontSize="xs"><strong>1–5:</strong> High school or introductory</Text>
                          <Text fontSize="xs"><strong>6–10:</strong> Undergraduate or intermediate</Text>
                          <Text fontSize="xs"><strong>11–15:</strong> Graduate, advanced, or professional</Text>
                        </Stack>
                      </Tooltip.Content>
                    </Tooltip.Positioner>
                  </Tooltip.Root>
                  <Stack w="full" >
                    <Box mx="-6" px={8}>
                      <CInput
                        type="range"
                        min={1}
                        max={15}
                        value={level}
                        onChange={(e) => setLevel(Number(e.target.value))}
                        style={{ accentColor: 'var(--chakra-colors-sage-500)' }}
                      />
                    </Box>
                    <Text>Selected: <Badge colorPalette="sage">{level}</Badge></Text>
                  </Stack>
                </Field.Root>
                <Field.Root>
                  <Field.Label>General Area</Field.Label>
                  <CInput placeholder="e.g., Mathematics, Physics, Biology" value={generalArea} onChange={(e) => setGeneralArea(e.target.value)} bg="bg" />
                  <Field.HelperText>We’ll suggest specific fields next.</Field.HelperText>
                </Field.Root>
                {error && (
                  <Box bg="red.50" border="1px solid" borderColor="red.200" p={3} borderRadius="md">
                    <Text color="red.700" fontSize="sm">{error}</Text>
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
                  <Field.Label>Select your field</Field.Label>
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
                  <Box bg="red.50" border="1px solid" borderColor="red.200" p={3} borderRadius="md">
                    <Text color="red.700" fontSize="sm">{error}</Text>
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
