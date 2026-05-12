"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail } from "lucide-react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { ForgetPassFormValues, forgetPassSchema } from "./Schema";
import { useRouter } from "next/navigation";
import { useForgetPasswordMutation } from "@/redux/api/authApi";
import { toast } from "sonner";
import { Spin } from "antd";

export function ForgetPassForm() {
  const form = useForm<ForgetPassFormValues>({
    resolver: zodResolver(forgetPassSchema),
    defaultValues: {
      email: "",
    },
  });
  const [forgetPass, { isLoading }] = useForgetPasswordMutation();
  const router = useRouter();

  const onSubmit = async (values: ForgetPassFormValues) => {
    const formattedData = {
      email: values.email,
    };
    try {
      const res = await forgetPass(formattedData).unwrap();
      sessionStorage.setItem("forgotPasswordToken", res?.data?.token);
      toast.success("Password reset email sent successfully. Please check your inbox.");
      router.push(`/verify-email`);
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to reset password");
    }
  };
  return (
    <div className="min-h-screen flex flex-col md:flex-row">


      {/* Right Side - Login Form */}
      <div className="flex-1 bg-gray-100 flex flex-col items-center justify-center px-12">
        {/* forgot password form */}
        <div className="w-full max-w-xl bg-white rounded-lg space-y-6 lg:p-4 p-2">
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-bold text-gray-900">
              Forgot Password
            </h2>
            <p className="text-gray-600">
              Please enter your email address to reset your password
            </p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {/* Email/Phone Input */}
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-gray-700">
                      Email
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                        <Input
                          type="text"
                          placeholder="Enter your email"
                          className="pl-10 h-12 border-gray-300 focus:border-main-color focus:ring-main-color"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Login Button */}
              <Button
                type="submit"
                className="w-full h-12 bg-main-color hover:bg-[#01b5ac] text-white font-medium text-base"
                disabled={isLoading}
              >
                Send OTP {isLoading && <Spin size="small" className="ml-2" />}
              </Button>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
}
