import { Box, Stack, Text } from "@chakra-ui/react"
import { Tooltip } from "@/components/ui/tooltip"
import React from "react"

export interface ActivityDay { date: string; count: number }

function getColor(count: number): string {
  // Make empty days visibly distinct from the background, and keep
  // "darker = more" for activity levels.
  if (count <= 0) return "var(--chakra-colors-muted)"
  if (count < 2) return "var(--chakra-colors-sage-700)"
  if (count < 4) return "var(--chakra-colors-sage-800)"
  return "var(--chakra-colors-sage-900)"
}

function formatDate(date: Date): string {
  const y = date.getUTCFullYear()
  const m = String(date.getUTCMonth() + 1).padStart(2, '0')
  const d = String(date.getUTCDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export const buildCalendar = (activities: ActivityDay[], weeks = 26) => {
  // Build a map for quick lookup
  const map = new Map<string, number>()
  for (const a of activities) map.set(a.date, a.count)

  const days: { date: string; count: number }[] = []
  const today = new Date()
  const start = new Date(today)
  // Align to last Sunday (or desired week start)
  const dayOfWeek = (today.getUTCDay() + 7) % 7
  start.setUTCDate(today.getUTCDate() - dayOfWeek - (weeks - 1) * 7)

  for (let w = 0; w < weeks; w++) {
    for (let d = 0; d < 7; d++) {
      const curr = new Date(start)
      curr.setUTCDate(start.getUTCDate() + w * 7 + d)
      const key = formatDate(curr)
      days.push({ date: key, count: map.get(key) || 0 })
    }
  }
  return days
}

const ActivityGrid: React.FC<{ activities: ActivityDay[]; weeks?: number; cellSize?: number; gap?: number } > = ({ activities, weeks = 26, cellSize = 16, gap = 3 }) => {
  const days = buildCalendar(activities, weeks)
  // Render columns by week
  const columns: Array<typeof days> = []
  for (let i = 0; i < days.length; i += 7) columns.push(days.slice(i, i + 7))

  return (
    <Box w="full" display="flex" flexDirection="column" alignItems="center">
      <Box w="full" display="flex" justifyContent="center" overflowX="auto">
        <Stack direction="row" gap={`${gap}px`} align="flex-start">
          {columns.map((col, idx) => (
            <Stack key={idx} gap={`${gap}px`}>
              {col.map((d) => (
                <Tooltip key={d.date} content={`${d.count} learned on ${d.date}`} positioning={{ placement: 'top' }} openDelay={100}>
                  <Box
                    w={`${cellSize}px`}
                    h={`${cellSize}px`}
                    borderRadius="2px"
                    bg={getColor(d.count)}
                    border="1px solid"
                    borderColor="var(--chakra-colors-emphasized)"
                  />
                </Tooltip>
              ))}
            </Stack>
          ))}
        </Stack>
      </Box>
    </Box>
  )
}

export default ActivityGrid
