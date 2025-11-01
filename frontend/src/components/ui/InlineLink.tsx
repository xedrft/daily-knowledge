import { chakra } from "@chakra-ui/react"
import { Link as RouterLink } from "react-router-dom"
import React from "react"

interface InlineLinkProps {
  to: string
  children: React.ReactNode
  leadingArrow?: boolean
}

// Consistent inline link styling used across pages (auth links, back links, etc.)
// - Uses Chakra Button variant="link" for accessible semantics
// - Sage accent, subtle underline on hover, no extra padding
export default function InlineLink({ to, children, leadingArrow }: InlineLinkProps) {
  const RLink = chakra(RouterLink)
  return (
    <RLink to={to} color="sage.400" fontWeight="semibold" _hover={{ textDecoration: "underline", color: "sage.300" }}>
      {leadingArrow ? "← " : null}
      {children}
    </RLink>
  )
}
