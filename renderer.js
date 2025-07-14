// renderer.js
const loginSection = document.getElementById("loginSection");
const riotIdInput = document.getElementById("riotId");
const lolPlatformRegionSelect = document.getElementById("lolPlatformRegion");
const rememberMeCheckbox = document.getElementById("rememberMe");
const loginBtn = document.getElementById("loginBtn");
const loginErrorMessage = document.getElementById("loginErrorMessage");

const dashboardSection = document.getElementById("dashboardSection");
const profileInfoCard = document.getElementById("profileInfoCard");
const dashboardRiotId = document.getElementById("dashboardRiotId");
const dashboardSummonerLevel = document.getElementById("dashboardSummonerLevel");
const dashboardSummonerRank = document.getElementById("dashboardSummonerRank");
const dashboardLolRegion = document.getElementById("dashboardLolRegion");
const profileDescriptionInput = document.getElementById("profileDescription");
const saveDescriptionBtn = document.getElementById("saveDescriptionBtn");
const descriptionSaveMessage = document.getElementById("descriptionSaveMessage");
const descriptionErrorMessage = document.getElementById("descriptionErrorMessage");
const startSearchBtn = document.getElementById("startSearchBtn");
const logoutBtn = document.getElementById("logoutBtn");
const queueTypeSelect = document.getElementById("queueTypeSelect");
const laneSelect = document.getElementById("laneSelect");


const searchSection = document.getElementById("searchSection");
const tabButtons = document.querySelectorAll(".tab-button"); // Всі кнопки вкладок
const currentSearchRegionTitle = document.getElementById("currentSearchRegion");
const currentUserInQueueCard = document.getElementById("currentUserInQueue");
const searchQueueList = document.getElementById("searchQueueList");
const stopSearchBtn = document.getElementById("stopSearchBtn");

const playerProfileModal = document.getElementById("playerProfileModal");
const playerProfileCloseBtn = document.getElementById("playerProfileCloseBtn");
const playerProfileNickname = document.getElementById("playerProfileNickname");
const playerProfileRank = document.getElementById("playerProfileRank");
const playerProfileQueue = document.getElementById("playerProfileQueue");
const playerProfileLane = document.getElementById("playerProfileLane");
const playerProfileDescription = document.getElementById("playerProfileDescription");

// НОВІ КОНСТАНТИ ДЛЯ НОВИН
const newsTabBtn = document.getElementById('newsTabBtn');
const newsSection = document.getElementById('newsSection');
const newsList = document.getElementById('newsList');

let currentSearchRegion = localStorage.getItem("lolPlatformRegion") || "euw1";
const socket = io("http://localhost:3000"); // Підключення до Socket.IO серверу

// --- Функції Socket.IO ---

socket.on("connect", () => {
    console.log("Підключено до сервера Socket.IO");
    const savedRiotId = localStorage.getItem("riotId");
    const savedRegion = localStorage.getItem("lolPlatformRegion");
    if (savedRiotId && savedRegion) {
        socket.emit("clientConnected", { riotId: savedRiotId, region: savedRegion });
    }
    // Оновлюємо UI при підключенні на випадок, якщо вже були в черзі
    updateSearchQueueUI(currentSearchRegion);
});

socket.on("disconnect", () => {
    console.log("Відключено від сервера Socket.IO");
});

socket.on("updateQueue", (data) => {
    console.log("Оновлення черги отримано:", data);
    updateSearchQueueUI(currentSearchRegion); // Оновлюємо UI, коли приходять нові дані черги
});

socket.on("profileUpdated", (data) => {
    console.log("Профіль оновлено:", data);
    if (localStorage.getItem("riotId") === data.riotId) {
        // Якщо це наш профіль, оновлюємо дані на дашборді
        dashboardSummonerLevel.textContent = data.summonerLevel;
        dashboardSummonerRank.innerHTML = getRankDisplayHtml(data.rank);
        dashboardLolRegion.textContent = data.lolRegion.toUpperCase();
        profileDescriptionInput.value = data.profileDescription || '';
        queueTypeSelect.value = data.queueType || 'Будь-яка черга';
        laneSelect.value = data.lane || 'Будь-яка лінія';
        descriptionSaveMessage.textContent = 'Зміни збережено!';
        setTimeout(() => {
            descriptionSaveMessage.textContent = '';
        }, 3000);
    }
    updateSearchQueueUI(currentSearchRegion); // Також оновлюємо чергу, бо міг змінитися ранг/опис
});

socket.on("error", (message) => {
    console.error("Помилка від сервера:", message);
    loginErrorMessage.textContent = `Помилка: ${message}`;
});

// --- Функції UI та обробники подій ---

// Функція для перемикання видимості секцій
function switchTab(activeSectionId, clickedButton) {
    // Приховуємо всі секції
    loginSection.style.display = 'none';
    dashboardSection.style.display = 'none';
    searchSection.style.display = 'none';
    newsSection.style.display = 'none'; // Додаємо секцію новин

    // Показуємо активну секцію
    document.getElementById(activeSectionId).style.display = 'block';

    // Видаляємо клас 'active' з усіх кнопок вкладок у контейнері .tabs
    document.querySelectorAll('.tabs .tab-button').forEach(btn => {
        btn.classList.remove('active');
    });

    // Додаємо клас 'active' до натиснутої кнопки, якщо вона є
    if (clickedButton) {
        clickedButton.classList.add('active');
    }
}

// Обробники для кнопок управління вікном
const minimizeBtn = document.getElementById('minimize-btn');
const maximizeRestoreBtn = document.getElementById('maximize-restore-btn');
const closeBtn = document.getElementById('close-btn');

if (minimizeBtn) {
    minimizeBtn.addEventListener('click', () => {
        window.electronAPI.minimizeWindow();
    });
}
if (maximizeRestoreBtn) {
    maximizeRestoreBtn.addEventListener('click', () => {
        window.electronAPI.maximizeRestoreWindow();
    });
}
if (closeBtn) {
    closeBtn.addEventListener('click', () => {
        window.electronAPI.closeWindow();
    });
}

// Обробники для зміни іконок максимізації/відновлення
window.electronAPI.onSetMaximized(() => {
    if (maximizeRestoreBtn) {
        maximizeRestoreBtn.innerHTML = '<svg viewBox="0 0 10 10" aria-hidden="true" role="presentation" style="width: 10px; height: 10px; fill: #fff;"><path d="M2 1L2 9 9 9 9 1 2 1ZM8 2L3 2 3 8 8 8 8 2Z"></path></svg>'; // Іконка Restore
    }
});

window.electronAPI.onSetUnmaximized(() => {
    if (maximizeRestoreBtn) {
        maximizeRestoreBtn.innerHTML = '<svg viewBox="0 0 10 10" aria-hidden="true" role="presentation" style="width: 10px; height: 10px; fill: #fff;"><path d="M0 0L0 10 10 10 10 0 0 0ZM9 1L9 9 1 9 1 1 9 1Z"></path></svg>'; // Іконка Maximize
    }
});


// Функція для логіну
loginBtn.addEventListener("click", async () => {
    const riotId = riotIdInput.value.trim();
    const lolPlatformRegion = lolPlatformRegionSelect.value;
    const rememberMe = rememberMeCheckbox.checked;

    if (!riotId) {
        loginErrorMessage.textContent = "Будь ласка, введіть ваш Riot ID.";
        return;
    }

    loginErrorMessage.textContent = "Вхід...";
    try {
        const response = await axios.post("http://localhost:3000/api/login", {
            riotId,
            lolPlatformRegion,
        });
        const data = response.data;

        if (data.success) {
            if (rememberMe) {
                localStorage.setItem("riotId", data.user.riotId);
                localStorage.setItem("lolPlatformRegion", data.user.lolRegion);
            } else {
                localStorage.removeItem("riotId");
                localStorage.removeItem("lolPlatformRegion");
            }

            dashboardRiotId.textContent = data.user.riotId;
            dashboardSummonerLevel.textContent = data.user.summonerLevel;
            dashboardSummonerRank.innerHTML = getRankDisplayHtml(data.user.rank);
            dashboardLolRegion.textContent = data.user.lolRegion.toUpperCase();
            profileDescriptionInput.value = data.user.profileDescription || '';
            queueTypeSelect.value = data.user.queueType || 'Будь-яка черга';
            laneSelect.value = data.user.lane || 'Будь-яка лінія';


            loginErrorMessage.textContent = "";
            switchTab('dashboardSection'); // Перехід на дашборд
            socket.emit("clientConnected", { riotId: data.user.riotId, region: data.user.lolRegion });
            currentSearchRegion = data.user.lolRegion; // Оновлюємо поточний регіон пошуку
            updateSearchQueueUI(currentSearchRegion);

        } else {
            loginErrorMessage.textContent = data.error || "Невідома помилка входу.";
        }
    } catch (error) {
        console.error("Error during login:", error);
        loginErrorMessage.textContent = "Помилка мережі або сервера при вході.";
    }
});

// Функція для виходу
logoutBtn.addEventListener("click", () => {
    localStorage.removeItem("riotId");
    localStorage.removeItem("lolPlatformRegion");
    socket.emit("leaveQueue", { riotId: dashboardRiotId.textContent, region: dashboardLolRegion.textContent.toLowerCase() }); // Повідомляємо сервер про вихід з черги
    switchTab('loginSection'); // Перехід на сторінку логіну
});

// Функція збереження опису та налаштувань профілю
saveDescriptionBtn.addEventListener('click', async () => {
    const riotId = dashboardRiotId.textContent;
    const lolRegion = dashboardLolRegion.textContent.toLowerCase();
    const description = profileDescriptionInput.value.trim();
    const queueType = queueTypeSelect.value;
    const lane = laneSelect.value;

    descriptionSaveMessage.textContent = 'Збереження...';
    descriptionErrorMessage.textContent = '';

    try {
        const response = await axios.post('http://localhost:3000/api/profile/update', {
            riotId,
            lolRegion,
            profileDescription: description,
            queueType,
            lane
        });

        if (response.data.success) {
            descriptionSaveMessage.textContent = 'Зміни збережено!';
            setTimeout(() => {
                descriptionSaveMessage.textContent = '';
            }, 3000);
            // Оновлюємо дані на сервері Socket.IO, якщо користувач у черзі
            socket.emit("updateProfile", {
                riotId: riotId,
                region: lolRegion,
                queueType: queueType,
                lane: lane,
                profileDescription: description
            });
        } else {
            descriptionErrorMessage.textContent = response.data.error || 'Не вдалося зберегти зміни.';
        }
    } catch (error) {
        console.error('Помилка збереження опису:', error);
        descriptionErrorMessage.textContent = 'Помилка мережі при збереженні змін.';
    }
});

// Функція початку пошуку
startSearchBtn.addEventListener("click", () => {
    const riotId = dashboardRiotId.textContent;
    const lolRegion = dashboardLolRegion.textContent.toLowerCase();
    const queueType = queueTypeSelect.value;
    const lane = laneSelect.value;
    const profileDescription = profileDescriptionInput.value;

    socket.emit("joinQueue", {
        riotId,
        region: lolRegion,
        queueType,
        lane,
        profileDescription,
    });
    switchTab('searchSection');
    currentSearchRegion = lolRegion; // Забезпечуємо, що вкладка пошуку відображає регіон користувача
    currentSearchRegionTitle.textContent = `Пошук на ${getRegionDisplayName(currentSearchRegion)}`;
    updateSearchQueueUI(currentSearchRegion);
});

// Функція зупинки пошуку
stopSearchBtn.addEventListener("click", () => {
    const riotId = dashboardRiotId.textContent;
    const lolRegion = dashboardLolRegion.textContent.toLowerCase();
    socket.emit("leaveQueue", { riotId, region: lolRegion });
    switchTab('dashboardSection'); // Повернутися на дашборд
});

// Обробники для кнопок вкладок регіонів
tabButtons.forEach(button => {
    button.addEventListener('click', () => {
        const region = button.dataset.region;
        if (region) { // Перевірка, що це кнопка регіону
            currentSearchRegion = region;
            currentSearchRegionTitle.textContent = `Пошук на ${getRegionDisplayName(region)}`;
            updateSearchQueueUI(currentSearchRegion);
            // switchTab вже обробляє активацію кнопки
        }
    });
});

// Обробники для фільтрів
const filterRank = document.getElementById('filterRank');
const filterQueueType = document.getElementById('filterQueueType');
const filterLane = document.getElementById('filterLane');

filterRank.addEventListener('change', () => updateSearchQueueUI(currentSearchRegion));
filterQueueType.addEventListener('change', () => updateSearchQueueUI(currentSearchRegion));
filterLane.addEventListener('change', () => updateSearchQueueUI(currentSearchRegion));


// Оновлення UI черги пошуку
async function updateSearchQueueUI(region) {
    try {
        const rankFilter = filterRank.value;
        const queueTypeFilter = filterQueueType.value;
        const laneFilter = filterLane.value;

        const response = await axios.get(`http://localhost:3000/api/queue/${region}`);
        const queueData = response.data.queue;
        const currentUser = response.data.currentUser; // Отримуємо інформацію про поточного користувача

        searchQueueList.innerHTML = ""; // Очищаємо список

        let displayedUsersCount = 0;

        // Відображення картки поточного користувача у черзі
        if (currentUser && currentUser.region === region) {
            currentUserInQueueCard.style.display = 'block';
            currentUserInQueueCard.innerHTML = `
                <h3>Ви у черзі:</h3>
                <p>${currentUser.riotId} (${currentUser.lolRegion.toUpperCase()})</p>
                <p>Ранг: ${currentUser.rank}</p>
                <p>Черга: ${currentUser.queueType}</p>
                <p>Лінія: ${currentUser.lane}</p>
            `;
            displayedUsersCount++;
        } else {
            currentUserInQueueCard.style.display = 'none';
        }

        // Відображення інших користувачів у черзі
        if (queueData && queueData.length > 0) {
            queueData.forEach(buddy => {
                // Фільтрація за вибраними критеріями
                const matchesRank = (rankFilter === 'Будь-який ранг' || buddy.rank.toUpperCase().startsWith(rankFilter));
                const matchesQueueType = (queueTypeFilter === 'Будь-яка черга' || buddy.queueType === queueTypeFilter);
                const matchesLane = (laneFilter === 'Будь-яка лінія' || buddy.lane === laneFilter);

                // Перевіряємо, чи це не поточний користувач (щоб не дублювати)
                const isOwnProfile = (currentUser && buddy.riotId === currentUser.riotId && buddy.lolRegion === currentUser.lolRegion);

                if (matchesRank && matchesQueueType && matchesLane && !isOwnProfile) {
                    const userCard = document.createElement('div');
                    userCard.className = 'user-card';
                    userCard.id = `user-${buddy.puuid ? buddy.puuid.replace(/[^a-zA-Z0-9]/g, '-') : buddy.riotId.replace(/[^a-zA-Z0-9]/g, '-')}`; // Використовуємо PUUID, якщо є
                    userCard.innerHTML = `
                        <h3>${buddy.riotId} (${buddy.lolRegion.toUpperCase()})</h3>
                        <p class="user-details">Ранг: ${buddy.rank}</p>
                        <p class="user-details">Черга: ${buddy.queueType}</p>
                        <p class="user-details">Лінія: ${buddy.lane}</p>
                        <button class="view-profile-btn" data-riot-id="${buddy.riotId}" data-lol-region="${buddy.lolRegion}">Переглянути профіль</button>
                    `;
                    searchQueueList.appendChild(userCard);
                    displayedUsersCount++;
                }
            });

            if (displayedUsersCount === 0) {
                searchQueueList.innerHTML = "<p>Немає користувачів, що відповідають вашим фільтрам або крім вас.</p>";
            }
        } else {
            searchQueueList.innerHTML = "<p>Поки що ніхто не шукає...</p>";
        }

    } catch (error) {
        console.error("Error updating search queue UI:", error);
        searchQueueList.innerHTML = `<p class="error-message">Не вдалося завантажити список. Помилка: ${error.message}</p>`;
        currentUserInQueueCard.style.display = 'none';
    }
}


// Відкриття модального вікна профілю гравця
document.addEventListener('click', async (event) => {
    if (event.target.classList.contains('view-profile-btn')) {
        const riotId = event.target.dataset.riotId;
        const lolRegion = event.target.dataset.lolRegion;
        await openPlayerProfileModal(riotId, lolRegion);
    }
});

playerProfileCloseBtn.addEventListener('click', () => {
    playerProfileModal.style.display = 'none';
});

// Закриття модального вікна по кліку поза ним
window.addEventListener('click', (event) => {
    if (event.target === playerProfileModal) {
        playerProfileModal.style.display = 'none';
    }
});


// Функція для відкриття модального вікна профілю гравця
async function openPlayerProfileModal(riotId, lolRegion) {
    try {
        const response = await axios.get(`http://localhost:3000/api/user-profile/${riotId}/${lolRegion}`);
        const userData = response.data;

        if (userData.success) {
            playerProfileNickname.textContent = userData.profile.riotId;
            playerProfileRank.innerHTML = getRankDisplayHtml(userData.profile.rank); // Використовуємо функцію для відображення рангу
            playerProfileQueue.textContent = `Черга: ${userData.profile.queueType || 'Не вказано'}`;
            playerProfileLane.textContent = `Лінія: ${userData.profile.lane || 'Не вказано'}`;
            playerProfileDescription.textContent = userData.profile.profileDescription || "Опис відсутній.";

            if (playerProfileModal) {
                playerProfileModal.style.display = "block";
            }
        } else {
            alert(
                "Не вдалося завантажити профіль гравця: " +
                (userData.error || "Невідома помилка")
            );
        }
    } catch (error) {
        console.error("Error fetching player profile:", error);
        alert("Помилка мережі при завантаженні профілю гравця.");
    }
}


// Допоміжна функція для отримання шляху до картинки рангу
function getRankDisplayHtml(tier) {
    const baseTier = tier.toUpperCase();
    let imageTier = baseTier;

    // Специфічні кейси для Master/Grandmaster/Challenger, якщо вони використовують одну картинку
    if (baseTier === 'GRANDMASTER' || baseTier === 'CHALLENGER') {
        imageTier = 'master'; // Або інша картинка, якщо у вас є окрема
    } else {
        imageTier = baseTier.toLowerCase();
    }
    // Переконайтеся, що файл unranked.webp існує, якщо ранг невідомий
    if (tier === 'UNRANKED' || !tier) {
        imageTier = 'unranked';
    }

    // Перевірте, що картинки знаходяться за цим шляхом і мають розширення .webp
    const imageUrl = `assets/ranks/${imageTier}.webp`;
    return `<img src="${imageUrl}" alt="${tier}" class="rank-icon"> ${tier}`;
}

// Допоміжна функція для відображення назви регіону
function getRegionDisplayName(regionCode) {
    const regionNames = {
        'euw1': 'EU West',
        'eun1': 'EU Nordic & East',
        'na1': 'North America',
        'kr': 'Korea'
        // Додайте інші регіони за потребою
    };
    return regionNames[regionCode] || regionCode.toUpperCase();
}


// --- Ініціалізація UI при завантаженні сторінки ---
document.addEventListener('DOMContentLoaded', () => {
    // Приховуємо всі секції спочатку, потім показуємо логін або дашборд
    loginSection.style.display = 'none';
    dashboardSection.style.display = 'none';
    searchSection.style.display = 'none';
    newsSection.style.display = 'none'; // Приховати секцію новин за замовчуванням

    const savedRiotId = localStorage.getItem("riotId");
    const savedRegion = localStorage.getItem("lolPlatformRegion");

    if (savedRiotId && savedRegion) {
        // Якщо є збережений Riot ID, намагаємося "увійти" або показати дашборд
        // (наприклад, викликаємо функцію, яка перевіряє сесію на бекенді)
        // Для простоти, припускаємо, що ми можемо одразу перейти на дашборд
        // і запитати актуальні дані з сервера
        dashboardRiotId.textContent = savedRiotId;
        dashboardLolRegion.textContent = savedRegion.toUpperCase();

        // Запит актуальних даних користувача з сервера після завантаження
        axios.get(`http://localhost:3000/api/user-profile/${savedRiotId}/${savedRegion}`)
            .then(response => {
                if (response.data.success) {
                    const userData = response.data.profile;
                    dashboardSummonerLevel.textContent = userData.summonerLevel;
                    dashboardSummonerRank.innerHTML = getRankDisplayHtml(userData.rank);
                    profileDescriptionInput.value = userData.profileDescription || '';
                    queueTypeSelect.value = userData.queueType || 'Будь-яка черга';
                    laneSelect.value = userData.lane || 'Будь-яка лінія';
                    switchTab('dashboardSection');
                    currentSearchRegion = savedRegion;
                    updateSearchQueueUI(currentSearchRegion);
                    socket.emit("clientConnected", { riotId: savedRiotId, region: savedRegion });
                } else {
                    console.error("Failed to load user data on startup:", response.data.error);
                    loginSection.style.display = 'block'; // Якщо дані не завантажено, повертаємось на логін
                }
            })
            .catch(error => {
                console.error("Network error loading user data on startup:", error);
                loginSection.style.display = 'block'; // Якщо помилка мережі, повертаємось на логін
            });
    } else {
        loginSection.style.display = 'block'; // Якщо немає збереженого ID, показуємо логін
    }
});