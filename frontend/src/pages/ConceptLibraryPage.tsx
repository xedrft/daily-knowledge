import { Button, Stack, Heading, Text, Box, Input, Grid, Badge, useDisclosure, Dialog, Tooltip, Menu, HStack } from "@chakra-ui/react"
import { LuChevronDown, LuCheck } from "react-icons/lu"
import { useState, useEffect, useRef } from "react"
import Navbar from "../components/Navbar"
import latexFormatter from "@/functions/latexFormatter"
import ProblemSet from "@/components/ProblemSet"
import PageContainer from "@/components/layout/PageContainer"
import Panel from "@/components/layout/Panel"
import { api } from "@/lib/api/client"
import { endpoints } from "@/lib/api/endpoints"
import type { ConceptSummary, ConceptFull } from "@/types/domain"
import { useAuthGate } from "@/hooks/useAuthGate"

const ConceptLibraryPage = () => {
  const [concepts, setConcepts] = useState<ConceptSummary[]>([])
  const [filteredConcepts, setFilteredConcepts] = useState<ConceptSummary[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string>("")
  const { check } = useAuthGate()

  // Filter states
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedField, setSelectedField] = useState<string>("all")
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("all")

  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 50

  // Available fields (extracted from concepts)
  const [availableFields, setAvailableFields] = useState<string[]>([])
  const { open, onOpen, onClose } = useDisclosure()
  const [activeConcept, setActiveConcept] = useState<any>(null)
  // Refs to align menu width with trigger row without complex layout
  const fieldRowRef = useRef<HTMLDivElement | null>(null)
  const diffRowRef = useRef<HTMLDivElement | null>(null)
  const [fieldMenuWidth, setFieldMenuWidth] = useState<number>(0)
  const [diffMenuWidth, setDiffMenuWidth] = useState<number>(0)

  // Auth check via hook

  // Fetch all concepts
  useEffect(() => {
    (async () => {
      const { ok } = await check();
      if (!ok) return;

      setIsLoading(true);
      setError("");
      try {
        const data = await api.get<{ concepts: ConceptSummary[] }>(endpoints.listConcepts());
        const list = data.concepts || [];
        setConcepts(list);

        // Extract unique fields
        const fieldsSet = new Set<string>();
        list.forEach((c) => {
          if (Array.isArray(c.fields)) {
            c.fields.forEach((f: string) => fieldsSet.add(f));
          }
        });
        setAvailableFields(Array.from(fieldsSet).sort());
      } catch (err: any) {
        console.error("Error:", err);
        setError("Failed to fetch concepts");
      } finally {
        setIsLoading(false);
      }
    })();
  }, [check])

  // No extra width logic needed—buttons will span the full container via w="full"

  // Apply filters
  useEffect(() => {
  let result = [...concepts]

    // Search filter
    if (searchTerm) {
      result = result.filter(c =>
        c.title.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Field filter
    if (selectedField !== "all") {
      result = result.filter(c => Array.isArray(c.fields) && c.fields.includes(selectedField))
    }

    // Difficulty filter
    if (selectedDifficulty !== "all") {
      const diffRange = selectedDifficulty.split("-").map(Number)
      result = result.filter(c =>
        c.difficulty >= diffRange[0] && c.difficulty <= diffRange[1]
      )
    }

    setFilteredConcepts(result)
    setCurrentPage(1) // Reset to first page when filters change
  }, [concepts, searchTerm, selectedField, selectedDifficulty])

  // Paginate
  const totalPages = Math.ceil(filteredConcepts.length / itemsPerPage)
  const startIdx = (currentPage - 1) * itemsPerPage
  const endIdx = startIdx + itemsPerPage
  const currentConcepts = filteredConcepts.slice(startIdx, endIdx)

  const getDifficultyLabel = (diff: number): string => {
    // Align with onboarding: 1–5 = school/intro, 6–10 = undergraduate, 11–15 = graduate/professional
    // We split 1–5 to show Middle vs High explicitly in the library
    if (diff <= 3) return "Middle School"
    if (diff <= 5) return "High School"
    if (diff <= 10) return "Undergraduate"
    return "Graduate / Professional"
  }

  const getDifficultyColor = (diff: number): string => {
    if (diff <= 3) return "green"
    if (diff <= 5) return "blue"
    if (diff <= 10) return "yellow"
    return "red"
  }

  const difficultyTriggerLabel = (val: string): string => {
    switch (val) {
      case "1-3": return "Middle School (1–3)";
      case "4-5": return "High School (4–5)";
      case "6-10": return "Undergraduate (6–10)";
      case "11-15": return "Graduate / Professional (11–15)";
      default: return "All Levels";
    }
  }

  return (
    <>
      <Navbar />

      {/* Main Content */}
      <PageContainer>
        <Stack gap={6}>
          <Stack gap={2}>
            <Heading size="2xl">My Learned Concepts</Heading>
            <Text color="fg.muted">
              Browse all {filteredConcepts.length} concepts you've learned
            </Text>
          </Stack>

          {error && (
            <Box bg={{ _light: "red.100", _dark: "red.950" }} p={4} borderRadius="md" border="1px solid" borderColor={{ _light: "red.300", _dark: "red.800" }}>
              <Text color={{ _light: "red.700", _dark: "red.400" }}>{error}</Text>
            </Box>
          )}

          {/* Filters */}
          <Panel>
            <Stack gap={4}>
              <Heading size="md">Filters</Heading>

              {/* Search */}
              <Box>
                <Text fontSize="sm" fontWeight="bold" mb={2}>Search</Text>
                <Input
                  placeholder="Search concepts..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  bg="bg"
                />
              </Box>

              {/* Field Filter (styled dropdown) */}
              <Box w="full" ref={fieldRowRef}
                // Keep the row as the sizing source for the menu
              >
                <Text fontSize="sm" fontWeight="bold" mb={2}>Field</Text>
                <Menu.Root onOpenChange={(d) => {
                  if (d.open && fieldRowRef.current) {
                    setFieldMenuWidth(fieldRowRef.current.offsetWidth);
                  }
                }}>
                  <Menu.Trigger asChild>
                    <Button
                      size="md"
                      variant="outline"
                      w="full"
                      justifyContent="space-between"
                      bg="bg"
                      borderColor="muted"
                      borderRadius="md"
                      px={3}
                    >
                      {selectedField === 'all' ? 'All Fields' : selectedField}
                      <Box as="span" aria-hidden display="inline-flex"><LuChevronDown size={16} /></Box>
                    </Button>
                  </Menu.Trigger>
                  <Menu.Positioner>
                    <Menu.Content bg="bg" borderColor="muted" boxShadow="sm" borderRadius="md" p={2} maxH="260px" overflowY="auto" w={fieldMenuWidth ? `${fieldMenuWidth}px` : undefined}>
                      <Menu.Item
                        fontSize="sm"
                        px={3}
                        py={2}
                        value="all"
                        onClick={() => setSelectedField('all')}
                        _hover={{ bg: 'muted' }}
                        _focus={{ bg: 'muted' }}
                        color="fg"
                        cursor="pointer"
                      >
                        <HStack w="full" justify="space-between">
                          <span>All Fields</span>
                          {selectedField === 'all' && (
                            <Box as="span" aria-hidden display="inline-flex"><LuCheck size={16} /></Box>
                          )}
                        </HStack>
                      </Menu.Item>
                      {availableFields.map((field) => (
                        <Menu.Item
                          fontSize="sm"
                          px={3}
                          py={2}
                          key={field}
                          value={field}
                          onClick={() => setSelectedField(field)}
                          _hover={{ bg: 'muted' }}
                          _focus={{ bg: 'muted' }}
                          color="fg"
                          cursor="pointer"
                        >
                          <HStack w="full" justify="space-between">
                            <span>{field}</span>
                            {selectedField === field && (
                              <Box as="span" aria-hidden display="inline-flex"><LuCheck size={16} /></Box>
                            )}
                          </HStack>
                        </Menu.Item>
                      ))}
                    </Menu.Content>
                  </Menu.Positioner>
                </Menu.Root>
              </Box>

              {/* Difficulty Filter (styled dropdown) */}
              <Box w="full" ref={diffRowRef}
                // Sizing source for difficulty menu
              >
                <Text fontSize="sm" fontWeight="bold" mb={2}>Difficulty</Text>
                <Menu.Root onOpenChange={(d) => {
                  if (d.open && diffRowRef.current) {
                    setDiffMenuWidth(diffRowRef.current.offsetWidth);
                  }
                }}>
                  <Menu.Trigger asChild>
                    <Button
                      size="md"
                      variant="outline"
                      w="full"
                      justifyContent="space-between"
                      bg="bg"
                      borderColor="muted"
                      borderRadius="md"
                      px={3}
                    >
                      {difficultyTriggerLabel(selectedDifficulty)}
                      <Box as="span" aria-hidden display="inline-flex"><LuChevronDown size={16} /></Box>
                    </Button>
                  </Menu.Trigger>
                  <Menu.Positioner>
                    <Menu.Content bg="bg" borderColor="muted" boxShadow="sm" borderRadius="md" p={2} w={diffMenuWidth ? `${diffMenuWidth}px` : undefined}>
                      <Menu.Item
                        fontSize="sm"
                        px={3}
                        py={2}
                        value="all"
                        onClick={() => setSelectedDifficulty('all')}
                        _hover={{ bg: 'muted' }}
                        _focus={{ bg: 'muted' }}
                        color="fg"
                        cursor="pointer"
                      >
                        <HStack w="full" justify="space-between">
                          <span>All Levels</span>
                          {selectedDifficulty === 'all' && (
                            <Box as="span" aria-hidden display="inline-flex"><LuCheck size={16} /></Box>
                          )}
                        </HStack>
                      </Menu.Item>
                      <Menu.Item fontSize="sm" px={3} py={2} value="1-3" onClick={() => setSelectedDifficulty('1-3')} _hover={{ bg: 'muted' }} _focus={{ bg: 'muted' }} color="fg" cursor="pointer">
                        <HStack w="full" justify="space-between">
                          <span>Middle School (1–3)</span>
                          {selectedDifficulty === '1-3' && (
                            <Box as="span" aria-hidden display="inline-flex"><LuCheck size={16} /></Box>
                          )}
                        </HStack>
                      </Menu.Item>
                      <Menu.Item fontSize="sm" px={3} py={2} value="4-5" onClick={() => setSelectedDifficulty('4-5')} _hover={{ bg: 'muted' }} _focus={{ bg: 'muted' }} color="fg" cursor="pointer">
                        <HStack w="full" justify="space-between">
                          <span>High School (4–5)</span>
                          {selectedDifficulty === '4-5' && (
                            <Box as="span" aria-hidden display="inline-flex"><LuCheck size={16} /></Box>
                          )}
                        </HStack>
                      </Menu.Item>
                      <Menu.Item fontSize="sm" px={3} py={2} value="6-10" onClick={() => setSelectedDifficulty('6-10')} _hover={{ bg: 'muted' }} _focus={{ bg: 'muted' }} color="fg" cursor="pointer">
                        <HStack w="full" justify="space-between">
                          <span>Undergraduate (6–10)</span>
                          {selectedDifficulty === '6-10' && (
                            <Box as="span" aria-hidden display="inline-flex"><LuCheck size={16} /></Box>
                          )}
                        </HStack>
                      </Menu.Item>
                      <Menu.Item fontSize="sm" px={3} py={2} value="11-15" onClick={() => setSelectedDifficulty('11-15')} _hover={{ bg: 'muted' }} _focus={{ bg: 'muted' }} color="fg" cursor="pointer">
                        <HStack w="full" justify="space-between">
                          <span>Graduate / Professional (11–15)</span>
                          {selectedDifficulty === '11-15' && (
                            <Box as="span" aria-hidden display="inline-flex"><LuCheck size={16} /></Box>
                          )}
                        </HStack>
                      </Menu.Item>
                    </Menu.Content>
                  </Menu.Positioner>
                </Menu.Root>
              </Box>

              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setSearchTerm("")
                  setSelectedField("all")
                  setSelectedDifficulty("all")
                }}
                
              >
                Clear Filters
              </Button>
            </Stack>
          </Panel>

          {/* Loading State */}
          {isLoading && (
            <Box textAlign="center" py={12}>
              <Text>Loading concepts...</Text>
            </Box>
          )}

          {/* Concept Grid */}
          {!isLoading && currentConcepts.length > 0 && (
            <>
              <Grid
                templateColumns={{
                  base: "1fr",
                  md: "repeat(2, 1fr)",
                  lg: "repeat(3, 1fr)",
                  xl: "repeat(4, 1fr)"
                }}
                gap={4}
              >
                {currentConcepts.map((concept) => (
                  <Panel
                    key={concept.documentId}
                    p={5}
                    _hover={{ boxShadow: "md", borderColor: "border.emphasized" }}
                    cursor="pointer"
                    transition="all 0.2s"
                    onClick={async () => {
                      try {
                        const payload = await api.post<ConceptFull>(endpoints.conceptGet(), { documentId: concept.documentId })
                        setActiveConcept(payload)
                        onOpen()
                      } catch (e: any) {
                        console.error('Failed to open concept modal', e)
                      }
                    }}
                  >
                    <Stack gap={3}>
                      {/* Title */}
                      <Heading size="sm" minH="48px">
                        {concept.title}
                      </Heading>

                      {/* Fields */}
                      {Array.isArray(concept.fields) && concept.fields.length > 0 && (
                        <Box>
                          <Text fontSize="xs" fontWeight="bold" color="fg.muted" mb={1}>
                            Fields:
                          </Text>
                          <Stack direction="row" gap={1} flexWrap="wrap">
                            {concept.fields.slice(0, 2).map((field, idx) => (
                              <Badge key={idx} colorPalette="blue" fontSize="xs">
                                {field}
                              </Badge>
                            ))}
                            {concept.fields.length > 2 && (
                              <Tooltip.Root openDelay={50} closeDelay={100}>
                                <Tooltip.Trigger>
                                  <Badge colorPalette="gray" fontSize="xs">
                                    +{concept.fields.length - 2}
                                  </Badge>
                                </Tooltip.Trigger>
                                <Tooltip.Positioner>
                                  <Tooltip.Content bg="emphasized" color="fg">
                                    {concept.fields.slice(2).join(', ')}
                                  </Tooltip.Content>
                                </Tooltip.Positioner>
                              </Tooltip.Root>
                            )}
                          </Stack>
                        </Box>
                      )}

                      {/* Difficulty */}
                      <Box>
                        <Text fontSize="xs" fontWeight="bold" color="fg.muted" mb={1}>
                          Difficulty:
                        </Text>
                        <Badge colorPalette={getDifficultyColor(concept.difficulty)}>
                          {getDifficultyLabel(concept.difficulty)} ({concept.difficulty.toFixed(1)})
                        </Badge>
                      </Box>
                    </Stack>
                  </Panel>
                ))}
              </Grid>

              {/* Pagination */}
              {totalPages > 1 && (
                <Stack direction="row" justify="center" align="center" gap={2} pt={4}>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </Button>
                  <Text fontSize="sm">
                    Page {currentPage} of {totalPages}
                  </Text>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </Button>
                </Stack>
              )}
            </>
          )}

          {/* Empty State */}
          {!isLoading && currentConcepts.length === 0 && (
            <Box textAlign="center" py={12}>
              <Heading size="md" color="fg.muted" mb={2}>
                No concepts found
              </Heading>
              <Text color="fg.muted">
                Try adjusting your filters or search term
              </Text>
            </Box>
          )}

          {/* Dialog for concept details (Chakra UI v3) */}
          <Dialog.Root open={open} onOpenChange={(details) => (details.open ? onOpen() : onClose())}>
            <Dialog.Backdrop />
            <Dialog.Positioner>
              <Dialog.Content maxW="4xl" bg="panel" border="1px solid" borderColor="muted">
                <Dialog.CloseTrigger />
                <Stack gap={3} p={4}>
                  <Heading size="lg">{activeConcept?.title}</Heading>
                  {activeConcept ? (
                    <Stack gap={4}>
                      <Box className="math-content-container">
                        {latexFormatter(activeConcept.content || '')}
                      </Box>
                      {Array.isArray(activeConcept.problemset) && activeConcept.problemset.length > 0 && (
                        <ProblemSet problemset={activeConcept.problemset} />
                      )}
                    </Stack>
                  ) : (
                    <Text>Loading...</Text>
                  )}
                </Stack>
              </Dialog.Content>
            </Dialog.Positioner>
          </Dialog.Root>
        </Stack>
      </PageContainer>
    </>
  )
}

export default ConceptLibraryPage
