/**
 * Standard Semantic Conventions for AI Agent Observability in VOID SDK.
 */
export const SEMCONV = {
  // OpenTelemetry GenAI Semantic Conventions
  GEN_AI_SYSTEM: 'gen_ai.system',
  GEN_AI_REQUEST_MODEL: 'gen_ai.request.model',
  GEN_AI_USAGE_INPUT_TOKENS: 'gen_ai.usage.input_tokens',
  GEN_AI_USAGE_OUTPUT_TOKENS: 'gen_ai.usage.output_tokens',

  // OpenInference Conventions
  OPENINFERENCE_SPAN_KIND: 'openinference.span.kind',
  INPUT_VALUE: 'input.value',
  OUTPUT_VALUE: 'output.value',

  // VOID Custom Semantic Conventions
  VOID_AGENT_NAME: 'void.agent.name',
  VOID_AGENT_ROLE: 'void.agent.role',
  VOID_TOOL_NAME: 'void.tool.name',
  VOID_TOOL_RESULT: 'void.tool.result',
  VOID_PROMPT_VERSION: 'void.prompt.version',
  VOID_MEMORY_HIT: 'void.memory.hit',
} as const;

export type SemConvKey = (typeof SEMCONV)[keyof typeof SEMCONV];
