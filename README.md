# Sayartii UAE Cars Scraper

Extract car listings from Sayartii.com, the Middle East's leading automotive classifieds platform.

## Features

- **Fast Cheerio scraping** - No browser overhead
- **Multiple filters** - Car type, brand, price range
- **Clean JSON output** - Title, price, mileage, image, URL
- **UAE focus** - Dubai, Abu Dhabi, Sharjah listings
- **Proxy support** - Built-in Apify proxy rotation

## Car Types

- `sedan` - Sedans
- `suv` - SUVs
- `coupe` - Coupes
- `hatch` - Hatchbacks
- `pickup` - Pickup trucks
- `wagon` - Wagons
- `minivan` - Minivans

## Input

```json
{
  "carType": "suv",
  "brand": "Toyota",
  "maxResults": 20
}
```

## Output

```json
{
  "title": "2024 Toyota Land Cruiser",
  "price": "285,000aed",
  "mileage": "15k km",
  "url": "https://sayartii.com/en/AE/l/...",
  "image": "https://sayartii.com/uploads/...",
  "carType": "suv",
  "brand": "Toyota",
  "scrapedAt": "2026-09-06T03:50:00.000Z"
}
```

## Use Cases

- UAE automotive market research
- Price monitoring and comparison
- Inventory tracking
- Market trend analysis

## Compatible with AI Agents

Use via **Apify MCP** integration with Claude, ChatGPT, and other AI assistants.

---

**Note:** Respects Sayartii.com's terms of service. Use responsibly.
