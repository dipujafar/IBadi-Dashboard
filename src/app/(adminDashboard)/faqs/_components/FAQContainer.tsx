"use client";
import {
    useGetAllFaqsQuery,
    useCreateFaqMutation,
    useUpdateFaqMutation,
    useDeleteFaqMutation,
} from "@/redux/api/faqsApi";
import { Popconfirm, Modal, Form, Input, Select, Tag } from "antd";
import { useSearchParams } from "next/navigation";
import React, { useState } from "react";
import { ChevronDown, CircleHelp, Plus, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { useGetAllCategoriesQuery } from "@/redux/api/categories";

type TCategory = {
    id: string;
    name: string;
    image: string;
};

type TFaq = {
    id: string;
    question: string;
    answer: string;
    categoryId?: string;
    category?: TCategory;
    createdAt: string;
    updatedAt: string;
};

type TModalState = {
    open: boolean;
    mode: "create" | "update";
    record?: TFaq;
};

export default function FaqContainer() {
    const page = useSearchParams().get("page") || "1";
    const limit = useSearchParams().get("limit") || "12";

    const queries: Record<string, string> = {};
    if (page) queries.page = page;
    if (limit) queries.limit = limit;
    queries.include = "category";

    const { data, isLoading } = useGetAllFaqsQuery(queries);
    const [createFaq, { isLoading: isCreating }] = useCreateFaqMutation();
    const [updateFaq, { isLoading: isUpdating }] = useUpdateFaqMutation();
    const [deleteFaq] = useDeleteFaqMutation();

    const [openAccordion, setOpenAccordion] = useState<string | null>(null);
    const [modal, setModal] = useState<TModalState>({ open: false, mode: "create" });
    const [form] = Form.useForm();

    const { data: categoriesData } = useGetAllCategoriesQuery({ limit: "99" });
    const categories: TCategory[] = categoriesData?.data?.data || [];

    const faqs: TFaq[] = data?.data?.data || [];

    // ── Accordion ─────────────────────────────────────────────────────────────
    const toggleAccordion = (id: string) => {
        setOpenAccordion((prev) => (prev === id ? null : id));
    };

    // ── Open modal ──────────────────────────────────────────────────────────
    const openCreate = () => {
        form.resetFields();
        setModal({ open: true, mode: "create" });
    };

    const openUpdate = (record: TFaq) => {
        form.setFieldsValue({
            question: record.question,
            answer: record.answer,
            categoryId: record.categoryId,
        });
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
            const payload = {
                question: values.question,
                answer: values.answer,
                categoryId: values.categoryId,
            };

            if (modal.mode === "create") {
                await createFaq(payload).unwrap();
                toast.success("FAQ created successfully");
            } else if (modal.mode === "update" && modal.record) {
                await updateFaq({ id: modal.record.id, ...payload }).unwrap();
                toast.success("FAQ updated successfully");
            }
            closeModal();
        } catch (err: any) {
            toast.error(err?.data?.message || "Something went wrong");
        }
    };

    // ── Delete ────────────────────────────────────────────────────────────────
    const handleDelete = async (id: string) => {
        try {
            await deleteFaq(id).unwrap();
            toast.success("FAQ deleted successfully");
        } catch (err: any) {
            toast.error(err?.data?.message || "Failed to delete FAQ");
        }
    };

    // ── Render ────────────────────────────────────────────────────────────────
    return (
        <div className="bg-white rounded-xl px-4 py-4">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-xl font-bold text-gray-900 flex-1 text-center">FAQs</h1>
                <button
                    onClick={openCreate}
                    className="flex items-center gap-1.5 bg-[#00BFA5] hover:bg-[#00897B] text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
                >
                    <Plus size={16} />
                    Add FAQs
                </button>
            </div>

            {/* FAQ Accordion List */}
            {isLoading ? (
                <div className="flex justify-center py-10 text-gray-400">Loading...</div>
            ) : faqs.length === 0 ? (
                <div className="text-center py-10 text-gray-400">No FAQs found</div>
            ) : (
                <div className="divide-y divide-gray-200">
                    {faqs.map((faq) => (
                        <div key={faq.id} className="py-4">
                            {/* Question row */}
                            <div className="flex items-center gap-3">
                                <CircleHelp size={24} className="text-gray-400 shrink-0" />
                                <p
                                    className="flex-1 text-gray-800 font-medium cursor-pointer text-lg"
                                    onClick={() => toggleAccordion(faq.id)}
                                >
                                    {faq.question}
                                </p>
                                <div className="flex items-center gap-3 ml-2">
                                    {/* Category tag */}
                                    {faq?.category?.name && (
                                        <Tag
                                            color="cyan"
                                            className="!rounded-full !px-3 !text-xs !font-medium capitalize"
                                        >
                                            {faq.category.name}
                                        </Tag>
                                    )}
                                    <button
                                        onClick={() => toggleAccordion(faq.id)}
                                        className="text-gray-500 hover:text-gray-700 transition-colors"
                                    >
                                        <ChevronDown
                                            size={18}
                                            className={`transition-transform duration-200 ${
                                                openAccordion === faq.id ? "rotate-180" : ""
                                            }`}
                                        />
                                    </button>
                                    <Popconfirm
                                        title="Delete FAQ"
                                        description="Are you sure you want to delete this FAQ?"
                                        onConfirm={() => handleDelete(faq.id)}
                                        okText="Yes, Delete"
                                        cancelText="Cancel"
                                        okButtonProps={{ danger: true }}
                                    >
                                        <button className="text-[#bf0000] hover:text-[#af0505] transition-colors">
                                            <Trash2 size={18} />
                                        </button>
                                    </Popconfirm>
                                </div>
                            </div>

                            {/* Answer (accordion body) */}
                            {openAccordion === faq.id && (
                                <div
                                    className="mt-3 ml-7 text-gray-600 text-sm leading-relaxed cursor-pointer"
                                    onClick={() => openUpdate(faq)}
                                >
                                    {faq.answer}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Modal */}
            <Modal
                open={modal.open}
                onCancel={closeModal}
                footer={null}
                closable={false}
                centered
                width={420}
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
                    {/* Category */}
                    <Form.Item
                        label={<span className="font-semibold text-gray-800">Category</span>}
                        name="categoryId"
                        rules={[{ required: true, message: "Category is required" }]}
                    >
                        <Select
                            placeholder="Select a category"
                            className="!h-10"
                            options={categories.map((cat) => ({
                                label: cat.name,
                                value: cat.id,
                            }))}
                        />
                    </Form.Item>

                    {/* Question */}
                    <Form.Item
                        label={<span className="font-semibold text-gray-800">Question</span>}
                        name="question"
                        rules={[{ required: true, message: "Question is required" }]}
                    >
                        <Input placeholder="" className="!rounded-lg !h-10" />
                    </Form.Item>

                    {/* Answer */}
                    <Form.Item
                        label={<span className="font-semibold text-gray-800">Answer</span>}
                        name="answer"
                        rules={[{ required: true, message: "Answer is required" }]}
                    >
                        <Input.TextArea
                            placeholder=""
                            rows={4}
                            className="!rounded-lg"
                        />
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