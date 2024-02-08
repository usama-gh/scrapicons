const express = require('express');
const puppeteer = require('puppeteer');
const app = express();

app.get('/search', async (req, res) => {
    const { term, style, page = 1 } = req.query; 

    if (!term || !style) {
        return res.status(400).send('Missing search term or style');
    }

    let browser;
    try {

        browser = await puppeteer.launch({ headless:'new', args: ['--no-sandbox'] });
        const page = await browser.newPage();
      
        const urlPattern = `https://www.svgrepo.com/vectors/${term}/${style}/${req.query.page}`;
        let svgLinks = [];

        await page.goto(urlPattern);

        const pageSvgLinks = await page.evaluate(() => {
            const divElements = document.querySelectorAll('div.style_NodeImage__FiBL5');
            const links = [];

            divElements.forEach((divElement) => {
                const imgElement = divElement.querySelector('img');
                if (imgElement) {
                    const svgLink = imgElement.getAttribute('src');
                    links.push(svgLink);
                }
            });

            return links;
        });

        svgLinks = svgLinks.concat(pageSvgLinks);

        res.json({ svgLinks });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Internal Server Error');
    } finally {
        if (browser) {
            await browser.close();
        }
    }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
