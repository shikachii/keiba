import { useEffect, useState } from 'react';

// dev(Vite middleware)・本番(GitHub Pages静的JSON)のどちらでも同じ相対パス構造で
// 取得できるようにBASE_URLを介して組み立てる。本番ビルドではvite.config.tsのbaseが
// リポジトリ名を含むパスになるため、絶対パス "/api/..." 決め打ちにはできない。
export function apiUrl(relativePath: string): string {
  return `${import.meta.env.BASE_URL}api/${relativePath}`;
}

interface ApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

export function useApi<T>(url: string | null): ApiState<T> {
  const [state, setState] = useState<ApiState<T>>({ data: null, loading: url !== null, error: null });

  useEffect(() => {
    if (url === null) {
      setState({ data: null, loading: false, error: null });
      return;
    }
    let cancelled = false;
    setState({ data: null, loading: true, error: null });

    fetch(url)
      .then(async (res) => {
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.error ?? `HTTP ${res.status}`);
        }
        return res.json() as Promise<T>;
      })
      .then((data) => {
        if (!cancelled) setState({ data, loading: false, error: null });
      })
      .catch((err: Error) => {
        if (!cancelled) setState({ data: null, loading: false, error: err.message });
      });

    return () => {
      cancelled = true;
    };
  }, [url]);

  return state;
}
