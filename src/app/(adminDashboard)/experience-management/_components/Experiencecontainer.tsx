"use client";
import {
  useGetAllExperienceOptionsQuery,
  useCreateExperienceOptionsMutation,
  useUpdateExperienceOptionsMutation,
  useDeleteExperienceOptionsMutation,
} from "@/redux/api/experienceOptionsApi";
import { Popconfirm, TableProps, Modal, Form, Input } from "antd";
import { useSearchParams } from "next/navigation";
import React, { useState } from "react";
import DataTable from "@/utils/DataTable";
import { Pencil, Trash2, X } from "lucide-react";
import { toast } from "sonner";

type TExperience = {
  id: string;
  value: string;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
};

type TModalState = {
  open: boolean;
  mode: "create" | "update";
  record?: TExperience;
};

export default function ExperienceContainer() {
  const page = useSearchParams().get("page") || "1";
  const limit = useSearchParams().get("limit") || "12";

  const queries: Record<string, string> = {};
  if (page) queries.page = page;
  if (limit) queries.limit = limit;

  const { data, isLoading } = useGetAllExperienceOptionsQuery(queries);
  const [createExperienceOptions, { isLoading: isCreating }] = useCreateExperienceOptionsMutation();
  const [updateExperienceOptions, { isLoading: isUpdating }] = useUpdateExperienceOptionsMutation();
  const [deleteExperienceOptions] = useDeleteExperienceOptionsMutation();

  const [modal, setModal] = useState<TModalState>({ open: false, mode: "create" });
  const [form] = Form.useForm();

  // ── Open modal ──────────────────────────────────────────────────────────
  const openCreate = () => {
    form.resetFields();
    setModal({ open: true, mode: "create" });
  };

  const openUpdate = (record: TExperience) => {
    form.setFieldsValue({ value: record.value });
    setModal({ open: true, mode: "update", record });
  };

  const closeModal = () => {
    setModal({ open: false, mode: "create" });
    form.resetFields();
  };

  // ── Submit ────────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const payload = { value: values.value };

      if (modal.mode === "create") {
        await createExperienceOptions(payload).unwrap();
        toast.success("Experience option created successfully");
      } else if (modal.mode === "update" && modal.record) {
        await updateExperienceOptions({ id: modal.record.id, ...payload }).unwrap();
        toast.success("Experience option updated successfully");
      }
      closeModal();
    } catch (err: any) {
      toast.error(err?.data?.message || "Something went wrong");
    }
  };

  // ── Delete ────────────────────────────────────────────────────────────────
  const handleDelete = async (id: string) => {
    try {
      await deleteExperienceOptions(id).unwrap();
      toast.success("Experience option deleted successfully");
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to delete experience option");
    }
  };

  // ── Table columns ─────────────────────────────────────────────────────────
  const columns: TableProps<TExperience>["columns"] = [
    {
      title: "No.",
      render: (_, __, index) =>
        `${Number(page) === 1 ? index + 1 : (Number(page) - 1) * Number(limit) + index + 1}.`,
      width: 60,
    },
    {
      title: "Professional's experience",
      dataIndex: "value",
    },
    {
      title: "Action",
      render: (_, rec) => (
        <div className="flex items-center gap-3">
          <button
            onClick={() => openUpdate(rec)}
            className="text-[#00BFA5] hover:text-[#00897B] transition-colors"
          >
            <Pencil size={18} />
          </button>
          <Popconfirm
            title="Delete Experience"
            description="Are you sure you want to delete this experience option?"
            onConfirm={() => handleDelete(rec.id)}
            okText="Yes, Delete"
            cancelText="Cancel"
            okButtonProps={{ danger: true }}
          >
            <button className="text-red-500 hover:text-red-700 transition-colors">
              <Trash2 size={18} />
            </button>
          </Popconfirm>
        </div>
      ),
      width: 100,
    },
  ];

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="bg-white rounded-xl">
      {/* Header */}
      <div className="flex items-center justify-between py-4 px-4">
        <h1 className="text-xl font-semibold text-gray-900">Add Experience Options</h1>
        <button
          onClick={openCreate}
          className="bg-[#00BFA5] hover:bg-[#00897B] text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        >
          Add Experience Options
        </button>
      </div>

      {/* Table */}
      <DataTable
        columns={columns}
        data={data?.data?.data}
        pageSize={Number(limit)}
        total={data?.data?.meta?.total}
        isLoading={isLoading}
      />

      {/* Modal */}
      <Modal
        open={modal.open}
        onCancel={closeModal}
        footer={null}
        closable={false}
        centered
        width={380}
        styles={{ content: { borderRadius: 16, padding: 24 } }}
      >
        {/* Modal header */}
        <div className="flex justify-end mb-5">
          <button
            onClick={closeModal}
            className="text-gray-500 hover:text-gray-800 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <Form form={form} layout="vertical" requiredMark={false}>
          {/* Professional's experience */}
          <Form.Item
            label={<span className="font-semibold text-gray-800">Professional's experience Option</span>}
            name="value"
            rules={[{ required: true, message: "This field is required" }]}
          >
            <Input placeholder="" className="!rounded-lg !h-10" />
          </Form.Item>

          {/* Save button */}
          <button
            onClick={handleSubmit}
            disabled={isCreating || isUpdating}
            className="w-full bg-[#00BFA5] hover:bg-[#00897B] disabled:opacity-60 text-white font-medium py-2.5 rounded-lg transition-colors"
          >
            {isCreating || isUpdating ? "Saving..." : "Save"}
          </button>
        </Form>
      </Modal>
    </div>
  );
}