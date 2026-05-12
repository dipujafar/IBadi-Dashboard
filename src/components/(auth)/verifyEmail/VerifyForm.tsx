"use client"
import type React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form"
import { useRouter } from "next/navigation"
import { useRef, type KeyboardEvent } from "react"
import { OtpFormValues, otpSchema } from "./schema"
import { useVerifyOtpMutation } from "@/redux/api/authApi"
import { toast } from "sonner"

export function OtpVerificationForm() {
  const [verifyOtp, { isLoading }] = useVerifyOtpMutation();
  const form = useForm<OtpFormValues>({
    resolver: zodResolver(otpSchema),
    defaultValues: {
      otp: "",
    },
  })
  const router = useRouter()

  // Create refs for each input
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  const handleInputChange = (index: number, value: string) => {
    // Only allow single digit
    if (value.length > 1) {
      value = value.slice(-1)
    }

    // Get current OTP value
    const currentOtp = form.getValues("otp")
    const otpArray = currentOtp.padEnd(6, " ").split("")
    otpArray[index] = value
    const newOtp = otpArray.join("").replace(/ /g, "")

    form.setValue("otp", newOtp)

    // Move to next input if value is entered
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    // Move to previous input on backspace if current input is empty
    if (e.key === "Backspace") {
      const currentOtp = form.getValues("otp")
      const otpArray = currentOtp.padEnd(6, " ").split("")

      if (!otpArray[index] || otpArray[index] === " ") {
        if (index > 0) {
          inputRefs.current[index - 1]?.focus()
        }
      } else {
        otpArray[index] = " "
        const newOtp = otpArray.join("").replace(/ /g, "")
        form.setValue("otp", newOtp)
      }
    }
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData("text").slice(0, 6)
    if (/^\d+$/.test(pastedData)) {
      form.setValue("otp", pastedData)
      // Focus the last filled input or the next empty one
      const nextIndex = Math.min(pastedData.length, 5)
      inputRefs.current[nextIndex]?.focus()
    }
  }

  const onSubmit = async (values: OtpFormValues) => {
    try {
      const res = await verifyOtp({ otp: values.otp }).unwrap();

      sessionStorage.removeItem("forgotPasswordToken");
      sessionStorage.setItem("resetPasswordToken", res?.data?.token);
      router.push("/reset-password");
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to verify OTP");
    }
  }

  const otpValue = form.watch("otp").padEnd(6, " ")

  return (
    <div className="flex-1 bg-gray-50 flex flex-col items-center justify-center px-12 max-w-xl py-10 rounded-md">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-bold text-gray-900">Verify Email</h2>
          <p className="text-gray-600">Please enter the otp we have sent you in your email.</p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* OTP Input Fields */}
            <FormField
              control={form.control}
              name="otp"
              render={() => (
                <FormItem>
                  <FormControl>
                    <div className="flex justify-center gap-2">
                      {[0, 1, 2, 3, 4, 5].map((index) => (
                        <Input
                          key={index}
                          ref={(el) => {
                            inputRefs.current[index] = el
                          }}
                          type="text"
                          inputMode="numeric"
                          maxLength={1}
                          value={otpValue[index] === " " ? "" : otpValue[index]}
                          onChange={(e) => handleInputChange(index, e.target.value)}
                          onKeyDown={(e) => handleKeyDown(index, e)}
                          onPaste={handlePaste}
                          className="w-12 h-12 text-center text-lg font-semibold border-gray-300 focus:border-main-color focus:ring-main-color"
                        />
                      ))}
                    </div>
                  </FormControl>
                  <FormMessage className="text-center" />
                </FormItem>
              )}
            />

            {/* Verify Button */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 bg-main-color hover:bg-[#01b5ac] text-white font-medium text-base"
            >
              Verify Email {isLoading && "..."}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  )
}
