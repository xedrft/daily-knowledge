import { useEffect, useState } from "react";
import { Box, Button, Field, Heading, Input as CInput, Stack, Text, Grid, Badge } from "@chakra-ui/react";
import { toaster } from "@/components/ui/toaster";
import PageContainer from "@/components/layout/PageContainer";
import Panel from "@/components/layout/Panel";
import { api } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";
import { useNavigate } from "react-router-dom";
import FieldOptionCard from "@/components/FieldOptionCard";
import { COURSE_CATALOG } from "@/lib/constants/courses";

// using shared COURSE_CATALOG

export default function OnboardingPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [level, setLevel] = useState<number>(7);
  const [generalArea, setGeneralArea] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [selectedField, setSelectedField] = useState<string>("");
  const [selectedCourses, setSelectedCourses] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const jwt = localStorage.getItem("jwt");
    if (!jwt) navigate("/signin");
  }, [navigate]);

  const toggleCourse = (c: string) => {
    setSelectedCourses((prev) => prev.includes(c) ? prev.filter(x => x !== c) : [...prev, c]);
  };

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
                  <Field.Label>Level (1–15)</Field.Label>
                  <Stack gap={2}>
                    <Box mx="-6" px={8}>
                      <CInput
                        type="range"
                        min={1}
                        max={15}
                        value={level}
                        onChange={(e) => setLevel(Number(e.target.value))}
                        w="full"
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
                  <Button size="lg" minW="160px" colorPalette="sage" variant="solid" onClick={async () => {
                    setError("");
                    if (!generalArea.trim()) { setError("Please enter a general area"); return; }
                    try {
                      setLoading(true);
                      const t = toaster.create({ title: 'Getting suggestions…', type: 'loading' });
                      const res = await api.post<{ suggestions: string[] }>(endpoints.getFieldSuggestions(), { generalArea, level });
                      setSuggestions(res.suggestions || []);
                      setStep(2);
                      toaster.dismiss(t);
                    } catch (e) {
                      setError("Failed to get suggestions");
                      toaster.create({ title: 'Failed to get suggestions', type: 'error' });
                    } finally { setLoading(false); }
                  }} disabled={loading} {...(loading ? { loading: true } : {})}>Continue</Button>
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
                <Field.Root>
                  <Field.Label>Select your field</Field.Label>
                  <Stack gap={3} align="center">
                    {suggestions.map((f) => (
                      <FieldOptionCard key={f} label={f} active={selectedField === f} onClick={() => setSelectedField(f)} />
                    ))}
                  </Stack>
                </Field.Root>
                <Stack direction={{ base: 'column', sm: 'row' }} justify="center" align="center" gap={3}>
                  <Button size="lg" minW="160px" variant="outline" onClick={() => setStep(1)}>Back</Button>
                  <Button size="lg" minW="160px" onClick={() => { if (selectedField) setStep(3); }} colorPalette="sage" variant="solid" disabled={!selectedField}>Continue</Button>
                </Stack>
              </Stack>
            </Panel>
          )}

          {step === 3 && (
            <Panel w="full" maxW="3xl">
              <Stack gap={4}>
                <Text fontSize="sm" color="fg.muted">Step 3 of 3</Text>
                <Field.Root>
                  <Field.Label>Previously learned courses (optional)</Field.Label>
                  <Grid templateColumns={{ base: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' }} gap={2}>
                    {COURSE_CATALOG.map((c) => (
                      <label key={c} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <input type="checkbox" checked={selectedCourses.includes(c)} onChange={() => toggleCourse(c)} />
                        {c}
                      </label>
                    ))}
                  </Grid>
                </Field.Root>
                <Stack direction={{ base: 'column', sm: 'row' }} justify="center" align="center" gap={3}>
                  <Button size="lg" minW="160px" variant="outline" onClick={() => setStep(2)}>Back</Button>
                  <Button size="lg" minW="160px" colorPalette="sage" variant="solid" onClick={async () => {
                    try {
                      setLoading(true);
                      await api.post(endpoints.initializeProfile(), {
                        level,
                        field: selectedField,
                        previouslyLearned: selectedCourses,
                      });
                      navigate('/questions');
                    } catch (e) {
                      setError('Failed to save profile');
                    } finally { setLoading(false); }
                  }}>Finish</Button>
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
