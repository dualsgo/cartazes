'use server';

import { generateProductDescription } from '@/ai/flows/generate-product-description';

export async function generateDescriptionAction(
  keywords: string
): Promise<{ description: string } | { error: string }> {
  if (!keywords || keywords.trim().length === 0) {
    return { error: 'Por favor, forneça algumas palavras-chave.' };
  }
  try {
    const result = await generateProductDescription({ keywords });
    return { description: result.description };
  } catch (e) {
    console.error(e);
    return { error: 'Ocorreu um erro ao gerar a descrição.' };
  }
}
