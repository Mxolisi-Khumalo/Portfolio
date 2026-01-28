gsap.registerPlugin(ScrollTrigger);

// 1. Cursor Logic
const cursorDot = document.querySelector('.cursor-dot');
const cursorOutline = document.querySelector('.cursor-outline');
const hoverTriggers = document.querySelectorAll('.hover-trigger, .project-card, .tilt-image, .activity-card');

window.addEventListener('mousemove', (e) => {
    cursorDot.style.left = `${e.clientX}px`;
    cursorDot.style.top = `${e.clientY}px`;
    cursorOutline.animate({ left: `${e.clientX}px`, top: `${e.clientY}px` }, { duration: 500, fill: "forwards" });
});

hoverTriggers.forEach(link => {
    link.addEventListener('mouseenter', () => {
        cursorOutline.style.width = '60px';
        cursorOutline.style.height = '60px';
        cursorOutline.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
    });
    link.addEventListener('mouseleave', () => {
        cursorOutline.style.width = '40px';
        cursorOutline.style.height = '40px';
        cursorOutline.style.backgroundColor = 'transparent';
    });
});

// 2. 3D Tilt
const profileImg = document.getElementById('profile-img');
window.addEventListener('mousemove', (e) => {
    if (!profileImg) return;
    const xVal = (e.clientX / window.innerWidth - 0.5) * 2; 
    const yVal = (e.clientY / window.innerHeight - 0.5) * 2;
    gsap.to(profileImg, {
        duration: 0.5,
        rotationY: xVal * 15,
        rotationX: -yVal * 15,
        ease: "power2.out",
        transformPerspective: 900,
        transformOrigin: "center center"
    });
});

// 3. GSAP Animations
gsap.from(".reveal-text span", { y: 200, duration: 1.5, ease: "power4.out", stagger: 0.2 });
gsap.from(".fade-in", { opacity: 0, y: 30, duration: 1, delay: 0.8, stagger: 0.2 });
gsap.utils.toArray('.project-card').forEach(card => {
    gsap.from(card, {
        scrollTrigger: { trigger: card, start: "top 85%", toggleActions: "play none none reverse" },
        y: 50, opacity: 0, duration: 0.8
    });
});

// 4. Advanced Lightbox Logic (Handles Video + Image)
const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightbox-img');
const lightboxVideo = document.getElementById('lightbox-video');
const lightboxVideoSource = document.getElementById('lightbox-video-source');
const lightboxCaption = document.getElementById('lightbox-caption');

function openLightbox(source, caption, isVideo = false) {
    lightboxCaption.textContent = caption;

    // Reset visibility
    lightboxImg.classList.add('hidden-media');
    lightboxImg.style.display = 'none';
    lightboxVideo.classList.add('hidden-media');
    lightboxVideo.style.display = 'none';
    lightboxVideo.pause();

    if (isVideo) {
        // Setup Video
        lightboxVideo.style.display = 'block';
        lightboxVideo.classList.remove('hidden-media');
        lightboxVideoSource.src = source;
        lightboxVideo.load(); // Load the new source
        lightboxVideo.play(); // Auto-play
    } else {
        // Setup Image
        lightboxImg.style.display = 'block';
        lightboxImg.classList.remove('hidden-media');
        lightboxImg.src = source;
    }

    // Show Modal
    lightbox.classList.remove('hidden', 'pointer-events-none');
    setTimeout(() => lightbox.classList.remove('opacity-0'), 10);
    document.body.style.overflow = 'hidden';
}

function closeLightbox() {
    lightbox.classList.add('opacity-0');
    setTimeout(() => {
        lightbox.classList.add('hidden', 'pointer-events-none');
        
        // Cleanup
        lightboxImg.src = '';
        lightboxVideo.pause();
        lightboxVideoSource.src = '';
        
        document.body.style.overflow = 'auto';
    }, 300);
}

document.addEventListener('keydown', (e) => { 
    if (e.key === "Escape") closeLightbox(); 
});