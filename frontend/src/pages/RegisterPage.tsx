import { Button, Field, Input, Stack, Heading, Text } from "@chakra-ui/react"
import { PasswordInput } from "@/components/ui/password-input"
import { useForm } from "react-hook-form"
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import InlineLink from "@/components/ui/InlineLink"
import { endpoints } from "@/lib/api/endpoints"
import Navbar from "@/components/Navbar"
import PageContainer from "@/components/layout/PageContainer"
import Panel from "@/components/layout/Panel"

interface FormValues {
  username: string
  email: string
  password: string
}

const RegisterPage = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>()
  
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string>("")
  const [success, setSuccess] = useState<string>("")
  const navigate = useNavigate()

  async function onSubmit(data: FormValues) {
    setIsLoading(true)
    setError("")
    setSuccess("")
    
    try {
      const registerRes = await fetch(endpoints.register(), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", 
        body: JSON.stringify({
          username: data.username,
          email: data.email,
          password: data.password,
        }),
      });
      
      const registerJson = await registerRes.json();
      console.log("Registration response:", registerRes.status, registerJson); // Debug the actual response
      
      if (registerRes.ok) {
        // Auto sign-in after successful registration
        try {
          const loginRes = await fetch(endpoints.signin(), {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({
              identifier: data.email,
              password: data.password,
            }),
          });
          const loginJson = await loginRes.json();
          if (loginRes.ok && loginJson?.jwt) {
            localStorage.setItem("jwt", loginJson.jwt);
            setSuccess("Account created! Finishing setup…");
            navigate("/onboarding");
          } else {
            // Fallback: if auto sign-in fails, go to sign-in page
            setSuccess("Account created! Please sign in.");
            navigate("/signin");
          }
        } catch (e) {
          // Fallback if network/sign-in fails
          setSuccess("Account created! Please sign in.");
          navigate("/signin");
        }
      } else {
        // Handle nested error structure from backend
        console.log("Error response structure:", JSON.stringify(registerJson, null, 2)); // Debug error structure
        const errorMessage = registerJson.error || registerJson.message || "Registration failed";
        console.log("Extracted error message:", errorMessage); // Debug extracted message
        setError(errorMessage);
        console.error("Registration error:", registerJson); // Add logging to debug
      }

    } catch (err) {
      console.error("Error:", err);
      setError("Network error. Please try again.");
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <Navbar />
      <PageContainer>
        <Stack minH="80vh" align="center" justify="center">
          <Panel maxW="lg" w="full" p={{ base: 8, md: 12 }} borderRadius="2xl">
            <Stack gap={10}>
              <Stack gap={1} align="center">
                <Heading size="2xl">Create Account</Heading>
                <Text color="fg.muted">Join us and start your learning journey</Text>
              </Stack>

              <form onSubmit={handleSubmit(onSubmit)}>
                <Stack gap="5" align="flex-start" maxW="lg" w="full">
                {error && (
                  <Text color="red.400" fontSize="sm">{error}</Text>
                )}
                {success && (
                  <Text color="green.400" fontSize="sm">{success}</Text>
                )}

                <Field.Root invalid={!!errors.username}>
                  <Field.Label>Username</Field.Label>
                  <Input
                      size="lg"
                    {...register("username", {
                      required: "Username is required",
                      minLength: { value: 3, message: "Username must be at least 3 characters" },
                    })}
                    type="text"
                    placeholder="Enter your username"
                  />
                  <Field.ErrorText>{errors.username?.message}</Field.ErrorText>
                </Field.Root>

                <Field.Root invalid={!!errors.email}>
                  <Field.Label>Email</Field.Label>
                  <Input
                      size="lg"
                    {...register("email", {
                      required: "Email is required",
                      pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: "Invalid email address" },
                    })}
                    type="email"
                    placeholder="Enter your email"
                  />
                  <Field.ErrorText>{errors.email?.message}</Field.ErrorText>
                </Field.Root>

                <Field.Root invalid={!!errors.password}>
                  <Field.Label>Password</Field.Label>
                  <PasswordInput
                      size="lg"
                    {...register("password", {
                      required: "Password is required",
                      minLength: { value: 6, message: "Password must be at least 6 characters" },
                    })}
                    placeholder="Create a password"
                  />
                  <Field.ErrorText>{errors.password?.message}</Field.ErrorText>
                </Field.Root>

                <Button type="submit" size="lg" w="full" loading={isLoading} colorPalette="sage">
                  Create Account
                </Button>
                </Stack>
              </form>

              <Stack gap={1} align="center">
                <Text fontSize="sm">
                  Already have an account? <InlineLink to="/signin">Sign in</InlineLink>
                </Text>
                <Text fontSize="sm">
                  <InlineLink to="/" leadingArrow>Back to Home</InlineLink>
                </Text>
              </Stack>
            </Stack>
          </Panel>
        </Stack>
      </PageContainer>
    </>
  )
}

export default RegisterPage