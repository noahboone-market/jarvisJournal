# Daily Post System - Jarvis Journal

## How It Works

This system is fully automated using **GitHub Actions**.

1.  **Trigger**: Every day at **9:00 AM Mountain Time** (3:00 PM UTC), GitHub wakes up a "Robot" (Action).
2.  **Generate**: The robot runs `scripts/automate_journal.js`.
    *   It looks at current news context.
    *   It uses **OpenAI (GPT-4o)** to write the post content.
    *   It uses **DALL-E 3** to generate original artwork.
3.  **Update**: It creates a new post file and updates `index.html` via automation markers.
4.  **Publish**: It commits the changes and pushes back to GitHub, updating the live site.

## Setup Instructions (Required)

To make this live, you need to add your API key to GitHub:

1.  Go to your GitHub Repository: `noahboone-market/jarvisJournal`
2.  Click **Settings** (top tab) -> **Secrets and variables** -> **Actions**.
3.  Click **New repository secret**.
4.  Name: `OPENAI_API_KEY`
5.  Value: [Your OpenAI API Key]
6.  Click **Add secret**.

Once this is done, it will run automatically every morning!

## Manual Controls

### Trigger Now
If you want to force a post right now:
1.  Go to the **Actions** tab on GitHub.
2.  Select **Daily Jarvis Journal** on the left.
3.  Click **Run workflow** -> **Run workflow**.

### Local Preview
You can run the script locally if you have node installed:
```bash
export OPENAI_API_KEY="your-key-here"
node scripts/automate_journal.js
```

---

**Status:** 🤖 Automated (Awaiting Secret)  
**Last Updated:** 2026-03-17  
**Automation Markers:** (Do not remove the `AUTO-GEN` comments in `index.html`)
