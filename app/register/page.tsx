"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { useAuth } from "@/context/AuthContext";
import { findUserByEmail } from "@/lib/jsonServer";

type RegisterFormValues = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
};

export default function RegisterPage() {
  const router = useRouter();
  const { register, isLoading } = useAuth();
  const {
    register: registerField,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
    watch
  } = useForm<RegisterFormValues>({
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: ""
    },
    mode: "onTouched"
  });

  const password = watch("password");

  const onSubmit = async (values: RegisterFormValues) => {
    try {
      const existingUser = await findUserByEmail(values.email.trim());

      if (existingUser) {
        setError("email", { type: "manual", message: "Email already exists." });
        return;
      }

      await register(values.lastName.trim(), values.firstName.trim(), values.email.trim(), values.password);
      router.push("/login");
    } catch (error) {
      setError("root", {
        type: "manual",
        message: error instanceof Error ? error.message : "Registration failed"
      });
    }
  };

  return (
    <section className="mx-auto max-w-md rounded-2xl bg-white p-6 shadow-sm ring-1 ring-brand-100">
      <h1 className="text-2xl font-bold text-slate-900">Create account</h1>
      <p className="mt-1 text-sm text-slate-600">Join BooksFinder in less than a minute.</p>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <input
              type="text"
              placeholder="First name"
              className="w-full rounded-lg border border-brand-100 px-4 py-3 outline-none focus:border-brand-500"
              {...registerField("firstName", { required: "First name is required." })}
            />
            {errors.firstName ? <p className="mt-1 text-sm text-red-600">{errors.firstName.message}</p> : null}
          </div>

          <div>
            <input
              type="text"
              placeholder="Last name"
              className="w-full rounded-lg border border-brand-100 px-4 py-3 outline-none focus:border-brand-500"
              {...registerField("lastName", { required: "Last name is required." })}
            />
            {errors.lastName ? <p className="mt-1 text-sm text-red-600">{errors.lastName.message}</p> : null}
          </div>
        </div>

        <div>
          <input
            type="email"
            placeholder="Email"
            className="w-full rounded-lg border border-brand-100 px-4 py-3 outline-none focus:border-brand-500"
            {...registerField("email", {
              required: "Email is required.",
              pattern: {
                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: "Enter a valid email address."
              }
            })}
          />
          {errors.email ? <p className="mt-1 text-sm text-red-600">{errors.email.message}</p> : null}
        </div>

        <div>
          <input
            type="password"
            placeholder="Password"
            className="w-full rounded-lg border border-brand-100 px-4 py-3 outline-none focus:border-brand-500"
            {...registerField("password", {
              required: "Password is required.",
              minLength: {
                value: 8,
                message: "Password must be at least 8 characters."
              }
            })}
          />
          {errors.password ? <p className="mt-1 text-sm text-red-600">{errors.password.message}</p> : null}
        </div>

        <div>
          <input
            type="password"
            placeholder="Confirm password"
            className="w-full rounded-lg border border-brand-100 px-4 py-3 outline-none focus:border-brand-500"
            {...registerField("confirmPassword", {
              required: "Please confirm your password.",
              validate: (value) => value === password || "Passwords do not match."
            })}
          />
          {errors.confirmPassword ? <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p> : null}
        </div>

        {errors.root ? <p className="text-sm text-red-600">{errors.root.message}</p> : null}

        <button
          type="submit"
          disabled={isSubmitting || isLoading}
          className="w-full rounded-lg bg-brand-500 px-4 py-3 font-semibold text-white disabled:opacity-50"
        >
          {isSubmitting || isLoading ? "Creating account..." : "Register"}
        </button>
      </form>

      <p className="mt-4 text-sm text-slate-600">
        Already have an account? <Link href="/login" className="font-semibold text-brand-700">Login</Link>
      </p>
    </section>
  );
}
