"use client";;
import { Input, TableProps } from "antd";
import { useState } from "react";
import DataTable from "@/utils/DataTable";
import { Search } from "lucide-react";
import { useGetAllUsersQuery } from "@/redux/api/usersApi";
import { useSearchParams } from "next/navigation";
import { useDebounce } from "use-debounce";
import moment from "moment";
import BlockUser from "@/components/shared/BlockUser";
import { cn } from "@/lib/utils";

type TDataType = {
  id: string;
  key?: number;
  name: string;
  email: string;
  status: string;
  phoneNumber?: string;
};

const AccountDetailsContainer = () => {
  const page = useSearchParams().get("page") || "1";
  const limit = useSearchParams().get("limit") || "12";
  const [searchText, setSearchText] = useState("");
  const [searchValue] = useDebounce(searchText, 500);

  //  set queries
  const queries: Record<string, string> = {};
  if (page) queries.page = page;
  if (limit) queries.limit = limit;
  if (searchValue) queries.searchTerm = searchValue;
  queries.role = "user";

  const { data: usersData, isLoading } = useGetAllUsersQuery(queries);


  const columns: TableProps<TDataType>["columns"] = [
    {
      title: "No.",
      dataIndex: "serial",
      render: (_, __, index) => <p>
        {
          `# ${Number(page) === 1
            ? index + 1
            : (Number(page) - 1) * Number(limit) + index + 1
          }`}
      </p>,
    },
    {
      title: "Name",
      dataIndex: "name",
      render: (text, rec) => (
        <div className="flex items-center gap-x-2">
          <p>{text}</p>
          <div className={cn(rec?.status ==="blocked" ? " bg-red-600 text-white px-2 rounded-sm" : "hidden" )}>{rec?.status}</div>
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
      title: "Date",
      dataIndex: "createdAt",
      render: (text) => <p>{moment(text).format("DD MMM YYYY")}</p>
    },
    {
      title: "Action",
      dataIndex: "action",
      render: (_, rec) => <BlockUser id={rec?.id} isActive={rec?.status === 'active'} />,
    }
  ];

  return (
    <div className="bg-section-bg rounded-xl">
      <div className="md:flex items-center justify-between py-4 px-2">
        <div></div>
        <Input value={searchText} onChange={(e) => setSearchText(e.target.value)} prefix={<Search size={18} />} placeholder="Search" className="!max-w-72 h-9 !bg-[#F7F6F4]" />
      </div>
      <DataTable columns={columns} data={usersData?.data?.data} pageSize={Number(limit)} total={usersData?.data?.meta?.total} isLoading={isLoading}  ></DataTable>
    </div>
  );
};

export default AccountDetailsContainer;
