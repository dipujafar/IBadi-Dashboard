"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Lock, Eye, EyeOff } from "lucide-react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import LogoSection from "../LogoSection";
import { useRouter } from "next/navigation";

import { toast } from "sonner";
import { useResetPasswordMutation } from "@/redux/api/authApi";
import { ResetPasswordFormValues, resetPasswordSchema } from "./schema";

export function ResetPasswordForm() {
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [resetPass, { isLoading }] = useResetPasswordMutation();

  const form = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      newPassword: "",
      confirmPassword: "",
    },
  });
  const router = useRouter();

  const onSubmit = async (values: ResetPasswordFormValues) => {
    const formattedData = { newPassword: values.newPassword, confirmPassword: values.confirmPassword };
    try {
      await resetPass(formattedData).unwrap();
      sessionStorage.removeItem("resetPasswordToken");
      toast.success("Password reset successfully");
      router.push("/login");
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to reset password");
    }
  }


  return (
    <div className="flex-1 bg-gray-50 h-screen flex flex-col items-center justify-center px-12">
      <div className="w-full bg-white max-w-xl space-y-5 lg:p-10 p-4 rounded-md">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-bold text-gray-900">
            Create New Password
          </h2>
          <p className="text-gray-600">
            Please enter the otp we have sent you in your email.
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* New Password Input */}
            <FormField
              control={form.control}
              name="newPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-700">
                    New Password
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                      <Input
                        type={showNewPassword ? "text" : "password"}
                        placeholder="Password"
                        className="pl-10 pr-10 h-12 border-gray-300 focus:border-main-color focus:ring-main-color"
                        {...field}
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showNewPassword ? (
                          <EyeOff className="h-5 w-5" />
                        ) : (
                          <Eye className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Confirm Password Input */}
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-700">
                    Re-enter Password
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                      <Input
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Password"
                        className="pl-10 pr-10 h-12 border-gray-300 focus:border-main-color focus:ring-main-color"
                        {...field}
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-5 w-5" />
                        ) : (
                          <Eye className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Reset Password Button */}
            <Button
              type="submit"
              className="w-full h-12 bg-main-color hover:bg-[#01b5ac] text-white font-medium text-base"
              disabled={isLoading}
            >
              Reset Password {isLoading && "..."}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
}
