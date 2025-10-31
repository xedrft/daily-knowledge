"use client"

import {
  Toaster as ChakraToaster,
  Portal,
  Spinner,
  Stack,
  Toast,
  createToaster,
} from "@chakra-ui/react"

export const toaster = createToaster({
  placement: "bottom-end",
  pauseOnPageIdle: true,
})

export const Toaster = () => {
  return (
    <Portal>
      <ChakraToaster toaster={toaster} insetInline={{ mdDown: "4" }}>
        {(toast) => (
          <Toast.Root
            width={{ md: "sm" }}
            bg="panel"
            borderWidth="1px"
            borderColor="muted"
            color="fg"
          >
            {toast.type === "loading" ? (
              <Spinner size="sm" color="blue.solid" />
            ) : (
              <Toast.Indicator color={toast.type === 'success' ? 'sage.solid' : undefined} />
            )}
            <Stack gap="1" flex="1" maxWidth="100%">
              {toast.title && (
                <Toast.Title color={toast.type === 'success' ? 'sage.400' : undefined}>
                  {toast.title}
                </Toast.Title>
              )}
              {toast.description && (
                <Toast.Description>{toast.description}</Toast.Description>
              )}
            </Stack>
            {toast.action && (
              <Toast.ActionTrigger>{toast.action.label}</Toast.ActionTrigger>
            )}
            {toast.closable && <Toast.CloseTrigger />}
          </Toast.Root>
        )}
      </ChakraToaster>
    </Portal>
  )
}
