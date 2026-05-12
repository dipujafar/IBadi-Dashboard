import { Metadata } from "next";
import { ResetPasswordForm } from "@/components/(auth)/setNewPassword/ResetPasswordForm";

export const metadata: Metadata = {
  title: "Forget Password",
};

const ResetPassword = () => {
  return <ResetPasswordForm />;
};

export default ResetPassword;
