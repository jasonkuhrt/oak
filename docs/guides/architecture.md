# Architecture

Oak is composed from multiple distinct layers that execute in a flow:

1. Settings Parser
1. Parameter Parser
   - Use settings to enrich parameter specifications (like environment support)
1. Up Front Arguments Parser
   - Accept inputs from difference sources:
     - Line
     - Environment
   - Cast values to primitive types based on parameter specification
1. Pre-Prompt Argument Validation
1. Prompt Plan (prompt matchers executed, matches mean prompt should run)
1. Prompt Apply or Mistake Reporter (if not all mistakes recovered as prompts)
1. Prompt/Up Front Arguments Merger (prompt overrides up front)

```
```
