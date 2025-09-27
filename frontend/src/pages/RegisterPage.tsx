import { Button, Field, Input, Stack, Heading, Text } from "@chakra-ui/react"
import { PasswordInput } from "@/components/ui/password-input"
import { useForm } from "react-hook-form"
import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"

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
      const registerRes = await fetch("http://127.0.0.1:1337/api/register", {
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
      
      if (registerRes.ok) {
        setSuccess("Account created successfully! You can now sign in.");
        setTimeout(() => {
          navigate("/signin");
        }, 2000);
      } else {
        setError(registerJson.error || "Registration failed");
      }

    } catch (err) {
      console.error("Error:", err);
      setError("Network error. Please try again.");
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Stack gap={8} align="center" justify="center" minH="100vh" p={8}>
      <Stack gap={4} align="center">
        <Heading size="xl">Create Account</Heading>
        <Text color="gray.600">Join us and start your learning journey</Text>
      </Stack>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack gap="4" align="flex-start" maxW="sm" w="full">
          {error && (
            <Text color="red.500" fontSize="sm">{error}</Text>
          )}
          
          {success && (
            <Text color="green.500" fontSize="sm">{success}</Text>
          )}
          
          <Field.Root invalid={!!errors.username}>
            <Field.Label>Username</Field.Label>
            <Input
              {...register("username", {
                required: "Username is required",
                minLength: {
                  value: 3,
                  message: "Username must be at least 3 characters",
                },
              })}
              type="text"
              placeholder="Enter your username"
            />
            <Field.ErrorText>{errors.username?.message}</Field.ErrorText>
          </Field.Root>

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
              placeholder="Enter your email"
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
              placeholder="Create a password"
            />
            <Field.ErrorText>{errors.password?.message}</Field.ErrorText>
          </Field.Root>

          <Button type="submit" w="full" loading={isLoading}>
            Create Account
          </Button>
        </Stack>
      </form>

      <Stack gap={2} align="center">
        <Text fontSize="sm">
          Already have an account? <Link to="/signin">Sign in</Link>
        </Text>
        <Text fontSize="sm">
          <Link to="/">← Back to Home</Link>
        </Text>
      </Stack>
    </Stack>
  )
}

export default RegisterPage