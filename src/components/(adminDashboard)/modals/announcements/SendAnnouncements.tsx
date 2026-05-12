'use client'
import { Button, Modal } from "antd";
import { useState } from "react";
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

import { Loader, Plus } from "lucide-react";
import { AnnouncementFormValues, announcementSchema } from "./schemas";
import { Textarea } from "@/components/ui/textarea";
import { Button as ShadcnButton } from "@/components/ui/button";
import { toast } from "sonner";
import { useCreateAnnouncementMutation } from "../../../../redux/api/announcementsApi";


const SendAnnouncements = () => {
    const [open, setOpen] = useState(false);
    const [addAnnouncement, { isLoading }] = useCreateAnnouncementMutation();

    const form = useForm<AnnouncementFormValues>({
        resolver: zodResolver(announcementSchema),
        defaultValues: {
            title: '',
            description: '',
        },
    });

    async function onSubmit(values: AnnouncementFormValues) {
        try {
            await addAnnouncement(values).unwrap();
            toast.success('Announcement send successfully to all users');
            setOpen(false);
            form.reset();
        } catch (error: any) {
            toast.error('Failed to send announcement');
        }
    }

    return (
        <div>
            <Button icon={<Plus size={16} />} onClick={() => setOpen(true)}>Send Announcement</Button>
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
                    <h1 className="text-2xl font-bold mb-6">Add Announcement</h1>

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

export default SendAnnouncements;
