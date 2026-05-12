"use client";;
import { TableProps } from "antd";
import DataTable from "@/utils/DataTable";
import { useGetAllUsersQuery } from "@/redux/api/usersApi";
import moment from "moment";
import BlockUser from "@/components/shared/BlockUser";
import { cn } from "@/lib/utils";

type TDataType = {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
};



const RecentAccountList = () => {
  const { data: usersData, isLoading } = useGetAllUsersQuery({ limit: 7 });



  const columns: TableProps<TDataType>["columns"] = [
    {
      title: "No.",
      dataIndex: "serial",
      render: (_, __, index) => <p>#{index + 1}</p>,
    },
    {
      title: "Name",
      dataIndex: "name",
      render: (text, rec) => (
        <div className="flex items-center gap-x-2">
          <p>{text}</p>
          <div className={cn(rec?.status === "blocked" ? " bg-red-600 text-white px-2 rounded-sm" : "hidden")}>{rec?.status}</div>
        </div>
      ),
    },
    {
      title: "Email",
      dataIndex: "email",
    },
    {
      title: "Phone Number",
      dataIndex: "phoneNumber",
      render: (text) => <p>{text || "N/A"}</p>
    },
    {
      title: "User Type",
      dataIndex: "role",
      render: (text) => <p className="capitalize">{text || "N/A"}</p>
    },


    {
      title: "Date",
      dataIndex: "createdAt",
      render: (text) => <p>{moment(text).format("DD MMM YYYY")}</p>
    },
    {
      title: "Action",
      dataIndex: "action",
      render: (_, rec) => <BlockUser id={rec?.id} isActive={rec?.status === 'active' ? true : false} />,
    }
  ];

  return (
    <div className="bg-section-bg rounded-3xl">
      <h1 className="text-[#000000] text-xl font-medium py-5 px-2">
        Recent join User
      </h1>
      <DataTable columns={columns} data={usersData?.data?.data} isLoading={isLoading}></DataTable>
    </div>
  );
};

export default RecentAccountList;
