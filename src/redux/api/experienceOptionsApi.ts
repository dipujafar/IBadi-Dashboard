import { tagTypes } from "../tagTypes";
import { baseApi } from "./baseApi";

const experienceOptionsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAllExperienceOptions: builder.query({
      query: (queries) => ({
        url: "/experience-options",
        method: "GET",
        params: queries,
      }),
      providesTags: [tagTypes.experience],
    }),
    createExperienceOptions: builder.mutation({
      query: (data) => ({
        url: `/experience-options`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: [tagTypes.experience],
    }),
    updateExperienceOptions: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/experience-options/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: [tagTypes.experience],
    }),
    deleteExperienceOptions: builder.mutation({
      query: (id) => ({
        url: `/experience-options/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [tagTypes.experience],
    }),
  }),
});

export const {
  useGetAllExperienceOptionsQuery,
  useCreateExperienceOptionsMutation,
  useUpdateExperienceOptionsMutation,
  useDeleteExperienceOptionsMutation,
} = experienceOptionsApi;
