import { NextRequest, NextResponse } from 'next/server';
import * as fs from 'fs';
import * as path from 'path';

type SuggestItem = { key: string; description: string };

let cacheAll: SuggestItem[] | null = null;

function loadAll(): SuggestItem[] {
    if (cacheAll) return cacheAll;

    const filePath = path.join(process.cwd(), 'src', 'data', 'produtos.json');
    if (!fs.existsSync(filePath)) {
        cacheAll = [];
        return cacheAll;
    }

    try {
        const raw = fs.readFileSync(filePath, 'utf8');
        const obj = JSON.parse(raw) as Record<string, { description?: string }>;
        cacheAll = Object.entries(obj)
            .filter(([k]) => /^\d+$/.test(k))   // apenas chaves numéricas (SAP e EAN)
            .map(([k, v]) => ({ key: k, description: v?.description ?? '' }));
    } catch {
        cacheAll = [];
    }

    return cacheAll;
}

export async function GET(request: NextRequest) {
    const prefix = request.nextUrl.searchParams.get('prefix')?.trim() ?? '';

    if (!prefix || prefix.length < 2) {
        return NextResponse.json([]);
    }

    const all = loadAll();
    const matches: SuggestItem[] = [];

    for (const item of all) {
        if (item.key.startsWith(prefix)) {
            matches.push(item);
            if (matches.length >= 10) break; // máximo 10 sugestões
        }
    }

    return NextResponse.json(matches);
}
