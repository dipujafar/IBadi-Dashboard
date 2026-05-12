import { get } from "http";
import { tagTypes } from "../tagTypes";
import { baseApi } from "./baseApi";

const announcementsApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getAnnouncements: builder.query({
            query: (params) => ({
                url: "/announcements",
                method: "GET",
                params,
            }),
            providesTags: [tagTypes.announcements],
        }),
        getAnnouncementById: builder.query({
            query: (id) => ({
                url: `/announcements/${id}`,
                method: "GET",
            }),
            providesTags: [tagTypes.announcements],
        }),
        createAnnouncement: builder.mutation({
            query: (data) => ({
                url: "/announcements",
                method: "POST",
                body: data,
            }),            
            invalidatesTags: [tagTypes.announcements],
        }),
        updateAnnouncement: builder.mutation({
            query: ({ id, ...data }) => ({
                url: `/announcements/${id}`,
                method: "PATCH",
                body: data,
            }),
            invalidatesTags: [tagTypes.announcements],
        }),
        deleteAnnouncement: builder.mutation({
            query: (id) => ({
                url: `/announcements/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: [tagTypes.announcements],
        }),
    }),
});

export const { useGetAnnouncementsQuery, useGetAnnouncementByIdQuery, useCreateAnnouncementMutation, useUpdateAnnouncementMutation, useDeleteAnnouncementMutation } = announcementsApi;