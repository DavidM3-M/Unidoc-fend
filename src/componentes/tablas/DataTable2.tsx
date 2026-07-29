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

  // Helper: lee la clase responsiva opcional definida en column.meta.className
  // Permite ocultar columnas en breakpoints específicos, ej:
  // meta: { className: "hidden md:table-cell" }
  const getColumnMetaClassName = (columnDef: ColumnDef<TData, any>) => {
    const meta = columnDef.meta as { className?: string } | undefined;
    return meta?.className ?? "";
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] bg-[var(--color-background)] rounded-2xl border border-[var(--color-border)] shadow-sm">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[var(--color-navy)] mb-4"></div>
        <p className="text-[var(--color-text)] font-medium">Cargando datos...</p>
        <p className="text-sm text-[var(--color-text-muted)] mt-1">
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
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-gradient-to-r from-[var(--color-navy)] to-[var(--color-navy-dark)] rounded-xl p-4 shadow-lg">
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
                <p className="text-[var(--color-beige)] text-sm">
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
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[var(--color-beige)]/80" />
              <input
                type="text"
                value={searchValue}
                onChange={(e) => handleSearchChange(e.target.value)}
                placeholder={searchPlaceholder}
                className="w-full pl-10 pr-4 py-2 bg-white/10 border border-[var(--color-beige)]/30 rounded-lg text-white placeholder-[var(--color-beige)]/80 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50 transition-all"
              />
              {searchValue && (
                <button
                  onClick={() => handleSearchChange("")}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[var(--color-beige)]/80 hover:text-white"
                >
                  ×
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Tabla */}
      <div className="overflow-hidden rounded-2xl border border-[var(--color-border)] shadow-lg bg-[var(--color-surface)]">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              {table.getHeaderGroups().map((headerGroup) => (
                <tr
                  key={headerGroup.id}
                  className="bg-gradient-to-r from-[var(--color-beige)] to-[var(--color-background)] border-b border-[var(--color-border)]"
                >
                  {headerGroup.headers.map((header, index) => (
                    <th
                      key={header.id}
                      className={`
                        px-3 sm:px-4 md:px-6 py-3 md:py-4 text-left text-xs sm:text-sm font-semibold text-[var(--color-navy)] uppercase tracking-wider
                        ${index === 0 ? "rounded-tl-2xl" : ""}
                        ${
                          index === headerGroup.headers.length - 1
                            ? "rounded-tr-2xl"
                            : ""
                        }
                        border-r border-[var(--color-border)] last:border-r-0
                        ${getColumnMetaClassName(header.column.columnDef)}
                      `}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="h-1.5 w-1.5 rounded-full bg-[var(--color-warning)]"></div>
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                        </div>
                        {header.column.getCanSort() && (
                          <button
                            onClick={header.column.getToggleSortingHandler()}
                            className="ml-2 p-1 hover:bg-[var(--color-beige)] rounded transition-colors"
                            title={
                              header.column.getNextSortingOrder() === "asc"
                                ? "Ordenar ascendente"
                                : header.column.getNextSortingOrder() === "desc"
                                ? "Ordenar descendente"
                                : "Limpiar orden"
                            }
                          >
                            {header.column.getIsSorted() === "asc" ? (
                              <ChevronUp className="h-4 w-4 text-[var(--color-navy)]" />
                            ) : header.column.getIsSorted() === "desc" ? (
                              <ChevronDown className="h-4 w-4 text-[var(--color-navy)]" />
                            ) : (
                              <ChevronsUpDown className="h-4 w-4 text-[var(--color-text-muted)]" />
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
                      group hover:bg-gradient-to-r hover:from-[var(--color-beige)]/50 hover:to-[var(--color-background)]
                      transition-all duration-200
                      ${rowIndex % 2 === 0 ? "bg-[var(--color-surface)]" : "bg-[var(--color-background)]/70"}
                    `}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td
                        key={cell.id}
                        className={`px-3 sm:px-4 md:px-6 py-3 md:py-4 whitespace-nowrap text-sm text-[var(--color-text)] group-hover:text-[var(--color-text)] transition-colors ${getColumnMetaClassName(
                          cell.column.columnDef
                        )}`}
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
                      <div className="p-3 bg-[var(--color-beige)] rounded-full mb-4">
                        <AlertCircle className="h-8 w-8 text-[var(--color-navy)]" />
                      </div>
                      <h4 className="text-lg font-semibold text-[var(--color-text)] mb-2">
                        {searchValue
                          ? "No se encontraron resultados"
                          : "No se encontraron datos"}
                      </h4>
                      <p className="text-[var(--color-text-muted)] text-sm mb-4">
                        {searchValue
                          ? "Intenta con otros términos de búsqueda"
                          : "No hay registros para mostrar en este momento"}
                      </p>
                      {searchValue && (
                        <button
                          onClick={() => handleSearchChange("")}
                          className="px-4 py-2 text-sm bg-[var(--color-navy)] hover:bg-[var(--color-navy-dark)] text-white rounded-lg font-medium transition-colors"
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
          <div className="bg-gradient-to-r from-[var(--color-background)] to-[var(--color-beige)] border-t border-[var(--color-border)] px-6 py-3">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              {/* Información de paginación */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div>
                  <p className="text-sm text-[var(--color-text-muted)] font-medium">
                    Mostrando{" "}
                    <span className="text-[var(--color-navy)] font-bold">
                      {startRow}-{endRow}
                    </span>{" "}
                    de{" "}
                    <span className="text-[var(--color-text)] font-bold">
                      {filteredRows}
                    </span>{" "}
                    registros
                  </p>
                </div>

                {/* Selector de página */}
                <div className="flex items-center gap-2">
                  <span className="text-sm text-[var(--color-text-muted)]">Filas por página:</span>
                  <select
                    value={table.getState().pagination.pageSize}
                    onChange={(e) => {
                      table.setPageSize(Number(e.target.value));
                    }}
                    className="border border-[var(--color-border)] rounded px-2 py-1 text-sm bg-[var(--color-surface)] text-[var(--color-text)]"
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