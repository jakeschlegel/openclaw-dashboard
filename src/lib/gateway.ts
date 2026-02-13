const GATEWAY_URL = process.env.OPENCLAW_GATEWAY_URL || "http://localhost:19000";
const GATEWAY_TOKEN = process.env.OPENCLAW_GATEWAY_TOKEN || "";

interface GatewayOptions {
  method?: string;
  body?: unknown;
  path: string;
}

export async function gateway<T = unknown>({
  method = "GET",
  body,
  path,
}: GatewayOptions): Promise<T> {
  const url = `${GATEWAY_URL}${path}`;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (GATEWAY_TOKEN) {
    headers["Authorization"] = `Bearer ${GATEWAY_TOKEN}`;
  }

  const res = await fetch(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
    cache: "no-store",
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "Unknown error");
    throw new Error(`Gateway ${method} ${path} failed (${res.status}): ${text}`);
  }

  const contentType = res.headers.get("content-type");
  if (contentType?.includes("application/json")) {
    return res.json() as Promise<T>;
  }

  return res.text() as unknown as T;
}
