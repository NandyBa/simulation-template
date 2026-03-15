# GenSim — Claude Code Guidelines

## Commit Workflow Policy

After completing each phase or discrete task, **always propose and create a commit** before moving on to the next phase.

### Rules

1. **One commit per phase** — each build phase (config, core, presets, agents, UI, tests) gets its own commit.
2. **Propose before committing** — present the draft commit message and file list, wait for user confirmation.
3. **Never bundle phases** — do not combine unrelated work into a single commit.
4. **Commit message format**:
   ```
   <type>: <short summary>

   - bullet list of what was added/changed
   - one line per file or logical group

   Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>
   ```
   Types: `feat`, `fix`, `chore`, `test`, `refactor`, `docs`

5. **Verification before commit** — the code must at minimum parse (no obvious syntax errors) before committing. For phases that include tests, tests must pass.
