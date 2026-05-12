import { useChangePasswordMutation } from "@/redux/api/authApi";
import { Button, Form, Input, Modal } from "antd";
import { Loader2 } from "lucide-react";
import { RiCloseLargeLine } from "react-icons/ri";
import { toast } from "sonner";

type TPropsType = {
  open: boolean;
  setOpen: (collapsed: boolean) => void;
};

const ChangePasswordModal = ({ open, setOpen }: TPropsType) => {
  const [form] = Form.useForm();
  const [changePassword, { isLoading }] = useChangePasswordMutation();

  // @ts-expect-error: Ignoring TypeScript error due to inferred 'any' type for 'values' which is handled in the form submit logic
  const handleSubmit = async (values) => {
    const { oldPassword, newPassword, confirmPassword } = values;
    const formattedData = {
      oldPassword,
      newPassword,
      confirmPassword,
    };
    try {
      await changePassword(formattedData).unwrap();
      toast.success("Password changed successfully");
      setOpen(false);
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to change password");
    }

  };
  return (
    <>
      <Modal
        open={open}
        footer={null}
        centered={true}
        onCancel={() => setOpen(false)}
        closeIcon={false}
        style={{
          minWidth: "max-content",
        }}
      >
        <div className="">
          <div
            className="size-10 bg-main-color  absolute top-2 right-2 rounded-full cursor-pointer flex justify-center items-center"
          >
            <RiCloseLargeLine
              size={18}
              color="#fff"
              className=""
            />
          </div>

          {/* header */}
          <div>
            <h4 className=" text-2xl font-medium text-center">
              Change Password
            </h4>
            <p className="mt-1 text-center">
              Your password must be 8-10 character long.
            </p>
          </div>

          {/* form */}

          <Form
            form={form}
            onFinish={handleSubmit}
            layout="vertical"
            style={{
              maxWidth: 500,
              marginTop: "25px",
            }}
          >
            {/*  input old password */}
            <Form.Item
              label="Old Password"
              name="oldPassword"
              rules={[{ required: true, message: "Please Enter Old Password" }]}
            >
              <Input.Password size="large" placeholder="Enter old password " />
            </Form.Item>

            {/*  input  new Password*/}
            <Form.Item
              label="New password"
              name="newPassword"
              rules={[
                { required: true, message: "Please Enter New  Password" },
                { min: 6, message: "Password must be at least 6 characters" }
              ]}
            >
              <Input.Password size="large" placeholder="Set new password" />
            </Form.Item>

            {/* input  confirm number  */}
            <Form.Item
              label="Re-enter new password"
              name="confirmPassword"
              rules={[
                { required: true, message: "Please Re-enter new password" },
              ]}
            >
              <Input.Password
                size="large"
                placeholder="Re-enter new password"
              />
            </Form.Item>


            <Button
              htmlType="submit"
              size="large"
              block
              className="!border-none !py-6 hover:!bg-main-color  hover:!text-white"
              loading={isLoading}
            >
              Change Password {isLoading && <Loader2 size={18} className="animate-spin ml-2 text-main-color" />}
            </Button>
          </Form>
        </div>
      </Modal>

    </>
  );
};

export default ChangePasswordModal;
