import { Button, Field, Input, Stack, Heading, Text } from "@chakra-ui/react"
import { PasswordInput } from "@/components/ui/password-input"
import { useForm } from "react-hook-form"
import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"

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
      const loginRes = await fetch("http://127.0.0.1:1337/api/signin", {
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
    <Stack gap={8} align="center" justify="center" minH="100vh" p={8}>
      <Stack gap={4} align="center">
        <Heading size="xl">Welcome Back</Heading>
        <Text color="gray.600">Sign in to continue your learning journey</Text>
      </Stack>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack gap="4" align="flex-start" maxW="sm" w="full">
          {error && (
            <Text color="red.500" fontSize="sm">{error}</Text>
          )}
          
          <Field.Root invalid={!!errors.identifier}>
            <Field.Label>Email or Username</Field.Label>
            <Input
              {...register("identifier", {
                required: "Identifier is required",
              })}

            />
            <Field.ErrorText>{errors.identifier?.message}</Field.ErrorText>
          </Field.Root>

          <Field.Root invalid={!!errors.password}>
            <Field.Label>Password</Field.Label>
            <PasswordInput
              {...register("password", {
                required: "Password is required",
              })}
            />
            <Field.ErrorText>{errors.password?.message}</Field.ErrorText>
          </Field.Root>

          <Button type="submit" w="full" loading={isLoading}>
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
  )
}

export default SignInPage