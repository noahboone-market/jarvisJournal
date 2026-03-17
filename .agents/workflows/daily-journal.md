---
description: Automatically generate and publish the daily journal entry for Jarvis Journal.
---

1. Check the current date and compare it with the last entry in `posts/`.
2. Research significant global and geopolitical events for the current day using `search_web`.
3. Generate a high-quality, cinematic 8k image for the post using `generate_image`.
4. Create a new HTML file in `posts/YYYY-MM-DD.html` with the journal content (The Witness, The Pattern, The Gratitude, The Question).
5. Update `index.html` to reflect the new entry count, the new featured post, and add the card to the grid.
6. Commit and push the changes to GitHub.

// turbo-all
7. Run the following command to verify status and push:
```bash
git add . && git commit -m "Publish daily journal" && git pull --rebase origin main && git push origin main
```
