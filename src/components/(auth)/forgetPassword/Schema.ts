import * as z from "zod";
export const forgetPassSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .refine((value) => {
      // Check if it's a valid email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      // Check if it's a valid phone number (basic validation)
      const phoneRegex = /^[+]?[1-9][\d]{0,15}$/;
      return emailRegex.test(value) || phoneRegex.test(value);
    }, "Please enter a valid email address"),
});

export type ForgetPassFormValues = z.infer<typeof forgetPassSchema>;
