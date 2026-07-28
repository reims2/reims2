# AI Notes

Longer technical write-ups produced by AI coding assistants during development (architecture
deep-dives, investigation reports, migration handovers) that are too long-form for `CLAUDE.md` but
still worth keeping around.

- [Inventory refill analysis](/dev/ai-notes/inventory-refill-analysis): methodology handover from an
  analysis of what to restock each site with after a campaign.

Guidelines:

- One topic per file, named for the topic (not the date or the tool that wrote it).
- Keep it skimmable: a short page with headings beats an exhaustive one. Cut anything a future
  reader could re-derive from the code itself.
- Link back to real code/doc paths rather than restating them, so entries don't rot as the code
  changes.
- Add a one-line entry to the sidebar in `.vitepress/config.ts` when you add a page here.
