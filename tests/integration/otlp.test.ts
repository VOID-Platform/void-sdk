<<<<<<< HEAD
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { InMemorySpanExporter } from '@opentelemetry/sdk-trace-base';
import { voidSdk, SEMCONV } from '../../src/index';
import { telemetryEngine } from '../../src/telemetry';

describe('OTLP Telemetry Payload Integration Tests', () => {
  let memoryExporter: InMemorySpanExporter;

  beforeEach(async () => {
    memoryExporter = new InMemorySpanExporter();
    telemetryEngine.setCustomExporter(memoryExporter);

    await voidSdk.init({
      serviceName: 'integration-test-service',
      environment: 'test',
    });
  });

  afterEach(async () => {
    await voidSdk.shutdown();
    telemetryEngine.setCustomExporter(null);
  });

  it('should generate valid OpenTelemetry spans with void.* and openinference.* attributes', async () => {
=======
import { describe, it, expect, afterEach } from 'vitest';
import { voidSdk } from '../../src/index';

describe('OTLP Telemetry Payload Integration Tests', () => {
  afterEach(async () => {
    await voidSdk.shutdown();
  });

  it('should initialize and execute nested agent & tool spans', async () => {
    await voidSdk.init({
      serviceName: 'integration-test-service',
      environment: 'test',
      otlp: {
        endpoint: 'http://localhost:4318',
      },
    });

>>>>>>> 15914ef (feat(sdk) : implemented sdk)
    const executionLog: string[] = [];

    const finalResult = await voidSdk.agent(
      {
        name: 'IntegrationAgent',
        role: 'tester',
        promptVersion: 'v1.0.0',
      },
      async () => {
        executionLog.push('agent-started');

        const tool1Result = await voidSdk.tool(
          { name: 'fetchUser', input: { id: 'usr_123' } },
          async () => {
            executionLog.push('tool1-executed');
            return { name: 'Alice' };
          }
        );

        const tool2Result = await voidSdk.tool(
          { name: 'sendEmail', input: { to: tool1Result.name } },
          async () => {
            executionLog.push('tool2-executed');
            return true;
          }
        );

        executionLog.push('agent-finished');
        return { tool1Result, tool2Result };
      }
    );

    expect(finalResult.tool1Result.name).toBe('Alice');
    expect(finalResult.tool2Result).toBe(true);
<<<<<<< HEAD

    const spans = memoryExporter.getFinishedSpans();
    expect(spans.length).toBe(3); // 1 Agent Span + 2 Tool Spans

    const agentSpan = spans.find((s) => s.name === 'IntegrationAgent')!;
    const tool1Span = spans.find((s) => s.name === 'fetchUser')!;
    const tool2Span = spans.find((s) => s.name === 'sendEmail')!;

    // Assert Agent Span attributes
    expect(agentSpan).toBeDefined();
    expect(agentSpan.attributes[SEMCONV.OPENINFERENCE_SPAN_KIND]).toBe('AGENT');
    expect(agentSpan.attributes[SEMCONV.VOID_AGENT_NAME]).toBe('IntegrationAgent');
    expect(agentSpan.attributes[SEMCONV.VOID_AGENT_ROLE]).toBe('tester');
    expect(agentSpan.attributes[SEMCONV.VOID_PROMPT_VERSION]).toBe('v1.0.0');

    // Assert Tool 1 Span attributes & parent-child nesting
    expect(tool1Span).toBeDefined();
    expect(tool1Span.attributes[SEMCONV.OPENINFERENCE_SPAN_KIND]).toBe('TOOL');
    expect(tool1Span.attributes[SEMCONV.VOID_TOOL_NAME]).toBe('fetchUser');
    expect(tool1Span.attributes[SEMCONV.VOID_TOOL_RESULT]).toBe('success');
    expect(tool1Span.attributes[SEMCONV.INPUT_VALUE]).toContain('usr_123');
    expect(tool1Span.attributes[SEMCONV.OUTPUT_VALUE]).toContain('Alice');
    expect(tool1Span.parentSpanId).toBe(agentSpan.spanContext().spanId);

    // Assert Tool 2 Span attributes & parent-child nesting
    expect(tool2Span).toBeDefined();
    expect(tool2Span.attributes[SEMCONV.OPENINFERENCE_SPAN_KIND]).toBe('TOOL');
    expect(tool2Span.attributes[SEMCONV.VOID_TOOL_NAME]).toBe('sendEmail');
    expect(tool2Span.attributes[SEMCONV.VOID_TOOL_RESULT]).toBe('success');
    expect(tool2Span.attributes[SEMCONV.INPUT_VALUE]).toContain('Alice');
    expect(tool2Span.parentSpanId).toBe(agentSpan.spanContext().spanId);
=======
    expect(executionLog).toEqual([
      'agent-started',
      'tool1-executed',
      'tool2-executed',
      'agent-finished',
    ]);
>>>>>>> 15914ef (feat(sdk) : implemented sdk)
  });
});
