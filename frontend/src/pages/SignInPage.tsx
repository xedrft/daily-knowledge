import { Button, Field, Input, Stack, Heading, Text } from "@chakra-ui/react"
import { PasswordInput } from "@/components/ui/password-input"
import { useForm } from "react-hook-form"
import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"

interface FormValues {
  email: string
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
          identifier: data.email,
          password: data.password,
        }),
      });
      
      const loginJson = await loginRes.json();
      
      if (loginRes.ok) {
        localStorage.setItem("jwt", loginJson.jwt);
        console.log("Login successful:", loginJson);
        navigate("/questions"); // Redirect to questions page
      } else {
        setError(loginJson.error || "Login failed");
      }

    } catch (err) {
      console.error("Error:", err);
      setError("Network error. Please try again.");
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Stack spacing={8} align="center" justify="center" minH="100vh" p={8}>
      <Stack spacing={4} align="center">
        <Heading size="xl">Welcome Back</Heading>
        <Text color="gray.600">Sign in to continue your learning journey</Text>
      </Stack>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack gap="4" align="flex-start" maxW="sm" w="full">
          {error && (
            <Text color="red.500" fontSize="sm">{error}</Text>
          )}
          
          <Field.Root invalid={!!errors.email}>
            <Field.Label>Email</Field.Label>
            <Input
              {...register("email", {
                required: "Email is required",
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: "Invalid email address",
                },
              })}
              type="email"
            />
            <Field.ErrorText>{errors.email?.message}</Field.ErrorText>
          </Field.Root>

          <Field.Root invalid={!!errors.password}>
            <Field.Label>Password</Field.Label>
            <PasswordInput
              {...register("password", {
                required: "Password is required",
                minLength: {
                  value: 6,
                  message: "Password must be at least 6 characters",
                },
              })}
            />
            <Field.ErrorText>{errors.password?.message}</Field.ErrorText>
          </Field.Root>

          <Button type="submit" w="full" isLoading={isLoading}>
            Sign In
          </Button>
        </Stack>
      </form>

      <Stack spacing={2} align="center">
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