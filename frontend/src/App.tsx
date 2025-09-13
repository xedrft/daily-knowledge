import { Button, Field, Input, Stack } from "@chakra-ui/react"
import { PasswordInput } from "@/components/ui/password-input"
import { useForm } from "react-hook-form"
import { useState } from "react"

interface FormValues {
  email: string
  password: string
}

export const App = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>()
  
  const [data, setData] = useState<string | null>(null);

  async function onSubmit(data: FormValues) {
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
      console.log("Login response:", loginJson);

      localStorage.setItem("jwt", loginJson.jwt);
      const conceptRes = await fetch("http://127.0.0.1:1337/api/get-concept", {
        credentials: "include",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("jwt")}`,
          },
      });
      const conceptJson = await conceptRes.json();
      console.log("Protected route response:", conceptJson);
      setData(conceptJson);

    } catch (err) {
      console.error("Error:", err);
    }
  }

  return (
    <>
    <form onSubmit={handleSubmit(onSubmit)}>
      <Stack gap="4" align="flex-start" maxW="sm">
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
            type="password"
          />
          <Field.ErrorText>{errors.password?.message}</Field.ErrorText>
        </Field.Root>

        <Button type="submit">Submit</Button>
      </Stack>
    </form>
    <div>
      <h2> Result </h2>
      <p>{data}</p>
    </div>
    </>
  )
}
