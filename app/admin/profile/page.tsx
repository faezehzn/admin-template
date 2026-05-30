"use client";

import { FormField } from "@/components/shared/formField";
import { Skeleton } from "@/components/shared/skeleton";
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
import { useErrorToast, useSuccessToast } from "@/hooks/useCustomToasts";
import { handleError } from "@/lib/errorHandler";
import {
  useChangePasswordMutation,
  useGetProfileQuery,
  useUpdateProfileMutation,
} from "@/stores/profileApi";
import { Camera, Mail, Save, Shield, User } from "lucide-react";
import { useSession } from "next-auth/react";
import { useEffect, useRef, useState } from "react";

const maxSizeMB = 5 * 1024 * 1024; // 5MB

export default function ProfilePage() {
  const { show: showError } = useErrorToast();
  const { show: showSuccess } = useSuccessToast();
  const { data: session, update, status } = useSession();
  const [imagePreview, setImagePreview] = useState<string | null>(
    session?.user.avatar ?? null,
  );
  const inputRef = useRef<HTMLInputElement>(null);
  const [passwords, setPasswords] = useState({
    current: "",
    new: "",
    confirm: "",
  });
  const [form, setForm] = useState({
    name: "",
    email: "",
    bio: "",
    avatar: "",
  });

  const { data, isLoading } = useGetProfileQuery();
  const [updateProfile, { isLoading: isLoadingUpdate }] =
    useUpdateProfileMutation();
  const [changePassword, { isLoading: isLoadingPassword }] =
    useChangePasswordMutation();

  useEffect(() => {
    if (data) {
      setForm({
        name: data.name ?? "",
        email: data.email ?? "",
        bio: data.bio ?? "",
        avatar: data.avatar ?? "",
      });

      setImagePreview(data.avatar ?? null);
    }
  }, [data]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    if (!file) return;

    if (file.size > maxSizeMB * 1024 * 1024) {
      showError(`The maximum file size must be less than ${maxSizeMB}MB.`);
      return;
    }

    if (!file.type.startsWith("image/")) {
      showError("Only image files are allowed.");
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

    try {
      await updateProfile(form).unwrap();

      await update();
      showSuccess("Profile updated successfully");
    } catch (error) {
      handleError({ error, showError });
    }
  };

  const handlePasswordChange = async () => {
    if (passwords.new !== passwords.confirm) {
      showError("New passwords do not match!");
      return;
    }
    if (passwords.new.length < 6) {
      showError("Password must be at least 6 characters.");
      return;
    }

    try {
      await changePassword({
        currentPassword: passwords.current,
        newPassword: passwords.new,
      }).unwrap();

      showSuccess("Password updated successfully");
      setPasswords({
        current: "",
        new: "",
        confirm: "",
      });
    } catch (error) {
      handleError({ error, showError });
    }
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
                    {isLoading ? (
                      <Skeleton className="h-20 w-20 rounded-full" />
                    ) : form.name ? (
                      form.name.charAt(0)
                    ) : (
                      form.email.charAt(0)
                    )}
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

              <h3 className="text-lg font-semibold">
                {" "}
                {isLoading ? (
                  <Skeleton className="w-24 h-6" />
                ) : (
                  (form.name ?? form.email)
                )}
              </h3>

              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary" className="capitalize">
                  {status === "loading" ? (
                    <Skeleton className="w-10 h-4" />
                  ) : (
                    session?.user.status
                  )}
                </Badge>
                <Badge
                  variant="outline"
                  className="border-primary-200 text-primary-700"
                >
                  {status === "loading" ? (
                    <Skeleton className="w-14 h-4" />
                  ) : (
                    `${session?.user.role} Access`
                  )}
                </Badge>
              </div>
            </div>

            <Separator className="my-4" />

            <div className="space-y-2">
              <div className="flex gap-2 text-sm">
                <Mail size={16} className="text-primary-400" />
                <span>
                  {status === "loading" ? (
                    <Skeleton className="w-20 h-5" />
                  ) : (
                    session?.user.email
                  )}
                </span>
              </div>
              {session && session?.user.roleLevel > 50 && (
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
                    {isLoading ? (
                      <Skeleton className="w-full h-8" />
                    ) : (
                      <Input
                        id="username"
                        value={form.name}
                        className="bg-primary-50/50"
                        tooltipOn={false}
                        onChange={(e) =>
                          setForm((prev) => ({
                            ...prev,
                            name: e.target.value,
                          }))
                        }
                      />
                    )}
                  </FormField>
                  <FormField id="email" label="Email Address">
                    {isLoading ? (
                      <Skeleton className="w-full h-8" />
                    ) : (
                      <Input
                        id="email"
                        type="email"
                        value={form.email}
                        className="bg-primary-50/50"
                        tooltipOn={false}
                        onChange={(e) =>
                          setForm((prev) => ({
                            ...prev,
                            email: e.target.value,
                          }))
                        }
                      />
                    )}
                  </FormField>
                </div>
                <FormField id="bio" label="Bio / About">
                  {isLoading ? (
                    <Skeleton className="w-full h-20" />
                  ) : (
                    <Textarea
                      id="bio"
                      placeholder="Tell us about yourself..."
                      className="bg-primary-50/50"
                      value={form.bio}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          bio: e.target.value,
                        }))
                      }
                    />
                  )}
                </FormField>
                <Button
                  type="submit"
                  disabled={isLoadingUpdate}
                  className="gap-2"
                >
                  <Save size={16} />
                  {isLoadingUpdate ? "Saving..." : "Save Changes"}
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
                    value={passwords.current}
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
                    value={passwords.new}
                    className="bg-primary-50/50"
                    tooltipOn={false}
                  />
                </FormField>
                <FormField id="confirm-password" label="Confirm New Password">
                  <Input
                    id="confirm-password"
                    type="password"
                    value={passwords.confirm}
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
                  disabled={isLoadingPassword}
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
