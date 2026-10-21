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
    initCertMarkSwiper();
    initProfileSwiper();
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

    const container = root.querySelector('.swiper-container');

    new Swiper(container, {
        slidesPerView: 'auto',
        spaceBetween: 16,
        centeredSlides: true, // 현재 슬라이드를 가운데 정렬
        loop: true, // 1 → 2 → 3 → 1 … 끊김 없이 반복
        loopedSlides: container.querySelectorAll('.swiper-slide').length, // 너비 auto 라 복제 수를 슬라이드 수만큼 지정
        pagination: { el: root.querySelector('.swiper-pagination'), clickable: true },
    });
}

// ==============================
// SECTION: 푸터 인증 마크 (ISMS / 교육부 로고)
// - 두 이미지를 페이드로 번갈아 노출, 스와이프(마우스 드래그)로도 넘김
// ==============================
function initCertMarkSwiper() {
    const container = document.querySelector('.cert_mark');

    if (!container) {
        return;
    }

    new Swiper(container, {
        effect: 'fade',
        fadeEffect: { crossFade: true },
        loop: true,
        speed: 800,
        grabCursor: true, // 마우스로 끌어서 넘기기 (터치 스와이프 포함)
        autoplay: { delay: 3000, disableOnInteraction: false },
    });
}

// ==============================
// SECTION: 교수님 소개 팝업 (PC와 동일)
// - 교수님이 2명 이상이면 반복 + 자동 넘김 + 화살표 / 페이지(1/2), 1명이면 컨트롤 숨김
// - 팝업이 닫혀 있을 때 만들어지므로 observer 로 열릴 때 크기 다시 계산
// ==============================
function initProfileSwiper() {
    const container = document.querySelector('.profile_swiper');

    if (!container) {
        return;
    }

    const total = container.querySelectorAll('.swiper-slide').length;
    const controls = container.querySelector('.profile_controls');

    if (total <= 1) {
        controls.hidden = true;
    }

    new Swiper(container, {
        loop: total > 1,
        autoHeight: true,
        autoplay: total > 1 ? { delay: 3000, disableOnInteraction: false } : false,
        navigation: { prevEl: controls.querySelector('.btn_prev'), nextEl: controls.querySelector('.btn_next') },
        pagination: { el: controls.querySelector('.profile_page'), type: 'fraction' },
        observer: true,
        observeParents: true,
    });
}
