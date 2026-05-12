import { create } from "domain";
import { tagTypes } from "../tagTypes";
import { baseApi } from "./baseApi";

const usersApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getAttendanceStats: build.query({
      query: () => ({
        url: "/users/attendance-stats",
        method: "GET",
      }),
    }),
    getAllUsers: build.query({
      query: (params) => ({
        url: "/users",
        method: "GET",
        params,
      }),
      providesTags: [tagTypes.users],
    }),
    userBlock: build.mutation({
      query: (id) => ({
        url: `/users/${id}`,
        method: "PATCH",
        body: { status: "blocked" },
      }),
      invalidatesTags: [tagTypes.users],
    }),
    userUnBlock: build.mutation({
      query: (id) => ({
        url: `/users/${id}`,
        method: "PATCH",
        body: { status: "active" },
      }),
      invalidatesTags: [tagTypes.users],
    }),
  }),
});

export const {
  useGetAllUsersQuery,
  useGetAttendanceStatsQuery,
  useUserBlockMutation,
  useUserUnBlockMutation,
} = usersApi;
