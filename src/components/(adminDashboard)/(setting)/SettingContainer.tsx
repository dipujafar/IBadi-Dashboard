"use client";
import ChangePasswordModal from "@/components/(adminDashboard)/(setting)/changePassword/ChangePasswordModal";
import Link from "next/link";
import { useState } from "react";
import { IoIosArrowForward } from "react-icons/io";

const links = [
  {
    lable: "Personal Information",
    path: "personal-information",
  },
  {
    lable: "Change Password",
    path: "changePassword",
  },
  {
    lable: "Terms & Condition",
    path: "terms-condition",
  },
  {
    lable: "Privacy Policy",
    path: "privacy-policy",
  },
  {
    lable: "About Us",
    path: "about-us",
  },
];

const SettingContainer = () => {
  const [open, setOpen] = useState(false);
  return (
    <div className="grid grid-cols-1 gap-5">
      {links?.map((link, inx) => {
        if (link.path === "changePassword") {
          return (
            <div
              key={inx}
              onClick={() => setOpen(!open)}
              className="bg-[#fff]   p-5 rounded flex justify-between items-center cursor-pointer"
            >
              <h4 className="text-[#333] font-medium">
                {link?.lable}
              </h4>
              <IoIosArrowForward size={16} color="#000" />
            </div>
          );
        } else {
          return (
            <Link key={link.path} href={`/${link.path}`}>
              <div className="bg-[#fff]  p-5 rounded flex justify-between items-center">
                <h4 className="text-[#333] font-medium">
                  {link?.lable}
                </h4>
                <IoIosArrowForward size={16} color="#000" />
              </div>
            </Link>
          );
        }
      })}
      <ChangePasswordModal open={open} setOpen={setOpen}></ChangePasswordModal>
    </div>
  );
};

export default SettingContainer;
