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
          <Box key={idx} p={6} bg="#3A3A3A" borderRadius="lg" border="1px solid #4A4A4A">
            <Stack gap={4}>
              {/* Problem */}
              <Box pb={3}>
                <Heading size="lg" mb={3} color="emerald.300">
                  Problem {index + 1}
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
                  borderColor="green.400"
                  color="green.300"
                  _hover={{ bg: "green.900", borderColor: "green.300" }}
                >
                  {showAnswers[idx] ? "Hide Answer ▲" : "Show Answer ▼"}
                </Button>
                {showAnswers[idx] && (
                  <Box mt={3} p={3} bg="#2A2A2A" borderRadius="md" borderLeft="3px solid" borderColor="green.400">
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
                  borderColor="blue.400"
                  color="blue.300"
                  _hover={{ bg: "blue.900", borderColor: "blue.300" }}
                >
                  {showSolutions[idx] ? "Hide Solution ▲" : "Show Solution ▼"}
                </Button>
                {showSolutions[idx] && (
                  <Box mt={3} p={3} bg="#2A2A2A" borderRadius="md" borderLeft="3px solid" borderColor="blue.400">
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