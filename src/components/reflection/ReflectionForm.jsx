"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { ChevronLeft } from "lucide-react";

import { submitReflection } from "@/actions/reflections";
import { LikertScale } from "./LikertScale";
import { NeedIcon } from "@/components/shared/NeedIcon";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { EmptyState } from "@/components/shared/EmptyState";

export function ReflectionForm({ questions }) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [commentOpen, setCommentOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  if (questions.length === 0) {
    return (
      <EmptyState
        title="No questions available"
        description="Ask your teacher or admin to add reflection questions."
      />
    );
  }

  const question = questions[step];
  const currentAnswer = answers[question.id] ?? {};
  const isLast = step === questions.length - 1;
  const canAdvance = currentAnswer.score != null;
  const commentVisible = commentOpen || Boolean(currentAnswer.comment);

  const setScore = (score) => {
    setAnswers((prev) => ({
      ...prev,
      [question.id]: { ...prev[question.id], score },
    }));
  };

  const setComment = (comment) => {
    setAnswers((prev) => ({
      ...prev,
      [question.id]: { ...prev[question.id], comment },
    }));
  };

  const goBack = () => {
    setCommentOpen(false);
    setStep((s) => Math.max(0, s - 1));
  };

  const goNext = () => {
    if (!canAdvance) return;

    if (!isLast) {
      setCommentOpen(false);
      setStep((s) => s + 1);
      return;
    }

    const payload = questions.map((q) => ({
      questionId: q.id,
      needId: q.need_id,
      score: answers[q.id].score,
      comment: answers[q.id].comment?.trim() || null,
    }));

    startTransition(async () => {
      const result = await submitReflection(payload);
      if (result?.error) {
        toast.error(result.error);
        return;
      }
      toast.success("Reflection submitted — thanks!");
    });
  };

  return (
    <div className="mx-auto flex w-full max-w-md flex-col items-center gap-6 py-4">
      <div className="flex w-full items-center justify-between">
        <button
          type="button"
          onClick={goBack}
          disabled={step === 0}
          className="flex items-center gap-1 text-sm text-muted-foreground transition-opacity disabled:pointer-events-none disabled:opacity-0"
        >
          <ChevronLeft className="size-4" /> Back
        </button>
        <span className="text-xs text-muted-foreground">
          Question {step + 1} of {questions.length}
        </span>
      </div>

      <div className="h-1 w-full overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-primary transition-all"
          style={{ width: `${((step + 1) / questions.length) * 100}%` }}
        />
      </div>

      <NeedIcon need={question.needs} size="lg" />

      <div className="text-center">
        <h2
          className="text-base font-semibold"
          style={{ color: question.needs?.color }}
        >
          {question.needs?.label}
        </h2>
        <p className="mt-2 text-lg leading-snug">{question.prompt}</p>
      </div>

      <LikertScale value={currentAnswer.score} onChange={setScore} />

      {commentVisible ? (
        <Textarea
          autoFocus
          placeholder="Anything you want to add?"
          value={currentAnswer.comment ?? ""}
          onChange={(e) => setComment(e.target.value)}
          className="w-full"
          rows={2}
        />
      ) : (
        <button
          type="button"
          onClick={() => setCommentOpen(true)}
          className="text-sm text-muted-foreground underline underline-offset-4"
        >
          + Add a comment
        </button>
      )}

      <Button
        onClick={goNext}
        disabled={!canAdvance || isPending}
        className="h-10 w-full"
      >
        {isPending ? "Submitting…" : isLast ? "Submit reflection" : "Next"}
      </Button>
    </div>
  );
}
