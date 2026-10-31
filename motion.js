// Small, content-specific motions. Everything remains visible without JavaScript.
(() => {
  const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (!Element.prototype.animate) return;
  const easing = 'cubic-bezier(.2,.7,.25,1)';
  const play = (element, frames, duration = 420, delay = 0) => {
    if (preference.matches || !element) return;
    return element.animate(frames, { duration, delay, easing, fill: 'backwards' });
  };
  const frames = {
    introduction: [{ opacity: 0, transform: 'translateY(8px)' }, { opacity: 1, transform: 'translateY(0)' }],
    figure: [{ opacity: .25, transform: 'translateY(10px)' }, { opacity: 1, transform: 'translateY(0)' }],
    painting: [{ opacity: .2, transform: 'translateY(12px) rotate(-.7deg)' }, { opacity: 1, transform: 'translateY(0) rotate(0)' }],
    book: [{ opacity: .3, transform: 'perspective(500px) rotateY(-14deg) translateY(4px)' }, { opacity: 1, transform: 'perspective(500px) rotateY(0) translateY(0)' }],
    milestone: [{ opacity: .2, transform: 'translateX(-8px)' }, { opacity: 1, transform: 'translateX(0)' }]
  };
  const pending = new Map();
  const add = (selector, kind) => document.querySelectorAll(selector).forEach((element, i) => pending.set(element, { kind, delay: (i % 3) * 45 }));
  add('.page-index .personal-name, .page-index .lead', 'introduction');
  add('.page-research .paper-media', 'figure');
  add('.page-art .gallery-piece img', 'painting');
  add('.page-books .shelf-book .shelf-cover', 'book');
  add('.page-misc .about-row, .page-misc .news li', 'milestone');
  add('.page-content li, .things-list li', 'milestone');
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const spec = pending.get(entry.target);
        play(entry.target, frames[spec.kind], spec.kind === 'painting' ? 520 : 420, spec.delay);
        entry.target.classList.add('motion-arrived');
        observer.unobserve(entry.target);
      });
    }, { threshold: .08 });
    pending.forEach((_, element) => observer.observe(element));
  }
  // The orange word is underlined once, like a quick pen mark.
  const warp = document.querySelector('.page-index .lead strong');
  if (warp && !preference.matches) warp.classList.add('motion-underline');
  // Covers settle back into place when the visitor changes subject.
  document.querySelector('.shelf-filters')?.addEventListener('click', event => {
    if (!event.target.closest('button')) return;
    document.querySelectorAll('.shelf-section:not([hidden]) .shelf-book:not([hidden]) .shelf-cover').forEach((cover, i) => {
      play(cover, frames.book, 300, Math.min(i, 5) * 25);
    });
  });
  document.querySelectorAll('details').forEach(detail => detail.addEventListener('toggle', () => {
    if (detail.open) detail.querySelectorAll(':scope > :not(summary)').forEach(element => play(element, frames.introduction, 250));
  }));
  // Opening a work feels like stepping closer; navigation gives a brief dissolve.
  const dialog = document.querySelector('.image-dialog');
  if (dialog) {
    const image = dialog.querySelector('.viewer-image');
    const reveal = () => { if (dialog.open) play(image, [{ opacity: .35, transform: 'scale(.985)' }, { opacity: 1, transform: 'scale(1)' }], 240); };
    new MutationObserver(reveal).observe(dialog, { attributes: true, attributeFilter: ['open'] });
    new MutationObserver(reveal).observe(image, { attributes: true, attributeFilter: ['src'] });
  }
  preference.addEventListener('change', event => {
    if (event.matches) document.getAnimations().forEach(animation => animation.cancel());
  });
})();
