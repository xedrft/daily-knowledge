import { Box, HStack, Stack, Text } from "@chakra-ui/react"
import React from "react"

type WeekActivity = Array<{ date: string; count: number }>

function dayLetterFromIndex(idx: number): string {
  // 0=Sun..6=Sat with 'R' for Thu
  const map = ['S', 'M', 'T', 'W', 'R', 'F', 'S']
  return map[idx] ?? ''
}

export const StreakToastContent: React.FC<{ streak: number; week?: WeekActivity }> = ({ streak, week }) => {
  // Build last 7 days if not provided (fallback, counts unknown)
  let days: { dow: number; active: boolean }[] = []
  if (week && week.length) {
    // Ensure in ascending order oldest -> today
    const normalized = [...week].sort((a, b) => a.date.localeCompare(b.date))
    days = normalized.map((d) => ({
      dow: new Date(d.date + 'T00:00:00').getDay(),
      active: (d.count || 0) > 0,
    }))
  } else {
    const now = new Date()
    const start = new Date(now)
    start.setDate(now.getDate() - 6)
    for (let i = 0; i < 7; i++) {
      const cur = new Date(start)
      cur.setDate(start.getDate() + i)
      days.push({ dow: cur.getDay(), active: i === 6 })
    }
  }

  // Compute consecutive streak from end (today backwards)
  let streakRun = 0
  for (let i = days.length - 1; i >= 0; i--) {
    if (days[i].active) streakRun++
    else break
  }

  return (
    <Stack gap={2}>
      <Text fontWeight="bold" color="fg">This week</Text>
      <Stack gap={1}>
        <HStack gap={1.5}>
          {days.map((d, i) => {
            const isActive = d.active
            const isToday = i === days.length - 1
            // Minimal with sage accents: active = sage fill, inactive = transparent; today gets a stronger sage ring
            const bg = isActive ? 'sage.solid' : 'transparent'
            const borderColor = isToday ? 'sage.focusRing' : (isActive ? 'sage.emphasized' : 'border.muted')
            return (
              <Box
                key={i}
                w="10px"
                h="10px"
                borderRadius="full"
                bg={bg}
                border="1px solid"
                borderColor={borderColor}
              />
            )
          })}
        </HStack>
        <HStack gap={1.5}>
          {days.map((d, i) => (
            <Text key={i} fontSize="xs" color="fg.muted" w="10px" textAlign="center">
              {dayLetterFromIndex(d.dow)}
            </Text>
          ))}
        </HStack>
      </Stack>
      <Text fontSize="sm" color="fg.muted">Current streak: {streak} day{streak === 1 ? '' : 's'}</Text>
    </Stack>
  )
}

export const TodayCountToastContent: React.FC<{ count: number }> = ({ count }) => {
  const maxSegments = 6
  const filled = Math.min(count, maxSegments)
  const segments = new Array(maxSegments).fill(0).map((_, i) => i < filled)

  return (
    <Stack gap={2}>
      <Text fontWeight="bold" color="sage.fg">Great job!</Text>
      <Text fontSize="sm" color="fg.muted">Concepts today: {count}</Text>
      <HStack gap={1.5}>
        {segments.map((isFilled, i) => (
          <Box
            key={i}
            w="12px"
            h="8px"
            borderRadius="sm"
            bg={isFilled ? "sage.600" : "muted"}
            border="1px solid"
            borderColor={isFilled ? "sage.emphasized" : "border.muted"}
          />
        ))}
        {count > maxSegments && (
          <Text fontSize="xs" color="fg.muted">+{count - maxSegments}</Text>
        )}
      </HStack>
    </Stack>
  )
}
