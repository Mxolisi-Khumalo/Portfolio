/* ============================================================
   MXOLISI KHUMALO — Portfolio interactions
   GSAP + ScrollTrigger + Lenis smooth scroll
   ============================================================ */

const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

/* ------------------------------------------------------------
   0. Preloader
   ------------------------------------------------------------ */
(function preloader() {
    const pre = document.getElementById('preloader');
    if (!pre) return;
    const countEl = pre.querySelector('.pre-count');
    const fill = pre.querySelector('.pre-bar__fill');
    let n = 0;

    const finish = () => {
        document.body.classList.remove('is-loading');
        if (window.gsap) {
            gsap.to(pre, { yPercent: -100, duration: 1, ease: 'power4.inOut',
                onComplete: () => { pre.style.display = 'none'; startHeroIntro(); } });
        } else {
            pre.style.display = 'none';
            startHeroIntro();
        }
    };

    if (prefersReduced) { countEl.innerHTML = '100<span>%</span>'; fill.style.width = '100%'; finish(); return; }

    const tick = () => {
        n += Math.floor(Math.random() * 8) + 3;
        if (n >= 100) n = 100;
        countEl.innerHTML = n + '<span>%</span>';
        fill.style.width = n + '%';
        if (n < 100) setTimeout(tick, 90 + Math.random() * 110);
        else setTimeout(finish, 350);
    };
    setTimeout(tick, 250);
})();

/* ------------------------------------------------------------
   1. Lenis smooth scroll  (+ GSAP ScrollTrigger sync)
   ------------------------------------------------------------ */
let lenis = null;
if (window.Lenis && !prefersReduced) {
    lenis = new Lenis({ duration: 1.1, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), smoothWheel: true });
    lenis.on('scroll', () => { if (window.ScrollTrigger) ScrollTrigger.update(); });
    function raf(time) { lenis.raf(time); requestAnimationFrame(raf); }
    requestAnimationFrame(raf);
    window.lenis = lenis; // exposed for programmatic scrolling / debugging
}

if (window.gsap && window.ScrollTrigger) gsap.registerPlugin(ScrollTrigger);

/* Anchor links -> smooth scroll */
document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', (e) => {
        const id = a.getAttribute('href');
        if (id.length < 2) return;
        const target = document.querySelector(id);
        if (!target) return;
        e.preventDefault();
        if (lenis) lenis.scrollTo(target, { offset: -40 });
        else target.scrollIntoView({ behavior: 'smooth' });
    });
});

/* ------------------------------------------------------------
   2. Custom cursor + spotlight
   ------------------------------------------------------------ */
if (finePointer) {
    const dot = document.querySelector('.cursor-dot');
    const outline = document.querySelector('.cursor-outline');
    let mx = window.innerWidth / 2, my = window.innerHeight / 2;
    let ox = mx, oy = my;

    window.addEventListener('mousemove', (e) => {
        mx = e.clientX; my = e.clientY;
        if (dot) { dot.style.left = mx + 'px'; dot.style.top = my + 'px'; }
        // spotlight
        document.documentElement.style.setProperty('--mx', mx + 'px');
        document.documentElement.style.setProperty('--my', my + 'px');
    });

    const loop = () => {
        ox += (mx - ox) * 0.18; oy += (my - oy) * 0.18;
        if (outline) { outline.style.left = ox + 'px'; outline.style.top = oy + 'px'; }
        requestAnimationFrame(loop);
    };
    loop();

    const hoverEls = document.querySelectorAll('a, button, .hover-trigger, .project, .activity, .award, .portrait, .duo-card, .tool');
    hoverEls.forEach(el => {
        el.addEventListener('mouseenter', () => {
            document.body.classList.add('cursor-hover');
            const label = el.getAttribute('data-cursor');
            if (label && outline) { outline.classList.add('cursor-label'); outline.setAttribute('data-label', label); }
        });
        el.addEventListener('mouseleave', () => {
            document.body.classList.remove('cursor-hover');
            if (outline) { outline.classList.remove('cursor-label'); outline.removeAttribute('data-label'); }
        });
    });
}

/* ------------------------------------------------------------
   3. Magnetic buttons
   ------------------------------------------------------------ */
if (finePointer && window.gsap) {
    document.querySelectorAll('[data-magnetic]').forEach(el => {
        el.addEventListener('mousemove', (e) => {
            const r = el.getBoundingClientRect();
            const x = e.clientX - (r.left + r.width / 2);
            const y = e.clientY - (r.top + r.height / 2);
            gsap.to(el, { x: x * 0.35, y: y * 0.4, duration: 0.5, ease: 'power3.out' });
        });
        el.addEventListener('mouseleave', () => gsap.to(el, { x: 0, y: 0, duration: 0.6, ease: 'elastic.out(1, 0.4)' }));
    });
}

/* ------------------------------------------------------------
   4. Hero portrait 3D tilt
   ------------------------------------------------------------ */
if (finePointer && window.gsap) {
    const portrait = document.querySelector('.portrait');
    if (portrait) {
        window.addEventListener('mousemove', (e) => {
            const xVal = (e.clientX / window.innerWidth - 0.5) * 2;
            const yVal = (e.clientY / window.innerHeight - 0.5) * 2;
            gsap.to(portrait, { duration: 0.6, rotationY: xVal * 12, rotationX: -yVal * 12,
                ease: 'power2.out', transformPerspective: 900, transformOrigin: 'center' });
        });
    }
}

/* ------------------------------------------------------------
   5. Hero intro (called after preloader)
   ------------------------------------------------------------ */
function startHeroIntro() {
    if (!window.gsap) return;
    const tl = gsap.timeline({ defaults: { ease: 'power4.out' } });
    tl.from('.hero-title .line span', { yPercent: 120, duration: 1.2, stagger: 0.12 })
      .from('.hero-meta', { opacity: 0, y: 20, duration: 0.8 }, '-=0.7')
      .from('.hero-lead, .hero-socials', { opacity: 0, y: 24, duration: 0.9, stagger: 0.12 }, '-=0.6')
      .from('.portrait', { opacity: 0, scale: 0.94, duration: 1.1 }, '-=0.9')
      .from('.scroll-cue', { opacity: 0, duration: 0.8 }, '-=0.4');
}
if (prefersReduced) { /* ensure content visible */ document.body.classList.remove('is-loading'); }

/* ------------------------------------------------------------
   6. Scroll reveals
   ------------------------------------------------------------ */
if (window.gsap && window.ScrollTrigger && !prefersReduced) {
    gsap.utils.toArray('.reveal').forEach(el => {
        ScrollTrigger.create({
            trigger: el, start: 'top 88%',
            onEnter: () => el.classList.add('is-in'),
        });
    });

    // Section titles: split into lines already; simple upward reveal
    gsap.utils.toArray('.section-head h2').forEach(h => {
        gsap.from(h, { scrollTrigger: { trigger: h, start: 'top 90%' }, yPercent: 40, opacity: 0, duration: 1, ease: 'power4.out' });
    });

    // Projects stagger
    gsap.utils.toArray('.project').forEach(card => {
        gsap.from(card, { scrollTrigger: { trigger: card, start: 'top 88%' }, y: 50, opacity: 0, duration: 0.9, ease: 'power3.out' });
    });
} else {
    document.querySelectorAll('.reveal').forEach(el => el.classList.add('is-in'));
}

/* ------------------------------------------------------------
   7. Timeline draw + node activation
   ------------------------------------------------------------ */
if (window.gsap && window.ScrollTrigger && !prefersReduced) {
    const fill = document.querySelector('.spine__fill');
    if (fill) {
        gsap.to(fill, {
            height: '100%', ease: 'none',
            scrollTrigger: { trigger: '.timeline', start: 'top 60%', end: 'bottom 70%', scrub: true }
        });
    }
    gsap.utils.toArray('.tl-item').forEach(item => {
        ScrollTrigger.create({ trigger: item, start: 'top 75%', onEnter: () => item.classList.add('is-in') });
        gsap.from(item, { scrollTrigger: { trigger: item, start: 'top 82%' }, opacity: 0, y: 30, duration: 0.8, ease: 'power3.out' });
    });
} else {
    document.querySelectorAll('.tl-item').forEach(i => i.classList.add('is-in'));
}

/* ------------------------------------------------------------
   8. Animated counters
   ------------------------------------------------------------ */
function animateCounter(el) {
    const target = parseFloat(el.getAttribute('data-count'));
    const dec = (el.getAttribute('data-decimals') | 0);
    const dur = 1600; const start = performance.now();
    const step = (now) => {
        const p = Math.min((now - start) / dur, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        el.textContent = (target * eased).toFixed(dec);
        if (p < 1) requestAnimationFrame(step);
        else el.textContent = target.toFixed(dec);
    };
    requestAnimationFrame(step);
}
if (window.ScrollTrigger && !prefersReduced) {
    document.querySelectorAll('[data-count]').forEach(el => {
        ScrollTrigger.create({ trigger: el, start: 'top 90%', once: true, onEnter: () => animateCounter(el) });
    });
} else {
    document.querySelectorAll('[data-count]').forEach(el => {
        const dec = (el.getAttribute('data-decimals') | 0);
        el.textContent = parseFloat(el.getAttribute('data-count')).toFixed(dec);
    });
}

/* ------------------------------------------------------------
   9. Award card glow follows mouse
   ------------------------------------------------------------ */
document.querySelectorAll('.award').forEach(card => {
    card.addEventListener('mousemove', (e) => {
        const r = card.getBoundingClientRect();
        card.style.setProperty('--lx', (e.clientX - r.left) + 'px');
        card.style.setProperty('--ly', (e.clientY - r.top) + 'px');
    });
});

/* ------------------------------------------------------------
   10. Nav: hide on scroll down, show on up + solid bg
   ------------------------------------------------------------ */
(function navBehavior() {
    const nav = document.querySelector('.nav');
    const progress = document.getElementById('progress');
    if (!nav) return;
    let last = 0;
    const onScroll = () => {
        const y = window.scrollY || window.pageYOffset;
        nav.classList.toggle('nav--solid', y > 60);
        if (y > last && y > 300) nav.classList.add('nav--hidden');
        else nav.classList.remove('nav--hidden');
        last = y;
        if (progress) {
            const h = document.documentElement.scrollHeight - window.innerHeight;
            progress.style.width = (h > 0 ? (y / h) * 100 : 0) + '%';
        }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    if (lenis) lenis.on('scroll', onScroll);
    onScroll();
})();

/* ------------------------------------------------------------
   11. Lightbox (image + video)
   ------------------------------------------------------------ */
const lightbox = document.getElementById('lightbox');
const lbImg = document.getElementById('lightbox-img');
const lbVideo = document.getElementById('lightbox-video');
const lbSrc = document.getElementById('lightbox-video-source');
const lbCap = document.getElementById('lightbox-caption');

window.openLightbox = function (source, caption, isVideo = false) {
    if (!lightbox) return;
    lbCap.textContent = caption || '';
    lbImg.classList.add('hidden-media');
    lbVideo.classList.add('hidden-media');
    lbVideo.pause();

    if (isVideo) {
        lbVideo.classList.remove('hidden-media');
        lbSrc.src = source; lbVideo.load(); lbVideo.play().catch(() => {});
    } else {
        lbImg.classList.remove('hidden-media');
        lbImg.src = source;
    }
    lightbox.classList.add('is-open');
    requestAnimationFrame(() => lightbox.style.opacity = '1');
    if (lenis) lenis.stop();
    document.body.style.overflow = 'hidden';
};

window.closeLightbox = function () {
    if (!lightbox) return;
    lightbox.style.opacity = '0';
    setTimeout(() => {
        lightbox.classList.remove('is-open');
        lbImg.src = ''; lbVideo.pause(); lbSrc.src = '';
        document.body.style.overflow = '';
        if (lenis) lenis.start();
    }, 300);
};

if (lightbox) lightbox.addEventListener('click', (e) => { if (e.target === lightbox || e.target.classList.contains('lb-close')) closeLightbox(); });
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeLightbox(); });

/* ------------------------------------------------------------
   12. Year in footer
   ------------------------------------------------------------ */
document.querySelectorAll('[data-year]').forEach(el => { el.textContent = new Date().getFullYear(); });

/* ------------------------------------------------------------
   13. Vision parallax background
   ------------------------------------------------------------ */
if (window.gsap && window.ScrollTrigger && !prefersReduced) {
    const vbg = document.querySelector('.vision__bg');
    if (vbg) {
        gsap.fromTo(vbg, { yPercent: -12 }, {
            yPercent: 12, ease: 'none',
            scrollTrigger: { trigger: '.vision', start: 'top bottom', end: 'bottom top', scrub: true }
        });
    }
    // Generic data-parallax elements (e.g. editorial image)
    gsap.utils.toArray('[data-parallax]').forEach(el => {
        const amt = parseFloat(el.getAttribute('data-parallax')) || 0.1;
        gsap.fromTo(el, { yPercent: -amt * 100 }, {
            yPercent: amt * 100, ease: 'none',
            scrollTrigger: { trigger: el.closest('section') || el, start: 'top bottom', end: 'bottom top', scrub: true }
        });
    });
}

/* ------------------------------------------------------------
   14. Field Notes — horizontal scroll (pin) with fallback
   ------------------------------------------------------------ */
(function fieldNotes() {
    const section = document.getElementById('notes');
    const viewport = document.getElementById('fnViewport');
    const track = document.getElementById('fnTrack');
    const bar = document.getElementById('fnBar');
    if (!section || !viewport || !track) return;

    const canPin = window.gsap && window.ScrollTrigger && !prefersReduced && finePointer && window.innerWidth > 820;

    if (!canPin) {
        // Native horizontal scroll fallback (touch / reduced motion / small screens)
        viewport.classList.add('is-native');
        if (bar) {
            const update = () => {
                const max = track.scrollWidth - viewport.clientWidth;
                bar.style.width = (max > 0 ? (viewport.scrollLeft / max) * 100 : 0) + '%';
            };
            viewport.addEventListener('scroll', update, { passive: true });
            update();
        }
        return;
    }

    const getAmount = () => Math.max(0, track.scrollWidth - viewport.clientWidth);
    gsap.to(track, {
        x: () => -getAmount(),
        ease: 'none',
        scrollTrigger: {
            trigger: section,
            start: 'top top',
            end: () => '+=' + getAmount(),
            pin: true,
            scrub: 1,
            invalidateOnRefresh: true,
            onUpdate: (self) => { if (bar) bar.style.width = (self.progress * 100) + '%'; }
        }
    });
})();

/* ------------------------------------------------------------
   15. Cert categories reveal
   ------------------------------------------------------------ */
if (window.gsap && window.ScrollTrigger && !prefersReduced) {
    gsap.utils.toArray('.cert-cat').forEach((cat, i) => {
        gsap.from(cat, { scrollTrigger: { trigger: cat, start: 'top 90%' }, opacity: 0, y: 40, duration: 0.8, ease: 'power3.out', delay: (i % 2) * 0.08 });
    });
}

/* Refresh ScrollTrigger once everything (images) settled */
window.addEventListener('load', () => { if (window.ScrollTrigger) ScrollTrigger.refresh(); });
