/* ==========================================================================
   Maliya Foundation Healthcare Center — Custom JavaScript
   Vanilla JS only. Handles: preloader, sticky nav, scroll animations,
   animated counters, gallery lightbox + filter, video modal, contact form
   validation, back-to-top, active nav link, current year in footer.
   ========================================================================== */

(function () {
  "use strict";
  

  /* ----------  Preloader  ---------- */
  window.addEventListener("load", function () {
    const pre = document.querySelector(".preloader");
    if (pre) {
      setTimeout(() => pre.classList.add("hidden"), 300);
      setTimeout(() => pre.remove(), 900);
    }
  });

  document.addEventListener("DOMContentLoaded", function () {
    /* ----------  Sticky navbar shadow  ---------- */
    const navbar = document.querySelector(".navbar");
    const onScrollNav = () => {
      if (!navbar) return;
      if (window.scrollY > 30) navbar.classList.add("scrolled");
      else navbar.classList.remove("scrolled");
    };
    onScrollNav();
    window.addEventListener("scroll", onScrollNav, { passive: true });

    /* ----------  Active nav link based on current page  ---------- */
    const currentPage = (location.pathname.split("/").pop() || "index.html").toLowerCase();
    document.querySelectorAll(".navbar .nav-link").forEach((link) => {
      const href = (link.getAttribute("href") || "").toLowerCase();
      if (href === currentPage || (currentPage === "" && href === "index.html")) {
        link.classList.add("active");
        link.setAttribute("aria-current", "page");
      }
    });

    /* ----------  Auto-close mobile menu on link click  ---------- */
    const collapseEl = document.querySelector(".navbar-collapse");
    if (collapseEl) {
      document.querySelectorAll(".navbar .nav-link").forEach((link) => {
        link.addEventListener("click", () => {
          if (collapseEl.classList.contains("show") && window.bootstrap) {
            const inst = window.bootstrap.Collapse.getInstance(collapseEl);
            if (inst) inst.hide();
          }
        });
      });
    }

    /* ----------  Fade-in on scroll (IntersectionObserver)  ---------- */
    const animated = document.querySelectorAll(".fade-up, .fade-left, .fade-right, .zoom-in, .stagger");
    if ("IntersectionObserver" in window && animated.length) {
      const io = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add("visible");
              io.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
      );
      animated.forEach((el) => io.observe(el));
    } else {
      animated.forEach((el) => el.classList.add("visible"));
    }

    /* ----------  Animated counters  ---------- */
    const counters = document.querySelectorAll(".counter");
    if ("IntersectionObserver" in window && counters.length) {
      const cio = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            const el = entry.target;
            const target = parseInt(el.dataset.target || "0", 10);
            const suffix = el.dataset.suffix || "";
            const duration = 1800;
            const start = performance.now();
            const step = (now) => {
              const p = Math.min((now - start) / duration, 1);
              const eased = 1 - Math.pow(1 - p, 3); /* easeOutCubic */
              el.textContent = Math.floor(eased * target).toLocaleString() + suffix;
              if (p < 1) requestAnimationFrame(step);
              else el.textContent = target.toLocaleString() + suffix;
            };
            requestAnimationFrame(step);
            cio.unobserve(el);
          });
        },
        { threshold: 0.5 }
      );
      counters.forEach((c) => cio.observe(c));
    } else {
      counters.forEach((c) => {
        c.textContent = (c.dataset.target || "0") + (c.dataset.suffix || "");
      });
    }

    /* ----------  Back to top  ---------- */
    const btt = document.querySelector(".back-to-top");
    if (btt) {
      window.addEventListener(
        "scroll",
        () => {
          if (window.scrollY > 400) btt.classList.add("show");
          else btt.classList.remove("show");
        },
        { passive: true }
      );
      btt.addEventListener("click", () =>
        window.scrollTo({ top: 0, behavior: "smooth" })
      );
    }

    /* ----------  Current year in footer  ---------- */
    document.querySelectorAll(".current-year").forEach((el) => {
      el.textContent = new Date().getFullYear();
    });

    /* ----------  Gallery filter  ---------- */
    const filterBtns = document.querySelectorAll(".gallery-filter .btn");
    const galleryItems = document.querySelectorAll(".gallery-grid .gallery-item");
    if (filterBtns.length && galleryItems.length) {
      filterBtns.forEach((btn) => {
        btn.addEventListener("click", () => {
          filterBtns.forEach((b) => b.classList.remove("active"));
          btn.classList.add("active");
          const filter = btn.dataset.filter;
          galleryItems.forEach((item) => {
            const cat = item.dataset.category;
            const show = filter === "all" || cat === filter;
            item.style.display = show ? "" : "none";
          });
        });
      });
    }

    /* ----------  Lightbox  ---------- */
    const lightbox = document.querySelector(".lightbox-modal");
    if (lightbox) {
      const lbImg = lightbox.querySelector("img");
      const lbCaption = lightbox.querySelector(".lb-caption");
      let current = -1;
      const setIndex = (i) => {
        const items = Array.from(document.querySelectorAll(".gallery-grid .gallery-item:not([style*='display: none'])"));
        const idx = i < 0 ? items.length - 1 : i >= items.length ? 0 : i;
        const item = items[idx];
        if (!item) return;
        const fullImg = item.dataset.full || item.querySelector("img").src;
        const cap = item.dataset.caption || "";
        lbImg.src = fullImg;
        lbImg.alt = cap;
        lbCaption.textContent = cap;
        current = idx;
      };
      document.querySelectorAll(".gallery-grid .gallery-item").forEach((item, i) => {
        item.addEventListener("click", () => {
          lightbox.classList.add("open");
          document.body.style.overflow = "hidden";
          setIndex(i);
        });
      });
      const closeLb = () => {
        lightbox.classList.remove("open");
        document.body.style.overflow = "";
      };
      lightbox.querySelector(".lb-close").addEventListener("click", closeLb);
      lightbox.addEventListener("click", (e) => {
        if (e.target === lightbox) closeLb();
      });
      const prev = lightbox.querySelector(".lb-prev");
      const next = lightbox.querySelector(".lb-next");
      if (prev) prev.addEventListener("click", () => setIndex(current - 1));
      if (next) next.addEventListener("click", () => setIndex(current + 1));
      document.addEventListener("keydown", (e) => {
        if (!lightbox.classList.contains("open")) return;
        if (e.key === "Escape") closeLb();
        if (e.key === "ArrowLeft") setIndex(current - 1);
        if (e.key === "ArrowRight") setIndex(current + 1);
      });
    }

    /* ----------  Video modal (YouTube embed)  ---------- */
    const videoModalEl = document.getElementById("videoModal");
    if (videoModalEl && window.bootstrap) {
      const videoModal = new window.bootstrap.Modal(videoModalEl);
      const iframe = videoModalEl.querySelector("iframe");
      document.querySelectorAll("[data-video]").forEach((btn) => {
        btn.addEventListener("click", () => {
          const id = btn.dataset.video;
          iframe.src = "https://www.youtube.com/embed/" + id + "?rel=0&autoplay=1";
          videoModal.show();
        });
      });
      videoModalEl.addEventListener("hidden.bs.modal", () => {
        iframe.src = "";
      });
    }

    /* ----------  Contact form validation  ---------- */
    const form = document.querySelector("#contactForm");
    if (form) {
      const feedback = (input, msg) => {
        const fd = form.querySelector(`[data-feedback="${input.id}"]`);
        if (fd) {
          fd.textContent = msg;
          fd.style.display = msg ? "block" : "none";
        }
        input.classList.toggle("is-invalid", !!msg);
        input.classList.toggle("is-valid", !msg && input.value.trim() !== "");
      };

      const validators = {
        name: (v) => (v.trim().length < 2 ? "Please enter your full name." : ""),
        email: (v) =>
          /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim())
            ? ""
            : "Please enter a valid email address.",
        subject: (v) => (v.trim().length < 3 ? "Please add a subject." : ""),
        message: (v) => (v.trim().length < 10 ? "Message must be at least 10 characters." : ""),
      };

      Object.keys(validators).forEach((id) => {
        const input = form.querySelector("#" + id);
        if (!input) return;
        input.addEventListener("blur", () => feedback(input, validators[id](input.value)));
        input.addEventListener("input", () => {
          if (input.classList.contains("is-invalid")) feedback(input, validators[id](input.value));
        });
      });

      form.addEventListener("submit", (e) => {
        e.preventDefault();
        let ok = true;
        Object.keys(validators).forEach((id) => {
          const input = form.querySelector("#" + id);
          if (!input) return;
          const msg = validators[id](input.value);
          feedback(input, msg);
          if (msg) ok = false;
        });
        const alertBox = form.querySelector("#formAlert");
        if (ok) {
          form.reset();
          form.querySelectorAll(".is-valid").forEach((el) => el.classList.remove("is-valid"));
          if (alertBox) {
            alertBox.classList.remove("d-none", "alert-danger");
            alertBox.classList.add("alert-success");
            alertBox.textContent =
              "Thank you! Your message has been received. We will get back to you shortly.";
          }
        } else if (alertBox) {
          alertBox.classList.remove("d-none", "alert-success");
          alertBox.classList.add("alert-danger");
          alertBox.textContent = "Please correct the highlighted fields and try again.";
        }
      });
    }
  });
})();
document.addEventListener("DOMContentLoaded", function () {

  /* =====================================================
     GALLERY ELEMENTS
     ===================================================== */

  const galleryPhotos =
    document.querySelectorAll(".mf-photo img");

  const viewer =
    document.getElementById("mfViewer");

  const viewerImage =
    document.getElementById("mfViewerImage");

  const closeButton =
    document.getElementById("mfViewerClose");

  const previousButton =
    document.getElementById("mfViewerPrev");

  const nextButton =
    document.getElementById("mfViewerNext");

  const currentCounter =
    document.getElementById("mfCurrent");

  const totalCounter =
    document.getElementById("mfTotal");


  /* =====================================================
     CREATE IMAGE LIST
     ===================================================== */

  const galleryImages =
    Array.from(galleryPhotos).map(function (image) {

      return {
        src: image.getAttribute("src"),
        alt: image.getAttribute("alt") || "Gallery image"
      };

    });


  let currentIndex = 0;


  totalCounter.textContent =
    galleryImages.length;


  /* =====================================================
     OPEN VIEWER
     ===================================================== */

  function openViewer(index) {

    currentIndex = index;

    viewer.classList.add("active");

    viewer.setAttribute(
      "aria-hidden",
      "false"
    );

    document.body.classList.add(
      "mf-viewer-open"
    );

    showImage(currentIndex);

  }


  /* =====================================================
     DISPLAY IMAGE
     ===================================================== */

  function showImage(index) {

    const image =
      galleryImages[index];

    if (!image) {
      return;
    }


    /* Fade current image */

    viewerImage.classList.remove(
      "loaded"
    );


    /* Preload next image */

    const preload =
      new Image();


    preload.onload = function () {

      viewerImage.src =
        image.src;

      viewerImage.alt =
        image.alt;

      currentCounter.textContent =
        index + 1;


      requestAnimationFrame(function () {

        viewerImage.classList.add(
          "loaded"
        );

      });


      preloadNearbyImages();

    };


    preload.src =
      image.src;

  }


  /* =====================================================
     NEXT IMAGE
     ===================================================== */

  function nextImage() {

    currentIndex++;

    if (
      currentIndex >=
      galleryImages.length
    ) {

      currentIndex = 0;

    }

    showImage(currentIndex);

  }


  /* =====================================================
     PREVIOUS IMAGE
     ===================================================== */

  function previousImage() {

    currentIndex--;

    if (currentIndex < 0) {

      currentIndex =
        galleryImages.length - 1;

    }

    showImage(currentIndex);

  }


  /* =====================================================
     CLOSE VIEWER
     ===================================================== */

  function closeViewer() {

    viewer.classList.remove(
      "active"
    );

    viewer.setAttribute(
      "aria-hidden",
      "true"
    );

    document.body.classList.remove(
      "mf-viewer-open"
    );

    viewerImage.classList.remove(
      "loaded"
    );

  }


  /* =====================================================
     CLICK ON GALLERY IMAGE
     ===================================================== */

  galleryPhotos.forEach(
    function (image, index) {

      image.addEventListener(
        "click",
        function () {

          openViewer(index);

        }
      );

    }
  );


  /* =====================================================
     NEXT BUTTON
     ===================================================== */

  nextButton.addEventListener(
    "click",
    function (event) {

      event.stopPropagation();

      nextImage();

    }
  );


  /* =====================================================
     PREVIOUS BUTTON
     ===================================================== */

  previousButton.addEventListener(
    "click",
    function (event) {

      event.stopPropagation();

      previousImage();

    }
  );


  /* =====================================================
     CLOSE BUTTON
     ===================================================== */

  closeButton.addEventListener(
    "click",
    function (event) {

      event.stopPropagation();

      closeViewer();

    }
  );


  /* =====================================================
     KEYBOARD NAVIGATION
     ===================================================== */

  document.addEventListener(
    "keydown",
    function (event) {

      if (
        !viewer.classList.contains(
          "active"
        )
      ) {

        return;

      }


      /* LEFT ARROW */

      if (
        event.key === "ArrowLeft"
      ) {

        event.preventDefault();

        previousImage();

      }


      /* RIGHT ARROW */

      if (
        event.key === "ArrowRight"
      ) {

        event.preventDefault();

        nextImage();

      }


      /* ESCAPE */

      if (
        event.key === "Escape"
      ) {

        event.preventDefault();

        closeViewer();

      }

    }
  );


  /* =====================================================
     CLICK OUTSIDE IMAGE TO CLOSE
     ===================================================== */

  viewer.addEventListener(
    "click",
    function (event) {

      if (
        event.target === viewer
      ) {

        closeViewer();

      }

    }
  );


  /* =====================================================
     MOBILE SWIPE
     ===================================================== */

  let touchStartX = 0;
  let touchStartY = 0;

  let touchEndX = 0;
  let touchEndY = 0;


  viewer.addEventListener(
    "touchstart",
    function (event) {

      touchStartX =
        event.changedTouches[0].screenX;

      touchStartY =
        event.changedTouches[0].screenY;

    },
    {
      passive: true
    }
  );


  viewer.addEventListener(
    "touchend",
    function (event) {

      touchEndX =
        event.changedTouches[0].screenX;

      touchEndY =
        event.changedTouches[0].screenY;

      handleSwipe();

    },
    {
      passive: true
    }
  );


  /* =====================================================
     HANDLE SWIPE
     ===================================================== */

  function handleSwipe() {

    const differenceX =
      touchEndX - touchStartX;

    const differenceY =
      touchEndY - touchStartY;


    /*
     * Ignore mostly vertical gestures.
     */

    if (
      Math.abs(differenceY) >
      Math.abs(differenceX)
    ) {

      return;

    }


    /*
     * Ignore very small movements.
     */

    if (
      Math.abs(differenceX) < 50
    ) {

      return;

    }


    /* SWIPE LEFT = NEXT */

    if (differenceX < 0) {

      nextImage();

    }


    /* SWIPE RIGHT = PREVIOUS */

    else {

      previousImage();

    }

  }


  /* =====================================================
     PRELOAD NEARBY IMAGES
     ===================================================== */

  function preloadNearbyImages() {

    if (
      galleryImages.length <= 1
    ) {

      return;

    }


    const nextIndex =
      (currentIndex + 1) %
      galleryImages.length;


    const previousIndex =
      (
        currentIndex -
        1 +
        galleryImages.length
      ) %
      galleryImages.length;


    const nextImage =
      new Image();

    nextImage.src =
      galleryImages[nextIndex].src;


    const previousImage =
      new Image();

    previousImage.src =
      galleryImages[previousIndex].src;

  }


});