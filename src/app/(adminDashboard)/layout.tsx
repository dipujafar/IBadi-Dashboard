"use client";

import { ReactNode, useState } from "react";
import { ConfigProvider, Layout, theme } from "antd";
import SidebarContainer from "@/components/(adminDashboard)/layout/SidebarContainer";
import HeaderContainer from "@/components/(adminDashboard)/layout/HeaderContainer";
import { toast } from "sonner";
import { useEffect } from "react";
import { useMediaQuery } from "@react-hook/media-query";

const { Content } = Layout;

const AdminLayout = ({ children }: { children: ReactNode }) => {
  // Check if small screen
  const screenSizeLessThan1300 = useMediaQuery(
    "only screen and (max-width: 1300px)"
  );

  const [collapsed, setCollapsed] = useState(
    screenSizeLessThan1300 ? true : false
  );
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  // Show prompt to collapse sidebar if screen size is less than 1300px
  useEffect(() => {
    if (screenSizeLessThan1300) {
      toast.warning(
        "Small screen detected! Please set your browser in desktop mode for better experience.",
        {
          duration: 2500,
        }
      );
    }
  }, [screenSizeLessThan1300]);

  return (
    <ConfigProvider
      theme={{
        components: {
          Input: {
            colorBorder: "var(--color-main)",
          },
          Form: {
            labelFontSize: 18,
          },
          DatePicker: {
            colorBorder: "rgb(184,114,174)",
          },
        },
      }}
    >
      <Layout style={{ height: "100vh", overflow: "auto" }} hasSider>
        <div className="hidden xl:block">
          <SidebarContainer collapsed={collapsed}></SidebarContainer>
        </div>
        <Layout>
          <HeaderContainer
            collapsed={collapsed}
            setCollapsed={setCollapsed}
          ></HeaderContainer>
          <Content
            style={{
              // padding: 27,
              minHeight: 280,
              background: "var(--color-main-bg)",
              // borderRadius: borderRadiusLG,
              height: "80vh",
              overflow: "auto",
            }}
            className="md:!p-6 p-2"
          >
            {children}
          </Content>
        </Layout>
      </Layout>
    </ConfigProvider>
  );
};

export default AdminLayout;
