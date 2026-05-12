import { OtpVerificationForm } from "@/components/(auth)/verifyEmail/VerifyForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Forget Password",
};

const verifyEmail = () => {
  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100 ">
      <OtpVerificationForm/>
    </div>

  );
};

export default verifyEmail;
