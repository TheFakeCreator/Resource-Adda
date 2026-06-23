"use client";

import { useState } from "react";
import { Flag, AlertTriangle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "./dialog";
import { Button } from "./button";
import { Label } from "./label";
import { Textarea } from "./textarea";
import { RadioGroup, RadioGroupItem } from "@radix-ui/react-radio-group";
import api from "@/lib/api";

const REPORT_REASONS = [
  { id: "spam", label: "Spam or misleading" },
  { id: "harassment", label: "Harassment or bullying" },
  { id: "inappropriate", label: "Inappropriate content" },
  { id: "plagiarism", label: "Plagiarism / Copyright Violation" },
  { id: "other", label: "Other" },
];

export function ReportModal({
  itemId,
  itemModel,
  triggerButton,
}: {
  itemId: string;
  itemModel: string;
  triggerButton?: React.ReactElement;
}) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState(REPORT_REASONS[0].label);
  const [customReason, setCustomReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const finalReason = reason === "Other" ? customReason : reason;

    if (reason === "Other" && !customReason.trim()) {
      setError("Please provide a reason");
      setLoading(false);
      return;
    }

    try {
      await api.post("/moderation/report", {
        itemId,
        itemModel,
        reason: finalReason,
      });
      setSuccess(true);
      setTimeout(() => setOpen(false), 2000);
    } catch (err: any) {
      setError(
        err.response?.data?.error ||
          "Failed to submit report. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      setTimeout(() => {
        setSuccess(false);
        setError("");
        setReason(REPORT_REASONS[0].label);
        setCustomReason("");
      }, 200);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger
        render={
          triggerButton || (
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-destructive"
            >
              <Flag className="h-4 w-4 mr-2" />
              Report
            </Button>
          )
        }
      />
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            Report Content
          </DialogTitle>
          <DialogDescription>
            Help us keep the community safe. What is wrong with this content?
          </DialogDescription>
        </DialogHeader>

        {success ? (
          <div className="py-6 text-center text-green-500 flex flex-col items-center gap-2">
            <div className="h-12 w-12 rounded-full bg-green-500/10 flex items-center justify-center">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <p className="font-medium mt-2">Report Submitted</p>
            <p className="text-sm text-muted-foreground">
              Our moderation team will review this shortly.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-6 pt-4">
            <div className="space-y-4">
              {REPORT_REASONS.map((r) => (
                <div key={r.id} className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id={r.id}
                    name="reason"
                    value={r.label}
                    checked={reason === r.label}
                    onChange={(e) => setReason(e.target.value)}
                    className="h-4 w-4 text-primary focus:ring-primary border-white/20 bg-transparent"
                  />
                  <Label htmlFor={r.id} className="font-normal cursor-pointer">
                    {r.label}
                  </Label>
                </div>
              ))}
            </div>

            {reason === "Other" && (
              <div className="space-y-2">
                <Label htmlFor="customReason">Additional Details</Label>
                <Textarea
                  id="customReason"
                  placeholder="Please provide more details..."
                  value={customReason}
                  onChange={(e) => setCustomReason(e.target.value)}
                  className="resize-none"
                />
              </div>
            )}

            {error && (
              <p className="text-sm text-destructive font-medium">{error}</p>
            )}

            <DialogFooter className="mt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button type="submit" variant="destructive" disabled={loading}>
                {loading ? "Submitting..." : "Submit Report"}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
