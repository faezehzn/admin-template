"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useErrorToast } from "@/hooks/useCustomToasts";

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
          <Input
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Button className="w-full" type="submit">
            Login
          </Button>
        </form>
      </div>
    </div>
  );
}
