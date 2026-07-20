import { Span } from '@opentelemetry/api';
import { VoidOptions, resolveConfig } from './config';
import { telemetryEngine, AgentOptions, ToolOptions } from './telemetry';
import { SEMCONV, SemConvKey } from './semconv';

export class VoidSDK {
  /**
   * Initializes the VOID Telemetry SDK.
   */
  async init(options: VoidOptions = {}): Promise<void> {
    const config = resolveConfig(options);
    telemetryEngine.init(config);
  }

  /**
   * Wraps an AI Agent execution loop.
   */
  async agent<T>(
    options: AgentOptions,
    fn: (span?: Span) => Promise<T> | T
  ): Promise<T> {
    return telemetryEngine.agent(options, fn);
  }

  /**
   * Wraps an AI Agent tool call.
   */
  async tool<T>(
    options: ToolOptions,
    fn: (span?: Span) => Promise<T> | T
  ): Promise<T> {
    return telemetryEngine.tool(options, fn);
  }

  /**
   * Creates a custom span.
   */
  async span<T>(
    name: string,
    fn: (span?: Span) => Promise<T> | T,
    attributes?: Record<string, unknown>
  ): Promise<T> {
    return telemetryEngine.span(name, fn, attributes);
  }

  /**
   * Adds an event to the currently active span.
   */
  event(name: string, attributes?: Record<string, unknown>): void {
    telemetryEngine.event(name, attributes);
  }

  /**
   * Sets a custom attribute on the currently active span.
   */
  setAttribute(key: string, value: unknown): void {
    telemetryEngine.setAttribute(key, value);
  }

  /**
   * Flushes and shuts down the telemetry exporter.
   */
  async shutdown(): Promise<void> {
    await telemetryEngine.shutdown();
  }
}

export const voidSdk = new VoidSDK();

// Public Exports
export { SEMCONV };
export type { SemConvKey };
export type { VoidOptions, OTLPOptions, ResolvedVoidConfig } from './config';
export type { AgentOptions, ToolOptions } from './telemetry';
export default voidSdk;
