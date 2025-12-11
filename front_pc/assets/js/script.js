document.addEventListener('DOMContentLoaded', () => {
    const $ = sel => document.querySelector(sel);
    const $$ = sel => Array.from(document.querySelectorAll(sel));


    // 레이어 토글 공통 함수 (selector 여러개 지원)
    const map = [
        { sel: '.btn_siteAgree', layer: '.layer_siteAgree', many: false },//사이트 이용약관 레이어
        { sel: '.btn_privacyAgree', layer: '.layer_privacyAgree', many: false },//개인정보 수집 및 이용 동의 레이어
        { sel: '.btn_provideInfo', layer: '.layer_provideInfo', many: false },//개인정보 제3자 제공 동의 레이어
        { sel: '.btn_privacyAgree_02', layer: '.layer_privacyAgree_02', many: false },//개인정보 수집 및 이용 동의 레이어
        { sel: '.btn_marketingAgree', layer: '.layer_marketingAgree', many: false },//마케팅 목적 이용 및 정보 수신 레이어
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


});