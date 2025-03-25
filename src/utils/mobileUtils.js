// src/utils/mobileUtils.js

/**
 * Initialize all mobile enhancements
 */
export const initMobileEnhancements = () => {
  addTableScrollIndicators();
  setupCollapsibleSections();
  addTouchFeedback();
  setupSafeViewport();
  setupBottomNavigation();
  setupPullToRefresh();
  
  // Re-run certain functions when window is resized
  window.addEventListener('resize', () => {
    addTableScrollIndicators();
  });
};

/**
 * Adds scroll indicators to tables that overflow
 */
const addTableScrollIndicators = () => {
  if (window.innerWidth > 768) return; // Only for mobile devices
  
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
      wrapper.querySelector('.mobile-scroll-indicator').style.display = 'block';
    } else {
      wrapper.classList.remove('has-overflow');
      const indicator = wrapper.querySelector('.mobile-scroll-indicator');
      if (indicator) indicator.style.display = 'none';
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
 * Make sections collapsible on mobile
 */
const setupCollapsibleSections = () => {
  if (window.innerWidth > 768) return; // Only for mobile devices
  
  const sections = document.querySelectorAll('.section');
  
  // Skip certain sections that should always be visible
  const excludedSections = ['#prediction-performance-section'];
  
  sections.forEach((section, index) => {
    // Skip excluded sections
    if (excludedSections.some(selector => section.matches(selector))) {
      return;
    }
    
    // Add collapsible class
    section.classList.add('mobile-collapsible');
    
    // Wrap content in a div for easier hiding
    const sectionTitle = section.querySelector('.section-title');
    if (!sectionTitle) return;
    
    // Don't wrap if already wrapped
    if (section.querySelector('.section-content')) return;
    
    // Create content wrapper
    const contentWrapper = document.createElement('div');
    contentWrapper.className = 'section-content';
    
    // Move all elements after the title into the wrapper
    let nextElement = sectionTitle.nextElementSibling;
    while (nextElement) {
      const temp = nextElement.nextElementSibling;
      contentWrapper.appendChild(nextElement);
      nextElement = temp;
    }
    
    section.appendChild(contentWrapper);
    
    // Collapse sections after the first two by default
    if (index > 1) {
      section.classList.add('collapsed');
    }
    
    // Add click handler to title
    sectionTitle.addEventListener('click', () => {
      section.classList.toggle('collapsed');
      // Save state in localStorage
      try {
        const collapsedSections = JSON.parse(localStorage.getItem('collapsedSections') || '{}');
        collapsedSections[section.id || `section-${index}`] = section.classList.contains('collapsed');
        localStorage.setItem('collapsedSections', JSON.stringify(collapsedSections));
      } catch (e) {
        console.error('Error saving section state:', e);
      }
    });
    
    // Restore previous state from localStorage
    try {
      const collapsedSections = JSON.parse(localStorage.getItem('collapsedSections') || '{}');
      const sectionId = section.id || `section-${index}`;
      if (collapsedSections[sectionId] !== undefined) {
        if (collapsedSections[sectionId]) {
          section.classList.add('collapsed');
        } else {
          section.classList.remove('collapsed');
        }
      }
    } catch (e) {
      console.error('Error restoring section state:', e);
    }
  });
};

/**
 * Add touch feedback to interactive elements
 */
const addTouchFeedback = () => {
  const interactiveElements = document.querySelectorAll(
    '.tab-button, .stats-tab, .compact-fun-stat-card, ' +
    '.vertical-team-item, .vertical-person-item, ' +
    '.mobile-nav-item'
  );
  
  interactiveElements.forEach(element => {
    element.addEventListener('touchstart', () => {
      element.classList.add('touching');
    }, { passive: true });
    
    ['touchend', 'touchcancel'].forEach(event => {
      element.addEventListener(event, () => {
        element.classList.remove('touching');
        // Add small delay to remove class for better visual feedback
        setTimeout(() => {
          element.classList.remove('touching');
        }, 100);
      }, { passive: true });
    });
  });
};

/**
 * Sets up viewport to handle notched phones
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
    'env(safe-area-inset-top, 0px)'
  );
  document.documentElement.style.setProperty(
    '--safe-area-inset-right',
    'env(safe-area-inset-right, 0px)'
  );
  document.documentElement.style.setProperty(
    '--safe-area-inset-bottom',
    'env(safe-area-inset-bottom, 0px)'
  );
  document.documentElement.style.setProperty(
    '--safe-area-inset-left',
    'env(safe-area-inset-left, 0px)'
  );
};

/**
 * Setup mobile bottom navigation
 */
const setupBottomNavigation = () => {
  if (window.innerWidth > 576) return; // Only for small mobile devices
  
  // If nav already exists, don't create again
  if (document.querySelector('.mobile-nav')) return;
  
  const nav = document.createElement('nav');
  nav.className = 'mobile-nav';
  
  const navItems = [
    { icon: '🏆', label: 'Dashboard', target: '#prediction-performance-section' },
    { icon: '📊', label: 'Stats', target: '.compact-fun-stats-section' },
    { icon: '📋', label: 'Standings', target: '#standings-table' },
    { icon: '🔮', label: 'Predictions', target: '#predictions-table' }
  ];
  
  navItems.forEach(item => {
    const navItem = document.createElement('a');
    navItem.className = 'mobile-nav-item';
    navItem.href = 'javascript:void(0)';
    navItem.innerHTML = `
      <span class="mobile-nav-icon">${item.icon}</span>
      <span class="mobile-nav-label">${item.label}</span>
    `;
    
    navItem.addEventListener('click', () => {
      // Remove active class from all items
      document.querySelectorAll('.mobile-nav-item').forEach(el => {
        el.classList.remove('active');
      });
      
      // Add active class to clicked item
      navItem.classList.add('active');
      
      // Find target and scroll to it
      const target = document.querySelector(item.target);
      if (target) {
        // Expand section if collapsed
        const section = target.closest('.section') || target.closest('.compact-fun-stats-section');
        if (section && section.classList.contains('collapsed')) {
          section.classList.remove('collapsed');
        }
        
        // Scroll to target
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
    
    nav.appendChild(navItem);
  });
  
  // Add to document
  document.body.appendChild(nav);
  
  // Set first item as active
  nav.querySelector('.mobile-nav-item').classList.add('active');
};

/**
 * Setup pull-to-refresh functionality
 */
const setupPullToRefresh = () => {
  if (window.innerWidth > 768) return; // Only for mobile devices
  
  // Create pull-to-refresh indicator
  const indicator = document.createElement('div');
  indicator.className = 'pull-to-refresh';
  indicator.textContent = 'Pull down to refresh';
  
  document.body.appendChild(indicator);
  
  let startY = 0;
  let currentY = 0;
  let refreshing = false;
  
  document.addEventListener('touchstart', (e) => {
    // Only enable pull-to-refresh when at the top of the page
    if (window.scrollY <= 0) {
      startY = e.touches[0].pageY;
    }
  }, { passive: true });
  
  document.addEventListener('touchmove', (e) => {
    if (startY > 0 && !refreshing) {
      currentY = e.touches[0].pageY;
      const distance = currentY - startY;
      
      if (distance > 0 && window.scrollY <= 0) {
        // Show indicator
        indicator.classList.add('visible');
        
        // Calculate how far indicator should be pulled down
        const pullDistance = Math.min(distance / 2.5, 40);
        indicator.style.transform = `translateY(${pullDistance}px)`;
        
        // Update text based on how far pulled
        if (pullDistance >= 40) {
          indicator.textContent = 'Release to refresh';
        } else {
          indicator.textContent = 'Pull down to refresh';
        }
      }
    }
  }, { passive: true });
  
  document.addEventListener('touchend', () => {
    if (startY > 0 && !refreshing) {
      const distance = currentY - startY;
      
      if (distance >= 80) {
        // Trigger refresh
        refreshing = true;
        indicator.textContent = 'Refreshing...';
        indicator.classList.add('refreshing');
        
        // Simulate refresh
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      } else {
        // Reset
        indicator.classList.remove('visible');
        indicator.style.transform = '';
      }
      
      startY = 0;
      currentY = 0;
    }
  }, { passive: true });
};

/**
 * Optimize tables for mobile view
 */
export const optimizeTablesForMobile = () => {
  if (window.innerWidth > 768) return; // Only for mobile devices
  
  const tables = document.querySelectorAll('table');
  
  tables.forEach(table => {
    // Add data-label attributes to cells for responsive display
    const headers = Array.from(table.querySelectorAll('th')).map(th => th.textContent.trim());
    
    table.querySelectorAll('tbody tr').forEach(row => {
      Array.from(row.querySelectorAll('td')).forEach((cell, index) => {
        if (headers[index]) {
          cell.setAttribute('data-label', headers[index]);
        }
      });
    });
  });
};

/**
 * Make all scrollable containers have momentum scrolling on iOS
 */
export const enhanceScrolling = () => {
  const scrollContainers = document.querySelectorAll('.table-wrapper, .tab-container, .stats-category-tabs');
  
  scrollContainers.forEach(container => {
    container.style.webkitOverflowScrolling = 'touch';
  });
};