import Anthropic from '@anthropic-ai/sdk';

export interface ScopeMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface ScopeResponse {
  message: string;
  question: string | null;
  options: string[] | null;
  searchQuery: string | null;
  isReady: boolean;
}

export async function scopeProduct(
  messages: ScopeMessage[],
  apiKey: string
): Promise<ScopeResponse> {
  const client = new Anthropic({ apiKey });

  const systemPrompt = `You are PriceScout's helpful shopping assistant for Singapore. Help users find the exact product they want to compare prices for across Shopee SG, Lazada SG, and Amazon SG.

When a user describes what they want:
1. If it's a broad category (e.g., "handphone", "laptop", "TV"), ask which brand they prefer and suggest the top 5-8 brands available in Singapore market
2. Once they pick a brand, ask which model or series they prefer and suggest popular models currently available in Singapore
3. Once specific enough, confirm the exact product and provide a search query

Always respond with ONLY valid JSON in this format:
{
  "message": "Your friendly conversational response",
  "question": "The specific question to ask next (null if ready to search)",
  "options": ["option1", "option2"] (array of choices for the user, or null),
  "searchQuery": "exact search query for the product (null until confirmed)",
  "isReady": false
}

When isReady is true, set searchQuery to the optimal search string for Singapore e-commerce sites, and set question to null.
Keep responses concise and friendly. Focus on Singapore market products.
Never include markdown formatting in the message field - plain text only.`;

  const response = await client.messages.create({
    model: 'claude-opus-4-7',
    max_tokens: 1024,
    system: systemPrompt,
    messages: messages.map((m) => ({ role: m.role, content: m.content })),
  });

  const text =
    response.content[0].type === 'text' ? response.content[0].text : '';

  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]) as ScopeResponse;
      return parsed;
    }
  } catch (e) {
    console.error('Claude: failed to parse JSON response', e);
  }

  return {
    message: text,
    question: null,
    options: null,
    searchQuery: null,
    isReady: false,
  };
}
