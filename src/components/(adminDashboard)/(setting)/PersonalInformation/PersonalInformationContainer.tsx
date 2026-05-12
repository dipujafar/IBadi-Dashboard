"use client";
import { Button, ConfigProvider, Form, Input, Spin } from "antd";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { FaArrowLeft } from "react-icons/fa6";
import { FiEdit } from "react-icons/fi";
import profile from "@/assets/image/adminProfile.png";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Camera, Trash2, X } from "lucide-react";
import { useGetProfileQuery, useUpdateProfileMutation } from "@/redux/api/profileApi";

const PersonalInformationContainer = () => {
  const route = useRouter();
  const [form] = Form.useForm();
  const [edit, setEdit] = useState(false);
  const [fileName, setFileName] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const { data: profileData, isLoading: isProfileDataLoading } = useGetProfileQuery(undefined);
  const [updateProfile, { isLoading: isUpdateProfileLoading }] = useUpdateProfileMutation();


  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const input = event.target;

    const file = input.files?.[0];

    if (file) {
      const url = URL.createObjectURL(file);
      console.log(url);
      setImageUrl(url);
      setFileName(file);
    } else {
      setImageUrl(null);
      setFileName(null);
    }

    input.value = "";
  };

  const handleSubmit = async (values: any) => {
    try {
      const formData = new FormData();

      formData.append("name", values.name);
      formData.append("phoneNumber", values.phone);
      formData.append("email", values.email);

      if (fileName) {
        formData.append("profile", fileName);
      }

      await updateProfile(formData).unwrap();

      toast.success("Successfully Change personal information", {
        duration: 1000,
      });

      setEdit(false);
    } catch (error) {
      toast.error("Failed to update profile");
    }
  };

  useEffect(() => {
    if (profileData?.data) {
      form.setFieldsValue({
        name: profileData.data.name,
        email: profileData.data.email,
        phone: profileData.data.phoneNumber,
      });
    }
  }, [profileData, form]);


  if (isProfileDataLoading) return <div className="flex justify-center items-center min-h-[calc(100vh-140px)]">
    <Spin size="large" />
  </div>

  return (
    <div>
      <div className="flex  flex-wrap gap-2 justify-between items-center ">
        <div className="flex items-center gap-3">
          <span
            onClick={() => route.back()}
            className="cursor-pointer bg-main-color p-2 rounded-full hidden md:block"
          >
            <FaArrowLeft size={20} color="#fff" />
          </span>
          <h4 className="md:text-2xl text-lg font-medium text-text-color">
            Personal Information
          </h4>
        </div>
        <div className={edit ? "hidden" : ""}>
          <Button
            style={{
              backgroundColor: "var(--color-secondary)",
              border: "none",
              color: "var(--color-main)",
            }}
            onClick={() => setEdit(true)}
            size="large"
            icon={<FiEdit />}
          >
            Edit Profile
          </Button>
        </div>
      </div>
      <hr className="my-4" />

      {/* personal information */}
      <div className="mt-10 lg:flex justify-center flex-col xl:flex-row items-center  gap-10">
        <div className="bg-[#fff] h-[365px] md:w-[350px] rounded-xl border border-main-color flex justify-center items-center  text-text-color">
          <div className="space-y-1 relative">
            <div className="relative group">
              <Image
                src={imageUrl || profileData?.data?.profile || profile}
                alt="adminProfile"
                width={1200}
                height={1200}
                className="size-36 rounded-full flex justify-center items-center bg-gray-200 object-cover"
              ></Image>

              {/* cancel button */}
              {fileName && imageUrl && (
                <div
                  className="absolute left-4 top-2 cursor-pointer rounded-md bg-primary-pink opacity-0 duration-1000 group-hover:opacity-100"
                  onClick={() => {
                    setFileName(null);
                    setImageUrl(null);
                  }}
                >
                  <Trash2 size={20} color="red" />
                </div>
              )}
              {/* upload image */}
              <input
                type="file"
                id="fileInput"
                className="hidden"
                onChange={handleFileChange}
                accept="image/*"
              />
              {/* upload button */}
              <label
                htmlFor="fileInput"
                className="flex cursor-pointer flex-col items-center"
              >
                <div className="bg-white text-black text-lg p-1 rounded-full  absolute bottom-0 right-3">
                  <Camera size={20} />
                </div>
              </label>
            </div>
            <h3 className="text-2xl text-center">Admin</h3>
          </div>
        </div>
        {/* form */}
        <div className="lg:w-2/4">
          <ConfigProvider
            theme={{
              components: {
                Input: {
                  colorBgContainer: "#fff",
                  colorText: "#333",
                  colorTextPlaceholder: "#fff",
                },
                Form: {
                  labelColor: "#333",
                },
              },
            }}
          >
            <Form
              form={form}
              onFinish={handleSubmit}
              layout="vertical"
              style={{
                marginTop: "25px",
              }}
              initialValues={{
                name: "James Tracy",
                email: "enrique@gmail.com",
                phone: "3000597212",
              }}
            >
              {/*  input  name */}
              <Form.Item label="Name" name="name">
                {edit ? (
                  <Input size="large" placeholder="Enter full name "></Input>
                ) : (
                  <Input
                    size="large"
                    placeholder="Enter full name "
                    readOnly
                  ></Input>
                )}
              </Form.Item>

              {/*  input  email */}
              <Form.Item label="Email" name="email">
                {edit ? (
                  <Input size="large" placeholder="Enter email "></Input>
                ) : (
                  <Input
                    size="large"
                    placeholder="Enter email"
                    readOnly
                  ></Input>
                )}
              </Form.Item>

              {/* input  phone number  */}
              <Form.Item label="Phone Number" name="phone">
                {edit ? (
                  <Input size="large" placeholder="Enter Phone number"></Input>
                ) : (
                  <Input
                    size="large"
                    placeholder="Enter Phone number"
                    readOnly
                  ></Input>
                )}
              </Form.Item>

              <div className={edit ? "" : "hidden"}>
                <Button
                  htmlType="submit"
                  size="large"
                  block
                  style={{ border: "none" }}
                  disabled={isUpdateProfileLoading}
                >
                  Save Change {isUpdateProfileLoading && <Spin size="small" className="ml-2" />}
                </Button>
              </div>
            </Form>
          </ConfigProvider>
        </div>
      </div>
    </div>
  );
};

export default PersonalInformationContainer;
