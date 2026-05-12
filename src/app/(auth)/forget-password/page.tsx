import { ForgetPassForm } from "@/components/(auth)/forgetPassword/ForgetPassForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Forget Password",
};

const ForgetPasswordPage = () => {
  return <ForgetPassForm />;
};

export default ForgetPasswordPage;
