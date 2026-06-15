import React, { useState } from "react";

export default function DataTable({
  columns = [],
  rows = [],
  loading = false,
  pagination = null,
  onPageChange,
  onSearch,
  onSort,
  filters = null,
  actions = null,
}) {
  const [searchVal, setSearchVal] = useState("");
  const [sortKey, setSortKey] = useState(null);
  const [sortDir, setSortDir] = useState("asc");

  function handleSearch(e) {
    e.preventDefault();
    onSearch?.(searchVal);
  }

  function handleSort(key) {
    if (!onSort) return;
    const newDir = sortKey === key && sortDir === "asc" ? "desc" : "asc";
    setSortKey(key);
    setSortDir(newDir);
    onSort(key, newDir);
  }

  return (
    <div className="dt-wrapper">
      <div className="dt-toolbar">
        {onSearch && (
          <form className="dt-search" onSubmit={handleSearch}>
            <input
              className="input"
              placeholder="Search..."
              value={searchVal}
              onChange={(e) => setSearchVal(e.target.value)}
            />
            <button type="submit" className="btn" style={{ flexShrink: 0 }}>
              Search
            </button>
            {searchVal && (
              <button
                type="button"
                className="btn secondary"
                style={{ flexShrink: 0 }}
                onClick={() => { setSearchVal(""); onSearch(""); }}
              >
                Clear
              </button>
            )}
          </form>
        )}
        <div className="dt-toolbar-right">
          {filters}
          {actions}
        </div>
      </div>

      <div className="dt-table-wrap">
        <table className="dt-table">
          <thead>
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  onClick={() => onSort && handleSort(col.key)}
                  className={onSort ? "dt-sortable" : ""}
                >
                  {col.label}
                  {sortKey === col.key && (
                    <span className="dt-sort-arrow">
                      {sortDir === "asc" ? " ▲" : " ▼"}
                    </span>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>
                  {columns.map((col) => (
                    <td key={col.key}>
                      <div className="dt-skeleton" />
                    </td>
                  ))}
                </tr>
              ))
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="dt-empty">
                  No records found
                </td>
              </tr>
            ) : (
              rows.map((row, ri) => (
                <tr key={row._id || ri}>
                  {columns.map((col) => (
                    <td key={col.key}>
                      {col.render ? col.render(row) : row[col.key] ?? "—"}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {pagination && pagination.pages > 1 && (
        <div className="dt-pagination">
          <button
            className="btn secondary"
            disabled={pagination.page <= 1}
            onClick={() => onPageChange(pagination.page - 1)}
          >
            Prev
          </button>
          <span className="dt-page-info">
            Page {pagination.page} of {pagination.pages} ({pagination.total} total)
          </span>
          <button
            className="btn secondary"
            disabled={pagination.page >= pagination.pages}
            onClick={() => onPageChange(pagination.page + 1)}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
