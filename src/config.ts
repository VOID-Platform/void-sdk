export interface OTLPOptions {
  endpoint?: string;
  headers?: Record<string, string>;
}

export interface VoidOptions {
  serviceName?: string;
  environment?: string;
  otlp?: OTLPOptions;
  disabled?: boolean;
}

export interface ResolvedVoidConfig {
  serviceName: string;
  environment: string;
  endpoint: string;
  headers: Record<string, string>;
  disabled: boolean;
}

/**
 * Resolves SDK configuration merging user options with environment variable defaults.
 */
export function resolveConfig(options: VoidOptions = {}): ResolvedVoidConfig {
  const env = typeof process !== 'undefined' ? process.env : {};

  const serviceName =
    options.serviceName ||
    env.VOID_SERVICE_NAME ||
    env.OTEL_SERVICE_NAME ||
    'void-agent-service';

  const environment =
    options.environment ||
    env.VOID_ENVIRONMENT ||
    env.NODE_ENV ||
    'development';

  let endpoint =
    options.otlp?.endpoint ||
    env.VOID_OTLP_ENDPOINT ||
    env.OTEL_EXPORTER_OTLP_ENDPOINT ||
    'http://localhost:4318/v1/traces';

  // Ensure endpoint ends with /v1/traces if port 4318 without explicit path
  if (endpoint.endsWith(':4318') || endpoint.endsWith(':4318/')) {
    endpoint = endpoint.replace(/\/$/, '') + '/v1/traces';
  }

  const headers: Record<string, string> = {
    ...options.otlp?.headers,
  };

  if (env.VOID_OTLP_HEADERS) {
    const pairs = env.VOID_OTLP_HEADERS.split(',');
    for (const pair of pairs) {
      const [key, val] = pair.split('=').map((s) => s.trim());
      if (key && val) {
        headers[key] = val;
      }
    }
  }

  return {
    serviceName,
    environment,
    endpoint,
    headers,
    disabled: options.disabled ?? env.VOID_DISABLED === 'true',
  };
}
