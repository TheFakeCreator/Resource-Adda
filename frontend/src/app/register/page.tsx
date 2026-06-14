"use client";

import { useState, useEffect, useMemo } from "react";
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

const createRegisterSchema = (allowedPatterns: string[]) =>
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
        if (!allowedPatterns || allowedPatterns.length === 0) {
          // Default fallback
          if (!val.endsWith(".nitrr.ac.in")) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message:
                "Please use your valid institute email (e.g. *@*.nitrr.ac.in)",
            });
          }
          return;
        }

        const isValid = allowedPatterns.some((pattern) => {
          const regexStr = pattern.replace(/\*/g, ".*");
          const regex = new RegExp(`^${regexStr}$`);
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
    branch: z
      .string()
      .min(2, { message: "Please enter your branch/department." }),
    semester: z.coerce
      .number()
      .min(1, { message: "Must be between 1 and 10" })
      .max(10, { message: "Must be between 1 and 10" }),
  });

export default function RegisterPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, isAuthenticated, isLoading } = useAuthStore();
  const { allowedEmailPatterns } = useConfigStore();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const registerSchema = useMemo(
    () => createRegisterSchema(allowedEmailPatterns),
    [allowedEmailPatterns],
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
      login(response.data.token, response.data.user);

      if (response.data.user.role === "super_admin") {
        router.push("/setup");
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

  if (isLoading || isAuthenticated) {
    return null; // Prevent UI flash while checking auth or redirecting
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-background flex items-center justify-center p-4 py-12">
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
                      <FormControl>
                        <Input
                          type="number"
                          min="1"
                          max="10"
                          placeholder="e.g. 3"
                          className="h-11"
                          {...field}
                        />
                      </FormControl>
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
                    <FormControl>
                      <Input
                        placeholder="e.g. Computer Science"
                        className="h-11"
                        {...field}
                      />
                    </FormControl>
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
    </div>
  );
}
