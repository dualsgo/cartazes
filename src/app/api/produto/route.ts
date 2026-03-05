import { NextRequest, NextResponse } from 'next/server';
import * as fs from 'fs';
import * as path from 'path';

type ProdutoEntry = {
    description: string;
    reference: string;
    code?: string;  // COD_PRODUTO — quando buscado pelo EAN
    ean?: string;   // EAN — quando buscado pelo COD
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
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
    produtosCache = data; // atualiza cache em memória
}

export async function GET(request: NextRequest) {
    const q = request.nextUrl.searchParams.get('q')?.trim();

    if (!q || q.length < 3) {
        return NextResponse.json(
            { error: 'Parâmetro "q" obrigatório (mínimo 3 caracteres).' },
            { status: 400 }
        );
    }

    const produtos = loadProdutos();
    const produto = produtos[q];

    if (!produto) {
        return NextResponse.json({ error: 'Produto não encontrado.' }, { status: 404 });
    }

    return NextResponse.json(produto);
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json() as {
            key: string;
            description: string;
            reference?: string;
            ean?: string;
            code?: string;
        };

        const { key, description, reference, ean, code } = body;

        if (!key || !description) {
            return NextResponse.json(
                { error: 'Campos "key" e "description" são obrigatórios.' },
                { status: 400 }
            );
        }

        const produtos = loadProdutos();

        const entry: ProdutoEntry = {
            description: description.toUpperCase().trim(),
            reference: reference?.trim() ?? key,
            ...(ean ? { ean: ean.trim() } : {}),
            ...(code ? { code: code.trim() } : {}),
        };

        // Salva pela chave principal (SAP ou EAN fornecido)
        produtos[key.trim()] = entry;

        // Se EAN foi fornecido e difere da chave, indexa também pelo EAN
        if (ean && ean.trim() !== key.trim()) {
            produtos[ean.trim()] = { ...entry, code: code?.trim() ?? key.trim() };
        }
        // Se SAP código foi fornecido e difere da chave, indexa também pelo SAP
        if (code && code.trim() !== key.trim()) {
            produtos[code.trim()] = { ...entry, ean: ean?.trim() };
        }

        saveProdutos(produtos);

        console.log(`[api/produto] Produto cadastrado: ${key} → ${entry.description}`);
        return NextResponse.json({ success: true, key, entry }, { status: 201 });
    } catch (err) {
        console.error('[api/produto] Erro ao salvar produto:', err);
        return NextResponse.json({ error: 'Erro interno ao salvar produto.' }, { status: 500 });
    }
}
