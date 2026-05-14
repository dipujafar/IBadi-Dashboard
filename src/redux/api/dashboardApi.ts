import { tagTypes } from "../tagTypes";
import { baseApi } from "./baseApi";

const dashboardApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getStat: builder.query({
      query: (queries) => ({
        url: "/payments/admin-card",
        method: "GET",
        params: queries,
      }),
      providesTags: [tagTypes.dashboard],
    }),
    getChartData: builder.query({
      query: (queries) => ({
        url: "/payments/admin-chart",
        method: "GET",
        params: queries,
      }),
      providesTags: [tagTypes.dashboard],
    }),
  }),
});

export const { useGetStatQuery, useGetChartDataQuery } = dashboardApi;
