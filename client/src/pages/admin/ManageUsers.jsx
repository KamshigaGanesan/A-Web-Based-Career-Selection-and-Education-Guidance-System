import React, { useEffect, useState, useCallback } from "react";
import adminApi from "../../services/adminApi.js";
import Sidebar from "../../components/admin/Sidebar.jsx";
import DataTable from "../../components/admin/DataTable.jsx";

export default function ManageUsers() {
  const [rows, setRows] = useState([]);
  const [meta, setMeta] = useState({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await adminApi.get("/users", { params: { search, page, limit: 15 } });
      setRows(data.data);
      setMeta(data.meta);
    } catch (err) { console.error(err); }
    setLoading(false);
  }, [search, page]);

  useEffect(() => { fetchData(); }, [fetchData]);

  async function handleDelete(id) {
    if (!confirm("Delete this user? This action is permanent.")) return;
    try {
      await adminApi.delete(`/users/${id}`);
      fetchData();
    } catch (err) { console.error(err); }
  }

  const columns = [
    { key: "name", label: "Name" },
    { key: "email", label: "Email" },
    { key: "authProvider", label: "Provider", render: (r) => (
      <span className="pill" style={{ fontSize: 11 }}>{r.authProvider || "local"}</span>
    )},
    { key: "createdAt", label: "Joined", render: (r) => r.createdAt ? new Date(r.createdAt).toLocaleDateString() : "—" },
    { key: "actions", label: "Actions", render: (r) => (
      <div style={{ display: "flex", gap: 6 }}>
        <button className="btn secondary" style={{ color: "#dc2626" }} onClick={() => handleDelete(r._id)}>
          Delete
        </button>
      </div>
    )},
  ];

  return (
    <div className="admin-layout">
      <Sidebar />
      <main className="admin-main">
        <h1 style={{ margin: "0 0 20px" }}>Manage Users</h1>
        <DataTable
          columns={columns}
          rows={rows}
          loading={loading}
          pagination={meta}
          onPageChange={setPage}
          onSearch={setSearch}
        />
      </main>
    </div>
  );
}
