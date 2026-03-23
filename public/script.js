document.addEventListener("DOMContentLoaded", function() {

    // =========================================
    // 0. Language Switcher Logic
    // =========================================
    let currentLang = localStorage.getItem('site_lang') || 'vn';

    function applyLanguage(lang) {
        currentLang = lang;
        localStorage.setItem('site_lang', lang);
        
        // Update all elements with lang-text class
        document.querySelectorAll('.lang-text').forEach(el => {
            if (el.hasAttribute(`data-${lang}`)) {
                el.innerHTML = el.getAttribute(`data-${lang}`);
            }
        });

        // Update active state on language buttons
        document.querySelectorAll('.lang-btn').forEach(btn => {
            if (btn.getAttribute('data-lang') === lang) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });

        // Update current-lang-text label if a dropdown exists
        document.querySelectorAll('.current-lang-text').forEach(lbl => {
            lbl.textContent = lang.toUpperCase();
        });

        // Force a carousel update to ensure it translates instantly if it matches the current index
        if (typeof forceCarouselLanguageUpdate === 'function') {
            forceCarouselLanguageUpdate(lang);
        }

        // Update placeholders based on language (for date inputs)
        document.querySelectorAll('[data-placeholder-' + lang + ']').forEach(el => {
            el.placeholder = el.getAttribute('data-placeholder-' + lang);
        });
    }

    // Bind event listeners to language switcher buttons
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            applyLanguage(e.target.getAttribute('data-lang'));
        });
    });

    // Mobile Language Dropdown Logic
    const langDropdown = document.getElementById('mobileLangDropdown');
    const langSelected = document.getElementById('mobileLangSelected');
    const langOptions = document.getElementById('mobileLangOptions');

    if (langSelected && langOptions) {
        langSelected.addEventListener('click', (e) => {
            e.stopPropagation();
            langOptions.classList.toggle('show');
            langDropdown.classList.toggle('open');
        });

        // Close dropdown when selecting an option inside
        document.querySelectorAll('#mobileLangOptions .lang-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                langOptions.classList.remove('show');
                langDropdown.classList.remove('open');
            });
        });

        // Close dropdown when clicking absolutely outside
        document.addEventListener('click', (e) => {
            if (langDropdown && !langDropdown.contains(e.target)) {
                langOptions.classList.remove('show');
                langDropdown.classList.remove('open');
            }
        });
    }

    // Desktop Language Dropdown Logic
    const desktopLangDropdown = document.getElementById('desktopLangDropdown');
    const desktopLangSelected = document.getElementById('desktopLangSelected');
    const desktopLangOptions = document.getElementById('desktopLangOptions');

    if (desktopLangSelected && desktopLangOptions) {
        desktopLangSelected.addEventListener('click', (e) => {
            e.stopPropagation();
            desktopLangOptions.classList.toggle('show');
            desktopLangDropdown.classList.toggle('open');
        });

        document.querySelectorAll('#desktopLangOptions .lang-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                desktopLangOptions.classList.remove('show');
                desktopLangDropdown.classList.remove('open');
            });
        });

        document.addEventListener('click', (e) => {
            if (desktopLangDropdown && !desktopLangDropdown.contains(e.target)) {
                desktopLangOptions.classList.remove('show');
                desktopLangDropdown.classList.remove('open');
            }
        });
    }

    // Apply default language on load
    applyLanguage(currentLang);

    // =========================================
    // 1. Desktop Scroll Effect Logic
    // =========================================
    const navbar = document.getElementById("navbar");

    function handleScroll() {
        if (window.scrollY > 50) {
            if (window.innerWidth > 768) {
                navbar.classList.add("scrolled-desktop");
                navbar.classList.remove("scrolled-mobile");
            } else {
                navbar.classList.add("scrolled-mobile");
                navbar.classList.remove("scrolled-desktop");
            }
        } else {
            navbar.classList.remove("scrolled-desktop");
            navbar.classList.remove("scrolled-mobile");
        }
    }

    // Listen for scroll event
    window.addEventListener("scroll", handleScroll);
    // Listen for resize event to keep state correct
    window.addEventListener("resize", handleScroll);

    // =========================================
    // 1b. Smart Header Theme Detection
    // =========================================
    // This observer looks for sections with data-header-theme attribute
    // and updates the navbar class to ensure visibility.
    const headerThemeObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            // We care about sections that are currently at the top of the viewport
            // (intersecting with the top 100px)
            if (entry.isIntersecting) {
                const theme = entry.target.getAttribute('data-header-theme');
                if (theme === 'light') {
                    navbar.classList.add('on-light-bg');
                    navbar.classList.remove('on-dark-bg');
                } else if (theme === 'dark') {
                    navbar.classList.add('on-dark-bg');
                    navbar.classList.remove('on-light-bg');
                }
            }
        });
    }, {
        // Observe intersections with the top of the viewport
        rootMargin: "-0% 0% -90% 0%", 
        threshold: 0
    });

    // Observe all sections and specific elements that might change the background
    document.querySelectorAll('section, header, .about-page, .hero-section').forEach(el => {
        headerThemeObserver.observe(el);
    });


    // =========================================
    // 2. Mobile Menu GSAP Animation Logic
    // =========================================
    const hamburgerBtn = document.getElementById('hamburger-button');
    const mobileOverlay = document.getElementById('mobile-overlay');
    const mobileLinks = document.querySelectorAll('.mobile-link-item a');
    const socialIcons = document.querySelectorAll('.social-icon');

    let isMenuOpen = false;

    // Check if GSAP is loaded
    if (typeof gsap !== 'undefined') {
        // Initialize GSAP Timeline
        var menuTimeline = gsap.timeline({ paused: true, reversed: true });

        menuTimeline
            // 1. Fade in the background overlay
            .to(mobileOverlay, {
                duration: 0.3,
                autoAlpha: 1,
                ease: "power2.inOut"
            })
            // 2. Stagger in the Text Links (from bottom)
            .from(mobileLinks, {
                duration: 0.8,
                y: 60,
                opacity: 0,
                stagger: 0.1,
                ease: "expo.out"
            })
            // 3. Stagger in the Social Icons (from bottom)
            .from(socialIcons, {
                duration: 0.6,
                y: 30,
                opacity: 0,
                stagger: 0.05,
                ease: "back.out(1.7)" /* Slight bounce effect */
            }, "-=0.6"); // Start slightly before text finishes
    } else {
        console.warn("GSAP is not loaded. Mobile animations will be limited.");
    }

    if (hamburgerBtn) {
        hamburgerBtn.addEventListener('click', function() {
            hamburgerBtn.classList.toggle('is-active');

            if (!isMenuOpen) {
                if (typeof gsap !== 'undefined') menuTimeline.play();
                else mobileOverlay.classList.add('is-open'); // Fallback CSS class
                
                isMenuOpen = true;
                document.body.style.overflow = 'hidden';
            } else {
                if (typeof gsap !== 'undefined') menuTimeline.reverse();
                else mobileOverlay.classList.remove('is-open');
                
                isMenuOpen = false;
                document.body.style.overflow = '';
            }
        });
    }

    // Close menu when a link is clicked
    mobileLinks.forEach(link => {
        link.addEventListener('click', () => {
            if(isMenuOpen) {
                 hamburgerBtn.classList.remove('is-active');
                 if (typeof gsap !== 'undefined') menuTimeline.reverse();
                 else mobileOverlay.classList.remove('is-open');
                 
                 isMenuOpen = false;
                 document.body.style.overflow = '';
            }
        });
    });


    // =========================================
    // 3. Product Carousel Logic
    // =========================================
    const track = document.getElementById('carouselViewport');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');

    if (track && prevBtn && nextBtn) {
        // Helper to get scroll distance
        function getScrollAmount() {
            // We find the width of one card + the gap (20px)
            const card = document.querySelector('.product-card');
            if(card) {
                return card.offsetWidth + 20; 
            }
            return 220; // Default fallback
        }

        // Next Button
        nextBtn.addEventListener('click', () => {
            const amount = getScrollAmount();
            if (typeof gsap !== 'undefined') {
                gsap.to(track, { scrollLeft: track.scrollLeft + amount, duration: 0.5, ease: 'power2.out' });
            } else {
                track.scrollBy({ left: amount, behavior: 'smooth' });
            }
        });

        // Prev Button
        prevBtn.addEventListener('click', () => {
            const amount = getScrollAmount();
            if (typeof gsap !== 'undefined') {
                gsap.to(track, { scrollLeft: track.scrollLeft - amount, duration: 0.5, ease: 'power2.out' });
            } else {
                track.scrollBy({ left: -amount, behavior: 'smooth' });
            }
        });
    }

    // =========================================
    // 4. FAQ Accordion Logic
    // =========================================
    const faqQuestions = document.querySelectorAll('.faq-question');

    faqQuestions.forEach(question => {
        question.addEventListener('click', () => {
            const item = question.parentElement;
            const answer = item.querySelector('.faq-answer');
            
            // Check if already active
            const isActive = item.classList.contains('active');

            // Close all other FAQs (Optional - for accordion behavior)
            document.querySelectorAll('.faq-item').forEach(otherItem => {
                const otherAnswer = otherItem.querySelector('.faq-answer');
                otherItem.classList.remove('active');
                if(otherAnswer) otherAnswer.style.maxHeight = null;
            });

            // If it wasn't active before, open it
            if (!isActive) {
                item.classList.add('active');
                answer.style.maxHeight = answer.scrollHeight + "px";
            }
        });
    });

    // =========================================
    // 5. Location Carousel Logic
    // =========================================
    const locationData = [
        {
            bg: "Location/Location 1.png",
            sub_en: "VISIT OUR MAIN HERB APOTHECARY",
            sub_vn: "GHÉ THĂM TIỆM THUỐC CHÍNH CỦA CHÚNG TÔI",
            heading_en: "Outside the<br>Clinic",
            heading_vn: "Phòng Khám<br>phía ngoài",
            btnText_en: "Get Directions",
            btnText_vn: "Xem Đường Đi",
            btnLink: "https://www.google.com/maps/place/Ph%C3%B2ng+Y+H%E1%BB%8Dc+C%E1%BB%95+Truy%E1%BB%81n+An+B%C3%ACnh/@10.5085571,107.327058,455m/data=!3m1!1e3!4m6!3m5!1s0x3175a100125c7973:0x97569e0490503fa6!8m2!3d10.5082762!4d107.3262642!16s%2Fg%2F11mf93d8rf!5m1!1e1?authuser=0&entry=ttu&g_ep=EgoyMDI1MTIwOS4wIKXMDSoASAFQAw%3D%3D"
        },
        {
            bg: "Location/Location 2.png",
            sub_en: "HOLISTIC THERAPY & ACUPUNCTURE",
            sub_vn: "TRỊ LIỆU TOÀN DIỆN & CHÂM CỨU",
            heading_en: "Inside the<br>Clinic",
            heading_vn: "Phòng Khám<br>phía trong",
            btnText_en: "Get Directions",
            btnText_vn: "Xem Đường Đi",
            btnLink: "https://www.google.com/maps/place/Ph%C3%B2ng+Y+H%E1%BB%8Dc+C%E1%BB%95+Truy%E1%BB%81n+An+B%C3%ACnh/@10.5085571,107.327058,455m/data=!3m1!1e3!4m6!3m5!1s0x3175a100125c7973:0x97569e0490503fa6!8m2!3d10.5082762!4d107.3262642!16s%2Fg%2F11mf93d8rf!5m1!1e1?authuser=0&entry=ttu&g_ep=EgoyMDI1MTIwOS4wIKXMDSoASAFQAw%3D%3D"
        },
        {
            bg: "Location/Location 3.jpg",
            sub_en: "ELEVATE YOUR WELLNESS JOURNEY",
            sub_vn: "NÂNG TẦM HÀNH TRÌNH SỨC KHỎE CỦA BẠN",
            heading_en: "Experience<br>The Magic Of<br>Healing!",
            heading_vn: "Trải Nghiệm<br>Sự Kỳ Diệu Của<br>Trị Liệu!",
            btnText_en: "Book A Visit Now",
            btnText_vn: "Đặt Lịch Ngay",
            btnLink: "#booking"
        }
    ];

    const locBg = document.getElementById('locationBg');
    const locSub = document.getElementById('locationSub');
    const locHeading = document.getElementById('locationHeading');
    const locBtn = document.getElementById('locationBtn');
    const stepIndicators = document.querySelectorAll('.step-indicator');
    const progressBars = document.querySelectorAll('.step-progress');

    let currentLocIndex = 0;
    let autoPlayTimer;
    let progressTween;
    const CAROUSEL_INTERVAL = 8000; // 8 seconds

    // Exposed function to forcefully refresh active language attributes for Carousel items seamlessly
    window.forceCarouselLanguageUpdate = function(lang) {
        if (!locSub || !locHeading) return; // Prevent race conditions on first load
        const data = locationData[currentLocIndex];
        locSub.innerHTML = data[`sub_${lang}`];
        locHeading.innerHTML = data[`heading_${lang}`];
        locBtn.innerHTML = data[`btnText_${lang}`];
    };

    function updateCarouselInnerContent(data) {
        // Apply text content based on current language state immediately
        locSub.innerHTML = data[`sub_${currentLang}`];
        locHeading.innerHTML = data[`heading_${currentLang}`];
        locBtn.innerHTML = data[`btnText_${currentLang}`];
        locBtn.href = data.btnLink;

        // Preserve data translation bindings for the main language toggler switch
        locSub.setAttribute('data-en', data.sub_en);
        locSub.setAttribute('data-vn', data.sub_vn);
        locHeading.setAttribute('data-en', data.heading_en);
        locHeading.setAttribute('data-vn', data.heading_vn);
        locBtn.setAttribute('data-en', data.btnText_en);
        locBtn.setAttribute('data-vn', data.btnText_vn);

        // Required classes binding
        locSub.classList.add('lang-text');
        locHeading.classList.add('lang-text');
        locBtn.classList.add('lang-text');

        if (data.btnLink.startsWith("http")) locBtn.target = "_blank";
        else locBtn.target = "_self";
    }

    function updateCarousel(newIndex) {
        if (newIndex === currentLocIndex) return; // Ignore if clicking same
        
        // Setup GSAP crossfade timeline
        if (typeof gsap !== 'undefined') {
            const tl = gsap.timeline();
            
            // Fade out current text & bg
            tl.to([locSub, locHeading, locBtn], { opacity: 0, y: 10, duration: 0.3, stagger: 0.05, ease: "power1.inOut" })
              .to(locBg, { opacity: 0, duration: 0.4, ease: "power1.inOut" }, "-=0.2")
              .call(() => {
                  // Swap data
                  const data = locationData[newIndex];
                  locBg.src = data.bg;
                  updateCarouselInnerContent(data);
              })
              // Fade in new text & fade image back in
              .to(locBg, { opacity: 1, duration: 0.5, ease: "power1.inOut" })
              .to([locSub, locHeading, locBtn], { opacity: 1, y: 0, duration: 0.4, stagger: 0.1, ease: "power2.out" }, "-=0.3");
        } else {
            // Fallback without GSAP
            const data = locationData[newIndex];
            locBg.src = data.bg;
            updateCarouselInnerContent(data);
        }

        // Update active classes
        stepIndicators.forEach((ind, i) => {
            const circle = ind.querySelector('.step-circle');
            if (i === newIndex) circle.classList.add('active');
            else circle.classList.remove('active');
        });

        // Reset tracking variables
        currentLocIndex = newIndex;
        startAutoPlay();
    }

    function startAutoPlay() {
        if (autoPlayTimer) clearTimeout(autoPlayTimer);
        if (progressTween) progressTween.kill();
        
        const isMobile = window.innerWidth <= 768;

        // Reset ALL progress bars to 0
        progressBars.forEach(bar => {
            if (typeof gsap !== 'undefined') {
                gsap.set(bar, { 
                    width: isMobile ? "0%" : "100%", 
                    height: isMobile ? "100%" : "0%" 
                });
            }
        });

        const activeProgressBar = document.getElementById(`progress${currentLocIndex}`);
        
        if (activeProgressBar && typeof gsap !== 'undefined') {
            // Animate filling up the bar corresponding to current location over 8 seconds
            progressTween = gsap.to(activeProgressBar, {
                width: isMobile ? "100%" : "100%",
                height: isMobile ? "100%" : "100%",
                duration: CAROUSEL_INTERVAL / 1000,
                ease: "linear"
            });
        }

        autoPlayTimer = setTimeout(() => {
            let nextIndex = (currentLocIndex + 1) % locationData.length;
            updateCarousel(nextIndex);
        }, CAROUSEL_INTERVAL);
    }

    // Initialize Event Listeners for dots
    if (stepIndicators.length > 0 && locBg) {
        stepIndicators.forEach(ind => {
            ind.addEventListener('click', () => {
                const targetIndex = parseInt(ind.getAttribute('data-index'));
                updateCarousel(targetIndex);
            });
        });
        
        // Setup initial states
        gsap.set([locSub, locHeading, locBtn, locBg], { opacity: 1, y: 0 });
        
        // Start the automated carousel ONLY when visible
        const locationSection = document.getElementById('location');
        if (locationSection && typeof IntersectionObserver !== 'undefined') {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        startAutoPlay();
                        observer.unobserve(entry.target); // Only start it the first time it comes into view
                    }
                });
            }, { threshold: 0.3 }); // Trigger when 30% of the carousel is visible
            
            observer.observe(locationSection);
        } else {
            // Fallback if no IntersectionObserver
            startAutoPlay();
        }
    }

    // Featured slider logic removed (handled in blog.astro)

});

// =========================================
// 4. Hero Section Blur on Scroll
// =========================================
// Kept as an IIFE to run independently
(() => {
    const hero = document.querySelector('.hero-section');
    if (!hero) return;

    function updateBlur() {
        const rect = hero.getBoundingClientRect();
        const windowHeight = window.innerHeight;

        /* How much hero has scrolled out */
        const progress = Math.min(
            Math.max((windowHeight - rect.bottom) / windowHeight, 0),
            1
        );

        /* Blur curve (ease-in) */
        const blur = progress * progress * 12;

        hero.style.setProperty('--hero-blur', `${blur}px`);
    }

    window.addEventListener('scroll', updateBlur, { passive: true });
    updateBlur();
})();
