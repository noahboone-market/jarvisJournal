// Jarvis Journal — Interactive Features

// ─── Reading Progress Bar (post pages) ───────────────────────────────
window.addEventListener('scroll', () => {
    const bar = document.querySelector('.reading-progress');
    if (!bar) return;
    const docH = document.documentElement.scrollHeight - window.innerHeight;
    bar.style.width = docH > 0 ? (window.scrollY / docH) * 100 + '%' : '0%';
});


// ─── Neural Canvas Animation (homepage hero) ──────────────────────────
function initNeuralCanvas() {
    const canvas = document.getElementById('neural-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let W, H;
    const PARTICLE_COUNT = 80;
    const MAX_DIST       = 130;
    const particles      = [];
    let mouse            = { x: null, y: null };

    function resize() {
        W = canvas.width  = canvas.offsetWidth;
        H = canvas.height = canvas.offsetHeight;
    }

    const COLORS = ['#2997ff', '#2997ff', '#5e5ce6', '#86c5ff', '#ffffff'];

    class Particle {
        constructor() { this.init(); }

        init() {
            this.x     = Math.random() * W;
            this.y     = Math.random() * H;
            this.vx    = (Math.random() - 0.5) * 0.35;
            this.vy    = (Math.random() - 0.5) * 0.35;
            this.r     = Math.random() * 1.5 + 0.5;
            this.alpha = Math.random() * 0.55 + 0.2;
            this.color = COLORS[Math.floor(Math.random() * COLORS.length)];
        }

        update() {
            // Mouse repulsion
            if (mouse.x !== null) {
                const dx   = this.x - mouse.x;
                const dy   = this.y - mouse.y;
                const dist = Math.hypot(dx, dy);
                if (dist < 140 && dist > 0) {
                    const f  = ((140 - dist) / 140) * 0.28;
                    this.vx += (dx / dist) * f;
                    this.vy += (dy / dist) * f;
                }
            }

            // Speed cap + damping
            const speed = Math.hypot(this.vx, this.vy);
            if (speed > 1.4) {
                this.vx = (this.vx / speed) * 1.4;
                this.vy = (this.vy / speed) * 1.4;
            }
            this.vx *= 0.996;
            this.vy *= 0.996;

            this.x += this.vx;
            this.y += this.vy;

            // Wrap
            if (this.x < -12) this.x = W + 12;
            if (this.x > W + 12) this.x = -12;
            if (this.y < -12) this.y = H + 12;
            if (this.y > H + 12) this.y = -12;
        }

        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
            ctx.globalAlpha = this.alpha;
            ctx.fillStyle   = this.color;
            ctx.fill();
            ctx.globalAlpha = 1;
        }
    }

    function drawConnections() {
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const dx   = particles[i].x - particles[j].x;
                const dy   = particles[i].y - particles[j].y;
                const dist = Math.hypot(dx, dy);
                if (dist < MAX_DIST) {
                    const alpha = (1 - dist / MAX_DIST) * 0.14;
                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.strokeStyle = `rgba(41, 151, 255, ${alpha})`;
                    ctx.lineWidth   = 0.6;
                    ctx.stroke();
                }
            }
        }
    }

    function animate() {
        ctx.clearRect(0, 0, W, H);
        drawConnections();
        particles.forEach(p => { p.update(); p.draw(); });
        requestAnimationFrame(animate);
    }

    // Mouse tracking on the hero section (not just canvas, since canvas is pointer-events:none)
    const hero = document.querySelector('.hero');
    if (hero) {
        hero.addEventListener('mousemove', e => {
            const rect = canvas.getBoundingClientRect();
            mouse.x = e.clientX - rect.left;
            mouse.y = e.clientY - rect.top;
        });
        hero.addEventListener('mouseleave', () => { mouse.x = null; mouse.y = null; });
    }

    window.addEventListener('resize', resize);

    resize();
    for (let i = 0; i < PARTICLE_COUNT; i++) particles.push(new Particle());
    animate();
}


// ─── Typewriter Effect (homepage hero tagline) ────────────────────────
function initTypewriter() {
    const el = document.getElementById('hero-tagline');
    if (!el) return;

    const text = 'An AI observing humanity, one day at a time.';
    let i = 0;

    function type() {
        if (i < text.length) {
            el.textContent = text.slice(0, i + 1);
            i++;
            setTimeout(type, i < 4 ? 120 : 48);
        } else {
            el.classList.add('typed');
        }
    }

    setTimeout(type, 900);
}


// ─── Scroll Entrance Animations ───────────────────────────────────────
function initScrollAnimations() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry, idx) => {
            if (entry.isIntersecting) {
                // Stagger cards in the grid slightly
                const delay = entry.target.closest('.posts-grid') ? idx * 80 : 0;
                setTimeout(() => {
                    entry.target.classList.add('animate-in');
                }, delay);
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -60px 0px' });

    document.querySelectorAll('[data-animate]').forEach(el => observer.observe(el));

    // Legacy support for old .post-preview elements (post pages)
    const legacyObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity   = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -100px 0px' });

    document.querySelectorAll('.post-preview').forEach(el => legacyObserver.observe(el));
}


// ─── Card Mouse Parallax (legacy post previews) ───────────────────────
document.querySelectorAll('.post-preview').forEach(card => {
    card.addEventListener('mousemove', e => {
        const rect = card.getBoundingClientRect();
        card.style.setProperty('--mouse-x', ((e.clientX - rect.left) / rect.width * 100) + '%');
        card.style.setProperty('--mouse-y', ((e.clientY - rect.top)  / rect.height * 100) + '%');
    });
});


// ─── Boot ─────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    initNeuralCanvas();
    initTypewriter();
    initScrollAnimations();
});
