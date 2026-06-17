document.addEventListener('DOMContentLoaded', () => {
    
    // --- Supabase Configuration ---
    const SUPABASE_URL = 'https://wirusfreyshiejyrjdwt.supabase.co';
    const SUPABASE_ANON_KEY = 'sb_publishable_uF9XeQ1WLujis5ynxryNzg_GgG6N7hb';
    const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

    
    // --- 1. Kirifuda-Style Smooth Custom Follower Cursor ---
    const customCursor = document.getElementById('customCursor');
    let clientX = -100, clientY = -100;
    let cursorX = -100, cursorY = -100;
    const cursorSpeed = 0.16; // Lerp ease factor

    document.addEventListener('mousemove', (e) => {
        clientX = e.clientX;
        clientY = e.clientY;
    });

    const updateCursor = () => {
        cursorX += (clientX - cursorX) * cursorSpeed;
        cursorY += (clientY - cursorY) * cursorSpeed;
        
        customCursor.style.transform = `translate3d(${cursorX}px, ${cursorY}px, 0) translate(-50%, -50%)`;
        requestAnimationFrame(updateCursor);
    };
    requestAnimationFrame(updateCursor);

    // Apply hover states
    const addCursorHoverListeners = () => {
        document.querySelectorAll('button, input, select, a, .pamphlet-card, .nav-item').forEach(el => {
            if (el.dataset.hasCursorListener) return;
            el.addEventListener('mouseenter', () => customCursor.classList.add('hover'));
            el.addEventListener('mouseleave', () => customCursor.classList.remove('hover'));
            el.dataset.hasCursorListener = 'true';
        });
    };
    addCursorHoverListeners();

    // --- 2. Slides & Metadata Definitions ---
    const slidesData = [
        {
            indexText: "EVENT 01 / 05",
            label1: "VENUE",    client: "KURRY & KABAB",
            label2: "EVENT",    type:   "FIFA WORLD CUP '26",
            label3: "STREAM",   stage:  "ZEE5 OFFICIAL",
            label4: "KICKOFF",  date:   "JUNE 2026",
            instruction: "Scroll down or tap RSVP to register your spot. WhatsApp confirmation once threshold is reached."
        },
        {
            indexText: "EVENT 02 / 05",
            label1: "STEP",     client: "HOW IT WORKS",
            label2: "REGISTER", type:   "YOUR NUMBER",
            label3: "CONFIRM",  stage:  "VIA WHATSAPP",
            label4: "WHEN",     date:   "JUNE 2026",
            instruction: "Register with your WhatsApp number. We confirm the night once enough people sign up."
        },
        {
            indexText: "EVENT 03 / 05",
            label1: "PACKAGE",  client: "WHATS INCLUDED",
            label2: "INCLUDED", type:   "SNACKS + DRINKS",
            label3: "BEER",     stage:  "21+ · ID REQUIRED",
            label4: "PRICING",  date:   "PER PERSON",
            instruction: "Snacks & soft drinks included per person. Beer extra (21+ with valid ID)."
        },
        {
            indexText: "EVENT 04 / 05",
            label1: "ACTION",   client: "REGISTER NOW",
            label2: "LIMIT",    type:   "1 PER NUMBER",
            label3: "NOTIFY",   stage:  "WHATSAPP RSVP",
            label4: "COST",     date:   "FREE TO JOIN",
            instruction: "One WhatsApp number = one spot. Price & time sent once we confirm the night."
        },
        {
            indexText: "EVENT 05 / 05",
            label1: "NAME",     client: "KURRY & KABAB",
            label2: "TYPE",     type:   "LOCAL RESTAURANT",
            label3: "NIGHTS",   stage:  "FIFA MATCH NIGHTS",
            label4: "SEASON",   date:   "JUNE–JULY 2026",
            instruction: "Good food, great vibes and live FIFA 2026 on Zee5. Come enjoy the World Cup!"
        }
    ];

    // Elements
    const preloader = document.getElementById('preloader');
    const loadingBarFill = document.querySelector('.loading-bar-fill');
    
    const pamphletAdvert = document.getElementById('pamphletAdvert');
    const enterAppBtn = document.getElementById('enterAppBtn');
    
    const appContainer = document.getElementById('appContainer');
    const slidesContainer = document.getElementById('slidesContainer');
    const slides = document.querySelectorAll('.slide');
    const navItems = document.querySelectorAll('.nav-item');
    const glitchOverlay = document.getElementById('glitchOverlay');
    
    // Metadata elements — values
    const metaIndex   = document.getElementById('metaIndex');
    const metaClient  = document.getElementById('metaClient');
    const metaType    = document.getElementById('metaType');
    const metaAgency  = document.getElementById('metaAgency');
    const metaDate    = document.getElementById('metaDate');
    const metaInstruction = document.getElementById('metaInstruction');
    // Metadata elements — labels (change per slide)
    const metaLabel1  = document.getElementById('metaLabel1');
    const metaLabel2  = document.getElementById('metaLabel2');
    const metaLabel3  = document.getElementById('metaLabel3');
    const metaLabel4  = document.getElementById('metaLabel4');

    // Helper: instantly swap label text with a quick fade
    function updateLabels(data) {
        [metaLabel1, metaLabel2, metaLabel3, metaLabel4].forEach(el => {
            if (el) el.style.opacity = '0';
        });
        setTimeout(() => {
            if (metaLabel1) { metaLabel1.innerText = data.label1; metaLabel1.style.opacity = '1'; }
            if (metaLabel2) { metaLabel2.innerText = data.label2; metaLabel2.style.opacity = '1'; }
            if (metaLabel3) { metaLabel3.innerText = data.label3; metaLabel3.style.opacity = '1'; }
            if (metaLabel4) { metaLabel4.innerText = data.label4; metaLabel4.style.opacity = '1'; }
        }, 180);
    }

    // RSVP Form Elements
    const form = document.getElementById('enquiryForm');
    const phoneInput = document.getElementById('phone');
    const phoneError = document.getElementById('phoneError');
    const submitBtn = document.getElementById('submitBtn');
    const btnText = document.querySelector('.btn-text');
    const loader = document.querySelector('.loader');
    
    const currentEnquiriesEl = document.getElementById('currentEnquiries');
    const targetEnquiriesEl = document.getElementById('targetEnquiries');
    // Phone input — format as user types
    phoneInput.addEventListener('keydown', (e) => {
        // Allow: backspace, delete, tab, escape, enter, arrows
        const allowedKeys = ['Backspace','Delete','Tab','Escape','Enter','ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Home','End','+'];
        if (allowedKeys.includes(e.key)) return;
        // Allow digits only
        if (!/[0-9]/.test(e.key)) e.preventDefault();
    });
    const progressBar = document.getElementById('progressBar');
    
    const formSection = document.getElementById('formSection');
    const successSection = document.getElementById('successSection');
    const displayPhone = document.getElementById('displayPhone');
    
    const alreadySection = document.getElementById('alreadySection');
    const alreadyTotalCount = document.getElementById('alreadyTotalCount');

    let currentSlideIndex = 0;
    let isTransitioning = false;
    let totalEnquiries = 0;
    let targetGoal = 50;

    // --- 3. Text Scrambler Effect (Kirifuda style) ---
    function scrambleText(element, finalString, duration = 500) {
        if (!element) return;
        const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789[]#&%=-";
        const length = finalString.length;
        let frame = 0;
        const totalFrames = Math.floor(duration / 30);
        
        const interval = setInterval(() => {
            let output = "";
            for (let i = 0; i < length; i++) {
                if (finalString[i] === '\n') {
                    output += '\n';
                } else if (finalString[i] === ' ') {
                    output += ' ';
                } else {
                    const resolveRatio = frame / totalFrames;
                    if (Math.random() < resolveRatio) {
                        output += finalString[i];
                    } else {
                        output += chars[Math.floor(Math.random() * chars.length)];
                    }
                }
            }
            element.innerText = output;
            
            frame++;
            if (frame >= totalFrames) {
                clearInterval(interval);
                element.innerText = finalString;
            }
        }, 30);
    }

    // --- 4. Glitch Grid Transition Overlay (Screenshot 2 style) ---
    function triggerGlitchTransition(currentTitleText) {
        glitchOverlay.innerHTML = '';
        
        // Spawn 9 tiles (3x3 grid)
        for (let i = 0; i < 9; i++) {
            const tile = document.createElement('div');
            tile.className = 'glitch-tile';
            
            const textSpan = document.createElement('span');
            textSpan.className = 'glitch-tile-text';
            
            // Randomly scramble some tiles completely, others partially
            if (Math.random() > 0.4) {
                const scrambled = currentTitleText.split('').map(c => 
                    c === ' ' ? ' ' : "WxaHmkbFE"[Math.floor(Math.random() * 9)]
                ).join('');
                textSpan.innerText = scrambled;
            } else {
                textSpan.innerText = currentTitleText;
            }
            
            tile.appendChild(textSpan);
            glitchOverlay.appendChild(tile);
        }
        
        glitchOverlay.classList.remove('hidden');
        glitchOverlay.getBoundingClientRect();
        glitchOverlay.classList.add('active');
        
        setTimeout(() => {
            glitchOverlay.classList.remove('active');
            setTimeout(() => {
                glitchOverlay.classList.add('hidden');
            }, 150);
        }, 350);
    }

    // --- 5. Navigation / Slide Engine ---
    const changeSlide = (index) => {
        if (index < 0 || index >= slides.length || index === currentSlideIndex) return;
        isTransitioning = true;
        
        // Find current title
        const currentTitleElement = slides[currentSlideIndex].querySelector('.slide-title');
        const nextTitleElement = slides[index].querySelector('.slide-title');
        const titleText = nextTitleElement ? nextTitleElement.getAttribute('data-text') : "FIFA";
        
        // Trigger Glitch Overlay and scramble text
        triggerGlitchTransition(titleText);
        
        // Slide out current, slide in next
        slides[currentSlideIndex].classList.remove('active');
        navItems.forEach(item => {
            const dataIdx = parseInt(item.getAttribute('data-index'));
            if (dataIdx === index || (index < 3 && dataIdx === 0)) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });
        
        currentSlideIndex = index;
        
        setTimeout(() => {
            slides[currentSlideIndex].classList.add('active');
            
            // Scramble active slide content
            const activeTitle = slides[currentSlideIndex].querySelector('.slide-title');
            const activeSubtitle = slides[currentSlideIndex].querySelector('.slide-subtitle');
            
            if (activeTitle) scrambleText(activeTitle, activeTitle.getAttribute('data-text'), 600);
            if (activeSubtitle) scrambleText(activeSubtitle, activeSubtitle.getAttribute('data-text'), 800);
            
            // Update & scramble left metadata panel (values + labels)
            const data = slidesData[currentSlideIndex];
            updateLabels(data);
            scrambleText(metaIndex, data.indexText, 400);
            scrambleText(metaClient, data.client, 500);
            scrambleText(metaType, data.type, 500);
            scrambleText(metaAgency, data.stage, 600);
            scrambleText(metaDate, data.date, 600);
            metaInstruction.innerText = data.instruction;
            
            isTransitioning = false;
        }, 200);
    };

    // Scroll Wheel support
    window.addEventListener('wheel', (e) => {
        if (!appContainer.classList.contains('active') || isTransitioning) return;
        if (e.deltaY > 20) {
            changeSlide(currentSlideIndex + 1);
        } else if (e.deltaY < -20) {
            changeSlide(currentSlideIndex - 1);
        }
    }, { passive: true });

    // Touch Swipe support
    let touchStartY = 0;
    window.addEventListener('touchstart', (e) => {
        touchStartY = e.touches[0].clientY;
    }, { passive: true });

    window.addEventListener('touchend', (e) => {
        if (!appContainer.classList.contains('active') || isTransitioning) return;
        const touchEndY = e.changedTouches[0].clientY;
        const diffY = touchStartY - touchEndY;
        
        if (diffY > 40) {
            changeSlide(currentSlideIndex + 1);
        } else if (diffY < -40) {
            changeSlide(currentSlideIndex - 1);
        }
    }, { passive: true });

    // Nav click handlers
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            if (isTransitioning) return;
            const index = parseInt(item.getAttribute('data-index'));
            changeSlide(index);
        });
    });

    // --- 6. Fetch stats from Supabase ---
    const fetchStats = async () => {
        try {
            const { count, error } = await supabaseClient
                .from('enquiries')
                .select('*', { count: 'exact', head: true });
            
            if (error) throw error;
            totalEnquiries = count || 0;
            
            if (appContainer.classList.contains('active')) {
                updateCounterUI();
            }
        } catch (error) {
            console.error('Failed to fetch stats:', error);
        }
    };
    fetchStats();

    // --- 6b. Supabase Realtime — live counter updates ---
    supabaseClient
        .channel('enquiries-live')
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'enquiries' }, () => {
            fetchStats();
        })
        .subscribe();

    const updateCounterUI = () => {
        const startVal = parseInt(currentEnquiriesEl.innerText) || 0;
        animateValue(currentEnquiriesEl, startVal, totalEnquiries, 1200);
        targetEnquiriesEl.innerText = targetGoal;
        
        const percentage = Math.min((totalEnquiries / targetGoal) * 100, 100);
        progressBar.style.width = `${percentage}%`;
    };

    function animateValue(obj, start, end, duration) {
        if (start === end) return;
        let startTimestamp = null;
        const step = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            obj.innerHTML = Math.floor(progress * (end - start) + start);
            if (progress < 1) {
                window.requestAnimationFrame(step);
            }
        };
        window.requestAnimationFrame(step);
    }

    // --- 7. Transitions Preloader -> Pamphlet -> App ---
    
    // Fill preloader progress bar
    setTimeout(() => {
        loadingBarFill.style.transition = 'width 2s cubic-bezier(0.4, 0, 0.2, 1)';
        loadingBarFill.style.width = '100%';
    }, 100);

    // Preloader fade-out
    setTimeout(() => {
        preloader.classList.add('fade-out');
        setTimeout(() => {
            preloader.classList.add('hidden');
            pamphletAdvert.classList.remove('hidden');
            pamphletAdvert.getBoundingClientRect();
            pamphletAdvert.style.opacity = '1';
        }, 800);
    }, 2500);

    // Open Main App
    const openApp = () => {
        if (isTransitioning) return;
        isTransitioning = true;
        
        pamphletAdvert.classList.add('fade-out');
        
        setTimeout(() => {
            pamphletAdvert.classList.add('hidden');
            appContainer.classList.remove('hidden');
            appContainer.getBoundingClientRect();
            appContainer.classList.add('active');
            
            // Sync values & trigger initial slide text scrambler
            updateCounterUI();
            
            const firstTitle = slides[0].querySelector('.slide-title');
            const firstSubtitle = slides[0].querySelector('.slide-subtitle');
            if (firstTitle) scrambleText(firstTitle, firstTitle.getAttribute('data-text'), 700);
            if (firstSubtitle) scrambleText(firstSubtitle, firstSubtitle.getAttribute('data-text'), 900);
            
            // Scramble initial metadata (values + labels)
            const data = slidesData[0];
            updateLabels(data);
            scrambleText(metaIndex, data.indexText, 500);
            scrambleText(metaClient, data.client, 500);
            scrambleText(metaType, data.type, 500);
            scrambleText(metaAgency, data.stage, 500);
            scrambleText(metaDate, data.date, 500);
            metaInstruction.innerText = data.instruction;

            isTransitioning = false;
            addCursorHoverListeners();
        }, 850);
    };

    enterAppBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        openApp();
    });

    pamphletAdvert.addEventListener('click', openApp);

    // --- 8. Phone Verify Input & Live Duplicate Check (Supabase) ---
    let checkPhoneTimeout;
    phoneInput.addEventListener('input', () => {
        phoneError.innerText = '';
        phoneInput.parentNode.classList.remove('shake');
        
        clearTimeout(checkPhoneTimeout);
        const phoneVal = phoneInput.value.trim();
        if (phoneVal.replace(/\D/g,'').length < 7) return;

        checkPhoneTimeout = setTimeout(async () => {
            try {
                const cleanPhone = phoneVal.replace(/\D/g, '');
                const { data, error } = await supabaseClient
                    .from('enquiries')
                    .select('phone')
                    .eq('phone', cleanPhone);
                
                if (error) throw error;
                if (data && data.length > 0) {
                    phoneError.innerText = "This WhatsApp number is already registered.";
                    phoneInput.parentNode.classList.add('shake');
                }
            } catch (err) {
                console.error("Error verifying phone:", err);
            }
        }, 600);
    });

    // --- 9. Form Submission (Supabase) ---
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        if (phoneError.innerText !== '') {
            phoneInput.parentNode.classList.add('shake');
            setTimeout(() => phoneInput.parentNode.classList.remove('shake'), 400);
            return;
        }

        submitBtn.disabled = true;
        submitBtn.querySelector('.btn-text').classList.add('hidden');
        loader.classList.remove('hidden');

        const formData = new FormData(form);
        const requestData = Object.fromEntries(formData.entries());
        const cleanPhone = requestData.phone.replace(/\D/g, '');

        try {
            const { data, error } = await supabaseClient
                .from('enquiries')
                .insert([{
                    name: requestData.name,
                    phone: cleanPhone,
                    guests: requestData.guests,
                    match: requestData.match || 'Any Match'
                }])
                .select();

            if (error) {
                // Unique constraint violation = duplicate phone
                if (error.code === '23505') {
                    await fetchStats();
                    handleAlreadyEnquired(requestData.phone);
                } else {
                    console.error('Supabase insert error:', error);
                    phoneError.innerText = "Validation failed. Try again.";
                    resetSubmitButton();
                }
            } else {
                handleSuccess(requestData.phone, requestData.name, requestData.guests);
            }

        } catch (error) {
            console.error('Submission error:', error);
            phoneError.innerText = "Network error. Please retry.";
            resetSubmitButton();
        }
    });

    function resetSubmitButton() {
        submitBtn.disabled = false;
        submitBtn.querySelector('.btn-text').classList.remove('hidden');
        loader.classList.add('hidden');
    }

    function handleSuccess(phone, name, guests) {
        formSection.classList.add('hidden');
        displayPhone.innerText = phone;
        successSection.classList.remove('hidden');
        
        fireConfetti();
        fetchStats().then(() => {
            updateCounterUI();
        });
        addCursorHoverListeners();

        // Redirect to WhatsApp with prefilled details
        const waNumber = "919881476738";
        const textMessage = `Hi! I just registered my spot for the FIFA World Cup '26 match viewing at Kurry & Kabab.\n\nName: ${name}\nPhone: ${phone}\nGuests: ${guests}\n\nCan you share the timings for the upcoming event and the snacks & drinks details?`;
        const whatsappUrl = `https://wa.me/${waNumber}?text=${encodeURIComponent(textMessage)}`;
        
        setTimeout(() => {
            window.location.href = whatsappUrl;
        }, 1500);
    }

    function handleAlreadyEnquired(phone) {
        formSection.classList.add('hidden');
        alreadyTotalCount.innerText = totalEnquiries;
        alreadySection.classList.remove('hidden');
        addCursorHoverListeners();
        // Update the stats box with live count
        fetchStats().then(() => {
            alreadyTotalCount.innerText = totalEnquiries;
        });
    }

    function fireConfetti() {
        if (typeof confetti !== 'function') return;
        const duration = 2500;
        const end = Date.now() + duration;

        (function frame() {
            confetti({
                particleCount: 6,
                angle: 60,
                spread: 55,
                origin: { x: 0 },
                colors: ['#ffffff', '#10b981', '#fbbf24']
            });
            confetti({
                particleCount: 6,
                angle: 120,
                spread: 55,
                origin: { x: 1 },
                colors: ['#ffffff', '#10b981', '#fbbf24']
            });

            if (Date.now() < end) {
                requestAnimationFrame(frame);
            }
        }());
    }

});
