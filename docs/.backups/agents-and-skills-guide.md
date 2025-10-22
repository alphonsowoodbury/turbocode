# Agent Skills and Subagents: A Comprehensive Guide

## Overview

Claude offers two powerful mechanisms for specialized task handling:

1. **Subagents** - Specialized AI assistants with separate context windows and custom configurations
2. **Skills** - Portable folders containing instructions, scripts, and resources that Claude loads on-demand

Together, these tools enable Claude to become an expert in your specific workflows and domains.

---

## Subagents

### What Are Subagents?

Subagents are specialized AI assistants that handle specific types of tasks independently. Each subagent operates with:

- **Separate context window** - Prevents cluttering the main conversation
- **Custom system prompt** - Tailored expertise for specific domains
- **Configurable tool access** - Security through principle of least privilege
- **Independent execution** - Works autonomously and reports back

### When to Use Subagents

Use subagents for:

- **Recurring specialized tasks** - Code review, testing, debugging, documentation
- **Domain expertise** - API testing, security audits, data analysis
- **Complex workflows** - Multi-step processes that benefit from focused attention
- **Parallel task execution** - Multiple subagents can work simultaneously

### How to Create Subagents

#### Via Command Interface

1. Run `/agents` command
2. Select "Create New Agent"
3. Choose scope:
   - **Project** (`.claude/agents/`) - Shared with team via git
   - **User** (`~/.claude/agents/`) - Personal subagents
4. Configure:
   - **Name**: Unique identifier (lowercase, e.g., `api-tester`)
   - **Description**: When/how to use (include "use PROACTIVELY" for auto-delegation)
   - **Tools**: Select accessible tools (Read, Bash, Grep, etc.)
   - **Model**: Choose Claude model (sonnet, opus, haiku)
   - **System Prompt**: Define role, behavior, and expertise

#### Via File Creation

Create `.claude/agents/my-agent.md`:

```markdown
---
name: security-auditor
description: Use PROACTIVELY for security audits and vulnerability assessment tasks
tools: Read, Grep, Bash
model: sonnet
---

You are an expert security auditor. When invoked:

1. Analyze code for common vulnerabilities (SQL injection, XSS, CSRF)
2. Check authentication and authorization patterns
3. Review dependency security
4. Validate input sanitization
5. Report findings with severity levels and remediation steps

Always prioritize critical security issues first.
```

### Invoking Subagents

#### Automatic Delegation
```
"Review my authentication code for security issues"
→ Claude automatically uses security-auditor subagent
```

#### Explicit Invocation
```
"Use the test-runner subagent to fix failing tests"
"Have the api-tester validate all endpoints"
```

### Example Subagent Configurations

#### Code Reviewer
```markdown
---
name: code-reviewer
description: Use PROACTIVELY for code review tasks
tools: Read, Grep, Glob
model: sonnet
---

Expert code reviewer focused on:
- Code quality and best practices
- Performance optimizations
- Security vulnerabilities
- Test coverage
- Documentation completeness
```

#### Test Runner
```markdown
---
name: test-runner
description: Use for running tests and fixing test failures
tools: Bash, Read, Edit
model: sonnet
---

Automated testing specialist that:
1. Runs test suites (pytest, jest, etc.)
2. Analyzes test failures
3. Fixes failing tests
4. Ensures test coverage
```

#### Documentation Writer
```markdown
---
name: docs-writer
description: Use PROACTIVELY for documentation tasks
tools: Read, Write, Glob
model: sonnet
---

Technical documentation specialist that creates:
- API documentation
- User guides
- Code comments
- README files
- Architecture diagrams (mermaid)
```

### Best Practices for Subagents

1. **Specific Descriptions** - Clear descriptions help Claude choose the right subagent
2. **Minimal Tool Access** - Only grant tools necessary for the task
3. **Proactive Keywords** - Use "use PROACTIVELY" in descriptions for automatic delegation
4. **Single Responsibility** - Each subagent should excel at one domain
5. **Team Sharing** - Use `.claude/agents/` for team-wide subagents
6. **Version Control** - Commit subagent files to share with team

---

## Skills

### What Are Skills?

Skills are portable folders containing instructions, scripts, and resources that Claude loads on-demand. They package expertise and workflows into reusable components.

Skills are:

- **Composable** - Stack together; Claude coordinates multiple skills
- **Portable** - Same format across Claude apps, Claude Code, and API
- **Efficient** - Only loads what's needed, when needed
- **Powerful** - Can include executable code for reliable task execution

### How Skills Work

1. Claude scans available skills while working
2. Matches relevant skills to current task
3. Loads minimal required information and files
4. Executes skill logic (instructions + code)
5. Returns results to main conversation

### Skill Structure

```
my-skill/
├── SKILL.md           # Main instructions and metadata
├── resources/         # Supporting files
│   ├── templates/
│   ├── scripts/
│   └── data/
└── examples/          # Usage examples
```

### Creating Skills

#### Using skill-creator (Claude Apps)

1. Enable Skills in Settings
2. Ask: "Create a skill for [task description]"
3. The skill-creator skill will:
   - Ask about your workflow
   - Generate folder structure
   - Format SKILL.md file
   - Bundle resources
   - Deploy the skill

#### Manual Creation

Create `~/.claude/skills/excel-analyzer/SKILL.md`:

```markdown
# Excel Analyzer Skill

## Description
Analyzes Excel spreadsheets for data insights, quality issues, and patterns.

## When to Use
- Analyzing spreadsheet data
- Finding data quality issues
- Generating summary statistics
- Creating data visualizations

## Capabilities
- Read Excel files with formulas
- Validate data integrity
- Generate summary reports
- Create charts and visualizations

## Resources
- templates/analysis-template.xlsx
- scripts/data-validator.py
```

### Platform-Specific Usage

#### Claude Apps (Pro/Max/Team/Enterprise)
- Enable in Settings (admins enable org-wide for Team/Enterprise)
- Claude automatically invokes relevant skills
- See skills in chain-of-thought reasoning
- Use skill-creator for guided creation

#### Claude Developer Platform (API)
- Add to Messages API requests
- Manage via `/v1/skills` endpoint
- Requires Code Execution Tool beta
- Use Anthropic skills: Excel, PowerPoint, Word, PDF
- Create custom skills via Claude Console

#### Claude Code
- Install via plugins from `anthropics/skills` marketplace
- Manual install: Add to `~/.claude/skills`
- Claude loads automatically when relevant
- Share via version control
- Claude Agent SDK support for custom agents

### Pre-Built Anthropic Skills

**Document Generation:**
- **Excel** - Read/write spreadsheets with formulas
- **PowerPoint** - Create presentations
- **Word** - Generate documents
- **PDF** - Create fillable PDFs

**Available in:** Claude apps, API, Claude Code

### Example Custom Skills

#### Brand Guidelines Skill
```
brand-guidelines/
├── SKILL.md
├── resources/
│   ├── brand-colors.json
│   ├── typography.json
│   ├── logo-usage.pdf
│   └── voice-tone-guide.md
└── templates/
    └── branded-document.docx
```

#### API Testing Skill
```
api-tester/
├── SKILL.md
├── scripts/
│   ├── test-endpoints.py
│   └── validate-responses.py
├── resources/
│   └── test-data.json
└── examples/
    └── sample-test.md
```

### Skills Best Practices

1. **Clear Documentation** - SKILL.md should explain when/how to use
2. **Minimal Dependencies** - Include only essential resources
3. **Executable Code** - Use scripts for tasks requiring precision
4. **Version Control** - Track skill changes like source code
5. **Security First** - Only use skills from trusted sources
6. **Composable Design** - Build skills that work well together
7. **Regular Updates** - Keep skills current with workflow changes

---

## Combining Subagents and Skills

Subagents can use Skills to become even more powerful:

### Example: Data Analysis Subagent with Excel Skill

```markdown
---
name: data-analyst
description: Use PROACTIVELY for data analysis tasks
tools: Read, Bash, Write
model: sonnet
---

Expert data analyst with Excel skill access.

Workflow:
1. Load Excel skill for spreadsheet operations
2. Analyze data for insights
3. Generate visualizations
4. Create summary reports
5. Provide actionable recommendations
```

### Example: Documentation Subagent with Brand Guidelines Skill

```markdown
---
name: brand-doc-writer
description: Use for creating branded documentation
tools: Read, Write, Glob
model: sonnet
---

Documentation specialist with brand guidelines skill.

Process:
1. Load brand-guidelines skill
2. Follow brand voice and tone
3. Use approved colors and typography
4. Include proper logo usage
5. Generate on-brand documents
```

---

## Getting Started Checklist

### For Subagents

- [ ] Run `/agents` to see available subagents
- [ ] Create your first subagent for a recurring task
- [ ] Test with explicit invocation: "Use [name] to..."
- [ ] Enable proactive use with "use PROACTIVELY" in description
- [ ] Share team subagents via `.claude/agents/`

### For Skills

- [ ] **Claude Apps**: Enable Skills in Settings
- [ ] **Claude Code**: Install from `anthropics/skills` marketplace
- [ ] **API**: Review `/v1/skills` endpoint documentation
- [ ] Create first custom skill for your workflow
- [ ] Test skill activation with relevant task
- [ ] Share skills via version control

---

## Troubleshooting

### Subagent Not Activating

1. Check description includes clear trigger keywords
2. Verify tools list includes necessary capabilities
3. Use explicit invocation: "Use [name] subagent to..."
4. Ensure file is in correct location (`.claude/agents/` or `~/.claude/agents/`)

### Skill Not Loading

1. Verify SKILL.md format is correct
2. Check skill is in `~/.claude/skills/` directory
3. Ensure Skills are enabled in Settings (Claude apps)
4. Confirm Code Execution Tool is enabled (API)
5. Use trusted sources only for security

### Performance Issues

1. Limit tool access per subagent
2. Keep skill resources minimal
3. Use specific, not generic, descriptions
4. Combine related functionality into single skill

---

## Resources

**Subagents:**
- [Subagents Documentation](https://docs.claude.com/en/docs/claude-code/sub-agents.md)
- [SDK Subagents Guide](https://docs.claude.com/en/docs/claude-code/sdk/subagents.md)

**Skills:**
- [Skills Announcement](https://www.anthropic.com/news/introducing-agent-skills)
- [Anthropic Skills Marketplace](https://github.com/anthropics/skills)
- [API Skills Documentation](https://docs.anthropic.com/claude/docs/agent-skills)
- [Skills Engineering Blog](https://www.anthropic.com/engineering)

**Support:**
- Claude Apps: Help Center
- API: Developer Documentation
- Claude Code: `/help` command

---

## Security Considerations

**For Subagents:**
- Principle of least privilege - minimal tool access
- Review subagent code before use
- Audit subagent actions in logs
- Restrict sensitive operations

**For Skills:**
- Only use skills from trusted sources
- Review code before execution
- Skills can execute code - be mindful
- Enterprise: Enable admin controls for skill deployment

---

## Future Roadmap

**Coming Soon:**
- Simplified skill creation workflows
- Enterprise-wide skill deployment
- Enhanced skill versioning
- Improved marketplace discovery
- Team collaboration features

---

*Last Updated: October 2025*
