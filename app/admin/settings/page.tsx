"use client";

import { FormField } from "@/components/shared/formField";
import { Skeleton } from "@/components/shared/skeleton";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useErrorToast, useSuccessToast } from "@/hooks/useCustomToasts";
import { handleError } from "@/lib/errorHandler";
import {
  useGetSettingsQuery,
  useUpdateSettingMutation,
} from "@/stores/settingsApi";

export default function SettingsPage() {
  const { show: showError } = useErrorToast();
  const { data: settings, isLoading } = useGetSettingsQuery();
  const [updateSetting, { isLoading: isUpdating }] = useUpdateSettingMutation();
  const { show: showSuccess } = useSuccessToast();

  const handleUpdate = async (
    key: string,
    value: string | number | boolean,
  ) => {
    try {
      await updateSetting({ key, value }).unwrap();
      showSuccess(`${key} updated successfully`);
    } catch (err) {
      handleError({ showError, error: err });
    }
  };

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
            <CardContent className="space-y-4">
              <FormField label="App Name" id="app-name">
                {isLoading ? (
                  <Skeleton className="w-md h-8" />
                ) : (
                  <Input
                    tooltipOn={false}
                    id="app-name"
                    placeholder="My Awesome Admin"
                    className="max-w-md"
                    disabled={isUpdating}
                    defaultValue={settings?.appName || ""}
                    onBlur={(e) => handleUpdate("appName", e.target.value)}
                  />
                )}
              </FormField>
              <FormField id="domain" label="Domain">
                {isLoading ? (
                  <Skeleton className="w-md h-8" />
                ) : (
                  <Input
                    tooltipOn={false}
                    placeholder="admin.example.com"
                    className="max-w-md"
                    disabled={isUpdating}
                    defaultValue={settings?.domain || ""}
                    onBlur={(e) => handleUpdate("domain", e.target.value)}
                  />
                )}
              </FormField>
            </CardContent>
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
                <Switch
                  disabled={isUpdating}
                  checked={settings?.twoFactor === "true"}
                  onCheckedChange={(checked) =>
                    handleUpdate("twoFactor", checked)
                  }
                />
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
                <Switch
                  disabled={isUpdating}
                  checked={settings?.emailEnabled === "true"}
                  onCheckedChange={(val) => handleUpdate("emailEnabled", val)}
                />
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
