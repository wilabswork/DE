import { NextRequest, NextResponse } from 'next/server';
import { scopeProduct, ScopeMessage, ScopeResponse } from '@/lib/claude';

// Built-in category logic (no API key needed)
const categories: Record<
  string,
  { brands: string[]; models?: Record<string, string[]>; followUp: string }
> = {
  handphone: {
    brands: ['Apple', 'Samsung', 'Google', 'OnePlus', 'Xiaomi', 'OPPO', 'Vivo', 'Realme'],
    models: {
      Apple: ['iPhone 16 Pro Max', 'iPhone 16 Pro', 'iPhone 16', 'iPhone 15 Pro Max', 'iPhone 15', 'iPhone 14'],
      Samsung: ['Galaxy S25 Ultra', 'Galaxy S25+', 'Galaxy S25', 'Galaxy A55', 'Galaxy A35', 'Galaxy Z Fold6'],
      Google: ['Pixel 9 Pro XL', 'Pixel 9 Pro', 'Pixel 9', 'Pixel 8a'],
      OnePlus: ['OnePlus 13', 'OnePlus 12', 'OnePlus Nord 4'],
      Xiaomi: ['Xiaomi 15 Pro', 'Xiaomi 14T Pro', 'Redmi Note 14 Pro+', 'POCO X6 Pro'],
      OPPO: ['Find X8 Pro', 'Find X7', 'Reno 12 Pro', 'A3 Pro'],
      Vivo: ['X200 Pro', 'X100 Pro', 'V30 Pro'],
      Realme: ['GT 7 Pro', 'GT 6', 'C75'],
    },
    followUp: 'Which brand are you interested in?',
  },
  laptop: {
    brands: ['Apple', 'Dell', 'HP', 'Lenovo', 'ASUS', 'Acer', 'Microsoft', 'LG'],
    models: {
      Apple: ['MacBook Air M4', 'MacBook Air M3', 'MacBook Pro 14 M4', 'MacBook Pro 16 M4'],
      Dell: ['XPS 15', 'XPS 13', 'Inspiron 15', 'Latitude 5550'],
      HP: ['Spectre x360 14', 'Envy 16', 'Pavilion 15', 'Omen 16'],
      Lenovo: ['ThinkPad X1 Carbon', 'IdeaPad Slim 5', 'Yoga 9i', 'Legion 5i Pro'],
      ASUS: ['ZenBook 14 OLED', 'ROG Zephyrus G16', 'VivoBook 15', 'ExpertBook B9'],
      Acer: ['Swift Go 16', 'Predator Helios 18', 'Aspire 5', 'Nitro 5'],
      Microsoft: ['Surface Pro 11', 'Surface Laptop 7', 'Surface Laptop Studio 2'],
      LG: ['Gram 16', 'Gram 14', 'Gram Pro 16'],
    },
    followUp: 'Which brand do you prefer?',
  },
  tv: {
    brands: ['Samsung', 'LG', 'Sony', 'TCL', 'Hisense', 'Philips', 'Panasonic'],
    models: {
      Samsung: ['Neo QLED 8K QN900D', 'QLED 4K Q80D', 'Crystal UHD 4K CU8000', 'The Frame'],
      LG: ['OLED evo G4', 'OLED C4', 'QNED90', 'NanoCell 75'],
      Sony: ['BRAVIA 9 Mini LED', 'BRAVIA 7 Mini LED', 'X95L', 'X85L'],
      TCL: ['C845 Mini LED', 'C745 QLED', 'P755 4K'],
      Hisense: ['U8N Mini LED', 'U7N QLED', 'A6N 4K'],
      Philips: ['OLED808', 'MiniLED 8908', '7608 4K'],
      Panasonic: ['Z95A OLED', 'MZ2000 OLED', 'LX940 4K'],
    },
    followUp: 'Which brand do you prefer?',
  },
  headphones: {
    brands: ['Sony', 'Apple', 'Bose', 'Samsung', 'JBL', 'Sennheiser', 'Audio-Technica'],
    models: {
      Sony: ['WH-1000XM5', 'WF-1000XM5', 'WH-1000XM4', 'LinkBuds S'],
      Apple: ['AirPods Pro 2nd Gen', 'AirPods 4', 'AirPods Max', 'AirPods 3rd Gen'],
      Bose: ['QuietComfort Ultra', 'QuietComfort 45', 'QuietComfort Earbuds II'],
      Samsung: ['Galaxy Buds3 Pro', 'Galaxy Buds3', 'Galaxy Buds2 Pro'],
      JBL: ['Tour One M2', 'Club 950NC', 'Live Pro 2'],
      Sennheiser: ['Momentum 4 Wireless', 'Momentum True Wireless 3', 'HD 660S2'],
      'Audio-Technica': ['ATH-M50xBT2', 'ATH-ANC900BT', 'ATH-WS990BT'],
    },
    followUp: 'Which brand do you prefer?',
  },
  tablet: {
    brands: ['Apple', 'Samsung', 'Lenovo', 'Huawei', 'Microsoft'],
    models: {
      Apple: ['iPad Pro M4 13"', 'iPad Pro M4 11"', 'iPad Air M2', 'iPad 10th Gen', 'iPad mini 7'],
      Samsung: ['Galaxy Tab S10 Ultra', 'Galaxy Tab S10+', 'Galaxy Tab S10', 'Galaxy Tab A9+'],
      Lenovo: ['Tab P12 Pro', 'Tab Extreme', 'Yoga Tab 13'],
      Huawei: ['MatePad Pro 13.2', 'MatePad 11.5', 'MatePad Air'],
      Microsoft: ['Surface Pro 11', 'Surface Go 4'],
    },
    followUp: 'Which brand do you prefer?',
  },
};

// Normalize user input to category key
function detectCategory(text: string): string | null {
  const lower = text.toLowerCase().trim();
  const keywordMap: Record<string, string> = {
    handphone: 'handphone',
    phone: 'handphone',
    smartphone: 'handphone',
    mobile: 'handphone',
    iphone: 'handphone',
    android: 'handphone',
    laptop: 'laptop',
    notebook: 'laptop',
    macbook: 'laptop',
    chromebook: 'laptop',
    computer: 'laptop',
    tv: 'tv',
    television: 'tv',
    monitor: 'tv',
    screen: 'tv',
    headphone: 'headphones',
    headphones: 'headphones',
    earphone: 'headphones',
    earbuds: 'headphones',
    airpods: 'headphones',
    earpiece: 'headphones',
    tablet: 'tablet',
    ipad: 'tablet',
    'galaxy tab': 'tablet',
  };

  for (const [keyword, category] of Object.entries(keywordMap)) {
    if (lower.includes(keyword)) {
      return category;
    }
  }
  return null;
}

function detectBrand(text: string, category: string): string | null {
  const cat = categories[category];
  if (!cat) return null;
  const lower = text.toLowerCase();
  for (const brand of cat.brands) {
    if (lower.includes(brand.toLowerCase())) {
      return brand;
    }
  }
  return null;
}

function buildFallbackResponse(messages: ScopeMessage[]): ScopeResponse {
  const userMessages = messages.filter((m) => m.role === 'user');

  if (userMessages.length === 0) {
    return {
      message: "Hi! I'm PriceScout's AI shopping assistant. What product would you like to compare prices for?",
      question: 'What product are you looking for?',
      options: ['Handphone', 'Laptop', 'TV', 'Headphones', 'Tablet'],
      searchQuery: null,
      isReady: false,
    };
  }

  const firstUserMsg = userMessages[0].content.toLowerCase();
  const latestUserMsg = userMessages[userMessages.length - 1].content;

  // Detect category from first message
  const category = detectCategory(firstUserMsg);

  if (!category) {
    // Unknown category – treat the input as a direct search query
    return {
      message: `Great! I'll help you find prices for "${latestUserMsg}" across Shopee, Lazada, and Amazon SG.`,
      question: null,
      options: null,
      searchQuery: latestUserMsg.trim(),
      isReady: true,
    };
  }

  const cat = categories[category];

  // Check if brand is identified in any user message
  let detectedBrand: string | null = null;
  for (const msg of userMessages) {
    const brand = detectBrand(msg.content, category);
    if (brand) {
      detectedBrand = brand;
      break;
    }
  }

  // Stage 1: Category detected, ask for brand
  if (!detectedBrand && userMessages.length <= 1) {
    return {
      message: `Great choice! ${category === 'handphone' ? 'Handphones' : category.charAt(0).toUpperCase() + category.slice(1)} are popular in Singapore. Which brand are you interested in?`,
      question: cat.followUp,
      options: cat.brands,
      searchQuery: null,
      isReady: false,
    };
  }

  // If second message but brand not in our list, use the text as brand
  if (!detectedBrand && userMessages.length >= 2) {
    detectedBrand = userMessages[1].content.trim();
  }

  // Stage 2: Brand detected, ask for model
  const brandModels = cat.models?.[detectedBrand || ''];
  if (brandModels && userMessages.length <= 2) {
    return {
      message: `${detectedBrand} makes some excellent products! Which model are you looking for?`,
      question: `Which ${detectedBrand} model do you want?`,
      options: brandModels,
      searchQuery: null,
      isReady: false,
    };
  }

  // Stage 3: Model or specific product detected - ready to search
  const modelOrProduct = userMessages.length >= 3
    ? userMessages[2].content
    : latestUserMsg;

  const searchQuery = `${detectedBrand || ''} ${modelOrProduct}`.trim();

  return {
    message: `Perfect! I'll search for the ${searchQuery} across Shopee, Lazada, and Amazon SG. Click "Add to list" to track this product.`,
    question: null,
    options: null,
    searchQuery,
    isReady: true,
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { messages } = body as { messages: ScopeMessage[] };

    if (!Array.isArray(messages)) {
      return NextResponse.json({ error: 'messages array is required' }, { status: 400 });
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;

    if (apiKey && apiKey.trim() && apiKey !== 'your-anthropic-api-key-here') {
      // Use Claude AI
      try {
        const response = await scopeProduct(messages, apiKey);
        return NextResponse.json(response);
      } catch (claudeErr) {
        console.error('Claude error, falling back to built-in logic:', claudeErr);
        // Fall through to built-in logic
      }
    }

    // Use built-in fallback logic
    const response = buildFallbackResponse(messages);
    return NextResponse.json(response);
  } catch (error) {
    console.error('POST /api/scope error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
