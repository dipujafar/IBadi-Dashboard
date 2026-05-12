"use client";
import { useGetBookingDataQuery } from "@/redux/api/bookingApi";
import { Image, Modal, TableProps, Tag } from "antd";
import { useSearchParams } from "next/navigation";
import React, { useState } from "react";
import DataTable from "@/utils/DataTable";
import { Eye, X } from "lucide-react";
import moment from "moment";

type TUser = {
  id?: string;
  name?: string;
  email?: string;
  profile?: string | null;
  phoneNumber?: string | null;
};

type TPayment = {
  id?: string;
  amount?: number;
  status?: string;
  transactionId?: string;
  paymentMethod?: string;
  nextPaymentDate?: string;
  adminParentage?: number;
  providerParentage?: number;
  paidAt?: string;
};

type TBooking = {
  id?: string;
  userId?: string;
  providerId?: string;
  isPaid?: boolean;
  bookingType?: string;
  price?: number;
  startDate?: string;
  endDate?: string;
  totalHours?: number;
  isActive?: boolean;
  user?: TUser;
  provider?: TUser;
  payments?: TPayment[];
};

const Avatar = ({ src, name }: { src?: string | null; name?: string }) => {
  const initial = name?.trim()?.[0]?.toUpperCase() || "?";

  if (!src) {
    return (
      <div
        style={{ width: 34, height: 34, borderRadius: "50%", backgroundColor: "#00BFA5", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}
      >
        <span style={{ color: "#fff", fontSize: 14, fontWeight: 600, lineHeight: 1 }}>{initial}</span>
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={name || "avatar"}
      width={34}
      height={34}
      style={{ borderRadius: "50%", objectFit: "cover" }}
      fallback={`data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='34' height='34'><circle cx='17' cy='17' r='17' fill='%2300BFA5'/><text x='50%25' y='50%25' dominant-baseline='central' text-anchor='middle' font-size='14' font-weight='600' fill='white'>${initial}</text></svg>`}
    />
  );
};

const InfoRow = ({ label, value }: { label: string; value: React.ReactNode }) => (
  <div className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
    <span className="text-gray-500 text-sm">{label}</span>
    <span className="text-gray-800 text-sm font-medium text-right max-w-[60%] break-all">{value}</span>
  </div>
);

export default function BookingContainer() {
  const page = useSearchParams().get("page") || "1";
  const limit = useSearchParams().get("limit") || "12";

  const queries: Record<string, string> = {};
  if (page) queries.page = page;
  if (limit) queries.limit = limit;

  const { data, isLoading } = useGetBookingDataQuery(queries);
  const [selectedBooking, setSelectedBooking] = useState<TBooking | null>(null);

  const bookings: TBooking[] = data?.data?.data || [];

  const columns: TableProps<TBooking>["columns"] = [
    {
      title: "No.",
      render: (_, __, index) =>
        `${Number(page) === 1 ? index + 1 : (Number(page) - 1) * Number(limit) + index + 1}.`,
      width: 55,
    },
    {
      title: "User",
      render: (_, rec) => (
        <div className="flex items-center gap-2">
          <Avatar src={rec?.user?.profile} name={rec?.user?.name} />
          <div>
            <p className="text-sm font-medium text-gray-800 leading-tight">{rec?.user?.name || "N/A"}</p>
            <p className="text-xs text-gray-400">{rec?.user?.email || "N/A"}</p>
          </div>
        </div>
      ),
      width: 220,
    },
    {
      title: "Service Provider",
      render: (_, rec) => (
        <div className="flex items-center gap-2">
          <Avatar src={rec?.provider?.profile} name={rec?.provider?.name} />
          <div>
            <p className="text-sm font-medium text-gray-800 leading-tight">{rec?.provider?.name || "N/A"}</p>
            <p className="text-xs text-gray-400">{rec?.provider?.email || "N/A"}</p>
          </div>
        </div>
      ),
      width: 220,
    },
    {
      title: "Booking Type",
      dataIndex: "bookingType",
      render: (val) => (
        <Tag
          color="cyan"
          className="capitalize !rounded-full !px-3 !text-xs !font-medium"
        >
          {val}
        </Tag>
      ),
      width: 120,
    },
    {
      title: "Price",
      dataIndex: "price",
      render: (val) => <span className="font-semibold text-gray-800">${val}</span>,
      width: 90,
    },
    {
      title: "Total Hours",
      dataIndex: "totalHours",
      render: (val) => `${val} hrs`,
      width: 100,
    },
    {
      title: "Payment",
      dataIndex: "isPaid",
      render: (val) => (
        <Tag
          color={val ? "success" : "warning"}
          className="!rounded-full !px-3 !text-xs !font-medium"
        >
          {val ? "Paid" : "Pending"}
        </Tag>
      ),
      width: 90,
    },
    {
      title: "Action",
      render: (_, rec) => (
        <button
          onClick={() => setSelectedBooking(rec)}
          className="text-[#00BFA5] hover:text-[#00897B] transition-colors"
        >
          <Eye size={18} />
        </button>
      ),
      width: 70,
    },
  ];

  const payment = selectedBooking?.payments?.[0];

  return (
    <div className="bg-white rounded-xl">
      {/* Header */}
      <div className="flex items-center justify-between py-4 px-4">
        <h1 className="text-xl font-semibold text-gray-900">All Bookings</h1>
      </div>

      {/* Table */}
      <DataTable
        columns={columns}
        data={bookings}
        pageSize={Number(limit)}
        total={data?.data?.meta?.total}
        isLoading={isLoading}
      />

      {/* Details Modal */}
      <Modal
        open={!!selectedBooking}
        onCancel={() => setSelectedBooking(null)}
        footer={null}
        closable={false}
        centered
        width={500}
        styles={{ content: { borderRadius: 16, padding: 28 } }}
      >
        {selectedBooking && (
          <>
            {/* Modal Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-gray-900">Booking Details</h2>
              <button
                onClick={() => setSelectedBooking(null)}
                className="text-gray-400 hover:text-gray-700 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* User Section */}
            <div className="mb-5">
              <p className="text-xs font-semibold uppercase tracking-widest text-[#00BFA5] mb-3">
                User Information
              </p>
              <div className="flex items-center gap-3 mb-3">
                <Avatar src={selectedBooking?.user?.profile} name={selectedBooking?.user?.name} />
                <div>
                  <p className="font-semibold text-gray-800">{selectedBooking?.user?.name || "N/A"}</p>
                  <p className="text-xs text-gray-400">{selectedBooking?.user?.email || "N/A"}</p>
                </div>
              </div>
              <InfoRow label="Phone" value={selectedBooking?.user?.phoneNumber || "N/A"} />
            </div>

            {/* Provider Section */}
            <div className="mb-5">
              <p className="text-xs font-semibold uppercase tracking-widest text-[#00BFA5] mb-3">
                Service Provider
              </p>
              <div className="flex items-center gap-3 mb-3">
                <Avatar src={selectedBooking?.provider?.profile} name={selectedBooking?.provider?.name} />
                <div>
                  <p className="font-semibold text-gray-800">{selectedBooking?.provider?.name || "N/A"}</p>
                  <p className="text-xs text-gray-400">{selectedBooking?.provider?.email || "N/A"}</p>
                </div>
              </div>
              <InfoRow label="Phone" value={selectedBooking?.provider?.phoneNumber || "N/A"} />
            </div>

            {/* Booking Info */}
            <div className="mb-5">
              <p className="text-xs font-semibold uppercase tracking-widest text-[#00BFA5] mb-3">
                Booking Info
              </p>
              <InfoRow label="Booking Type" value={<span className="capitalize">{selectedBooking?.bookingType || "N/A"}</span>} />
              <InfoRow label="Price" value={selectedBooking?.price != null ? `$${selectedBooking.price}` : "N/A"} />
              <InfoRow label="Total Hours" value={selectedBooking?.totalHours != null ? `${selectedBooking.totalHours} hrs` : "N/A"} />
              <InfoRow label="Start Date" value={selectedBooking?.startDate ? moment(selectedBooking.startDate).format("DD MMM YYYY, hh:mm A") : "N/A"} />
              <InfoRow label="End Date" value={selectedBooking?.endDate ? moment(selectedBooking.endDate).format("DD MMM YYYY, hh:mm A") : "N/A"} />
              <InfoRow
                label="Status"
                value={
                  <Tag color={selectedBooking?.isPaid ? "success" : "warning"} className="!rounded-full !text-xs">
                    {selectedBooking?.isPaid ? "Paid" : "Pending"}
                  </Tag>
                }
              />
            </div>

            {/* Payment Section */}
            {payment ? (
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-[#00BFA5] mb-3">
                  Payment Details
                </p>
                <InfoRow label="Transaction ID" value={payment?.transactionId || "N/A"} />
                <InfoRow label="Amount" value={payment?.amount != null ? `$${payment.amount}` : "N/A"} />
                <InfoRow
                  label="Payment Status"
                  value={
                    <Tag color="success" className="!rounded-full !text-xs capitalize">
                      {payment?.status || "N/A"}
                    </Tag>
                  }
                />
                <InfoRow label="Admin Earnings" value={payment?.adminParentage != null ? `$${payment.adminParentage}` : "N/A"} />
                <InfoRow label="Provider Earnings" value={payment?.providerParentage != null ? `$${payment.providerParentage}` : "N/A"} />
                <InfoRow label="Paid At" value={payment?.paidAt ? moment(payment.paidAt).format("DD MMM YYYY, hh:mm A") : "N/A"} />
                <InfoRow label="Next Payment Date" value={payment?.nextPaymentDate ? moment(payment.nextPaymentDate).format("DD MMM YYYY") : "N/A"} />
              </div>
            ) : (
              <div className="text-center py-4 text-gray-400 text-sm bg-gray-50 rounded-lg">
                No payment records
              </div>
            )}
          </>
        )}
      </Modal>
    </div>
  );
}