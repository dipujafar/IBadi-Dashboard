import * as z from 'zod';
export const announcementSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .min(3, 'Title must be at least 3 characters'),
  description: z
    .string()
    .min(1, 'Description is required')
    .min(10, 'Description must be at least 10 characters'),
});

export type AnnouncementFormValues = z.infer<typeof announcementSchema>;