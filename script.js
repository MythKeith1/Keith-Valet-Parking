
"use strict";

/* =========================================================
   PARKLANE VALET
   Stage 3 — JavaScript
   Front-end portfolio demonstration only.
   No real bookings, payments, emails or data transmission.
========================================================= */

document.addEventListener("DOMContentLoaded", () => {
  /* -------------------------------------------------------
     1. HELPERS
  ------------------------------------------------------- */

  const $ = (selector, parent = document) =>
    parent.querySelector(selector);

  const $$ = (selector, parent = document) =>
    [...parent.querySelectorAll(selector)];

  const getValue = (form, selectors) => {
    for (const selector of selectors) {
      const field = $(selector, form);

      if (field && field.value !== undefined) {
        return field.value.trim();
      }
    }

    return "";
  };

  const setText = (selector, value, parent = document) => {
    const element = $(selector, parent);

    if (element) {
      element.textContent = value || "—";
    }
  };

  /* -------------------------------------------------------
     2. MOBILE NAVIGATION
  ------------------------------------------------------- */

  const menuToggle = $(".mobile-menu-toggle");
  const navigation = $(".main-navigation");
  const navigationLinks = $$(".navigation-link");

  const closeMenu = () => {
    if (!menuToggle || !navigation) return;

    menuToggle.classList.remove("is-active");
    navigation.classList.remove("is-open");
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", "Open navigation menu");
    document.body.classList.remove("menu-open");
  };

  if (menuToggle && navigation) {
    menuToggle.setAttribute("aria-expanded", "false");

    menuToggle.addEventListener("click", () => {
      const isOpen = navigation.classList.toggle("is-open");

      menuToggle.classList.toggle("is-active", isOpen);
      menuToggle.setAttribute("aria-expanded", String(isOpen));
      menuToggle.setAttribute(
        "aria-label",
        isOpen ? "Close navigation menu" : "Open navigation menu"
      );

      document.body.classList.toggle("menu-open", isOpen);
    });

    navigationLinks.forEach((link) => {
      link.addEventListener("click", closeMenu);
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") closeMenu();
    });

    window.addEventListener("resize", () => {
      if (window.innerWidth > 850) closeMenu();
    });
  }

  /* -------------------------------------------------------
     3. HEADER SCROLL EFFECT
  ------------------------------------------------------- */

  const header = $(".site-header");

  const updateHeader = () => {
    if (!header) return;

    header.classList.toggle("is-scrolled", window.scrollY > 30);
  };

  updateHeader();
  window.addEventListener("scroll", updateHeader, { passive: true });

  /* -------------------------------------------------------
     4. ACTIVE NAVIGATION LINK
  ------------------------------------------------------- */

  const sections = $$("main section[id]");
  const navLinksWithTargets = navigationLinks.filter((link) => {
    const href = link.getAttribute("href");
    return href && href.startsWith("#") && $(href);
  });

  if ("IntersectionObserver" in window && sections.length) {
    const sectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          navLinksWithTargets.forEach((link) => {
            const isCurrent =
              link.getAttribute("href") === `#${entry.target.id}`;

            link.classList.toggle("is-active", isCurrent);

            if (isCurrent) {
              link.setAttribute("aria-current", "location");
            } else {
              link.removeAttribute("aria-current");
            }
          });
        });
      },
      {
        rootMargin: "-35% 0px -55% 0px",
        threshold: 0
      }
    );

    sections.forEach((section) => sectionObserver.observe(section));
  }

  /* -------------------------------------------------------
     5. PACKAGE SELECTION
  ------------------------------------------------------- */

  const packageCards = $$(".package-card");
  const packageButtons = $$(".package-select");

  const bookingSection = $("#booking");
  const bookingForm =
    $("#bookingForm") ||
    $('form[data-booking-form]') ||
    $(".booking-form-wrapper form");

  const packageInput = bookingForm
    ? $(
        '[name="package"], [name="selectedPackage"], #selectedPackage, [data-package-input]',
        bookingForm
      )
    : null;

  const bookingSummary = $(".booking-summary");

  let selectedPackage = null;

  const readPackageDetails = (button) => {
    const card = button.closest(".package-card");

    if (!card) return null;

    const titleElement =
      $(".package-top h3", card) ||
      $("h3", card) ||
      $("[data-package-name]", card);

    const priceElement =
      $(".price-value", card) ||
      $("[data-package-price]", card);

    const currencyElement = $(".price-currency", card);
    const periodElement = $(".price-period", card);

    return {
      name:
        card.dataset.package ||
        (titleElement ? titleElement.textContent.trim() : "Selected package"),

      price:
        card.dataset.price ||
        (priceElement ? priceElement.textContent.trim() : ""),

      currency:
        card.dataset.currency ||
        (currencyElement ? currencyElement.textContent.trim() : ""),

      period:
        periodElement ? periodElement.textContent.trim() : "",

      card
    };
  };

  const updatePackageInput = (details) => {
    if (!packageInput) return;

    if (packageInput.tagName === "SELECT") {
      const options = [...packageInput.options];

      const matchingOption = options.find((option) => {
        const optionText = option.textContent.trim().toLowerCase();
        const optionValue = option.value.trim().toLowerCase();
        const packageName = details.name.toLowerCase();

        return (
          optionText.includes(packageName) ||
          optionValue === packageName
        );
      });

      if (matchingOption) {
        packageInput.value = matchingOption.value;
      }
    } else if (packageInput.type === "radio") {
      const matchingRadio = $$(
        'input[type="radio"]',
        bookingForm
      ).find((radio) => {
        const label = $(`label[for="${radio.id}"]`);

        return (
          radio.value.toLowerCase() === details.name.toLowerCase() ||
          (label &&
            label.textContent.toLowerCase().includes(
              details.name.toLowerCase()
            ))
        );
      });

      if (matchingRadio) matchingRadio.checked = true;
    } else {
      packageInput.value = details.name;
    }

    packageInput.dispatchEvent(new Event("change", { bubbles: true }));
  };

  const updatePackageSummary = (details) => {
    if (!bookingSummary) return;

    setText(
      '[data-summary="package"], #summaryPackage',
      details.name,
      bookingSummary
    );

    const priceText = [details.currency, details.price, details.period]
      .filter(Boolean)
      .join(" ");

    setText(
      '[data-summary="price"], #summaryPrice',
      priceText || "See package details",
      bookingSummary
    );

    bookingSummary.classList.add("has-selection");
  };

  const selectPackage = (button) => {
    const details = readPackageDetails(button);

    if (!details) return;

    selectedPackage = details;

    packageCards.forEach((card) => {
      const isSelected = card === details.card;

      card.classList.toggle("is-selected", isSelected);

      if (isSelected) {
        card.setAttribute("aria-current", "true");
      } else {
        card.removeAttribute("aria-current");
      }
    });

    updatePackageInput(details);
    updatePackageSummary(details);

    packageButtons.forEach((packageButton) => {
      const isSelected = packageButton === button;

      packageButton.classList.toggle("is-selected", isSelected);
      packageButton.setAttribute(
        "aria-pressed",
        String(isSelected)
      );
    });

    const selectionNote = $(".package-selection-note");

    if (selectionNote) {
      selectionNote.textContent = `${details.name} selected. Continue with your booking details.`;
    }
  };

  packageButtons.forEach((button) => {
    button.setAttribute("aria-pressed", "false");

    button.addEventListener("click", () => {
      selectPackage(button);

      if (bookingSection) {
        bookingSection.scrollIntoView({
          behavior: "smooth",
          block: "start"
        });
      }
    });
  });

  /* -------------------------------------------------------
     6. BOOKING SUMMARY
  ------------------------------------------------------- */

  const updateBookingSummary = () => {
    if (!bookingForm || !bookingSummary) return;

    const summaryFields = {
      name: [
        '[name="name"]',
        '[name="fullName"]',
        "#bookingName"
      ],
      email: [
        '[name="email"]',
        "#bookingEmail"
      ],
      phone: [
        '[name="phone"]',
        '[name="telephone"]',
        "#bookingPhone"
      ],
      vehicle: [
        '[name="vehicle"]',
        '[name="vehicleType"]',
        "#vehicleType"
      ],
      dropoff: [
        '[name="dropoffDate"]',
        '[name="arrivalDate"]',
        '[name="departureDate"]',
        "#dropoffDate"
      ],
      pickup: [
        '[name="pickupDate"]',
        '[name="returnDate"]',
        "#pickupDate"
      ]
    };

    Object.entries(summaryFields).forEach(([key, selectors]) => {
      const value = getValue(bookingForm, selectors);

      setText(`[data-summary="${key}"]`, value, bookingSummary);
      setText(`#summary${key.charAt(0).toUpperCase() + key.slice(1)}`, value, bookingSummary);
    });

    if (selectedPackage) {
      updatePackageSummary(selectedPackage);
    }
  };

  if (bookingForm) {
    bookingForm.addEventListener("input", updateBookingSummary);
    bookingForm.addEventListener("change", updateBookingSummary);
  }

  /* -------------------------------------------------------
     7. DATE VALIDATION
  ------------------------------------------------------- */

  const dateFields = bookingForm
    ? $$('input[type="date"], input[type="datetime-local"]', bookingForm)
    : [];

  const dropoffField = bookingForm
    ? $(
        '[name="dropoffDate"], [name="arrivalDate"], [name="departureDate"], #dropoffDate',
        bookingForm
      )
    : null;

  const pickupField = bookingForm
    ? $(
        '[name="pickupDate"], [name="returnDate"], #pickupDate',
        bookingForm
      )
    : null;

  const today = new Date();
  const localToday = new Date(
    today.getTime() - today.getTimezoneOffset() * 60000
  )
    .toISOString()
    .slice(0, 10);

  dateFields.forEach((field) => {
    if (field.type === "date" && !field.min) {
      field.min = localToday;
    }
  });

  const validateDates = () => {
    if (!dropoffField || !pickupField) return true;

    pickupField.setCustomValidity("");

    if (!dropoffField.value || !pickupField.value) {
      return true;
    }

    const dropoffDate = new Date(dropoffField.value);
    const pickupDate = new Date(pickupField.value);

    if (pickupDate <= dropoffDate) {
      pickupField.setCustomValidity(
        "Your collection date and time must be after your drop-off date and time."
      );

      return false;
    }

    return true;
  };

  [dropoffField, pickupField].forEach((field) => {
    if (!field) return;

    field.addEventListener("change", () => {
      validateDates();

      if (dropoffField.value && pickupField) {
        pickupField.min = dropoffField.value;
      }
    });
  });

  /* -------------------------------------------------------
     8. BOOKING FORM SUBMISSION
  ------------------------------------------------------- */

  const bookingSuccess = $(".booking-success");

  const generateReference = () => {
    const randomPart = Math.random()
      .toString(36)
      .substring(2, 7)
      .toUpperCase();

    const timePart = Date.now().toString().slice(-5);

    return `PLV-${timePart}-${randomPart}`;
  };

  const displayBookingConfirmation = (reference) => {
    if (!bookingSuccess) return;

    const referenceElement =
      $("[data-booking-reference]", bookingSuccess) ||
      $(".success-reference", bookingSuccess);

    if (referenceElement) {
      referenceElement.textContent = reference;
    }

    const customerName = bookingForm
      ? getValue(bookingForm, [
          '[name="name"]',
          '[name="fullName"]',
          "#bookingName"
        ])
      : "";

    const firstName = customerName.split(" ")[0];

    const greeting = $("[data-success-name]", bookingSuccess);

    if (greeting) {
      greeting.textContent = firstName
        ? `Thank you, ${firstName}.`
        : "Thank you for trying the booking experience.";
    }

    bookingSuccess.hidden = false;
    bookingSuccess.setAttribute("aria-live", "polite");

    if (bookingForm) {
      bookingForm.hidden = true;
    }

    bookingSuccess.scrollIntoView({
      behavior: "smooth",
      block: "center"
    });
  };

  if (bookingForm) {
    bookingForm.addEventListener("submit", (event) => {
      event.preventDefault();

      if (!validateDates()) {
        pickupField.reportValidity();
        return;
      }

      if (!bookingForm.checkValidity()) {
        bookingForm.reportValidity();
        return;
      }

      const reference = generateReference();

      displayBookingConfirmation(reference);

      console.info(
        "PARKLANE VALET demo booking completed:",
        reference
      );
    });
  }

  /* -------------------------------------------------------
     9. FAQ ACCORDION
  ------------------------------------------------------- */

  const faqItems = $$(".faq-item");

  faqItems.forEach((item) => {
    const toggle = $(".faq-toggle", item);
    const answer = $(".faq-answer", item);

    if (!toggle || !answer) return;

    const answerId =
      answer.id ||
      `faq-answer-${Math.random().toString(36).slice(2, 8)}`;

    answer.id = answerId;
    toggle.setAttribute("aria-controls", answerId);

    const initiallyOpen =
      item.classList.contains("is-open") ||
      toggle.getAttribute("aria-expanded") === "true";

    toggle.setAttribute("aria-expanded", String(initiallyOpen));

    if (!initiallyOpen) {
      answer.hidden = true;
    }

    toggle.addEventListener("click", () => {
      const isOpen =
        toggle.getAttribute("aria-expanded") === "true";

      toggle.setAttribute("aria-expanded", String(!isOpen));
      item.classList.toggle("is-open", !isOpen);
      answer.hidden = isOpen;
    });
  });

  /* -------------------------------------------------------
     10. CONTACT FORM DEMO FEEDBACK
  ------------------------------------------------------- */

  const contactForm =
    $("#contactForm") ||
    $('form[data-contact-form]') ||
    $(".contact-form-wrapper form");

  const contactFeedback = $(".contact-feedback");

  if (contactForm) {
    contactForm.addEventListener("submit", (event) => {
      event.preventDefault();

      if (!contactForm.checkValidity()) {
        contactForm.reportValidity();
        return;
      }

      if (contactFeedback) {
        contactFeedback.textContent =
          "Thanks for testing the Parklane Valet contact form. This is a portfolio demo; no message has been sent.";

        contactFeedback.hidden = false;
        contactFeedback.setAttribute("role", "status");
      }

      contactForm.reset();
    });
  }

  /* -------------------------------------------------------
     11. BACK TO TOP
  ------------------------------------------------------- */

  const backToTop = $(".back-to-top");

  if (backToTop) {
    backToTop.addEventListener("click", (event) => {
      const href = backToTop.getAttribute("href");

      if (!href || href === "#") {
        event.preventDefault();

        window.scrollTo({
          top: 0,
          behavior: "smooth"
        });
      }
    });
  }

  /* -------------------------------------------------------
     12. CURRENT YEAR
  ------------------------------------------------------- */

  $$("[data-current-year]").forEach((element) => {
    element.textContent = new Date().getFullYear();
  });

  /* -------------------------------------------------------
     13. INITIAL STATE
  ------------------------------------------------------- */

  if (bookingSuccess && !bookingSuccess.hasAttribute("hidden")) {
    bookingSuccess.hidden = true;
  }

  if (bookingForm) {
    updateBookingSummary();
  }

  console.info("PARKLANE VALET JavaScript initialized.");
});
