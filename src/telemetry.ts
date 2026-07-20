import {
  trace,
  Span,
  SpanStatusCode,
  Tracer,
  AttributeValue,
  Attributes,
} from '@opentelemetry/api';
import {
  BasicTracerProvider,
  BatchSpanProcessor,
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

export class TelemetryEngine {
  private provider: BasicTracerProvider | null = null;
  private tracer: Tracer | null = null;
  private isInitialized = false;
  private exitHandlerRegistered = false;

  init(config: ResolvedVoidConfig): void {
    if (this.isInitialized || config.disabled) {
      return;
    }

    const resource = new Resource({
      [ATTR_SERVICE_NAME]: config.serviceName,
      'service.environment': config.environment,
    });

    const exporter = new OTLPTraceExporter({
      url: config.endpoint,
      headers: config.headers,
    });

    this.provider = new BasicTracerProvider({ resource });
    this.provider.addSpanProcessor(new BatchSpanProcessor(exporter));
    this.provider.register();

    this.tracer = trace.getTracer('void-sdk', '0.1.0');
    this.isInitialized = true;

    this.registerExitHandlers();
  }

  getTracer(): Tracer {
    if (!this.tracer) {
      return trace.getTracer('void-sdk', '0.1.0');
    }
    return this.tracer;
  }

  async agent<T>(
    options: AgentOptions,
    fn: (span: Span) => Promise<T> | T
  ): Promise<T> {
    const tracer = this.getTracer();

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
    fn: (span: Span) => Promise<T> | T
  ): Promise<T> {
    const tracer = this.getTracer();
    const toolName = options.name || 'unnamed-tool';

    return tracer.startActiveSpan(toolName, async (span: Span) => {
      try {
        span.setAttribute(SEMCONV.OPENINFERENCE_SPAN_KIND, 'TOOL');
        span.setAttribute(SEMCONV.VOID_TOOL_NAME, toolName);

        if (options.input !== undefined) {
          span.setAttribute(
            SEMCONV.INPUT_VALUE,
            typeof options.input === 'string'
              ? options.input
              : JSON.stringify(options.input)
          );
        }
        if (options.attributes) {
          this.setAttributes(span, options.attributes);
        }

        const result = await fn(span);
        span.setAttribute(SEMCONV.VOID_TOOL_RESULT, 'success');
        if (result !== undefined) {
          span.setAttribute(
            SEMCONV.OUTPUT_VALUE,
            typeof result === 'string' ? result : JSON.stringify(result)
          );
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
    fn: (span: Span) => Promise<T> | T,
    attributes?: Record<string, unknown>
  ): Promise<T> {
    const tracer = this.getTracer();

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
    const activeSpan = trace.getActiveSpan();
    if (activeSpan) {
      activeSpan.addEvent(
        name,
        attributes ? this.toAttributes(attributes) : undefined
      );
    }
  }

  setAttribute(key: string, value: unknown): void {
    const activeSpan = trace.getActiveSpan();
    if (activeSpan && value !== undefined && value !== null) {
      activeSpan.setAttribute(key, this.toAttributeValue(value));
    }
  }

  async shutdown(): Promise<void> {
    if (this.provider) {
      await this.provider.shutdown();
      this.isInitialized = false;
      this.provider = null;
      this.tracer = null;
    }
  }

  private registerExitHandlers(): void {
    if (this.exitHandlerRegistered || typeof process === 'undefined') return;
    this.exitHandlerRegistered = true;

    const cleanup = () => {
      this.shutdown().catch(() => {});
    };

    process.once('beforeExit', cleanup);
    process.once('SIGINT', cleanup);
    process.once('SIGTERM', cleanup);
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
    return JSON.stringify(value);
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
