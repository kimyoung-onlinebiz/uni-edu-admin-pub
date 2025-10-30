document.addEventListener('DOMContentLoaded', () => {
    const $ = sel => document.querySelector(sel);
    const $$ = sel => Array.from(document.querySelectorAll(sel));

    // 사이드바 토글
    const wrapper = $('.admin_wrapper'), sidebar = $('.admin_lnb'), content = $('.admin_content'), footer = $('.admin_footer');
    const toggleBtn = $('.toggle_sidebar');
    if (toggleBtn && wrapper && sidebar && content && footer) {
        toggleBtn.addEventListener('click', () => {
            const closed = wrapper.classList.toggle('sidebar_closed');
            toggleBtn.classList.toggle('close');
            sidebar.style.marginLeft = closed ? '-260px' : '0';
            content.style.marginLeft = closed ? '20px' : '280px';
            footer.style.marginLeft = closed ? '20px' : '280px';
            footer.style.width = closed ? 'calc(100% - 20px)' : 'calc(100% - 280px)';
        });
    }

    // .search_section 초기 height (btn_openClose 있을 때만)
    const searchSection = $('.search_section');
    if (searchSection && searchSection.querySelector('.btn_openClose')) {
        searchSection.style.height = searchSection.offsetHeight + 'px';
        const btnOpen = $('.btn_group .btn_openClose');
        if (btnOpen) {
            btnOpen.addEventListener('click', () => {
                const small = searchSection.classList.toggle('small');
                btnOpen.classList.toggle('close');
                const dls = searchSection.querySelectorAll('dl');
                dls.forEach((dl, i) => {
                    dl.style.opacity = small ? (i === 0 ? '1' : '0') : '1';
                    dl.style.pointerEvents = small ? (i === 0 ? 'auto' : 'none') : 'auto';
                });
                searchSection.style.height = small ? '' : searchSection.offsetHeight + 'px';
            });
        }
    }

    // 레이어 토글 공통 함수 (selector 여러개 지원)
    const map = [
        { sel: '.btn_bannerList .btn', layer: '.banner_list', many: false },//배너 목록 보기 레이어
        { sel: '.btn_bannerPosition', layer: '.banner_position', many: false },//배너 위치 이미지 보기 레이어
        { sel: '.btn_couponIssue', layer: '.coupon_issue', many: true },//쿠폰 발급대상 레이어
        { sel: '.btn_bannerPreview', layer: '.layer_bannerPreview', many: true },//배너 미리보기 레이어
        { sel: '.btn_excelUpload', layer: '.excel_upload', many: true },//엑셀 업로드 레이어
        { sel: '.btn_download_reason', layer: '.download_reason', many: true },//다운로드 사유 쓰기 레이어
        { sel: '.btn_see_reasons', layer: '.see_reasons', many: true },// 다운로드 사유 보기 레이어
        { sel: '.btn_sendingSms', layer: '.sending_sms', many: true },// SMS 발송 레이어
        { sel: '.btn_studyCounseling', layer: '.study_counseling', many: true },// 학습상담 레이어
        { sel: '.btn_schoolRegister', layer: '.school_register', many: true }, // 학적부 레이어
        { sel: '.btn_paymentCourse', layer: '.payment_course', many: true }, // 결제 강좌 레이어
        { sel: '.btn_withdrawalApproval', layer: '.withdrawal_approval', many: true }, // 탈퇴승인 레이어
        { sel: '.btn_ipMac', layer: '.ipMac_registration', many: true }, // ip/mac 등록 레이어
        { sel: '.btn_ipMac_update', layer: '.ipMac_registration_update', many: true }, // ip/mac 이력관리 레이어
        { sel: '.btn_scheduleHelp', layer: '.schedule_help', many: true }, // 학기/기수 관리 일정 자동 설정 도움말 레이어
        { sel: '.btn_registrationProcess', layer: '.registration_process', many: true }, // 편성 과정 등록 레이어
        { sel: '.btn_contentRegistration', layer: '.content_registration', many: true }, // 과정별 콘텐츠 등록 레이어
        { sel: '.btn_examRegistration', layer: '.exam_registration', many: true }, // 시험 등록 레이어
        { sel: '.btn_difficultySetting', layer: '.difficulty_setting', many: true }, // 난이도 설정 레이어
        { sel: '.btn_relativeEvaluation', layer: '.relative_evaluation', many: true }, // 상대평가 설정 레이어
        { sel: '.btn_difficultyView', layer: '.difficulty_view', many: true }, // 설정된 난이도 보기 레이어
        { sel: '.btn_examPreview', layer: '.exam_preview', many: true } // 시험문항 미리보기 레이어
    ];
    map.forEach(({ sel, layer, many }) => {
        const layerEl = $(layer);
        if (!layerEl) return;
        const btns = many ? $$(sel) : [$(sel)].filter(Boolean);
        btns.forEach(b => b.addEventListener('click', e => { e.preventDefault(); layerEl.classList.add('active'); }));
    });

    // 레이어 닫기: .btn_layerClose 또는 .layer_btnSection 내부의 .btn_close 일 때만 닫기
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('btn_layerClose') ||
            (e.target.closest('.layer_btnSection') && e.target.classList.contains('btn_close'))) {
            const layer = e.target.closest('.layer_wrapper');
            if (layer) layer.classList.remove('active');
        }
    });

    // 탭 (HTML에서 초기 active 지정)
    document.querySelectorAll('.tab_container').forEach(container => {
        const links = container.querySelectorAll('[data-tab]');
        const contents = container.querySelectorAll('.tab_content');
        links.forEach(a => a.addEventListener('click', (e) => {
            e.preventDefault();
            const id = a.dataset.tab || (a.getAttribute('href') || '').replace('#','');
            if (!id) return;
            links.forEach(l => l.classList.remove('active')); a.classList.add('active');
            contents.forEach(c => c.classList.toggle('active', c.id === id));
        }));
    });

    // .school_register 내 btn_openClose 클릭 시 해당 버튼에만 close 토글, 형제 테이블만 숨김 처리
    document.querySelectorAll('.school_register .btn_openClose').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const header = btn.closest('h3');
            if (!header) return;

            const closing = btn.classList.toggle('close');

            // header(=h3)는 그대로 두고, header 다음 요소들 중 다음 h3 전까지의 table 요소들만 토글
            let el = header.nextElementSibling;
            while (el && el.tagName.toLowerCase() !== 'h3') {
                if (el.tagName.toLowerCase() === 'table') {
                    el.style.display = closing ? 'none' : '';
                }
                el = el.nextElementSibling;
            }
        });
    });

    // 안내사항보기-간단 툴팁 토글 (외부 클릭 시 닫기, 하나만 열림)
    document.querySelectorAll('.icon_tooltip').forEach(icon => {
        icon.addEventListener('click', (e) => {
            e.stopPropagation();
            // 다른 열려있는 툴팁 닫기
            document.querySelectorAll('.icon_tooltip.open').forEach(o => { if (o !== icon) o.classList.remove('open'); });
            icon.classList.toggle('open');
        });
    });
    document.addEventListener('click', () => {
        document.querySelectorAll('.icon_tooltip.open').forEach(o => o.classList.remove('open'));
    });

});