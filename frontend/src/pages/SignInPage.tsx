import { Button, Field, Input, Stack, Heading, Text } from "@chakra-ui/react"
import { PasswordInput } from "@/components/ui/password-input"
import { useForm } from "react-hook-form"
import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import Navbar from "@/components/Navbar"
import PageContainer from "@/components/layout/PageContainer"
import Panel from "@/components/layout/Panel"
import { endpoints } from "@/lib/api/endpoints"

interface FormValues {
  identifier: string
  password: string
}

const SignInPage = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>()
  
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string>("")
  const navigate = useNavigate()

  async function onSubmit(data: FormValues) {
    setIsLoading(true)
    setError("")
    
    try {
      const loginRes = await fetch(endpoints.signin(), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", 
        body: JSON.stringify({
          identifier: data.identifier,
          password: data.password,
        }),
      });
      
      const loginJson = await loginRes.json();
      console.log("Raw response:", loginRes.status, loginJson); // Debug the actual response
      
      if (loginRes.ok) {
        localStorage.setItem("jwt", loginJson.jwt);
        console.log("Login successful:", loginJson);
        navigate("/questions"); // Redirect to questions page
      } else {
        // Handle nested error structure from Strapi
        console.log("Error response structure:", JSON.stringify(loginJson, null, 2)); // Debug error structure
        const errorMessage = loginJson.error || "Login failed";
        console.log("Extracted error message:", errorMessage); // Debug extracted message
        setError(errorMessage);
        console.error("Login error:", loginJson); // Add logging to debug
      }

    } catch (err) {
      console.error("Network/parsing error:", err);
      setError("Network error. Please check your connection and try again.");
    } finally {
      setIsLoading(false)
    }
  }

  if (localStorage.getItem("jwt")) {
    navigate("/questions")
  }

  return (
    <>
      <Navbar />
      <PageContainer>
        <Stack minH="80vh" align="center" justify="center">
          <Panel maxW="lg" w="full" p={{ base: 8, md: 12 }} borderRadius="2xl">
            <Stack gap={10}>
              <Stack gap={1} align="center">
                <Heading size="2xl">Welcome Back</Heading>
                <Text color="fg.muted" fontSize="md">Sign in to continue your learning journey</Text>
              </Stack>

              <form onSubmit={handleSubmit(onSubmit)}>
                <Stack gap="5" align="flex-start" maxW="lg" w="full">
                  {error && <Text color="red.400" fontSize="sm">{error}</Text>}

                  <Field.Root invalid={!!errors.identifier}>
                    <Field.Label>Email or Username</Field.Label>
                    <Input
                      size="lg"
                      {...register("identifier", { required: "Identifier is required" })}
                    />
                    <Field.ErrorText>{errors.identifier?.message}</Field.ErrorText>
                  </Field.Root>

                  <Field.Root invalid={!!errors.password}>
                    <Field.Label>Password</Field.Label>
                    <PasswordInput
                      size="lg"
                      {...register("password", { required: "Password is required" })}
                    />
                    <Field.ErrorText>{errors.password?.message}</Field.ErrorText>
                  </Field.Root>

                  <Button type="submit" size="lg" w="full" loading={isLoading} colorPalette="sage">
                    Sign In
                  </Button>
                </Stack>
              </form>

              <Stack gap={2} align="center">
                <Text fontSize="sm">
                  Don't have an account? <Link to="/register">Sign up</Link>
                </Text>
                <Text fontSize="sm">
                  <Link to="/">← Back to Home</Link>
                </Text>
              </Stack>
            </Stack>
          </Panel>
        </Stack>
      </PageContainer>
    </>
  )
}

export default SignInPage