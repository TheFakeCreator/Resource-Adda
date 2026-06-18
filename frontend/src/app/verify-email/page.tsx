"use client";

import { useEffect, useState, Suspense } from "react";
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
import { Loader2, CheckCircle, XCircle } from "lucide-react";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading",
  );
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("No verification token provided.");
      return;
    }

    const verifyToken = async () => {
      try {
        const response = await api.post("/auth/verify-email", { token });
        setStatus("success");
        setMessage(response.data.message || "Email successfully verified!");
      } catch (err: any) {
        setStatus("error");
        setMessage(
          err.response?.data?.error || "Invalid or expired verification token.",
        );
      }
    };

    verifyToken();
  }, [token]);

  return (
    <Card className="w-full max-w-md border-none shadow-xl">
      <CardHeader className="space-y-1 text-center pb-6">
        <div className="mx-auto flex items-center justify-center mb-4">
          {status === "loading" && (
            <Loader2 className="h-16 w-16 animate-spin text-primary" />
          )}
          {status === "success" && (
            <CheckCircle className="h-16 w-16 text-green-500" />
          )}
          {status === "error" && <XCircle className="h-16 w-16 text-red-500" />}
        </div>
        <CardTitle className="text-3xl font-bold tracking-tight text-foreground">
          {status === "loading" && "Verifying Email"}
          {status === "success" && "Verification Successful"}
          {status === "error" && "Verification Failed"}
        </CardTitle>
        <CardDescription className="text-muted-foreground mt-2">
          {status === "loading" &&
            "Please wait while we verify your email address..."}
          {(status === "success" || status === "error") && message}
        </CardDescription>
      </CardHeader>
      <CardFooter className="flex flex-col space-y-4 pt-4 border-t border-slate-100">
        {status === "success" && (
          <Link href="/login" className="w-full">
            <Button className="w-full h-11 text-base font-medium">
              Continue to Login
            </Button>
          </Link>
        )}
        {status === "error" && (
          <Link href="/login" className="w-full">
            <Button
              variant="outline"
              className="w-full h-11 text-base font-medium"
            >
              Go to Login
            </Button>
          </Link>
        )}
      </CardFooter>
    </Card>
  );
}

export default function VerifyEmailPage() {
  return (
    <div className="min-h-[calc(100vh-4rem)] bg-background flex items-center justify-center p-4 py-12">
      <Suspense
        fallback={
          <div className="flex items-center justify-center w-full max-w-md h-[300px]">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        }
      >
        <VerifyEmailContent />
      </Suspense>
    </div>
  );
}
