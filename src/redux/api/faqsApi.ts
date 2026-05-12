import { tagTypes } from "../tagTypes";
import { baseApi } from "./baseApi";

const faqsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAllFaqs: builder.query({
      query: (queries) => ({
        url: "/faq",
        method: "GET",
        params: queries,
      }),
      providesTags: [tagTypes.faq],
    }),
    createFaq: builder.mutation({
      query: (data) => ({
        url: `/faq`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: [tagTypes.faq],
    }),
    updateFaq: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/faq/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: [tagTypes.faq],
    }),
    deleteFaq: builder.mutation({
      query: (id) => ({
        url: `/faq/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [tagTypes.faq],
    }),
  }),
});

export const {
  useGetAllFaqsQuery,
  useCreateFaqMutation,
  useUpdateFaqMutation,
  useDeleteFaqMutation,
} = faqsApi;
