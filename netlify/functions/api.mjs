import { getStore } from "@netlify/blobs";
import { timingSafeEqual, randomUUID } from "node:crypto";

const store = () => getStore({ name: "contributions", consistency: "strong" });
const load = async () => (await store().get("data", { type: "json" })) || { contributions: [] };
const save = (d) => store().setJSON("data", d);
const json = (o, s = 200) =>
  new Response(JSON.stringify(o), { status: s, headers: { "content-type": "application/json", "cache-control": "no-store" } });

function isAdmin(req) {
  const a = Buffer.from(process.env.ADMIN_PASSWORD || "");
  const b = Buffer.from(req.headers.get("x-admin-password") || "");
  return a.length > 0 && a.length === b.length && timingSafeEqual(a, b);
}

export default async (req) => {
  const [res, id1, id2] = new URL(req.url).pathname.replace(/^\/api\/?/, "").split("/").filter(Boolean);

  if (req.method === "GET" && res === "data") return json(await load());
  if (!isAdmin(req)) return json({ error: "Wrong password" }, 401);
  if (res === "login") return json({ ok: true });

  const body = req.method === "POST" || req.method === "PUT" ? await req.json().catch(() => ({})) : {};
  const d = await load();

  if (req.method === "POST" && res === "contributions") {
    const title = String(body.title || "").trim().slice(0, 150);
    if (!title) return json({ error: "Title is required" }, 400);
    d.contributions.push({ id: randomUUID(), title, group: String(body.group || "").trim().slice(0, 100), donations: [] });
  } else if (req.method === "PUT" && res === "contributions") {
    const c = d.contributions.find((x) => x.id === id1);
    const title = String(body.title || "").trim().slice(0, 150);
    if (!c || !title) return json({ error: "Title is required" }, 400);
    c.title = title;
    c.group = String(body.group || "").trim().slice(0, 100);
  } else if (req.method === "POST" && res === "donations") {
    const c = d.contributions.find((x) => x.id === body.cid);
    const donor = String(body.donor || "").trim().slice(0, 120);
    const amount = Number(body.amount);
    if (!c || !donor || !(amount > 0)) return json({ error: "Donor and a valid amount are required" }, 400);
    c.donations.unshift({ id: randomUUID(), donor, amount, at: new Date().toISOString() });
  } else if (req.method === "PUT" && res === "donations") {
    const c = d.contributions.find((x) => x.id === id1);
    const x = c && c.donations.find((y) => y.id === id2);
    const donor = String(body.donor || "").trim().slice(0, 120);
    const amount = Number(body.amount);
    if (!x || !donor || !(amount > 0)) return json({ error: "Donor and a valid amount are required" }, 400);
    x.donor = donor;
    x.amount = amount;
  } else if (req.method === "DELETE" && res === "donations") {
    const c = d.contributions.find((x) => x.id === id1);
    if (c) c.donations = c.donations.filter((x) => x.id !== id2);
  } else if (req.method === "DELETE" && res === "contributions") {
    d.contributions = d.contributions.filter((x) => x.id !== id1);
  } else return json({ error: "Not found" }, 404);

  await save(d);
  return json(d);
};

export const config = { path: "/api/*" };
