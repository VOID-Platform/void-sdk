import { Span } from '@opentelemetry/api';
import { VoidOptions, resolveConfig } from './config';
import { telemetryEngine, AgentOptions, ToolOptions } from './telemetry';
<<<<<<< HEAD
import { SEMCONV, SemConvKey } from './semconv';

class VoidSDK {
=======
import { SEMCONV } from './semconv';

export class VoidSDK {
>>>>>>> 15914ef (feat(sdk) : implemented sdk)
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
<<<<<<< HEAD
    fn: (span?: Span) => Promise<T> | T
=======
    fn: (span: Span) => Promise<T> | T
>>>>>>> 15914ef (feat(sdk) : implemented sdk)
  ): Promise<T> {
    return telemetryEngine.agent(options, fn);
  }

  /**
   * Wraps an AI Agent tool call.
   */
  async tool<T>(
    options: ToolOptions,
<<<<<<< HEAD
    fn: (span?: Span) => Promise<T> | T
=======
    fn: (span: Span) => Promise<T> | T
>>>>>>> 15914ef (feat(sdk) : implemented sdk)
  ): Promise<T> {
    return telemetryEngine.tool(options, fn);
  }

  /**
   * Creates a custom span.
   */
  async span<T>(
    name: string,
<<<<<<< HEAD
    fn: (span?: Span) => Promise<T> | T,
=======
    fn: (span: Span) => Promise<T> | T,
>>>>>>> 15914ef (feat(sdk) : implemented sdk)
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

<<<<<<< HEAD
// Public Exports
export { SEMCONV };
export type { SemConvKey };
=======
// Exports
export { SEMCONV };
>>>>>>> 15914ef (feat(sdk) : implemented sdk)
export type { VoidOptions, OTLPOptions, ResolvedVoidConfig } from './config';
export type { AgentOptions, ToolOptions } from './telemetry';
export default voidSdk;
