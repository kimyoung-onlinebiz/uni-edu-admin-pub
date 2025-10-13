document.addEventListener('DOMContentLoaded', () => {
    // 요소 선택
    const adminWrapper = document.querySelector('.admin_wrapper');
    const adminSidebar = document.querySelector('.admin_lnb');
    const adminContent = document.querySelector('.admin_content');
    const footer = document.querySelector('.admin_footer');
    const searchSection = document.querySelector('.search_section');

    // 사이드바 토글
    const toggleButton = document.querySelector('.toggle_sidebar');
    if (toggleButton && adminWrapper && adminSidebar && adminContent && footer) {
        toggleButton.addEventListener('click', () => {
            const isClosed = adminWrapper.classList.toggle('sidebar_closed');
            toggleButton.classList.toggle('close');
            adminSidebar.style.marginLeft = isClosed ? '-260px' : '0';
            adminContent.style.marginLeft = isClosed ? '20px' : '280px';
            footer.style.marginLeft = isClosed ? '20px' : '280px';
            footer.style.width = isClosed ? 'calc(100% - 20px)' : 'calc(100% - 280px)';
        });
    }

    // .search_section 내부에 .btn_openClose 버튼이 있을 때만 초기 height 인라인 적용
    if (searchSection && searchSection.querySelector('.btn_openClose')) {
        searchSection.style.height = searchSection.offsetHeight + 'px';
    }

    // 검색영역 토글
    const btnOpenClose = document.querySelector('.btn_group .btn_openClose');
    if (btnOpenClose && searchSection) {
        btnOpenClose.addEventListener('click', () => {
            const isSmall = searchSection.classList.toggle('small');
            btnOpenClose.classList.toggle('close');
            const dls = searchSection.querySelectorAll('dl');
            dls.forEach((dl, idx) => {
                if (isSmall) {
                    dl.style.opacity = idx === 0 ? '1' : '0';
                    dl.style.pointerEvents = idx === 0 ? 'auto' : 'none';
                } else {
                    dl.style.opacity = '1';
                    dl.style.pointerEvents = 'auto';
                }
            });
            searchSection.style.height = isSmall ? '' : searchSection.offsetHeight + 'px';
        });
    }

    // 레이어 활성화 버튼과 레이어 매핑
    const layerButtonMap = [
        { selector: '.btn_bannerList .btn', layer: '.banner_list' },
        { selector: '.btn_bannerPosition', layer: '.banner_position' },
        { selector: '.btn_couponIssue', layer: '.coupon_issue', all: true },
        { selector: '.btn_bannerPreview', layer: '.layer_bannerPreview', all: true }
    ];

    layerButtonMap.forEach(({ selector, layer, all }) => {
        const buttons = all ? document.querySelectorAll(selector) : [document.querySelector(selector)].filter(Boolean);
        const layerElem = document.querySelector(layer);
        if (buttons.length && layerElem) {
            buttons.forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.preventDefault();
                    layerElem.classList.add('active');
                });
            });
        }
    });

    // .btn_excelUpload 클릭 시 excel_upload 레이어 활성화
    const btnExcelUploadList = document.querySelectorAll('.btn_excelUpload');
    const excelUploadLayer = document.querySelector('.excel_upload');
    if (btnExcelUploadList.length > 0 && excelUploadLayer) {
        btnExcelUploadList.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                excelUploadLayer.classList.add('active');
            });
        });
    }

    // .btn_download_reason 클릭 시 download_reason 레이어 활성화_다운로드 로그 엑셀 다운로드
    const btnDownloadReasonList = document.querySelectorAll('.btn_download_reason');
    const downloadReasonLayer = document.querySelector('.download_reason');
    if (btnDownloadReasonList.length > 0 && downloadReasonLayer) {
        btnDownloadReasonList.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                downloadReasonLayer.classList.add('active');
            });
        });
    }

    // .btn_see_reasons 클릭 시 see_reasons 레이어 활성화_다운로드 로그 사유 보기
    const btnSeeReasonsList = document.querySelectorAll('.btn_see_reasons');
    const seeReasonsLayer = document.querySelector('.see_reasons');
    if (btnSeeReasonsList.length > 0 && seeReasonsLayer) {
        btnSeeReasonsList.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                seeReasonsLayer.classList.add('active');
            });
        });
    }

    // 닫기/확인 버튼 클릭 시 레이어 닫기
    document.addEventListener('click', function (e) {
        if (
            e.target.classList.contains('btn_layerClose') ||
            (e.target.closest('.layer_btnSection') && e.target.classList.contains('btn_close'))
        ) {
            const layer = e.target.closest('.layer_wrapper');
            if (layer) layer.classList.remove('active');
        }
    });
});