export const CURRENCY = "₦"; // change to your currency symbol
export const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
export const money = (n) => CURRENCY + Number(n).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
export const sum = (c) => Math.round(c.donations.reduce((t, d) => t + d.amount, 0) * 100) / 100;
export const total = (list) => Math.round(list.reduce((t, c) => t + sum(c), 0) * 100) / 100;
export function groups(contributions) {
  const m = new Map();
  for (const c of contributions) {
    const k = c.group ? "g:" + c.group : "s:" + c.id;
    if (!m.has(k)) m.set(k, { name: c.group || c.title, items: [] });
    m.get(k).items.push(c);
  }
  return [...m.values()];
}
export async function api(path, method = "GET", body, pw) {
  const r = await fetch("/api/" + path, {
    method,
    headers: { "content-type": "application/json", ...(pw ? { "x-admin-password": pw } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  });
  const j = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(j.error || "Something went wrong");
  return j;
}
