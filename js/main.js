(function () {
  "use strict";

  const header = document.querySelector("[data-header]");
  const navLinks = Array.from(document.querySelectorAll(".nav-link"));
  const currentPath = window.location.pathname.endsWith("/")
    ? `${window.location.pathname}index.html`
    : window.location.pathname;
  const sectionNavLinks = navLinks.filter((link) => {
    const url = new URL(link.href, window.location.href);
    const linkPath = url.pathname.endsWith("/") ? `${url.pathname}index.html` : url.pathname;
    return url.hash && linkPath === currentPath;
  });
  const sections = sectionNavLinks
    .map((link) => document.querySelector(new URL(link.href, window.location.href).hash))
    .filter(Boolean);
  const yearNode = document.querySelector("[data-year]");
  const navbarCollapse = document.getElementById("primaryNav");
  const contactForm = document.querySelector("[data-contact-form]");

  if (yearNode) {
    yearNode.textContent = new Date().getFullYear();
  }

  const setHeaderState = () => {
    if (!header) return;
    header.classList.toggle("is-scrolled", window.scrollY > 8);
  };

  setHeaderState();
  window.addEventListener("scroll", setHeaderState, { passive: true });

  if ("IntersectionObserver" in window) {
    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.14 }
    );

    document.querySelectorAll(".reveal").forEach((element) => {
      revealObserver.observe(element);
    });

    const sectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const activeLink = sectionNavLinks.find((link) => {
            return new URL(link.href, window.location.href).hash === `#${entry.target.id}`;
          });

          sectionNavLinks.forEach((link) => link.classList.remove("active"));
          if (activeLink) activeLink.classList.add("active");
        });
      },
      {
        rootMargin: "-40% 0px -55% 0px",
        threshold: 0
      }
    );

    sections.forEach((section) => sectionObserver.observe(section));
  } else {
    document.querySelectorAll(".reveal").forEach((element) => {
      element.classList.add("is-visible");
    });
  }

  navLinks.forEach((link) => {
    link.addEventListener("click", () => {
      if (!navbarCollapse || !navbarCollapse.classList.contains("show")) return;
      if (!window.bootstrap || !window.bootstrap.Collapse) return;
      const collapse = window.bootstrap.Collapse.getOrCreateInstance(navbarCollapse);
      collapse.hide();
    });
  });

  if (navbarCollapse) {
    navbarCollapse.addEventListener("show.bs.collapse", () => {
      document.body.classList.add("nav-open");
    });

    navbarCollapse.addEventListener("hidden.bs.collapse", () => {
      document.body.classList.remove("nav-open");
    });
  }

  if (contactForm) {
    const statusNode = contactForm.querySelector("[data-form-status]");
    const recipient = "alexreji8543@gmail.com";

    const fields = {
      name: contactForm.elements.name,
      email: contactForm.elements.email,
      subject: contactForm.elements.subject,
      message: contactForm.elements.message
    };

    const setError = (fieldName, message) => {
      const field = fields[fieldName];
      const errorNode = contactForm.querySelector(`[data-error-for="${fieldName}"]`);

      if (field) field.setAttribute("aria-invalid", message ? "true" : "false");
      if (errorNode) errorNode.textContent = message;
    };

    const validate = () => {
      let valid = true;
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      Object.keys(fields).forEach((fieldName) => setError(fieldName, ""));

      if (!fields.name.value.trim()) {
        setError("name", "Please enter your name.");
        valid = false;
      }

      if (!emailPattern.test(fields.email.value.trim())) {
        setError("email", "Please enter a valid email address.");
        valid = false;
      }

      if (!fields.subject.value.trim()) {
        setError("subject", "Please enter a subject.");
        valid = false;
      }

      if (!fields.message.value.trim()) {
        setError("message", "Please enter your message.");
        valid = false;
      }

      return valid;
    };

    contactForm.addEventListener("submit", (event) => {
      event.preventDefault();

      if (statusNode) statusNode.textContent = "";
      if (!validate()) {
        if (statusNode) statusNode.textContent = "Please complete the highlighted fields.";
        return;
      }

      const subject = fields.subject.value.trim();
      const body = [
        `Name: ${fields.name.value.trim()}`,
        `Email: ${fields.email.value.trim()}`,
        "",
        fields.message.value.trim()
      ].join("\n");
      const mailtoUrl = `mailto:${recipient}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

      window.location.href = mailtoUrl;
      if (statusNode) statusNode.textContent = "Email draft opened.";
    });
  }
})();
document.addEventListener("keydown", function (e) {
  if (e.ctrlKey && (e.key === "p" || e.key === "P")) {
    e.preventDefault();

    const printWindow = window.open("pdf/Alex_Reji_Resume.pdf");

    if (printWindow) {
      printWindow.onload = function () {
        printWindow.print();
      };
    }
  }
});
