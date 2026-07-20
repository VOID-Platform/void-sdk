import { describe, it, expect, beforeEach, afterEach } from 'vitest';
<<<<<<< HEAD
import { InMemorySpanExporter, SimpleSpanProcessor } from '@opentelemetry/sdk-trace-base';
import { voidSdk, SEMCONV } from '../../src/index';
import { resolveConfig } from '../../src/config';
import { telemetryEngine } from '../../src/telemetry';

describe('VOID SDK Core Unit Tests', () => {
  let memoryExporter: InMemorySpanExporter;

  beforeEach(async () => {
    memoryExporter = new InMemorySpanExporter();
    telemetryEngine.setCustomExporter(memoryExporter);

    await voidSdk.init({
      serviceName: 'test-agent-service',
      environment: 'test',
=======
import { voidSdk, SEMCONV } from '../../src/index';
import { resolveConfig } from '../../src/config';

describe('VOID SDK Core Unit Tests', () => {
  beforeEach(async () => {
    await voidSdk.init({
      serviceName: 'test-agent-service',
      environment: 'test',
      disabled: true, // Disable remote network exports during unit testing
>>>>>>> 15914ef (feat(sdk) : implemented sdk)
    });
  });

  afterEach(async () => {
    await voidSdk.shutdown();
<<<<<<< HEAD
    telemetryEngine.setCustomExporter(null);
=======
>>>>>>> 15914ef (feat(sdk) : implemented sdk)
  });

  describe('resolveConfig', () => {
    it('should resolve default options properly', () => {
      const config = resolveConfig();
      expect(config.serviceName).toBe('void-agent-service');
      expect(config.environment).toBe(process.env.NODE_ENV || 'development');
<<<<<<< HEAD
      expect(config.endpoint).toBe('http://localhost:4318/v1/traces');
=======
      expect(config.endpoint).toContain('http://localhost:4318');
>>>>>>> 15914ef (feat(sdk) : implemented sdk)
    });

    it('should override defaults with explicit options', () => {
      const config = resolveConfig({
        serviceName: 'my-custom-agent',
        environment: 'staging',
        otlp: {
<<<<<<< HEAD
          endpoint: 'http://custom-collector:4318/v1/traces',
=======
          endpoint: 'http://custom-collector:4318',
>>>>>>> 15914ef (feat(sdk) : implemented sdk)
          headers: { 'x-test': '123' },
        },
      });
      expect(config.serviceName).toBe('my-custom-agent');
      expect(config.environment).toBe('staging');
      expect(config.endpoint).toBe('http://custom-collector:4318/v1/traces');
      expect(config.headers['x-test']).toBe('123');
    });
<<<<<<< HEAD

    it('should handle headers with equals signs correctly', () => {
      process.env.VOID_OTLP_HEADERS = 'Authorization=Bearer abc=123=xyz,custom=header=val';
      const config = resolveConfig({
        otlp: {
          headers: { Authorization: 'ExplicitHeader' },
        },
      });
      expect(config.headers['Authorization']).toBe('ExplicitHeader');
      expect(config.headers['custom']).toBe('header=val');
      delete process.env.VOID_OTLP_HEADERS;
    });
=======
>>>>>>> 15914ef (feat(sdk) : implemented sdk)
  });

  describe('voidSdk wrappers', () => {
    it('should execute agent and return function result', async () => {
      const result = await voidSdk.agent(
        { name: 'ResearchAgent', role: 'planner' },
        async () => {
          return 'analysis-complete';
        }
      );
      expect(result).toBe('analysis-complete');
<<<<<<< HEAD

      const spans = memoryExporter.getFinishedSpans();
      expect(spans.length).toBe(1);
      expect(spans[0].name).toBe('ResearchAgent');
      expect(spans[0].attributes[SEMCONV.VOID_AGENT_NAME]).toBe('ResearchAgent');
      expect(spans[0].attributes[SEMCONV.VOID_AGENT_ROLE]).toBe('planner');
    });

    it('should execute tool nested inside agent with proper parent-child span linking', async () => {
=======
    });

    it('should execute tool nested inside agent', async () => {
>>>>>>> 15914ef (feat(sdk) : implemented sdk)
      const agentResult = await voidSdk.agent(
        { name: 'ResearchAgent' },
        async () => {
          const toolResult = await voidSdk.tool(
            { name: 'searchDb', input: { query: 'test' } },
            async () => {
              return { status: 'ok', hits: 5 };
            }
          );
          expect(toolResult.status).toBe('ok');
          return toolResult;
        }
      );

      expect(agentResult.hits).toBe(5);
<<<<<<< HEAD

      const spans = memoryExporter.getFinishedSpans();
      expect(spans.length).toBe(2);

      const toolSpan = spans.find((s) => s.name === 'searchDb')!;
      const agentSpan = spans.find((s) => s.name === 'ResearchAgent')!;

      expect(toolSpan).toBeDefined();
      expect(agentSpan).toBeDefined();
      expect(toolSpan.parentSpanId).toBe(agentSpan.spanContext().spanId);
      expect(toolSpan.attributes[SEMCONV.VOID_TOOL_NAME]).toBe('searchDb');
    });

    it('should record events and custom attributes on the active span', async () => {
=======
    });

    it('should record events and custom attributes without error', async () => {
>>>>>>> 15914ef (feat(sdk) : implemented sdk)
      await voidSdk.agent({ name: 'EventAgent' }, async () => {
        voidSdk.setAttribute('custom.key', 'custom.value');
        voidSdk.event('cache_hit', { [SEMCONV.VOID_MEMORY_HIT]: true });
      });
<<<<<<< HEAD

      const spans = memoryExporter.getFinishedSpans();
      expect(spans.length).toBe(1);

      const agentSpan = spans[0];
      expect(agentSpan.attributes['custom.key']).toBe('custom.value');
      expect(agentSpan.events.length).toBe(1);
      expect(agentSpan.events[0].name).toBe('cache_hit');
      expect(agentSpan.events[0].attributes?.[SEMCONV.VOID_MEMORY_HIT]).toBe(true);
=======
>>>>>>> 15914ef (feat(sdk) : implemented sdk)
    });

    it('should propagate errors correctly and set error status', async () => {
      await expect(
        voidSdk.agent({ name: 'FailingAgent' }, async () => {
          throw new Error('Agent execution failed');
        })
      ).rejects.toThrow('Agent execution failed');
<<<<<<< HEAD

      const spans = memoryExporter.getFinishedSpans();
      expect(spans.length).toBe(1);
      expect(spans[0].status.code).toBe(2); // SpanStatusCode.ERROR
    });

    it('should handle circular object and BigInt inputs gracefully without throwing', async () => {
      const circularObj: any = { name: 'test' };
      circularObj.self = circularObj;

      const result = await voidSdk.tool(
        { name: 'bigIntTool', input: { id: BigInt(9007199254740991), circular: circularObj } },
        async () => {
          return { big: BigInt(123) };
        }
      );

      expect(result.big).toBe(BigInt(123));

      const spans = memoryExporter.getFinishedSpans();
      expect(spans.length).toBe(1);
      expect(spans[0].attributes[SEMCONV.INPUT_VALUE]).toContain('9007199254740991');
      expect(spans[0].attributes[SEMCONV.OUTPUT_VALUE]).toContain('123');
=======
>>>>>>> 15914ef (feat(sdk) : implemented sdk)
    });
  });
});
