"use client";

import { useState } from "react";
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
import { Mail, ArrowLeft, Send, CheckCircle2 } from "lucide-react";

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

const forgotPasswordSchema = z.object({
  email: z
    .string()
    .email({ message: "Please enter a valid email address." })
    .max(100, { message: "Email too long" }),
});

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const form = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    mode: "onChange",
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (data: ForgotPasswordFormValues) => {
    setLoading(true);
    setError("");

    try {
      await api.post("/auth/forgot-password", data);
      setSuccess(true);
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to send reset email");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-none shadow-xl">
          <CardHeader className="space-y-1 text-center pb-6">
            <div className="mx-auto bg-green-100 text-green-600 rounded-full p-4 w-16 h-16 flex items-center justify-center mb-4">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <CardTitle className="text-3xl font-bold tracking-tight text-foreground">
              Check your email
            </CardTitle>
            <CardDescription className="text-muted-foreground mt-2">
              If an account exists for that email, we have sent password reset
              instructions.
            </CardDescription>
          </CardHeader>
          <CardFooter className="flex flex-col space-y-4 pt-4 border-t border-slate-100">
            <Link href="/login" className="w-full">
              <Button className="w-full h-11 text-base font-medium">
                Return to Login
              </Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-none shadow-xl">
        <CardHeader className="space-y-1 text-center pb-6">
          <CardTitle className="text-3xl font-bold tracking-tight text-foreground">
            Forgot Password
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Enter your email address and we'll send you a link to reset your
            password.
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
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                        <Input
                          placeholder="m.bluth@example.com"
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
                {loading ? "Sending link..." : "Send Reset Link"}
                {!loading && <Send className="ml-2 h-4 w-4" />}
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4 pt-4 border-t border-slate-100">
          <Link
            href="/login"
            className="w-full text-center text-sm text-muted-foreground hover:text-primary transition-colors flex items-center justify-center"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to login
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
