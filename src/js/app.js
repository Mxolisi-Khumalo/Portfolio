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
   4. Hero portrait — cursor-driven phase reveal
   ------------------------------------------------------------ */
(function heroPhase() {
    const portrait = document.getElementById('heroPortrait');
    if (!portrait) return;
    // Desktop: CSS :hover slowly cross-fades the whole second image in.
    // Touch: tap toggles the reveal (auto-reverts after a beat).
    if (!finePointer) {
        let t;
        portrait.addEventListener('click', () => {
            portrait.classList.toggle('show-reveal');
            clearTimeout(t);
            if (portrait.classList.contains('show-reveal')) {
                t = setTimeout(() => portrait.classList.remove('show-reveal'), 3000);
            }
        });
    }
})();

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
    if (el.dataset.counted) return;
    el.dataset.counted = '1';
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
// IntersectionObserver — reliable regardless of smooth-scroll / ScrollTrigger
if (!prefersReduced && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
        entries.forEach(e => { if (e.isIntersecting) { animateCounter(e.target); io.unobserve(e.target); } });
    }, { threshold: 0.35 });
    document.querySelectorAll('[data-count]').forEach(el => io.observe(el));
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
   11. Lightbox (single image / video) + Event galleries
   ------------------------------------------------------------ */
const lightbox = document.getElementById('lightbox');
const lbImg = document.getElementById('lightbox-img');
const lbVideo = document.getElementById('lightbox-video');
const lbSrc = document.getElementById('lightbox-video-source');
const lbCap = document.getElementById('lightbox-caption');
const lbPrev = document.getElementById('lightbox-prev');
const lbNext = document.getElementById('lightbox-next');
const lbCounter = document.getElementById('lightbox-counter');

// Field Notes / event image sets. Each item: [src, caption]
const GALLERIES = {
    mentor: {
        title: 'Stepping up as Technical Mentor · WeThinkCode_',
        images: [
            ['src/pictures/events/mentor-1.jpg', 'Deriving the pixel-gradient formula on the whiteboard'],
            ['src/pictures/events/mentor-2.jpg', 'A community mentoring session'],
            ['src/pictures/events/mentor-3.jpg', 'Technical Mentor · WeThinkCode_'],
            ['src/pictures/events/mentor-4.jpg', 'Technical Mentor · WeThinkCode_'],
            ['src/pictures/events/mentor-5.jpg', 'Technical Mentor · WeThinkCode_']
        ]
    },
    bootcamp: {
        title: 'Mentoring 115+ at the JHB Bootcamp',
        images: [
            ['src/pictures/events/bootcamp-1.jpg', 'Guiding students through their final project'],
            ['src/pictures/events/bootcamp-2.jpg', 'Bootcamp students passing their tests'],
            ['src/pictures/events/bootcamp-3.jpg', 'Reviewing student projects'],
            ['src/pictures/events/bootcamp-4.jpg', 'In the lab'],
            ['src/pictures/events/bootcamp-5.jpg', 'In the lab']
        ]
    },
    microsoft: {
        title: "Microsoft SA · AI Skilling Day, Gallagher Convention",
        images: [
            ['src/pictures/events/microsoft-1.jpg', 'Microsoft AI Skilling Day'],
            ['src/pictures/events/microsoft-2.jpg', 'Skilling Day attendee tag'],
            ['src/pictures/events/microsoft-3.jpg', 'Keynote · AI for financial services & social impact'],
            ['src/pictures/events/microsoft-4.jpg', 'Microsoft AI Skilling Day']
        ]
    },
    sage: {
        title: 'Unlocking AI: Learning & Career Pathways · Sage',
        images: [
            ['src/pictures/events/sage-1.jpg', 'The cohort at Sage'],
            ['src/pictures/events/sage-2.jpg', 'Unlocking AI · Sage'],
            ['src/pictures/events/sage-3.jpg', 'Unlocking AI · Sage'],
            ['src/pictures/events/sage-4.jpg', 'Unlocking AI · Sage'],
            ['src/pictures/events/sage-5.jpg', 'Unlocking AI · Sage'],
            ['src/pictures/events/sage-6.jpg', 'Unlocking AI · Sage']
        ]
    },
    momentum: {
        title: 'TechTalent Youth Day · Momentum Group, Centurion',
        images: [
            ['src/pictures/events/momentum-1.jpg', 'TechTalent Youth Day · Momentum'],
            ['src/pictures/events/momentum-2.jpg', 'TechTalent Youth Day — 19 June 2025'],
            ['src/pictures/events/momentum-3.jpg', 'TechTalent Youth Day · Momentum'],
            ['src/pictures/events/momentum-4.jpg', 'TechTalent Youth Day · Momentum'],
            ['src/pictures/events/momentum-5.jpg', 'Thank you — Mxolisi was here'],
            ['src/pictures/events/momentum-6.jpg', 'TechTalent Youth Day · Momentum']
        ]
    }
};

let galleryList = null;   // array of [src, caption]
let galleryIndex = 0;

function showMedia(source, caption, isVideo) {
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
}

function updateNav() {
    const multi = galleryList && galleryList.length > 1;
    [lbPrev, lbNext, lbCounter].forEach(el => el && el.classList.toggle('is-hidden', !multi));
    if (multi && lbCounter) lbCounter.textContent = (galleryIndex + 1) + ' / ' + galleryList.length;
}

function openLB() {
    lightbox.classList.add('is-open');
    requestAnimationFrame(() => lightbox.style.opacity = '1');
    if (lenis) lenis.stop();
    document.body.style.overflow = 'hidden';
}

window.openLightbox = function (source, caption, isVideo = false) {
    if (!lightbox) return;
    galleryList = null; galleryIndex = 0;
    showMedia(source, caption, isVideo);
    updateNav();
    openLB();
};

window.openGallery = function (key) {
    if (!lightbox) return;
    const g = GALLERIES[key];
    if (!g) return;
    galleryList = g.images; galleryIndex = 0;
    const [src, cap] = galleryList[0];
    showMedia(src, (g.title ? g.title + ' — ' : '') + cap, false);
    updateNav();
    openLB();
};

window.galleryStep = function (dir) {
    if (!galleryList) return;
    galleryIndex = (galleryIndex + dir + galleryList.length) % galleryList.length;
    const [src, cap] = galleryList[galleryIndex];
    showMedia(src, cap, false);
    updateNav();
};

window.closeLightbox = function () {
    if (!lightbox) return;
    lightbox.style.opacity = '0';
    setTimeout(() => {
        lightbox.classList.remove('is-open');
        lbImg.src = ''; lbVideo.pause(); lbSrc.src = '';
        galleryList = null;
        document.body.style.overflow = '';
        if (lenis) lenis.start();
    }, 300);
};

if (lightbox) lightbox.addEventListener('click', (e) => { if (e.target === lightbox || e.target.classList.contains('lb-close')) closeLightbox(); });
document.addEventListener('keydown', (e) => {
    if (!lightbox || !lightbox.classList.contains('is-open')) return;
    if (e.key === 'Escape') closeLightbox();
    else if (e.key === 'ArrowRight') galleryStep(1);
    else if (e.key === 'ArrowLeft') galleryStep(-1);
});
// Swipe support (touch)
if (lightbox) {
    let sx = 0;
    lightbox.addEventListener('touchstart', (e) => { sx = e.changedTouches[0].clientX; }, { passive: true });
    lightbox.addEventListener('touchend', (e) => {
        const dx = e.changedTouches[0].clientX - sx;
        if (Math.abs(dx) > 50) galleryStep(dx < 0 ? 1 : -1);
    }, { passive: true });
}

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
        gsap.fromTo(vbg, { yPercent: -7 }, {
            yPercent: 7, ease: 'none',
            scrollTrigger: { trigger: '.vision', start: 'top bottom', end: 'bottom top', scrub: true }
        });
    }
    // Editorial image: pan through the FULL image (top -> bottom) as it scrolls past
    gsap.utils.toArray('[data-pan]').forEach(el => {
        gsap.fromTo(el, { objectPosition: '50% 0%' }, {
            objectPosition: '50% 100%', ease: 'none',
            scrollTrigger: { trigger: el.closest('section') || el, start: 'top bottom', end: 'bottom top', scrub: true }
        });
    });
}

/* ------------------------------------------------------------
   14. Horizontal pinned scroll (Field Notes + Journey)
   ------------------------------------------------------------ */
function setupHorizontal(sectionId, viewportId, trackId, barId) {
    const section = document.getElementById(sectionId);
    const viewport = document.getElementById(viewportId);
    const track = document.getElementById(trackId);
    const bar = barId ? document.getElementById(barId) : null;
    if (!section || !viewport || !track) return;

    const canPin = window.gsap && window.ScrollTrigger && !prefersReduced && finePointer && window.innerWidth > 820;

    if (!canPin) {
        // Native horizontal swipe fallback (touch / reduced motion / small screens)
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
}
setupHorizontal('journey', 'jrViewport', 'jrTrack', 'jrBar');
setupHorizontal('notes', 'fnViewport', 'fnTrack', 'fnBar');

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
