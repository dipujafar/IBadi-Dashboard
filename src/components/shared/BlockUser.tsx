"use client";;
import { useUserBlockMutation, useUserUnBlockMutation } from '@/redux/api/usersApi';
import { message, Popconfirm, PopconfirmProps } from 'antd'
import { CgUnblock } from 'react-icons/cg'
import { toast } from 'sonner';

export default function BlockUser({ id, isActive }: any) {
    const [blockUser] = useUserBlockMutation();
    const [unBlockedUser] = useUserUnBlockMutation();


    console.log(id);

    const confirmBlock: PopconfirmProps["onConfirm"] = async () => {
        try {
            if (isActive) {
                await blockUser(id).unwrap();
                message.success("Blocked the user");
            } else {
                await unBlockedUser(id).unwrap();
                message.success("Unblocked the user");
            }
        }
        catch (error: any) {
            toast.error(error?.data?.message || "Something went wrong");
        }

    };
    return (
        <Popconfirm
            title={isActive ? "Block the user" : "Unblock the user"}
            description={isActive ? "Are you sure to block this user?" : "Are you sure to unblock this user?"}
            onConfirm={confirmBlock}
            okText="Yes"
            cancelText="No"
        >
            {isActive ? <CgUnblock size={22} color="#CD0335" /> : <CgUnblock size={22} color='green' />}
        </Popconfirm>
    )
}
