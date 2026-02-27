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

function loadProdutos(): Record<string, ProdutoEntry> {
    if (produtosCache) return produtosCache;

    const filePath = path.join(process.cwd(), 'src', 'data', 'produtos.json');

    if (!fs.existsSync(filePath)) {
        console.warn('[api/produto] produtos.json não encontrado em', filePath);
        produtosCache = {};
        return produtosCache;
    }

    try {
        const raw = fs.readFileSync(filePath, 'utf8');
        produtosCache = JSON.parse(raw);
        console.log(`[api/produto] ${Object.keys(produtosCache!).length} entradas carregadas.`);
    } catch (err) {
        console.error('[api/produto] Erro ao ler produtos.json:', err);
        produtosCache = {};
    }

    return produtosCache!;
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
