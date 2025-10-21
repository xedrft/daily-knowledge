import { Button, Stack, Heading, Text, Box, Input, Grid, Badge, useDisclosure, Dialog, Tooltip } from "@chakra-ui/react"
import { useState, useEffect } from "react"
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
      } catch (err) {
        console.error("Error:", err);
        setError("Failed to fetch concepts");
      } finally {
        setIsLoading(false);
      }
    })();
  }, [check])

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
    if (diff <= 3) return "Elementary"
    if (diff <= 6) return "Middle School"
    if (diff <= 9) return "High School"
    if (diff <= 12) return "Undergraduate"
    return "Graduate+"
  }

  const getDifficultyColor = (diff: number): string => {
    if (diff <= 3) return "green"
    if (diff <= 6) return "blue"
    if (diff <= 9) return "yellow"
    if (diff <= 12) return "orange"
    return "red"
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
            <Box bg="red.50" p={4} borderRadius="md" border="1px solid" borderColor="red.200">
              <Text color="red.600">{error}</Text>
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

              {/* Field Filter */}
              <Box>
                <Text fontSize="sm" fontWeight="bold" mb={2}>Field</Text>
                <select
                  value={selectedField}
                  onChange={(e) => setSelectedField(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "8px 12px",
                    borderRadius: "6px",
                    border: "1px solid",
                    borderColor: "var(--chakra-colors-muted)",
                    backgroundColor: "var(--chakra-colors-bg)",
                    color: "var(--chakra-colors-fg)"
                  }}
                >
                  <option value="all">All Fields</option>
                  {availableFields.map(field => (
                    <option key={field} value={field}>{field}</option>
                  ))}
                </select>
              </Box>

              {/* Difficulty Filter */}
              <Box>
                <Text fontSize="sm" fontWeight="bold" mb={2}>Difficulty</Text>
                <select
                  value={selectedDifficulty}
                  onChange={(e) => setSelectedDifficulty(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "8px 12px",
                    borderRadius: "6px",
                    border: "1px solid",
                    borderColor: "var(--chakra-colors-muted)",
                    backgroundColor: "var(--chakra-colors-bg)",
                    color: "var(--chakra-colors-fg)"
                  }}
                >
                  <option value="all">All Levels</option>
                  <option value="1-3">Middle School (1-3)</option>
                  <option value="4-6">High School (4-6)</option>
                  <option value="7-9">Undergraduate (7-9)</option>
                  <option value="10-12">Graduate (10-12)</option>
                  <option value="13-15">Graduate+ (13-15)</option>
                </select>
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
                      } catch (e) {
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
                              <Tooltip.Root>
                                <Tooltip.Trigger>
                                  <Badge colorPalette="gray" fontSize="xs">
                                    +{concept.fields.length - 2}
                                  </Badge>
                                </Tooltip.Trigger>
                                <Tooltip.Positioner>
                                  <Tooltip.Content bg="gray.800" color="white">
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
              <Heading size="md" color="gray.600" mb={2}>
                No concepts found
              </Heading>
              <Text color="gray.500">
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
