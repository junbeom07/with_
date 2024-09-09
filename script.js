const laptopStatus = {};
const rentedLaptops = {}; // 대여 정보를 저장할 객체

// 초기 상태 설정
for (let i = 1; i <= 32; i++) {
    laptopStatus[`pc${i}`] = 'available';
}

// 대여 폼 제출 시 처리
document.getElementById('rental-form').addEventListener('submit', function(event) {
    event.preventDefault();

    const userName = document.getElementById('user-name').value;
    const laptopNumbers = Array.from(document.querySelectorAll('#laptop-number input:checked')).map(checkbox => checkbox.value);
    const subject = document.getElementById('subject').value;
    const teacher = document.getElementById('teacher').value;
    const rentalTime = new Date();
    const rentalDurations = Array.from(document.querySelectorAll('#rental-duration input:checked')).map(checkbox => checkbox.value);

    laptopNumbers.forEach(laptopNumber => {
        const rentalCard = `
            <div class="rental-card" data-id="${laptopNumber}" data-rental-time="${rentalTime}" data-durations="${rentalDurations.join(',')}">
                <strong>${laptopNumber.toUpperCase()}</strong>
                <div>이름: ${userName}</div>
                <div>대여시간: ${rentalTime.toLocaleString()}</div>
                <div>과목: ${subject}</div>
                <div>담당 교사: ${teacher}</div>
                <div>이용 시간: ${rentalDurations.join(', ')}</div>
                <button class="return-btn" data-id="${laptopNumber}">반납하기</button>
            </div>
        `;
        document.getElementById('rented-laptops').insertAdjacentHTML('afterbegin', rentalCard);

        const laptopCell = document.getElementById(laptopNumber);
        laptopCell.textContent = teacher; // '담당 교사'로 변경
        laptopCell.classList.remove('available');
        laptopCell.classList.add('unavailable');

        laptopStatus[laptopNumber] = 'unavailable';

        // 대여 정보 저장
        if (!rentedLaptops[laptopNumber]) {
            rentedLaptops[laptopNumber] = [];
        }
        rentedLaptops[laptopNumber].push({
            userName,
            rentalDateTime: rentalTime,  // 선택한 대여 시간을 저장
            subject,
            teacher,
            returned: false,
            durations: rentalDurations
        });

        // 알림 및 색상 변경 설정
        rentalDurations.forEach(duration => {
            let alertTime;
            switch (duration) {
                case '1min':
                    alertTime = 1 * 60 * 1000; // 1분
                    break;
                case '1hour':
                    alertTime = 1 * 60 * 60 * 1000; // 1시간
                    break;
                case '2hours':
                    alertTime = 2 * 60 * 60 * 1000; // 2시간
                    break;
                case '3hours':
                    alertTime = 3 * 60 * 60 * 1000; // 3시간
                    break;
                case '4hours':
                    alertTime = 4 * 60 * 60 * 1000; // 4시간
                    break;
                case 'morethan4hours':
                    return; // 4시간 이상은 알림 없음
            }

            setTimeout(() => {
                // 랜탈 카드 색상 변경
                const rentalCardElement = document.querySelector(`.rental-card[data-id="${laptopNumber}"]`);
                if (rentalCardElement) {
                    rentalCardElement.classList.add('overdue-card');
                }

                // 알림 표시
                alert(`대여한 ${laptopNumber.toUpperCase()} 노트북의 대여 시간이 ${duration}이 경과되었습니다.`);
            }, alertTime);
        });
    });

    document.getElementById('form-container').classList.add('hidden');
    document.getElementById('modal-overlay').style.display = 'none';
    document.getElementById('rental-form').reset();
    updateCheckboxState();
});

// 랜탈 카드의 반납 버튼 클릭 시 처리
document.getElementById('rented-laptops').addEventListener('click', function(event) {
    if (event.target.classList.contains('return-btn')) {
        const laptopId = event.target.getAttribute('data-id');
        const info = rentedLaptops[laptopId];

        if (info && info.length > 0) {
            const lastRental = info[info.length - 1];

            if (!lastRental.returned) {
                // 노트북 반납 처리
                lastRental.returned = true;

                // 노트북 상태와 UI 업데이트
                const laptopCell = document.getElementById(laptopId);
                laptopCell.textContent = laptopId.toUpperCase();
                laptopCell.classList.remove('unavailable');
                laptopCell.classList.add('available');
                laptopStatus[laptopId] = 'available';

                // 랜탈 카드에서 반납 상태 업데이트 및 카드 색상 복원
                const rentalCardElement = document.querySelector(`.rental-card[data-id="${laptopId}"]`);
                if (rentalCardElement) {
                    rentalCardElement.classList.remove('overdue-card');
                }
                
                // 랜탈 카드 제거
                const rentalCard = document.querySelector(`.rental-card .return-btn[data-id="${laptopId}"]`).parentElement;
                rentalCard.remove(); // 카드 제거

                event.target.disabled = true; // 버튼 비활성화
            }
        }
    }
});

// 대여 폼을 표시
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

        if (info && info.length > 0) {
            // 대여 정보를 날짜별로 그룹화
            const groupedInfo = info.reduce((acc, rental) => {
                const date = rental.rentalDateTime.toLocaleDateString();  // 날짜 형식 수정
                if (!acc[date]) acc[date] = [];
                acc[date].push(rental);
                return acc;
            }, {});

            // 모달에 대여 정보 표시
            const rentalInfo = Object.entries(groupedInfo).map(([date, rentals]) => {
                const rentalDetails = rentals.map((rental, index) => `
                    <div class="rental-info-block">
                        <button class="toggle-details-btn" data-index="${index}">${rental.rentalDateTime.toLocaleTimeString()}</button>
                        <div class="rental-info-details hidden" id="info-${index}">
                            <p><strong>이름:</strong> ${rental.userName}</p>
                            <p><strong>대여시간:</strong> ${rental.rentalDateTime.toLocaleString()}</p>
                            <p><strong>과목:</strong> ${rental.subject}</p>
                            <p><strong>담당 교사:</strong> ${rental.teacher}</p>
                            <p><strong>반납여부:</strong> ${rental.returned ? '반납됨' : '미반납'}</p>
                        </div>
                    </div>
                `).join('<hr/>');
                return `
                    <h3>${date}</h3>
                    <div class="rental-info-container">
                        ${rentalDetails}
                    </div>
                `;
            }).join('<hr/>');

            document.getElementById('modal-content').innerHTML = `
                <h2>${laptopId.toUpperCase()} 대여 정보</h2>
                ${rentalInfo}
            `;
            document.getElementById('info-modal').classList.remove('hidden');
            document.getElementById('modal-overlay').style.display = 'block';

            // '상세보기' 버튼 클릭 시 해당 정보 블록 토글
            document.querySelectorAll('.toggle-details-btn').forEach(button => {
                button.addEventListener('click', function() {
                    const index = this.getAttribute('data-index');
                    const details = document.getElementById(`info-${index}`);
                    if (details.classList.contains('hidden')) {
                        details.classList.remove('hidden');
                        this.textContent = '숨기기';
                    } else {
                        details.classList.add('hidden');
                        this.textContent = rentedLaptops[laptopId][index].rentalDateTime.toLocaleTimeString();
                    }
                });
            });
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
