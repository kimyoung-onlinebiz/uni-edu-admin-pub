document.addEventListener('DOMContentLoaded', () => {
    // 요소 선택
    const toggleButton = document.querySelector('.toggle_sidebar');
    const adminWrapper = document.querySelector('.admin_wrapper');
    const adminSidebar = document.querySelector('.admin_lnb');
    const adminContent = document.querySelector('.admin_content');
    const footer = document.querySelector('.admin_footer');
    const searchSection = document.querySelector('.search_section');
    const btnOpenClose = document.querySelector('.btn_group .btn_openClose');
    const layerWrapper = document.querySelector('.layer_wrapper');
    const bannerListLayer = document.querySelector('.banner_list');
    const bannerPositionLayer = document.querySelector('.banner_position');

    // 사이드바 토글
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

    // .search_section 초기 height 인라인 적용
    if (searchSection) {
        searchSection.style.height = searchSection.offsetHeight + 'px';
    }
 
    // 검색영역 토글
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

    // 배너 관리 배너 목록 버튼 클릭 시 배너 목록 레이어 활성화
    document.querySelector('.btn_bannerList .btn').addEventListener('click', () => {
        bannerListLayer.classList.add('active');
    });

    // 배너 위치 안내 버튼 클릭 시 배너 위치 레이어 활성화
    document.querySelector('.btn_bannerPosition').addEventListener('click', () => {
        bannerPositionLayer.classList.add('active');
    });

    // 닫기 버튼(.btn_layerClose) 또는 확인 버튼(.layer_btnSection button) 클릭 시 모든 레이어 비활성화
    document.addEventListener('click', function(e) {
        if (
            e.target.classList.contains('btn_layerClose') ||
            (e.target.closest('.layer_btnSection') && e.target.classList.contains('btn'))
        ) {
            const layer = e.target.closest('.layer_wrapper');
            if (layer) layer.classList.remove('active');
        }
    });

});