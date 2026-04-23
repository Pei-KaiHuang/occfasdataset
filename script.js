const header = document.querySelector(".site-header");
const menuToggle = document.querySelector(".menu-toggle");
const nav = document.querySelector(".site-nav");
const pageMain = document.querySelector(".page-main");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const navLinks = nav ? Array.from(nav.querySelectorAll("a")) : [];
const pages = navLinks
  .map((link) => {
    const hash = new URL(link.href, window.location.href).hash;
    return hash ? { link, section: document.querySelector(hash), hash } : null;
  })
  .filter((item) => item && item.section);

function setNavActiveIndex(activeLink) {
  if (!nav) {
    return;
  }

  const index = Math.max(0, navLinks.indexOf(activeLink || nav.querySelector(".is-active")));
  nav.style.setProperty("--nav-active-index", String(index));
  nav.style.setProperty(
    "--nav-active-offset",
    index === 0 ? "0px" : `calc(${index * 100}% + ${index * 4}px)`
  );
}

function setActiveLink(activeLink) {
  navLinks.forEach((link) => {
    const isActive = link === activeLink;
    link.classList.toggle("is-active", isActive);
    link.classList.remove("is-pending");
    if (isActive) {
      link.setAttribute("aria-current", "page");
    } else {
      link.removeAttribute("aria-current");
    }
  });
  setNavActiveIndex(activeLink);
}

function closeMobileMenu() {
  if (!header || !menuToggle) {
    return;
  }

  header.classList.remove("is-open");
  menuToggle.setAttribute("aria-expanded", "false");
}

function showPage(targetItem, updateHistory = true) {
  if (!targetItem) {
    return;
  }

  setActiveLink(targetItem.link);

  pages.forEach((item) => {
    item.section.hidden = item !== targetItem;
  });

  if (updateHistory && window.location.hash !== targetItem.hash) {
    history.pushState(null, "", targetItem.hash);
  }

  window.scrollTo({ top: 0, behavior: "auto" });
}

function switchPage(targetItem) {
  if (!targetItem || !pageMain) {
    return;
  }

  const currentItem = pages.find((item) => !item.section.hidden);
  if (currentItem === targetItem) {
    setActiveLink(targetItem.link);
    return;
  }

  if (reduceMotion) {
    showPage(targetItem);
    return;
  }

  pageMain.classList.add("is-switching");

  window.setTimeout(() => {
    showPage(targetItem);
    pageMain.classList.remove("is-switching");
  }, 120);
}

if (nav) {
  const initialPage =
    pages.find((item) => item.hash === window.location.hash) ||
    pages.find((item) => item.link.classList.contains("is-active")) ||
    pages[0];

  showPage(initialPage, false);

  navLinks.forEach((link) => {
    link.addEventListener("click", (event) => {
      const hash = new URL(link.href, window.location.href).hash;
      const targetItem = pages.find((item) => item.hash === hash);

      closeMobileMenu();

      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey ||
        !targetItem
      ) {
        return;
      }

      event.preventDefault();
      switchPage(targetItem);
    });
  });

  window.addEventListener("popstate", () => {
    const targetItem = pages.find((item) => item.hash === window.location.hash) || pages[0];
    showPage(targetItem, false);
  });
}

if (menuToggle && header) {
  menuToggle.addEventListener("click", () => {
    const isOpen = header.classList.toggle("is-open");
    menuToggle.setAttribute("aria-expanded", String(isOpen));
  });
}
