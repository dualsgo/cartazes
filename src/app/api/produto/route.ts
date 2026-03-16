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

    // Limite de tamanho e apenas caracteres alfanuméricos permitidos na busca
    if (q.length > 30 || !/^[a-zA-Z0-9\-_]+$/.test(q)) {
        return NextResponse.json(
            { error: 'Parâmetro "q" inválido.' },
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
        // Rejeita bodies muito grandes (proteção contra abuso)
        const contentLength = request.headers.get('content-length');
        if (contentLength && parseInt(contentLength, 10) > 2048) {
            return NextResponse.json({ error: 'Payload muito grande.' }, { status: 413 });
        }

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

        // Validações de tamanho e formato
        const keyClean = String(key).trim();
        const descClean = String(description).trim().toUpperCase();
        const refClean  = reference ? String(reference).trim() : undefined;
        const eanClean  = ean  ? String(ean).trim()  : undefined;
        const codeClean = code ? String(code).trim() : undefined;

        if (keyClean.length > 30 || !/^[a-zA-Z0-9\-_]+$/.test(keyClean)) {
            return NextResponse.json({ error: 'Chave (key) inválida.' }, { status: 400 });
        }
        if (descClean.length < 2 || descClean.length > 120) {
            return NextResponse.json({ error: 'Descrição deve ter entre 2 e 120 caracteres.' }, { status: 400 });
        }
        if (refClean  && refClean.length  > 40) return NextResponse.json({ error: 'Referência muito longa.' },  { status: 400 });
        if (eanClean  && (eanClean.length  > 14 || !/^\d+$/.test(eanClean)))  return NextResponse.json({ error: 'EAN inválido.' },  { status: 400 });
        if (codeClean && (codeClean.length > 10 || !/^\d+$/.test(codeClean))) return NextResponse.json({ error: 'Código SAP inválido.' }, { status: 400 });

        const produtos = loadProdutos();

        const entry: ProdutoEntry = {
            description: descClean,
            reference: refClean ?? keyClean,
            ...(eanClean  ? { ean:  eanClean  } : {}),
            ...(codeClean ? { code: codeClean } : {}),
        };

        // Salva pela chave principal (SAP ou EAN fornecido)
        produtos[keyClean] = entry;

        // Se EAN foi fornecido e difere da chave, indexa também pelo EAN
        if (eanClean && eanClean !== keyClean) {
            produtos[eanClean] = { ...entry, code: codeClean ?? keyClean };
        }
        // Se SAP código foi fornecido e difere da chave, indexa também pelo SAP
        if (codeClean && codeClean !== keyClean) {
            produtos[codeClean] = { ...entry, ean: eanClean };
        }

        saveProdutos(produtos);

        console.log(`[api/produto] Produto cadastrado: ${keyClean} → ${entry.description}`);
        return NextResponse.json({ success: true, key: keyClean, entry }, { status: 201 });
    } catch (err) {
        console.error('[api/produto] Erro ao salvar produto:', err);
        return NextResponse.json({ error: 'Erro interno ao salvar produto.' }, { status: 500 });
    }
}
