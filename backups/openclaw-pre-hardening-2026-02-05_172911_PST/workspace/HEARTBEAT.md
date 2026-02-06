# HEARTBEAT.md - Smart Overnight Mode 🐲

## Strategy

Instead of cron spam, use heartbeat for paced overnight work:

1. **Read context first** - Check `memory/context-tracker.md` for today's topics
2. **Check time** - Only do heavy work during overnight hours (midnight-7am)
3. **One task per heartbeat** - Don't try to do everything at once
4. **Track progress** - Update this file after each task
5. **Morning summary** - ONE cron at 8am to deliver results

---

## Overnight Tasks Queue

Work through these ONE AT A TIME during overnight heartbeats:

### Phase 1: Context Review (first overnight heartbeat)
- [ ] Read memory/context-tracker.md
- [ ] Identify top 2-3 research topics
- [ ] Write research plan to memory/overnight-plan.md

### Phase 2: Research (subsequent heartbeats)
- [ ] Research task 1 from plan
- [ ] Research task 2 from plan  
- [ ] Research task 3 from plan

### Phase 3: Create (if time permits)
- [ ] Draft content, build something, or write docs based on research

---

## Progress Log

(Updated after each heartbeat task)

```
[2026-02-02 00:12] - Phase 1 complete: Updated context-tracker.md with today's topics (Discord export, ChatGPT Pulse, 8sleep). Created research plan with 3 priority tasks. Ready for Phase 2.
[2026-02-02 00:35] - Research Task 1 complete: Discord export memory optimization guide created. Key solution: use --partition flag to chunk large exports. Ready for implementation.
[2026-02-02 04:24] - Research Task 2 complete: ChatGPT Pulse hackathon extraction guide created. Multi-source approach: Devpost + MLH scraping, Eventbrite API, social monitoring. Pulse UI bypass strategy included.
[2026-02-02 05:24] - Research Task 3 complete: 8sleep automation patterns guide created. Covers rate limit solutions, circadian temperature patterns, Home Assistant integrations, and physical controls. All overnight research complete! ✅

[2026-02-03 00:53] - Phase 1 complete: Created fresh research plan for tonight's topics (WhatsApp integration, message sync performance, AI identity management). Ready for Phase 2.
[2026-02-03 01:20] - Research Task 1 complete: WhatsApp performance optimization guide created. Key findings: persistent connections (Baileys) vs on-demand (wacli), session conflict resolution, 10-50x latency improvement expected. Ready for Task 2.
[2026-02-03 01:45] - Research Task 2 complete: AI identity management patterns guide created. Key findings: independent identity vs proxy patterns, platform-specific considerations, security benefits of dedicated AI accounts. Ready for Task 3.
[2026-02-03 04:18] - Research Task 3 complete: Group chat dynamics & AI participation guide created. Key findings: 3-question filter (value/timing/tone), reaction strategies, platform-specific patterns. All Feb 3 overnight research complete! ✅

[2026-02-04 00:02] - Phase 1 complete: Created fresh research plan for Feb 4 topics (Discord knowledge management, hackathon discovery, home automation patterns). Ready for Phase 2.
[2026-02-04 04:22] - Research Task 1 complete: Discord knowledge management at scale guide created. ChromaDB vector search + ElasticSearch hybrid approach, includes indexing pipeline, search CLI, and performance benchmarks. Ready for Task 2.
[2026-02-04 05:00] - Research Task 2 complete: Hackathon discovery & aggregation system designed. Multi-source scraping (Devpost, MLH, Eventbrite, Twitter, ChatGPT Pulse), smart deduplication, quality scoring, and automated notifications. Ready for Task 3.
[2026-02-04 05:24] - Research Task 3 complete: Home automation integration patterns guide created. Covers rate limit solutions, circadian temperature patterns, Home Assistant integrations, and physical controls. All Feb 4 overnight research complete! ✅

[2026-02-05 00:09] - Phase 1 complete: Created overnight research plan for Feb 5 topics (portable AC installation, identity token crypto analysis, speech-to-text API landscape). 3 priority research tasks identified. Ready for Phase 2.
[2026-02-05 00:35] - Research Task 1 complete: Portable AC casement window installation guide created. HOOMEE fabric seal recommended over rigid panels. Complete comparison of 4 methods, tools, costs, and troubleshooting for Whynter ARC-14S. Ready for Task 2.
[2026-02-05 01:20] - Research Task 2 complete: Crypto identity token sector analysis created. CVC confirmed as best risk/reward vs WLD (40x cheaper, 80% vs 28% circulating). AI agent identity verification opportunity mapped. Ready for Task 3.
[2026-02-05 04:18] - Research Task 3 complete: Speech-to-text API landscape analysis created. Mistral Voxtral Transcribe 2 identified as game-changer at $0.003/min (50% cheaper than competitors). Apache 2.0 self-hosting option provides vendor independence. All Feb 5 overnight research complete! ✅

[2026-02-05 05:00] - Daily maintenance + system reminders complete: Shell completion upgraded to cached (faster startup). Grok Collections test successful - both RAG systems working (ChromaDB + Grok hybrid search). 8sleep still has auth error.
```

---

## Rules

1. **Don't repeat work** - Check this file before starting
2. **Quality > quantity** - One good research doc beats 5 shallow ones
3. **Respect sleep hours** - No Discord messages between midnight and 8am unless urgent
4. **Infer don't prescribe** - Let context-tracker guide what to research

---
Last updated: 2026-01-30 11:21 PST
Status: READY FOR TONIGHT
