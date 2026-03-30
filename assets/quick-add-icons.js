function positionQuickAddIcons() {
    const icons = document.querySelectorAll('.card__quick-add-icon');
    if (!icons.length) return;

    const oneRem = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;

    icons.forEach((icon) => {
        const card = icon.closest('.card');
        if (!card) return;

        const cardInner = card.querySelector('.card__inner');
        if (!cardInner) return;

        if (getComputedStyle(card).position !== 'relative') {
        card.style.position = 'relative';
        }

        const cardRect = card.getBoundingClientRect();
        const innerRect = cardInner.getBoundingClientRect();
        const bottomSpace = cardRect.bottom - innerRect.bottom;

        icon.style.bottom = bottomSpace + oneRem + 'px';
    });
}

function setupMutationObserver() {
    const observer = new MutationObserver((mutations) => {
        const shouldReposition = mutations.some((mutation) => {
            return Array.from(mutation.addedNodes).some((node) => {
                if (node.nodeType === 1) {
                    return (
                        node.classList?.contains('card__quick-add-icon') || node.querySelector?.('.card__quick-add-icon')
                    );
                }
                return false;
            });
        });

        if (shouldReposition) {
            positionQuickAddIcons();
        }
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true,
    });

    return observer;
}

document.addEventListener('DOMContentLoaded', () => {
    positionQuickAddIcons();
    setupMutationObserver();
});

let resizeTimer;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(positionQuickAddIcons, 150);
});