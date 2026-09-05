import { Actor } from 'apify';
import { CheerioCrawler } from 'crawlee';

await Actor.main(async () => {
    const input = await Actor.getInput();
    const {
        carType = '',
        brand = '',
        maxResults = 20,
        proxyConfiguration = { useApifyProxy: true }
    } = input;
    
    let startUrl = 'https://sayartii.com/en/search?';
    if (carType) startUrl += `car-type=${carType}&`;
    if (brand) startUrl += `brand=[{:make "${brand}"}]&`;
    
    console.log(`Sayartii UAE scraper started`);
    console.log(`Car Type: ${carType || 'All'} | Brand: ${brand || 'All'} | Max: ${maxResults}`);
    
    const proxyConfig = proxyConfiguration?.useApifyProxy 
        ? await Actor.createProxyConfiguration(proxyConfiguration)
        : undefined;
    
    let itemCount = 0;
    
    const crawler = new CheerioCrawler({
        proxyConfiguration: proxyConfig,
        requestHandlerTimeoutSecs: 60,
        maxRequestRetries: 3,
        
        async requestHandler({ request, $, log }) {
            log.info(`Processing: ${request.url}`);
            
            const listings = [];
            
            // Extract car listings
            $('a[href*="/AE/l/"]').each((i, el) => {
                if (itemCount >= maxResults) return false;
                
                const $link = $(el);
                const url = $link.attr('href');
                
                if (!url) return;
                
                const fullUrl = url.startsWith('http') ? url : `https://sayartii.com${url}`;
                
                // Get all text nodes
                const allText = $link.text().split('\n').map(t => t.trim()).filter(Boolean);
                
                // Title is the line with year and car name (e.g. "2019 Range Rover Velar")
                const title = allText.find(t => t.match(/^\d{4}\s+\w+/)) || allText[0] || '';
                
                // Price ends with 'aed'
                const price = allText.find(t => t.toLowerCase().endsWith('aed')) || null;
                
                // Mileage contains 'k km' or similar
                const mileage = allText.find(t => t.includes('km')) || null;
                
                // Image
                const image = $link.find('img').attr('src') || null;
                const fullImage = image && image.startsWith('http') ? image : 
                                 image ? `https://sayartii.com${image}` : null;
                
                if (!title || title.length < 8) return;
                
                listings.push({
                    title,
                    price: priceText,
                    mileage,
                    url: fullUrl,
                    image: fullImage,
                    carType,
                    brand,
                    scrapedAt: new Date().toISOString()
                });
                
                itemCount++;
            });
            
            log.info(`Extracted ${listings.length} listings from this page`);
            
            if (listings.length > 0) {
                await Actor.pushData(listings);
            }
        },
        
        failedRequestHandler({ request, log }) {
            log.error(`Request ${request.url} failed`);
        },
    });
    
    await crawler.run([startUrl]);
    
    console.log(`Scraping complete! Total items: ${itemCount}`);
});
