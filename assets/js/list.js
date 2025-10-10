function resetForm() {
    document.querySelector('select[name="searchTargetType"]').value = '';
    document.querySelector('input[name="searchStartDateTime"]').value = '';
    document.querySelector('input[name="searchEndDateTime"]').value = '';
}

// 페이지 로드 시 resultDto 메시지 확인 및 표시
document.addEventListener('DOMContentLoaded', function() {
    // Thymeleaf에서 전달된 resultDto 확인
    const resultDtoElement = document.getElementById('resultDtoMessage');
    if (resultDtoElement && resultDtoElement.value) {
        // resultDto 메시지가 있으면 alert으로 표시
        alert(resultDtoElement.value);
    }
});