function isLocalhost(hostname: string): boolean {
  return hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '::1';
}

function normalizeBaseUrl(baseUrl: string): string {
  return baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
}

export function getApiUrl(): string {
  const envUrl = import.meta.env.VITE_API_URL as string | undefined;

  if (envUrl && envUrl.trim().length > 0) {
    return normalizeBaseUrl(envUrl.trim());
  }

  if (typeof window !== 'undefined' && isLocalhost(window.location.hostname)) {
    return 'http://localhost:3001/api';
  }

  if (typeof window !== 'undefined') {
    return normalizeBaseUrl(`${window.location.origin}/api`);
  }

  return 'http://localhost:3001/api';
}

export function getBackendUnavailableMessage(): string {
  const apiUrl = getApiUrl();

  if (typeof window !== 'undefined' && isLocalhost(window.location.hostname)) {
    return `Servidor nao esta disponivel. Verifique se o backend esta rodando em ${apiUrl}`;
  }

  return 'Servidor indisponivel. Verifique a configuracao de VITE_API_URL no deploy.';
}
