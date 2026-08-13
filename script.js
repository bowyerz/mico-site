/* ============================================================
   MiCo — 交互脚本
   滚动揭示 · 导航渐变 · 明暗切换 · 进度条 · 错峰动画
   ============================================================ */
(function () {
  "use strict";

  /* ---------- 滚动进度条 + 导航渐变 ---------- */
  const progress = document.getElementById("scrollProgress");
  const nav = document.getElementById("nav");

  function onScroll() {
    const st = window.scrollY || document.documentElement.scrollTop;
    const docH = document.documentElement.scrollHeight - window.innerHeight;
    const pct = docH > 0 ? (st / docH) * 100 : 0;
    if (progress) progress.style.width = pct + "%";
    if (nav) nav.classList.toggle("nav--scrolled", st > 24);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- 滚动揭示（含错峰延迟） ---------- */
  const reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const el = entry.target;
            const delay = parseInt(el.getAttribute("data-delay") || "0", 10);
            el.style.transitionDelay = delay + "ms";
            el.classList.add("is-visible");
            io.unobserve(el);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
    );
    reveals.forEach((el) => io.observe(el));
  } else {
    reveals.forEach((el) => el.classList.add("is-visible"));
  }

  /* ---------- 明暗主题切换（记忆偏好） ---------- */
  const toggle = document.getElementById("themeToggle");
  const root = document.documentElement;
  const icon = toggle ? toggle.querySelector(".theme-toggle__icon") : null;

  function applyTheme(theme) {
    root.setAttribute("data-theme", theme);
    if (icon) icon.textContent = theme === "dark" ? "☀️" : "🌙";
    try {
      localStorage.setItem("mico-theme", theme);
    } catch (e) {}
  }

  let saved = null;
  try {
    saved = localStorage.getItem("mico-theme");
  } catch (e) {}
  if (!saved) {
    // 默认深色；仅当系统明确偏好浅色时才用浅色
    saved = window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: light)").matches
      ? "light"
      : "dark";
  }
  applyTheme(saved);

  if (toggle) {
    toggle.addEventListener("click", () => {
      const next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
      applyTheme(next);
    });
  }

  /* ---------- 平滑滚动锚点（兼容不支持 scroll-padding 的场景） ---------- */
  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener("click", (e) => {
      const id = a.getAttribute("href");
      if (id === "#" || id.length < 2) return;
      const target = document.querySelector(id);
      if (target) {
        e.preventDefault();
        const top = target.getBoundingClientRect().top + window.scrollY - 80;
        window.scrollTo({ top: top, behavior: "smooth" });
      }
    });
  });

  /* ---------- 超大品牌字滚动视差 ---------- */
  const megaBrand = document.getElementById("megaBrand");
  const megaTrack = megaBrand ? megaBrand.querySelector(".mega-brand__track") : null;
  if (megaBrand && megaTrack) {
    function updateMegaBrand() {
      const rect = megaBrand.getBoundingClientRect();
      const vh = window.innerHeight;
      const total = rect.height + vh;
      const current = vh - rect.top;
      let progress = total > 0 ? current / total : 0.5;
      progress = Math.max(0, Math.min(1, progress));
      // 页面滑到底时（区块底部贴视口底部），progress 约为 rect.height/(rect.height+vh)。
      // 把这段时间映射为 revealProgress 0→1：文字从右下慢慢升起并居中，确保底部完整可见。
      const endProgress = rect.height / (rect.height + vh);
      const revealProgress = Math.max(0, Math.min(1, progress / endProgress));
      const tx = 18 - revealProgress * 18; // +18% → 0%
      const ty = 35 - revealProgress * 35; // +35% → 0%
      megaTrack.style.setProperty("--tx", tx + "%");
      megaTrack.style.setProperty("--ty", ty + "%");
    }
    let megaTicking = false;
    window.addEventListener(
      "scroll",
      () => {
        if (!megaTicking) {
          requestAnimationFrame(() => {
            updateMegaBrand();
            megaTicking = false;
          });
          megaTicking = true;
        }
      },
      { passive: true }
    );
    updateMegaBrand();
  }

  /* ---------- 设备 mockup 轻微视差 ---------- */
  const stage = document.querySelector(".hero__stage");
  if (stage && window.matchMedia("(min-width: 681px)").matches) {
    window.addEventListener(
      "scroll",
      () => {
        const y = window.scrollY;
        if (y < window.innerHeight) {
          stage.style.transform = "translateY(" + y * 0.08 + "px)";
        }
      },
      { passive: true }
    );
  }
})();
