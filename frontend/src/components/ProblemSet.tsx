import { Button, Stack, Heading, Box } from "@chakra-ui/react"
import { useState } from "react"
import latexFormatter from "@/functions/latexFormatter"

interface Problem {
  problem: string
  answer: string
  solution: string
}

interface ProblemSetProps {
  problemset: Problem[]
}

const ProblemSet = ({ problemset }: ProblemSetProps) => {
  const [showAnswers, setShowAnswers] = useState<{[key: number]: boolean}>({})
  const [showSolutions, setShowSolutions] = useState<{[key: number]: boolean}>({})

  const toggleAnswer = (problemIndex: number) => {
    setShowAnswers(prev => ({
      ...prev,
      [problemIndex]: !prev[problemIndex]
    }))
  }

  const toggleSolution = (problemIndex: number) => {
    setShowSolutions(prev => ({
      ...prev,
      [problemIndex]: !prev[problemIndex]
    }))
  }

  return (
    <>
      <Heading size="2xl">Practice Problems: </Heading>
      <Stack gap={6}>
        {problemset.map((item, idx) => (
          <Box key={idx} p={6} bg="subtle" borderRadius="lg" border="1px solid muted">
            <Stack gap={4}>
              {/* Problem */}
              <Box pb={3}>
                <Heading size="lg" mb={3} color={{ _light: "sage.600", _dark: "sage.300" }}>
                  Problem {idx + 1}
                </Heading>

                {latexFormatter(item.problem)}
              </Box>
              
              {/* Answer Section */}
              <Box>
                <Button
                  variant="outline"
                  size="sm"
                  width="130px"
                  onClick={() => toggleAnswer(idx)}
                  borderColor={{ _light: "#6ee7b7", _dark: "#10b981" }}
                  borderWidth="1.5px"
                  color={{ _light: "#059669", _dark: "#34d399" }}
                  _hover={{ 
                    bg: { _light: "muted", _dark: "emphasized" }
                  }}
                >
                  {showAnswers[idx] ? "Hide Answer ▲" : "Show Answer ▼"}
                </Button>
                {showAnswers[idx] && (
                  <Box 
                    mt={3} 
                    p={3} 
                    bg="muted"
                    borderRadius="md" 
                    borderLeft="3px solid" 
                    borderColor="sage.400"
                  >
                    <Box className="math-container">
                      {latexFormatter(item.answer)}
                    </Box>
                  </Box>
                )}
              </Box>
              
              {/* Solution Section */}
              <Box>
                <Button
                  variant="outline"
                  size="sm"
                  width="130px"
                  onClick={() => toggleSolution(idx)}
                  borderColor={{ _light: "#93c5fd", _dark: "#3b82f6" }}
                  borderWidth="1.5px"
                  color={{ _light: "#2563eb", _dark: "#60a5fa" }}
                  _hover={{ 
                    bg: { _light: "muted", _dark: "emphasized" }
                  }}
                >
                  {showSolutions[idx] ? "Hide Solution ▲" : "Show Solution ▼"}
                </Button>
                {showSolutions[idx] && (
                  <Box 
                    mt={3} 
                    p={3} 
                    bg="muted"
                    borderRadius="md" 
                    borderLeft="3px solid" 
                    borderColor="sage.500"
                  >
                    <Box className="math-container">
                      {latexFormatter(item.solution)}
                    </Box>
                  </Box>
                )}
              </Box>
            </Stack>
          </Box>
        ))}
      </Stack>
    </>
  )
}

export default ProblemSet