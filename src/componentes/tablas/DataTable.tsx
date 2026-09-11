import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  ColumnDef,
  flexRender,
  ColumnFiltersState
} from "@tanstack/react-table";
import { useState } from "react";

interface DataTableProps<TData> {
  data: TData[];
  columns: ColumnDef<TData>[];
  globalFilter?: string;
  loading?: boolean;
}

export function DataTable<TData extends object>({
  data,
  columns,
  globalFilter = "",
  loading = false,
}: DataTableProps<TData>) {
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  const table = useReactTable({
    data,
    columns,
    state: { globalFilter, columnFilters },
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  if (loading) {
    return (
      <div className="text-center py-8 text-[#1e3a5f] font-bold font-sans">
        Cargando...
      </div>
    );
  }

  return (
    <div className="overflow-x-auto w-full rounded-xl border border-[rgba(30,58,95,0.12)] bg-[#ffffff] font-sans">
      <table className="min-w-full table-auto">
        <thead className="bg-[#1e3a5f]">
          {table.getHeaderGroups().map((headerGroup) => (
            <tr className=" " key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th
                  key={header.id}
                  className="px-4 py-3 text-left text-xs font-bold text-white uppercase tracking-wider border-b border-[rgba(30,58,95,0.09)]"
                >
                  <div className="flex items-center justify-between h-auto mb-1.5">
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
                  </div>
                  {header.column.getCanFilter() && (
                    <div className="flex items-center justify-center mt-1">
                      <input
                        type="text"
                        value={(header.column.getFilterValue() as string) ?? ""}
                        onChange={(e) => header.column.setFilterValue(e.target.value)}
                        placeholder={`Buscar...`}
                        className="p-1.5 w-full max-w-xs text-xs text-[#2c3e50] rounded-md bg-white border border-[rgba(30,58,95,0.15)] focus:outline-none focus:ring-2 focus:ring-[#e8740e]"
                      />
                    </div>
                  )}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody className="bg-[#ffffff] divide-y divide-[rgba(30,58,95,0.09)]">
          {table.getRowModel().rows.map((row) => (
            <tr key={row.id} className="hover:bg-[#f3ede1]/40 transition-colors duration-150">
              {row.getVisibleCells().map((cell) => (
                <td
                  key={cell.id}
                  className="px-4 py-3 whitespace-normal break-words text-sm text-[#2c3e50] max-w-[220px] sm:max-w-none"
                >
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}