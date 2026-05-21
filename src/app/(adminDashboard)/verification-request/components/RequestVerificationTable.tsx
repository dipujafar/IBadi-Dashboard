"use client";

import { useState } from "react";
import { Input, Modal, TableProps, Image, Tag } from "antd";
import { Search, Download, FileText, CheckCircle, XCircle, Eye, Loader2 } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useDebounce } from "use-debounce";
import moment from "moment";
import { toast } from "sonner";
import DataTable from "@/utils/DataTable";
import {
  useGetAllVerificationQuery,
  useApproveRequestMutation,
  useRejectRequestMutation,
} from "@/redux/api/verifyRequestApi";

// ── Types ────────────────────────────────────────────────────────────────────

type TDocument = {
  id: string;
  url: string;
  requestId: string;
  messageId: string | null;
  userId: string | null;
};

type TVerificationRequest = {
  id: string;
  userId: string;
  reason: string | null;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
  updatedAt: string;
  documents: TDocument[];
  user: {
    id: string;
    name: string;
    email: string;
    profile: string;
    phoneNumber: string;
    serviceProviderInfo: Record<string, any>;
  };
};

// ── Status Badge ─────────────────────────────────────────────────────────────

const StatusBadge = ({ status }: { status: string }) => {
  const map: Record<string, { color: string; label: string }> = {
    pending: { color: "orange", label: "Pending" },
    approved: { color: "green", label: "Approved" },
    rejected: { color: "red", label: "Rejected" },
  };
  const { color, label } = map[status] ?? { color: "default", label: status };
  return <Tag color={color}>{label}</Tag>;
};

// ── Reject Reason Modal ───────────────────────────────────────────────────────

const RejectModal = ({
  open,
  onCancel,
  onConfirm,
  isLoading,
}: {
  open: boolean;
  onCancel: () => void;
  onConfirm: (reason: string) => void;
  isLoading: boolean;
}) => {
  const [reason, setReason] = useState("");

  return (
    <Modal
      open={open}
      onCancel={onCancel}
      footer={null}
      centered
      title="Reject Verification Request"
      closeIcon={false}
    >
      <div className="space-y-4 mt-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Reason for rejection <span className="text-red-500">*</span>
          </label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={4}
            placeholder="Provide a clear reason for rejecting this request..."
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-red-400"
          />
        </div>
        <div className="flex gap-3 pt-1">
          <button
            onClick={onCancel}
            className="flex-1 border border-gray-300 rounded-lg py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            disabled={!reason.trim() || isLoading}
            onClick={() => onConfirm(reason.trim())}
            className="flex-1 bg-red-600 text-white rounded-lg py-2 text-sm font-medium hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading && <Loader2 size={14} className="animate-spin" />}
            Reject
          </button>
        </div>
      </div>
    </Modal>
  );
};

// ── Documents Modal ───────────────────────────────────────────────────────────

const DocumentsModal = ({
  record,
  open,
  onClose,
  onApprove,
  onReject,
  isApproving,
}: {
  record: TVerificationRequest | null;
  open: boolean;
  onClose: () => void;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  isApproving: boolean;
}) => {
  if (!record) return null;

  const handleDownload = async (url: string, filename: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(blobUrl);
    } catch {
      // fallback: open in new tab
      window.open(url, "_blank");
    }
  };

  const isPending = record.status === "pending";

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      centered
      closeIcon={false}
      width={640}
      title={null}
    >
      <div className="space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-800">Verification Request</h2>
          <StatusBadge status={record.status} />
        </div>

        {/* User Info */}
        <div className="flex items-center gap-3 bg-gray-50 rounded-xl p-4">
          <img
            src={record.user.profile}
            alt={record.user.name}
            className="w-12 h-12 rounded-full object-cover border border-gray-200"
            onError={(e) => {
              (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${record.user.name}&background=e5e7eb&color=374151`;
            }}
          />
          <div>
            <p className="font-semibold text-gray-900">{record.user.name}</p>
            <p className="text-sm text-gray-500">{record.user.email}</p>
            <p className="text-sm text-gray-500">{record.user.phoneNumber}</p>
          </div>
          <div className="ml-auto text-right text-xs text-gray-400">
            <p>Submitted</p>
            <p className="font-medium text-gray-600">
              {moment(record.createdAt).format("DD MMM YYYY, HH:mm")}
            </p>
          </div>
        </div>

        {/* Bio */}
        {record.user.serviceProviderInfo?.bio && (
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-1">Bio</p>
            <p className="text-sm text-gray-700">{record.user.serviceProviderInfo.bio}</p>
          </div>
        )}

        {/* Documents */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-3">
            Documents ({record.documents.length})
          </p>
          {record.documents.length === 0 ? (
            <p className="text-sm text-gray-400 italic">No documents attached.</p>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {record.documents.map((doc, idx) => (
                <div
                  key={doc.id}
                  className="border border-gray-200 rounded-xl overflow-hidden group relative"
                >
                  {/* Image preview */}
                  <div className="relative h-36 bg-gray-100 flex items-center justify-center overflow-hidden">
                    <Image
                      src={doc.url}
                      alt={`Document ${idx + 1}`}
                      className="object-cover w-full h-full"
                      fallback="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80' viewBox='0 0 24 24' fill='none' stroke='%239ca3af' stroke-width='1.5'%3E%3Cpath d='M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z'/%3E%3Cpolyline points='14 2 14 8 20 8'/%3E%3C/svg%3E"
                      preview={{
                        mask: (
                          <div className="flex items-center gap-1 text-xs">
                            <Eye size={14} /> Preview
                          </div>
                        ),
                      }}
                    />
                  </div>

                  {/* Footer row */}
                  <div className="flex items-center justify-between px-3 py-2 bg-white border-t border-gray-100">
                    <div className="flex items-center gap-1.5 text-xs text-gray-600">
                      <FileText size={13} />
                      <span>Doc {idx + 1}</span>
                    </div>
                    <button
                      onClick={() =>
                        handleDownload(doc.url, `document-${idx + 1}-${doc.id}`)
                      }
                      className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 font-medium transition-colors"
                    >
                      <Download size={13} />
                      Download
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Rejection reason (if rejected) */}
        {record.status === "rejected" && record.reason && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-3">
            <p className="text-xs font-semibold text-red-600 mb-1">Rejection Reason</p>
            <p className="text-sm text-red-700">{record.reason}</p>
          </div>
        )}

        {/* Actions */}
        {isPending && (
          <div className="flex gap-3 pt-1">
            <button
              onClick={() => onReject(record.id)}
              className="flex-1 border border-red-300 text-red-600 rounded-lg py-2.5 text-sm font-medium hover:bg-red-50 transition-colors flex items-center justify-center gap-2"
            >
              <XCircle size={16} />
              Reject
            </button>
            <button
              disabled={isApproving}
              onClick={() => onApprove(record.id)}
              className="flex-1 bg-green-600 text-white rounded-lg py-2.5 text-sm font-medium hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isApproving ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <CheckCircle size={16} />
              )}
              Approve
            </button>
          </div>
        )}

        {!isPending && (
          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="px-5 py-2 text-sm font-medium border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Close
            </button>
          </div>
        )}
      </div>
    </Modal>
  );
};

// ── Main Component ────────────────────────────────────────────────────────────

export default function RequestVerificationTable() {
  const page = useSearchParams().get("page") || "1";
  const limit = useSearchParams().get("limit") || "10";


  const [selectedRecord, setSelectedRecord] = useState<TVerificationRequest | null>(null);
  const [docsModalOpen, setDocsModalOpen] = useState(false);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [pendingRejectId, setPendingRejectId] = useState<string | null>(null);

  // Queries
  const queries: Record<string, string> = { page, limit };


  const { data, isLoading } = useGetAllVerificationQuery(queries);
  const [approveRequest, { isLoading: isApproving }] = useApproveRequestMutation();
  const [rejectRequest, { isLoading: isRejecting }] = useRejectRequestMutation();

  const records: TVerificationRequest[] = data?.data?.data ?? [];
  const total: number = data?.data?.meta?.total ?? 0;

  // Handlers
  const openDocsModal = (record: TVerificationRequest) => {
    setSelectedRecord(record);
    setDocsModalOpen(true);
  };

  const handleApprove = async (id: string) => {
    try {
      await approveRequest(id).unwrap();
      toast.success("Request approved successfully");
      setDocsModalOpen(false);
    } catch {
      toast.error("Failed to approve request");
    }
  };

  const handleRejectClick = (id: string) => {
    setPendingRejectId(id);
    setDocsModalOpen(false);
    setRejectModalOpen(true);
  };

  const handleRejectConfirm = async (reason: string) => {
    if (!pendingRejectId) return;
    try {
      await rejectRequest({ id: pendingRejectId, reason }).unwrap();
      toast.success("Request rejected");
      setRejectModalOpen(false);
      setPendingRejectId(null);
    } catch {
      toast.error("Failed to reject request");
    }
  };

  // Columns
  const columns: TableProps<TVerificationRequest>["columns"] = [
    {
      title: "No.",
      dataIndex: "serial",
      width: 60,
      render: (_, __, index) => (
        <span className="text-gray-500 text-sm">
          #{Number(page) === 1
            ? index + 1
            : (Number(page) - 1) * Number(limit) + index + 1}
        </span>
      ),
    },
    {
      title: "User",
      dataIndex: "user",
      render: (_, rec) => (
        <div className="flex items-center gap-2.5">
          <img
            src={rec.user.profile}
            alt={rec.user.name}
            className="w-9 h-9 rounded-full object-cover border border-gray-200 shrink-0"
            onError={(e) => {
              (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${rec.user.name}&background=e5e7eb&color=374151&size=36`;
            }}
          />
          <div>
            <p className="text-sm font-medium text-gray-800 leading-tight">{rec.user.name}</p>
            <p className="text-xs text-gray-400">{rec.user.email}</p>
          </div>
        </div>
      ),
    },
    {
      title: "Phone",
      dataIndex: ["user", "phoneNumber"],
      render: (text) => <span className="text-sm text-gray-600">{text || "N/A"}</span>,
    },
    {
      title: "Documents",
      dataIndex: "documents",
      render: (docs: TDocument[]) => (
        <span className="text-sm text-gray-600">{docs.length} file{docs.length !== 1 ? "s" : ""}</span>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      render: (status) => <StatusBadge status={status} />,
    },
    {
      title: "Submitted",
      dataIndex: "createdAt",
      render: (text) => (
        <span className="text-sm text-gray-500">{moment(text).format("DD MMM YYYY")}</span>
      ),
    },
    {
      title: "Action",
      dataIndex: "action",
      render: (_, rec) => (
        <button
          onClick={() => openDocsModal(rec)}
          className="flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors"
        >
          <Eye size={15} />
          View
        </button>
      ),
    },
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100">
      {/* Toolbar */}
      <div className="flex items-center justify-between py-4 px-4 border-b border-gray-100">
        <h2 className="text-base font-semibold text-gray-800">Verification Requests</h2>
       
      </div>

      {/* Table */}
      <DataTable
        columns={columns}
        data={records}
        pageSize={Number(limit)}
        total={total}
        isLoading={isLoading}
      />

      {/* Documents / Detail Modal */}
      <DocumentsModal
        record={selectedRecord}
        open={docsModalOpen}
        onClose={() => setDocsModalOpen(false)}
        onApprove={handleApprove}
        onReject={handleRejectClick}
        isApproving={isApproving}
      />

      {/* Reject Reason Modal */}
      <RejectModal
        open={rejectModalOpen}
        onCancel={() => {
          setRejectModalOpen(false);
          setPendingRejectId(null);
        }}
        onConfirm={handleRejectConfirm}
        isLoading={isRejecting}
      />
    </div>
  );
}