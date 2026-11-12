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

document.getElementById('year').textContent = new Date().getFullYear();
