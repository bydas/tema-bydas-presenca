(function() {
  'use strict';

  const DESKTOP_BREAKPOINTS = [
    { max: 1000, cols: 5 },
    { max: 900,  cols: 4 },
    { max: 650,  cols: 3 }
  ];

  const MOBILE_BREAKPOINT = 300;

  function getOriginalDesktopCols(element) {
    if (element.dataset.originalDesktopCols) {
      return parseInt(element.dataset.originalDesktopCols);
    }

    const match = element.className.match(/grid--(\d+)-col-desktop/);
    if (match) {
      const cols = parseInt(match[1]);
      element.dataset.originalDesktopCols = cols;
      return cols;
    }

    return null;
  }

  function getCurrentDesktopCols(element) {
    const match = element.className.match(/grid--(\d+)-col-desktop/);
    return match ? parseInt(match[1]) : null;
  }

  function getCurrentTabletCols(element) {
    const match = element.className.match(/grid--(\d+)-col-tablet-down/);
    return match ? parseInt(match[1]) : null;
  }

  function adjustGridColumns() {
    const grids = document.querySelectorAll('.product-grid');

    grids.forEach(grid => {
      const width = grid.offsetWidth;

      const originalDesktopCols = getOriginalDesktopCols(grid);
      if (originalDesktopCols) {
        let targetDesktopCols = originalDesktopCols;
        DESKTOP_BREAKPOINTS.forEach(rule => {
          if (width < rule.max) {
            targetDesktopCols = rule.cols;
          }
        });
        const currentDesktopCols = getCurrentDesktopCols(grid);
        if (currentDesktopCols !== targetDesktopCols) {
          grid.classList.forEach(className => {
            if (/grid--\d+-col-desktop/.test(className)) {
              grid.classList.remove(className);
            }
          });
          grid.classList.add(`grid--${targetDesktopCols}-col-desktop`);
        }
      }

      let targetTabletCols = 2;

      if (width < MOBILE_BREAKPOINT) {
        targetTabletCols = 1;
      } else if (width >= 600 && width <= 1000) {
        targetTabletCols = 3;
      }

      if (grid.dataset.originalTabletDown) {
        targetTabletCols = parseInt(grid.dataset.originalTabletDown);
      }

      const currentTabletCols = getCurrentTabletCols(grid);
      if (currentTabletCols !== targetTabletCols) {
        grid.classList.forEach(className => {
          if (/grid--\d+-col-tablet-down/.test(className)) {
            grid.classList.remove(className);
          }
        });
        if (targetTabletCols) {
          grid.classList.add(`grid--${targetTabletCols}-col-tablet-down`);
        }
      }
    });
  }

  function debounce(func, wait) {
    let timeout;
    return function(...args) {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  }

  document.addEventListener('DOMContentLoaded', function() {
    adjustGridColumns();

    const debouncedAdjust = debounce(adjustGridColumns, 200);
    window.addEventListener('resize', debouncedAdjust);

    const observer = new MutationObserver(adjustGridColumns);
    observer.observe(document.body, { childList: true, subtree: true });
  });

  window.adjustGridColumns = adjustGridColumns;
})();