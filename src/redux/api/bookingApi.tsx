import { tagTypes } from "../tagTypes";
import { baseApi } from "./baseApi";

const bookingApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getBookingData: builder.query({
      query: (params) => ({
        url: "/bookings?include=user,provider,payments",
        method: "GET",
        params,
      }),
      providesTags: [tagTypes.booking],
    }),
  }),
});

export const {
  useGetBookingDataQuery,
} = bookingApi;
