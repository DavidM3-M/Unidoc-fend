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
    // Resetear a la primera página cuando se busca
    table.setPageIndex(0);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] bg-gradient-to-br from-blue-50/50 to-white rounded-2xl border border-gray-200 shadow-sm">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mb-4"></div>
        <p className="text-gray-600 font-medium">Cargando datos...</p>
        <p className="text-sm text-gray-500 mt-1">
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
    <div className="space-y-4">
      {/* Header con estadísticas y búsqueda */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-4 shadow-lg">
        <div className="flex w-full flex-col items-start gap-4">
          <div className="flex flex-col sm:flex-row items-center justify-between w-full gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-lg">
                <div className="h-5 w-5 bg-white rounded-sm"></div>
              </div>
              <div>
                <h3 className="text-white font-semibold text-lg">
                  Tabla de datos
                </h3>
                <p className="text-blue-100 text-sm">
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
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-blue-300" />
              <input
                type="text"
                value={searchValue}
                onChange={(e) => handleSearchChange(e.target.value)}
                placeholder={searchPlaceholder}
                className="w-full pl-10 pr-4 py-2 bg-white/10 border border-blue-400/30 rounded-lg text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50 transition-all"
              />
              {searchValue && (
                <button
                  onClick={() => handleSearchChange("")}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-blue-200 hover:text-white"
                >
                  ×
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Tabla */}
      <div className="overflow-hidden rounded-2xl border border-gray-200 shadow-lg bg-white">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              {table.getHeaderGroups().map((headerGroup) => (
                <tr
                  key={headerGroup.id}
                  className="bg-gradient-to-r from-blue-50 to-blue-100/80 border-b border-blue-200"
                >
                  {headerGroup.headers.map((header, index) => (
                    <th
                      key={header.id}
                      className={`
                        px-6 py-4 text-left text-sm font-semibold text-blue-900 uppercase tracking-wider
                        ${index === 0 ? "rounded-tl-2xl" : ""}
                        ${
                          index === headerGroup.headers.length - 1
                            ? "rounded-tr-2xl"
                            : ""
                        }
                        border-r border-blue-200 last:border-r-0
                      `}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="h-1.5 w-1.5 rounded-full bg-blue-600"></div>
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                        </div>
                        {header.column.getCanSort() && (
                          <button
                            onClick={header.column.getToggleSortingHandler()}
                            className="ml-2 p-1 hover:bg-blue-200/50 rounded transition-colors"
                            title={
                              header.column.getNextSortingOrder() === "asc"
                                ? "Ordenar ascendente"
                                : header.column.getNextSortingOrder() === "desc"
                                ? "Ordenar descendente"
                                : "Limpiar orden"
                            }
                          >
                            {header.column.getIsSorted() === "asc" ? (
                              <ChevronUp className="h-4 w-4 text-blue-700" />
                            ) : header.column.getIsSorted() === "desc" ? (
                              <ChevronDown className="h-4 w-4 text-blue-700" />
                            ) : (
                              <ChevronsUpDown className="h-4 w-4 text-blue-500" />
                            )}
                          </button>
                        )}
                      </div>
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="divide-y divide-gray-100">
              {table.getRowModel().rows.length > 0 ? (
                table.getRowModel().rows.map((row, rowIndex) => (
                  <tr
                    key={row.id}
                    className={`
                      group hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-blue-100/30 
                      transition-all duration-200
                      ${rowIndex % 2 === 0 ? "bg-white" : "bg-gray-50/50"}
                    `}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td
                        key={cell.id}
                        className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 group-hover:text-gray-900 transition-colors"
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
                      <div className="p-3 bg-blue-100 rounded-full mb-4">
                        <AlertCircle className="h-8 w-8 text-blue-600" />
                      </div>
                      <h4 className="text-lg font-semibold text-gray-800 mb-2">
                        {searchValue
                          ? "No se encontraron resultados"
                          : "No se encontraron datos"}
                      </h4>
                      <p className="text-gray-600 text-sm mb-4">
                        {searchValue
                          ? "Intenta con otros términos de búsqueda"
                          : "No hay registros para mostrar en este momento"}
                      </p>
                      {searchValue && (
                        <button
                          onClick={() => handleSearchChange("")}
                          className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
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
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 border-t border-gray-200 px-6 py-3">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              {/* Información de paginación */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div>
                  <p className="text-sm text-gray-600 font-medium">
                    Mostrando{" "}
                    <span className="text-blue-700 font-bold">
                      {startRow}-{endRow}
                    </span>{" "}
                    de{" "}
                    <span className="text-gray-700 font-bold">
                      {filteredRows}
                    </span>{" "}
                    registros
                  </p>
                </div>

                {/* Selector de página */}
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">Filas por página:</span>
                  <select
                    value={table.getState().pagination.pageSize}
                    onChange={(e) => {
                      table.setPageSize(Number(e.target.value));
                    }}
                    className="border border-gray-300 rounded px-2 py-1 text-sm bg-white"
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
                    <div className="flex items-center gap-2 px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-full">
                      <Filter className="h-3 w-3" />
                      <span>Búsqueda activa</span>
                    </div>
                  )}
                  {sorting.length > 0 && (
                    <div className="flex items-center gap-2 px-2 py-1 bg-green-50 text-green-700 text-xs rounded-full">
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
                        className="text-green-500 hover:text-green-700"
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
                  className={`p-2 rounded-lg ${
                    table.getCanPreviousPage()
                      ? "hover:bg-gray-200 text-gray-700"
                      : "text-gray-400 cursor-not-allowed"
                  }`}
                  title="Primera página"
                >
                  <ChevronsLeft className="h-4 w-4" />
                </button>
                <button
                  onClick={() => table.previousPage()}
                  disabled={!table.getCanPreviousPage()}
                  className={`p-2 rounded-lg ${
                    table.getCanPreviousPage()
                      ? "hover:bg-gray-200 text-gray-700"
                      : "text-gray-400 cursor-not-allowed"
                  }`}
                  title="Página anterior"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>

                <div className="flex items-center gap-1 mx-2">
                  <span className="text-sm text-gray-600">Página</span>
                  <span className="font-semibold text-blue-700 mx-1">
                    {currentPage}
                  </span>
                  <span className="text-sm text-gray-600">de</span>
                  <span className="font-semibold text-gray-700 mx-1">
                    {pageCount}
                  </span>
                </div>

                <button
                  onClick={() => table.nextPage()}
                  disabled={!table.getCanNextPage()}
                  className={`p-2 rounded-lg ${
                    table.getCanNextPage()
                      ? "hover:bg-gray-200 text-gray-700"
                      : "text-gray-400 cursor-not-allowed"
                  }`}
                  title="Página siguiente"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
                <button
                  onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                  disabled={!table.getCanNextPage()}
                  className={`p-2 rounded-lg ${
                    table.getCanNextPage()
                      ? "hover:bg-gray-200 text-gray-700"
                      : "text-gray-400 cursor-not-allowed"
                  }`}
                  title="Última página"
                >
                  <ChevronsRight className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Barra de progreso */}
            <div className="mt-3 flex items-center gap-2">
              <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-300"
                  style={{
                    width: `${Math.min(
                      100,
                      (filteredRows / Math.max(1, totalRows)) * 100
                    )}%`,
                  }}
                ></div>
              </div>
              <span className="text-xs text-gray-500 font-medium whitespace-nowrap">
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