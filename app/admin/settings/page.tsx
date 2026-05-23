"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";

export default function SettingsPage() {
  const [twoFactor, setTwoFactor] = useState(false);

  return (
    <div className="space-y-3 md:space-y-6 w-full text-primary-700 ">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-diactive">
          Manage your platform preferences and configuration.
        </p>
      </div>

      <Tabs defaultValue="general" className="w-full pb-4">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>

        {/* General Settings */}
        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>Platform Info</CardTitle>
              <CardDescription>
                Update your application name and domain.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="grid gap-2">
                <Input
                  tooltipContent="App Name"
                  placeholder="My Awesome Admin"
                  className="max-w-md"
                />
              </div>
              <div className="grid gap-2">
                <Input
                  tooltipContent="Domain"
                  placeholder="admin.example.com"
                  className="max-w-md"
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button>Save Changes</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* Security Settings */}
        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Authentication</CardTitle>
              <CardDescription>
                Control how users access the system.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center justify-between space-x-2">
                <div className="space-y-0.5">
                  <Label>Two-Factor Auth</Label>
                  <p className="text-sm text-diactive">
                    Require 2FA for all admin accounts.
                  </p>
                </div>
                <Switch checked={twoFactor} onCheckedChange={setTwoFactor} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications */}
        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Email Alerts</CardTitle>
              <CardDescription>
                Manage your notification preferences.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch id="email-alerts" />
                <Label htmlFor="email-alerts" className="cursor-pointer">
                  Enable system alerts via email
                </Label>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
