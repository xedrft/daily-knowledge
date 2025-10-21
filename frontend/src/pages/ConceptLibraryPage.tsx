import { Button, Stack, Heading, Text, Box, Input, Grid, Badge, useDisclosure, Dialog, Tooltip } from "@chakra-ui/react"
import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import Navbar from "../components/Navbar"
import latexFormatter from "@/functions/latexFormatter"
import ProblemSet from "@/components/ProblemSet"

interface Concept {
  documentId: string
  title: string
  difficulty: number
  fields: string[]
  learned?: boolean
}

const ConceptLibraryPage = () => {
  const [concepts, setConcepts] = useState<Concept[]>([])
  const [filteredConcepts, setFilteredConcepts] = useState<Concept[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string>("")
  const navigate = useNavigate()

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

  // Auth check
  const redirectCheck = async (): Promise<boolean> => {
    const jwt = localStorage.getItem("jwt")
    console.log("[ConceptLibrary] JWT exists:", !!jwt)
    if (!jwt) {
      console.log("[ConceptLibrary] No JWT, redirecting to signin")
      navigate("/signin")
      return false
    }
    try {
      console.log("[ConceptLibrary] Calling check-field API...")
      const resp = await fetch("http://127.0.0.1:1337/api/check-field", {
        method: "GET",
        credentials: "include",
        headers: { Authorization: `Bearer ${jwt}` }
      })
      console.log("[ConceptLibrary] check-field response status:", resp.status)
      if (!resp.ok) {
        console.log("[ConceptLibrary] Response not OK, status:", resp.status)
        if (resp.status === 401 || resp.status === 403) {
          console.log("[ConceptLibrary] Unauthorized, redirecting to signin")
          navigate("/signin")
          return false
        }
        return false
      }
      const data = await resp.json()
      console.log("[ConceptLibrary] check-field data:", data)
      if (data.hasField === false) {
        console.log("[ConceptLibrary] No field set, redirecting to change-field")
        navigate("/change-field")
        return false
      }
      console.log("[ConceptLibrary] All checks passed!")
      return true
    } catch (e) {
      console.error("[ConceptLibrary] Field check failed:", e)
      return false
    }
  }

  // Fetch all concepts
  useEffect(() => {
    const fetchConcepts = async () => {
      const ok = await redirectCheck()
      if (!ok) return

      setIsLoading(true)
      setError("")
      try {
        const jwt = localStorage.getItem("jwt")
        if (!jwt) {
          navigate("/signin")
          return
        }

        const response = await fetch("http://127.0.0.1:1337/api/list-concepts", {
          credentials: "include",
          headers: { Authorization: `Bearer ${jwt}` }
        })

        if (response.ok) {
          const data = await response.json()
          setConcepts(data.concepts || [])
          
          // Extract unique fields
          const fieldsSet = new Set<string>()
          data.concepts?.forEach((c: Concept) => {
            if (Array.isArray(c.fields)) {
              c.fields.forEach(f => fieldsSet.add(f))
            }
          })
          setAvailableFields(Array.from(fieldsSet).sort())
        } else {
          setError("Failed to fetch concepts")
          if (response.status === 401 || response.status === 403) navigate("/signin")
        }
      } catch (err) {
        console.error("Error:", err)
        setError("Network error. Please try again.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchConcepts()
  }, [])

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
      result = result.filter(c =>
        Array.isArray(c.fields) && c.fields.includes(selectedField)
      )
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
      <Box maxW="8xl" mx="auto" px={8} py={6}>
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
          <Box p={6} bg="panel" borderRadius="lg" border="1px solid" borderColor="muted">
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
          </Box>

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
                  <Box
                    key={concept.documentId}
                    p={5}
                    bg="panel"
                    borderRadius="lg"
                    border="1px solid"
                    borderColor="muted"
                    _hover={{ boxShadow: "md", borderColor: "border.emphasized" }}
                    cursor="pointer"
                    transition="all 0.2s"
                    onClick={async () => {
                      try {
                        const jwt = localStorage.getItem('jwt')
                        const res = await fetch('http://127.0.0.1:1337/api/concept/get', {
                          method: 'POST',
                          headers: {
                            'Content-Type': 'application/json',
                            Authorization: `Bearer ${jwt}`,
                          },
                          credentials: 'include',
                          body: JSON.stringify({ documentId: concept.documentId }),
                        })
                        if (!res.ok) return
                        const payload = await res.json()
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
                  </Box>
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
      </Box>
    </>
  )
}

export default ConceptLibraryPage
