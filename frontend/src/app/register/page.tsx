"use client";

import { useState, useEffect, useMemo, Suspense } from "react";
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
import { UserPlus, Loader2 } from "lucide-react";
import { GoogleLogin } from "@react-oauth/google";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
import { INSTITUTE_BRANCHES, SEMESTERS } from "@/lib/constants";

const createRegisterSchema = (
  allowedPatterns: string[],
  isSetupComplete: boolean,
) =>
  z.object({
    firstName: z
      .string()
      .min(2, { message: "First name must be at least 2 characters." }),
    lastName: z
      .string()
      .min(2, { message: "Last name must be at least 2 characters." }),
    email: z
      .string()
      .email({ message: "Please enter a valid email address." })
      .superRefine((val, ctx) => {
        if (!isSetupComplete) {
          return; // Allow any email if the system is not yet configured
        }

        if (!allowedPatterns || allowedPatterns.length === 0) {
          // Fallback: Add more default domains here if you want to allow more than one
          const defaultAllowedDomains = [".nitrr.ac.in"];

          const isValidDefault = defaultAllowedDomains.some((domain) =>
            val.endsWith(domain),
          );
          if (!isValidDefault) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message:
                "Please use your valid institute email (e.g. *@*.nitrr.ac.in)",
            });
          }
          return;
        }

        const isValid = allowedPatterns.some((pattern) => {
          // 1. Escape all regex special characters first (like the dots)
          let safePattern = pattern.replace(/[.+?^${}()|[\]\\]/g, "\\$&");
          // 2. Convert the explicitly entered '*' into the regex '.*'
          safePattern = safePattern.replace(/\\\*/g, ".*");

          const regex = new RegExp(`^${safePattern}$`);
          return regex.test(val);
        });

        if (!isValid) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Email does not match allowed institute patterns.",
          });
        }
      }),
    password: z
      .string()
      .min(6, { message: "Password must be at least 6 characters." }),
    rollNumber: z
      .string()
      .min(5, { message: "Please enter a valid roll number." }),
    branch: z.enum(INSTITUTE_BRANCHES as [string, ...string[]], {
      errorMap: () => ({ message: "Please select a valid branch." }),
    }),
    semester: z.coerce
      .number()
      .refine((val) => SEMESTERS.includes(val.toString()), {
        message: "Please select a valid semester.",
      }),
  });

// 1. Rename your main logic to an internal component
function RegisterContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, isAuthenticated, isLoading } = useAuthStore();
  const { allowedEmailPatterns, isSetupComplete } = useConfigStore();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [isRegistrationSuccess, setIsRegistrationSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [googleError, setGoogleError] = useState("");

  const registerSchema = useMemo(
    () => createRegisterSchema(allowedEmailPatterns, isSetupComplete),
    [allowedEmailPatterns, isSetupComplete],
  );
  type RegisterFormValues = z.infer<typeof registerSchema>;

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    mode: "onChange",
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      rollNumber: "",
      branch: "",
      semester: 1,
    },
  });

  useEffect(() => {
    if (isAuthenticated) {
      const redirect = searchParams.get("redirect");
      router.push(redirect ? redirect : "/dashboard");
    }
  }, [isAuthenticated, router, searchParams]);

  const onSubmit = async (data: RegisterFormValues) => {
    setLoading(true);
    setError("");

    try {
      const response = await api.post("/auth/register", data);

      if (!response.data.user.isVerified) {
        // Stop them from logging in automatically
        setSuccessMessage(
          response.data.message ||
            "Registration successful. Please check your email to verify your account.",
        );
        setIsRegistrationSuccess(true);
        return;
      }

      // Auto login for verified users (like the first Super Admin)
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
      setError(err.response?.data?.error || "Registration failed");
    } finally {
      setLoading(false);
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
      setGoogleError(err.response?.data?.error || "Google registration failed");
    } finally {
      setLoading(false);
    }
  };

  if (isLoading || isAuthenticated) {
    return null; // Prevent UI flash while checking auth or redirecting
  }

  if (isRegistrationSuccess) {
    return (
      <Card className="w-full max-w-md border-none shadow-xl">
        <CardHeader className="space-y-1 text-center pb-6">
          <div className="mx-auto bg-green-100 text-green-600 rounded-full p-4 w-16 h-16 flex items-center justify-center mb-4">
            <UserPlus className="h-8 w-8" />
          </div>
          <CardTitle className="text-3xl font-bold tracking-tight text-foreground">
            Check your email
          </CardTitle>
          <CardDescription className="text-muted-foreground mt-2">
            {successMessage}
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
          Create an account
        </CardTitle>
        <CardDescription className="text-muted-foreground">
          Sign up using your institute email to get automatically verified.
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
              <div className="p-3 bg-red-50 text-red-600 text-sm rounded-md border border-red-100">
                {error}
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First Name</FormLabel>
                    <FormControl>
                      <Input placeholder="John" className="h-11" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Last Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Doe" className="h-11" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Institute Email</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="example@nitrr.ac.in"
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
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input type="password" className="h-11" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="rollNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Roll Number</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g. 19111000"
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
                name="semester"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Semester</FormLabel>
                    <Select
                      onValueChange={(val) => field.onChange(Number(val))}
                      defaultValue={field.value?.toString()}
                    >
                      <FormControl>
                        <SelectTrigger className="h-11">
                          <SelectValue placeholder="Select semester" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {SEMESTERS.map((sem) => (
                          <SelectItem key={sem} value={sem}>
                            Semester {sem}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="branch"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Branch / Department</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="h-11">
                        <SelectValue placeholder="Select branch" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {INSTITUTE_BRANCHES.map((b) => (
                        <SelectItem key={b} value={b}>
                          {b}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              className="w-full h-11 text-base font-medium mt-4"
              disabled={loading}
            >
              {loading ? "Creating account..." : "Create Account"}
              {!loading && <UserPlus className="ml-2 h-4 w-4" />}
            </Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="flex flex-col space-y-4 pt-4 border-t border-slate-100">
        <div className="text-sm text-center text-muted-foreground w-full">
          Already have an account?{" "}
          <Link
            href={`/login${searchParams.get("redirect") ? `?redirect=${encodeURIComponent(searchParams.get("redirect")!)}` : ""}`}
            className="text-primary hover:underline font-semibold"
          >
            Sign in
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
}

// 2. Wrap the inner component with a Suspense boundary in your default export
export default function RegisterPage() {
  return (
    <div className="min-h-[calc(100vh-4rem)] bg-background flex items-center justify-center p-4 py-12">
      <Suspense
        fallback={
          <div className="flex items-center justify-center w-full max-w-md h-[500px]">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        }
      >
        <RegisterContent />
      </Suspense>
    </div>
  );
}
