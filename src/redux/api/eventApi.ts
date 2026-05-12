import { tagTypes } from "../tagTypes";
import { baseApi } from "./baseApi";

const eventApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getEvents: builder.query({
      query: (params) => ({
        url: "/event",
        method: "GET",
        params,
      }),
      providesTags: [tagTypes.events],
    }),
    updateEvent: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/event/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: [tagTypes.events],
    }),
    getCheckInEventOverview: builder.query({
      query: () => ({
        url: "/event/check-in-chart",
        method: "GET",
      }),
      providesTags: [tagTypes.events, tagTypes.users],
    }),
    uploadImage: builder.mutation({
      query: (data) => ({
        url: `/event/upload-image`,
        method: "POST",
        body: data,
      }),
    }),
  }),
});

export const {
  useGetEventsQuery,
  useUpdateEventMutation,
  useUploadImageMutation,
  useGetCheckInEventOverviewQuery,
} = eventApi;
