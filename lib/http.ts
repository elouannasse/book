export class HttpError extends Error {
  status: number;
  url: string;

  constructor(status: number, url: string, message?: string) {
    super(message ?? `Request failed: ${status}`);
    this.name = "HttpError";
    this.status = status;
    this.url = url;
  }
}

async function buildErrorMessage(response: Response): Promise<string> {
  const contentType = response.headers.get("content-type") ?? "";

  if (contentType.includes("application/json")) {
    try {
      const data = (await response.json()) as { message?: string; error?: string };
      if (data.message) return data.message;
      if (data.error) return data.error;
    } catch {
      return `Request failed: ${response.status}`;
    }
  }

  try {
    const text = await response.text();
    if (text.trim()) {
      return text;
    }
  } catch {
    return `Request failed: ${response.status}`;
  }

  return `Request failed: ${response.status}`;
}

export async function fetchJson<T>(input: string, init?: RequestInit): Promise<T> {
  const response = await fetch(input, init);

  if (!response.ok) {
    const message = await buildErrorMessage(response);
    throw new HttpError(response.status, input, message);
  }

  return (await response.json()) as T;
}