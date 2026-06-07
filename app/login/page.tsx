"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useErrorToast } from "@/hooks/useCustomToasts";
import { FormField } from "@/components/shared/formField";

export default function LoginPage() {
  const { show: showError } = useErrorToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function handleLogin() {
    if (!email || !password) {
      showError("Please fill your email and password.");
      return;
    }
    await signIn("credentials", {
      email,
      password,
      callbackUrl: "/admin",
    });
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-87.5 space-y-4">
        <h1 className="text-2xl font-bold text-center">Admin Login</h1>

        <form
          className="flex flex-col gap-3 w-full"
          onSubmit={(e) => {
            (e.preventDefault(), handleLogin());
          }}
        >
          <FormField id="email" label="Email">
            <Input
              placeholder="example@gmail.com"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </FormField>
          <FormField id="password" label="Password">
            <Input
              type="****"
              id="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </FormField>
          <Button className="w-full" type="submit">
            Login
          </Button>
        </form>
      </div>
    </div>
  );
}
