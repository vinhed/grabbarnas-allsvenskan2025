
export const initMobileEnhancements = () => {
    // Only run on mobile devices
    if (window.innerWidth <= 768) {
      addTableScrollIndicators();
      addTouchFeedback();
      setupSafeViewport();
      
      // Re-run when window is resized
      window.addEventListener('resize', () => {
        addTableScrollIndicators();
      });
    }
  };
  
  /**
   * Adds scroll indicators to tables that overflow
   */
  const addTableScrollIndicators = () => {
    const tableWrappers = document.querySelectorAll('.table-wrapper');
    
    tableWrappers.forEach(wrapper => {
      // Create indicator element if it doesn't exist
      if (!wrapper.querySelector('.mobile-scroll-indicator')) {
        const indicator = document.createElement('div');
        indicator.className = 'mobile-scroll-indicator';
        indicator.innerHTML = '&larr; Scroll &rarr;';
        wrapper.appendChild(indicator);
      }
      
      // Check if table is wider than its container
      const table = wrapper.querySelector('table');
      if (table && table.offsetWidth > wrapper.offsetWidth) {
        wrapper.classList.add('has-overflow');
      } else {
        wrapper.classList.remove('has-overflow');
      }
      
      // Hide indicator after user has scrolled
      wrapper.addEventListener('scroll', () => {
        const indicator = wrapper.querySelector('.mobile-scroll-indicator');
        if (indicator) {
          indicator.style.opacity = '0';
          setTimeout(() => {
            indicator.style.display = 'none';
          }, 300);
        }
      }, { once: true });
    });
  };
  
  /**
   * Adds touch feedback to interactive elements
   */
  const addTouchFeedback = () => {
    const interactiveElements = document.querySelectorAll(
      '.tab-button, .stats-tab, .compact-fun-stat-card, ' +
      '.vertical-team-item, .vertical-person-item'
    );
    
    interactiveElements.forEach(element => {
      element.addEventListener('touchstart', () => {
        element.classList.add('touching');
      });
      
      ['touchend', 'touchcancel'].forEach(event => {
        element.addEventListener(event, () => {
          element.classList.remove('touching');
        });
      });
    });
  };
  
  /**
   * Sets up viewport to handle notched phones (iPhone X and newer)
   */
  const setupSafeViewport = () => {
    // Add viewport-fit=cover meta tag for notched phones
    let viewportMeta = document.querySelector('meta[name="viewport"]');
    
    if (!viewportMeta) {
      viewportMeta = document.createElement('meta');
      viewportMeta.name = 'viewport';
      document.head.appendChild(viewportMeta);
    }
    
    // Add viewport-fit=cover to the content
    const content = viewportMeta.getAttribute('content') || '';
    if (!content.includes('viewport-fit=cover')) {
      viewportMeta.setAttribute(
        'content',
        `${content}${content ? ', ' : ''}viewport-fit=cover`
      );
    }
    
    // Add CSS variables for safe areas
    document.documentElement.style.setProperty(
      '--safe-area-inset-top',
      'env(safe-area-inset-top)'
    );
    document.documentElement.style.setProperty(
      '--safe-area-inset-right',
      'env(safe-area-inset-right)'
    );
    document.documentElement.style.setProperty(
      '--safe-area-inset-bottom',
      'env(safe-area-inset-bottom)'
    );
    document.documentElement.style.setProperty(
      '--safe-area-inset-left',
      'env(safe-area-inset-left)'
    );
  };
  
  /**
   * Optimizes table rendering on mobile devices
   */
  export const optimizeTablesForMobile = () => {
    if (window.innerWidth <= 768) {
      const tables = document.querySelectorAll('table');
      
      tables.forEach(table => {
        // Add data-label attributes to cells for responsive display
        const headers = Array.from(table.querySelectorAll('th')).map(th => th.textContent);
        
        table.querySelectorAll('tbody tr').forEach(row => {
          Array.from(row.querySelectorAll('td')).forEach((cell, index) => {
            if (headers[index]) {
              cell.setAttribute('data-label', headers[index]);
            }
          });
        });
      });
    }
  };