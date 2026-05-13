# Backup Naming Policy

**Pattern:** `claw-backup-v{N}.tar.gz`

**Examples:**
- `claw-backup-v1.tar.gz`
- `claw-backup-v2.tar.gz`
- `claw-backup-v3.tar.gz`

**Rules:**
- Short, human-readable names
- Sequential versioning
- Never overwrite existing versions
- Default location: `~/Desktop/`

**Wrong:**
- ❌ `openclaw-workspace-full-backup-20260507-083402.tar.gz` (absurdly long)
- ❌ `backup.tar.gz` (no versioning)

**Right:**
- ✅ `claw-backup-v1.tar.gz` (clean, clear, versioned)
