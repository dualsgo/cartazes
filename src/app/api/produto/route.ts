import { NextRequest, NextResponse } from 'next/server';
import * as fs from 'fs';
import * as path from 'path';
import { invalidateSuggestCache } from '../suggest-cache';

type ProdutoEntry = {
    description: string;
    reference: string;
    code?: string;
    ean?: string;
};

let produtosCache: Record<string, ProdutoEntry> | null = null;

const DATA_FILE = path.join(process.cwd(), 'src', 'data', 'produtos.json');

function loadProdutos(): Record<string, ProdutoEntry> {
    if (produtosCache) return produtosCache;
    if (!fs.existsSync(DATA_FILE)) {
        console.warn('[api/produto] produtos.json não encontrado em', DATA_FILE);
        produtosCache = {};
        return produtosCache;
    }
    try {
        const raw = fs.readFileSync(DATA_FILE, 'utf8');
        produtosCache = JSON.parse(raw);
        console.log(`[api/produto] ${Object.keys(produtosCache!).length} entradas carregadas.`);
    } catch (err) {
        console.error('[api/produto] Erro ao ler produtos.json:', err);
        produtosCache = {};
    }
    return produtosCache!;
}

function saveProdutos(data: Record<string, ProdutoEntry>): void {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data), 'utf8');
    produtosCache = data;
    invalidateSuggestCache();
}

function removeAliases(produtos: Record<string, ProdutoEntry>, keys: string[]): void {
    for (const k of keys) delete produtos[k];
}

export async function GET(request: NextRequest) {
    const q     = request.nextUrl.searchParams.get('q')?.trim();
    const list  = request.nextUrl.searchParams.get('list');
    const page  = parseInt(request.nextUrl.searchParams.get('page') ?? '1', 10);
    const limit = 50;

    // ── Modo listagem paginada para o gerenciador ──
    if (list === '1') {
        const search   = request.nextUrl.searchParams.get('search')?.trim().toUpperCase() ?? '';
        const produtos = loadProdutos();

        const seen = new Set<string>();
        const entries: { key: string; description: string; reference: string; ean?: string; code?: string }[] = [];

        for (const [key, val] of Object.entries(produtos)) {
            // Usa apenas chaves SAP (≤ 10 dígitos) como canônicas; ignora aliases EAN de 13
            if (key.length > 10) continue;
            const canonical = key + '|' + val.description;
            if (seen.has(canonical)) continue;
            seen.add(canonical);

            if (search) {
                const haystack = `${key} ${val.description} ${val.reference ?? ''} ${val.ean ?? ''} ${val.code ?? ''}`.toUpperCase();
                if (!haystack.includes(search)) continue;
            }
            entries.push({ key, description: val.description, reference: val.reference, ean: val.ean, code: val.code });
        }

        entries.sort((a, b) => a.key.localeCompare(b.key, undefined, { numeric: true }));
        const total = entries.length;
        const paged = entries.slice((page - 1) * limit, page * limit);
        return NextResponse.json({ total, page, limit, items: paged });
    }

    // ── Modo lookup por código ──
    if (!q || q.length < 3) {
        return NextResponse.json({ error: 'Parâmetro "q" obrigatório (mínimo 3 caracteres).' }, { status: 400 });
    }
    if (q.length > 30 || !/^[a-zA-Z0-9\-_]+$/.test(q)) {
        return NextResponse.json({ error: 'Parâmetro "q" inválido.' }, { status: 400 });
    }
    const produtos = loadProdutos();
    const produto  = produtos[q];
    if (!produto) return NextResponse.json({ error: 'Produto não encontrado.' }, { status: 404 });
    return NextResponse.json(produto);
}

export async function POST(request: NextRequest) {
    try {
        const contentLength = request.headers.get('content-length');
        if (contentLength && parseInt(contentLength, 10) > 2048) {
            return NextResponse.json({ error: 'Payload muito grande.' }, { status: 413 });
        }

        const body = await request.json() as {
            key: string; description: string; reference?: string; ean?: string; code?: string;
        };
        const { key, description, reference, ean, code } = body;
        if (!key || !description) {
            return NextResponse.json({ error: 'Campos "key" e "description" são obrigatórios.' }, { status: 400 });
        }

        const keyClean  = String(key).trim();
        const descClean = String(description).trim().toUpperCase();
        const refClean  = reference ? String(reference).trim() : undefined;
        const eanClean  = ean  ? String(ean).trim()  : undefined;
        const codeClean = code ? String(code).trim() : undefined;

        if (keyClean.length > 30 || !/^[a-zA-Z0-9\-_]+$/.test(keyClean))
            return NextResponse.json({ error: 'Chave (key) inválida.' }, { status: 400 });
        if (descClean.length < 2 || descClean.length > 120)
            return NextResponse.json({ error: 'Descrição deve ter entre 2 e 120 caracteres.' }, { status: 400 });
        if (refClean  && refClean.length  > 40) return NextResponse.json({ error: 'Referência muito longa.' },  { status: 400 });
        if (eanClean  && (eanClean.length  > 14 || !/^\d+$/.test(eanClean)))  return NextResponse.json({ error: 'EAN inválido.' },  { status: 400 });
        if (codeClean && (codeClean.length > 10 || !/^\d+$/.test(codeClean))) return NextResponse.json({ error: 'Código SAP inválido.' }, { status: 400 });

        const produtos = loadProdutos();
        const entry: ProdutoEntry = {
            description: descClean,
            reference: refClean ?? '',
            ...(eanClean  ? { ean:  eanClean  } : {}),
            ...(codeClean ? { code: codeClean } : {}),
        };

        produtos[keyClean] = entry;
        if (eanClean  && eanClean  !== keyClean) produtos[eanClean]  = { ...entry, ...(codeClean ? { code: codeClean } : {}) };
        if (codeClean && codeClean !== keyClean) produtos[codeClean] = { ...entry, ...(eanClean  ? { ean:  eanClean  } : {}) };

        saveProdutos(produtos);
        console.log(`[api/produto] Produto cadastrado: ${keyClean} → ${entry.description}`);
        return NextResponse.json({ success: true, key: keyClean, entry }, { status: 201 });
    } catch (err) {
        console.error('[api/produto] Erro ao salvar produto:', err);
        return NextResponse.json({ error: 'Erro interno ao salvar produto.' }, { status: 500 });
    }
}

export async function PATCH(request: NextRequest) {
    try {
        const body = await request.json() as {
            key: string; description?: string; reference?: string; ean?: string; code?: string;
        };
        const { key, description, reference, ean, code } = body;
        if (!key) return NextResponse.json({ error: 'Campo "key" é obrigatório.' }, { status: 400 });

        const keyClean  = String(key).trim();
        const descClean = description ? String(description).trim().toUpperCase() : undefined;
        const refClean  = reference !== undefined ? String(reference).trim() : undefined;
        const eanClean  = ean  !== undefined ? (String(ean).trim()  || undefined) : undefined;
        const codeClean = code !== undefined ? (String(code).trim() || undefined) : undefined;

        if (descClean !== undefined && (descClean.length < 2 || descClean.length > 120))
            return NextResponse.json({ error: 'Descrição deve ter entre 2 e 120 caracteres.' }, { status: 400 });
        if (eanClean  && (eanClean.length  > 14 || !/^\d+$/.test(eanClean)))  return NextResponse.json({ error: 'EAN inválido.' },  { status: 400 });
        if (codeClean && (codeClean.length > 10 || !/^\d+$/.test(codeClean))) return NextResponse.json({ error: 'Código SAP inválido.' }, { status: 400 });

        const produtos = loadProdutos();
        const existing = produtos[keyClean];
        if (!existing) return NextResponse.json({ error: 'Produto não encontrado.' }, { status: 404 });

        // Remove aliases antigos
        if (existing.ean  && existing.ean  !== keyClean) delete produtos[existing.ean];
        if (existing.code && existing.code !== keyClean) delete produtos[existing.code];

        const updated: ProdutoEntry = {
            description: descClean  ?? existing.description,
            reference:   refClean   ?? existing.reference,
            ...(eanClean  !== undefined ? (eanClean  ? { ean:  eanClean  } : {}) : (existing.ean  ? { ean:  existing.ean  } : {})),
            ...(codeClean !== undefined ? (codeClean ? { code: codeClean } : {}) : (existing.code ? { code: existing.code } : {})),
        };

        produtos[keyClean] = updated;
        if (updated.ean  && updated.ean  !== keyClean) produtos[updated.ean]  = { ...updated };
        if (updated.code && updated.code !== keyClean) produtos[updated.code] = { ...updated };

        saveProdutos(produtos);
        console.log(`[api/produto] Produto editado: ${keyClean} → ${updated.description}`);
        return NextResponse.json({ success: true, key: keyClean, entry: updated });
    } catch (err) {
        console.error('[api/produto] Erro ao editar produto:', err);
        return NextResponse.json({ error: 'Erro interno ao editar produto.' }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const key = request.nextUrl.searchParams.get('key')?.trim();
        if (!key) return NextResponse.json({ error: 'Parâmetro "key" obrigatório.' }, { status: 400 });

        const produtos = loadProdutos();
        const existing = produtos[key];
        if (!existing) return NextResponse.json({ error: 'Produto não encontrado.' }, { status: 404 });

        const toRemove = new Set<string>([key]);
        if (existing.ean)  toRemove.add(existing.ean);
        if (existing.code) toRemove.add(existing.code);
        for (const [k, v] of Object.entries(produtos)) {
            if (v.ean === key || v.code === key) toRemove.add(k);
        }

        removeAliases(produtos, [...toRemove]);
        saveProdutos(produtos);
        console.log(`[api/produto] Produto removido: ${key}`);
        return NextResponse.json({ success: true, key });
    } catch (err) {
        console.error('[api/produto] Erro ao remover produto:', err);
        return NextResponse.json({ error: 'Erro interno ao remover produto.' }, { status: 500 });
    }
}
