document.addEventListener('DOMContentLoaded', () => {
    // Swiper 라이브러리가 로드되지 않은 페이지에서는 초기화를 건너뛴다.
    if (!window.Swiper) {
        return;
    }

    // ==============================
    // SECTION: 페이지 슬라이더 초기화
    // ==============================
    initLayerPopupSwiper();
    initMainVisualSwiper();
    initOpenClassSwiper();
    initEventBannerSwipers();
    initScholarshipSwiper();
});

// ==============================
// SECTION: 메인 레이어 팝업 슬라이더
// - 팝업이 숨겨진 상태(오늘 하루 보지 않기)에서는 초기화하지 않는다.
// ==============================
function initLayerPopupSwiper() {
    const layer = document.querySelector('.main_layer');

    if (!layer || layer.hidden) {
        return;
    }

    new Swiper(layer.querySelector('.swiper-container'), {
        loop: true,
        speed: 450,
        autoplay: { delay: 3000, disableOnInteraction: false },
        pagination: { el: layer.querySelector('.swiper-pagination'), clickable: true },
    });
}

// ==============================
// SECTION: 메인 비주얼 슬라이더 (1/10 숫자 페이지네이션)
// ==============================
function initMainVisualSwiper() {
    const container = document.querySelector('.main_visual');

    if (!container) {
        return;
    }

    new Swiper(container, {
        loop: true,
        speed: 450,
        autoplay: { delay: 4000, disableOnInteraction: false },
        pagination: { el: container.querySelector('.swiper-pagination'), type: 'fraction' },
    });
}

// ==============================
// SECTION: 개강안내 슬라이더
// ==============================
function initOpenClassSwiper() {
    const root = document.querySelector('.open_class');

    if (!root) {
        return;
    }

    new Swiper(root.querySelector('.swiper-container'), {
        spaceBetween: 16,
        pagination: { el: root.querySelector('.swiper-pagination'), clickable: true },
    });
}

// ==============================
// SECTION: 이벤트 배너 슬라이더 (배너별 개별 동작)
// ==============================
function initEventBannerSwipers() {
    document.querySelectorAll('.event_banner .swiper-container').forEach((container) => {
        new Swiper(container, {
            loop: true,
            speed: 450,
            autoplay: { delay: 3500, disableOnInteraction: false },
            pagination: { el: container.querySelector('.swiper-pagination'), type: 'fraction' },
        });
    });
}

// ==============================
// SECTION: 장학생 후기 슬라이더
// ==============================
function initScholarshipSwiper() {
    const root = document.querySelector('.scholarship');

    if (!root) {
        return;
    }

    new Swiper(root.querySelector('.swiper-container'), {
        slidesPerView: 'auto',
        spaceBetween: 16,
        pagination: { el: root.querySelector('.swiper-pagination'), clickable: true },
    });
}
