"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import api from "@/lib/api";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { KeyRound, CheckCircle2, Loader2 } from "lucide-react";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(6, { message: "Password must be at least 6 characters." })
      .max(100, { message: "Password too long" }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const form = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    mode: "onChange",
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: ResetPasswordFormValues) => {
    if (!token) {
      setError(
        "No reset token provided. Please request a new password reset link.",
      );
      return;
    }

    setLoading(true);
    setError("");

    try {
      await api.post("/auth/reset-password", {
        token,
        newPassword: data.password,
      });
      setSuccess(true);
    } catch (err: any) {
      setError(
        err.response?.data?.error ||
          "Failed to reset password. The link may have expired.",
      );
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <Card className="w-full max-w-md border-none shadow-xl">
        <CardHeader className="space-y-1 text-center pb-6">
          <CardTitle className="text-2xl font-bold tracking-tight text-foreground text-red-600">
            Invalid Link
          </CardTitle>
          <CardDescription className="text-muted-foreground mt-2">
            No reset token was found in the URL. Please request a new password
            reset link.
          </CardDescription>
        </CardHeader>
        <CardFooter>
          <Link href="/forgot-password" className="w-full">
            <Button className="w-full">Request New Link</Button>
          </Link>
        </CardFooter>
      </Card>
    );
  }

  if (success) {
    return (
      <Card className="w-full max-w-md border-none shadow-xl">
        <CardHeader className="space-y-1 text-center pb-6">
          <div className="mx-auto bg-green-100 text-green-600 rounded-full p-4 w-16 h-16 flex items-center justify-center mb-4">
            <CheckCircle2 className="h-8 w-8" />
          </div>
          <CardTitle className="text-3xl font-bold tracking-tight text-foreground">
            Password Reset!
          </CardTitle>
          <CardDescription className="text-muted-foreground mt-2">
            Your password has been successfully reset. You can now log in with
            your new password.
          </CardDescription>
        </CardHeader>
        <CardFooter className="flex flex-col space-y-4 pt-4 border-t border-slate-100">
          <Link href="/login" className="w-full">
            <Button className="w-full h-11 text-base font-medium">
              Go to Login
            </Button>
          </Link>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md border-none shadow-xl">
      <CardHeader className="space-y-1 text-center pb-6">
        <CardTitle className="text-3xl font-bold tracking-tight text-foreground">
          Set New Password
        </CardTitle>
        <CardDescription className="text-muted-foreground">
          Please enter your new password below.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {error && (
              <div className="p-3 bg-red-50 text-red-600 text-sm rounded-md border border-red-100">
                {error}
              </div>
            )}

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>New Password</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <KeyRound className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                      <Input
                        type="password"
                        placeholder="••••••••"
                        className="h-11 pl-10"
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm New Password</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <KeyRound className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                      <Input
                        type="password"
                        placeholder="••••••••"
                        className="h-11 pl-10"
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              className="w-full h-11 text-base font-medium mt-2"
              disabled={loading}
            >
              {loading ? "Resetting..." : "Reset Password"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-[calc(100vh-4rem)] bg-background flex items-center justify-center p-4 py-12">
      <Suspense
        fallback={
          <div className="flex items-center justify-center w-full max-w-md h-[400px]">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        }
      >
        <ResetPasswordContent />
      </Suspense>
    </div>
  );
}
