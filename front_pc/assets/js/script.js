document.addEventListener('DOMContentLoaded', () => {
    // ============================================================
    // 공통 유틸
    // - 자주 쓰는 DOM 선택/이벤트 바인딩을 짧게 정리
    // - q/qa는 selector 단축 함수
    // - on/onClick은 null-safe 처리로 안전하게 바인딩
    // ============================================================
    const q = (selector, root = document) => root.querySelector(selector);
    const qa = (selector, root = document) => Array.from(root.querySelectorAll(selector));
    const on = (el, event, handler) => el?.addEventListener(event, handler);
    const onClick = (el, handler) => on(el, 'click', handler);
    // 링크/버튼 클릭 시 기본 동작을 막고 레이어만 열도록 통일
    const isActionTag = (el) => ['A', 'BUTTON'].includes(el?.tagName);

    // ============================================================
    // 레이어 등록 설정
    // - 반복되는 레이어는 여기에서 설정만 추가하면 동작하도록 구성
    // - 형식: { layer: '레이어 선택자', triggers: ['버튼 선택자들'], shouldLockScroll?: boolean }
    // ============================================================
    const STATIC_LAYER_BINDINGS = [
        { layer: '.layer_wrapper.banner_list', triggers: ['.mainVisual_slide .all_view'] },
    ];

    // ============================================================
    // 레이어 컨트롤러
    // - 레이어 열기/닫기, body 스크롤 잠금, Esc/닫기 버튼 처리 통합
    // - 설정 기반으로 여러 레이어를 일관되게 등록/관리
    // ============================================================
    function createLayerRegistrar() {
        const LAYER_SELECTOR = '.layer_wrapper, .layer_agree';
        // 여러 레이어가 겹쳐 열릴 수 있으므로 카운트를 두고 마지막 레이어가 닫힐 때만 body 잠금 해제
        let openedLayerCount = 0;

        // layer_agree는 소형 동의 안내 성격이므로 페이지 스크롤을 막지 않는다.
        const shouldLockBodyScroll = (layer) => !layer.classList.contains('layer_agree');

        // 레이어 표시 상태를 하나의 함수로 통일해 hidden/class 동기화를 보장한다.
        // isOpen=true: hidden 해제 + active 추가
        // isOpen=false: hidden 적용 + active 제거
        const setLayerState = (layer, isOpen) => {
            layer.hidden = !isOpen;
            layer.classList.toggle('active', isOpen);
        };

        // body 스크롤 잠금 카운트 증가
        const lockBodyScroll = () => {
            openedLayerCount += 1;
            document.body.style.overflow = 'hidden';
        };

        // body 스크롤 잠금 카운트 감소
        // 0이 되면 overflow 스타일을 비워 원래 상태로 복원
        const unlockBodyScroll = () => {
            openedLayerCount = Math.max(0, openedLayerCount - 1);
            if (!openedLayerCount) {
                document.body.style.overflow = '';
            }
        };

        // 레이어 열기 공통 로직
        // 이미 열린 레이어는 중복 처리하지 않는다.
        const openLayer = (layer) => {
            if (!layer || layer.classList.contains('active')) {
                return;
            }

            setLayerState(layer, true);
            if (shouldLockBodyScroll(layer)) {
                lockBodyScroll();
            }
        };

        // 레이어 닫기 공통 로직
        // 이미 닫힌 레이어는 처리하지 않는다.
        const closeLayer = (layer) => {
            if (!layer || !layer.classList.contains('active')) {
                return;
            }

            setLayerState(layer, false);
            if (shouldLockBodyScroll(layer)) {
                unlockBodyScroll();
            }
        };

        // 단일 레이어 바인딩
        // - triggers: 클릭 시 해당 레이어를 여는 요소 목록
        // - shouldLockScroll: 닫을 때 closeLayer(카운트 포함) 사용 여부
        const bindLayer = ({ layer, triggers = [], shouldLockScroll = true }) => {
            if (!layer) {
                return;
            }

            // 트리거 클릭으로 레이어 오픈
            const openByTrigger = (event) => {
                if (isActionTag(event?.currentTarget)) {
                    event.preventDefault();
                }
                openLayer(layer);
            };

            // 닫기 규칙
            // shouldLockScroll=false인 레이어는 카운트 없이 즉시 상태만 닫는다.
            const closeByRule = () => {
                if (shouldLockScroll) {
                    closeLayer(layer);
                    return;
                }

                setLayerState(layer, false);
            };

            // 트리거 이벤트 등록
            triggers.filter(Boolean).forEach((trigger) => on(trigger, 'click', openByTrigger));

            // 레이어 배경(오버레이) 클릭 시 닫기
            on(layer, 'click', (event) => {
                if (event.target === layer) {
                    closeByRule();
                }
            });
        };

        // 공통 닫기 규칙 1: Esc 키
        on(document, 'keydown', (event) => {
            if (event.key === 'Escape') {
                closeLayer(q('.layer_wrapper.active, .layer_agree.active'));
            }
        });

        // 공통 닫기 규칙 2: 닫기 버튼(.btn_layerClose)
        on(document, 'click', (event) => {
            const closeButton = event.target.closest('.btn_layerClose');
            if (!closeButton) {
                return;
            }

            closeLayer(closeButton.closest(LAYER_SELECTOR));
        });

        // 외부 노출 API
        // - register(bindings): 설정 배열 기반으로 여러 레이어를 한 번에 등록
        // - 문자열 셀렉터/DOM 엘리먼트 둘 다 지원
        return (bindings = []) => {
            bindings.forEach(({ layer, triggers = [], shouldLockScroll = true }) => {
                const layerElement = typeof layer === 'string' ? q(layer) : layer;
                const triggerElements = triggers
                    // 같은 셀렉터의 트리거가 여러 개여도 모두 이벤트 바인딩 대상에 포함한다.
                    .flatMap((trigger) => {
                        if (typeof trigger === 'string') {
                            return qa(trigger);
                        }

                        return trigger ? [trigger] : [];
                    })
                    .filter(Boolean);

                bindLayer({
                    layer: layerElement,
                    triggers: triggerElements,
                    shouldLockScroll,
                });
            });
        };
    }

    // ============================================================
    // 기능 초기화
    // - 각 기능은 독립 함수로 분리해서 필요 시 개별 수정 가능
    // - DOM이 없으면 early return 처리
    // ============================================================

    // 푸터 "관련 사이트" 셀렉트 열기/이동 처리
    function initRelatedSite() {
        const button = q('.site_footer .footer_relatedsite_box');
        const select = q('.site_footer select');
        if (!button || !select) {
            return;
        }

        // 브라우저 지원 시 showPicker 우선, 미지원이면 focus+click fallback
        const openSelect = () => {
            if (typeof select.showPicker === 'function') {
                select.showPicker();
                return;
            }

            select.focus();
            select.click();
        };

        // 버튼 클릭/키보드 접근성 처리
        onClick(button, openSelect);
        on(button, 'keydown', (event) => {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                openSelect();
            }
        });

        // 선택한 URL을 새 탭으로 열고, 선택 상태를 초기화
        on(select, 'change', () => {
            if (!select.value) {
                return;
            }

            window.open(select.value, '_blank', 'noopener');
            select.selectedIndex = 0;
        });
    }

    // 헤더 햄버거 메뉴 토글
    function initGnbToggle() {
        const button = q('.menu_hamburger');
        const menu = q('.header_wrapper .gnb .gnb_bg');

        // 버튼 UI(active), 메뉴 표시(active), 접근성 aria-expanded 동기화
        const setOpen = (isOpen) => {
            button?.classList.toggle('active', isOpen);
            menu?.classList.toggle('active', isOpen);
            button?.setAttribute('aria-expanded', String(isOpen));
        };

        // 초기에는 닫힘 상태로 강제
        setOpen(false);
        onClick(button, () => setOpen(!button.classList.contains('active')));
    }

    // 우측 플로팅 "맨 위로" 버튼
    function initQuickTop() {
        onClick(q('.quick_floating .quick_top'), () => window.scrollTo({ top: 0, behavior: 'smooth' }));
    }

    // 네이티브 select 값 유무에 따라 텍스트 컬러 상태를 동기화
    // - 값이 없으면 placeholder 톤(Neutral-500)
    // - 값이 있으면 본문 톤(Neutral-800)
    function initSelectValueColor() {
        const syncSelectColor = (select) => {
            // CSS의 `select.is-selected` 규칙을 토글해 색상만 제어한다.
            select.classList.toggle('is-selected', Boolean(select.value));
        };

        qa('select').forEach((select) => {
            // 초기 렌더(서버 바인딩 값 포함) 상태 반영
            syncSelectColor(select);
            // 사용자 선택 변경 시 상태 재동기화
            on(select, 'change', () => syncSelectColor(select));
        });
    }

    // 레이어 설정 배열을 실제 레이어 바인딩으로 변환
    function initLayerBindings(registerLayers) {
        const setConsultAgreeState = (layer, isOpen) => {
            if (!layer) {
                return;
            }

            layer.hidden = !isOpen;
            layer.classList.toggle('active', isOpen);
        };

        qa('.mainEasy_consult').forEach((consultSection) => {
            qa('.form_check', consultSection).forEach((block) => {
                const checkbox = q('input[type="checkbox"]', block);
                const layer = block.nextElementSibling;

                if (!checkbox || !layer?.classList.contains('layer_agree')) {
                    return;
                }

                const syncLayerState = () => setConsultAgreeState(layer, checkbox.checked);

                on(checkbox, 'change', syncLayerState);
                syncLayerState();
            });
        });

        registerLayers([
            ...STATIC_LAYER_BINDINGS,
            // 아래 한 줄 추가만으로 신규 레이어를 붙일 수 있다.
            // 예시: { layer: '.layer_wrapper.sample', triggers: ['.btn_sample_open'] },
            { layer: '.layer_wrapper.layer_consult', triggers: ['.quick_consult'] }, //상담 신청 레이어
            { layer: '.layer_wrapper.layer_schoolSchedule', triggers: ['.btn_schoolSchedule'] }, //나의 강의실 주요 학사일정 레이어
            { layer: '.layer_wrapper.layer_taskSubmission', triggers: ['.btn_taskSubmission'] }, //나의 강의실 과제 제출 레이어
            { layer: '.layer_wrapper.layer_discussionSubmission', triggers: ['.btn_discussionSubmission'] }, //나의 강의실 토론 제출 레이어
            { layer: '.layer_wrapper.layer_messageBox', triggers: ['.btn_messageBox'] }, //나의 강의실 쪽지함 레이어
            { layer: '.layer_wrapper.layer_coursePlan', triggers: ['.btn_coursePlan'] }, //나의 강의실 강의계획서 레이어
            { layer: '.layer_wrapper.layer_progress', triggers: ['.btn_progress'] }, //페이지별 진도율 레이어
            { layer: '.layer_wrapper.layer_theory', triggers: ['.btn_theory'] }, //이론 유의사항 레이어
            { layer: '.layer_wrapper.layer_practice', triggers: ['.btn_practice'] }, //사회복지현장실습 과정 수강 시 유의사항 레이어
            { layer: '.layer_wrapper.layer_taskScore', triggers: ['.btn_taskScore'] }, //과제 성적 확인 레이어
            { layer: '.layer_wrapper.layer_discussionScore', triggers: ['.btn_discussionScore'] }, //토론 성적 확인 레이어
            { layer: '.layer_wrapper.layer_discussionTopic', triggers: ['.btn_discussionTopic'] }, //토론 주제 확인 레이어
        ]);
    }

    // 회원가입 약관 동의 섹션
    function initJoinAgreement() {
        const joinContainer = q('.join_container');
        if (!joinContainer) {
            return;
        }

        const agreeAllToggle = q('.js-agree-all', joinContainer);
        const agreeItemCheckboxes = qa('.js-agree-item', joinContainer);
        const agreeRequiredCheckboxes = qa('.js-agree-required', joinContainer);
        const joinLayerTriggers = qa('.agree_box .btn_view', joinContainer);
        const joinNextButton = q('.js-join-next', joinContainer);
        const AGREE_TOGGLE_DURATION = 260;

        const animateAgreePanel = (detailPanel, shouldOpen) => {
            if (!detailPanel) {
                return;
            }

            if (!detailPanel.dataset.pbDefault) {
                detailPanel.dataset.pbDefault = window.getComputedStyle(detailPanel).paddingBottom || '0px';
            }

            const defaultPaddingBottom = detailPanel.dataset.pbDefault;

            detailPanel.style.overflow = 'hidden';
            detailPanel.style.transition = `height ${AGREE_TOGGLE_DURATION}ms ease, opacity ${Math.max(160, AGREE_TOGGLE_DURATION - 60)}ms ease, padding-bottom ${AGREE_TOGGLE_DURATION}ms ease`;

            if (shouldOpen) {
                detailPanel.hidden = false;
                detailPanel.style.height = '0px';
                detailPanel.style.opacity = '0';
                detailPanel.style.paddingBottom = '0px';

                requestAnimationFrame(() => {
                    detailPanel.style.height = `${detailPanel.scrollHeight}px`;
                    detailPanel.style.opacity = '1';
                    detailPanel.style.paddingBottom = defaultPaddingBottom;
                });

                const onOpenEnd = (event) => {
                    if (event.propertyName !== 'height') {
                        return;
                    }

                    detailPanel.style.height = 'auto';
                    detailPanel.removeEventListener('transitionend', onOpenEnd);
                };

                detailPanel.addEventListener('transitionend', onOpenEnd);
                return;
            }

            if (detailPanel.hidden) {
                return;
            }

            detailPanel.style.height = `${detailPanel.scrollHeight}px`;
            detailPanel.style.opacity = '1';
            detailPanel.style.paddingBottom = defaultPaddingBottom;

            requestAnimationFrame(() => {
                detailPanel.style.height = '0px';
                detailPanel.style.opacity = '0';
                detailPanel.style.paddingBottom = '0px';
            });

            const onCloseEnd = (event) => {
                if (event.propertyName !== 'height') {
                    return;
                }

                detailPanel.hidden = true;
                detailPanel.removeEventListener('transitionend', onCloseEnd);
            };

            detailPanel.addEventListener('transitionend', onCloseEnd);
        };

        // 전체 동의 체크박스 동기화
        const syncAgreeAllToggle = () => {
            if (!agreeAllToggle) {
                return;
            }

            agreeAllToggle.checked = agreeItemCheckboxes.length > 0
                && agreeItemCheckboxes.every((checkbox) => checkbox.checked);
        };

        // 필수 동의 충족 여부에 따라 다음 버튼 활성/비활성
        const syncJoinNextButton = () => {
            if (!joinNextButton) {
                return;
            }

            const canProceed = agreeRequiredCheckboxes.length > 0
                && agreeRequiredCheckboxes.every((checkbox) => checkbox.checked);

            joinNextButton.disabled = !canProceed;
            joinNextButton.classList.toggle('inactive', !canProceed);
        };

        // 상세 약관 패널은 한 번에 하나만 열리도록 전체 닫기
        const closeAllJoinDetails = () => {
            joinLayerTriggers.forEach((button) => {
                button.classList.remove('active');
                button.setAttribute('aria-expanded', 'false');

                const agreeItem = button.closest('li');
                const detailPanel = q('.agree_content', agreeItem);
                agreeItem?.classList.remove('is-open');
                animateAgreePanel(detailPanel, false);
            });
        };

        // 상세 약관 토글 바인딩
        joinLayerTriggers.forEach((trigger, index) => {
            const agreeItem = trigger.closest('li');
            const detailPanel = q('.agree_content', agreeItem);
            if (!agreeItem || !detailPanel) {
                return;
            }

            detailPanel.hidden = true;
            detailPanel.style.height = '0px';
            detailPanel.style.opacity = '0';
            detailPanel.style.paddingBottom = '0px';
            detailPanel.id = `agree-detail-${index + 1}`;
            trigger.setAttribute('aria-expanded', 'false');
            trigger.setAttribute('aria-controls', detailPanel.id);

            on(trigger, 'click', (event) => {
                event.preventDefault();
                const wasOpen = !detailPanel.hidden;

                closeAllJoinDetails();
                if (wasOpen) {
                    return;
                }

                trigger.classList.add('active');
                trigger.setAttribute('aria-expanded', 'true');
                agreeItem.classList.add('is-open');
                animateAgreePanel(detailPanel, true);
            });
        });

        // 전체동의 체크 시 개별 동의값 일괄 반영
        on(agreeAllToggle, 'change', () => {
            agreeItemCheckboxes.forEach((checkbox) => {
                checkbox.checked = agreeAllToggle.checked;
            });
            syncJoinNextButton();
        });

        // 개별 동의 변경 시 전체동의/버튼 상태 재계산
        agreeItemCheckboxes.forEach((checkbox) => {
            on(checkbox, 'change', () => {
                syncAgreeAllToggle();
                syncJoinNextButton();
            });
        });

        // 초기 렌더 상태 동기화
        syncAgreeAllToggle();
        syncJoinNextButton();
    }

    // jQuery 기반 커스텀 멀티셀렉트
    function initCustomSelect() {
        if (typeof window.jQuery !== 'function') {
            return;
        }

        const CUSTOM_SELECT_EVENT_NS = '.customSelect';

        // 체크된 옵션을 selected 텍스트에 반영
        const syncCustomSelectLabel = ($select) => {
            const $selected = $select.find('.selected');
            const $checkboxes = $select.find('.options input[type=checkbox]');
            const placeholder = $selected.data('placeholder') || $selected.text();

            if (!$selected.data('placeholder')) {
                $selected.data('placeholder', placeholder);
            }

            const selected = $checkboxes
                .filter(':checked')
                .map(function () { return $(this).val(); })
                .get();

            if (!selected.length) {
                $selected.text(placeholder).removeAttr('title').removeClass('active');
                return;
            }

            const joined = selected.join(', ');
            $selected.text(joined).attr('title', joined).addClass('active');
        };

        // 페이지(또는 scope) 내 custom_select 전체 동기화
        const syncCustomSelectLabels = ($scope = $(document)) => {
            $scope.find('.custom_select').each(function () {
                syncCustomSelectLabel($(this));
            });
        };

        // 열려 있는 옵션 패널 전부 닫기
        const closeAllCustomSelectOptions = () => {
            $('.custom_select .options').hide();
        };

        // 외부에서 동적 렌더 후 다시 호출할 수 있게 전역 함수 노출
        window.initCustomSelects = (scope = document) => {
            syncCustomSelectLabels($(scope));
        };

        // 이벤트 위임으로 동적 요소까지 공통 처리
        // custom_select는 div이므로 클릭 시 해당 박스 자체에 focus()를 주어
        // .custom_select:focus 스타일이 적용되도록 처리한다.
        // label[for] 클릭 시에도 같은 custom_select에 포커스가 가도록 보완 처리한다.
        $(document)
            .off(`click${CUSTOM_SELECT_EVENT_NS}`)
            .on(`click${CUSTOM_SELECT_EVENT_NS}`, (event) => {
                const $target = $(event.target);

                if ($target.closest('.custom_select .options input[type=checkbox], .custom_select .options label').length) {
                    return;
                }

                const $labelTarget = $target.closest('label[for]');
                if ($labelTarget.length) {
                    const targetId = $labelTarget.attr('for');
                    const $labelCustomSelect = $('#' + targetId);
                    if ($labelCustomSelect.length && $labelCustomSelect.hasClass('custom_select')) {
                        $labelCustomSelect.focus();
                    }
                }

                const $customSelect = $target.closest('.custom_select');
                if (!$customSelect.length) {
                    closeAllCustomSelectOptions();
                    return;
                }

                $customSelect.focus();
                const $options = $customSelect.find('.options');
                $('.custom_select .options').not($options).hide();
                const isOpen = !$options.is(':visible');
                $options.toggle(isOpen);
                $customSelect.attr('aria-expanded', String(isOpen));
            })
            .off(`change${CUSTOM_SELECT_EVENT_NS}`, '.custom_select .options input[type=checkbox]')
            .on(`change${CUSTOM_SELECT_EVENT_NS}`, '.custom_select .options input[type=checkbox]', function () {
                const $customSelect = $(this).closest('.custom_select');
                syncCustomSelectLabel($customSelect);
                $customSelect.attr('aria-expanded', String($customSelect.find('.options').is(':visible')));
            })
            .off(`keydown${CUSTOM_SELECT_EVENT_NS}`)
            .on(`keydown${CUSTOM_SELECT_EVENT_NS}`, '.custom_select', function (event) {
                if (event.key !== 'Enter' && event.key !== ' ') {
                    return;
                }

                event.preventDefault();
                const $customSelect = $(this);
                const $options = $customSelect.find('.options');
                $('.custom_select .options').not($options).hide();
                const isOpen = !$options.is(':visible');
                $options.toggle(isOpen);
                $customSelect.attr('aria-expanded', String(isOpen));
            });

        // 최초 1회 동기화
        window.initCustomSelects();
    }

    // 메인 공지 탭
    function initNoticeTabs() {
        qa('.notice_link .board_card').forEach((card) => {
            const tabs = qa('.notice_tabs button', card);
            const panels = qa('.notice_panel', card);
            if (!tabs.length || !panels.length) {
                return;
            }

            // 탭 상태(active, aria-selected, tabindex) + 패널 hidden 동기화
            const setActiveTab = (activeIndex) => {
                tabs.forEach((tab, index) => {
                    const isActive = index === activeIndex;
                    tab.classList.toggle('active', isActive);
                    tab.setAttribute('aria-selected', String(isActive));
                    tab.setAttribute('tabindex', isActive ? '0' : '-1');
                });

                panels.forEach((panel, index) => {
                    const isActive = index === activeIndex;
                    panel.classList.toggle('active', isActive);
                    panel.hidden = !isActive;
                });
            };

            // 클릭 이벤트 바인딩
            tabs.forEach((tab, index) => onClick(tab, () => setActiveTab(index)));

            // 초기 active가 없으면 첫 탭을 기본 활성
            const defaultTabIndex = tabs.findIndex((tab) => tab.classList.contains('active'));
            setActiveTab(defaultTabIndex >= 0 ? defaultTabIndex : 0);
        });
    }

    // ============================================================
    // 초기 실행
    // - 공통 초기화 → 레이어 등록 → 페이지별 기능 초기화 순서로 진행
    // ============================================================
    [initRelatedSite, initGnbToggle, initQuickTop, initSelectValueColor].forEach((initializer) => initializer());
    const registerLayers = createLayerRegistrar();
    [
        () => initLayerBindings(registerLayers),
        initJoinAgreement,
        initCustomSelect,
        initNoticeTabs,
    ].forEach((initializer) => initializer());
    
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

    // 큰 탭 (각 .tabmenu 범위 안에서만 활성 상태를 전환)
    qa('.tab_first').forEach((container) => {
        const buttons = qa('.tabmenu_first button', container);
        const contents = qa('.tabmenu_content', container);

        buttons.forEach((button) => {
            onClick(button, () => {
                const activeContent = q(`#${button.dataset.tab}`, container);
                if (!activeContent) {
                    return;
                }

                buttons.forEach((tabButton) => tabButton.classList.remove('active'));
                contents.forEach((content) => content.classList.remove('active'));
                button.classList.add('active');
                activeContent.classList.add('active');

                qa('.calendar_rolling.swiper-container', container).forEach((element) => {
                    const swiperInstance = element.swiper;
                    if (swiperInstance) {
                        swiperInstance.update();
                        if (swiperInstance.autoplay?.running) {
                            swiperInstance.autoplay.start();
                        }
                    }
                });
            });
        });
    });
    
});