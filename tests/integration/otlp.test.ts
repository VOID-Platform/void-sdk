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
    expect(executionLog).toEqual([
      'agent-started',
      'tool1-executed',
      'tool2-executed',
      'agent-finished',
    ]);
  });
});
