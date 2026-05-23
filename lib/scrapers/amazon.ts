import * as cheerio from 'cheerio';
import { ScrapedResult } from './types';

export async function scrapeAmazon(query: string): Promise<ScrapedResult[]> {
  try {
    const encodedQuery = encodeURIComponent(query);
    const url = `https://www.amazon.sg/s?k=${encodedQuery}`;

    const response = await fetch(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        Accept:
          'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
        'Accept-Language': 'en-SG,en-GB;q=0.9,en;q=0.8',
        'Accept-Encoding': 'gzip, deflate, br',
        'Cache-Control': 'max-age=0',
        'Sec-Ch-Ua': '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
        'Sec-Ch-Ua-Mobile': '?0',
        'Sec-Ch-Ua-Platform': '"Windows"',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'none',
        'Upgrade-Insecure-Requests': '1',
      },
      next: { revalidate: 0 },
    });

    if (!response.ok) {
      console.error(`Amazon scraper: HTTP ${response.status}`);
      return [];
    }

    const html = await response.text();
    const $ = cheerio.load(html);
    const results: ScrapedResult[] = [];

    $('.s-result-item[data-asin]').each((_, element) => {
      try {
        const el = $(element);
        const asin = el.attr('data-asin');
        if (!asin || asin === '') return;

        // Title
        const title =
          el.find('h2 a span').first().text().trim() ||
          el.find('[data-cy="title-recipe"] span').first().text().trim();
        if (!title) return;

        // Price
        const wholeText = el.find('.a-price-whole').first().text().trim().replace(/,/g, '');
        const fractionText = el.find('.a-price-fraction').first().text().trim();
        const priceStr = wholeText
          ? `${wholeText}${fractionText ? '.' + fractionText : ''}`
          : '';
        const price = parseFloat(priceStr);
        if (!price || isNaN(price)) return;

        // Image
        const imageUrl =
          el.find('.s-image').first().attr('src') ||
          el.find('img[data-image-latency]').first().attr('src');

        // Product URL
        const hrefRaw = el.find('h2 a').first().attr('href') || '';
        const productUrl = hrefRaw.startsWith('http')
          ? hrefRaw
          : `https://www.amazon.sg${hrefRaw}`;

        // Rating
        let rating: number | undefined;
        const ratingLabel =
          el.find('.a-icon-star-small').first().attr('aria-label') ||
          el.find('.a-icon-star').first().attr('aria-label') ||
          el.find('[aria-label*="out of 5"]').first().attr('aria-label') || '';
        if (ratingLabel) {
          const ratingMatch = ratingLabel.match(/(\d+(\.\d+)?)/);
          if (ratingMatch) {
            rating = parseFloat(ratingMatch[1]);
          }
        }

        // Review count
        let reviewCount: number | undefined;
        const reviewText =
          el.find('.a-size-base.s-underline-text').first().text().trim() ||
          el.find('[aria-label*="ratings"]').first().attr('aria-label') || '';
        if (reviewText) {
          const reviewMatch = reviewText.replace(/,/g, '').match(/(\d+)/);
          if (reviewMatch) {
            reviewCount = parseInt(reviewMatch[1], 10);
          }
        }

        // Seller (sold by / brand)
        const seller =
          el.find('.a-size-base.a-color-secondary').first().text().trim() || undefined;

        // In stock check
        const outOfStock =
          el.find('.a-color-price').text().includes('Currently unavailable') ||
          el.text().includes('Currently unavailable');

        results.push({
          platform: 'amazon',
          title,
          price,
          currency: 'SGD',
          imageUrl,
          productUrl,
          rating,
          reviewCount,
          seller: seller || undefined,
          inStock: !outOfStock,
        });
      } catch (itemErr) {
        console.error('Amazon: error parsing item', itemErr);
      }
    });

    return results.slice(0, 10);
  } catch (err) {
    console.error('Amazon scraper error:', err);
    return [];
  }
}
