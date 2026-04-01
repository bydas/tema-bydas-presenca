(function () {
    const ENDPOINT_PATTERNS = [
    'swymstore-v3free-01.swymrelay.com/api/v3/lists/fetch-lists',
    'swymstore-v3free-01.swymrelay.com/api/v2/provider/fetchWishlist',
    ];
    const HEART_ICON_SELECTOR = '.header__icon-heart';
    const BUBBLE_SELECTOR = '.cart-count-bubble span';

    function updateWishlistCount(count) {
        const heartIcon = document.querySelector(HEART_ICON_SELECTOR);
        if (!heartIcon) return;

        const bubble = heartIcon.querySelector('.cart-count-bubble');
        const countSpan = bubble?.querySelector('span');
        if (!bubble || !countSpan) return;

        const isCountPositive = !Number.isNaN(count) && count > 0;

        countSpan.innerText = count;
        bubble.style.display = isCountPositive ? '' : 'none';
        bubble.classList.toggle('empty', !isCountPositive);
    }

    function extractCountFromResponse(data, url) {
        if (url.includes('fetch-lists')) {
            const cnt = data?.[0].cnt ?? data.cnt;
            if (cnt) return cnt;
        } else if (url.includes('fetchWishlist') && Array.isArray(data)) {
            return data.length;
        }

        return null;
    }

    const originalFetch = window.fetch;

    window.fetch = function (...args) {
        let url = '';

        if (typeof args[0] === 'string') {
            url = args[0];
        } else if (args[0] instanceof Request) url = args[0].url;

        const isSwymEndpoint = ENDPOINT_PATTERNS.some((pattern) => url.includes(pattern));

        if (url && isSwymEndpoint) {
            return originalFetch.apply(this, args).then((response) => {
            response
                .clone()
                .json()
                .then((data) => {
                const count = extractCountFromResponse(data, url);
                updateWishlistCount(count);
                })
                .catch(console.error);

            return response;
            });
        }

        return originalFetch.apply(this, args);
    };

    const XHR = XMLHttpRequest;
    const originalOpen = XHR.prototype.open;
    const originalSend = XHR.prototype.send;

    XHR.prototype.open = function (method, url, async, user, pass) {
        this._url = url;
        this._method = method;
        return originalOpen.apply(this, arguments);
    };

    XHR.prototype.send = function (body) {
        const isSwymEndpoint = ENDPOINT_PATTERNS.some((pattern) => this._url && this._url.includes(pattern));

        if (this._url && isSwymEndpoint) {
            this.addEventListener('load', () => {
            try {
                const data = JSON.parse(this.responseText);
                const count = extractCountFromResponse(data, this._url);

                updateWishlistCount(count);
            } catch (e) {}
            });
        }

        return originalSend.apply(this, arguments);
    };

    const observer = new MutationObserver(() => {
        const heartIcon = document.querySelector(HEART_ICON_SELECTOR);
        if (heartIcon) {
            observer.disconnect();
        }
    });

    observer.observe(document.body, { childList: true, subtree: true });
})();