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

const searchSection = document.getElementById("searchSection");
const currentSearchRegionTitle = document.getElementById("currentSearchRegion");
const currentUserInQueueCard = document.getElementById("currentUserInQueue");
const searchQueueList = document.getElementById("searchQueueList");
const stopSearchBtn = document.getElementById("stopSearchBtn");

const playerProfileModal = document.getElementById("playerProfileModal");
const playerProfileCloseBtn = document.getElementById("playerProfileCloseBtn");
const playerProfileNickname = document.getElementById("playerProfileNickname");
const playerProfileRank = document.getElementById("playerProfileRank");
const playerProfileServer = document.getElementById("playerProfileServer");
const playerProfileQueue = document.getElementById("playerProfileQueue");
const playerProfileLane = document.getElementById("playerProfileLane");
const playerProfileDescription = document.getElementById("playerProfileDescription");
const queueTypeSelect = document.getElementById("queueTypeSelect");
const laneSelect = document.getElementById("laneSelect");

const filterRankSelect = document.getElementById("filterRank");
const filterQueueTypeSelect = document.getElementById("filterQueueType");
const filterLaneSelect = document.getElementById("filterLane");

const mainNavTabButtons = document.querySelectorAll(".tab-buttons .tab-button");
const regionTabButtons = document.querySelectorAll(".tabs .tab-button");

const newsTabBtn = document.getElementById("newsTabBtn");
const newsSection = document.getElementById("newsSection");
const newsList = document.getElementById("newsList");

const dashboardTabBtn = document.getElementById("dashboardTabBtn");
const searchTabBtn = document.getElementById("searchTabBtn");

let currentActiveRegion = "euw1";
let currentUserData = null;
let isLoggedIn = false;

const BACKEND_BASE_URL = "https://lol-prog-back.onrender.com";

const socket = io(BACKEND_BASE_URL);

socket.on("connect", () => {
    if (searchSection.style.display === "block" || searchSection.style.display === "important") {
        updateSearchQueueUI();
    }
});

socket.on("initial_queue_state", (queue) => {
    if (searchSection.style.display === "block" || searchSection.style.display === "important") {
        updateSearchQueueUI();
    }
});

socket.on("queue_updated", (updatedQueue) => {
    if (searchSection.style.display === "block" || searchSection.style.display === "important") {
        updateSearchQueueUI();
    }
});

socket.on("disconnect", () => {
});

socket.on("connect_error", (error) => {
    console.error("Frontend: Socket.IO connection error:", error);
});

function showSection(sectionId) {
    if ((sectionId === "dashboardSection" || sectionId === "searchSection" || sectionId === "playerProfileModal") && !isLoggedIn) {
        console.warn(`Attempted to access restricted section (${sectionId}) while logged out. Redirecting to login.`);
        loginSection.style.display = "block";
        loginErrorMessage.textContent = "Будь ласка, увійдіть, щоб отримати доступ до цієї секції.";
        dashboardSection.style.display = "none";
        searchSection.style.display = "none";
        playerProfileModal.style.display = "none";
        newsSection.style.display = "none";
        mainNavTabButtons.forEach(btn => btn.classList.remove("active"));
        regionTabButtons.forEach(btn => btn.classList.remove("active"));
        return;
    }

    loginSection.style.display = "none";
    dashboardSection.style.display = "none";
    searchSection.style.display = "none";
    playerProfileModal.style.display = "none";
    newsSection.style.display = "none";

    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
        targetSection.style.setProperty("display", "block", "important");
    } else {
        console.error(`Error: Section with ID "${sectionId}" not found!`);
    }
}

loginBtn.addEventListener("click", async () => {
    const riotId = riotIdInput.value.trim();
    const lolPlatformRegion = lolPlatformRegionSelect.value;
    const rememberMe = rememberMeCheckbox.checked;

    loginErrorMessage.textContent = "";

    if (!riotId) {
        loginErrorMessage.textContent = "Будь ласка, введіть ваш Riot ID.";
        isLoggedIn = false;
        if (dashboardTabBtn) dashboardTabBtn.classList.add('inactive-tab');
        if (searchTabBtn) searchTabBtn.classList.add('inactive-tab');
        return;
    }

    try {
        const response = await fetch(`${BACKEND_BASE_URL}/api/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ riotId, lolPlatformRegion, rememberMe }),
        });
        const data = await response.json();

        if (response.ok) {
            currentUserData = data;
            isLoggedIn = true;

            dashboardRiotId.textContent = data.fullRiotId;
            dashboardSummonerLevel.textContent = data.summonerLevel;
            dashboardSummonerRank.innerHTML = getRankDisplayHtml(data.rank);
            let displayRegion = data.lolRegion.toUpperCase();
            if (data.lolRegion === 'euw1') {
                displayRegion = 'EUW';
            } else if (data.lolRegion === 'eun1') {
                displayRegion = 'EUNE';
            }
            dashboardLolRegion.textContent = displayRegion;
            profileDescriptionInput.value = data.description || "";

            if (rememberMe) {
                localStorage.setItem("riotId", riotId);
                localStorage.setItem("lolPlatformRegion", lolPlatformRegion);
            } else {
                localStorage.removeItem("riotId");
                localStorage.removeItem("lolPlatformRegion");
            }

            showSection("dashboardSection");
            mainNavTabButtons.forEach(btn => btn.classList.remove("active"));
            document.getElementById("dashboardTabBtn").classList.add("active");

            currentActiveRegion = currentUserData.lolRegion;
            regionTabButtons.forEach(btn => {
                btn.classList.remove("active");
                if (btn.dataset.region === currentActiveRegion) {
                    btn.classList.add("active");
                }
            });
            currentSearchRegionTitle.textContent = `Пошук на ${document.querySelector(`.tabs .tab-button[data-region="${currentActiveRegion}"]`).textContent}`;

            if (profileInfoCard) {
                profileInfoCard.style.display = "block";
            } else {
                console.error("profileInfoCard element not found.");
            }

            if (dashboardTabBtn) dashboardTabBtn.classList.remove('inactive-tab');
            if (searchTabBtn) searchTabBtn.classList.remove('inactive-tab');

        } else {
            console.error("Login error:", data.error);
            loginErrorMessage.textContent = data.error || "Невідома помилка логіну.";
            isLoggedIn = false;
            if (dashboardTabBtn) dashboardTabBtn.classList.add('inactive-tab');
            if (searchTabBtn) searchTabBtn.classList.add('inactive-tab');
        }
    } catch (err) {
        console.error("Login network error:", err);
        loginErrorMessage.textContent = "Помилка мережі при логіні. Перевірте підключення або спробуйте пізніше.";
        isLoggedIn = false;
        if (dashboardTabBtn) dashboardTabBtn.classList.add('inactive-tab');
        if (searchTabBtn) searchTabBtn.classList.add('inactive-tab');
    }
});

saveDescriptionBtn.addEventListener("click", async () => {
    if (!currentUserData || !currentUserData.puuid) {
        descriptionErrorMessage.textContent = "Будь ласка, увійдіть, щоб зберегти опис.";
        return;
    }

    const newDescription = profileDescriptionInput.value;
    descriptionSaveMessage.textContent = "";
    descriptionErrorMessage.textContent = "";

    try {
        const response = await fetch(`${BACKEND_BASE_URL}/api/profile/description`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                puuid: currentUserData.puuid,
                description: newDescription,
            }),
        });
        const data = await response.json();

        if (response.ok) {
            currentUserData.description = newDescription;
            localStorage.setItem("profileDescription", newDescription);

            descriptionSaveMessage.textContent = "Опис успішно збережено!";
            setTimeout(() => (descriptionSaveMessage.textContent = ""), 3000);
        } else {
            descriptionErrorMessage.textContent = data.error || "Помилка при збереженні опису.";
        }
    } catch (error) {
        console.error("Error saving description:", error);
        descriptionErrorMessage.textContent = "Помилка мережі при збереженні опису.";
    }
});

async function initializeApp() {
    const storedRiotId = localStorage.getItem("riotId");
    const storedRegion = localStorage.getItem("lolPlatformRegion");

    if (dashboardTabBtn) dashboardTabBtn.classList.add('inactive-tab');
    if (searchTabBtn) searchTabBtn.classList.add('inactive-tab');

    if (storedRiotId && storedRegion) {
        riotIdInput.value = storedRiotId;
        lolPlatformRegionSelect.value = storedRegion;
        rememberMeCheckbox.checked = true;
        loginBtn.click();
    } else {
        showSection("loginSection");
        mainNavTabButtons.forEach(btn => btn.classList.remove("active"));
        regionTabButtons.forEach(btn => btn.classList.remove("active"));
    }
}

initializeApp();

startSearchBtn.addEventListener("click", async () => {
    if (!currentUserData || !currentUserData.puuid) {
        console.error("No current user data available or PUUID missing for search.");
        loginErrorMessage.textContent = "Будь ласка, увійдіть, щоб розпочати пошук.";
        showSection("loginSection");
        return;
    }

    const selectedQueueType = queueTypeSelect.value;
    const selectedLane = laneSelect.value;

    try {
        const response = await fetch(`${BACKEND_BASE_URL}/api/start-search`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                puuid: currentUserData.puuid,
                riotId: currentUserData.fullRiotId,
                lolRegion: currentUserData.lolRegion,
                rank: currentUserData.rank,
                queueType: selectedQueueType,
                lane: selectedLane,
                description: currentUserData.description,
            }),
        });
        const data = await response.json();

        if (response.ok) {
            showSection("searchSection");
            mainNavTabButtons.forEach(btn => btn.classList.remove("active"));
            document.getElementById("searchTabBtn").classList.add("active");
            updateSearchQueueUI();
        } else {
            console.error("Error starting search:", data.error);
            alert("Помилка при початку пошуку: " + (data.error || "Невідома помилка"));
        }
    } catch (err) {
        console.error("Start search network error:", err);
        alert("Помилка мережі при початку пошуку.");
    }
});

logoutBtn.addEventListener("click", async () => {
    localStorage.removeItem("riotId");
    localStorage.removeItem("lolPlatformRegion");
    localStorage.removeItem("profileDescription");
    currentUserData = null;
    isLoggedIn = false;
    riotIdInput.value = "";
    lolPlatformRegionSelect.value = "euw1";
    rememberMeCheckbox.checked = false;
    profileDescriptionInput.value = "";
    showSection("loginSection");
    mainNavTabButtons.forEach(btn => btn.classList.remove("active"));
    regionTabButtons.forEach(btn => btn.classList.remove("active"));
    if (dashboardTabBtn) dashboardTabBtn.classList.add('inactive-tab');
    if (searchTabBtn) searchTabBtn.classList.add('inactive-tab');
});

filterRankSelect.addEventListener("change", updateSearchQueueUI);
filterQueueTypeSelect.addEventListener("change", updateSearchQueueUI);
filterLaneSelect.addEventListener("change", updateSearchQueueUI);

mainNavTabButtons.forEach((button) => {
    button.addEventListener("click", () => {
        mainNavTabButtons.forEach((btn) => btn.classList.remove("active"));
        button.classList.add("active");

        let targetSectionId;
        if (button.id === "dashboardTabBtn") {
            targetSectionId = "dashboardSection";
        } else if (button.id === "searchTabBtn") {
            targetSectionId = "searchSection";
            updateSearchQueueUI();
        } else if (button.id === "newsTabBtn") {
            targetSectionId = "newsSection";
            loadNews();
        } else {
            console.error("Unknown main navigation tab button clicked:", button.id);
            return;
        }
        showSection(targetSectionId);
    });
});

regionTabButtons.forEach((button) => {
    button.addEventListener("click", () => {
        if (!isLoggedIn) {
            showSection("loginSection");
            return;
        }

        regionTabButtons.forEach((btn) => btn.classList.remove("active"));
        button.classList.add("active");

        currentActiveRegion = button.dataset.region;
        currentSearchRegionTitle.textContent = `Пошук на ${button.textContent}`;
        updateSearchQueueUI();
    });
});

stopSearchBtn.addEventListener("click", async () => {
    if (!currentUserData || !currentUserData.puuid) return;

    try {
        const response = await fetch(`${BACKEND_BASE_URL}/api/stop-search`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ puuid: currentUserData.puuid }),
        });
        const data = await response.json();

        if (response.ok) {
            showSection("dashboardSection");
            mainNavTabButtons.forEach(btn => btn.classList.remove("active"));
            document.getElementById("dashboardTabBtn").classList.add("active");
        } else {
            console.error("Error stopping search:", data.error);
            alert("Помилка при зупинці пошуку: " + (data.error || "Невідома помилка"));
        }
    } catch (err) {
        console.error("Stop search network error:", err);
        alert("Помилка мережі при зупинці пошуку.");
    }
});

async function updateSearchQueueUI() {
    if (!currentUserData || !isLoggedIn) {
        searchQueueList.innerHTML = "<p>Будь ласка, увійдіть, щоб переглянути чергу.</p>";
        currentUserInQueueCard.innerHTML = "<h3>Ви у черзі:</h3><p>Очікування...</p>";
        currentUserInQueueCard.style.display = "none";
        return;
    }

    try {
        const response = await fetch(`${BACKEND_BASE_URL}/api/queue/${currentActiveRegion}`);
        let buddiesInQueue = await response.json();

        searchQueueList.innerHTML = "";

        let userInQueueDisplayed = false;

        const currentUserInCurrentQueue = buddiesInQueue.find(
            (buddy) => buddy.puuid === currentUserData.puuid
        );

        if (currentUserInCurrentQueue) {
            const userCard = createUserCard(currentUserInCurrentQueue, true);
            currentUserInQueueCard.innerHTML = `<h3>Ви у черзі:</h3>` + userCard.outerHTML;
            currentUserInQueueCard.style.display = "block";
            userInQueueDisplayed = true;
        } else {
            currentUserInQueueCard.style.display = "none";
        }

        const selectedFilterRank = filterRankSelect.value;
        const selectedFilterQueueType = filterQueueTypeSelect.value;
        const selectedFilterLane = filterLaneSelect.value;

        const filteredBuddies = buddiesInQueue.filter((buddy) => {
            if (buddy.puuid === currentUserData.puuid) {
                return false;
            }

            if (
                selectedFilterRank !== "Будь-який ранг" &&
                !buddy.rank.startsWith(selectedFilterRank)
            ) {
                return false;
            }

            if (
                selectedFilterQueueType !== "Будь-яка черга" &&
                buddy.queueType !== selectedFilterQueueType
            ) {
                return false;
            }

            if (
                selectedFilterLane !== "Будь-яка лінія" &&
                buddy.lane !== selectedFilterLane
            ) {
                return false;
            }

            return true;
        });

        if (filteredBuddies.length === 0 && !userInQueueDisplayed) {
            searchQueueList.innerHTML = "<p>Поки що ніхто не шукає...</p>";
        } else {
            filteredBuddies.forEach((buddy) => {
                const userCard = createUserCard(buddy);
                userCard.dataset.puuid = buddy.puuid;
                searchQueueList.appendChild(userCard);
            });

            if (
                searchQueueList.children.length === 0 &&
                !userInQueueDisplayed
            ) {
                searchQueueList.innerHTML = "<p>Поки що ніхто не шукає...</p>";
            }
        }

        document
            .querySelectorAll(".user-card:not(.current-user-card)")
            .forEach((card) => {
                card.addEventListener("click", () => {
                    const puuid = card.dataset.puuid;
                    if (puuid) {
                        openPlayerProfile(puuid);
                    }
                });
            });
    } catch (error) {
        console.error("Error updating search queue UI:", error);
        searchQueueList.innerHTML = `<p class="error-message">Не вдалося завантажити список. Помилка: ${error.message}</p>`;
        currentUserInQueueCard.style.display = "none";
    }
}

function createUserCard(buddy, isCurrentUser = false) {
    const userCard = document.createElement("div");
    userCard.className = isCurrentUser
        ? "user-card current-user-card"
        : "user-card";
    userCard.id = `user-${buddy.puuid.replace(/[^a-zA-Z0-9]/g, "-")}`;

    const opggLink = getOpGgLink(buddy.riotId, buddy.lolRegion);

    userCard.innerHTML = `
        <h3>
            ${buddy.riotId}
            <a href="${opggLink}" target="_blank" rel="noopener noreferrer" class="opgg-link" title="Переглянути на OP.GG">
                <img src="./assets/icons/opgg.png" alt="OP.GG" style="width: 25px; height: 25px; vertical-align: middle; margin-left: 5px;">
            </a>
        </h3>
        <span class="user-details rank-info-container"> ${getRankDisplayHtml(buddy.rank)}</span>
        <p class="user-details">Черга: ${buddy.queueType || "N/A"}</p>
        <p class="user-details">Позиція: ${buddy.lane || "N/A"}</p>
        <p class="user-description-preview">${
            buddy.description
                ? buddy.description.substring(0, 50) +
                    (buddy.description.length > 50 ? "..." : "")
                : "Без опису"
        }</p>
    `;
    return userCard;
}

function getOpGgLink(riotId, lolRegion) {
    const parts = riotId.split('#');
    let nickname = parts[0];
    let tagline = parts[1];

    if (!tagline) {
        tagline = '';
    }

    let opggRegion;
    switch (lolRegion) {
        case 'euw1':
            opggRegion = 'euw';
            break;
        case 'eun1':
            opggRegion = 'eune';
            break;
        default:
            opggRegion = lolRegion;
    }

    const encodedNickname = encodeURIComponent(nickname);
    const encodedTagline = encodeURIComponent(tagline);

    return `https://op.gg/lol/summoners/${opggRegion}/${encodedNickname}-${encodedTagline}`;
}

function getRankDisplayHtml(rankString) {
    let tier = 'UNRANKED';
    let division = '';
    let lp = '';

    if (rankString.toUpperCase().includes('UNRANKED')) {
        tier = 'UNRANKED';
    } else {
        const lpMatch = rankString.match(/\((\d+)\s*LP\)/i);
        if (lpMatch && lpMatch[1]) {
            lp = `${lpMatch[1]} LP`;
            rankString = rankString.replace(/\((\d+)\s*LP\)/i, '').trim();
        }

        const rankParts = rankString.split(' ').filter(part => part);

        if (rankParts.length > 0) {
            tier = rankParts[0].toUpperCase();

            if (rankParts.length > 1 && ['I', 'II', 'III', 'IV'].includes(rankParts[1].toUpperCase())) {
                division = rankParts[1].toUpperCase();
            }
            if (['MASTER', 'GRANDMASTER', 'CHALLENGER'].includes(tier)) {
                division = '';
            }
        }
    }

    let imageTier = tier.toLowerCase();
    if (imageTier.includes('/')) {
        imageTier = imageTier.split('/')[0];
    }
    if (imageTier === 'grandmaster') imageTier = 'master';
    if (imageTier === 'challenger') imageTier = 'master';

    const imageUrl = `./assets/ranks/${imageTier}.webp`;

    let rankText = tier;
    if (division) {
        rankText += ` ${division}`;
    }

    return `
        <div class="rank-display">
            <img src="${imageUrl}" alt="${tier} Rank" class="rank-image">
            <div class="rank-details">
                <span class="rank-tier">${rankText}</span>
                ${lp ? `<span class="rank-lp">${lp}</span>` : ''}
            </div>
        </div>
    `;
}

playerProfileCloseBtn.addEventListener("click", () => {
    playerProfileModal.style.display = "none";
    showSection("searchSection");
    mainNavTabButtons.forEach(btn => btn.classList.remove("active"));
    document.getElementById("searchTabBtn").classList.add("active");
});

window.addEventListener("click", (event) => {
    if (event.target === playerProfileModal) {
        playerProfileModal.style.display = "none";
        showSection("searchSection");
        mainNavTabButtons.forEach(btn => btn.classList.remove("active"));
        document.getElementById("searchTabBtn").classList.add("active");
    }
});

async function openPlayerProfile(puuid) {
    if (!isLoggedIn) {
        showSection("loginSection");
        return;
    }

    try {
        const response = await fetch(`${BACKEND_BASE_URL}/api/user/${puuid}`);
        const userData = await response.json();

        if (response.ok) {
            const opggLink = getOpGgLink(userData.fullRiotId, userData.lolRegion);

            if (playerProfileNickname) {
                playerProfileNickname.innerHTML = `
                    ${userData.fullRiotId}
                    <a href="${opggLink}" target="_blank" rel="noopener noreferrer" class="opgg-link" title="Переглянути на OP.GG">
                        <img src="./assets/icons/opgg.png" alt="OP.GG" style="width: 35px; height: 35px; vertical-align: middle; margin-left: 5px;">
                    </a>
                `;
            }

            if (playerProfileRank) playerProfileRank.innerHTML = getRankDisplayHtml(userData.rank);

            if (playerProfileServer) {
                let displayRegion = userData.lolRegion.toUpperCase();
                if (userData.lolRegion === 'euw1') {
                    displayRegion = 'EUW';
                } else if (userData.lolRegion === 'eun1') {
                    displayRegion = 'EUNE';
                }
                playerProfileServer.textContent = displayRegion;
            }

            if (playerProfileQueue) playerProfileQueue.textContent =
                userData.currentQueueType || "Не вказано";
            if (playerProfileLane) playerProfileLane.textContent =
                userData.currentLane || "Не вказано";

            if (playerProfileDescription) playerProfileDescription.textContent =
                userData.description || "Опис відсутній.";

            if (playerProfileModal) {
                showSection("playerProfileModal");
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

async function loadNews() {
    newsList.innerHTML = "<p>Завантаження новин...</p>";

    try {
        const response = await fetch(`${BACKEND_BASE_URL}/api/news`);
        const data = await response.json();

        if (response.ok) {
            newsList.innerHTML = "";

            if (data.length === 0) {
                newsList.innerHTML = "<p>Наразі немає новин.</p>";
                return;
            }

            data.sort((a, b) => new Date(b.date) - new Date(a.date));

            data.forEach(post => {
                const newsItem = document.createElement("div");
                newsItem.className = "news-item";
                let imageHtml = '';
                if (post.imageUrl) {
                    imageHtml = `<img src="${post.imageUrl}" alt="${post.title}" style="width: 100%; max-height: 200px; object-fit: cover; margin-bottom: 10px; border-radius: 6px;">`;
                }
                newsItem.innerHTML = `
                        <h3>${post.title}</h3>
                        <p class="news-date">${new Date(post.date).toLocaleDateString('uk-UA', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                        <p>${post.content}</p>
                        ${imageHtml}
                    `;
                newsList.appendChild(newsItem);
            });
        } else {
            newsList.innerHTML = `<p class="error-message">Не вдалося завантажити новини: ${data.error || 'Невідома помилка'}</p>`;
            console.error("Server error response:", data);
        }
    } catch (error) {
        console.error("Error loading news:", error);
        newsList.innerHTML = `<p class="error-message">Помилка мережі при завантаженні новин або некоректна відповідь від сервера.</p>`;
    }
}