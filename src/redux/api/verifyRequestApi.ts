import { tagTypes } from "../tagTypes";
import { baseApi } from "./baseApi";

const verifyRequestApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAllVerification: builder.query({
      query: (params) => ({
        url: "/verification-request",
        method: "GET",
        params,
      }),
      providesTags: [tagTypes.verification],
    }),
    approveRequest: builder.mutation({
      query: (id) => ({
        url: `/verification-request/approve/${id}`,
        method: "PATCH",
      }),
      invalidatesTags: [tagTypes.verification],
    }),
    rejectRequest: builder.mutation({
      query: ({id,...data}) => ({
        url: `/verification-request/reject/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: [tagTypes.verification],
    }),
  }),
});

export const { useGetAllVerificationQuery, useApproveRequestMutation, useRejectRequestMutation } = verifyRequestApi;
