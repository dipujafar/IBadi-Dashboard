"use client";

import { Button } from "antd";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { FaArrowLeft } from "react-icons/fa6";
// @ts-ignore
import "react-quill/dist/quill.snow.css";
import { useGetContentQuery, useUpdateContentMutation } from "@/redux/api/contentApi";
import Loading from "@/components/shared/Loading";
import { toast } from "sonner";


// Dynamically import ReactQuill with SSR disabled
const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });

const TermsConditionsEditor = () => {
  const route = useRouter();
  const { data, isLoading } = useGetContentQuery({ key: "termsAndCondition" });
  const [value, setValue] = useState("");
  const [updateContent, { isLoading: isUpdating }] = useUpdateContentMutation();




  useEffect(() => {
    if (data?.data?.termsAndCondition) {
      setValue(data?.data?.termsAndCondition);
    }
  }, [data]);


  if (isLoading) return <Loading />


  const toolbarOptions = [
    ["image"],
    [{ header: [1, 2, false] }],
    ["bold", "italic", "underline"],
    [{ list: "ordered" }, { list: "bullet" }],
    [{ align: [] }],
    [{ color: [] }, { background: [] }],
  ];

  const moduleConest = {
    toolbar: toolbarOptions,
  };

  const handleUpdateContent = async () => {
    try {
      await updateContent({ termsAndCondition: value }).unwrap();
      toast.success("Successfully updated content", { duration: 1000 });
    }
    catch (error: any) {
      toast.error(error?.data?.message);
    }

  }

  return (
    <>
      <div className="flex items-center gap-2">
        <span
          onClick={() => route.back()}
          className="cursor-pointer bg-main-color p-2 rounded-full"
        >
          <FaArrowLeft size={20} color="#fff" />
        </span>
        <h4 className="text-2xl font-medium text-text-color">
          Terms & Conditions
        </h4>
      </div>
      <div className="lg:mt-10 mt-5 border rounded p-2">
        <ReactQuill
          modules={moduleConest}
          theme="snow"
          value={value}
          onChange={setValue}

          placeholder="Start writing ......"
          style={{
            // border: "1px solid #EFE8FD",
            marginTop: "20px",
            borderRadius: "10px",
          }}
        />
      </div>

      <Button
        size="large"
        block
        style={{
          marginTop: "20px",
          border: "none",
        }}
        onClick={handleUpdateContent}
        loading={isUpdating}
      >
        Save Changes
      </Button>

    </>
  );
};

export default dynamic(() => Promise.resolve(TermsConditionsEditor), {
  ssr: false,
});
