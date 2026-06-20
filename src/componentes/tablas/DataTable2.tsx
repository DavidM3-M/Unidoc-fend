import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  ColumnDef,
  flexRender,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
} from "@tanstack/react-table";
import { useState } from "react";
import {
  AlertCircle,
  Search,
  Filter,
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";

interface DataTableProps<TData> {
  data: TData[];
  columns: ColumnDef<TData>[];
  globalFilter?: string;
  loading?: boolean;
  showSearch?: boolean;
  searchPlaceholder?: string;
  onSearchChange?: (value: string) => void;
}

export function DataTable2<TData extends Record<string, any>>({
  data,
  columns,
  globalFilter = "",
  loading = false,
  showSearch = true,
  searchPlaceholder = "Buscar en la tabla...",
  onSearchChange,
}: DataTableProps<TData>) {
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [searchValue, setSearchValue] = useState(globalFilter);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      globalFilter: searchValue,
      columnFilters,
      columnVisibility,
      pagination,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  const handleSearchChange = (value: string) => {
    setSearchValue(value);
    if (onSearchChange) {
      onSearchChange(value);
    }
    table.setPageIndex(0);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] bg-[#ffffff] rounded-2xl border border-[rgba(30,58,95,0.09)] shadow-md font-sans">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#e8740e] mb-4"></div>
        <p className="text-[#1e3a5f] font-bold">Cargando datos...</p>
        <p className="text-sm text-[#6b7a8d] mt-1">
          Por favor espera un momento
        </p>
      </div>
    );
  }

  const totalRows = data.length;
  const filteredRows = table.getFilteredRowModel().rows.length;
  const pageCount = table.getPageCount();
  const currentPage = table.getState().pagination.pageIndex + 1;
  const pageSize = table.getState().pagination.pageSize;
  const startRow = table.getState().pagination.pageIndex * pageSize + 1;
  const endRow = Math.min(
    startRow + pageSize - 1,
    table.getFilteredRowModel().rows.length
  );

  return (
    <div className="space-y-4 font-sans text-[#2c3e50]">
      {/* Header con estadísticas y búsqueda */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-gradient-to-r from-[#1e3a5f] to-[#12243d] rounded-xl p-4 shadow-md">
        <div className="flex w-full flex-col items-start gap-4">
          <div className="flex flex-col sm:flex-row items-center justify-between w-full gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/10 rounded-lg">
                <div className="h-5 w-5 bg-[#e8740e] rounded-sm"></div>
              </div>
              <div>
                <h3 className="text-white font-bold text-lg tracking-tight">
                  Tabla de datos
                </h3>
                <p className="text-[#f3ede1]/80 text-sm">
                  Mostrando {startRow}-{endRow} de {filteredRows} registros
                  {filteredRows !== totalRows && ` (filtrados de ${totalRows})`}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-full">
              <div className="h-2 w-2 rounded-full bg-green-400 animate-pulse"></div>
              <span className="text-white text-sm font-medium">
                {filteredRows === totalRows ? "Sincronizado" : "Filtrado"}
              </span>
            </div>
          </div>

          {/* Barra de búsqueda */}
          {showSearch && (
            <div className="relative flex w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#f3ede1]/70" />
              <input
                type="text"
                value={searchValue}
                onChange={(e) => handleSearchChange(e.target.value)}
                placeholder={searchPlaceholder}
                className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-[#f3ede1]/60 focus:outline-none focus:ring-2 focus:ring-[#e8740e] focus:border-transparent transition-all"
              />
              {searchValue && (
                <button
                  onClick={() => handleSearchChange("")}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#f3ede1]/70 hover:text-white text-lg font-medium"
                >
                  ×
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Tabla */}
      <div className="overflow-hidden rounded-2xl border border-[rgba(30,58,95,0.09)] shadow-md bg-[#ffffff]">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              {table.getHeaderGroups().map((headerGroup) => (
                <tr
                  key={headerGroup.id}
                  className="bg-gradient-to-r from-[#f3ede1] to-[#f3ede1]/50 border-b border-[rgba(30,58,95,0.12)]"
                >
                  {headerGroup.headers.map((header, index) => (
                    <th
                      key={header.id}
                      className={`
                        px-6 py-4 text-left text-sm font-bold text-[#1e3a5f] uppercase tracking-wider
                        ${index === 0 ? "rounded-tl-2xl" : ""}
                        ${
                          index === headerGroup.headers.length - 1
                            ? "rounded-tr-2xl"
                            : ""
                        }
                        border-r border-[rgba(30,58,95,0.08)] last:border-r-0
                      `}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="h-1.5 w-1.5 rounded-full bg-[#e8740e]"></div>
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                        </div>
                        {header.column.getCanSort() && (
                          <button
                            onClick={header.column.getToggleSortingHandler()}
                            className="ml-2 p-1 hover:bg-[#1e3a5f]/10 rounded transition-colors"
                            title={
                              header.column.getNextSortingOrder() === "asc"
                                ? "Ordenar ascendente"
                                : header.column.getNextSortingOrder() === "desc"
                                ? "Ordenar descendente"
                                : "Limpiar orden"
                            }
                          >
                            {header.column.getIsSorted() === "asc" ? (
                              <ChevronUp className="h-4 w-4 text-[#e8740e]" />
                            ) : header.column.getIsSorted() === "desc" ? (
                              <ChevronDown className="h-4 w-4 text-[#e8740e]" />
                            ) : (
                              <ChevronsUpDown className="h-4 w-4 text-[#6b7a8d]" />
                            )}
                          </button>
                        )}
                      </div>
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="divide-y divide-[rgba(30,58,95,0.06)]">
              {table.getRowModel().rows.length > 0 ? (
                table.getRowModel().rows.map((row, rowIndex) => (
                  <tr
                    key={row.id}
                    className={`
                      group hover:bg-gradient-to-r hover:from-[#f3ede1]/40 hover:to-[#f3ede1]/10 
                      transition-all duration-200
                      ${rowIndex % 2 === 0 ? "bg-[#ffffff]" : "bg-[#f3ede1]/10"}
                    `}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td
                        key={cell.id}
                        className="px-6 py-4 whitespace-nowrap text-sm text-[#2c3e50] group-hover:text-[#1e3a5f] transition-colors"
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={columns.length}
                    className="px-6 py-12 text-center"
                  >
                    <div className="flex flex-col items-center justify-center max-w-md mx-auto">
                      <div className="p-3 bg-[#f3ede1] rounded-full mb-4">
                        <AlertCircle className="h-8 w-8 text-[#e8740e]" />
                      </div>
                      <h4 className="text-lg font-bold text-[#1e3a5f] mb-2">
                        {searchValue
                          ? "No se encontraron resultados"
                          : "No se encontraron datos"}
                      </h4>
                      <p className="text-[#6b7a8d] text-sm mb-4 font-medium">
                        {searchValue
                          ? "Intenta con otros términos de búsqueda"
                          : "No hay registros para mostrar en este momento"}
                      </p>
                      {searchValue && (
                        <button
                          onClick={() => handleSearchChange("")}
                          className="px-4 py-2 text-sm bg-[#e8740e] hover:bg-[#c2600b] text-white rounded-lg font-bold shadow-sm transition-colors"
                        >
                          Limpiar búsqueda
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer de la tabla */}
        {table.getRowModel().rows.length > 0 && (
          <div className="bg-gradient-to-r from-[#ffffff] to-[#f3ede1]/30 border-t border-[rgba(30,58,95,0.09)] px-6 py-4">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              {/* Información de paginación */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div>
                  <p className="text-sm text-[#2c3e50] font-medium">
                    Mostrando{" "}
                    <span className="text-[#e8740e] font-bold">
                      {startRow}-{endRow}
                    </span>{" "}
                    de{" "}
                    <span className="text-[#1e3a5f] font-bold">
                      {filteredRows}
                    </span>{" "}
                    registros
                  </p>
                </div>

                {/* Selector de página */}
                <div className="flex items-center gap-2">
                  <span className="text-sm text-[#6b7a8d] font-medium">Filas por página:</span>
                  <select
                    value={table.getState().pagination.pageSize}
                    onChange={(e) => {
                      table.setPageSize(Number(e.target.value));
                    }}
                    className="border border-[rgba(30,58,95,0.15)] rounded-lg px-2 py-1 text-sm bg-[#ffffff] text-[#2c3e50] focus:outline-none focus:ring-2 focus:ring-[#e8740e]"
                  >
                    {[5, 10, 20, 30, 40, 50].map((pageSize) => (
                      <option key={pageSize} value={pageSize}>
                        {pageSize}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Indicadores de estado */}
                <div className="flex items-center gap-2">
                  {searchValue && (
                    <div className="flex items-center gap-2 px-2.5 py-1 bg-[#f3ede1] text-[#1e3a5f] text-xs font-bold rounded-full border border-[rgba(30,58,95,0.06)]">
                      <Filter className="h-3 w-3 text-[#e8740e]" />
                      <span>Búsqueda activa</span>
                    </div>
                  )}
                  {sorting.length > 0 && (
                    <div className="flex items-center gap-2 px-2.5 py-1 bg-[#c89b14]/10 text-[#c89b14] text-xs font-bold rounded-full border border-[#c89b14]/20">
                      <ChevronUp className="h-3 w-3" />
                      <span>
                        Ordenado por:{" "}
                        {sorting
                          .map((s) => s.id)
                          .join(", ")
                          .replace(/_/g, " ")}
                      </span>
                      <button
                        onClick={() => setSorting([])}
                        className="text-[#e8740e] hover:text-[#c2600b] ml-1 font-black"
                        title="Limpiar orden"
                      >
                        ×
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Controles de paginación */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => table.setPageIndex(0)}
                  disabled={!table.getCanPreviousPage()}
                  className={`p-2 rounded-lg transition-colors ${
                    table.getCanPreviousPage()
                      ? "hover:bg-[#f3ede1] text-[#1e3a5f]"
                      : "text-[#6b7a8d]/30 cursor-not-allowed"
                  }`}
                  title="Primera página"
                >
                  <ChevronsLeft className="h-4 w-4" />
                </button>
                <button
                  onClick={() => table.previousPage()}
                  disabled={!table.getCanPreviousPage()}
                  className={`p-2 rounded-lg transition-colors ${
                    table.getCanPreviousPage()
                      ? "hover:bg-[#f3ede1] text-[#1e3a5f]"
                      : "text-[#6b7a8d]/30 cursor-not-allowed"
                  }`}
                  title="Página anterior"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>

                <div className="flex items-center gap-1 mx-2">
                  <span className="text-sm text-[#6b7a8d]">Página</span>
                  <span className="font-bold text-[#e8740e] mx-1">
                    {currentPage}
                  </span>
                  <span className="text-sm text-[#6b7a8d]">de</span>
                  <span className="font-bold text-[#1e3a5f] mx-1">
                    {pageCount}
                  </span>
                </div>

                <button
                  onClick={() => table.nextPage()}
                  disabled={!table.getCanNextPage()}
                  className={`p-2 rounded-lg transition-colors ${
                    table.getCanNextPage()
                      ? "hover:bg-[#f3ede1] text-[#1e3a5f]"
                      : "text-[#6b7a8d]/30 cursor-not-allowed"
                  }`}
                  title="Página siguiente"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
                <button
                  onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                  disabled={!table.getCanNextPage()}
                  className={`p-2 rounded-lg transition-colors ${
                    table.getCanNextPage()
                      ? "hover:bg-[#f3ede1] text-[#1e3a5f]"
                      : "text-[#6b7a8d]/30 cursor-not-allowed"
                  }`}
                  title="Última página"
                >
                  <ChevronsRight className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Barra de progreso */}
            <div className="mt-4 flex items-center gap-2">
              <div className="flex-1 h-2 bg-[#f3ede1] rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#e8740e] to-[#c2600b] rounded-full transition-all duration-300"
                  style={{
                    width: `${Math.min(
                      100,
                      (filteredRows / Math.max(1, totalRows)) * 100
                    )}%`,
                  }}
                ></div>
              </div>
              <span className="text-xs text-[#6b7a8d] font-bold whitespace-nowrap">
                {Math.min(
                  100,
                  Math.round((filteredRows / Math.max(1, totalRows)) * 100)
                )}
                % visible
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}