export interface ScrapedResult {
  platform: 'shopee' | 'lazada' | 'amazon';
  title: string;
  price: number;
  currency: string;
  imageUrl?: string;
  productUrl: string;
  specs?: Record<string, string>;
  rating?: number;
  reviewCount?: number;
  seller?: string;
  inStock: boolean;
}
