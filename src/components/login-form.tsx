"use client";

import type React from "react";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { EyeIcon, EyeOffIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "@/lib/utils";
import { useAuth, type UserType } from "@/context/auth-context";
import { toast } from "sonner";

export default function LoginForm() {
  const router = useRouter();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    userType: "user" as UserType,
    rememberMe: false,
  });

  const [errors, setErrors] = useState({
    email: "",
    password: "",
    userType: "",
    form: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });

    // Clear error when user starts typing
    if (errors[name as keyof typeof errors]) {
      setErrors({
        ...errors,
        [name]: "",
      });
    }
  };

  const handleUserTypeChange = (value: UserType) => {
    setFormData({
      ...formData,
      userType: value,
    });

    if (errors.userType) {
      setErrors({
        ...errors,
        userType: "",
      });
    }
  };

  const handleCheckboxChange = (checked: boolean) => {
    setFormData({
      ...formData,
      rememberMe: checked,
    });
  };

  const validateForm = () => {
    const newErrors = {
      email: "",
      password: "",
      userType: "",
      form: "",
    };

    let isValid = true;

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
      isValid = false;
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      setIsSubmitting(true);

      try {
        const success = await login(
          formData.email,
          formData.password,
          formData.userType
        );

        if (success) {
          toast.success(`Logged in successfully as ${formData.userType}!`);

          // Redirect based on user type
          if (formData.userType === "instructor") {
            router.push("/instructors");
          } else {
            router.push("/dashboard");
          }
        } else {
          setErrors({
            ...errors,
            form: "Invalid email or password. Please try again.",
          });
        }
      } catch (error) {
        console.error("Login error:", error);
        setErrors({
          ...errors,
          form: "An unexpected error occurred. Please try again.",
        });
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white dark:bg-slate-900 rounded-lg shadow-lg p-6 space-y-4 border border-border"
    >
      {errors.form && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 p-3 rounded-md text-sm">
          {errors.form}
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="email">Email Address</Label>
        <Input
          id="email"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleInputChange}
          className={cn(
            errors.email && "border-red-500 focus-visible:ring-red-500/20"
          )}
          placeholder="you@example.com"
          autoComplete="email"
        />
        {errors.email && (
          <p className="text-red-500 text-sm mt-1">{errors.email}</p>
        )}
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="password">Password</Label>
          <Link
            href="/forgot-password"
            className="text-sm text-primary hover:underline"
          >
            Forgot password?
          </Link>
        </div>
        <div className="relative">
          <Input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            value={formData.password}
            onChange={handleInputChange}
            className={cn(
              errors.password && "border-red-500 focus-visible:ring-red-500/20"
            )}
            placeholder="Enter your password"
            autoComplete="current-password"
          />
          <button
            type="button"
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
            onClick={() => setShowPassword(!showPassword)}
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOffIcon size={18} /> : <EyeIcon size={18} />}
          </button>
        </div>
        {errors.password && (
          <p className="text-red-500 text-sm mt-1">{errors.password}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label>Account Type</Label>
        <RadioGroup
          value={formData.userType}
          onValueChange={(value) => handleUserTypeChange(value as UserType)}
          className="flex flex-col space-y-1"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="user" id="login-user" />
            <Label htmlFor="login-user" className="cursor-pointer">
              Regular User
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="instructor" id="login-instructor" />
            <Label htmlFor="login-instructor" className="cursor-pointer">
              Instructor
            </Label>
          </div>
        </RadioGroup>
        {errors.userType && (
          <p className="text-red-500 text-sm mt-1">{errors.userType}</p>
        )}
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox
          id="rememberMe"
          checked={formData.rememberMe}
          onCheckedChange={handleCheckboxChange}
        />
        <label
          htmlFor="rememberMe"
          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        >
          Remember me for 30 days
        </label>
      </div>

      <Button type="submit" className="w-full mt-6" disabled={isSubmitting}>
        {isSubmitting ? "Logging in..." : "Log In"}
      </Button>

      <div className="text-center mt-4">
        <p className="text-sm text-muted-foreground">
          Don't have an account?{" "}
          <Link
            href="/signup"
            className="text-primary hover:underline font-medium"
          >
            Sign Up
          </Link>
        </p>
      </div>
    </form>
  );
}
