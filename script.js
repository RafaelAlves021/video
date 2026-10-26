/**
 * ==========================================================================
 * DRA. ALINE RANGEL – CLÍNICA RANTHÉ
 * script.js - Lógica interativa, formulário, WhatsApp, carrossel e slider
 * ==========================================================================
 */

document.addEventListener('DOMContentLoaded', () => {

  /**
   * 1. CONFIGURAÇÕES CENTRAIS
   * TROCAR AQUI: Insira o número oficial da clínica quando estiver pronto.
   * Formato: DDI + DDD + Número sem espaços ou símbolos (Ex: 5521999998888)
   */
  const CONFIG = {
    whatsapp: '5521900000000',
    clinicName: 'Clínica Ranthé'
  };

  /**
   * Utilitário para gerar URLs universais do WhatsApp
   */
  const getWhatsAppUrl = (customText) => {
    const encoded = encodeURIComponent(customText || `Olá, gostaria de agendar uma consulta na ${CONFIG.clinicName}.`);
    return `https://wa.me/${CONFIG.whatsapp}?text=${encoded}`;
  };

  /**
   * 2. VINCULAÇÃO AUTOMÁTICA DOS GATILHOS DO WHATSAPP (.js-wa-trigger)
   */
  const waButtons = document.querySelectorAll('.js-wa-trigger');
  waButtons.forEach((btn) => {
    btn.addEventListener('click', (event) => {
      event.preventDefault();
      const customMessage = btn.getAttribute('data-message');
      const url = getWhatsAppUrl(customMessage);
      window.open(url, '_blank', 'noopener,noreferrer');
    });
  });

  /**
   * 3. HEADER FIXO COM SOMBRA AO ROLAR & DESTAQUE DE LINKS (SCROLLSPY)
   */
  const header = document.getElementById('header');
  const navLinks = document.querySelectorAll('.nav__link');
  const sections = document.querySelectorAll('section[id], header[id]');

  window.addEventListener('scroll', () => {
    // Sombra do header
    if (window.scrollY > 20) {
      header.classList.add('is-scrolled');
    } else {
      header.classList.remove('is-scrolled');
    }

    // Scrollspy simples
    let currentSectionId = '';
    const scrollPos = window.scrollY + 140;

    sections.forEach((section) => {
      const top = section.offsetTop;
      const height = section.offsetHeight;
      if (scrollPos >= top && scrollPos < top + height) {
        currentSectionId = section.getAttribute('id');
      }
    });

    navLinks.forEach((link) => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${currentSectionId}`) {
        link.classList.add('active');
      }
    });
  });

  /**
   * 4. MENU MOBILE HAMBÚRGUER COM SUPORTE A ACESSIBILIDADE
   */
  const menuToggle = document.getElementById('menuToggle');
  const navMenu = document.getElementById('navMenu');

  if (menuToggle && navMenu) {
    const toggleMenu = () => {
      const isOpen = navMenu.classList.toggle('is-open');
      menuToggle.classList.toggle('is-active', isOpen);
      menuToggle.setAttribute('aria-expanded', isOpen.toString());
      document.body.style.overflow = isOpen ? 'hidden' : '';
    };

    menuToggle.addEventListener('click', toggleMenu);

    // Fechar ao clicar em qualquer link de âncora
    navLinks.forEach((link) => {
      link.addEventListener('click', () => {
        if (navMenu.classList.contains('is-open')) {
          toggleMenu();
        }
      });
    });

    // Fechar com a tecla Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && navMenu.classList.contains('is-open')) {
        toggleMenu();
      }
    });
  }

  /**
   * 5. CARROSSEL DE DEPOIMENTOS (Touch Swipe, Teclado e Autoplay)
   */
  const carousel = document.getElementById('testimonialCarousel');
  if (carousel) {
    const track = carousel.querySelector('.carousel__track');
    const slides = Array.from(track.children);
    const nextBtn = document.getElementById('nextBtn');
    const prevBtn = document.getElementById('prevBtn');
    const dotsContainer = document.getElementById('carouselDots');

    let currentIndex = 0;
    let autoplayInterval = null;

    // Criar bolinhas indicadoras dinamicamente
    slides.forEach((_, idx) => {
      const dot = document.createElement('button');
      dot.classList.add('carousel__dot');
      if (idx === 0) dot.classList.add('is-active');
      dot.setAttribute('aria-label', `Ir para o depoimento ${idx + 1}`);
      dot.setAttribute('role', 'tab');
      dot.addEventListener('click', () => {
        moveToSlide(idx);
        restartAutoplay();
      });
      dotsContainer.appendChild(dot);
    });

    const dots = Array.from(dotsContainer.children);

    const moveToSlide = (index) => {
      if (index < 0) {
        index = slides.length - 1;
      } else if (index >= slides.length) {
        index = 0;
      }
      currentIndex = index;
      track.style.transform = `translateX(-${100 * currentIndex}%)`;

      slides.forEach((slide, i) => {
        slide.classList.toggle('is-active', i === currentIndex);
      });

      dots.forEach((dot, i) => {
        dot.classList.toggle('is-active', i === currentIndex);
      });
    };

    const nextSlide = () => moveToSlide(currentIndex + 1);
    const prevSlide = () => moveToSlide(currentIndex - 1);

    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        nextSlide();
        restartAutoplay();
      });
    }

    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        prevSlide();
        restartAutoplay();
      });
    }

    // Autoplay seguro
    const startAutoplay = () => {
      autoplayInterval = setInterval(nextSlide, 6000);
    };

    const stopAutoplay = () => {
      if (autoplayInterval) clearInterval(autoplayInterval);
    };

    const restartAutoplay = () => {
      stopAutoplay();
      startAutoplay();
    };

    carousel.addEventListener('mouseenter', stopAutoplay);
    carousel.addEventListener('mouseleave', startAutoplay);
    carousel.addEventListener('focusin', stopAutoplay);
    carousel.addEventListener('focusout', startAutoplay);

    // Suporte a gestos touch (Swipe) no telemóvel
    let touchStartX = 0;
    let touchEndX = 0;

    track.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
      stopAutoplay();
    }, { passive: true });

    track.addEventListener('touchend', (e) => {
      touchEndX = e.changedTouches[0].screenX;
      if (touchStartX - touchEndX > 45) {
        nextSlide();
      } else if (touchEndX - touchStartX > 45) {
        prevSlide();
      }
      startAutoplay();
    }, { passive: true });

    startAutoplay();
  }

  /**
   * 6. ACORDEÃO DO FAQ (Apenas um item aberto por vez)
   */
  const faqAccordion = document.getElementById('faqAccordion');
  if (faqAccordion) {
    const items = faqAccordion.querySelectorAll('.accordion__item');

    items.forEach((item) => {
      const trigger = item.querySelector('.accordion__trigger');
      const panel = item.querySelector('.accordion__panel');

      trigger.addEventListener('click', () => {
        const isCurrentlyOpen = item.classList.contains('is-open');

        // Fecha todos os outros itens
        items.forEach((otherItem) => {
          if (otherItem !== item) {
            otherItem.classList.remove('is-open');
            const otherBtn = otherItem.querySelector('.accordion__trigger');
            const otherPanel = otherItem.querySelector('.accordion__panel');
            otherBtn.setAttribute('aria-expanded', 'false');
            otherPanel.setAttribute('hidden', '');
          }
        });

        // Alterna o estado do item clicado
        if (isCurrentlyOpen) {
          item.classList.remove('is-open');
          trigger.setAttribute('aria-expanded', 'false');
          panel.setAttribute('hidden', '');
        } else {
          item.classList.add('is-open');
          trigger.setAttribute('aria-expanded', 'true');
          panel.removeAttribute('hidden');
        }
      });
    });
  }

  /**
   * 7. SLIDER DE COMPARAÇÃO ANTES / DEPOIS
   */
  const comparisonRange = document.getElementById('comparisonRange');
  const comparisonOverlay = document.getElementById('comparisonOverlay');
  const comparisonHandle = document.getElementById('comparisonHandle');

  if (comparisonRange && comparisonOverlay && comparisonHandle) {
    const updateSlider = (val) => {
      // Inverte para clip-path à direita
      comparisonOverlay.style.clipPath = `inset(0 ${100 - val}% 0 0)`;
      comparisonHandle.style.left = `${val}%`;
    };

    comparisonRange.addEventListener('input', (e) => {
      updateSlider(e.target.value);
    });
  }

  /**
   * 8. ANIMAÇÕES REVEAL AO ROLAR (IntersectionObserver)
   */
  const revealElements = document.querySelectorAll('.reveal-on-scroll');
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          obs.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.15,
      rootMargin: '0px 0px -40px 0px'
    });

    revealElements.forEach((el) => observer.observe(el));
  } else {
    // Fallback para navegadores legados
    revealElements.forEach((el) => el.classList.add('is-visible'));
  }

  /**
   * 9. FORMULÁRIO DE CONTATO DIRETO PARA O WHATSAPP
   */
  const contactForm = document.getElementById('contactForm');
  if (contactForm) {
    const nameInput = document.getElementById('formName');
    const phoneInput = document.getElementById('formPhone');
    const treatmentSelect = document.getElementById('formTreatment');
    const messageInput = document.getElementById('formMessage');

    // Validador simples
    const validateField = (input, group) => {
      if (!input.checkValidity() || input.value.trim() === '') {
        group.classList.add('has-error');
        return false;
      }
      group.classList.remove('has-error');
      return true;
    };

    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const isNameValid = validateField(nameInput, nameInput.parentElement);
      const isPhoneValid = validateField(phoneInput, phoneInput.parentElement);
      const isTreatmentValid = validateField(treatmentSelect, treatmentSelect.parentElement);

      if (isNameValid && isPhoneValid && isTreatmentValid) {
        const nameVal = nameInput.value.trim();
        const phoneVal = phoneInput.value.trim();
        const treatmentVal = treatmentSelect.value;
        const msgVal = messageInput.value.trim();

        // Montagem de texto organizado
        let finalMessage = `*Novo Contato via Site – ${CONFIG.clinicName}*\n`;
        finalMessage += `• *Nome:* ${nameVal}\n`;
        finalMessage += `• *Telefone:* ${phoneVal}\n`;
        finalMessage += `• *Interesse:* ${treatmentVal}\n`;
        if (msgVal) {
          finalMessage += `• *Mensagem:* ${msgVal}`;
        }

        const url = getWhatsAppUrl(finalMessage);
        window.open(url, '_blank', 'noopener,noreferrer');
      }
    });

    // Limpeza de erros durante digitação
    [nameInput, phoneInput, treatmentSelect].forEach((element) => {
      element.addEventListener('input', () => {
        element.parentElement.classList.remove('has-error');
      });
    });
  }

});