(function() {
  'use strict';

  const CONFIG = {
    headerHeight: 80,
    scrollOffset: 100,
    debounceDelay: 150,
    formSubmitDelay: 1000,
    emailPattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    phonePattern: /^[\d+\-()\[\]]{10,20}$/,
    namePattern: /^[a-zA-ZÀ-ÿ\s-']{2,50}$/
  };

  class App {
    constructor() {
      this.init();
    }

    init() {
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => this.setup());
      } else {
        this.setup();
      }
    }

    setup() {
      new MobileMenu();
      new ScrollSpy();
      new SmoothScroll();
      new FormValidator();
      new ScrollToTop();
      new ModalManager();
      new PortfolioFilter();
      new CountUp();
      new ButtonInteractions();
    }
  }

  class MobileMenu {
    constructor() {
      this.toggler = document.querySelector('.navbar-toggler, .c-nav__toggle');
      this.collapse = document.querySelector('.navbar-collapse');
      
      if (this.toggler && this.collapse) {
        this.init();
      }
    }

    init() {
      this.toggler.addEventListener('click', () => this.toggle());
      
      const links = this.collapse.querySelectorAll('.nav-link, .c-nav__link, .c-nav__item a');
      links.forEach(link => {
        link.addEventListener('click', () => {
          if (window.innerWidth < 1024) {
            this.close();
          }
        });
      });

      document.addEventListener('click', (e) => {
        if (window.innerWidth < 1024 && 
            this.collapse.classList.contains('show') &&
            !this.collapse.contains(e.target) && 
            !this.toggler.contains(e.target)) {
          this.close();
        }
      });
    }

    toggle() {
      const isExpanded = this.toggler.getAttribute('aria-expanded') === 'true';
      
      if (isExpanded) {
        this.close();
      } else {
        this.open();
      }
    }

    open() {
      this.collapse.classList.add('show');
      this.toggler.setAttribute('aria-expanded', 'true');
      document.body.classList.add('u-no-scroll');
    }

    close() {
      this.collapse.classList.remove('show');
      this.toggler.setAttribute('aria-expanded', 'false');
      document.body.classList.remove('u-no-scroll');
    }
  }

  class ScrollSpy {
    constructor() {
      this.sections = document.querySelectorAll('[id]');
      this.navLinks = document.querySelectorAll('.nav-link, .c-nav__link');
      
      if (this.sections.length && this.navLinks.length) {
        this.init();
      }
    }

    init() {
      window.addEventListener('scroll', debounce(() => this.update(), CONFIG.debounceDelay));
      this.update();
    }

    update() {
      const scrollPos = window.scrollY + CONFIG.headerHeight + 50;
      
      let current = '';
      
      this.sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.offsetHeight;
        
        if (scrollPos >= sectionTop && scrollPos < sectionTop + sectionHeight) {
          current = section.getAttribute('id');
        }
      });

      this.navLinks.forEach(link => {
        link.classList.remove('active');
        link.removeAttribute('aria-current');
        
        const href = link.getAttribute('href');
        if (href && href.includes('#' + current)) {
          link.classList.add('active');
          link.setAttribute('aria-current', 'page');
        }
      });
    }
  }

  class SmoothScroll {
    constructor() {
      this.links = document.querySelectorAll('a[href^="#"]');
      
      if (this.links.length) {
        this.init();
      }
    }

    init() {
      this.links.forEach(link => {
        link.addEventListener('click', (e) => {
          const href = link.getAttribute('href');
          
          if (href === '#' || !href) return;
          
          const target = document.querySelector(href);
          
          if (target) {
            e.preventDefault();
            
            const offsetTop = target.offsetTop - CONFIG.headerHeight;
            
            window.scrollTo({
              top: offsetTop,
              behavior: 'smooth'
            });
          }
        });
      });
    }
  }

  class FormValidator {
    constructor() {
      this.forms = document.querySelectorAll('form.c-form, form.needs-validation');
      
      if (this.forms.length) {
        this.init();
      }
    }

    init() {
      this.forms.forEach(form => {
        form.addEventListener('submit', (e) => this.handleSubmit(e, form));
      });
    }

    handleSubmit(e, form) {
      e.preventDefault();
      
      const formId = form.getAttribute('id');
      const isValid = this.validateForm(form);
      
      if (isValid) {
        this.submitForm(form, formId);
      }
    }

    validateForm(form) {
      let isValid = true;
      
      const firstName = form.querySelector('#firstName, #bookingFirstName, #brochureName');
      const lastName = form.querySelector('#lastName, #bookingLastName');
      const email = form.querySelector('#email, #bookingEmail, #brochureEmail');
      const phone = form.querySelector('#phone, #bookingPhone');
      const message = form.querySelector('#message, #bookingMessage');
      const privacy = form.querySelector('#privacy, #bookingPrivacy, #brochurePrivacy');
      const service = form.querySelector('#service, #bookingService');
      const date = form.querySelector('#bookingDate');
      const challenge = form.querySelectorAll('[name="challenge"]');

      if (firstName) {
        if (!this.validateName(firstName.value)) {
          this.showError(firstName, 'Voer een geldige naam in (minimaal 2 tekens)');
          isValid = false;
        } else {
          this.clearError(firstName);
        }
      }

      if (lastName) {
        if (!this.validateName(lastName.value)) {
          this.showError(lastName, 'Voer een geldige achternaam in (minimaal 2 tekens)');
          isValid = false;
        } else {
          this.clearError(lastName);
        }
      }

      if (email) {
        if (!this.validateEmail(email.value)) {
          this.showError(email, 'Voer een geldig e-mailadres in');
          isValid = false;
        } else {
          this.clearError(email);
        }
      }

      if (phone) {
        if (!this.validatePhone(phone.value)) {
          this.showError(phone, 'Voer een geldig telefoonnummer in');
          isValid = false;
        } else {
          this.clearError(phone);
        }
      }

      if (message) {
        if (message.value.trim().length < 10) {
          this.showError(message, 'Bericht moet minimaal 10 tekens bevatten');
          isValid = false;
        } else {
          this.clearError(message);
        }
      }

      if (service && service.hasAttribute('required')) {
        if (!service.value) {
          this.showError(service, 'Selecteer een service');
          isValid = false;
        } else {
          this.clearError(service);
        }
      }

      if (date && date.hasAttribute('required')) {
        if (!date.value) {
          this.showError(date, 'Selecteer een datum');
          isValid = false;
        } else {
          this.clearError(date);
        }
      }

      if (challenge.length > 0) {
        let isChecked = false;
        challenge.forEach(radio => {
          if (radio.checked) isChecked = true;
        });
        
        if (!isChecked) {
          this.showError(challenge[0], 'Selecteer een optie');
          isValid = false;
        } else {
          this.clearError(challenge[0]);
        }
      }

      if (privacy) {
        if (!privacy.checked) {
          this.showError(privacy, 'U moet akkoord gaan met het privacybeleid');
          isValid = false;
        } else {
          this.clearError(privacy);
        }
      }

      return isValid;
    }

    validateName(value) {
      return CONFIG.namePattern.test(value.trim());
    }

    validateEmail(value) {
      return CONFIG.emailPattern.test(value.trim());
    }

    validatePhone(value) {
      return CONFIG.phonePattern.test(value.trim());
    }

    showError(field, message) {
      field.classList.add('is-invalid');
      
      let errorEl = field.parentElement.querySelector('.invalid-feedback');
      
      if (!errorEl) {
        errorEl = document.createElement('div');
        errorEl.className = 'invalid-feedback';
        field.parentElement.appendChild(errorEl);
      }
      
      errorEl.textContent = message;
    }

    clearError(field) {
      field.classList.remove('is-invalid');
      
      const errorEl = field.parentElement.querySelector('.invalid-feedback');
      if (errorEl) {
        errorEl.textContent = '';
      }
    }

    submitForm(form, formId) {
      const submitBtn = form.querySelector('button[type="submit"]');
      
      if (submitBtn) {
        const originalText = submitBtn.textContent;
        submitBtn.disabled = true;
        submitBtn.textContent = 'Verzenden...';
        
        setTimeout(() => {
          window.location.href = 'thank_you.html';
        }, CONFIG.formSubmitDelay);
      } else {
        window.location.href = 'thank_you.html';
      }
    }
  }

  class ScrollToTop {
    constructor() {
      this.createButton();
    }

    createButton() {
      const button = document.createElement('button');
      button.className = 'c-scroll-to-top';
      button.setAttribute('aria-label', 'Scroll naar boven');
      button.innerHTML = '↑';
      document.body.appendChild(button);
      
      this.button = button;
      
      this.addStyles();
      this.init();
    }

    addStyles() {
      if (!document.getElementById('scroll-to-top-styles')) {
        const style = document.createElement('style');
        style.id = 'scroll-to-top-styles';
        style.textContent = `
          .c-scroll-to-top {
            position: fixed;
            bottom: 2rem;
            right: 2rem;
            width: 48px;
            height: 48px;
            background-color: var(--color-primary);
            color: var(--color-bg);
            border: none;
            border-radius: var(--border-radius-full);
            cursor: pointer;
            opacity: 0;
            visibility: hidden;
            transition: all var(--transition-base);
            z-index: 999;
            font-size: 1.5rem;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: var(--shadow-md);
          }
          .c-scroll-to-top.is-visible {
            opacity: 1;
            visibility: visible;
          }
          .c-scroll-to-top:hover {
            background-color: var(--color-primary-dark);
            transform: translateY(-4px);
          }
        `;
        document.head.appendChild(style);
      }
    }

    init() {
      window.addEventListener('scroll', debounce(() => this.toggle(), CONFIG.debounceDelay));
      
      this.button.addEventListener('click', () => {
        window.scrollTo({
          top: 0,
          behavior: 'smooth'
        });
      });
    }

    toggle() {
      if (window.scrollY > CONFIG.scrollOffset) {
        this.button.classList.add('is-visible');
      } else {
        this.button.classList.remove('is-visible');
      }
    }
  }

  class ModalManager {
    constructor() {
      this.modals = document.querySelectorAll('.modal');
      this.triggers = document.querySelectorAll('[data-bs-toggle="modal"]');
      
      if (this.modals.length || this.triggers.length) {
        this.init();
      }
    }

    init() {
      this.triggers.forEach(trigger => {
        trigger.addEventListener('click', (e) => {
          e.preventDefault();
          
          const targetId = trigger.getAttribute('data-bs-target');
          const modal = document.querySelector(targetId);
          
          if (modal) {
            this.open(modal);
          }
        });
      });

      this.modals.forEach(modal => {
        const closeButtons = modal.querySelectorAll('[data-bs-dismiss="modal"], .btn-close');
        
        closeButtons.forEach(btn => {
          btn.addEventListener('click', () => this.close(modal));
        });

        modal.addEventListener('click', (e) => {
          if (e.target === modal) {
            this.close(modal);
          }
        });
      });
    }

    open(modal) {
      modal.classList.add('show');
      modal.style.display = 'block';
      modal.setAttribute('aria-hidden', 'false');
      document.body.classList.add('u-no-scroll');
      
      this.createBackdrop();
    }

    close(modal) {
      modal.classList.remove('show');
      modal.style.display = 'none';
      modal.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('u-no-scroll');
      
      this.removeBackdrop();
    }

    createBackdrop() {
      if (!document.querySelector('.modal-backdrop')) {
        const backdrop = document.createElement('div');
        backdrop.className = 'modal-backdrop';
        document.body.appendChild(backdrop);
        
        if (!document.getElementById('modal-backdrop-styles')) {
          const style = document.createElement('style');
          style.id = 'modal-backdrop-styles';
          style.textContent = `
            .modal-backdrop {
              position: fixed;
              top: 0;
              left: 0;
              width: 100%;
              height: 100%;
              background-color: rgba(0, 0, 0, 0.5);
              z-index: 1999;
            }
            .modal {
              display: none;
              position: fixed;
              top: 0;
              left: 0;
              width: 100%;
              height: 100%;
              z-index: 2000;
              overflow-y: auto;
              align-items: center;
              justify-content: center;
            }
            .modal.show {
              display: flex;
            }
          `;
          document.head.appendChild(style);
        }
      }
    }

    removeBackdrop() {
      const backdrop = document.querySelector('.modal-backdrop');
      if (backdrop) {
        backdrop.remove();
      }
    }
  }

  class PortfolioFilter {
    constructor() {
      this.filters = document.querySelectorAll('[data-filter]');
      this.items = document.querySelectorAll('.c-card, .card');
      
      if (this.filters.length && this.items.length) {
        this.init();
      }
    }

    init() {
      this.filters.forEach(filter => {
        filter.addEventListener('click', () => {
          const category = filter.getAttribute('data-filter');
          
          this.filters.forEach(f => f.classList.remove('is-active'));
          filter.classList.add('is-active');
          
          this.filterItems(category);
        });
      });
    }

    filterItems(category) {
      this.items.forEach(item => {
        const itemCategory = item.getAttribute('data-category');
        
        if (category === 'all' || itemCategory === category) {
          item.classList.remove('u-hidden');
        } else {
          item.classList.add('u-hidden');
        }
      });
    }
  }

  class CountUp {
    constructor() {
      this.counters = document.querySelectorAll('.c-stats__number');
      
      if (this.counters.length) {
        this.init();
      }
    }

    init() {
      this.counters.forEach(counter => {
        const target = parseInt(counter.textContent.replace(/\D/g, ''));
        const suffix = counter.textContent.replace(/[0-9]/g, '');
        
        if (target) {
          counter.setAttribute('data-target', target);
          counter.setAttribute('data-suffix', suffix);
          counter.textContent = '0' + suffix;
          
          this.animate(counter);
        }
      });
    }

    animate(counter) {
      const target = parseInt(counter.getAttribute('data-target'));
      const suffix = counter.getAttribute('data-suffix') || '';
      const duration = 2000;
      const increment = target / (duration / 16);
      
      let current = 0;
      
      const updateCounter = () => {
        current += increment;
        
        if (current < target) {
          counter.textContent = Math.floor(current) + suffix;
          requestAnimationFrame(updateCounter);
        } else {
          counter.textContent = target + suffix;
        }
      };
      
      updateCounter();
    }
  }

  class ButtonInteractions {
    constructor() {
      this.buttons = document.querySelectorAll('.btn, .c-button');
      
      if (this.buttons.length) {
        this.init();
      }
    }

    init() {
      this.buttons.forEach(button => {
        button.addEventListener('click', (e) => {
          const ripple = document.createElement('span');
          const rect = button.getBoundingClientRect();
          const size = Math.max(rect.width, rect.height);
          const x = e.clientX - rect.left - size / 2;
          const y = e.clientY - rect.top - size / 2;
          
          ripple.style.width = ripple.style.height = size + 'px';
          ripple.style.left = x + 'px';
          ripple.style.top = y + 'px';
          ripple.className = 'ripple-effect';
          
          button.appendChild(ripple);
          
          setTimeout(() => ripple.remove(), 600);
        });
      });
      
      this.addRippleStyles();
    }

    addRippleStyles() {
      if (!document.getElementById('ripple-styles')) {
        const style = document.createElement('style');
        style.id = 'ripple-styles';
        style.textContent = `
          .ripple-effect {
            position: absolute;
            border-radius: 50%;
            background-color: rgba(255, 255, 255, 0.6);
            pointer-events: none;
            transform: scale(0);
            animation: ripple-animation 0.6s ease-out;
          }
          @keyframes ripple-animation {
            to {
              transform: scale(2);
              opacity: 0;
            }
          }
        `;
        document.head.appendChild(style);
      }
    }
  }

  function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  new App();
})();