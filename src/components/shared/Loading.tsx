import { ConfigProvider, Spin } from "antd";

export default function Loading() {
  return (
     <div className=" h-screen w-full flex justify-center items-center">
      <ConfigProvider
        theme={{
          components: {
            Spin: {
              colorPrimary: "#00C0B5",
            },
          },
        }}
      >
        <Spin size="large" />
      </ConfigProvider>
    </div>
  )
}
