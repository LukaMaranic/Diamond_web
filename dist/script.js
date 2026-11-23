document.documentElement.classList.add("js");

const header = document.querySelector("[data-header]");
const menu = document.querySelector("[data-menu]");
const menuToggle = document.querySelector("[data-menu-toggle]");
const menuLinks = menu ? [...menu.querySelectorAll("a")] : [];
const mainContent = document.querySelector("main");
const siteFooter = document.querySelector(".site-footer");
const siteBrand = header?.querySelector(".brand");
const skipLink = document.querySelector(".skip-link");
const mobileMenuQuery = window.matchMedia("(max-width: 900px)");
const navigationTargets = menuLinks
  .map((link) => {
    const targetId = link.getAttribute("href")?.slice(1);
    return targetId ? { link, section: document.getElementById(targetId) } : null;
  })
  .filter(Boolean);
let menuOpener = null;

function updateHeader() {
  header?.classList.toggle("is-scrolled", window.scrollY > 28);
}

function setPageInert(isInert) {
  [mainContent, siteFooter, siteBrand, skipLink].forEach((element) => {
    element?.toggleAttribute("inert", isInert);
  });
}

function syncMenuAccessibility(isOpen) {
  if (!menu) return;

  const shouldDisableMenu = mobileMenuQuery.matches && !isOpen;
  menu.toggleAttribute("inert", shouldDisableMenu);

  if (shouldDisableMenu) {
    menu.setAttribute("aria-hidden", "true");
  } else {
    menu.removeAttribute("aria-hidden");
  }
}

function closeMenu(restoreFocus = false) {
  if (!menu || !menuToggle) return;

  const wasOpen = menu.classList.contains("is-open");
  menu.classList.remove("is-open");
  menuToggle.setAttribute("aria-expanded", "false");
  menuToggle.setAttribute("aria-label", "Open navigation");
  document.body.classList.remove("menu-open");
  setPageInert(false);
  syncMenuAccessibility(false);

  if (restoreFocus && wasOpen && menuOpener instanceof HTMLElement) {
    menuOpener.focus({ preventScroll: true });
  }

  menuOpener = null;
}

function openMenu() {
  if (!menu || !menuToggle) return;

  menuOpener = document.activeElement;
  menu.classList.add("is-open");
  menuToggle.setAttribute("aria-expanded", "true");
  menuToggle.setAttribute("aria-label", "Close navigation");
  document.body.classList.add("menu-open");
  syncMenuAccessibility(true);
  setPageInert(true);
  menuLinks[0]?.focus();
}

function toggleMenu() {
  if (!menu || !menuToggle) return;

  const willOpen = menuToggle.getAttribute("aria-expanded") !== "true";
  if (willOpen) {
    openMenu();
  } else {
    closeMenu(true);
  }
}

menuToggle?.addEventListener("click", toggleMenu);
menuLinks.forEach((link) => {
  link.addEventListener("click", () => {
    const targetId = link.getAttribute("href")?.slice(1);
    const targetSection = targetId ? document.getElementById(targetId) : null;
    const headingId = targetSection?.getAttribute("aria-labelledby");
    const focusTarget = headingId ? document.getElementById(headingId) : targetSection;

    closeMenu(false);

    if (!(focusTarget instanceof HTMLElement)) return;
    focusTarget.tabIndex = -1;
    requestAnimationFrame(() => {
      focusTarget.focus({ preventScroll: true });
      focusTarget.addEventListener("blur", () => focusTarget.removeAttribute("tabindex"), { once: true });
    });
  });
});

document.querySelectorAll("[data-video-id]").forEach((trigger) => {
  trigger.addEventListener("click", (event) => {
    const videoId = trigger.dataset.videoId;
    const videoTitle = trigger.dataset.videoTitle || "Diamond video";

    if (!videoId) return;
    event.preventDefault();

    const iframe = document.createElement("iframe");
    iframe.src = `https://www.youtube-nocookie.com/embed/${encodeURIComponent(videoId)}?autoplay=1&rel=0`;
    iframe.title = videoTitle;
    iframe.loading = "lazy";
    iframe.referrerPolicy = "strict-origin-when-cross-origin";
    iframe.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";
    iframe.allowFullscreen = true;
    iframe.tabIndex = 0;

    trigger.replaceWith(iframe);
    iframe.focus();
  });
});

const gallery = document.querySelector("[data-gallery]");

if (gallery) {
  const slides = [...gallery.querySelectorAll("[data-gallery-slide]")];
  const previousButton = gallery.querySelector("[data-gallery-prev]");
  const nextButton = gallery.querySelector("[data-gallery-next]");
  const openButton = gallery.querySelector("[data-gallery-open]");
  const currentCounter = gallery.querySelector("[data-gallery-current]");
  const totalCounter = gallery.querySelector("[data-gallery-total]");
  const liveRegion = gallery.querySelector("[data-gallery-live]");
  const stage = gallery.querySelector(".gallery-stage");
  const lightbox = document.querySelector("[data-gallery-lightbox]");
  const lightboxFrame = lightbox?.querySelector("[data-lightbox-frame]");
  const lightboxFigure = lightbox?.querySelector(".lightbox-figure");
  const lightboxImage = lightbox?.querySelector("[data-lightbox-image]");
  const lightboxCaption = lightbox?.querySelector("[data-lightbox-caption]");
  const lightboxCounter = lightbox?.querySelector("[data-lightbox-counter]");
  const lightboxClose = lightbox?.querySelector("[data-lightbox-close]");
  const lightboxPrevious = lightbox?.querySelector("[data-lightbox-prev]");
  const lightboxNext = lightbox?.querySelector("[data-lightbox-next]");
  const bandLightboxTriggers = [...document.querySelectorAll("[data-band-lightbox-trigger]")];
  let currentIndex = 0;
  let touchStartX = null;
  let lightboxTouchStartX = null;
  let suppressGalleryOpenUntil = 0;
  let lightboxOpener = null;
  let lightboxMode = "gallery";

  function getFullImageSource(image) {
    const sources = image
      ?.getAttribute("srcset")
      ?.split(",")
      .map((candidate) => candidate.trim().split(/\s+/)[0])
      .filter(Boolean);

    return image?.dataset.fullSrc || sources?.[sources.length - 1] || image?.currentSrc || image?.src || "";
  }

  function preloadNeighbor(index) {
    const image = slides[index]?.querySelector("img");
    if (image) image.loading = "eager";
  }

  function preloadFullNeighbor(index) {
    const image = slides[index]?.querySelector("img");
    const source = getFullImageSource(image);

    if (!source) return;

    const preload = new Image();
    preload.src = source;
  }

  function showSlide(nextIndex, announce = true) {
    currentIndex = (nextIndex + slides.length) % slides.length;

    slides.forEach((slide, index) => {
      slide.toggleAttribute("hidden", index !== currentIndex);
    });

    if (currentCounter) {
      currentCounter.textContent = String(currentIndex + 1).padStart(2, "0");
    }

    const currentImage = slides[currentIndex]?.querySelector("img");
    if (openButton) {
      openButton.setAttribute(
        "aria-label",
        `Open photo ${currentIndex + 1} of ${slides.length} in full screen`,
      );
    }

    if (announce && liveRegion && currentImage) {
      liveRegion.textContent = `Photo ${currentIndex + 1} of ${slides.length}: ${currentImage.alt}`;
    }

    if (announce) {
      preloadNeighbor((currentIndex - 1 + slides.length) % slides.length);
      preloadNeighbor((currentIndex + 1) % slides.length);
    }
  }

  function renderLightbox(nextIndex) {
    showSlide(nextIndex, false);

    const currentImage = slides[currentIndex]?.querySelector("img");
    if (!currentImage || !lightboxImage) return;

    lightboxImage.src = getFullImageSource(currentImage);
    lightboxImage.alt = currentImage.alt;
    lightboxImage.width = Number(currentImage.getAttribute("width")) || currentImage.naturalWidth;
    lightboxImage.height = Number(currentImage.getAttribute("height")) || currentImage.naturalHeight;

    if (lightboxCaption) lightboxCaption.textContent = currentImage.alt;
    if (lightboxCounter) {
      lightboxCounter.textContent = `${String(currentIndex + 1).padStart(2, "0")} / ${slides.length}`;
    }

    preloadFullNeighbor((currentIndex - 1 + slides.length) % slides.length);
    preloadFullNeighbor((currentIndex + 1) % slides.length);
  }

  function setLightboxMode(mode) {
    lightboxMode = mode;
    const isGalleryMode = mode === "gallery";

    lightboxPrevious?.toggleAttribute("hidden", !isGalleryMode);
    lightboxNext?.toggleAttribute("hidden", !isGalleryMode);
    lightboxCounter?.toggleAttribute("hidden", !isGalleryMode);
    lightbox?.setAttribute(
      "aria-label",
      isGalleryMode ? "Expanded Diamond photo gallery" : "Expanded Diamond band photo",
    );
  }

  function renderStandaloneLightbox(trigger) {
    const image = trigger.querySelector("img");
    if (!image || !lightboxImage) return false;

    lightboxImage.src = getFullImageSource(image);
    lightboxImage.alt = image.alt;
    lightboxImage.width = Number(image.getAttribute("width")) || image.naturalWidth;
    lightboxImage.height = Number(image.getAttribute("height")) || image.naturalHeight;

    if (lightboxCaption) lightboxCaption.textContent = image.alt;
    return true;
  }

  function openLightbox() {
    if (!lightbox || typeof lightbox.showModal !== "function" || lightbox.open) return;

    lightboxOpener = document.activeElement;
    setLightboxMode("gallery");
    renderLightbox(currentIndex);
    lightbox.showModal();
    document.body.classList.add("lightbox-open");
    lightboxClose?.focus();
  }

  function openStandaloneLightbox(trigger) {
    if (!lightbox || typeof lightbox.showModal !== "function" || lightbox.open) return false;

    setLightboxMode("standalone");
    if (!renderStandaloneLightbox(trigger)) return false;

    lightboxOpener = trigger;
    lightbox.showModal();
    document.body.classList.add("lightbox-open");
    lightboxClose?.focus();
    return true;
  }

  function closeLightbox() {
    if (lightbox?.open) lightbox.close();
  }

  previousButton?.addEventListener("click", () => showSlide(currentIndex - 1));
  nextButton?.addEventListener("click", () => showSlide(currentIndex + 1));
  openButton?.addEventListener("click", () => {
    if (Date.now() < suppressGalleryOpenUntil) return;
    openLightbox();
  });

  bandLightboxTriggers.forEach((trigger) => {
    trigger.addEventListener("click", (event) => {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return;
      }

      if (openStandaloneLightbox(trigger)) event.preventDefault();
    });
  });

  lightboxPrevious?.addEventListener("click", () => renderLightbox(currentIndex - 1));
  lightboxNext?.addEventListener("click", () => renderLightbox(currentIndex + 1));
  lightboxClose?.addEventListener("click", closeLightbox);

  lightbox?.addEventListener("close", () => {
    document.body.classList.remove("lightbox-open");

    const currentImage = slides[currentIndex]?.querySelector("img");
    if (lightboxMode === "gallery" && liveRegion && currentImage) {
      liveRegion.textContent = `Photo ${currentIndex + 1} of ${slides.length}: ${currentImage.alt}`;
    }

    if (lightboxOpener instanceof HTMLElement) {
      lightboxOpener.focus({ preventScroll: true });
    }
  });

  lightboxFrame?.addEventListener("click", (event) => {
    if (event.target === lightboxFrame || event.target === lightboxFigure) closeLightbox();
  });

  lightbox?.addEventListener("keydown", (event) => {
    if (event.key === "Tab") {
      const controls = [lightboxClose, lightboxPrevious, lightboxNext].filter(
        (control) => control instanceof HTMLElement && !control.hidden,
      );
      const firstControl = controls[0];
      const lastControl = controls[controls.length - 1];
      const activeElement = document.activeElement;
      const focusIsInsideControls = controls.includes(activeElement);

      if (event.shiftKey && (activeElement === firstControl || !focusIsInsideControls)) {
        event.preventDefault();
        lastControl?.focus();
      } else if (!event.shiftKey && (activeElement === lastControl || !focusIsInsideControls)) {
        event.preventDefault();
        firstControl?.focus();
      }
    }

    if (lightboxMode === "gallery" && event.key === "ArrowLeft") {
      event.preventDefault();
      renderLightbox(currentIndex - 1);
    }

    if (lightboxMode === "gallery" && event.key === "ArrowRight") {
      event.preventDefault();
      renderLightbox(currentIndex + 1);
    }

    if (lightboxMode === "gallery" && event.key === "Home") {
      event.preventDefault();
      renderLightbox(0);
    }

    if (lightboxMode === "gallery" && event.key === "End") {
      event.preventDefault();
      renderLightbox(slides.length - 1);
    }
  });

  gallery.addEventListener("keydown", (event) => {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      showSlide(currentIndex - 1);
    }

    if (event.key === "ArrowRight") {
      event.preventDefault();
      showSlide(currentIndex + 1);
    }

    if (event.key === "Home") {
      event.preventDefault();
      showSlide(0);
    }

    if (event.key === "End") {
      event.preventDefault();
      showSlide(slides.length - 1);
    }
  });

  stage?.addEventListener(
    "touchstart",
    (event) => {
      touchStartX = event.changedTouches[0]?.clientX ?? null;
    },
    { passive: true },
  );

  stage?.addEventListener(
    "touchend",
    (event) => {
      if (touchStartX === null) return;

      const touchEndX = event.changedTouches[0]?.clientX ?? touchStartX;
      const distance = touchEndX - touchStartX;
      touchStartX = null;

      if (Math.abs(distance) < 45) return;
      suppressGalleryOpenUntil = Date.now() + 500;
      showSlide(distance > 0 ? currentIndex - 1 : currentIndex + 1);
    },
    { passive: true },
  );

  lightboxFrame?.addEventListener(
    "touchstart",
    (event) => {
      if (lightboxMode !== "gallery") return;
      lightboxTouchStartX = event.changedTouches[0]?.clientX ?? null;
    },
    { passive: true },
  );

  lightboxFrame?.addEventListener(
    "touchend",
    (event) => {
      if (lightboxMode !== "gallery") return;
      if (lightboxTouchStartX === null) return;

      const touchEndX = event.changedTouches[0]?.clientX ?? lightboxTouchStartX;
      const distance = touchEndX - lightboxTouchStartX;
      lightboxTouchStartX = null;

      if (Math.abs(distance) < 45) return;
      renderLightbox(distance > 0 ? currentIndex - 1 : currentIndex + 1);
    },
    { passive: true },
  );

  slides.forEach((slide, index) => {
    slide.setAttribute("role", "group");
    slide.setAttribute("aria-roledescription", "slide");
    slide.setAttribute("aria-label", `${index + 1} of ${slides.length}`);
  });
  if (totalCounter) totalCounter.textContent = String(slides.length);
  showSlide(0, false);
}

window.addEventListener("keydown", (event) => {
  if (!menu?.classList.contains("is-open")) return;

  if (event.key === "Escape") {
    event.preventDefault();
    closeMenu(true);
    return;
  }

  if (event.key !== "Tab" || !menuToggle) return;

  const focusableMenuElements = [menuToggle, ...menuLinks];
  const firstElement = focusableMenuElements[0];
  const lastElement = focusableMenuElements[focusableMenuElements.length - 1];
  const activeElement = document.activeElement;
  const focusIsInMenu = focusableMenuElements.includes(activeElement);

  if (event.shiftKey && (activeElement === firstElement || !focusIsInMenu)) {
    event.preventDefault();
    lastElement?.focus();
  } else if (!event.shiftKey && (activeElement === lastElement || !focusIsInMenu)) {
    event.preventDefault();
    firstElement?.focus();
  }
});

function handleMenuBreakpoint(event) {
  closeMenu(false);
}

if (typeof mobileMenuQuery.addEventListener === "function") {
  mobileMenuQuery.addEventListener("change", handleMenuBreakpoint);
} else {
  mobileMenuQuery.addListener(handleMenuBreakpoint);
}

syncMenuAccessibility(false);

function updateActiveNavigation() {
  const activationLine = Math.min(window.innerHeight * 0.38, 360);
  let activeLink = null;

  navigationTargets.forEach(({ link, section }) => {
    if (section?.getBoundingClientRect().top <= activationLine) activeLink = link;
  });

  menuLinks.forEach((link) => {
    if (link === activeLink) {
      link.setAttribute("aria-current", "location");
    } else {
      link.removeAttribute("aria-current");
    }
  });
}

window.addEventListener("scroll", updateHeader, { passive: true });
window.addEventListener("scroll", updateActiveNavigation, { passive: true });
window.addEventListener("resize", updateActiveNavigation, { passive: true });
updateHeader();
updateActiveNavigation();

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const revealElements = [...document.querySelectorAll(".reveal")];

if (reduceMotion || !("IntersectionObserver" in window)) {
  revealElements.forEach((element) => element.classList.add("is-visible"));
} else {
  const observer = new IntersectionObserver(
    (entries, currentObserver) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        entry.target.classList.add("is-visible");
        currentObserver.unobserve(entry.target);
      });
    },
    {
      rootMargin: "0px 0px -10%",
      threshold: 0.12,
    },
  );

  revealElements.forEach((element) => observer.observe(element));
}
