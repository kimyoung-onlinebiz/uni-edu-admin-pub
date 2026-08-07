document.addEventListener('DOMContentLoaded', () => {
    // Swiper 라이브러리가 로드되지 않은 페이지에서는 초기화를 건너뛴다.
    // (여러 페이지에서 공용 스크립트를 재사용하기 위한 안전 장치)
    if (!window.Swiper) {
        return;
    }

    // ==============================
    // SECTION: 페이지 슬라이더 초기화
    // ==============================
    initMainEventLayerSwiper();
    initAuthLogoSwiper();
    initMainVisualSwiper();
    initScholarshipPromotionSwipers();
    initCourseIntroSwiper();
});

// Swiper 버전에 따라 pauseOnMouseEnter 옵션이 동작하지 않는 경우를 대비해
// 마우스 진입/이탈 시 autoplay를 직접 stop/start 처리한다.
function bindSwiperHoverPause(swiperInstance, hoverTarget) {
    if (!swiperInstance?.autoplay || !hoverTarget) {
        return;
    }

    hoverTarget.addEventListener('mouseenter', () => {
        swiperInstance.autoplay.stop();
    });

    hoverTarget.addEventListener('mouseleave', () => {
        swiperInstance.autoplay.start();
    });
}

// =====================================
// SECTION: 메인 이벤트 레이어 슬라이더
// =====================================
function initMainEventLayerSwiper() {
    const layerMainEventEl = document.querySelector('.layer_mainEvent');
    const container = layerMainEventEl?.querySelector('.swiper-container');
    const paginationEl = layerMainEventEl?.querySelector('.swiper-pagination');

    // 메인 이벤트 레이어가 없는 페이지에서는 초기화하지 않는다.
    if (!layerMainEventEl || !container || !paginationEl) {
        return;
    }

    // 레이어 배너는 좌우(horizontal) 전환과 페이지네이션만 간결하게 제공한다.
    const mainEventSwiper = new Swiper(container, {
        loop: true,
        direction: 'horizontal',
        speed:450,
        autoplay: {
           delay:3000,
           disableOnInteraction:false,
                  pauseOnMouseEnter: false,
        },
        slidesPerView: 1,
        spaceBetween: 0,
        pagination: {
            el: paginationEl,
            type: 'bullets',
            clickable: true,
        },
        observer: true,
        observeParents: true,
    });

    bindSwiperHoverPause(mainEventSwiper, container);
}

// =================================
// SECTION: 상단 인증 로고 슬라이더
// =================================
function initAuthLogoSwiper() {
    const authLogoEl = document.querySelector('.authentication_logo');

    // 해당 섹션이 없는 페이지에서는 즉시 종료한다.
    if (!authLogoEl) {
        return;
    }

    // ------------------------------
    // BLOCK: 인증 로고 Swiper 생성
    // ------------------------------
    const authLogoSwiper = new Swiper(authLogoEl, {
        // 로고 전환은 정보 전달보다 시각 전환이 목적이므로 fade 효과를 사용.
        effect: 'fade',
        loop: true,
        // 로고 전환은 너무 빠르면 인지가 어려워 350ms로 부드럽게 유지.
        speed: 350,
        slidesPerView: 1,
        spaceBetween: 0,
        autoplay: {
            // 과도하게 빠르지 않게 2.2초 간격으로 자동 순환.
            delay: 2200,
            // 사용자가 스와이프/클릭해도 자동재생을 끊지 않는다.
            disableOnInteraction: false,
            // 마우스를 올린 동안 자동재생을 일시정지한다.
            pauseOnMouseEnter: true,
        },
        fadeEffect: {
            crossFade: true,
        },
        // 탭 전환/동적 노출 환경에서 레이아웃 변경을 감지해 재계산하도록 설정.
        observer: true,
        observeParents: true,
    });

    bindSwiperHoverPause(authLogoSwiper, authLogoEl);
}

// ============================================
// SECTION: 메인 비주얼(배너/탭/분수/재생제어)
// ============================================
function initMainVisualSwiper() {
    const root = document.querySelector('.mainVisual_slide');
    const container = root?.querySelector('.swiper-container');

    // 메인 비주얼이 없는 페이지에서는 로직을 실행하지 않는다.
    if (!root || !container) {
        return;
    }

    // ---------------------------
    // BLOCK: 기본 UI 참조/상수 설정
    // ---------------------------
    // 한 번에 노출할 탭 개수(디자인 기준: 4개)
    const VISIBLE_TAB_COUNT = 4;
    const tabLabels = Array.from(root.querySelectorAll('.swiper-slide')).map((slide, index) => slide.getAttribute('data-tab') || `배너 ${index + 1}`);
    const totalSlides = tabLabels.length;
    const fractionEl = root.querySelector('.mainVisual_fraction');
    const paginationWrapEl = root.querySelector('.swiper-pagination');
    const paginationEl = paginationWrapEl?.querySelector('.mainVisual_paginationTrack');
    const playPauseButton = root.querySelector('.play-pause');
    const playPauseIcon = playPauseButton?.querySelector('.material-symbols-rounded');

    // ----------------------------------------
    // BLOCK: 슬라이드 변화 시 UI 동기화 처리
    // ----------------------------------------
    // 슬라이드 위치에 맞춰 탭 트랙 위치, 분수 페이지네이션, 재생버튼 상태를 동기화한다.
    const syncMainVisualUi = (swiperInstance) => {
        if (!swiperInstance) {
            return;
        }

        if (fractionEl) {
            fractionEl.textContent = `${swiperInstance.realIndex + 1} / ${totalSlides}`;
        }

        if (!paginationEl || !paginationWrapEl) {
            return;
        }

        if (totalSlides <= VISIBLE_TAB_COUNT) {
            paginationEl.style.transform = 'translate3d(0, 0, 0)';
            paginationWrapEl.classList.add('is-static');
            return;
        }

        const maxStartIndex = totalSlides - VISIBLE_TAB_COUNT;
        // 현재 슬라이드 기준으로 탭 트랙 시작 인덱스를 계산해
        // 활성 탭이 보이는 범위 안에 들어오도록 이동시킨다.
        const startIndex = Math.min(Math.max(swiperInstance.realIndex - (VISIBLE_TAB_COUNT - 1), 0), maxStartIndex);
        const tabWidth = paginationWrapEl.clientWidth / VISIBLE_TAB_COUNT;

        paginationWrapEl.classList.remove('is-static');
        paginationEl.style.transform = `translate3d(${-startIndex * tabWidth}px, 0, 0)`;
    };

    // ---------------------------------------
    // BLOCK: 재생/정지 버튼 상태 표시 동기화
    // ---------------------------------------
    // 자동재생 상태에 맞춰 버튼 아이콘/aria-label 동기화
    const setPlayPauseUi = (isPlaying) => {
        if (!playPauseButton || !playPauseIcon) {
            return;
        }

        // 스크린리더와 시각 아이콘을 동시에 갱신해 접근성과 UI 일관성을 맞춘다.
        playPauseButton.setAttribute('aria-label', isPlaying ? '정지' : '재생');
        playPauseIcon.textContent = isPlaying ? 'pause' : 'play_arrow';
    };

    // -----------------------------
    // BLOCK: 메인 비주얼 Swiper 생성
    // -----------------------------
    const mainVisualSwiper = new Swiper(container, {
        loop: true,
        // 메인 비주얼은 첫인상 영역이므로 전환을 너무 급하지 않게 설정.
        speed: 450,
        effect: 'fade',
        slidesPerView: 1,
        spaceBetween: 0,
        autoplay: {
            // 배너 읽기 시간을 고려해 2.8초 간격 유지.
            delay: 2800,
            disableOnInteraction: false,
            // 마우스를 올린 동안 자동재생을 일시정지한다.
            pauseOnMouseEnter: true,
        },
        fadeEffect: {
            crossFade: true,
        },
        pagination: {
            el: paginationEl,
            type: 'bullets',
            clickable: true,
            bulletElement: 'button',
            renderBullet(index, className) {
                // 서버 데이터 없이도 슬라이드 data-tab 값으로 탭 텍스트를 구성.
                return `<button type="button" class="${className}"><span class="mainVisual_tabText">${tabLabels[index] || `배너 ${index + 1}`}</span></button>`;
            },
        },
        navigation: {
            nextEl: '.mainVisual_slide .swiper-button-next',
            prevEl: '.mainVisual_slide .swiper-button-prev',
        },
        observer: true,
        observeParents: true,
        on: {
            // 초기 렌더/슬라이드 전환/리사이즈 상황에서 동일한 UI 동기화 함수 재사용.
            init() {
                syncMainVisualUi(this);
            },
            slideChange() {
                syncMainVisualUi(this);
            },
            resize() {
                syncMainVisualUi(this);
            },
        },
    });

    bindSwiperHoverPause(mainVisualSwiper, root);

    setPlayPauseUi(true);

    if (!playPauseButton) {
        return;
    }

    // ---------------------------------
    // BLOCK: 재생/정지 토글 이벤트 연결
    // ---------------------------------
    playPauseButton.addEventListener('click', () => {
        if (!mainVisualSwiper.autoplay) {
            return;
        }

        // 현재 상태를 기준으로 stop/start를 토글하고 아이콘도 즉시 반영한다.
        if (mainVisualSwiper.autoplay.running) {
            mainVisualSwiper.autoplay.stop();
            setPlayPauseUi(false);
            return;
        }

        mainVisualSwiper.autoplay.start();
        setPlayPauseUi(true);
    });
}

// =========================================
// SECTION: 장학생/이벤트 카드 스와이퍼
// =========================================
function initScholarshipPromotionSwipers() {
    const promotionCards = document.querySelectorAll('.scholarship_promotion .swiper-container');

    // 이벤트/장학생 카드 섹션이 없으면 종료.
    if (!promotionCards.length) {
        return;
    }

    promotionCards.forEach((cardEl) => {
        const fractionEl = cardEl.querySelector('.fraction');
        const slideCount = cardEl.querySelectorAll('.swiper-wrapper > .swiper-slide').length;
        // 텍스트형 카드만 slide 전환을 사용하고, 일반 카드는 fade 전환을 사용한다.
        const isScholarshipTextCard = cardEl.classList.contains('scholarship_txt');

        // 각 카드의 현재 페이지 수를 표시한다.
        const syncCardFraction = (swiperInstance) => {
            if (!fractionEl || !swiperInstance) {
                return;
            }

            fractionEl.textContent = `${swiperInstance.realIndex + 1} / ${slideCount}`;
        };

        // 카드별로 독립 Swiper를 생성해 fraction과 버튼이 섞이지 않도록 한다.
        const promotionSwiper = new Swiper(cardEl, {
            loop: true,
            speed: 450,
            effect: isScholarshipTextCard ? 'slide' : 'fade',
            slidesPerView: 1,
            // 텍스트형 카드는 카드 간 간격을 두어 다음 카드의 존재를 자연스럽게 암시.
            spaceBetween: isScholarshipTextCard ? 32 : 0,
            autoplay: {
                delay: 3000,
                disableOnInteraction: false,
                // 마우스를 올린 동안 자동재생을 일시정지한다.
                pauseOnMouseEnter: true,
            },
            fadeEffect: {
                crossFade: true,
            },
            navigation: {
                nextEl: cardEl.querySelector('.swiper-button-next'),
                prevEl: cardEl.querySelector('.swiper-button-prev'),
            },
            observer: true,
            observeParents: true,
            on: {
                init() {
                    syncCardFraction(this);
                },
                slideChange() {
                    syncCardFraction(this);
                },
            },
        });

        bindSwiperHoverPause(promotionSwiper, cardEl);
    });
}

// =========================================
// SECTION: 교육과정 소개 슬라이더
// =========================================
function initCourseIntroSwiper() {
    const courseIntroEl = document.querySelector('.courseIntro_swiper');

    // 소개 슬라이더가 없는 페이지에서는 초기화하지 않는다.
    if (!courseIntroEl) {
        return;
    }

    // 카드가 여러 개 보이는 가로형 소개 슬라이더
    const courseIntroSwiper = new Swiper(courseIntroEl, {
        loop: true,
        speed: 450,
        // 카드 폭을 CSS 기준으로 유지하기 위해 auto를 사용.
        slidesPerView: 'auto',
        // 카드 간 시각 구분을 위한 간격.
        spaceBetween: 24,
        autoplay: {
            delay: 2800,
            disableOnInteraction: false,
            // 마우스를 올린 동안 자동재생을 일시정지한다.
            pauseOnMouseEnter: true,
        },
        navigation: {
            nextEl: courseIntroEl.querySelector('.swiper-button-next'),
            prevEl: courseIntroEl.querySelector('.swiper-button-prev'),
        },
        observer: true,
        observeParents: true,
    });

    bindSwiperHoverPause(courseIntroSwiper, courseIntroEl);
}