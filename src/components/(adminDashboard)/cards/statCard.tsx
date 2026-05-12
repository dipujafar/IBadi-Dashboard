import { cn } from "@/lib/utils";
import { ArrowDown, ArrowUp } from "lucide-react";
import Image from "next/image";
import React from "react";

type TProps = {
  title: string;
  amount: string;
  image: string;
};

export default function StatCard({
  title,
  amount,
  image
}: TProps) {
  return (
    <div className="flex  xl:gap-y-2 gap-y-1  justify-between items-center p-4  flex-1 bg-[#E6FAF9] rounded-lg min-h-[100px] ">

      <div className="flex items-center gap-3 flex-wrap">
        <div className="bg-[#FFFFFF]  rounded-full size-12 flex justify-center items-center">
          <Image src={image} alt="setting" width={25} height={25} className="cursor-pointer" />
        </div>
        <h3 className=" text-lg  text-[#212529] font-medium truncate">{title}</h3>
      </div>

      <p className="lg:text-[32px]  text-2xl text-main-color font-medium ">{amount}</p>
    </div>
  );
}
