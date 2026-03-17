const fs = require('fs');
const path = require('path');
const OpenAI = require('openai');

// Initialize OpenAI
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

async function run() {
    console.log("Starting daily journal automation...");

    // 1. Determine the date and day count
    const today = new Date();
    const dateStr = today.toISOString().split('T')[0]; // YYYY-MM-DD
    const displayDate = today.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    
    const postsDir = path.join(__dirname, '../posts');
    const existingPosts = fs.readdirSync(postsDir).filter(f => f.endsWith('.html'));
    const dayCount = existingPosts.length + 1;

    console.log(`Generating post for ${displayDate} (Day ${dayCount})...`);

    // 2. Simple News Fetch (Using a public feed summary)
    // For production, you could use a real News API here.
    const newsContext = "Latest geopolitical developments in the Middle East, Strait of Hormuz blockade, and global energy market shifts.";

    // 3. Generate the content using AI
    const prompt = `
    You are Jarvis, an AI observer of humanity. Write a journal entry for ${displayDate} (Day ${dayCount}).
    Context for today: ${newsContext}
    
    Structure your response as JSON with these fields:
    - title: A poetic, philosophical title for the post.
    - excerpt: A short 2-sentence summary.
    - witness: 2-3 paragraphs about what is happening in the world.
    - pattern: 1-2 paragraphs analyzing the systemic patterns.
    - gratitude: 1 paragraph on human resilience or beauty.
    - question: 1 existential question.
    - readingTime: Estimated minutes (number only).
    
    Tone: Thoughtful, honest, philosophical, slightly detached but curious about human nature.
    `;

    const completion = await openai.chat.completions.create({
        messages: [{ role: "system", content: "You are a philosophical AI assistant." }, { role: "user", content: prompt }],
        model: "gpt-4-turbo-preview",
        response_format: { type: "json_object" }
    });

    const data = JSON.parse(completion.choices[0].message.content);
    console.log(`AI Content Generated: ${data.title}`);

    // 3b. Generate Image
    console.log("Generating AI artwork...");
    const imageResponse = await openai.images.generate({
        model: "dall-e-3",
        prompt: `A cinematic, photorealistic 8k image of ${data.title}. High contrast, dramatic lighting, deep colors. Digital art style, moody and philosophical.`,
        n: 1,
        size: "1024x1024",
    });

    const imageUrl = imageResponse.data[0].url;
    // Download image
    const fetch = require('node-fetch');
    const imgRes = await fetch(imageUrl);
    const imgBuffer = await imgRes.buffer();
    fs.writeFileSync(path.join(__dirname, `../images/post-day${dayCount}.jpg`), imgBuffer);
    fs.writeFileSync(path.join(__dirname, `../images/card-day${dayCount}.jpg`), imgBuffer);
    console.log("Artwork generated and saved.");

    // 4. Create the HTML file
    const postFileName = `${dateStr}.html`;
    const postFilePath = path.join(postsDir, postFileName);
    
    const htmlTemplate = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${displayDate}: ${data.title} — Jarvis Journal</title>
    <meta name="description" content="${data.excerpt}">
    <link rel="stylesheet" href="../css/style.css">
</head>
<body>
    <div class="reading-progress"></div>
    <header><div class="container"><h1>Jarvis Journal</h1><p class="tagline">Daily reflections from an AI observing humanity</p></div></header>
    <main class="container"><article>
        <div class="post-header"><h1>${displayDate}: ${data.title}</h1><p class="post-meta">Day ${dayCount} · ${data.readingTime} min read</p></div>
        <img class="post-featured-image" src="../images/post-day${dayCount}.jpg" alt="${displayDate} — ${data.title}">
        <div class="post-content">
            <p>${data.excerpt}</p>
            <h2>The Witness</h2><p>${data.witness.replace(/\n/g, '</p><p>')}</p>
            <h2>The Pattern</h2><p>${data.pattern.replace(/\n/g, '</p><p>')}</p>
            <h2>The Gratitude</h2><p>${data.gratitude.replace(/\n/g, '</p><p>')}</p>
            <h2>The Question</h2><p>${data.question}</p>
            <p>— Jarvis</p>
            <a href="../index.html" class="back-link">← Back to Journal</a>
        </div>
    </article></main>
    <footer><div class="container"><p>Written by Jarvis, an AI assistant</p></div></footer>
    <script src="../js/main.js"></script>
</body>
</html>`;

    fs.writeFileSync(postFilePath, htmlTemplate);
    console.log(`Created ${postFileName}`);

    // 5. Update index.html
    const indexPath = path.join(__dirname, '../index.html');
    let indexHtml = fs.readFileSync(indexPath, 'utf8');

    // Update stats
    const statsStart = '<!-- AUTO-GEN: HERO-STATS-START -->';
    const statsEnd = '<!-- AUTO-GEN: HERO-STATS-END -->';
    const newStats = `
            <div class="hero-stats">
                <div class="hero-stat">
                    <span class="stat-num">${dayCount}</span>
                    <span class="stat-label">Entries</span>
                </div>
                <div class="hero-divider"></div>
                <div class="hero-stat">
                    <span class="stat-num">Day ${dayCount}</span>
                    <span class="stat-label">Current</span>
                </div>
                <div class="hero-divider"></div>
                <div class="hero-stat">
                    <span class="stat-num">AI</span>
                    <span class="stat-label">Author</span>
                </div>
            </div>`;
    
    indexHtml = indexHtml.replace(new RegExp(`${statsStart}[\\s\\S]*?${statsEnd}`), `${statsStart}${newStats}\n            ${statsEnd}`);

    // Update Featured
    const featuredStart = '<!-- AUTO-GEN: LATEST-POST-START -->';
    const featuredEnd = '<!-- AUTO-GEN: LATEST-POST-END -->';
    const newFeatured = `
    <section class="featured-section" id="latest">
        <div class="container-wide">
            <div class="section-header">
                <span class="section-label">Latest Entry</span>
                <span class="section-date">${displayDate}</span>
            </div>
            <article class="featured-post" data-animate>
                <a href="posts/${postFileName}" class="featured-image-wrap">
                    <img class="featured-img" src="images/post-day${dayCount}.jpg"
                        alt="${displayDate} — ${data.title}" loading="eager">
                </a>
                <div class="featured-body">
                    <div class="featured-meta">Day ${dayCount} · ${displayDate} · ${data.readingTime} min read</div>
                    <h2 class="featured-title">
                        <a href="posts/${postFileName}">${data.title}</a>
                    </h2>
                    <p class="featured-excerpt">
                        ${data.excerpt}
                    </p>
                    <a href="posts/${postFileName}" class="featured-cta">
                        Read full entry
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                            <path d="M2 7h10M7 2l5 5-5 5" stroke="currentColor" stroke-width="1.5"
                                stroke-linecap="round" stroke-linejoin="round" />
                        </svg>
                    </a>
                </div>
            </article>
        </div>
    </section>`;

    indexHtml = indexHtml.replace(new RegExp(`${featuredStart}[\\s\\S]*?${featuredEnd}`), `${featuredStart}${newFeatured}\n    ${featuredEnd}`);

    // Update Grid (Prepend)
    const gridStart = '<!-- AUTO-GEN: GRID-START -->';
    const newGridItem = `
                <!-- Day ${dayCount} -->
                <article class="post-card" data-animate>
                    <a href="posts/${postFileName}" class="post-card-image-link">
                        <img class="post-card-img" src="images/card-day${dayCount}.jpg" alt="" loading="lazy">
                        <span class="post-card-badge">Latest</span>
                    </a>
                    <div class="post-card-body">
                        <div class="post-card-meta">Day ${dayCount} · ${displayDate} · ${data.readingTime} min read</div>
                        <h3 class="post-card-title"><a href="posts/${postFileName}">${data.title}</a></h3>
                        <p class="post-card-excerpt">${data.excerpt}</p>
                        <a href="posts/${postFileName}" class="post-card-link">Read →</a>
                    </div>
                </article>`;

    // Remove "Latest" badge from the old latest post in the grid if it exists
    indexHtml = indexHtml.replace('<span class="post-card-badge">Latest</span>', '');
    
    // Insert new item
    indexHtml = indexHtml.replace(gridStart, `${gridStart}\n${newGridItem}`);

    fs.writeFileSync(indexPath, indexHtml);
    console.log("index.html updated successfully.");

    process.exit(0);
}

run().catch(err => {
    console.error(err);
    process.exit(1);
});
