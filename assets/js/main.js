/*!
 * Merity Incoming — comportamenti del sito (versione senza React)
 * Librerie: GSAP 3.14 + ScrollTrigger, Swiper, lottie-web (light)
 * Ogni blocco replica il comportamento del sito originale Next.js.
 */
(function () {
  'use strict';

  var lang = (document.documentElement.lang || 'fr').slice(0, 2);
  var $ = function (sel, ctx) { return (ctx || document).querySelector(sel); };
  var $$ = function (sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); };
  var hasClass = function (el, c) { return el.classList.contains(c); };
  var swap = function (el, off, on) { off.forEach(function (c) { el.classList.remove(c); }); on.forEach(function (c) { el.classList.add(c); }); };

  var TEXTS = {
    fr: { submit: 'Envoyer', submitting: 'Envoi en cours...', success: 'Merci ! Votre demande a bien été envoyée à l\'agence !', error: 'Oups ! Un problème est survenu lors de l\'envoi du formulaire.', retry: 'Réessayer' },
    en: { submit: 'Send', submitting: 'Sending...', success: 'Thank you! Your request has been sent to the agency!', error: 'Oops! A problem occurred while sending the form.', retry: 'Try again' },
    it: { submit: 'Invia', submitting: 'Invio in corso...', success: 'Grazie! La tua richiesta è stata inviata all\'agenzia!', error: 'Ops! Si è verificato un problema durante l\'invio del modulo.', retry: 'Riprova' }
  }[lang];

  if (window.gsap && window.ScrollTrigger) gsap.registerPlugin(ScrollTrigger);

  /* ------------------------------------------------------------------ *
   * 0. Loader iniziale: animazione Lottie in loop, rimosso dopo 2 secondi
   * ------------------------------------------------------------------ */
  var loader = document.getElementById('page-loader');
  if (loader) {
    var loaderAnim = null;
    if (window.lottie) {
      loaderAnim = lottie.loadAnimation({
        container: loader.firstElementChild, renderer: 'svg', loop: true, autoplay: true,
        path: '/merity-preview/documents/lottieflow-loading-03-c41945-easey.json'
      });
    }
    setTimeout(function () {
      if (loaderAnim) loaderAnim.destroy();
      loader.remove();
    }, 2000);
  }

  /* ------------------------------------------------------------------ *
   * 1. Barra di navigazione: sfondo bianco dopo 50px di scroll
   * ------------------------------------------------------------------ */
  var nav = $('body > nav');
  function updateNav() {
    if (!nav) return;
    var scrolled = window.scrollY > 50;
    if (scrolled) swap(nav, ['bg-transparent'], ['bg-white/90', 'backdrop-blur-md', 'shadow-lg']);
    else swap(nav, ['bg-white/90', 'backdrop-blur-md', 'shadow-lg'], ['bg-transparent']);
  }
  window.addEventListener('scroll', updateNav, { passive: true });
  updateNav();

  /* ------------------------------------------------------------------ *
   * 2. Menu laterale
   * ------------------------------------------------------------------ */
  var menuBtn = $('button[aria-label="Menu"]');
  var overlay = $$('body > div').filter(function (d) { return hasClass(d, 'bg-black/60'); })[0];
  var drawer = $$('body > div').filter(function (d) { return hasClass(d, 'w-[320px]'); })[0];
  var menuOpen = false;
  var lottieBox = null, lottieAnim = null;

  function setMenu(open) {
    if (!menuBtn || !drawer) return;
    menuOpen = open;
    var lines = $$(':scope > div > div', menuBtn);
    if (open) {
      lines[0].classList.add('rotate-45', 'translate-y-[7px]');
      lines[1].classList.add('opacity-0');
      lines[2].classList.add('-rotate-45', '-translate-y-[7px]');
      swap(overlay, ['opacity-0', 'pointer-events-none'], ['opacity-100', 'pointer-events-auto']);
      swap(drawer, ['translate-x-full'], ['translate-x-0']);
    } else {
      lines[0].classList.remove('rotate-45', 'translate-y-[7px]');
      lines[1].classList.remove('opacity-0');
      lines[2].classList.remove('-rotate-45', '-translate-y-[7px]');
      swap(overlay, ['opacity-100', 'pointer-events-auto'], ['opacity-0', 'pointer-events-none']);
      swap(drawer, ['translate-x-0'], ['translate-x-full']);
    }
    document.body.style.overflow = open ? 'hidden' : 'auto';
    $$('div.flex.flex-col.items-start > a', drawer).forEach(function (a) {
      a.style.opacity = open ? '1' : '0';
      a.style.transform = open ? 'translateX(0)' : 'translateX(30px)';
    });
    // animazione decorativa (Lottie) a sinistra del pannello, solo a menu aperto
    if (open && window.lottie && !lottieBox) {
      lottieBox = document.createElement('div');
      lottieBox.className = 'absolute left-[-199px] w-[200px] h-full filter invert pointer-events-none';
      drawer.insertBefore(lottieBox, drawer.firstChild);
      lottieAnim = lottie.loadAnimation({ container: lottieBox, renderer: 'svg', loop: false, autoplay: true, path: '/merity-preview/documents/menu-animation.json' });
    } else if (!open && lottieBox) {
      if (lottieAnim) lottieAnim.destroy();
      lottieBox.remove(); lottieBox = null; lottieAnim = null;
    }
  }
  if (menuBtn) {
    menuBtn.addEventListener('click', function () { setMenu(!menuOpen); });
    if (overlay) overlay.addEventListener('click', function () { setMenu(false); });
    var closeBtn = drawer && $(':scope > button', drawer);
    if (closeBtn) closeBtn.addEventListener('click', function () { setMenu(false); });
    $$('div.flex.flex-col.items-start > a', drawer).forEach(function (a) {
      a.addEventListener('click', function () { setMenu(false); });
    });
  }

  /* ------------------------------------------------------------------ *
   * 3. Selettore della lingua
   * ------------------------------------------------------------------ */
  var langBtn = $('button[aria-label="Changer de langue"]');
  if (langBtn) {
    var langList = langBtn.nextElementSibling;
    var chevron = $('svg', langBtn);
    var langOpen = false;
    langBtn.addEventListener('click', function () {
      langOpen = !langOpen;
      chevron.classList.toggle('rotate-180', langOpen);
      if (langOpen) swap(langList, ['max-h-0', 'opacity-0', 'border-0'], ['max-h-[200px]', 'opacity-100']);
      else swap(langList, ['max-h-[200px]', 'opacity-100'], ['max-h-0', 'opacity-0', 'border-0']);
    });
  }

  /* ------------------------------------------------------------------ *
   * 4. Slider della hero (Swiper, dissolvenza senza crossFade)
   * ------------------------------------------------------------------ */
  var hero = $('#accueil .swiper');
  if (hero && window.Swiper) {
    var counter = $$('#accueil > div:last-child > span')[0];
    var getSlide = function (swiper, index) {
      return $('.swiper-slide[data-swiper-slide-index="' + index + '"]', hero) || swiper.slides[index];
    };
    // i testi della slide uscente svaniscono subito, così non si sovrappongono a quelli della nuova
    var hideSlideTexts = function (swiper, index) {
      var slide = getSlide(swiper, index);
      if (!slide || !window.gsap) return;
      var texts = $$('.animate-text', slide), line = $('.animate-line', slide);
      gsap.killTweensOf([texts, line]);
      gsap.to(texts, { opacity: 0, duration: 0.4, ease: 'power1.out' });
      if (line) gsap.to(line, { scaleX: 0, duration: 0.4, ease: 'power1.out' });
    };
    var animateSlide = function (swiper, index) {
      var slide = getSlide(swiper, index);
      if (!slide || !window.gsap) return;
      var texts = $$('.animate-text', slide), line = $('.animate-line', slide);
      var bg = $('.bg-cover', slide);
      gsap.killTweensOf([texts, line]);
      gsap.timeline()
        .fromTo(texts, { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.9, stagger: 0.15, ease: 'power2.out' })
        .fromTo(line, { scaleX: 0 }, { scaleX: 1, duration: 0.7, ease: 'power2.out' }, '-=0.4');
      if (bg) gsap.fromTo(bg, { scale: 1.08 }, { scale: 1, duration: 6, ease: 'none' });
    };
    // i testi partono nascosti per evitare che compaiano prima dell'animazione
    if (window.gsap) {
      gsap.set($$('.animate-text', hero), { opacity: 0 });
      gsap.set($$('.animate-line', hero), { scaleX: 0 });
    }
    // Precarica e decodifica le foto di sfondo: con loop:true Swiper sposta le slide nel DOM
    // e un'immagine non ancora decodificata compare in ritardo (flash del solo gradiente).
    // I riferimenti restano in heroImages perché il browser tenga le immagini decodificate in memoria.
    var heroImages = [];
    var heroReady = Promise.all($$('.bg-cover', hero).map(function (bg) {
      var m = /url\(["']?([^"')]+)["']?\)/.exec(bg.style.backgroundImage);
      if (!m) return Promise.resolve();
      var img = new Image();
      img.src = m[1];
      heroImages.push(img);
      return (img.decode ? img.decode() : new Promise(function (ok) { img.onload = img.onerror = ok; }))
        .catch(function () {});
    }));
    var currentIndex = 0;
    var heroSwiper = new Swiper(hero, {
      effect: 'fade',
      fadeEffect: { crossFade: false },
      autoplay: { delay: 6000, disableOnInteraction: false },
      navigation: { nextEl: '.swiper-button-next-custom', prevEl: '.swiper-button-prev-custom' },
      pagination: {
        el: '.swiper-pagination-custom', clickable: true,
        bulletClass: 'swiper-pagination-bullet-custom', bulletActiveClass: 'swiper-pagination-bullet-active-custom'
      },
      loop: true,
      speed: 1200,
      on: {
        slideChange: function (s) {
          if (counter) counter.textContent = ('0' + (s.realIndex + 1)).slice(-2);
          if (currentIndex !== s.realIndex) hideSlideTexts(s, currentIndex);
          currentIndex = s.realIndex;
          animateSlide(s, s.realIndex);
        }
      }
    });
    // l'autoplay parte solo a immagini pronte (al massimo dopo 4 secondi, per non bloccare lo slider)
    heroSwiper.autoplay.stop();
    Promise.race([heroReady, new Promise(function (ok) { setTimeout(ok, 4000); })])
      .then(function () { heroSwiper.autoplay.start(); });
    setTimeout(function () { animateSlide(heroSwiper, 0); }, 300);
  }

  /* ------------------------------------------------------------------ *
   * 5. Blocchi che compaiono allo scroll (.fade-in-section)
   * ------------------------------------------------------------------ */
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) e.target.classList.add('is-visible'); });
    }, { threshold: 0.1 });
    $$('.fade-in-section').forEach(function (el) { io.observe(el); });
  } else {
    $$('.fade-in-section').forEach(function (el) { el.classList.add('is-visible'); });
  }

  /* ------------------------------------------------------------------ *
   * 6. Leitmotiv: barre di avanzamento legate allo scroll
   * ------------------------------------------------------------------ */
  var leitSticky = $$('div').filter(function (d) { return hasClass(d, 'sticky') && hasClass(d, 'top-[100px]'); })[0];
  if (leitSticky) {
    var bars = $$('div.absolute.inset-y-0.left-0', leitSticky);
    var features = $$(':scope > div.fade-in-section', leitSticky.nextElementSibling);
    var updateBars = function () {
      var h = window.innerHeight, start = 0.8 * h, end = 0.3 * h;
      features.forEach(function (f, i) {
        if (!bars[i]) return;
        var top = f.getBoundingClientRect().top;
        var p = top > start ? 0 : top < end ? 100 : Math.max(0, Math.min(100, (start - top) / (start - end) * 100));
        bars[i].style.width = p + '%';
      });
    };
    window.addEventListener('scroll', updateBars, { passive: true });
    updateBars();
  }

  /* ------------------------------------------------------------------ *
   * 7. Citazione ed expertise: animazioni allo scroll (GSAP ScrollTrigger)
   * ------------------------------------------------------------------ */
  var expert = $('#expert');
  if (expert && window.gsap && window.ScrollTrigger) {
    var quoteCard = $$(':scope > div', expert).filter(function (d) { return hasClass(d, 'rounded-[20px]'); })[0];
    var author = quoteCard && $('h1', quoteCard);
    if (quoteCard) gsap.fromTo(quoteCard, { opacity: 0, y: 60, scale: 0.95 }, { opacity: 1, y: 0, scale: 1, duration: 1.2, ease: 'power3.out', scrollTrigger: { trigger: quoteCard, start: 'top 80%', toggleActions: 'play none none none' } });
    if (author) gsap.fromTo(author, { opacity: 0, x: 100 }, { opacity: 1, x: 0, duration: 1, delay: 0.3, ease: 'power3.out', scrollTrigger: { trigger: author, start: 'top 80%', toggleActions: 'play none none none' } });

    var wrap = expert.parentElement;
    var dotsBox = $$(':scope > div', wrap).filter(function (d) { return hasClass(d, 'fixed'); })[0];
    var servicesSection = $$(':scope > section', wrap).filter(function (s) { return s !== expert; })[0];
    var dots = dotsBox ? $$('button', dotsBox) : [];
    var cards = servicesSection ? $$(':scope > div', servicesSection) : [];
    var DOT_ON = ['bg-[#c41945]', 'border-[#c41945]', 'scale-125'];
    var DOT_OFF = ['bg-white/50', 'border-white/70', 'hover:bg-white', 'hover:scale-110'];
    var setActive = function (i) { dots.forEach(function (d, j) { if (j === i) swap(d, DOT_OFF, DOT_ON); else swap(d, DOT_ON, DOT_OFF); }); };
    var setDots = function (v) {
      if (!dotsBox) return;
      if (v) swap(dotsBox, ['opacity-0', 'translate-x-4', 'pointer-events-none'], ['opacity-100', 'translate-x-0']);
      else swap(dotsBox, ['opacity-100', 'translate-x-0'], ['opacity-0', 'translate-x-4', 'pointer-events-none']);
    };
    if (servicesSection) {
      ScrollTrigger.create({ trigger: servicesSection, start: 'top center', end: 'bottom center',
        onEnter: function () { setDots(true); }, onLeave: function () { setDots(false); },
        onEnterBack: function () { setDots(true); }, onLeaveBack: function () { setDots(false); } });
    }
    var rev = { start: 'top 75%', end: 'top 25%', toggleActions: 'play none none reverse' };
    cards.forEach(function (card, i) {
      ScrollTrigger.create({ trigger: card, start: 'top center', end: 'bottom center',
        onEnter: function () { setActive(i); }, onEnterBack: function () { setActive(i); } });
      var c = $('.service-card', card), t = $('.service-title', card), l = $('.service-line', card), s = $('.service-subtitle', card);
      var st = function () { return Object.assign({ trigger: card }, rev); };
      if (c) gsap.fromTo(c, { opacity: 0, y: 80, scale: 0.92 }, { opacity: 1, y: 0, scale: 1, duration: 0.8, ease: 'power3.out', scrollTrigger: st() });
      if (t) gsap.fromTo(t, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.6, delay: 0.15, ease: 'power3.out', scrollTrigger: st() });
      if (l) gsap.fromTo(l, { scaleX: 0 }, { scaleX: 1, duration: 0.6, delay: 0.3, ease: 'power3.out', scrollTrigger: st() });
      if (s) gsap.fromTo(s, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.5, delay: 0.4, ease: 'power3.out', scrollTrigger: st() });
    });
    dots.forEach(function (d, i) {
      d.addEventListener('click', function () { if (cards[i]) cards[i].scrollIntoView({ behavior: 'smooth', block: 'center' }); });
    });
  }

  /* ------------------------------------------------------------------ *
   * 8. Contatti: animazioni e invio del modulo a /api/contact
   * ------------------------------------------------------------------ */
  var contact = $('#contact');
  if (contact) {
    var grid = $(':scope > div', contact);
    var card = grid && grid.children[0], map = grid && grid.children[1];
    if (window.gsap && window.ScrollTrigger) {
      if (card) gsap.fromTo(card, { opacity: 0, y: 60, scale: 0.95 }, { opacity: 1, y: 0, scale: 1, duration: 0.8, ease: 'power3.out', scrollTrigger: { trigger: card, start: 'top 80%', end: 'bottom 20%', toggleActions: 'play none none reverse' } });
      if (map) gsap.fromTo(map, { opacity: 0, y: 80, scale: 0.9 }, { opacity: 1, y: 0, scale: 1, duration: 1, ease: 'power3.out', scrollTrigger: { trigger: map, start: 'top 90%', end: 'bottom 20%', toggleActions: 'play none none reverse' } });
    }

    var form = $('form', contact);
    if (form) {
      var holder = form.parentElement;
      var submitBtn = $('button[type="submit"]', form);
      var submitLabel = submitBtn && $('span.relative', submitBtn);
      var fields = $$('input, textarea, button', form);
      var pending = null, busy = false;
      var uuid = function () {
        return (window.crypto && crypto.randomUUID) ? crypto.randomUUID()
          : 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) { var r = Math.random() * 16 | 0; return (c === 'x' ? r : (r & 3 | 8)).toString(16); });
      };
      var esc = function (s) { return String(s).replace(/[&<>"']/g, function (c) { return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]; }); };
      var setBusy = function (b) {
        busy = b;
        fields.forEach(function (f) { f.disabled = b; });
        if (submitLabel) submitLabel.innerHTML = b
          ? '<span class="flex items-center gap-2"><svg class="animate-spin h-5 w-5" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>' + esc(TEXTS.submitting) + '</span>'
          : esc(TEXTS.submit);
      };
      var showSuccess = function () {
        holder.innerHTML = '<div role="status" class="text-[#12b878] text-center bg-[#12b878]/10 border border-[#12b878]/30 rounded-xl w-full py-6 px-6 text-sm font-medium leading-6 animate-pulse"><svg class="w-12 h-12 mx-auto mb-3 text-[#12b878]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>' + esc(TEXTS.success) + '</div>';
        if (window.gsap && card) gsap.to(card, { scale: 1.02, duration: 0.2, yoyo: true, repeat: 1, ease: 'power2.inOut' });
      };
      var showError = function () {
        holder.innerHTML = '<div class="flex flex-col gap-4"><div role="alert" class="text-[#db4b68] text-center bg-[#db4b68]/10 border border-[#db4b68]/30 rounded-xl w-full py-4 px-5 text-sm font-medium leading-5">' + esc(TEXTS.error) + '</div><button type="button" class="text-[#c41945] text-center uppercase bg-white border-2 border-[#c41945] font-[\'Quicksand\'] font-semibold text-sm tracking-[3px] py-4 px-6 rounded-xl cursor-pointer transition-all duration-300 hover:bg-[#c41945] hover:text-white hover:shadow-lg hover:shadow-[#c41945]/25">' + esc(TEXTS.retry) + '</button></div>';
        $('button', holder).addEventListener('click', function () { holder.innerHTML = ''; holder.appendChild(form); });
      };
      // ANTEPRIMA GITHUB PAGES: niente PHP, il modulo non invia nulla
      var previewNote = document.createElement('p');
      previewNote.setAttribute('role', 'status');
      previewNote.className = 'text-[#c41945] text-center bg-[#c41945]/10 border border-[#c41945]/30 rounded-xl w-full py-3 px-4 text-sm font-medium leading-5';
      previewNote.textContent = {fr:'Aperçu : le formulaire est désactivé sur cette version de démonstration.',it:'Anteprima: il modulo è disattivato in questa versione dimostrativa.',en:'Preview: the form is disabled on this demo version.'}[lang];
      form.insertBefore(previewNote, form.firstChild);
      if (submitBtn) submitBtn.disabled = true;
      form.addEventListener('submit', function (e) { e.preventDefault(); });
      if (false) form.addEventListener('submit', function (e) {
        e.preventDefault();
        if (busy) return;
        var data = {
          name: form.elements.name.value.trim(), email: form.elements.email.value.trim(),
          message: form.elements.message.value.trim(), privacy: form.elements.privacyAcknowledged.checked,
          website: form.elements.website ? form.elements.website.value : ''
        };
        if (!data.privacy || !data.name || !data.email || !data.message) { showError(); return; }
        var signature = JSON.stringify([data.name, data.email, data.message, lang]);
        if (!pending || pending.signature !== signature) pending = { signature: signature, id: uuid() };
        setBusy(true);
        fetch('/api/contact', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ privacyAcknowledged: data.privacy, website: data.website, lang: lang, requestId: pending.id, name: data.name, email: data.email, message: data.message })
        }).then(function (r) {
          if (!r.ok) throw new Error('HTTP ' + r.status);
          setBusy(false); form.reset(); pending = null; showSuccess();
        }).catch(function (err) {
          console.error('Errore invio modulo:', err);
          setBusy(false); showError();
        });
      });
    }
  }
})();
