import { useUpdateSearchParams } from "@/hooks/useUpdateSearchParams";
import { Pagination } from "antd";
import React from "react";

export default function PaginationSection({
  total,
  current,
  pageSize,
}: {
  total: number;
  current: number;
  pageSize?: number;
}) {
  const updateParams = useUpdateSearchParams();
  return (
    <div className="w-fit ml-auto mt-5">
      <Pagination
        defaultCurrent={1}
        current={current}
        total={total}
        pageSize={pageSize}
        onChange={(page) => updateParams({ page: page.toString() })}
      />
    </div>
  );
}
