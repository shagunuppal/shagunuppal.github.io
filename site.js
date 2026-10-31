// Videos stay user-controlled: no autoplay or background motion.
document.querySelectorAll('details').forEach(detail => {
  detail.addEventListener('toggle', () => {
    const symbol = detail.querySelector('summary span');
    if (symbol) symbol.textContent = detail.open ? '−' : '+';
  });
});

// An optional, local-only preference. The site remains fully usable without JS.
(() => {
  const button = document.querySelector('.theme-toggle');
  if (!button) return;
  const apply = night => {
    document.documentElement.dataset.theme = night ? 'night' : 'day';
    button.setAttribute('aria-pressed', String(night));
    button.setAttribute('aria-label', night ? 'Switch to day mode' : 'Switch to night mode');
    button.querySelector('.theme-icon').textContent = night ? '☀' : '☾';
    button.querySelector('.theme-label').textContent = night ? 'Day mode' : 'Night mode';
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.content = night ? '#211c24' : '#fcf8f3';
  };
  let saved = null;
  try { saved = localStorage.getItem('shagun-theme'); } catch (_) {}
  apply(saved !== 'day');
  button.hidden = false;
  button.addEventListener('click', () => {
    const night = document.documentElement.dataset.theme !== 'night';
    apply(night);
    try { localStorage.setItem('shagun-theme', night ? 'night' : 'day'); } catch (_) {}
  });
})();

// Keep full-size art and reading images in context, with keyboard navigation.
(() => {
  const dialog = document.querySelector('.image-dialog');
  const items = [...document.querySelectorAll('[data-gallery]')];
  if (!dialog || !items.length || typeof dialog.showModal !== 'function') return;
  let index = 0;
  const show = next => {
    index = (next + items.length) % items.length;
    const image = dialog.querySelector('.viewer-image');
    image.src = items[index].href;
    image.alt = items[index].querySelector('img').alt;
    dialog.querySelector('.viewer-caption').textContent = items[index].querySelector('.gallery-caption span').textContent;
    dialog.querySelector('.viewer-count').textContent = `${index + 1} / ${items.length}`;
  };
  items.forEach((item, i) => item.addEventListener('click', event => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault(); show(i); dialog.showModal();
  }));
  dialog.querySelector('.viewer-close').addEventListener('click', () => dialog.close());
  dialog.querySelector('.viewer-prev').addEventListener('click', () => show(index - 1));
  dialog.querySelector('.viewer-next').addEventListener('click', () => show(index + 1));
  dialog.addEventListener('keydown', event => {
    if (event.key === 'ArrowRight') { event.preventDefault(); show(index + 1); }
    if (event.key === 'ArrowLeft') { event.preventDefault(); show(index - 1); }
  });
  dialog.addEventListener('click', event => {
    const bounds = dialog.getBoundingClientRect();
    if (event.target === dialog && (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom)) dialog.close();
  });
})();

// Browse the reading archive by subject, title, or author.
(() => {
  const tools = document.querySelector('.shelf-tools');
  if (!tools) return;
  const buttons = [...tools.querySelectorAll('[data-filter]')];
  const search = tools.querySelector('input');
  const sections = [...document.querySelectorAll('.shelf-section')];
  const count = document.querySelector('.shelf-count');
  let selected = 'all';
  const update = () => {
    const query = search ? search.value.trim().toLocaleLowerCase() : '';

    let books = 0, shelves = 0;
    for (const section of sections) {
      let visible = 0;
      for (const book of section.querySelectorAll('.shelf-book')) {
        book.hidden = (selected !== 'all' && selected !== section.dataset.category) || !book.dataset.search.includes(query);
        if (!book.hidden) visible++;
      }
      section.hidden = visible === 0;
      books += visible;
      if (visible) shelves++;
    }
    count.textContent = books ? `${books} ${books === 1 ? 'book' : 'books'} · ${shelves} ${shelves === 1 ? 'shelf' : 'shelves'}` : 'No books found. Try another title or author.';
  };
  buttons.forEach(button => button.addEventListener('click', () => {
    selected = button.dataset.filter;
    buttons.forEach(item => item.setAttribute('aria-pressed', String(item === button)));
    update();
  }));
  if (search) search.addEventListener('input', update);
  tools.hidden = false;
  update();
})();
