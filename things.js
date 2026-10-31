(() => {
 const list = document.querySelector('.things-list');
 if (!list) return;
 const items = [...list.children].filter(item => item.textContent.trim());
 const remaining = items.filter(item => !item.classList.contains('thing-done'));
 const completed = items.length - remaining.length;
 const inProgress = remaining.filter(item => item.classList.contains('thing-in-progress')).length;
 const score = completed + inProgress * 0.5;
 items.forEach((item, index) => item.dataset.number = String(index + 1).padStart(2, '0'));
 document.querySelector('.things-progress strong').textContent = score;
 document.querySelector('.things-progress-total').textContent = ` of ${items.length} listed goals done`;
 const dots = document.querySelector('.things-dots');
 dots.setAttribute('aria-label', `${score} of ${items.length}: ${completed} completed and ${inProgress} in progress, worth half a point each`);
 [...dots.children].forEach((dot, index) => {
  dot.classList.toggle('is-done', items[index].classList.contains('thing-done'));
  dot.classList.toggle('is-wip', !items[index].classList.contains('thing-done') && items[index].classList.contains('thing-in-progress'));
 });
 document.querySelector('.things-progress-note').textContent = `${completed} done + ${inProgress} WIP. Half credit counts :)`;
 const dialog = document.querySelector('.things-dialog');
 let trigger;
 document.querySelectorAll('.thing-photo').forEach(button => button.addEventListener('click', () => {
  trigger = button;
  const caption = button.dataset.caption || 'A memory from my list';
  dialog.querySelector('img').src = button.dataset.photo;
  dialog.querySelector('img').alt = caption;
  const secondary = dialog.querySelector('.things-secondary-photo');
  const pair = Boolean(button.dataset.photoSecondary);
  secondary.hidden = !pair;
  dialog.classList.toggle('has-paired-photos', pair);
  if (pair) {
   secondary.src = button.dataset.photoSecondary;
   secondary.alt = button.dataset.secondaryAlt || caption;
  } else {
   secondary.removeAttribute('src');
   secondary.alt = '';
  }
  dialog.querySelector('p').textContent = caption;
  dialog.showModal();
 }));
 dialog.querySelector('.things-close').addEventListener('click', () => dialog.close());
 dialog.addEventListener('close', () => trigger?.focus());
 dialog.addEventListener('click', event => {
  if (event.target !== dialog) return;
  const bounds = dialog.getBoundingClientRect();
  if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) dialog.close();
 });
})();
