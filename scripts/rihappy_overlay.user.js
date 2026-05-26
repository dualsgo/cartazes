// ==UserScript==
// @name         RiHappy Cartazes Overlay
// @namespace    http://tampermonkey.net/
// @version      2.0
// @description  Intercepta a API do Backoffice Ri Happy e envia os dados para o Gerador de Cartazes local
// @author       Antigravity
// @match        https://backoffice.gruporihappy.com.br/*
// @grant        GM_xmlhttpRequest
// ==/UserScript==

(function () {
    'use strict';

    console.log("🚀 [Cartazes Overlay] Iniciado!");

    // --- 1. ESTILOS RESPONSIVOS ---
    const style = document.createElement('style');
    style.textContent = `
        #cartazes-overlay-container {
            position: fixed;
            z-index: 9999999;
            background: #fff;
            transition: transform 0.3s ease-in-out;
        }
        
        /* Desktop */
        @media (min-width: 768px) {
            #cartazes-overlay-container {
                top: 0;
                right: 0;
                width: 50vw;
                height: 100vh;
                transform: translateX(100%);
                box-shadow: -10px 0 30px rgba(0,0,0,0.5);
            }
            #cartazes-overlay-container.open {
                transform: translateX(0);
                box-shadow: -2px 0 10px rgba(0,0,0,0.1);
            }
            body.cartazes-open-desktop {
                width: 50vw !important;
                overflow-x: hidden !important;
            }
        }
        
        /* Mobile (Celular) */
        @media (max-width: 767px) {
            #cartazes-overlay-container {
                bottom: 0;
                left: 0;
                width: 100vw;
                height: 60vh; /* Ocupa 60% da tela, deixando a busca visível acima */
                transform: translateY(100%);
                box-shadow: 0 -10px 30px rgba(0,0,0,0.3);
                border-top-left-radius: 16px;
                border-top-right-radius: 16px;
                overflow: hidden;
            }
            #cartazes-overlay-container.open {
                transform: translateY(0);
            }
            body.cartazes-open-mobile {
                padding-bottom: 60vh !important;
            }
        }
    `;
    document.head.appendChild(style);

    // --- 2. INJETAR IFRAME DO GERADOR DE CARTAZES ---
    const overlayContainer = document.createElement('div');
    overlayContainer.id = 'cartazes-overlay-container';

    const iframe = document.createElement('iframe');
    iframe.src = 'https://rhcartazes.vercel.app/'; // URL de produção ou porta local
    iframe.style.width = '100%';
    iframe.style.height = '100%';
    iframe.style.border = 'none';
    overlayContainer.appendChild(iframe);
    document.body.appendChild(overlayContainer);

    // --- 3. BOTÃO PARA ABRIR/FECHAR O OVERLAY ---
    const toggleBtn = document.createElement('button');
    toggleBtn.innerHTML = '🖨️ Cartazes';
    toggleBtn.style.position = 'fixed';
    toggleBtn.style.bottom = '30px';
    toggleBtn.style.right = '30px';
    toggleBtn.style.padding = '15px 25px';
    toggleBtn.style.fontSize = '18px';
    toggleBtn.style.fontWeight = 'bold';
    toggleBtn.style.backgroundColor = '#e11d48'; // Rosa/Vermelho Ri Happy / Cartaz
    toggleBtn.style.color = '#fff';
    toggleBtn.style.border = 'none';
    toggleBtn.style.borderRadius = '50px';
    toggleBtn.style.cursor = 'pointer';
    toggleBtn.style.zIndex = '99999999';
    toggleBtn.style.boxShadow = '0 5px 15px rgba(225, 29, 72, 0.4)';

    let isOverlayOpen = false;
    window.toggleCartazesOverlay = function (forceOpen) {
        if (forceOpen !== undefined && isOverlayOpen === forceOpen) return;
        if (forceOpen !== undefined) isOverlayOpen = forceOpen;
        else isOverlayOpen = !isOverlayOpen;

        toggleBtn.style.backgroundColor = isOverlayOpen ? '#000' : '#e11d48';

        if (isOverlayOpen) {
            overlayContainer.classList.add('open');
            if (window.innerWidth >= 768) {
                document.body.classList.add('cartazes-open-desktop');
            } else {
                document.body.classList.add('cartazes-open-mobile');
            }
        } else {
            overlayContainer.classList.remove('open');
            document.body.classList.remove('cartazes-open-desktop');
            document.body.classList.remove('cartazes-open-mobile');
        }
    };
    toggleBtn.onclick = () => window.toggleCartazesOverlay();

    // Auto-abrir ao clicar em botões como "Novo cartaz"
    document.addEventListener('click', (e) => {
        const btn = e.target.closest('button');
        if (btn && btn.innerText && btn.innerText.toLowerCase().includes('novo cartaz')) {
            window.toggleCartazesOverlay(true);
        }
    });

    // --- 3. PROCESSAR DADOS DA API ---
    function formatMoney(value) {
        if (!value) return '';
        // 99999 -> 999.99
        return (value / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }

    function sendToCartazApp(apiResponse) {
        if (!apiResponse.skus || apiResponse.skus.length === 0) return;

        const item = apiResponse.skus[0];
        const priceTo = item.priceInEffect?.priceTo;
        const priceFrom = item.priceInEffect?.priceFrom;

        // Verifica se é promoção
        const isOffer = priceTo < priceFrom && priceTo > 0;

        const payload = {
            description: item.ERPTitle || item.product?.name || "PRODUTO SEM NOME",
            priceFrom: formatMoney(priceFrom),
            priceFor: formatMoney(priceTo),
            code: item.sku,
            ean: item.barCode,
            quantity: 1,
            posterSubType: isOffer ? 'offer' : 'normal',
            paymentOption: 'installment',
            defectType: 'embalagem_danificada',
            customDefectDiscount: 20
        };

        console.log("📤 Enviando produto para o Gerador de Cartazes:", payload);

        // Envia via postMessage para o Iframe
        iframe.contentWindow.postMessage({
            type: 'ADD_POSTER',
            payload: payload
        }, '*');

        // Se o overlay estiver fechado, dá um feedback visual no botão e abre automaticamente
        if (!isOverlayOpen) {
            const originalText = toggleBtn.innerHTML;
            toggleBtn.innerHTML = '✅ Adicionado!';
            toggleBtn.style.backgroundColor = '#10b981'; // Verde sucesso
            window.toggleCartazesOverlay(true);
            setTimeout(() => {
                toggleBtn.innerHTML = originalText;
                toggleBtn.style.backgroundColor = '#000';
            }, 2000);
        }
    }

    // --- 4. INTERCEPTAR API E ESCUTAR O IFRAME ---
    let authToken = null;
    let storeId = '1187';
    let apiHeaders = {}; // Guarda todos os headers que a página original usa

    window.addEventListener('message', (event) => {
        if (event.data?.type === 'SEARCH_SKU') {
            const sku = event.data.sku;
            console.log("✏️ [Overlay] Simulando digitação e clique no DOM da Ri Happy:", sku);

            const input = document.querySelector('input[type="search"].ant-select-selection-search-input') || document.querySelector('#rc_select_1');
            if (input) {
                // 1. Digita o valor
                input.focus();
                const nativeSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set;
                nativeSetter.call(input, sku);
                input.dispatchEvent(new Event('input', { bubbles: true }));

                // 2. Aguarda o dropdown abrir e clica na primeira opção
                let attempts = 0;
                const waitDropdown = setInterval(() => {
                    attempts++;
                    // Procura as opções da lista do Ant Design
                    const option = document.querySelector('.ant-select-dropdown:not(.ant-select-dropdown-hidden) .ant-select-item-option');

                    if (option) {
                        clearInterval(waitDropdown);
                        console.log("👆 Produto encontrado na lista! Simulando clique...");
                        // Ant Design costuma ouvir mousedown em vez de click
                        option.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
                        option.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));
                        option.click();
                    } else if (attempts > 30) { // Desiste após 6 segundos
                        clearInterval(waitDropdown);
                        console.log("⚠️ Dropdown não abriu. Produto pode não existir no sistema original.");
                    }
                }, 200);
            } else {
                alert("⚠️ Não encontrei o campo de pesquisa original. Certifique-se de que o modal de 'Pesquisar produtos' da Ri Happy está aberto no fundo!");
            }
        }
    });

    const originalFetch = window.fetch;
    window.fetch = async function (...args) {
        const url = typeof args[0] === 'string' ? args[0] : args[0]?.url;
        const options = args[1] || {};

        if (options.headers) {
            const h = new Headers(options.headers);
            for (let [key, value] of h.entries()) {
                apiHeaders[key] = value;
                if (key.toLowerCase() === 'authorization') authToken = value;
            }
        }

        return originalFetch.apply(this, args).then(async response => {
            const clone = response.clone();

            // Pega a loja
            if (url && url.includes('users/distributors')) {
                try {
                    const data = await clone.json();
                    if (data && data.length > 0 && data[0].id) {
                        storeId = data[0].id;
                        console.log("🏪 [Overlay] Loja capturada:", storeId);
                    }
                } catch (e) { }
            }

            // Pega especificamente a chamada da API de cartazes (price-tags) ou produtos
            if (url && url.includes('price-tags/distributor')) {
                try {
                    const data = await clone.json();
                    sendToCartazApp(data);
                } catch (e) { }
            }
            return response;
        });
    };

    const originalOpen = XMLHttpRequest.prototype.open;
    const originalSetRequestHeader = XMLHttpRequest.prototype.setRequestHeader;
    const originalSend = XMLHttpRequest.prototype.send;

    XMLHttpRequest.prototype.open = function (method, url, ...rest) {
        this._url = url;
        this._headers = {};
        return originalOpen.apply(this, [method, url, ...rest]);
    };

    XMLHttpRequest.prototype.setRequestHeader = function (header, value) {
        this._headers[header] = value;
        apiHeaders[header] = value;
        if (header.toLowerCase() === 'authorization') authToken = value;
        return originalSetRequestHeader.apply(this, [header, value]);
    };

    XMLHttpRequest.prototype.send = function (body) {
        this.addEventListener('load', function () {
            if (this._url && this._url.includes('users/distributors')) {
                try {
                    const data = JSON.parse(this.responseText);
                    if (data && data.length > 0 && data[0].id) {
                        storeId = data[0].id;
                    }
                } catch (e) { }
            }
            if (this._url && this._url.includes('price-tags/distributor')) {
                try {
                    const data = JSON.parse(this.responseText);
                    sendToCartazApp(data);
                } catch (e) { }
            }
        });
        return originalSend.apply(this, [body]);
    };

    // --- 5. ATALHO DE TECLADO (ENTER) NO CAMPO DE BUSCA ORIGINAL ---
    document.addEventListener('keydown', (e) => {
        // Verifica se a tecla foi Enter e se o alvo é o input de busca
        if (e.key === 'Enter') {
            const target = e.target;
            const isSearchInput = target && target.classList && target.classList.contains('ant-select-selection-search-input');
            const isRcSelect = target && target.id && target.id.includes('rc_select_');

            if (isSearchInput || isRcSelect) {
                console.log("⌨️ Enter pressionado no campo de busca. Tentando selecionar a primeira opção...");

                // Evita comportamento padrão se houver (como submit de formulário)
                e.preventDefault();

                const trySelectOption = (attempts = 0) => {
                    const option = document.querySelector('.ant-select-dropdown:not(.ant-select-dropdown-hidden) .ant-select-item-option');

                    if (option) {
                        console.log("👆 Opção encontrada via Enter! Clicando...");
                        option.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
                        option.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));
                        option.click();

                        // Opcional: limpa o campo após o Enter para o próximo escaneamento
                        // e.target.value = ''; 
                    } else if (attempts < 15) { // Tenta por 3 segundos (15 * 200ms) aguardando a API responder
                        setTimeout(() => trySelectOption(attempts + 1), 200);
                    } else {
                        console.log("⚠️ Nenhuma opção carregada a tempo após pressionar Enter.");
                    }
                };

                trySelectOption();
            }
        }
    });

})();
