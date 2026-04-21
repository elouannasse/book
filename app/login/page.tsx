"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { useAuth } from "@/context/AuthContext";

type LoginFormValues = {
  email: string;
  password: string;
};

export default function LoginPage() {
  const router = useRouter();
  const { login, isLoading } = useAuth();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError
  } = useForm<LoginFormValues>({ defaultValues: { email: "", password: "" }, mode: "onTouched" });

  const onSubmit = async (values: LoginFormValues) => {
    try {
      const authenticatedUser = await login(values.email.trim(), values.password);

      if (!authenticatedUser) {
        setError("root", { type: "manual", message: "Invalid email or password." });
        return;
      }

      router.push("/");
    } catch (error) {
      setError("root", {
        type: "manual",
        message: error instanceof Error ? error.message : "Login failed"
      });
    }
  };

  return (
    <section className="mx-auto max-w-md rounded-2xl bg-white p-6 shadow-sm ring-1 ring-brand-100">
      <h1 className="text-2xl font-bold text-slate-900">Login</h1>
      <p className="mt-1 text-sm text-slate-600">Welcome back to BooksFinder.</p>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
        <div>
          <input
            type="email"
            placeholder="Email"
            className="w-full rounded-lg border border-brand-100 px-4 py-3 outline-none focus:border-brand-500"
            {...register("email", {
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
            {...register("password", {
              required: "Password is required."
            })}
          />
          {errors.password ? <p className="mt-1 text-sm text-red-600">{errors.password.message}</p> : null}
        </div>

        {errors.root ? <p className="text-sm text-red-600">{errors.root.message}</p> : null}

        <button
          type="submit"
          disabled={isSubmitting || isLoading}
          className="w-full rounded-lg bg-brand-500 px-4 py-3 font-semibold text-white disabled:opacity-50"
        >
          {isSubmitting || isLoading ? "Logging in..." : "Login"}
        </button>
      </form>

      <p className="mt-4 text-sm text-slate-600">
        No account yet? <Link href="/register" className="font-semibold text-brand-700">Register here</Link>
      </p>
    </section>
  );
}
