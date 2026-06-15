export function parsePagination(query) {
  const page = Math.max(1, parseInt(query.page) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(query.limit) || 20));
  const skip = (page - 1) * limit;
  return { page, limit, skip };
}

export function buildSearchFilter(query, fields) {
  if (!query || !query.trim()) return {};
  const regex = new RegExp(query.trim(), "i");
  return { $or: fields.map((f) => ({ [f]: regex })) };
}

export function formatResponse(data, meta = {}, message = "Success") {
  return { data, meta, message };
}

export function formatError(message, errors = null) {
  const resp = { message };
  if (errors) resp.errors = errors;
  return resp;
}
