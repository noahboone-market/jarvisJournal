const puppeteer = require('puppeteer');

(async () => {
    try {
        const browser = await puppeteer.launch();
        const page = await browser.newPage();

        page.on('console', msg => console.log('PAGE LOG:', msg.text()));
        page.on('pageerror', error => console.log('PAGE ERROR:', error.message));

        await page.goto('http://localhost:9999', { waitUntil: 'networkidle0' });
        await page.screenshot({ path: '/Users/noahboone/jarvisJournal/screenshot.png', fullPage: true });
        await browser.close();
        console.log("Screenshot saved to screenshot.png");
    } catch (e) {
        console.error("Puppeteer error:", e);
    }
})();
