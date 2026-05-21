import { RiDashboardHorizontalFill } from "react-icons/ri";
import { IoBookmarksOutline, IoSettingsOutline } from "react-icons/io5";
import Link from "next/link";
import { BadgeCheck, MessageCircleMore, UsersRound, } from "lucide-react";
import { BiCategory } from "react-icons/bi";
import { GrUserExpert } from "react-icons/gr";
import { MdAddTask } from "react-icons/md";
import { BsQuestionSquare } from "react-icons/bs";


export const navLinks = [
  {
    key: "dashboard",
    icon: <RiDashboardHorizontalFill size={18} />,
    label: <Link href={"/dashboard"}>Dashboard</Link>,
  },
  {
    key: "account-details",
    icon: <UsersRound size={18} />,
    label: <Link href={"/account-details"}>User Details</Link>,
  },
  {
    key: "verification-request",
    icon: <BadgeCheck size={18} />,
    label: <Link href={"/verification-request"}>Verification</Link>,
  },
  {
    key: "categories-management",
    icon: <BiCategory size={18} />,
    label: <Link href={"/categories-management"}>Categories</Link>,
  },
  {
    key: "booking",
    icon: <IoBookmarksOutline size={18} />,
    label: <Link href={"/booking"}>Booking</Link>,
  },
  {
    key: "experience",
    icon: <GrUserExpert size={18} />,
    label: <Link href={"/experience-management"}>Experience Options</Link>,
  },
  {
    key: "option-task-option",
    icon: <MdAddTask size={18} />,
    label: <Link href={"/option-task-option"}>Other Task Option</Link>,
  },
  {
    key: "chat",
    icon: <MessageCircleMore size={18} />,
    label: <Link href={"/chat"}>Customer Support</Link>,
  },
  {
    key: "faqs",
    icon: <BsQuestionSquare size={18} />,
    label: <Link href={"/faqs"}>FAQs</Link>,
  },
  {
    key: "settings",
    icon: <IoSettingsOutline size={18} />,
    label: <Link href={"/settings"}>Settings</Link>,
  },
  // {
  //   key: "logout",
  //   icon: <RiLogoutCircleLine size={18} />,
  //   label: <Link href={"/login"}>Logout</Link>,
  // },
];
