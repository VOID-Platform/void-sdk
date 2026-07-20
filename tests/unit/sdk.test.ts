import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { voidSdk, SEMCONV } from '../../src/index';
import { resolveConfig } from '../../src/config';

describe('VOID SDK Core Unit Tests', () => {
  beforeEach(async () => {
    await voidSdk.init({
      serviceName: 'test-agent-service',
      environment: 'test',
      disabled: true, // Disable remote network exports during unit testing
    });
  });

  afterEach(async () => {
    await voidSdk.shutdown();
  });

  describe('resolveConfig', () => {
    it('should resolve default options properly', () => {
      const config = resolveConfig();
      expect(config.serviceName).toBe('void-agent-service');
      expect(config.environment).toBe(process.env.NODE_ENV || 'development');
      expect(config.endpoint).toContain('http://localhost:4318');
    });

    it('should override defaults with explicit options', () => {
      const config = resolveConfig({
        serviceName: 'my-custom-agent',
        environment: 'staging',
        otlp: {
          endpoint: 'http://custom-collector:4318',
          headers: { 'x-test': '123' },
        },
      });
      expect(config.serviceName).toBe('my-custom-agent');
      expect(config.environment).toBe('staging');
      expect(config.endpoint).toBe('http://custom-collector:4318/v1/traces');
      expect(config.headers['x-test']).toBe('123');
    });
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
    });

    it('should execute tool nested inside agent', async () => {
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
    });

    it('should record events and custom attributes without error', async () => {
      await voidSdk.agent({ name: 'EventAgent' }, async () => {
        voidSdk.setAttribute('custom.key', 'custom.value');
        voidSdk.event('cache_hit', { [SEMCONV.VOID_MEMORY_HIT]: true });
      });
    });

    it('should propagate errors correctly and set error status', async () => {
      await expect(
        voidSdk.agent({ name: 'FailingAgent' }, async () => {
          throw new Error('Agent execution failed');
        })
      ).rejects.toThrow('Agent execution failed');
    });
  });
});
