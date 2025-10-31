import { Button, Heading, Input, Stack, Text, Box } from "@chakra-ui/react"
import Navbar from "@/components/Navbar"
import PageContainer from "@/components/layout/PageContainer"
import Panel from "@/components/layout/Panel"
import { useState } from "react"
import { toaster } from "@/components/ui/toaster"
import { StreakToastContent, TodayCountToastContent } from "@/components/ui/ActivityToast"

const ToastDemoPage = () => {
  const [streak, setStreak] = useState<number>(3)
  const [count, setCount] = useState<number>(2)

  return (
    <>
      <Navbar />
      <PageContainer>
        <Stack gap={6}>
          <Stack gap={1} align="center">
            <Heading size="2xl">Toast Demo</Heading>
            <Text color="fg.muted">Preview the learning toasts and tweak values</Text>
          </Stack>

          <Panel>
            <Stack gap={4}>
              <Heading size="md">Streak +1</Heading>
              <Text color="fg.muted">Set a streak value and preview the weekly 7-dot toast</Text>
              <Stack direction={{ base: 'column', sm: 'row' }} gap={3} align="center">
                <Box>
                  <Text fontSize="sm" color="fg.muted">Streak</Text>
                  <Input type="number" value={streak} min={0} onChange={(e) => setStreak(Number(e.target.value))} w="120px" />
                </Box>
                <Button
                  variant="solid"
                  colorPalette="sage"
                  onClick={() => toaster.create({ type: 'success', title: 'Streak +1', description: (<StreakToastContent streak={streak} />) })}
                >
                  Show Streak Toast
                </Button>
              </Stack>
            </Stack>
          </Panel>

          <Panel>
            <Stack gap={4}>
              <Heading size="md">Concepts Today</Heading>
              <Text color="fg.muted">Set today\'s count and preview the segmented bar toast</Text>
              <Stack direction={{ base: 'column', sm: 'row' }} gap={3} align="center">
                <Box>
                  <Text fontSize="sm" color="fg.muted">Count</Text>
                  <Input type="number" value={count} min={0} onChange={(e) => setCount(Number(e.target.value))} w="120px" />
                </Box>
                <Button
                  variant="outline"
                  colorPalette="sage"
                  onClick={() => toaster.create({ title: 'Nice progress', description: (<TodayCountToastContent count={count} />) })}
                >
                  Show Count Toast
                </Button>
              </Stack>
            </Stack>
          </Panel>
        </Stack>
      </PageContainer>
    </>
  )
}

export default ToastDemoPage
