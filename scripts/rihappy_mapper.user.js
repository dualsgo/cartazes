// ==UserScript==
// @name         RiHappy Backoffice API Mapper
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Intercepta requisições no backoffice da Ri Happy para extrair dados da API e construir os cartazes.
// @author       Antigravity
// @match        https://backoffice.gruporihappy.com.br/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    console.log("🚀 [RiHappy API Mapper] Iniciado! Observando tráfego de rede...");

    // Cria um painel visual para mostrar as requisições mapeadas
    const panel = document.createElement('div');
    panel.style.position = 'fixed';
    panel.style.bottom = '20px';
    panel.style.right = '20px';
    panel.style.width = '400px';
    panel.style.maxHeight = '400px';
    panel.style.overflowY = 'auto';
    panel.style.background = 'rgba(0, 0, 0, 0.9)';
    panel.style.color = '#00ff88';
    panel.style.border = '2px solid #00ff88';
    panel.style.padding = '15px';
    panel.style.borderRadius = '10px';
    panel.style.fontFamily = 'monospace';
    panel.style.zIndex = '999999';
    panel.innerHTML = '<h3>📡 Interceptador de API</h3><p>Digite no campo de pesquisa de produtos para capturarmos os endpoints...</p><ul id="api-log" style="list-style:none; padding:0; margin:0;"></ul>';
    document.body.appendChild(panel);

    function logApi(info) {
        console.log("✅ [API Mapeada]", info);
        const logEl = document.getElementById('api-log');
        const li = document.createElement('li');
        li.style.borderBottom = '1px solid #333';
        li.style.marginBottom = '10px';
        li.style.paddingBottom = '10px';
        
        li.innerHTML = `
            <strong>URL:</strong> ${info.url.substring(0, 100)}...<br/>
            <strong>Method:</strong> ${info.method}<br/>
            <strong>Token (Auth):</strong> ${info.auth ? 'Capturado 🔑' : 'Nenhum'}<br/>
            <button class="copy-btn" style="background:#00ff88; color:#000; border:none; padding:5px; margin-top:5px; cursor:pointer;">Copiar Log JSON</button>
        `;
        
        li.querySelector('.copy-btn').onclick = () => {
            navigator.clipboard.writeText(JSON.stringify(info, null, 2));
            alert("Log copiado para a área de transferência! Envie para a IA.");
        };

        logEl.prepend(li);
    }

    // Interceptar Fetch
    const originalFetch = window.fetch;
    window.fetch = async function(...args) {
        const url = typeof args[0] === 'string' ? args[0] : args[0]?.url;
        const options = args[1] || {};
        const method = options.method || 'GET';
        
        let auth = null;
        if (options.headers) {
            const h = new Headers(options.headers);
            auth = h.get('Authorization') || h.get('authorization');
        }

        return originalFetch.apply(this, args).then(async response => {
            const clone = response.clone();
            
            if (url && !url.match(/\.(js|css|png|jpg|jpeg|gif|svg|woff|woff2|ttf|eot|ico)$/i)) {
                try {
                    const data = await clone.json();
                    logApi({
                        type: 'fetch',
                        method,
                        url,
                        auth,
                        bodySent: options.body,
                        responseSample: data
                    });
                } catch(e) {}
            }
            return response;
        });
    };

    // Interceptar XHR
    const originalOpen = XMLHttpRequest.prototype.open;
    const originalSetRequestHeader = XMLHttpRequest.prototype.setRequestHeader;
    const originalSend = XMLHttpRequest.prototype.send;

    XMLHttpRequest.prototype.open = function(method, url, ...rest) {
        this._url = url;
        this._method = method;
        this._headers = {};
        return originalOpen.apply(this, [method, url, ...rest]);
    };

    XMLHttpRequest.prototype.setRequestHeader = function(header, value) {
        this._headers[header] = value;
        return originalSetRequestHeader.apply(this, [header, value]);
    };

    XMLHttpRequest.prototype.send = function(body) {
        this.addEventListener('load', function() {
            if (this._url && !this._url.match(/\.(js|css|png|jpg|jpeg|gif|svg|woff|woff2|ttf|eot|ico)$/i)) {
                try {
                    const data = JSON.parse(this.responseText);
                    let auth = this._headers['Authorization'] || this._headers['authorization'];
                    
                    logApi({
                        type: 'xhr',
                        method: this._method,
                        url: this._url,
                        auth: auth,
                        bodySent: body,
                        responseSample: data
                    });
                } catch(e) {}
            }
        });
        return originalSend.apply(this, [body]);
    };
})();
