import { tagTypes } from "../tagTypes";
import { baseApi } from "./baseApi";

const otherTaskOptionApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAllOtherTaskOptions: builder.query({
      query: (queries) => ({
        url: "/others-task-options",
        method: "GET",
        params: queries,
      }),
      providesTags: [tagTypes.otherTask],
    }),
    createOtherTaskOptions: builder.mutation({
      query: (data) => ({
        url: `/others-task-options`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: [tagTypes.otherTask],
    }),
    updateOtherTaskOptions: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/others-task-options/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: [tagTypes.otherTask],
    }),
    deleteOtherTaskOptions: builder.mutation({
      query: (id) => ({
        url: `/others-task-options/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [tagTypes.otherTask],
    }),
  }),
});

export const {
  useGetAllOtherTaskOptionsQuery,
  useCreateOtherTaskOptionsMutation,
  useUpdateOtherTaskOptionsMutation,
  useDeleteOtherTaskOptionsMutation
} = otherTaskOptionApi;