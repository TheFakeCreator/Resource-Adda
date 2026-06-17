"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import api from "@/lib/api";
import { useAuthStore } from "@/store/useAuthStore";
import { useConfigStore } from "@/store/useConfigStore";
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
import { LogIn, Loader2 } from "lucide-react";
import { GoogleLogin } from "@react-oauth/google";

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

const loginSchema = z.object({
  email: z
    .string()
    .email({ message: "Please enter a valid email address." })
    .max(100, { message: "Email too long" }),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters." })
    .max(100, { message: "Password too long" }),
});

type LoginFormValues = z.infer<typeof loginSchema>;

// 1. Rename your main logic to an internal component
function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, isAuthenticated, isLoading } = useAuthStore();
  const { isSetupComplete } = useConfigStore();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [unverifiedEmail, setUnverifiedEmail] = useState("");
  const [resendStatus, setResendStatus] = useState("");
  const [googleError, setGoogleError] = useState("");

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    mode: "onChange",
    defaultValues: {
      email: "",
      password: "",
    },
  });

  useEffect(() => {
    if (isAuthenticated) {
      const redirect = searchParams.get("redirect");
      router.push(redirect ? redirect : "/dashboard");
    }
  }, [isAuthenticated, router, searchParams]);

  const onSubmit = async (data: LoginFormValues) => {
    setLoading(true);
    setError("");
    setUnverifiedEmail("");
    setResendStatus("");

    try {
      const response = await api.post("/auth/login", data);
      login(response.data.token, response.data.user);

      if (response.data.user.role === "super_admin") {
        const setupRes = await api.get("/setup/status");
        if (!setupRes.data.isSetupComplete) {
          router.push("/setup");
          return;
        }
      } else if (
        !response.data.user.rollNumber ||
        !response.data.user.branch ||
        !response.data.user.semester
      ) {
        router.push("/complete-profile");
        return;
      }

      const redirect = searchParams.get("redirect");
      router.push(redirect ? redirect : "/dashboard");
    } catch (err: any) {
      setError(err.response?.data?.error || "Login failed");
      if (
        err.response?.data?.isVerified === false &&
        err.response?.data?.email
      ) {
        setUnverifiedEmail(err.response.data.email);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResendEmail = async () => {
    try {
      setResendStatus("Sending...");
      await api.post("/auth/resend-verification", { email: unverifiedEmail });
      setResendStatus("Email sent!");
    } catch (err: any) {
      setResendStatus(err.response?.data?.error || "Failed to send email");
    }
  };

  const handleGoogleSuccess = async (credentialResponse: any) => {
    setLoading(true);
    setError("");
    setGoogleError("");
    try {
      const response = await api.post("/auth/google", {
        credential: credentialResponse.credential,
      });
      login(response.data.token, response.data.user);

      if (response.data.user.role === "super_admin") {
        const setupRes = await api.get("/setup/status");
        if (!setupRes.data.isSetupComplete) {
          router.push("/setup");
          return;
        }
      } else if (
        !response.data.user.rollNumber ||
        !response.data.user.branch ||
        !response.data.user.semester
      ) {
        router.push("/complete-profile");
        return;
      }

      const redirect = searchParams.get("redirect");
      router.push(redirect ? redirect : "/dashboard");
    } catch (err: any) {
      setGoogleError(err.response?.data?.error || "Google login failed");
    } finally {
      setLoading(false);
    }
  };

  if (isLoading || isAuthenticated) {
    return null; // Prevent UI flash while checking auth or redirecting
  }

  return (
    <Card className="w-full max-w-md border-none shadow-xl">
      <CardHeader className="space-y-1 text-center pb-6">
        <CardTitle className="text-3xl font-bold tracking-tight text-foreground">
          Welcome back
        </CardTitle>
        <CardDescription className="text-muted-foreground">
          Enter your email and password to access your account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-center text-sm text-muted-foreground mb-6">
          <span className="font-semibold text-primary">Note:</span>{" "}
          {isSetupComplete
            ? "Only institute emails (e.g., @nitrr.ac.in) are allowed."
            : "First user registration is unrestricted for setup."}
        </div>

        {googleError && (
          <div className="p-3 mb-4 bg-red-50 text-red-600 text-sm rounded-md border border-red-100">
            {googleError}
          </div>
        )}

        <div className="flex justify-center mb-6">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={() => {
              setGoogleError("Google Login Failed");
            }}
            useOneTap
          />
        </div>

        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-slate-200" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">
              Or continue with email
            </span>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {error && (
              <div className="p-3 bg-red-50 text-red-600 text-sm rounded-md border border-red-100 flex flex-col space-y-2">
                <div>{error}</div>
                {unverifiedEmail && (
                  <div className="pt-2 border-t border-red-200">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleResendEmail}
                      className="w-full text-red-600 border-red-200 hover:bg-red-50"
                    >
                      {resendStatus || "Resend Verification Email"}
                    </Button>
                  </div>
                )}
              </div>
            )}

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="m.bluth@example.com"
                      className="h-11"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center justify-between">
                    <FormLabel>Password</FormLabel>
                    <Link
                      href="/forgot-password"
                      className="text-sm text-primary hover:underline font-medium"
                    >
                      Forgot password?
                    </Link>
                  </div>
                  <FormControl>
                    <Input type="password" className="h-11" {...field} />
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
              {loading ? "Signing in..." : "Sign In"}
              {!loading && <LogIn className="ml-2 h-4 w-4" />}
            </Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="flex flex-col space-y-4 pt-4 border-t border-slate-100">
        <div className="text-sm text-center text-muted-foreground w-full">
          Don't have an account?{" "}
          <Link
            href={`/register${searchParams.get("redirect") ? `?redirect=${encodeURIComponent(searchParams.get("redirect")!)}` : ""}`}
            className="text-primary hover:underline font-semibold"
          >
            Sign up
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
}

// 2. Wrap the inner component with a Suspense boundary in your default export
export default function LoginPage() {
  return (
    <div className="min-h-[calc(100vh-4rem)] bg-background flex items-center justify-center p-4">
      <Suspense
        fallback={
          <div className="flex items-center justify-center w-full max-w-md h-[400px]">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        }
      >
        <LoginContent />
      </Suspense>
    </div>
  );
}
