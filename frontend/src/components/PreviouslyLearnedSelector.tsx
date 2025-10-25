import { useMemo, useState } from "react";
import { Box, Button, Field, Grid, HStack, Input as CInput, Menu, Stack, Text, Badge } from "@chakra-ui/react";
import { COURSE_CATALOG, COURSE_CATEGORIES } from "@/lib/constants/courses";
import { LuChevronDown } from "react-icons/lu";

export type CourseCategoryKey = typeof COURSE_CATEGORIES[number]["key"] | "all";

interface PreviouslyLearnedSelectorProps {
  selected: string[];
  onChange: (next: string[]) => void;
  label?: string;
  // Optional: customize the secondary action (defaults to clearing selections)
  secondaryActionLabel?: string; // e.g., "Reset"
  onSecondaryAction?: () => void; // e.g., reset to baseline
}

export default function PreviouslyLearnedSelector({ selected, onChange, label = "Previously learned courses (optional)", secondaryActionLabel, onSecondaryAction }: PreviouslyLearnedSelectorProps) {
  const [courseQuery, setCourseQuery] = useState("");
  const [courseFilter, setCourseFilter] = useState<CourseCategoryKey>("all");

  const COURSE_TO_CATEGORY = useMemo(() => {
    const m = new Map<string, typeof COURSE_CATEGORIES[number]["key"]>();
    COURSE_CATEGORIES.forEach((cat) => {
      cat.courses.forEach((course) => m.set(course, cat.key));
    });
    return m;
  }, []);

  const visibleCourses = COURSE_CATALOG.filter((c) => {
    const matchesQuery = courseQuery.trim().length === 0 || c.toLowerCase().includes(courseQuery.toLowerCase());
    const cat = COURSE_TO_CATEGORY.get(c);
    const matchesCat = courseFilter === "all" || cat === courseFilter;
    return matchesQuery && matchesCat;
  });

  const toggleCourse = (c: string) => {
    onChange(selected.includes(c) ? selected.filter((x) => x !== c) : [...selected, c]);
  };

  return (
    <Field.Root w="full">
      {label && <Field.Label>{label}</Field.Label>}
      <Stack gap={3}>
        <Stack direction={{ base: "column" }} gap={2} align="stretch">
          <CInput
            placeholder="Search courses (e.g., Algebra, Physics)"
            value={courseQuery}
            onChange={(e) => setCourseQuery(e.target.value)}
            bg="bg"
          />
          <Menu.Root>
            <Menu.Trigger asChild>
              <Button size="sm" variant="outline" w="full" justifyContent="space-between" bg="bg" borderColor="muted">
                {courseFilter === "all" ? "All categories" : COURSE_CATEGORIES.find((c) => c.key === courseFilter)?.label || "Category"}
                <Box as="span" aria-hidden display="inline-flex">
                  <LuChevronDown size={16} />
                </Box>
              </Button>
            </Menu.Trigger>
            <Menu.Positioner>
              <Menu.Content bg="bg" borderColor="muted" boxShadow="sm" borderRadius="md" p={1}>
                <Menu.Item
                  value="all"
                  onClick={() => setCourseFilter("all")}
                  _hover={{ bg: "muted" }}
                  _focus={{ bg: "muted" }}
                  color="fg"
                  cursor="pointer"
                >
                  All categories
                </Menu.Item>
                {COURSE_CATEGORIES.map((cat) => (
                  <Menu.Item
                    key={cat.key}
                    value={cat.key}
                    onClick={() => setCourseFilter(cat.key)}
                    _hover={{ bg: "muted" }}
                    _focus={{ bg: "muted" }}
                    color="fg"
                    cursor="pointer"
                  >
                    {cat.label}
                  </Menu.Item>
                ))}
              </Menu.Content>
            </Menu.Positioner>
          </Menu.Root>
        </Stack>

        <HStack gap={2} justify="space-between" wrap="wrap">
          <Text fontSize="sm" color="fg.muted">
            Showing {visibleCourses.length} course{visibleCourses.length !== 1 ? "s" : ""}
          </Text>
          <HStack gap={2}>
            <Button
              size="xs"
              variant="outline"
              onClick={() => onChange(Array.from(new Set([...selected, ...visibleCourses])))}
              disabled={visibleCourses.length === 0}
            >
              Select all
            </Button>
              <Button
                size="xs"
                variant="ghost"
                onClick={() => (onSecondaryAction ? onSecondaryAction() : onChange([]))}
                disabled={selected.length === 0 && !onSecondaryAction}
              >
                {secondaryActionLabel ?? "Clear"}
              </Button>
          </HStack>
        </HStack>

        <Grid templateColumns={{ base: "repeat(2, 1fr)", sm: "repeat(3, 1fr)", md: "repeat(4, 1fr)" }} gap={2}>
          {visibleCourses.map((c) => {
            const active = selected.includes(c);
            return (
              <Button key={c} size="sm" variant={active ? "solid" : "outline"} colorPalette="sage" onClick={() => toggleCourse(c)}>
                {c}
              </Button>
            );
          })}
        </Grid>

        {selected.length > 0 && (
          <Stack gap={2}>
            <Text fontSize="sm">Selected ({selected.length}):</Text>
            <HStack gap={2} wrap="wrap">
              {selected.map((c) => (
                <Badge key={c} colorPalette="sage" variant="solid" px={2} py={1}>
                  <HStack gap={2}>
                    <span>{c}</span>
                    <Button size="2xs" variant="subtle" onClick={() => toggleCourse(c)}>
                      ×
                    </Button>
                  </HStack>
                </Badge>
              ))}
            </HStack>
          </Stack>
        )}
      </Stack>
    </Field.Root>
  );
}
