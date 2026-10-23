document.addEventListener('DOMContentLoaded', () => {
    // ============================================================
    // TOP 버튼
    // - 일정 높이 이상 스크롤 시 노출, 클릭 시 맨 위로 이동
    // ============================================================
    const btnTop = document.querySelector('.btn_top');

    if (btnTop) {
        const SHOW_OFFSET = 300;
        const toggleTopButton = () => {
            btnTop.classList.toggle('is-show', window.scrollY > SHOW_OFFSET);
        };

        window.addEventListener('scroll', toggleTopButton, { passive: true });
        toggleTopButton();

        btnTop.addEventListener('click', (e) => {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    // ============================================================
    // 헤더 숨김/노출
    // - 아래로 스크롤하면 header_wrap(헤더+gnb)을 숨기고, 위로 스크롤하면 다시 노출
    // - 작은 흔들림은 무시하도록 이동량 기준(DELTA)을 둔다.
    // ============================================================
    const headerWrap = document.querySelector('.header_wrap');

    if (headerWrap) {
        const DELTA = 5;
        let lastScrollY = window.scrollY;

        window.addEventListener('scroll', () => {
            const currentY = window.scrollY;

            if (Math.abs(currentY - lastScrollY) < DELTA) {
                return;
            }

            // 헤더 높이만큼 내려가기 전에는 항상 노출
            const isScrollDown = currentY > lastScrollY && currentY > headerWrap.offsetHeight;
            headerWrap.classList.toggle('is-hide', isScrollDown);
            lastScrollY = currentY;
        }, { passive: true });
    }

    // ============================================================
    // 레이어 팝업 공통
    // - 열면 body 스크롤 잠금, 닫기(.btn_x, .btn_close) 클릭 시 닫힘
    // ============================================================
    const openLayer = (layer) => {
        layer.hidden = false;
        document.body.classList.add('scroll-lock');
    };
    // 닫힘 모션(.is-closing 애니메이션)이 있는 팝업은 모션이 끝난 뒤 숨긴다.
    const closeLayer = (layer) => {
        const hide = () => {
            layer.classList.remove('is-closing');
            layer.hidden = true;
            // 팝업 위에 팝업이 열린 경우(간편상담 > 개인정보 동의) 마지막 팝업이 닫힐 때만 잠금 해제
            if (!document.querySelector('.layer_popup:not([hidden])')) {
                document.body.classList.remove('scroll-lock');
            }
        };

        layer.classList.add('is-closing');
        if (getComputedStyle(layer).animationName === 'none') {
            hide();
            return;
        }
        layer.addEventListener('animationend', hide, { once: true });
    };

    document.querySelectorAll('.layer_popup').forEach((layer) => {
        layer.querySelectorAll('.btn_x, .btn_close').forEach((button) => {
            button.addEventListener('click', () => closeLayer(layer));
        });
    });

    // 버튼 → 팝업 연결 (형식: [여는 버튼 선택자, 팝업 선택자])
    const LAYER_TRIGGERS = [
        ['.visual_nav .btn_all', '.banner_layer'],   // 배너 모아보기
        ['.quick_bar .btn_consult', '.consult_layer'], // 간편상담 신청
        ['.js-form-download', '.download_layer'],      // 서식자료실 다운로드
        ['.js-faq-pop', '.faq_layer'],                 // FAQ 자주 찾는 질문 TOP5
        ['.js-notice-pop', '.notice_layer'],           // 수강중인 강좌 이론 과정 유의사항
        ['.btn_progress', '.progress_layer'],          // 수강중인 강좌 페이지별 진도율 (비활성 버튼은 열리지 않음)
        ['.btn_isms', '.isms_layer'],                  // 푸터 ISMS 인증서 (이미지 누르면 닫힘)
        ['.js-send-code', '.send_layer'],              // 비밀번호 잠금 해제(이메일) 인증번호 발송 안내
        ['.btn_profile', '.profile_layer'],            // 강좌 상세 교수님 소개
        ['.js-pay-info', '.payinfo_layer[data-type="wait"]'], // 결제 내역 결제 정보 확인 : 결제 대기 (하단 시트)
        ['.js-pay-done', '.payinfo_layer[data-type="done"]'], // 결제 내역 결제 정보 확인 : 결제 완료 (하단 시트)
        ['.js-refund-info', '.payinfo_layer[data-type="refund"]'], // 환불 내역 환불 정보 확인 (하단 시트)
    ];

    // 진입 시 바로 여는 팝업 (data-auto-open) : 알림 팝업 등
    document.querySelectorAll('.layer_popup[data-auto-open]').forEach(openLayer);

    // 문서에서 한 번에 받아 처리 : 스와이퍼 loop 로 복제된 버튼(푸터 ISMS 등)도 동작
    document.addEventListener('click', (e) => {
        LAYER_TRIGGERS.forEach(([triggerSelector, layerSelector]) => {
            const layer = document.querySelector(layerSelector);

            if (layer && e.target.closest(triggerSelector)) {
                e.preventDefault();
                openLayer(layer);
            }
        });
    });

    // 간편상담 개인정보 동의 : 체크하는 순간 약관 팝업 노출 (체크 해제 시에는 열지 않음)
    const agreeLayer = document.querySelector('.agree_layer');
    document.querySelector('.consult_layer .agree input')?.addEventListener('change', (e) => {
        if (e.target.checked && agreeLayer) {
            openLayer(agreeLayer);
        }
    });

    // ============================================================
    // 회원가입 약관동의 (member/step_01)
    // - 전체 동의 ↔ 개별 동의 상태 동기화
    // - 필수 약관(.js-agree-required)을 모두 체크해야 "다음" 버튼 활성화
    // - 화살표(.btn_view) 클릭 시 해당 약관 내용을 팝업(.agree_layer)에 채워서 노출
    // ============================================================
    const agreeAll = document.querySelector('.js-agree-all');
    const agreeItems = document.querySelectorAll('.js-agree-item');
    const btnJoinNext = document.querySelector('.js-join-next');

    if (agreeAll && agreeItems.length) {
        const syncAgreeState = () => {
            const items = Array.from(agreeItems);
            agreeAll.checked = items.every((item) => item.checked);
            if (btnJoinNext) {
                btnJoinNext.disabled = !items
                    .filter((item) => item.classList.contains('js-agree-required'))
                    .every((item) => item.checked);
            }
        };

        agreeAll.addEventListener('change', () => {
            agreeItems.forEach((item) => {
                item.checked = agreeAll.checked;
            });
            syncAgreeState();
        });
        agreeItems.forEach((item) => item.addEventListener('change', syncAgreeState));
        syncAgreeState();
    }

    // 로그인 폼 : 처음에 disabled인 버튼은 입력 가능한 칸이 모두 채워지면 활성화
    document.querySelectorAll('.login_form').forEach((form) => {
        const buttons = form.querySelectorAll('.btn_primary:disabled:not(.js-static)');
        const inputs = form.querySelectorAll('input[type="text"]:not(:disabled), input[type="password"]:not(:disabled)');

        if (!buttons.length) {
            return;
        }
        form.addEventListener('input', () => {
            const isFilled = Array.from(inputs).every((input) => input.value.trim() !== '');
            buttons.forEach((button) => {
                button.disabled = !isFilled;
            });
        });
    });

    // 탭 공통 (나의 강의실 과정 탭, TV 라인 탭) : data-panel 이 같은 패널만 노출, 선택 탭을 가운데로 스크롤
    document.querySelectorAll('[role="tablist"]').forEach((tabList) => {
        const tabs = tabList.querySelectorAll('[data-panel]');
        const panels = tabList.parentElement.querySelectorAll(':scope > [data-panel]'); // 패널 + 탭에 따라 바뀌는 영역(결제 내역 유의사항 등)

        tabs.forEach((tab) => {
            tab.addEventListener('click', () => {
                tabs.forEach((item) => {
                    const isOn = item === tab;
                    item.classList.toggle('on', isOn);
                    item.setAttribute('aria-selected', isOn);
                });
                panels.forEach((panel) => {
                    panel.hidden = panel.dataset.panel !== tab.dataset.panel;
                });
                tab.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
            });
        });
    });

    // 결제 정보 하단 시트 : 이전 / 다음으로 주문(.pay_page) 하나씩 노출, 제목 옆 현재 번호 갱신
    // - 처음이면 이전, 마지막이면 다음 비활성 / 주문이 1건이면 이전·다음 영역 숨김
    document.querySelectorAll('.payinfo_layer').forEach((layer) => {
        const pages = layer.querySelectorAll('.pay_page');
        const current = layer.querySelector('h2 em');
        const nav = layer.querySelector('.pay_nav');
        const prev = nav.querySelector('.prev');
        const next = nav.querySelector('.next');
        let index = 0;
        const show = (target) => {
            index = Math.min(Math.max(target, 0), pages.length - 1);
            pages.forEach((page, i) => {
                page.hidden = i !== index;
            });
            current.textContent = index + 1;
            prev.disabled = index === 0;
            next.disabled = index === pages.length - 1;
        };
        nav.hidden = pages.length <= 1;
        prev.addEventListener('click', () => show(index - 1));
        next.addEventListener('click', () => show(index + 1));
        show(0);
    });

    // 강의계획서 확인 (payment/course_plan_check) : "강의계획서 확인하기"를 누르면 확인 문구 체크 + 결제하기 활성화
    // - 강의계획서 페이지에 다녀와도 유지되도록 세션 저장소에 기록 (실제 동의 여부 판단은 개발에서 처리)
    document.querySelectorAll('.plan_bar').forEach((bar) => {
        const pay = bar.querySelector('.js-plan-pay');
        const confirmPlan = () => {
            bar.classList.add('is-confirmed');
            pay.disabled = false;
        };
        try {
            if (sessionStorage.getItem('planConfirmed')) confirmPlan();
        } catch (e) {
            // 저장소 접근이 막힌 환경에서는 매번 비활성으로 시작
        }
        bar.querySelector('.js-plan-view').addEventListener('click', () => {
            confirmPlan();
            try {
                sessionStorage.setItem('planConfirmed', '1');
            } catch (e) {
                // 저장 실패 시에도 현재 화면은 활성 상태 유지
            }
        });
        pay.addEventListener('click', () => {
            if (pay.dataset.href) location.href = pay.dataset.href;
        });
    });

    // 툴팁 (성적관리 평가 기준) : 버튼으로 열고 닫기, 바깥·툴팁 내용을 누르면 닫힘, 한 번에 하나만 열림, 화살표는 버튼 위치에 맞춤
    const tooltipButtons = document.querySelectorAll('.btn_tooltip');
    const closeTooltips = (except) => {
        tooltipButtons.forEach((button) => {
            if (button === except) {
                return;
            }
            button.setAttribute('aria-expanded', 'false');
            document.getElementById(button.getAttribute('aria-controls')).hidden = true;
        });
    };
    tooltipButtons.forEach((button) => {
        const tooltip = document.getElementById(button.getAttribute('aria-controls'));
        button.addEventListener('click', () => {
            closeTooltips(button);
            tooltip.style.setProperty('--arrow-x', `${button.offsetLeft + button.offsetWidth / 2}px`); // 화살표를 버튼 가운데로
            tooltip.hidden = !tooltip.hidden;
            button.setAttribute('aria-expanded', String(!tooltip.hidden));
        });
    });
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.btn_tooltip')) {
            closeTooltips(); // 바깥이나 툴팁 내용을 누르면 닫힘
        }
    });

    // 나의 학사일정 달력 : 날짜 클릭 시 선택(.selected) 이동 (일정 데이터 갱신은 개발에서 처리)
    document.querySelectorAll('.calendar').forEach((calendar) => {
        const days = calendar.querySelectorAll('button');

        days.forEach((day) => {
            day.addEventListener('click', () => {
                days.forEach((item) => {
                    item.classList.toggle('selected', item === day);
                    item.setAttribute('aria-pressed', item === day);
                });
            });
        });
    });

    // ============================================================
    // 아코디언 공통 (쪽지함, FAQ)
    // - 구조 : ul.accordion > li > button(제목) + div(내용)
    // - 제목 클릭 시 li.open 토글, 내용 영역 높이/여백을 0 ↔ 실제 크기로 애니메이션
    // - "동작 줄이기" 설정 시 애니메이션 없이 즉시 전환
    // ============================================================
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const slideBody = (body, isOpen) => {
        body.getAnimations().forEach((animation) => animation.cancel());
        body.hidden = false;

        if (reduceMotion.matches) {
            body.hidden = !isOpen;
            return;
        }

        const style = getComputedStyle(body);
        const opened = { height: `${body.offsetHeight}px`, paddingTop: style.paddingTop, paddingBottom: style.paddingBottom, opacity: 1 };
        const closed = { height: '0px', paddingTop: '0px', paddingBottom: '0px', opacity: 0 };
        const animation = body.animate(isOpen ? [closed, opened] : [opened, closed], {
            duration: 300,
            easing: 'cubic-bezier(.22, 1, .36, 1)',
        });

        body.style.overflow = 'hidden';
        animation.onfinish = () => {
            body.style.overflow = '';
            body.hidden = !isOpen;
        };
    };

    document.querySelectorAll('.accordion > li > button').forEach((title) => {
        title.addEventListener('click', () => {
            const item = title.parentElement;
            const isOpen = !item.classList.contains('open');
            item.classList.toggle('open', isOpen);
            title.setAttribute('aria-expanded', isOpen);
            slideBody(title.nextElementSibling, isOpen);
        });
    });

    // 쪽지함 : 펼치면 읽음 처리, "전체 읽음 처리"
    const msgList = document.querySelector('.msg_list');

    if (msgList) {
        const unreadCount = document.querySelector('.js-unread-count');
        const updateUnreadCount = () => {
            if (unreadCount) {
                unreadCount.textContent = msgList.querySelectorAll(':scope > .unread').length;
            }
        };

        msgList.querySelectorAll('.msg_title').forEach((title) => {
            title.addEventListener('click', () => {
                title.parentElement.classList.remove('unread');
                updateUnreadCount();
            });
        });

        document.querySelector('.js-read-all')?.addEventListener('click', () => {
            msgList.querySelectorAll(':scope > .unread').forEach((item) => item.classList.remove('unread'));
            updateUnreadCount();
        });
    }

    // 첨부된 파일 삭제 (글쓰기) : 실제 파일 목록 처리는 개발에서 연동
    document.addEventListener('click', (e) => {
        e.target.closest('.file_item .btn_delete')?.closest('.file_item').remove();
    });

    // 김영평생교육원 TV : 카드 클릭 시 유튜브 영상 팝업 재생, 닫으면 영상 제거(재생 중지)
    const videoLayer = document.querySelector('.video_layer');

    if (videoLayer) {
        const videoFrame = videoLayer.querySelector('.video_frame');

        document.querySelectorAll('.js-tv-play').forEach((card) => {
            card.addEventListener('click', () => {
                const iframe = document.createElement('iframe');
                iframe.src = `https://www.youtube.com/embed/${card.dataset.youtube}?autoplay=1&playsinline=1&rel=0`;
                iframe.title = card.querySelector('strong')?.textContent || '영상';
                iframe.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen';
                iframe.allowFullscreen = true;
                videoFrame.replaceChildren(iframe);
                openLayer(videoLayer);
            });
        });
        videoLayer.querySelector('.btn_x').addEventListener('click', () => videoFrame.replaceChildren());
    }

    // 라디오 선택 시 화면 이동 (아이디/비밀번호 찾기 방법)
    document.querySelectorAll('input[type="radio"][data-href]').forEach((radio) => {
        radio.addEventListener('change', () => {
            location.href = radio.dataset.href;
        });
    });

    // 다음 단계 이동 (data-href)
    btnJoinNext?.addEventListener('click', () => {
        if (!btnJoinNext.disabled && btnJoinNext.dataset.href) {
            location.href = btnJoinNext.dataset.href;
        }
    });

    // ============================================================
    // 입력 폼 공통 (member/step_02 등)
    // ============================================================
    // 입력값 삭제 버튼
    document.querySelectorAll('.input_clear .btn_clear').forEach((button) => {
        button.addEventListener('click', () => {
            const input = button.previousElementSibling;
            input.value = '';
            input.dispatchEvent(new Event('input', { bubbles: true }));
            input.focus();
        });
    });

    // 다중 선택 드롭다운 : 열기/닫기, 선택값을 쉼표로 표시
    document.querySelectorAll('.custom_select').forEach((select) => {
        const selectedText = select.querySelector('.selected');
        const placeholder = selectedText.textContent;
        const setExpanded = (isOpen) => select.setAttribute('aria-expanded', isOpen);

        select.addEventListener('click', (e) => {
            // 옵션 영역 안의 클릭은 선택 동작이므로 닫지 않는다.
            if (!e.target.closest('.options')) {
                setExpanded(select.getAttribute('aria-expanded') !== 'true');
            }
        });
        select.addEventListener('keydown', (e) => {
            if (e.target === select && (e.key === 'Enter' || e.key === ' ')) {
                e.preventDefault();
                setExpanded(select.getAttribute('aria-expanded') !== 'true');
            }
        });
        select.addEventListener('change', () => {
            const values = Array.from(select.querySelectorAll(':checked')).map((input) => input.value);
            selectedText.textContent = values.length ? values.join(', ') : placeholder;
            select.classList.toggle('is-selected', values.length > 0);
        });
        document.addEventListener('click', (e) => {
            if (!select.contains(e.target)) {
                setExpanded(false);
            }
        });
    });

    // 김영편입 ID : "수강" 선택 시에만 ID 입력 가능
    const kimyoungId = document.querySelector('#kimyoung_id');
    document.querySelectorAll('input[name="id_status"]').forEach((radio, index) => {
        radio.addEventListener('change', () => {
            kimyoungId.disabled = index !== 0;
        });
    });

    document.querySelectorAll('.agree_list .btn_view').forEach((button) => {
        button.addEventListener('click', () => {
            const item = button.closest('li');
            const content = item.querySelector('.agree_content');

            if (!agreeLayer || !content) {
                return;
            }
            // "(필수) 사이트 이용약관 동의" → "사이트 이용약관 동의"
            agreeLayer.querySelector('h2').textContent = item.querySelector('label span').textContent.replace(/\(.+?\)\s*/, '');
            agreeLayer.querySelector('.terms').innerHTML = content.innerHTML;
            agreeLayer.querySelector('.terms').scrollTop = 0;
            openLayer(agreeLayer);
        });
    });

    // ============================================================
    // 메인 레이어 팝업
    // - 진입 시 노출, "오늘 하루 보지 않기" 선택 시 당일 자정까지 숨김
    // - 저장소 접근이 막힌 환경(사생활 보호 모드 등)에서는 매번 노출
    // ============================================================
    const mainLayer = document.querySelector('.main_layer');

    if (mainLayer) {
        const STORAGE_KEY = 'mainLayerHideUntil';
        const getHideUntil = () => {
            try {
                return Number(localStorage.getItem(STORAGE_KEY)) || 0;
            } catch (e) {
                return 0;
            }
        };

        if (Date.now() > getHideUntil()) {
            openLayer(mainLayer);
        }

        mainLayer.querySelector('.btn_today')?.addEventListener('click', () => {
            const midnight = new Date();
            midnight.setHours(24, 0, 0, 0);
            try {
                localStorage.setItem(STORAGE_KEY, midnight.getTime());
            } catch (e) {
                // 저장 실패 시에도 팝업은 닫는다.
            }
            closeLayer(mainLayer);
        });
    }

    // ============================================================
    // 전체메뉴
    // - 햄버거 버튼으로 열고, 닫기 버튼/바깥 영역/Esc로 닫는다.
    // - 1차 메뉴 버튼 클릭 시 해당 2차 메뉴만 노출(.on)
    // ============================================================
    const allMenu = document.querySelector('.all_menu');
    const btnMenu = document.querySelector('.header .btn_menu');

    if (allMenu && btnMenu) {
        const setMenuOpen = (isOpen) => {
            allMenu.classList.toggle('is-open', isOpen);
            document.body.classList.toggle('scroll-lock', isOpen);
            btnMenu.setAttribute('aria-expanded', isOpen);
        };

        btnMenu.addEventListener('click', (e) => {
            e.stopPropagation();
            setMenuOpen(true);
        });
        allMenu.querySelector('.btn_close')?.addEventListener('click', () => setMenuOpen(false));

        // 메뉴 바깥(딤 영역) 클릭 시 닫기
        document.addEventListener('click', (e) => {
            if (allMenu.classList.contains('is-open') && !allMenu.contains(e.target)) {
                setMenuOpen(false);
            }
        });
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                setMenuOpen(false);
            }
        });

        allMenu.querySelectorAll('.depth1 > li > button').forEach((button) => {
            button.addEventListener('click', () => {
                allMenu.querySelector('.depth1 > .on')?.classList.remove('on');
                button.parentElement.classList.add('on');
            });
        });
    }
});
