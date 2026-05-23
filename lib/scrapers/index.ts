import { scrapeShopee } from './shopee';
import { scrapeLazada } from './lazada';
import { scrapeAmazon } from './amazon';
import { ScrapedResult } from './types';

export { scrapeShopee, scrapeLazada, scrapeAmazon };
export type { ScrapedResult };

export async function scrapeAll(query: string): Promise<ScrapedResult[]> {
  const [shopeeResults, lazadaResults, amazonResults] = await Promise.allSettled([
    scrapeShopee(query),
    scrapeLazada(query),
    scrapeAmazon(query),
  ]);

  return [
    ...(shopeeResults.status === 'fulfilled' ? shopeeResults.value : []),
    ...(lazadaResults.status === 'fulfilled' ? lazadaResults.value : []),
    ...(amazonResults.status === 'fulfilled' ? amazonResults.value : []),
  ];
}
