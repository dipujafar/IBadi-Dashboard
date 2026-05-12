import Image from "next/image";
import logo from "@/assets/auth_page_logo.png";

export default function LogoSection() {
  return (
    <div className="flex-1 bg-gradient-to-br from-[#FFFFFF] via-[#D4BAFF] to-purple-600 flex flex-col items-center justify-center relative">
      <div className="flex items-center gap-4">
        <Image
          src={logo}
          alt="Logo"
          width={100}
          height={100}
          className="w-[250px]"
        />
      </div>
    </div>
  );
}
