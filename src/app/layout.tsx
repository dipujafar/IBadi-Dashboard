import type { Metadata } from "next";
// @ts-ignore
import "./globals.css";
import { AntdRegistry } from "@ant-design/nextjs-registry";
import { ConfigProvider } from "antd";
import antTheme from "@/theme/antTheme";
import { Poppins } from "next/font/google";
import { Toaster } from "sonner";
import { ReduxProvider } from "../lib/provider/ReduxProvider";

const poppins = Poppins({
  subsets: ["latin"],
  variable: "--font-poppins",
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: {
    default: "Admin Dashboard | iBadi",
    template: "%s | iBadi",
  },
  description: "This is Official Application Dashboard for iBadi",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={poppins.className}>
        <ReduxProvider>
          <AntdRegistry>
            <ConfigProvider theme={antTheme}>
              <Toaster position="top-center" richColors={true} />
              {children}
            </ConfigProvider>
          </AntdRegistry>
        </ReduxProvider>
      </body>
    </html>
  );
}
