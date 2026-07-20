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
 * Precedence: Explicit options > Signal-specific env > Global env > Built-in defaults.
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

  // Endpoint resolution hierarchy
  let endpoint = options.otlp?.endpoint || env.VOID_OTLP_ENDPOINT;

  if (!endpoint) {
    if (env.OTEL_EXPORTER_OTLP_TRACES_ENDPOINT) {
      endpoint = env.OTEL_EXPORTER_OTLP_TRACES_ENDPOINT;
    } else if (env.OTEL_EXPORTER_OTLP_ENDPOINT) {
      // Global OTel base endpoint gets /v1/traces per OpenTelemetry OTLP HTTP specification
      const base = env.OTEL_EXPORTER_OTLP_ENDPOINT.replace(/\/+$/, '');
      endpoint = base.endsWith('/v1/traces') ? base : `${base}/v1/traces`;
    } else {
      endpoint = 'http://localhost:4318/v1/traces';
    }
  }

  // Header resolution: Environment headers act as defaults; explicit options override them.
  const headers: Record<string, string> = {};

  if (env.VOID_OTLP_HEADERS) {
    const pairs = env.VOID_OTLP_HEADERS.split(',');
    for (const pair of pairs) {
      const eqIdx = pair.indexOf('=');
      if (eqIdx > 0) {
        const key = pair.slice(0, eqIdx).trim();
        const val = pair.slice(eqIdx + 1).trim();
        if (key && val) {
          headers[key] = val;
        }
      }
    }
  }

  if (options.otlp?.headers) {
    Object.assign(headers, options.otlp.headers);
  }

  return {
    serviceName,
    environment,
    endpoint,
    headers,
    disabled: options.disabled ?? env.VOID_DISABLED === 'true',
  };
}
