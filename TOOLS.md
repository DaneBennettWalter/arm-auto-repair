# TOOLS.md - Local Notes

Skills define _how_ tools work. This file is for _your_ specifics — the stuff that's unique to your setup.

## What Goes Here

Things like:

- Camera names and locations
- SSH hosts and aliases
- Preferred voices for TTS
- Speaker/room names
- Device nicknames
- Anything environment-specific

## Examples

```markdown
### Cameras

- living-room → Main area, 180° wide angle
- front-door → Entrance, motion-triggered

### SSH

- home-server → 192.168.1.100, user: admin

### TTS

- Preferred voice: "Nova" (warm, slightly British)
- Default speaker: Kitchen HomePod
```

## Why Separate?

Skills are shared. Your setup is yours. Keeping them apart means you can update skills without losing your notes, and share skills without leaking your infrastructure.

---

Add whatever helps you do your job. This is your cheat sheet.

## Voice Notes (Whisper)

When Dane sends a `<media:audio>` placeholder, **auto-transcribe it** before replying. Don't ask first.

- Skill: `openai-whisper-api` (global, uses `OPENAI_API_KEY` from `~/.openclaw/workspace/.env`)
- Script: `/home/dane/.config/nvm/versions/node/v22.22.2/lib/node_modules/openclaw/skills/openai-whisper-api/scripts/transcribe.sh` (chmod +x already applied)
- Inbound audio path: `/home/dane/.openclaw/media/inbound/<uuid>.ogg` (from the `[media attached: ...]` line)
- Verified working: 2026-04-24 (whisper-1, ~5s clip, accurate)

Quick one-liner:

```bash
set -a; source ~/.openclaw/workspace/.env; set +a
curl -sS https://api.openai.com/v1/audio/transcriptions \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -F file=@/path/to/audio.ogg -F model=whisper-1
```

Then reply to whatever he actually said.
