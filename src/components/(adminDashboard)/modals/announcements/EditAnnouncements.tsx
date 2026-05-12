'use client'
import { Button, Modal } from "antd";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";

import { Edit2, Loader } from "lucide-react";
import { AnnouncementFormValues, announcementSchema } from "./schemas";
import { Textarea } from "@/components/ui/textarea";
import { Button as ShadcnButton } from "@/components/ui/button";
import { toast } from "sonner";
import { useUpdateAnnouncementMutation } from "../../../../redux/api/announcementsApi";


const EditAnnouncements = ({ data }: { data: any }) => {
    const [open, setOpen] = useState(false);
    const [updateAnnouncement, { isLoading }] = useUpdateAnnouncementMutation();

    const form = useForm<AnnouncementFormValues>({
        resolver: zodResolver(announcementSchema),
        defaultValues: {
            title: data?.title || '',
            description: data?.description || '',
        },
    });

    const { setValue } = form;


    async function onSubmit(values: AnnouncementFormValues) {
        try {
            await updateAnnouncement({ id: data?._id, ...values }).unwrap();
            toast.success('Announcement updated successfully');
            setOpen(false);
            form.reset();
        } catch (error: any) {
            toast.error('Failed to update announcement');
        }
    }


    useEffect(() => {
        setValue('title', data?.title || '');
        setValue('description', data?.description || '');
    }, [data, setValue]);

    return (
        <div>
            <ShadcnButton
                onClick={() => { setOpen(true) }}
                className="p-2 bg-gray-100 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded-md transition-colors"
                aria-label="Edit reminder"
            >
                <Edit2 size={18} />
            </ShadcnButton>
            <Modal
                open={open}
                footer={null}
                centered={true}
                onCancel={() => setOpen(false)}
                closeIcon={false}
                style={{
                    minWidth: "max-content",
                    position: "relative",

                }}
            >
                <div>
                    <h1 className="text-2xl font-bold mb-6">Edit Announcement</h1>

                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                            <FormField
                                control={form.control}
                                name="title"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Title</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="Enter the announcement title..."
                                                {...field}
                                                className="py-5 bg-gray-50"
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="description"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Description</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                placeholder="Enter the announcement description..."
                                                className="min-h-[150px] resize-none bg-gray-50"
                                                {...field}

                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="flex gap-3 pt-2">
                                <ShadcnButton
                                    type="button"
                                    variant="outline"
                                    onClick={() => setOpen(false)}

                                    className="flex-1 border-main-color text-main-color"
                                >
                                    Cancel
                                </ShadcnButton>
                                <ShadcnButton
                                    type="submit"
                                    disabled={isLoading}
                                    className="flex-1 bg-main-color hover:bg-red-800 text-white"
                                >
                                    Send Now {isLoading && <Loader size={16} className="ml-2 animate-spin" />}
                                </ShadcnButton>
                            </div>
                        </form>
                    </Form>
                </div>
            </Modal>
        </div>
    );
};

export default EditAnnouncements;
