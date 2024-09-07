const laptopStatus = {};
const rentedLaptops = {}; // 대여 정보를 저장할 객체

for (let i = 1; i <= 32; i++) {
    laptopStatus[`pc${i}`] = 'available';
}

// 대여 정보 입력 폼을 표시
document.getElementById('show-form-btn').addEventListener('click', function() {
    document.getElementById('form-container').classList.remove('hidden');
    document.getElementById('modal-overlay').style.display = 'block';
    updateCheckboxState();
});

// 배경 클릭 시 모달 숨기기
document.getElementById('modal-overlay').addEventListener('click', function() {
    document.getElementById('form-container').classList.add('hidden');
    document.getElementById('info-modal').classList.add('hidden');
    document.getElementById('modal-overlay').style.display = 'none';
});

// 각 td 클릭 시 모달창 띄우기
document.querySelectorAll('.laptop-status td').forEach(td => {
    td.addEventListener('click', function() {
        const laptopId = this.getAttribute('data-id');
        const info = rentedLaptops[laptopId];

        if (info) {
            // 모달에 대여 정보 표시
            const modalContent = `
                <h2>${laptopId.toUpperCase()} 대여 정보</h2>
                <p><strong>이름:</strong> ${info.userName}</p>
                <p><strong>시간:</strong> ${info.rentalTimes.join(', ')}</p>
                <p><strong>과목:</strong> ${info.subject}</p>
                <p><strong>담당 교사:</strong> ${info.teacher}</p>
                <p><strong>반납여부:</strong> ${info.returned ? '반납됨' : '미반납'}</p>
            `;
            document.getElementById('modal-content').innerHTML = modalContent;
            document.getElementById('info-modal').classList.remove('hidden');
            document.getElementById('modal-overlay').style.display = 'block';
        } else {
            // 정보가 없는 경우
            const modalContent = `
                <h2>${laptopId.toUpperCase()} 대여 정보</h2>
                <p>대여 정보가 없습니다.</p>
            `;
            document.getElementById('modal-content').innerHTML = modalContent;
            document.getElementById('info-modal').classList.remove('hidden');
            document.getElementById('modal-overlay').style.display = 'block';
        }
    });
});

// 모달 닫기 버튼 클릭 시 모달 숨기기
document.getElementById('modal-close-btn').addEventListener('click', function() {
    document.getElementById('info-modal').classList.add('hidden');
    document.getElementById('modal-overlay').style.display = 'none';
});

// 대여 폼 제출 시
document.getElementById('rental-form').addEventListener('submit', function(event) {
    event.preventDefault();

    const userName = document.getElementById('user-name').value;
    const laptopNumbers = Array.from(document.querySelectorAll('#laptop-number input:checked')).map(checkbox => checkbox.value);
    const rentalTimes = Array.from(document.querySelectorAll('#rental-time input:checked')).map(checkbox => checkbox.value);
    const subject = document.getElementById('subject').value;
    const teacher = document.getElementById('teacher').value;

    laptopNumbers.forEach(laptopNumber => {
        const rentalCard = `
            <div class="rental-card">
                <strong>${laptopNumber.toUpperCase()}</strong>
                <div>이름: ${userName}</div>
                <div>시간: ${rentalTimes.join(', ')}</div>
                <div>과목: ${subject}</div>
                <div>담당 교사: ${teacher}</div>
                <button class="return-btn" data-id="${laptopNumber}">반납하기</button>
            </div>
        `;
        document.getElementById('rented-laptops').innerHTML += rentalCard;

        const laptopCell = document.getElementById(laptopNumber);
        laptopCell.textContent = userName;
        laptopCell.classList.remove('available');
        laptopCell.classList.add('unavailable');

        laptopStatus[laptopNumber] = 'unavailable';

        // 대여 정보 저장
        rentedLaptops[laptopNumber] = {
            userName,
            rentalTimes,
            subject,
            teacher,
            returned: false
        };
    });

    document.getElementById('form-container').classList.add('hidden');
    document.getElementById('modal-overlay').style.display = 'none';
    document.getElementById('rental-form').reset();
    updateCheckboxState();
});

// 체크박스 상태 업데이트
function updateCheckboxState() {
    document.querySelectorAll('#laptop-number input').forEach(checkbox => {
        const laptopId = checkbox.value;
        if (laptopStatus[laptopId] === 'unavailable') {
            checkbox.disabled = true;
            checkbox.parentElement.classList.add('disabled');
        } else {
            checkbox.disabled = false;
            checkbox.parentElement.classList.remove('disabled');
        }
    });
}

// 랜탈 카드의 반납 버튼 클릭 시 처리
document.getElementById('rented-laptops').addEventListener('click', function(event) {
    if (event.target.classList.contains('return-btn')) {
        const laptopId = event.target.getAttribute('data-id');
        const info = rentedLaptops[laptopId];

        if (info && !info.returned) {
            // 노트북 반납 처리
            info.returned = true;

            // 노트북 상태와 UI 업데이트
            const laptopCell = document.getElementById(laptopId);
            laptopCell.textContent = laptopId.toUpperCase();
            laptopCell.classList.remove('unavailable');
            laptopCell.classList.add('available');
            laptopStatus[laptopId] = 'available';

            // 랜탈 카드에서 반납 상태 업데이트 및 카드 제거
            const rentalCard = document.querySelector(`.rental-card .return-btn[data-id="${laptopId}"]`).parentElement;
            rentalCard.remove(); // 카드 제거

            event.target.disabled = true; // 버튼 비활성화
        }
    }
});
