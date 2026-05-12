"use client"
import React from "react";
import AccountDetailsContainer from "./_components/AccountDetailsContainer";
import { Tabs } from 'antd';
import type { TabsProps } from 'antd';
import { useUpdateSearchParams } from "@/hooks/useUpdateSearchParams";
import ServiceProvider from "./_components/ServiceProvider";

const items: TabsProps['items'] = [
  {
    key: '1',
    label: 'All Users',
    children: <AccountDetailsContainer />,
  },
  {
    key: '2',
    label: 'Service Provider',
    children: <ServiceProvider />,
  },
];



export default function AccountDetailsPage() {
  const updateParams = useUpdateSearchParams();

  const onChange = () => {
    updateParams({ page: "1" })
  };

  return <>
    <Tabs defaultActiveKey="1" items={items} onChange={onChange} />

  </>
}
