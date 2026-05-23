import { ScrapedResult } from './types';

interface LazadaItem {
  name?: string;
  price?: string | number;
  image?: string;
  itemUrl?: string;
  productUrl?: string;
  reviewCount?: number | string;
  ratingScore?: number | string;
  sellerName?: string;
  brandName?: string;
  originalPrice?: string | number;
}

function parsePrice(raw: string | number | undefined): number {
  if (raw === undefined || raw === null) return 0;
  if (typeof raw === 'number') return raw;
  // Remove currency symbols, commas, spaces
  const cleaned = String(raw).replace(/[^0-9.]/g, '');
  return parseFloat(cleaned) || 0;
}

export async function scrapeLazada(query: string): Promise<ScrapedResult[]> {
  try {
    const encodedQuery = encodeURIComponent(query);
    const url = `https://www.lazada.sg/catalog/?q=${encodedQuery}&_keyori=ss&from=input`;

    const response = await fetch(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        Accept:
          'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-SG,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
      },
      next: { revalidate: 0 },
    });

    if (!response.ok) {
      console.error(`Lazada scraper: HTTP ${response.status}`);
      return [];
    }

    const html = await response.text();

    // Find __NEXT_DATA__ script tag
    const nextDataMatch = html.match(
      /<script[^>]+id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/
    );

    if (!nextDataMatch) {
      // Fallback: try window.__pageData or window.pageData
      const pageDataMatch = html.match(/window\.__pageData\s*=\s*({[\s\S]*?});\s*<\/script>/);
      if (!pageDataMatch) {
        console.error('Lazada: could not find page data');
        return [];
      }
      try {
        const pageData = JSON.parse(pageDataMatch[1]);
        return extractFromPageData(pageData);
      } catch {
        return [];
      }
    }

    const nextData = JSON.parse(nextDataMatch[1]);

    // Try multiple possible paths for the item list
    const possiblePaths = [
      nextData?.props?.pageProps?.initialData?.listItems,
      nextData?.props?.pageProps?.data?.listItems,
      nextData?.props?.pageProps?.initialData?.result?.listItems,
      nextData?.props?.pageProps?.listItems,
    ];

    let items: LazadaItem[] = [];
    for (const path of possiblePaths) {
      if (Array.isArray(path) && path.length > 0) {
        items = path as LazadaItem[];
        break;
      }
    }

    if (items.length === 0) {
      // Deep search for listItems
      const jsonStr = JSON.stringify(nextData);
      const match = jsonStr.match(/"listItems":\s*(\[[\s\S]*?\])/);
      if (match) {
        try {
          items = JSON.parse(match[1]) as LazadaItem[];
        } catch {
          console.error('Lazada: failed to parse listItems via regex');
        }
      }
    }

    return buildResults(items);
  } catch (err) {
    console.error('Lazada scraper error:', err);
    return [];
  }
}

function extractFromPageData(data: unknown): ScrapedResult[] {
  try {
    const d = data as Record<string, unknown>;
    const items =
      (d?.mods?.listItems as LazadaItem[]) ||
      (d?.listItems as LazadaItem[]) ||
      [];
    return buildResults(items);
  } catch {
    return [];
  }
}

function buildResults(items: LazadaItem[]): ScrapedResult[] {
  const results: ScrapedResult[] = [];

  for (const item of items.slice(0, 10)) {
    try {
      const name = item.name;
      const price = parsePrice(item.price);

      if (!name || !price) continue;

      const itemUrl = item.itemUrl || item.productUrl || '';
      const productUrl = itemUrl.startsWith('http')
        ? itemUrl
        : `https://www.lazada.sg${itemUrl}`;

      const reviewCount =
        typeof item.reviewCount === 'string'
          ? parseInt(item.reviewCount, 10)
          : item.reviewCount ?? undefined;

      const rating =
        typeof item.ratingScore === 'string'
          ? parseFloat(item.ratingScore)
          : item.ratingScore ?? undefined;

      results.push({
        platform: 'lazada',
        title: name,
        price,
        currency: 'SGD',
        imageUrl: item.image,
        productUrl,
        rating: rating ? Math.round(rating * 10) / 10 : undefined,
        reviewCount: isNaN(reviewCount as number) ? undefined : reviewCount,
        seller: item.sellerName || item.brandName,
        inStock: true,
      });
    } catch (itemErr) {
      console.error('Lazada: error parsing item', itemErr);
    }
  }

  return results;
}
