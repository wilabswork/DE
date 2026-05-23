import { ScrapedResult } from './types';

export async function scrapeShopee(query: string): Promise<ScrapedResult[]> {
  try {
    const encodedQuery = encodeURIComponent(query);
    const url = `https://shopee.sg/api/v4/search/search_items?by=relevancy&keyword=${encodedQuery}&limit=10&newest=0&order=desc&page_type=search&scenario=PAGE_GLOBAL_SEARCH&version=2`;

    const response = await fetch(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        Accept: 'application/json',
        Referer: 'https://shopee.sg/',
        'X-Shopee-Language': 'en',
      },
      next: { revalidate: 0 },
    });

    if (!response.ok) {
      console.error(`Shopee scraper: HTTP ${response.status}`);
      return [];
    }

    const data = await response.json();
    const items: unknown[] = data?.data?.items ?? [];

    const results: ScrapedResult[] = [];

    for (const rawItem of items) {
      try {
        const item = rawItem as Record<string, unknown>;
        const basic = item.item_basic as Record<string, unknown>;
        if (!basic) continue;

        const name = basic.name as string;
        const rawPrice = basic.price as number;
        const price = rawPrice / 100000;
        if (!name || !rawPrice) continue;

        const images = basic.images as string[] | undefined;
        const imageHash = images?.[0];
        const imageUrl = imageHash
          ? `https://cf.shopee.sg/file/${imageHash}`
          : undefined;

        const itemId = basic.itemid as number;
        const shopId = basic.shopid as number;
        const productUrl = `https://shopee.sg/product/${shopId}/${itemId}`;

        const ratingData = basic.item_rating as Record<string, unknown> | undefined;
        const rating = ratingData?.rating_star as number | undefined;
        const ratingCounts = ratingData?.rating_count as number[] | undefined;
        const reviewCount = ratingCounts?.[0];

        const seller = basic.shop_name as string | undefined;
        const stock = basic.stock as number | undefined;
        const inStock = stock !== undefined ? stock > 0 : true;

        results.push({
          platform: 'shopee',
          title: name,
          price: Math.round(price * 100) / 100,
          currency: 'SGD',
          imageUrl,
          productUrl,
          rating: rating ? Math.round(rating * 10) / 10 : undefined,
          reviewCount,
          seller,
          inStock,
        });
      } catch (itemErr) {
        console.error('Shopee: error parsing item', itemErr);
      }
    }

    return results;
  } catch (err) {
    console.error('Shopee scraper error:', err);
    return [];
  }
}
