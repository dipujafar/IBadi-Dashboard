"use client";
import {
    useCreateCategoryMutation,
    useDeleteCategoryMutation,
    useGetAllCategoriesQuery,
    useUpdateCategoryMutation,
} from "@/redux/api/categories";
import { Popconfirm, TableProps, Modal, Form, Input, Image } from "antd";
import { useSearchParams } from "next/navigation";
import React, { useState } from "react";
import DataTable from "@/utils/DataTable";
import { ImageIcon, Pencil, Trash2, X } from "lucide-react";
import { toast } from "sonner";


type TCategory = {
    id: string;
    name: string;
    image: string;
    isDeleted: boolean;
    createdAt: string;
    updatedAt: string;
};

type TModalState = {
    open: boolean;
    mode: "create" | "update";
    record?: TCategory;
};

export default function CategoriesContainer() {
    const page = useSearchParams().get("page") || "1";
    const limit = useSearchParams().get("limit") || "12";

    const queries: Record<string, string> = {};
    if (page) queries.page = page;
    if (limit) queries.limit = limit;

    const { data, isLoading } = useGetAllCategoriesQuery(queries);
    const [createCategory, { isLoading: isCreating }] = useCreateCategoryMutation();
    const [updateCategory, { isLoading: isUpdating }] = useUpdateCategoryMutation();
    const [deleteCategory] = useDeleteCategoryMutation();

    const [modal, setModal] = useState<TModalState>({ open: false, mode: "create" });
    const [form] = Form.useForm();
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string>("");

    // ── Open modal ──────────────────────────────────────────────────────────
    const openCreate = () => {
        form.resetFields();
        setImageFile(null);
        setImagePreview("");
        setModal({ open: true, mode: "create" });
    };

    const openUpdate = (record: TCategory) => {
        form.setFieldsValue({ name: record.name });
        setImageFile(null);
        setImagePreview(record.image);
        setModal({ open: true, mode: "update", record });
    };

    const closeModal = () => {
        setModal({ open: false, mode: "create" });
        form.resetFields();
        setImageFile(null);
        setImagePreview("");
    };

    // ── Image picker ─────────────────────────────────────────────────────────
    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setImageFile(file);
        setImagePreview(URL.createObjectURL(file));
    };

    // ── Submit ────────────────────────────────────────────────────────────────
    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            const formData = new FormData();
            formData.append("data", JSON.stringify({ name: values.name }));
            if (imageFile) formData.append("image", imageFile);

            if (modal.mode === "create") {
                await createCategory(formData).unwrap();
                toast.success("Category created successfully");
            } else if (modal.mode === "update" && modal.record) {
                await updateCategory({ id: modal.record.id, ...formData }).unwrap();
                toast.success("Category updated successfully");
            }
            closeModal();
        } catch (err: any) {
            toast.error(err?.data?.message || "Something went wrong");
        }
    };

    // ── Delete ────────────────────────────────────────────────────────────────
    const handleDelete = async (id: string) => {
        try {
            await deleteCategory(id).unwrap();
            toast.success("Category deleted successfully");
        } catch (err: any) {
            toast.error(err?.data?.message || "Failed to delete category");
        }
    };

    // ── Table columns ─────────────────────────────────────────────────────────
    const columns: TableProps<TCategory>["columns"] = [
        {
            title: "No.",
            render: (_, __, index) =>
                `${Number(page) === 1 ? index + 1 : (Number(page) - 1) * Number(limit) + index + 1}.`,
            width: 60,
        },
        {
            title: "Image",
            dataIndex: "image",
            render: (src: string) =>
                src ? (
                    <Image
                        src={src}
                        alt="category"
                        width={60}
                        height={60}
                        className="rounded object-cover"
                    />
                ) : (
                    <div className="size-[60px] bg-gray-100 rounded flex items-center justify-center">
                        <ImageIcon size={18} className="text-gray-400" />
                    </div>
                ),
            width: 80,
        },
        {
            title: "Name",
            dataIndex: "name",
            render: (text) => <p className="text-black">{text}</p>
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
                        title="Delete Category"
                        description="Are you sure you want to delete this category?"
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
                <h1 className="text-xl font-semibold text-gray-900">All Category</h1>
                <button
                    onClick={openCreate}
                    className="bg-[#00BFA5] hover:bg-[#00897B] text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
                >
                    Add Category
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
                <div className="flex items-center justify-between mb-5">
                    <span /> {/* spacer */}
                    <button
                        onClick={closeModal}
                        className="text-gray-500 hover:text-gray-800 transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                <Form form={form} layout="vertical" requiredMark={false}>
                    {/* Category Name */}
                    <Form.Item
                        label={<span className="font-semibold text-gray-800">Category Name</span>}
                        name="name"
                        rules={[{ required: true, message: "Category name is required" }]}
                    >
                        <Input
                            placeholder="Enter category name"
                            className="!rounded-lg !h-10"
                        />
                    </Form.Item>

                    {/* Image */}
                    <Form.Item
                        label={<span className="font-semibold text-gray-800">Image</span>}
                    >
                        <label
                            htmlFor="category-image-upload"
                            className="flex items-center gap-2 border border-gray-300 rounded-lg h-10 px-3 cursor-pointer hover:border-[#00BFA5] transition-colors"
                        >
                            <ImageIcon size={16} className="text-gray-400" />
                            <span className="text-gray-400 text-sm truncate">
                                {imageFile ? imageFile.name : "browse image"}
                            </span>
                        </label>
                        <input
                            id="category-image-upload"
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleImageChange}
                        />
                        {/* Preview */}
                        {imagePreview && (
                            <div className="mt-2">
                                <Image
                                    src={imagePreview}
                                    alt="preview"
                                    width={64}
                                    height={64}
                                    className="rounded-lg object-cover"
                                />
                            </div>
                        )}
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