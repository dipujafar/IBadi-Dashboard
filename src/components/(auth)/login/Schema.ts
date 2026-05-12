import * as z from "zod";
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .refine((value) => {
      // Check if it's a valid email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      // Check if it's a valid phone number (basic validation)
      const phoneRegex = /^[+]?[1-9][\d]{0,15}$/;
      return emailRegex.test(value) || phoneRegex.test(value);
    }, "Please enter a valid email address or phone number"),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .max(100, "Password must be less than 100 characters"),
});

export type LoginFormValues = z.infer<typeof loginSchema>;
