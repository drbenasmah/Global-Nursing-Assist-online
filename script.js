document.addEventListener("DOMContentLoaded", () => {
  // --- Helper Function for Email Validation ---
  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
  };

  // --- Mobile Navigation ---
  const navToggle = document.getElementById("nav-toggle");
  const navMenu = document.getElementById("nav-menu");
  if (navToggle && navMenu) {
    navToggle.addEventListener("click", () => {
      navMenu.classList.toggle("active");
      navToggle.classList.toggle("active");
    });
    document.querySelectorAll(".nav-link").forEach((link) => {
      link.addEventListener("click", () => {
        navMenu.classList.remove("active");
        navToggle.classList.remove("active");
      });
    });
  }

  // --- Smooth Scrolling for All Anchor Links & Buttons ---
  document
    .querySelectorAll('a[href^="#"], [data-scroll-to]')
    .forEach((trigger) => {
      trigger.addEventListener("click", function (e) {
        e.preventDefault();
        const targetId =
          this.dataset.scrollTo || this.getAttribute("href").substring(1);
        const targetElement = document.getElementById(targetId);
        if (targetElement) {
          const navbarHeight = document.querySelector(".navbar").offsetHeight;
          const targetPosition =
            targetElement.getBoundingClientRect().top +
            window.pageYOffset -
            navbarHeight;

          window.scrollTo({
            top: targetPosition,
            behavior: "smooth",
          });
        }
      });
    });

  // --- Dynamic Navbar Styling on Scroll ---
  const navbar = document.querySelector(".navbar");
  if (navbar) {
    window.addEventListener("scroll", () => {
      if (window.scrollY > 50) {
        navbar.classList.add("scrolled");
      } else {
        navbar.classList.remove("scrolled");
      }
    });
  }

  // --- Animated Hero Stats Counter ---
  const statsSection = document.querySelector(".hero-stats");
  const statNumbers = document.querySelectorAll(".stat-number");
  const animateStat = (element) => {
    const originalText = element.textContent;
    const targetValue = parseInt(originalText, 10);
    const duration = 2000;
    const frameRate = 1000 / 60;
    const totalFrames = Math.round(duration / frameRate);
    let currentFrame = 0;

    const counter = setInterval(() => {
      currentFrame++;
      const progress = currentFrame / totalFrames;
      const currentValue = Math.round(targetValue * progress);
      element.textContent = currentValue;

      if (currentFrame === totalFrames) {
        clearInterval(counter);
        element.textContent = originalText; // Set back to original text like "500+"
      }
    }, frameRate);
  };
  const statObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          statNumbers.forEach((numberEl) => animateStat(numberEl));
          observer.unobserve(statsSection); // Run only once
        }
      });
    },
    { threshold: 0.5 }
  );
  if (statsSection) {
    statObserver.observe(statsSection);
  }

  // --- Resource Download Buttons ---
  const downloadButtons = document.querySelectorAll("[data-download-id]");
  const resources = {
    "malta-interview": "Malta Interview Recall Guide",
    "thesis-templates": "Nursing Thesis Templates",
    "ielts-samples": "IELTS Sample Answers for Nurses",
  };
  downloadButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const resourceId = button.dataset.downloadId;
      const resourceName = resources[resourceId] || "the selected resource";
      const email = prompt(`Enter your email to download "${resourceName}":`);
      if (email && validateEmail(email)) {
        alert(`Thank you! "${resourceName}" will be sent to ${email}.`);
      } else if (email) {
        alert("Please enter a valid email address.");
      }
    });
  });

  // --- Animate Elements on Scroll (Intersection Observer) ---
  const animatedElements = document.querySelectorAll(
    ".service-card, .testimonial-card, .resource-card, .article-card, .highlight"
  );
  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("fade-in-up");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );
    animatedElements.forEach((el) => observer.observe(el));
  }

  // --- Active Navigation Link Highlighting on Scroll ---
  const sections = document.querySelectorAll("section[id]");
  const navLinks = document.querySelectorAll(".nav-menu a.nav-link");
  window.addEventListener("scroll", () => {
    let current = "";
    const navbarHeight = document.querySelector(".navbar").offsetHeight;
    sections.forEach((section) => {
      const sectionTop = section.offsetTop;
      if (pageYOffset >= sectionTop - navbarHeight) {
        current = section.getAttribute("id");
      }
    });
    navLinks.forEach((link) => {
      link.classList.remove("active");
      if (link.getAttribute("href") === `#${current}`) {
        link.classList.add("active");
      }
    });
  });

  // --- Dynamic Copyright Year ---
  const yearSpan = document.getElementById("current-year");
  if (yearSpan) {
    yearSpan.textContent = new Date().getFullYear();
  }

  // --- Inject CSS for animations ---
  const style = document.createElement("style");
  style.textContent = `
    .fade-in-up {
        opacity: 1 !important;
        transform: translateY(0) !important;
    }
    .service-card, .testimonial-card, .resource-card, .article-card, .highlight {
        opacity: 0;
        transform: translateY(20px);
        transition: opacity 0.6s ease-out, transform 0.6s ease-out;
    }
  `;
  document.head.appendChild(style);
});
