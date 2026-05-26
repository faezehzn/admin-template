"use client";

import { FormField } from "@/components/shared/formField";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { useErrorToast } from "@/hooks/useCustomToasts";
import { Camera, Mail, Save, Shield, User } from "lucide-react";
import { useSession } from "next-auth/react";
import { useRef, useState } from "react";

const maxSizeMB = 5 * 1024 * 1024; // 5MB

export default function ProfilePage() {
  const { show: showErrorToast } = useErrorToast();
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(
    session?.user.avatar ?? null,
  );
  const inputRef = useRef<HTMLInputElement>(null);
  const [passwords, setPasswords] = useState({
    current: "",
    new: "",
    confirm: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    if (!file) return;

    if (file.size > maxSizeMB * 1024 * 1024) {
      showErrorToast(`The maximum file size must be less than ${maxSizeMB}MB.`);
      return;
    }

    if (!file.type.startsWith("image/")) {
      showErrorToast("Only image files are allowed.");
      return;
    }

    handleImageChange(file);
  };

  // upload profile img (API call)
  const handleImageChange = (file: File | null) => {
    if (!file) return;

    // API call to upload the file would go here. For now, we just set the preview.

    const reader = new FileReader();
    reader.onload = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => setLoading(false), 1000);
  };

  const handlePasswordChange = async () => {
    if (passwords.new !== passwords.confirm) {
      showErrorToast("New passwords do not match!");
      return;
    }
    if (passwords.new.length < 6) {
      showErrorToast("Password must be at least 6 characters.");
      return;
    }

    // call API
    // toast.success("Password updated successfully!");
  };

  return (
    <div className="space-y-3 md:space-y-6 w-full text-primary-700 ">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Profile</h1>
        <p className="text-diactive">
          Manage your personal information and account settings.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-12 pb-4">
        {/* Left Column: Avatar & Summary */}
        <Card className="md:col-span-4 h-fit">
          <CardContent>
            <div className="flex flex-col items-center text-center space-y-3">
              <div className="relative">
                <Avatar className="h-24 w-24 border-2 border-primary-100">
                  <AvatarImage src={imagePreview ?? undefined} />
                  <AvatarFallback className="bg-primary-50 text-primary-600 text-2xl font-bold uppercase">
                    {session?.user.name
                      ? session?.user.name.charAt(0)
                      : session?.user.email.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <Button
                  size="icon"
                  variant="outline"
                  onClick={() => inputRef.current?.click()}
                  className="absolute bottom-0 right-0 rounded-full h-8 w-8 bg-background shadow-sm"
                >
                  <Camera size={14} />
                </Button>
                <input
                  ref={inputRef}
                  type="file"
                  accept={"image/*"}
                  className="hidden"
                  onChange={handleInputChange}
                />
              </div>

              <h3 className="text-xl font-semibold">{session?.user.name}</h3>

              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary" className="capitalize">
                  {session?.user.status}
                </Badge>
                <Badge
                  variant="outline"
                  className="border-primary-200 text-primary-700"
                >
                  {session?.user.role} Access
                </Badge>
              </div>
            </div>

            <Separator className="my-4" />

            <div className="space-y-2">
              <div className="flex gap-2 text-sm">
                <Mail size={16} className="text-primary-400" />
                <span>{session?.user.email}</span>
              </div>
              {session?.user.role === "admin" && (
                <div className="flex gap-2 text-sm">
                  <Shield size={16} className="text-primary-400" />
                  <span>Superuser Status</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Right Column: Edit Forms */}
        <div className="md:col-span-8 space-y-4">
          {/* General Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <User size={18} /> General Information
              </CardTitle>
              <CardDescription>
                Update your public profile details.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUpdate} className="space-y-4">
                <div className="flex flex-col lg:flex-row gap-4">
                  <FormField id="username" label="Username">
                    <Input
                      id="username"
                      defaultValue={session?.user.name}
                      className="bg-primary-50/50"
                      tooltipOn={false}
                    />
                  </FormField>
                  <FormField id="email" label="Email Address">
                    <Input
                      id="email"
                      type="email"
                      tooltipOn={false}
                      defaultValue={session?.user.email}
                      className="bg-primary-50/50"
                    />
                  </FormField>
                </div>
                <FormField id="bio" label="Bio / About">
                  <Textarea
                    id="bio"
                    placeholder="Tell us about yourself..."
                    className="bg-primary-50/50"
                  />
                </FormField>
                <Button type="submit" disabled={loading} className="gap-2">
                  <Save size={16} />
                  {loading ? "Saving..." : "Save Changes"}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Password Change Section (Django-like) */}
          <Card className="border border-error/20">
            <CardHeader>
              <CardTitle className="text-lg">Security</CardTitle>
              <CardDescription>
                Update your password to keep your account secure.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <FormField
                  id="current-password"
                  label="Current Password"
                  className="space-y-1"
                >
                  <Input
                    id="current-password"
                    type="password"
                    className="bg-primary-50/50"
                    onChange={(e) =>
                      setPasswords({ ...passwords, current: e.target.value })
                    }
                    tooltipOn={false}
                  />
                </FormField>
                <FormField id="new-password" label="New Password">
                  <Input
                    onChange={(e) =>
                      setPasswords({ ...passwords, new: e.target.value })
                    }
                    id="new-password"
                    type="password"
                    className="bg-primary-50/50"
                    tooltipOn={false}
                  />
                </FormField>
                <FormField id="confirm-password" label="Confirm New Password">
                  <Input
                    id="confirm-password"
                    type="password"
                    className="bg-primary-50/50"
                    onChange={(e) =>
                      setPasswords({ ...passwords, confirm: e.target.value })
                    }
                    tooltipOn={false}
                  />
                </FormField>
                <Button
                  variant="outline"
                  onClick={handlePasswordChange}
                  className="text-error hover:bg-error/10 border-error/50 hover:text-error/80"
                >
                  Change Password
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
