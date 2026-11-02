import { getSession } from "./session";
export async function isAdmin() { return (await getSession())?.role === "SUPERADMIN"; }
