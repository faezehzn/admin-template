"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function handleLogin() {
    await signIn("credentials", {
      email,
      password,
      callbackUrl: "/admin",
    });
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-[350px] space-y-4">
        <h1 className="text-2xl font-bold text-center">Admin Login</h1>

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

        <Button className="w-full" onClick={handleLogin}>
          Login
        </Button>
      </div>
    </div>
  );
}
