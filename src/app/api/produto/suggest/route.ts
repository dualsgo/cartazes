import { NextRequest, NextResponse } from 'next/server';
import * as fs from 'fs';
import * as path from 'path';

// Reutiliza o mesmo cache do route principal
let keysCache: string[] | null = null;

function loadKeys(): string[] {
    if (keysCache) return keysCache;

    const filePath = path.join(process.cwd(), 'src', 'data', 'produtos.json');
    if (!fs.existsSync(filePath)) {
        keysCache = [];
        return keysCache;
    }

    try {
        const raw = fs.readFileSync(filePath, 'utf8');
        const obj = JSON.parse(raw) as Record<string, unknown>;
        // Mantém apenas chaves numéricas curtas (COD_PRODUTO) para sugestão
        // EANs (>= 8 dígitos) ficam de fora para não poluir a lista
        keysCache = Object.keys(obj).filter(k => /^\d+$/.test(k) && k.length < 8);
    } catch {
        keysCache = [];
    }

    return keysCache;
}

export async function GET(request: NextRequest) {
    const prefix = request.nextUrl.searchParams.get('prefix')?.trim() ?? '';

    if (!prefix || prefix.length < 2) {
        return NextResponse.json([]);
    }

    const keys = loadKeys();
    const matches: string[] = [];

    for (const key of keys) {
        if (key.startsWith(prefix)) {
            matches.push(key);
            if (matches.length >= 10) break; // Máximo 10 sugestões
        }
    }

    return NextResponse.json(matches);
}
