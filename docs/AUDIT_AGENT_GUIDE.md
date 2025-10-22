---
doc_type: user_guide
project_name: Turbo Code Platform
title: Document Audit Agent Guide
version: "1.0"
tags: documentation, automation, maintenance
---

# Document Audit Agent Guide

## Overview

The **Document Audit Agent** is a maintenance tool that:
1. Scans all documents in `docs/` directory
2. Checks for missing or incomplete frontmatter headers
3. Optionally adds/fixes missing headers
4. Re-uploads missing or updated documents to Turbo database

This is useful for:
- **Repairing failed uploads** - Re-upload documents that didn't sync
- **Fixing older docs** - Add frontmatter to documents created before the system
- **Database recovery** - Restore documents after database issues
- **Batch maintenance** - Fix multiple documents at once

## When to Use

Use the audit agent when:
- ✅ Files were added before the auto-upload system was set up
- ✅ Upload failures occurred (check logs for errors)
- ✅ Database was reset or documents were deleted
- ✅ You want to ensure all documents have proper headers
- ✅ You want to standardize metadata across all documents

**Don't use for:** Regular document uploads (use the automatic file watcher instead)

## Usage

### Basic Commands

```bash
# 1. DRY RUN - See what would be done without making changes
python scripts/docs_audit_agent.py --dry-run

# 2. FIX HEADERS - Add missing frontmatter to files
python scripts/docs_audit_agent.py --fix-headers

# 3. UPLOAD MISSING - Upload documents not in database
python scripts/docs_audit_agent.py --upload-missing

# 4. FULL REPAIR - Fix headers AND upload missing
python scripts/docs_audit_agent.py --fix-headers --upload-missing

# 5. FORCE RE-UPLOAD - Re-upload ALL documents
python scripts/docs_audit_agent.py --upload-all
```

### Using the Wrapper Script

```bash
# Make script executable (first time only)
chmod +x scripts/audit-docs.sh

# Run audit
./scripts/audit-docs.sh --dry-run
./scripts/audit-docs.sh --fix-headers
```

## Command Options

### `--dry-run`
**What it does:** Shows what would be done without making any changes

**When to use:** Always run this first to preview changes

**Example:**
```bash
python scripts/docs_audit_agent.py --dry-run
```

**Output:**
```
⚠ FEATURE_REQUESTS.md: Frontmatter missing (use --fix-headers to fix)
⚠ AUTOMATED_DOC_UPLOAD.md: Not found in database
✓ pgadmin-guide.md: Already in database
```

### `--fix-headers`
**What it does:** Adds or fixes missing YAML frontmatter in files

**When to use:** When documents are missing frontmatter

**What happens:**
1. Creates backup in `docs/.backups/`
2. Generates proper frontmatter based on file path and content
3. Writes updated file with frontmatter
4. Marks document for upload

**Example:**
```bash
python scripts/docs_audit_agent.py --fix-headers
```

**Before (no frontmatter):**
```markdown
# Feature Requests

## Overview
...
```

**After (with frontmatter):**
```markdown
---
doc_type: other
project_name: Turbo Code Platform
title: Feature Requests
version: "1.0"
---

# Feature Requests

## Overview
...
```

### `--upload-missing`
**What it does:** Uploads documents that aren't in the database

**When to use:**
- After database reset
- After fixing headers
- To catch any missed uploads

**Example:**
```bash
python scripts/docs_audit_agent.py --upload-missing
```

### `--upload-all`
**What it does:** Re-uploads ALL documents, even if already in database

**When to use:**
- After major updates to upload logic
- To force refresh all documents
- Database migration

**Warning:** This will update all documents. Use sparingly.

**Example:**
```bash
python scripts/docs_audit_agent.py --upload-all
```

## Workflow Examples

### Scenario 1: New System Setup (Older Docs Need Headers)

You have 50 old markdown files without frontmatter:

```bash
# Step 1: Check what needs fixing
python scripts/docs_audit_agent.py --dry-run

# Review output, confirm 50 files need headers

# Step 2: Fix headers and upload
python scripts/docs_audit_agent.py --fix-headers --upload-missing
```

**Result:**
- Backups created in `docs/.backups/`
- All 50 files get proper frontmatter
- All 50 documents uploaded to database

### Scenario 2: Upload Failure Recovery

The file watcher failed to upload 5 documents:

```bash
# Step 1: Check what's missing
python scripts/docs_audit_agent.py --dry-run

# Step 2: Upload missing documents (headers already exist)
python scripts/docs_audit_agent.py --upload-missing
```

**Result:**
- 5 missing documents uploaded
- Existing files unchanged

### Scenario 3: Database Was Reset

Database was wiped, need to restore all documents:

```bash
# Re-upload everything
python scripts/docs_audit_agent.py --upload-all
```

**Result:**
- All 70 documents re-uploaded to fresh database

### Scenario 4: Audit Only (No Changes)

Just want to see the current state:

```bash
# Dry run with detailed summary
python scripts/docs_audit_agent.py --dry-run
```

**Result:**
- Report of all files
- Count of missing headers
- Count of missing uploads
- No changes made

## Understanding the Output

### Status Indicators

- **✓ OK**: File has frontmatter and is in database
- **⚠ Missing headers**: File needs frontmatter (use `--fix-headers`)
- **⚠ Missing from database**: File not uploaded (use `--upload-missing`)
- **⚠ Force re-upload**: Re-uploading due to `--upload-all`
- **✗ Error**: Something went wrong (check logs)

### Example Output

```
================================================================================
DOCUMENT AUDIT AGENT
================================================================================
Mode: LIVE
Fix headers: True
Upload all: False
Upload missing: True
================================================================================
Fetching existing documents from database...
Found 68 documents in database
Scanning docs...
Found 70 files to audit

✓ pgadmin-guide.md: Already in database
✓ neo4j-guide.md: Already in database
⚠ FEATURE_REQUESTS.md: Added/fixed frontmatter (backup: docs/.backups/FEATURE_REQUESTS.md)
⚠ README.md: Added/fixed frontmatter (backup: docs/.backups/README.md)

================================================================================
UPLOADING DOCUMENTS
================================================================================
Uploading 2 documents...
✓ Uploaded: Feature Requests (ID: abc-123)
✓ Uploaded: Readme (ID: def-456)
Upload complete: 2 success, 0 failed

================================================================================
AUDIT SUMMARY
================================================================================
Total files scanned: 70
  ✓ OK: 68
  ⚠ Missing headers: 2
  ⚠ Missing from database: 0
  ⚠ Force re-upload: 0
  ✗ Errors: 0
================================================================================
```

## Auto-Generated Frontmatter

The agent intelligently generates frontmatter based on file location and content:

### Doc Type Detection

| File Path | Auto-Detected Type |
|-----------|-------------------|
| `docs/guides/` | `user_guide` |
| `docs/adr/` | `adr` |
| `docs/api/` | `api_doc` |
| `docs/specifications/` | `specification` |
| `docs/architecture/` | `design` |
| `docs/deployment/` | `other` |
| `**/README.md` | `readme` |
| `**/CHANGELOG.md` | `changelog` |

### Title Detection

Priority order:
1. First `# Heading` in content
2. Filename (converted to Title Case)
3. "Untitled Document"

### Tag Detection

Auto-adds tags based on directory:
- `docs/guides/` → adds `guide` tag
- `docs/adr/` → adds `architecture` tag
- `docs/api/` → adds `api` tag
- `docs/deployment/` → adds `deployment` tag
- `docs/development/` → adds `development` tag

## Safety Features

### Automatic Backups

Before modifying any file, the agent creates a backup:

```
docs/.backups/FEATURE_REQUESTS.md
docs/.backups/README.md
docs/.backups/ADR_001.md
```

**To restore a backup:**
```bash
cp docs/.backups/FEATURE_REQUESTS.md docs/FEATURE_REQUESTS.md
```

### Dry Run Mode

Always use `--dry-run` first to preview changes:

```bash
python scripts/docs_audit_agent.py --dry-run --fix-headers
```

This shows what **would** happen without actually doing it.

## Logs

All audit runs are logged to:

```
logs/docs_audit.log
```

**Check logs:**
```bash
tail -f logs/docs_audit.log
```

## Troubleshooting

### Issue: "Failed to fetch existing documents"

**Problem:** Can't connect to Turbo API

**Solutions:**
1. Ensure API is running: `docker-compose ps api`
2. Check API URL: `export TURBO_API_URL=http://localhost:8001/api/v1`
3. Verify API is accessible: `curl http://localhost:8001/api/v1/documents/`

### Issue: "Permission denied" when writing files

**Problem:** No write access to docs directory

**Solution:**
```bash
chmod u+w docs/*.md
```

### Issue: Backup directory full

**Problem:** Too many backups in `docs/.backups/`

**Solution:**
```bash
# Clean old backups (older than 7 days)
find docs/.backups/ -mtime +7 -delete
```

### Issue: YAML syntax error in generated frontmatter

**Problem:** Special characters in title or content

**Solution:** Manually review and fix the generated frontmatter. The agent logs the error.

## Best Practices

1. **Always dry-run first**
   ```bash
   python scripts/docs_audit_agent.py --dry-run
   ```

2. **Review backups before deleting**
   ```bash
   ls -la docs/.backups/
   ```

3. **Check logs after running**
   ```bash
   tail logs/docs_audit.log
   ```

4. **Run sparingly** - The file watcher handles ongoing uploads
   - Run after: Database reset, bulk file additions, upload failures
   - Don't run: For every new document (watcher handles it)

5. **Commit before running** - Ensure git working directory is clean
   ```bash
   git status
   git add .
   git commit -m "Before audit agent run"
   ```

6. **Test on a subset first** - For large batches, test on a few files
   ```bash
   # Move files to test directory
   mkdir docs/test
   mv docs/FEATURE_REQUESTS.md docs/test/
   python scripts/docs_audit_agent.py --dry-run
   ```

## Integration with File Watcher

The audit agent **complements** the file watcher:

| Tool | Purpose | When to Use |
|------|---------|-------------|
| **File Watcher** | Automatic real-time upload | Always running, handles new/modified files |
| **Audit Agent** | Batch repair and maintenance | Manual runs for recovery and older docs |

**Workflow:**
1. File watcher handles day-to-day uploads automatically
2. Audit agent fixes issues when they occur
3. Both tools use the same upload endpoint for consistency

## Advanced Usage

### Environment Variables

```bash
# Set custom API URL
export TURBO_API_URL=http://localhost:8001/api/v1

# Run audit
python scripts/docs_audit_agent.py --dry-run
```

### Scripting

Run audit as part of CI/CD or cron job:

```bash
#!/bin/bash
# Daily audit check

python3 scripts/docs_audit_agent.py --dry-run > /tmp/audit_report.txt

if grep -q "Missing" /tmp/audit_report.txt; then
    echo "Documents need attention!"
    cat /tmp/audit_report.txt | mail -s "Turbo Docs Audit" admin@example.com
fi
```

### Custom Frontmatter

If auto-generated frontmatter isn't right, edit manually:

```markdown
---
doc_type: specification  # Change from 'other'
project_name: My Custom Project  # Change from default
title: Custom Title
version: "2.0"  # Increment version
tags: custom, tags, here
author: me@example.com
---

# Content...
```

Then re-run audit to upload:
```bash
python scripts/docs_audit_agent.py --upload-missing
```

## Summary

The Document Audit Agent is your **safety net** for the automated document system:

- ✅ **Repairs** failed uploads
- ✅ **Standardizes** frontmatter across all documents
- ✅ **Recovers** from database issues
- ✅ **Audits** entire docs directory
- ✅ **Backs up** before making changes

**Quick Reference:**
```bash
# Preview changes
python scripts/docs_audit_agent.py --dry-run

# Fix and upload
python scripts/docs_audit_agent.py --fix-headers --upload-missing

# Force re-upload all
python scripts/docs_audit_agent.py --upload-all
```

---

**Last Updated**: October 19, 2025
**Version**: 1.0
