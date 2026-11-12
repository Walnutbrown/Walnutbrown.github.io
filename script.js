const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
const canHover = matchMedia('(hover: hover) and (pointer: fine)').matches;
const root = document.documentElement;

// 1. 라이트/다크 전환: 처음엔 시스템 설정을 따르고, 버튼으로 고른 값은 기억한다
document.querySelector('.theme-toggle').addEventListener('click', () => {
  const current = root.dataset.theme || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  const next = current === 'dark' ? 'light' : 'dark';
  const apply = () => { root.dataset.theme = next; };
  if (document.startViewTransition && !reduceMotion) document.startViewTransition(apply);
  else apply();
  try { localStorage.setItem('theme', next); } catch (e) { /* 저장이 막혀도 이번 방문에는 적용된다 */ }
});

// 2. 스크롤 등장: 화면에 들어온 .reveal 요소가 형제 순서대로 떠오른다
const revealer = new IntersectionObserver((entries) => {
  for (const entry of entries) {
    if (!entry.isIntersecting) continue;
    entry.target.classList.add('is-in');
    revealer.unobserve(entry.target);
  }
}, { threshold: 0.15, rootMargin: '0px 0px -8% 0px' });

document.querySelectorAll('.reveal').forEach((el) => {
  el.style.setProperty('--i', [...el.parentElement.children].indexOf(el));
  revealer.observe(el);
});

// 3. 유리 카드 위의 빛이 커서를 따라간다
if (canHover) {
  document.querySelectorAll('.glass').forEach((el) => {
    el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect();
      el.style.setProperty('--mx', `${e.clientX - r.left}px`);
      el.style.setProperty('--my', `${e.clientY - r.top}px`);
    });
  });
}

// 4. 네비게이션: 스크롤하면 배경을 진하게, 지금 보고 있는 섹션 메뉴를 강조
const nav = document.querySelector('.nav');
const onScroll = () => nav.classList.toggle('scrolled', scrollY > 24);
addEventListener('scroll', onScroll, { passive: true });
onScroll();

const links = document.querySelectorAll('.nav-links a');
const spy = new IntersectionObserver((entries) => {
  for (const entry of entries) {
    if (!entry.isIntersecting) continue;
    links.forEach((a) => a.classList.toggle('active', a.hash === `#${entry.target.id}`));
  }
}, { rootMargin: '-45% 0px -54% 0px' });
document.querySelectorAll('#top, main section[id]').forEach((s) => spy.observe(s));

// 5. 프로젝트 시안 비교: A 그리드 / B 스와이프
// shortcut: 시안 비교용 토글이다. 하나로 정하면 토글 버튼과 안 쓰는 쪽 코드를 지운다
const list = document.querySelector('.projects');
const swipeNav = document.querySelector('.swipe-nav');
const [prevBtn, nextBtn] = swipeNav.querySelectorAll('.swipe-btn');
const countEl = swipeNav.querySelector('.swipe-count b');
const step = () => list.firstElementChild.offsetWidth + parseFloat(getComputedStyle(list).columnGap);

const updateSwipe = () => {
  const atEnd = list.scrollLeft + list.clientWidth >= list.scrollWidth - 2;
  const index = atEnd ? list.children.length - 1 : Math.round(list.scrollLeft / step());
  countEl.textContent = String(index + 1).padStart(2, '0');
  prevBtn.disabled = list.scrollLeft <= 2;
  nextBtn.disabled = atEnd;
};
list.addEventListener('scroll', updateSwipe, { passive: true });
prevBtn.addEventListener('click', () => list.scrollBy({ left: -step(), behavior: reduceMotion ? 'auto' : 'smooth' }));
nextBtn.addEventListener('click', () => list.scrollBy({ left: step(), behavior: reduceMotion ? 'auto' : 'smooth' }));

const layoutBtns = document.querySelectorAll('[data-layout]');
layoutBtns.forEach((btn) => btn.addEventListener('click', () => {
  const swipe = btn.dataset.layout === 'swipe';
  list.classList.toggle('is-swipe', swipe);
  swipeNav.hidden = !swipe;
  layoutBtns.forEach((b) => b.setAttribute('aria-pressed', String(b === btn)));
  list.scrollLeft = 0;
  updateSwipe();
}));

document.getElementById('year').textContent = new Date().getFullYear();
