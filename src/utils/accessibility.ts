/**
 * Accessibility utilities for screen reader support and keyboard navigation
 */

/**
 * Announces a message to screen readers using ARIA live region
 */
export function announceToScreenReader(message: string, priority: 'polite' | 'assertive' = 'polite') {
  // Remove any existing announcement to prevent duplicates
  const existingAnnouncement = document.getElementById('sr-announcement');
  if (existingAnnouncement) {
    existingAnnouncement.remove();
  }

  // Create new announcement element
  const announcement = document.createElement('div');
  announcement.id = 'sr-announcement';
  announcement.setAttribute('aria-live', priority);
  announcement.setAttribute('aria-atomic', 'true');
  announcement.className = 'sr-only';
  announcement.textContent = message;

  // Add to DOM
  document.body.appendChild(announcement);

  // Remove after announcement is read (with delay for screen readers)
  setTimeout(() => {
    if (announcement.parentNode) {
      announcement.parentNode.removeChild(announcement);
    }
  }, 1000);
}

/**
 * Traps focus within a container (for modals, dropdowns, etc.)
 */
export function trapFocus(container: HTMLElement) {
  const focusableElements = container.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  ) as NodeListOf<HTMLElement>;
  
  const firstFocusable = focusableElements[0];
  const lastFocusable = focusableElements[focusableElements.length - 1];

  const handleTabKey = (e: KeyboardEvent) => {
    if (e.key !== 'Tab') return;

    if (e.shiftKey) {
      // Shift + Tab
      if (document.activeElement === firstFocusable) {
        e.preventDefault();
        lastFocusable?.focus();
      }
    } else {
      // Tab
      if (document.activeElement === lastFocusable) {
        e.preventDefault();
        firstFocusable?.focus();
      }
    }
  };

  container.addEventListener('keydown', handleTabKey);
  firstFocusable?.focus();

  // Return cleanup function
  return () => {
    container.removeEventListener('keydown', handleTabKey);
  };
}

/**
 * Checks if an element is visible to screen readers
 */
export function isScreenReaderVisible(element: HTMLElement): boolean {
  const style = window.getComputedStyle(element);
  return style.display !== 'none' && 
         style.visibility !== 'hidden' && 
         !element.hasAttribute('aria-hidden') &&
         element.getAttribute('aria-hidden') !== 'true';
}

/**
 * Adds keyboard navigation support to custom components
 */
export function addKeyboardNavigation(
  element: HTMLElement,
  onSelect: (index: number) => void,
  options: {
    orientation?: 'horizontal' | 'vertical';
    loop?: boolean;
  } = {}
) {
  const { orientation = 'vertical', loop = true } = options;
  const items = Array.from(element.querySelectorAll('[role="option"], [role="menuitem"], [role="tab"]')) as HTMLElement[];
  
  let currentIndex = 0;

  const handleKeyDown = (e: KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown':
      case 'ArrowRight':
        e.preventDefault();
        currentIndex = orientation === 'vertical' && e.key === 'ArrowRight' ? currentIndex : 
                    (currentIndex + 1) % items.length;
        break;
      case 'ArrowUp':
      case 'ArrowLeft':
        e.preventDefault();
        currentIndex = orientation === 'horizontal' && e.key === 'ArrowUp' ? currentIndex : 
                    currentIndex === 0 ? (loop ? items.length - 1 : 0) : currentIndex - 1;
        break;
      case 'Home':
        e.preventDefault();
        currentIndex = 0;
        break;
      case 'End':
        e.preventDefault();
        currentIndex = items.length - 1;
        break;
      case 'Enter':
      case ' ':
        e.preventDefault();
        onSelect(currentIndex);
        return;
      default:
        return;
    }

    // Focus the current item
    items[currentIndex]?.focus();
    
    // Update aria-selected for tabs
    items.forEach((item, index) => {
      if (item.getAttribute('role') === 'tab') {
        item.setAttribute('aria-selected', index === currentIndex ? 'true' : 'false');
      }
    });
  };

  element.addEventListener('keydown', handleKeyDown);

  // Return cleanup function
  return () => {
    element.removeEventListener('keydown', handleKeyDown);
  };
}

/**
 * Generates a unique ID for accessibility purposes
 */
export function generateAriaId(prefix: string = 'aria'): string {
  return `${prefix}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Adds skip links for keyboard navigation
 */
export function addSkipLinks() {
  const skipLinks = [
    { href: '#main-content', text: 'Skip to main content' },
    { href: '#navigation', text: 'Skip to navigation' },
  ];

  skipLinks.forEach(link => {
    const existing = document.querySelector(`a[href="${link.href}"]`);
    if (existing) return;

    const skipLink = document.createElement('a');
    skipLink.href = link.href;
    skipLink.textContent = link.text;
    skipLink.className = 'sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-[#334233] text-[#F6F1E7] px-4 py-2 rounded-md z-50 focus:outline-none focus:ring-2 focus:ring-[#B36A4C]';
    document.body.insertBefore(skipLink, document.body.firstChild);
  });
}
