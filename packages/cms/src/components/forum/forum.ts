// The habbo's own post box, which a preview shows, as the forum pages hold it in
// the data attributes of an element.
export interface Viewer {
  name: string;
  figure: string;
  motto: string;
  messages: string;
  badge: string;
  group: string;
  groupBadge: string;
  imaging: string;
}

export function viewerOf(data: DOMStringMap): Viewer {
  return {
    name: data.name ?? "",
    figure: data.figure ?? "",
    motto: data.motto ?? "",
    messages: data.messages ?? "0",
    badge: data.badge ?? "",
    group: data.group ?? "0",
    groupBadge: data.groupBadge ?? "",
    imaging: data.imaging ?? "",
  };
}

// now is the time in Holo's d-m-Y H:i:s, in UTC as the board shows its dates.
export function now(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(d.getUTCDate())}-${pad(d.getUTCMonth() + 1)}-${d.getUTCFullYear()} ${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}:${pad(d.getUTCSeconds())}`;
}

export async function post(path: string, body: object) {
  const response = await fetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(body),
  });
  const answer = (await response.json().catch(() => ({}))) as {
    location?: string;
    error?: string;
    html?: string;
    message?: string;
  };
  return { ok: response.ok, ...answer };
}

// go opens location, reloading when only its fragment differs from the page's.
export function go(location: string) {
  const next = new URL(location, window.location.href);
  if (next.pathname + next.search === window.location.pathname + window.location.search) {
    window.location.hash = next.hash;
    window.location.reload();
    return;
  }
  window.location.href = next.href;
}
