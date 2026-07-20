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
<<<<<<< HEAD
 * Precedence: Explicit options > Signal-specific env > Global env > Built-in defaults.
=======
>>>>>>> 15914ef (feat(sdk) : implemented sdk)
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

<<<<<<< HEAD
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
=======
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
>>>>>>> 15914ef (feat(sdk) : implemented sdk)

  if (env.VOID_OTLP_HEADERS) {
    const pairs = env.VOID_OTLP_HEADERS.split(',');
    for (const pair of pairs) {
<<<<<<< HEAD
      const eqIdx = pair.indexOf('=');
      if (eqIdx > 0) {
        const key = pair.slice(0, eqIdx).trim();
        const val = pair.slice(eqIdx + 1).trim();
        if (key && val) {
          headers[key] = val;
        }
=======
      const [key, val] = pair.split('=').map((s) => s.trim());
      if (key && val) {
        headers[key] = val;
>>>>>>> 15914ef (feat(sdk) : implemented sdk)
      }
    }
  }

<<<<<<< HEAD
  if (options.otlp?.headers) {
    Object.assign(headers, options.otlp.headers);
  }

=======
>>>>>>> 15914ef (feat(sdk) : implemented sdk)
  return {
    serviceName,
    environment,
    endpoint,
    headers,
    disabled: options.disabled ?? env.VOID_DISABLED === 'true',
  };
}
