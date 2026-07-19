"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import Link from "next/link";
import { GraduationCap, User } from "lucide-react";

import { signup } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export function SignupForm() {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      role: "student",
      teacherCode: "",
    },
  });
  const [serverError, setServerError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [isPending, startTransition] = useTransition();
  const role = watch("role");

  const onSubmit = (values) => {
    setServerError(null);
    const formData = new FormData();
    Object.entries(values).forEach(([key, value]) => formData.set(key, value));

    startTransition(async () => {
      const result = await signup(null, formData);
      if (result?.error) {
        setServerError(result.error);
      } else if (result?.success) {
        setSuccessMessage(result.message);
      }
    });
  };

  if (successMessage) {
    return (
      <div className="flex flex-col gap-3 rounded-lg border border-border bg-muted/50 p-4 text-center">
        <p className="text-sm">{successMessage}</p>
        <Link href="/login" className="text-sm underline underline-offset-4">
          Back to login
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
      <div className="grid grid-cols-2 gap-2">
        <RoleOption
          value="student"
          label="Student"
          icon={User}
          register={register}
        />
        <RoleOption
          value="teacher"
          label="Teacher"
          icon={GraduationCap}
          register={register}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="fullName">Full name</Label>
        <Input
          id="fullName"
          autoComplete="name"
          aria-invalid={!!errors.fullName}
          {...register("fullName", { required: true, minLength: 2 })}
        />
        {errors.fullName && (
          <p className="text-sm text-destructive">Enter your full name.</p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          aria-invalid={!!errors.email}
          {...register("email", { required: true })}
        />
        {errors.email && (
          <p className="text-sm text-destructive">Enter a valid email.</p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          autoComplete="new-password"
          aria-invalid={!!errors.password}
          {...register("password", { required: true, minLength: 8 })}
        />
        {errors.password && (
          <p className="text-sm text-destructive">
            Password must be at least 8 characters.
          </p>
        )}
      </div>

      {role === "teacher" && (
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="teacherCode">Teacher access code</Label>
          <Input
            id="teacherCode"
            aria-invalid={!!errors.teacherCode}
            {...register("teacherCode", { required: role === "teacher" })}
          />
          <p className="text-xs text-muted-foreground">
            Ask your school administrator for this code.
          </p>
        </div>
      )}

      {serverError && <p className="text-sm text-destructive">{serverError}</p>}

      <Button type="submit" disabled={isPending} className="w-full h-9">
        {isPending ? "Creating account…" : "Create account"}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link href="/login" className="text-foreground underline underline-offset-4">
          Sign in
        </Link>
      </p>
    </form>
  );
}

function RoleOption({ value, label, icon: Icon, register }) {
  return (
    <label
      className={cn(
        "flex cursor-pointer flex-col items-center gap-1.5 rounded-lg border border-input px-3 py-3 text-sm transition-colors has-checked:border-primary has-checked:bg-primary/5 has-checked:ring-1 has-checked:ring-primary"
      )}
    >
      <input
        type="radio"
        value={value}
        className="sr-only"
        {...register("role", { required: true })}
      />
      <Icon className="size-4" />
      {label}
    </label>
  );
}
