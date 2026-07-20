import {
  trace,
<<<<<<< HEAD
  context,
=======
>>>>>>> 15914ef (feat(sdk) : implemented sdk)
  Span,
  SpanStatusCode,
  Tracer,
  AttributeValue,
  Attributes,
} from '@opentelemetry/api';
<<<<<<< HEAD
import { AsyncHooksContextManager } from '@opentelemetry/context-async-hooks';
import {
  BasicTracerProvider,
  BatchSpanProcessor,
  SimpleSpanProcessor,
  SpanExporter,
=======
import {
  BasicTracerProvider,
  BatchSpanProcessor,
>>>>>>> 15914ef (feat(sdk) : implemented sdk)
} from '@opentelemetry/sdk-trace-base';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { Resource } from '@opentelemetry/resources';
import { ATTR_SERVICE_NAME } from '@opentelemetry/semantic-conventions';
import { ResolvedVoidConfig } from './config';
import { SEMCONV } from './semconv';

export interface AgentOptions {
  name: string;
  role?: string;
  promptVersion?: string;
  attributes?: Record<string, unknown>;
}

export interface ToolOptions {
  name?: string;
  input?: unknown;
  attributes?: Record<string, unknown>;
}

<<<<<<< HEAD
/**
 * Safely serializes values to string without throwing on circular references or BigInts.
 */
function safeJsonStringify(val: unknown): string {
  if (val === undefined || val === null) return String(val);
  if (typeof val === 'string') return val;
  if (typeof val === 'bigint' || typeof val === 'symbol' || typeof val === 'function') {
    return String(val);
  }
  try {
    const cache = new Set();
    return JSON.stringify(val, (_key, value) => {
      if (typeof value === 'bigint') return value.toString();
      if (typeof value === 'object' && value !== null) {
        if (cache.has(value)) return '[Circular]';
        cache.add(value);
      }
      return value;
    });
  } catch {
    return String(val);
  }
}

=======
>>>>>>> 15914ef (feat(sdk) : implemented sdk)
export class TelemetryEngine {
  private provider: BasicTracerProvider | null = null;
  private tracer: Tracer | null = null;
  private isInitialized = false;
<<<<<<< HEAD
  private isDisabled = false;
  private customExporter: SpanExporter | null = null;
  private exitHandlerRegistered = false;

  /**
   * For testing: allows overriding the exporter with an in-memory exporter.
   */
  setCustomExporter(exporter: SpanExporter | null): void {
    this.customExporter = exporter;
  }

  init(config: ResolvedVoidConfig): void {
    this.isDisabled = config.disabled;

    if (config.disabled) {
      this.isInitialized = true;
      return;
    }

    if (this.isInitialized) {
      return;
    }

    // Register AsyncHooksContextManager globally if not already active to guarantee context propagation across async spans
    try {
      const contextManager = new AsyncHooksContextManager();
      contextManager.enable();
      context.setGlobalContextManager(contextManager);
    } catch {
      // Context manager already enabled or initialized
    }

=======
  private exitHandlerRegistered = false;

  init(config: ResolvedVoidConfig): void {
    if (this.isInitialized || config.disabled) {
      return;
    }

>>>>>>> 15914ef (feat(sdk) : implemented sdk)
    const resource = new Resource({
      [ATTR_SERVICE_NAME]: config.serviceName,
      'service.environment': config.environment,
    });

<<<<<<< HEAD
    this.provider = new BasicTracerProvider({ resource });

    if (this.customExporter) {
      this.provider.addSpanProcessor(new SimpleSpanProcessor(this.customExporter));
    } else {
      const exporter = new OTLPTraceExporter({
        url: config.endpoint,
        headers: config.headers,
      });
      this.provider.addSpanProcessor(new BatchSpanProcessor(exporter));
    }

    this.tracer = this.provider.getTracer('void-sdk', '0.1.0');
=======
    const exporter = new OTLPTraceExporter({
      url: config.endpoint,
      headers: config.headers,
    });

    this.provider = new BasicTracerProvider({ resource });
    this.provider.addSpanProcessor(new BatchSpanProcessor(exporter));
    this.provider.register();

    this.tracer = trace.getTracer('void-sdk', '0.1.0');
>>>>>>> 15914ef (feat(sdk) : implemented sdk)
    this.isInitialized = true;

    this.registerExitHandlers();
  }

<<<<<<< HEAD
  getTracer(): Tracer | null {
    if (this.isDisabled) return null;
    if (this.tracer) return this.tracer;
    return this.provider ? this.provider.getTracer('void-sdk', '0.1.0') : null;
=======
  getTracer(): Tracer {
    if (!this.tracer) {
      return trace.getTracer('void-sdk', '0.1.0');
    }
    return this.tracer;
>>>>>>> 15914ef (feat(sdk) : implemented sdk)
  }

  async agent<T>(
    options: AgentOptions,
<<<<<<< HEAD
    fn: (span?: Span) => Promise<T> | T
  ): Promise<T> {
    if (this.isDisabled) {
      return fn();
    }

    const tracer = this.getTracer();
    if (!tracer) return fn();
=======
    fn: (span: Span) => Promise<T> | T
  ): Promise<T> {
    const tracer = this.getTracer();
>>>>>>> 15914ef (feat(sdk) : implemented sdk)

    return tracer.startActiveSpan(options.name, async (span: Span) => {
      try {
        span.setAttribute(SEMCONV.OPENINFERENCE_SPAN_KIND, 'AGENT');
        span.setAttribute(SEMCONV.VOID_AGENT_NAME, options.name);

        if (options.role) {
          span.setAttribute(SEMCONV.VOID_AGENT_ROLE, options.role);
        }
        if (options.promptVersion) {
          span.setAttribute(SEMCONV.VOID_PROMPT_VERSION, options.promptVersion);
        }
        if (options.attributes) {
          this.setAttributes(span, options.attributes);
        }

        const result = await fn(span);
        span.setStatus({ code: SpanStatusCode.OK });
        return result;
      } catch (err) {
        span.setStatus({
          code: SpanStatusCode.ERROR,
          message: err instanceof Error ? err.message : String(err),
        });
        span.recordException(err instanceof Error ? err : new Error(String(err)));
        throw err;
      } finally {
        span.end();
      }
    });
  }

  async tool<T>(
    options: ToolOptions,
<<<<<<< HEAD
    fn: (span?: Span) => Promise<T> | T
  ): Promise<T> {
    if (this.isDisabled) {
      return fn();
    }

    const tracer = this.getTracer();
    if (!tracer) return fn();

=======
    fn: (span: Span) => Promise<T> | T
  ): Promise<T> {
    const tracer = this.getTracer();
>>>>>>> 15914ef (feat(sdk) : implemented sdk)
    const toolName = options.name || 'unnamed-tool';

    return tracer.startActiveSpan(toolName, async (span: Span) => {
      try {
        span.setAttribute(SEMCONV.OPENINFERENCE_SPAN_KIND, 'TOOL');
        span.setAttribute(SEMCONV.VOID_TOOL_NAME, toolName);

        if (options.input !== undefined) {
<<<<<<< HEAD
          span.setAttribute(SEMCONV.INPUT_VALUE, safeJsonStringify(options.input));
=======
          span.setAttribute(
            SEMCONV.INPUT_VALUE,
            typeof options.input === 'string'
              ? options.input
              : JSON.stringify(options.input)
          );
>>>>>>> 15914ef (feat(sdk) : implemented sdk)
        }
        if (options.attributes) {
          this.setAttributes(span, options.attributes);
        }

        const result = await fn(span);
        span.setAttribute(SEMCONV.VOID_TOOL_RESULT, 'success');
        if (result !== undefined) {
<<<<<<< HEAD
          span.setAttribute(SEMCONV.OUTPUT_VALUE, safeJsonStringify(result));
=======
          span.setAttribute(
            SEMCONV.OUTPUT_VALUE,
            typeof result === 'string' ? result : JSON.stringify(result)
          );
>>>>>>> 15914ef (feat(sdk) : implemented sdk)
        }
        span.setStatus({ code: SpanStatusCode.OK });
        return result;
      } catch (err) {
        span.setAttribute(SEMCONV.VOID_TOOL_RESULT, 'error');
        span.setStatus({
          code: SpanStatusCode.ERROR,
          message: err instanceof Error ? err.message : String(err),
        });
        span.recordException(err instanceof Error ? err : new Error(String(err)));
        throw err;
      } finally {
        span.end();
      }
    });
  }

  async span<T>(
    name: string,
<<<<<<< HEAD
    fn: (span?: Span) => Promise<T> | T,
    attributes?: Record<string, unknown>
  ): Promise<T> {
    if (this.isDisabled) {
      return fn();
    }

    const tracer = this.getTracer();
    if (!tracer) return fn();
=======
    fn: (span: Span) => Promise<T> | T,
    attributes?: Record<string, unknown>
  ): Promise<T> {
    const tracer = this.getTracer();
>>>>>>> 15914ef (feat(sdk) : implemented sdk)

    return tracer.startActiveSpan(name, async (span: Span) => {
      try {
        if (attributes) {
          this.setAttributes(span, attributes);
        }
        const result = await fn(span);
        span.setStatus({ code: SpanStatusCode.OK });
        return result;
      } catch (err) {
        span.setStatus({
          code: SpanStatusCode.ERROR,
          message: err instanceof Error ? err.message : String(err),
        });
        span.recordException(err instanceof Error ? err : new Error(String(err)));
        throw err;
      } finally {
        span.end();
      }
    });
  }

  event(name: string, attributes?: Record<string, unknown>): void {
<<<<<<< HEAD
    if (this.isDisabled) return;
=======
>>>>>>> 15914ef (feat(sdk) : implemented sdk)
    const activeSpan = trace.getActiveSpan();
    if (activeSpan) {
      activeSpan.addEvent(
        name,
        attributes ? this.toAttributes(attributes) : undefined
      );
    }
  }

  setAttribute(key: string, value: unknown): void {
<<<<<<< HEAD
    if (this.isDisabled) return;
=======
>>>>>>> 15914ef (feat(sdk) : implemented sdk)
    const activeSpan = trace.getActiveSpan();
    if (activeSpan && value !== undefined && value !== null) {
      activeSpan.setAttribute(key, this.toAttributeValue(value));
    }
  }

  async shutdown(): Promise<void> {
<<<<<<< HEAD
    try {
      if (this.provider) {
        await this.provider.shutdown();
      }
    } catch {
      // Non-fatal shutdown error
    } finally {
      this.isInitialized = false;
      this.isDisabled = false;
=======
    if (this.provider) {
      await this.provider.shutdown();
      this.isInitialized = false;
>>>>>>> 15914ef (feat(sdk) : implemented sdk)
      this.provider = null;
      this.tracer = null;
    }
  }

  private registerExitHandlers(): void {
    if (this.exitHandlerRegistered || typeof process === 'undefined') return;
    this.exitHandlerRegistered = true;

<<<<<<< HEAD
    process.once('beforeExit', () => {
      this.shutdown().catch(() => {});
    });

    const handleSignal = (code: number) => {
      this.shutdown().finally(() => {
        process.exit(code);
      });
    };

    process.once('SIGINT', () => handleSignal(130));
    process.once('SIGTERM', () => handleSignal(143));
=======
    const cleanup = () => {
      this.shutdown().catch(() => {});
    };

    process.once('beforeExit', cleanup);
    process.once('SIGINT', cleanup);
    process.once('SIGTERM', cleanup);
>>>>>>> 15914ef (feat(sdk) : implemented sdk)
  }

  private setAttributes(span: Span, attrs: Record<string, unknown>): void {
    for (const [key, value] of Object.entries(attrs)) {
      if (value !== undefined && value !== null) {
        span.setAttribute(key, this.toAttributeValue(value));
      }
    }
  }

  private toAttributeValue(value: unknown): AttributeValue {
    if (
      typeof value === 'string' ||
      typeof value === 'number' ||
      typeof value === 'boolean'
    ) {
      return value;
    }
    if (Array.isArray(value)) {
      if (value.every((item) => typeof item === 'string')) return value as string[];
      if (value.every((item) => typeof item === 'number')) return value as number[];
      if (value.every((item) => typeof item === 'boolean')) return value as boolean[];
      return value.map((item) => String(item));
    }
<<<<<<< HEAD
    return safeJsonStringify(value);
=======
    return JSON.stringify(value);
>>>>>>> 15914ef (feat(sdk) : implemented sdk)
  }

  private toAttributes(attrs: Record<string, unknown>): Attributes {
    const result: Attributes = {};
    for (const [key, value] of Object.entries(attrs)) {
      if (value !== undefined && value !== null) {
        result[key] = this.toAttributeValue(value);
      }
    }
    return result;
  }
}

export const telemetryEngine = new TelemetryEngine();
