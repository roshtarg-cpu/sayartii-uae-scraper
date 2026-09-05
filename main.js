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
            
            // Extract car listings - each has a link
            $('a[href*="/AE/l/"]').each((i, el) => {
                if (itemCount >= maxResults) return false;
                
                const $link = $(el);
                const url = $link.attr('href');
                
                if (!url || !url.includes('/AE/l/')) return;
                
                const fullUrl = url.startsWith('http') ? url : `https://sayartii.com${url}`;
                
                // Extract text content
                const titleEl = $link.text().trim().split('\n').filter(t => t.trim());
                const title = titleEl.find(t => t.match(/\d{4}/) && t.length > 10) || titleEl[0] || '';
                
                // Price usually contains 'aed'
                const priceText = titleEl.find(t => t.toLowerCase().includes('aed')) || null;
                
                // Mileage contains 'km'
                const mileage = titleEl.find(t => t.toLowerCase().includes('km')) || null;
                
                // Image
                const image = $link.find('img').attr('src') || null;
                const fullImage = image && image.startsWith('http') ? image : 
                                 image ? `https://sayartii.com${image}` : null;
                
                if (!title || title.length < 5) return;
                
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
