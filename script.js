/* =========================================================
   TARA BIRTHDAY WEBSITE
   MUSIC SYSTEM
========================================================= */

const audioA = document.getElementById("audioA");
const audioB = document.getElementById("audioB");

const musicToggle = document.getElementById("musicToggle");
const revealButton = document.getElementById("revealButton");
const finalMessage = document.getElementById("finalMessage");


/* =========================================================
   SONGS
========================================================= */

const tracks = {

    her: {
        file: "audio/her.mp3",
        volume: 0.28
    },

    aboutYou: {
        file: "audio/about-you.mp3",
        volume: 0.26
    },

    pretty: {
        file: "audio/pretty.mp3",
        volume: 0.27
    },

    vizhiMozhi: {
        file: "audio/vizhi-mozhi.mp3",
        volume: 0.25
    }

};


/* =========================================================
   CHAPTER MUSIC
========================================================= */

const chapterMusic = {

    story: {
        track: tracks.her,
        volume: 0.28
    },

    memories: {
        track: tracks.aboutYou,
        volume: 0.26
    },

    tara: {
        track: tracks.pretty,
        volume: 0.27
    },

    letter: {
        track: tracks.vizhiMozhi,
        volume: 0.25
    },

    cinematic: {
        track: tracks.vizhiMozhi,
        volume: 0.30
    },

    final: {
        track: tracks.her,
        volume: 0.30
    }

};


/* =========================================================
   AUDIO STATE
========================================================= */

let activeAudio = audioA;

let inactiveAudio = audioB;

let musicStarted = false;

let musicMuted = false;

let currentTrack = "";

let currentChapter = "";

let switching = false;


/* =========================================================
   GET CURRENT CHAPTER
========================================================= */

function getCurrentChapter() {

    const sections = [
        document.getElementById("story"),
        document.getElementById("memories"),
        document.getElementById("tara"),
        document.getElementById("letter"),
        document.getElementById("cinematic"),
        document.getElementById("final")
    ];

    const viewportCenter =
        window.scrollY +
        window.innerHeight / 2;

    let closestSection = null;

    let closestDistance = Infinity;

    sections.forEach(section => {

        if (!section) return;

        const center =
            section.offsetTop +
            section.offsetHeight / 2;

        const distance =
            Math.abs(viewportCenter - center);

        if (distance < closestDistance) {

            closestDistance = distance;

            closestSection = section;
        }

    });

    return closestSection
        ? closestSection.id
        : "story";
}

const chapterWashes = [
    document.getElementById("chapterColorWashA"),
    document.getElementById("chapterColorWashB")
];

const chapterPalettes = {
    hero: "radial-gradient(ellipse at 18% 22%, rgba(255,105,185,.34), transparent 48%), radial-gradient(ellipse at 82% 28%, rgba(116,91,255,.34), transparent 50%), radial-gradient(ellipse at 52% 88%, rgba(255,193,102,.22), transparent 48%)",
    story: "radial-gradient(ellipse at 20% 30%, rgba(255,91,150,.34), transparent 48%), radial-gradient(ellipse at 83% 24%, rgba(174,91,230,.32), transparent 50%), radial-gradient(ellipse at 56% 85%, rgba(255,178,103,.23), transparent 48%)",
    memories: "radial-gradient(ellipse at 17% 25%, rgba(69,144,235,.36), transparent 48%), radial-gradient(ellipse at 84% 28%, rgba(126,88,231,.34), transparent 50%), radial-gradient(ellipse at 50% 86%, rgba(67,209,190,.22), transparent 48%)",
    tara: "radial-gradient(ellipse at 18% 25%, rgba(255,119,183,.36), transparent 48%), radial-gradient(ellipse at 82% 30%, rgba(137,106,255,.34), transparent 50%), radial-gradient(ellipse at 50% 88%, rgba(255,206,128,.23), transparent 48%)",
    letter: "radial-gradient(ellipse at 16% 28%, rgba(255,141,191,.32), transparent 48%), radial-gradient(ellipse at 83% 23%, rgba(112,142,255,.34), transparent 50%), radial-gradient(ellipse at 54% 88%, rgba(196,129,255,.25), transparent 48%)",
    cinematic: "radial-gradient(ellipse at 18% 23%, rgba(75,151,255,.36), transparent 48%), radial-gradient(ellipse at 84% 28%, rgba(155,92,255,.35), transparent 50%), radial-gradient(ellipse at 52% 88%, rgba(255,137,107,.23), transparent 48%)",
    final: "radial-gradient(ellipse at 16% 24%, rgba(255,94,153,.36), transparent 48%), radial-gradient(ellipse at 82% 27%, rgba(255,194,91,.29), transparent 50%), radial-gradient(ellipse at 53% 88%, rgba(147,101,255,.29), transparent 48%)"
};

const fullSpectrumGlow = "radial-gradient(ellipse at 10% 76%, rgba(54,122,255,.34), transparent 43%), radial-gradient(ellipse at 90% 76%, rgba(255,57,66,.31), transparent 43%), radial-gradient(ellipse at 50% 12%, rgba(255,224,76,.3), transparent 44%), radial-gradient(ellipse at 50% 52%, rgba(67,222,190,.12), transparent 52%)";

let visibleChapterWash = null;
let visibleBackgroundChapter = "";

function updateChapterBackground() {
    const sections = document.querySelectorAll("#hero, .chapter");
    const viewportCenter = window.innerHeight / 2;
    let nearestSection = null;
    let nearestDistance = Infinity;

    sections.forEach(section => {
        const rect = section.getBoundingClientRect();
        const sectionCenter = rect.top + rect.height / 2;
        const distance = Math.abs(viewportCenter - sectionCenter);

        if (distance < nearestDistance) {
            nearestDistance = distance;
            nearestSection = section;
        }
    });

    const chapter = nearestSection?.id || "hero";
    if (chapter === visibleBackgroundChapter) return;

    const nextWash = visibleChapterWash === chapterWashes[0]
        ? chapterWashes[1]
        : chapterWashes[0];

    nextWash.style.background = `${chapterPalettes[chapter] || chapterPalettes.hero}, ${fullSpectrumGlow}`;
    nextWash.classList.add("is-active");
    if (visibleChapterWash) visibleChapterWash.classList.remove("is-active");

    visibleChapterWash = nextWash;
    visibleBackgroundChapter = chapter;
}


/* =========================================================
   PLAY MUSIC
========================================================= */

function startMusic(track, volume) {

    if (!track) return;

    activeAudio.src = track.file;

    activeAudio.volume =
        musicMuted ? 0 : volume;

    activeAudio.loop = true;

    activeAudio.play()
        .catch(error => {

            console.log(
                "Audio could not start:",
                error
            );

        });

    currentTrack = track.file;

    musicStarted = true;
}


/* =========================================================
   CROSSFADE MUSIC
========================================================= */

function switchMusic(track, volume) {

    if (!track) return;

    if (track.file === currentTrack) {
        return;
    }

    if (switching) {
        return;
    }

    switching = true;

    inactiveAudio.src = track.file;

    inactiveAudio.loop = true;

    inactiveAudio.volume = 0;

    inactiveAudio.play()
        .then(() => {

            const duration = 2200;

            const steps = 40;

            const interval =
                duration / steps;

            let step = 0;

            const oldVolume =
                activeAudio.volume;

            const newVolume =
                musicMuted
                    ? 0
                    : volume;

            const fade = setInterval(() => {

                step++;

                const progress =
                    step / steps;

                activeAudio.volume =
                    oldVolume *
                    (1 - progress);

                inactiveAudio.volume =
                    newVolume *
                    progress;

                if (step >= steps) {

                    clearInterval(fade);

                    activeAudio.pause();

                    activeAudio.currentTime = 0;

                    const temp = activeAudio;

                    activeAudio = inactiveAudio;

                    inactiveAudio = temp;

                    currentTrack =
                        track.file;

                    switching = false;
                }

            }, interval);

        })
        .catch(() => {

            switching = false;

        });
}


/* =========================================================
   CHANGE MUSIC BASED ON CHAPTER
========================================================= */

function updateMusic() {

    if (!musicStarted) {
        return;
    }

    const chapter =
        getCurrentChapter();

    if (chapter === currentChapter) {
        return;
    }

    currentChapter = chapter;

    const music =
        chapterMusic[chapter];

    if (!music) {
        return;
    }

    switchMusic(
        music.track,
        music.volume
    );
}


/* Birthday question: Yes continues; No reveals the birthday message first. */
const birthdayYes = document.getElementById("birthdayYes");
const birthdayNo = document.getElementById("birthdayNo");
const birthdayGateResponse = document.getElementById("birthdayGateResponse");
const scrollIndicator = document.getElementById("scrollIndicator");

function continueFromBirthdayQuestion() {
    document.body.classList.remove("page-locked");
    scrollIndicator.classList.remove("is-visible");
    scrollIndicator.setAttribute("aria-hidden", "true");
    currentChapter = "story";
    startMusic(tracks.her, tracks.her.volume);

    const storyPage = document.getElementById("story");
    const startY = window.scrollY;
    const targetY = storyPage.getBoundingClientRect().top + startY;
    const startTime = performance.now();
    const duration = 2200;

    function moveToStory(now) {
        const progress = Math.min((now - startTime) / duration, 1);
        const eased = progress < 0.5
            ? 4 * progress * progress * progress
            : 1 - Math.pow(-2 * progress + 2, 3) / 2;

        window.scrollTo(0, startY + (targetY - startY) * eased);

        if (progress < 1) {
            requestAnimationFrame(moveToStory);
        }
    }

    requestAnimationFrame(moveToStory);
}

birthdayYes.addEventListener("click", () => {
    birthdayYes.disabled = true;
    birthdayNo.disabled = true;
    continueFromBirthdayQuestion();
});

birthdayNo.addEventListener("click", () => {
    birthdayYes.disabled = true;
    birthdayNo.disabled = true;
    birthdayGateResponse.textContent =
        "Illa, innaiku thaan un birthday! Happy Birthday, My Dear Sahana ❤️";
    birthdayGateResponse.classList.add("is-message");
    scrollIndicator.classList.add("is-visible");
    scrollIndicator.setAttribute("aria-hidden", "false");
    window.setTimeout(continueFromBirthdayQuestion, 2600);
});


/* =========================================================
   SCROLL MUSIC DETECTION
========================================================= */

let scrollTimeout;

window.addEventListener(
    "scroll",
    () => {

        clearTimeout(scrollTimeout);

        scrollTimeout =
            setTimeout(
                () => {
                    updateMusic();
                    updateChapterBackground();
                },
                100
            );

    }
);


/* =========================================================
   MUSIC BUTTON
========================================================= */

musicToggle.addEventListener(
    "click",
    () => {

        musicMuted = !musicMuted;

        if (musicMuted) {

            activeAudio.volume = 0;

            inactiveAudio.volume = 0;

            musicToggle.innerHTML = "🔇";

        } else {

            const chapter =
                chapterMusic[currentChapter];

            const volume =
                chapter
                    ? chapter.volume
                    : 0.28;

            activeAudio.volume =
                volume;

            musicToggle.innerHTML = "♪";
        }

    }
);


/* =========================================================
   FINAL SURPRISE
========================================================= */

revealButton.addEventListener(
    "click",
    () => {

        finalMessage.classList.add("show");

        revealButton.style.display =
            "none";

        createFinalSparkles();

    }
);


/* =========================================================
   FINAL SPARKLES
========================================================= */

function createFinalSparkles() {

    for (let i = 0; i < 35; i++) {

        const sparkle =
            document.createElement("span");

        sparkle.style.position =
            "fixed";

        sparkle.style.left =
            Math.random() * 100 + "%";

        sparkle.style.top =
            Math.random() * 100 + "%";

        sparkle.style.width =
            "4px";

        sparkle.style.height =
            "4px";

        sparkle.style.borderRadius =
            "50%";

        sparkle.style.background =
            "#ffd7ec";

        sparkle.style.boxShadow =
            "0 0 12px #ffd7ec";

        sparkle.style.pointerEvents =
            "none";

        sparkle.style.zIndex =
            "50";

        document.body.appendChild(
            sparkle
        );

        sparkle.animate(
            [
                {
                    opacity: 0,
                    transform:
                        "translateY(30px) scale(0)"
                },
                {
                    opacity: 1,
                    transform:
                        "translateY(0) scale(1)"
                },
                {
                    opacity: 0,
                    transform:
                        "translateY(-80px) scale(0)"
                }
            ],
            {
                duration:
                    2500 +
                    Math.random() * 2000,

                delay:
                    Math.random() * 1000,

                easing:
                    "ease-out"
            }
        );

        setTimeout(() => {

            sparkle.remove();

        }, 5000);

    }

}


/* =========================================================
   LILY PARALLAX
========================================================= */

const flowers =
    document.querySelectorAll(".lily");


window.addEventListener(
    "scroll",
    () => {

        const scrollY =
            window.scrollY;

        flowers.forEach(
            (flower, index) => {

                const speed =
                    0.008 +
                    index * 0.002;

                flower.style.marginTop =
                    `${scrollY * speed}px`;

            }
        );

    }
);


/* =========================================================
   INITIAL STATE
========================================================= */

window.addEventListener(
    "load",
    () => {

        window.scrollTo(0, 0);

        currentChapter = "";
        updateChapterBackground();

    }
);

/* ================= MEMORY MODAL ================= */

const memoryModal = document.getElementById("memoryModal");
const memoryClose = document.getElementById("memoryClose");

const modalMemoryImage =
    document.getElementById("modalMemoryImage");

const modalMemoryVideo =
    document.getElementById("modalMemoryVideo");

const memoryPhotoCollage =
    document.getElementById("memoryPhotoCollage");

const memoryModalMedia =
    document.querySelector(".memory-modal-image");

const modalMemoryNumber =
    document.getElementById("modalMemoryNumber");

const modalMemoryTitle =
    document.getElementById("modalMemoryTitle");

const modalMemoryDescription =
    document.getElementById("modalMemoryDescription");

/* Edit your personal memory words here. */
const memories = {
    1: {
        number: "01",
        title: "Oru Chinna Arambam",
        image: "photos/photo1.jpg",
        photos: [
            "photos/memory-01/1000058894-02.jpg",
            "photos/memory-01/1000058897-01.jpg",
            "photos/memory-01/1000058901-01.jpg",
            "photos/memory-01/1000058926-01.jpg"
        ],
        description: "Hiii Tara, namma connection enga aramichithunu ennaku theriyathu ana un pona piranthanaal la irunthu ippo vara neraiya chinna chinna thodakangal irunthrukku, antha chinna arambangal ellam ini periya alavula pandrom. intha pirantha naal kulla vantha progress ah vida innum mass ah pandrom namma."
    },
    2: {
        number: "02",
        title: "En Azhagu Sundari",
        image: "photos/photo4.jpg",
        collageLayout: "all-portrait",
        photos: [
            "photos/memory-02/IMG_6888.jpg",
            "photos/memory-02/IMG_6890_1.jpg",
            "photos/memory-02/IMG_6891.jpg",
            "photos/memory-02/IMG_6892.jpg"
        ],
        description: "Ivalo azhaga yaaru iruppa en devathaiya thavira cute penneh nee eppavume azhagu than, Un sirippukku naan adimaipa. Evalo smart and intelligent theriyuma nee. i would listen whatever you say whatever you say makes sense ivalo mass laan yaarume illa."
    },
    3: {
        number: "03",
        title: "Cute Devathai",
        image: "photos/photo5.jpg",
        collageLayout: "portrait-side-columns",
        photos: [
            "photos/memory-03/1000039730~2.jpg",
            "photos/memory-03/1000039815.jpg",
            "photos/memory-03/1000039860.jpg",
            "photos/memory-03/1000039891~2.jpg",
            "photos/memory-03/1000039942.jpg"
        ],
        description: "Anaikku ungala intha costume la paathu naan flatunga. avalo azhagu, en kannala naan pakuratha neeyum pakanum ennaku avalo asai hehe. you really deserve whatever good in this world and naan unnaku ellame tharuven kandipa."
    },
    4: {
        number: "04",
        title: "Un Kanavugal Ninaivagum",
        image: "photos/photo6.jpg",
        thumbnail: "photos/memory6-thumbnail.png",
        video: "videos/memory6.mp4",
        description: "Namma kandipa un dream ennalam irukko ellame pandrom seriya. Naan romba sathoshama irunthen you did this to do something unnaku pudichatha athu vara nee unnakunu ethuvum panna maari ennaku feel anathu illa. But this it's just you know sema. and after that in a team where you really need to be nu kekum bothu superah irunthuchu. Iniyum ipadiye we go do things and enjoy intha birthday ku nee semaiya enjoy pannanum after every day we be happy. Unnaku eppavum arts than firstuh naan nextuh than solliten"
    },
    5: {
        number: "05",
        title: "Miss Narthagiye",
        image: "photos/photo7.jpg",
        thumbnail: "photos/memory7-thumbnail.png",
        video: "videos/memory7.mp4",
        description: "Un cute expressions laan paathu jollyah irunthen, i wish to bring it all out un mogam vaadave koodathu jollyah irukanum. I promise your 20s is gonna be the best one in your life."
    }
};

function openMemoryModal(card) {
    const memory = memories[card.dataset.memory];
    if (!memory) return;

    modalMemoryVideo.pause();
    modalMemoryVideo.removeAttribute("src");
    modalMemoryVideo.load();
    memoryPhotoCollage.replaceChildren();
    memoryPhotoCollage.classList.remove(
        "memory-photo-collage--all-portrait",
        "memory-photo-collage--portrait-side-columns"
    );

    if (memory.photos && memory.photos.length > 1) {
        memoryModalMedia.hidden = true;
        modalMemoryImage.hidden = true;
        modalMemoryVideo.hidden = true;
        memoryPhotoCollage.hidden = false;
        if (memory.collageLayout) {
            memoryPhotoCollage.classList.add(
                `memory-photo-collage--${memory.collageLayout}`
            );
        }

        let sideColumns = null;
        if (memory.collageLayout === "portrait-side-columns") {
            const leftColumn = document.createElement("div");
            leftColumn.className = "memory-photo-column memory-photo-column--left";

            const rightColumn = document.createElement("div");
            rightColumn.className = "memory-photo-column memory-photo-column--right";

            memoryPhotoCollage.append(leftColumn, rightColumn);
            sideColumns = [leftColumn, rightColumn];
        }

        memory.photos.forEach((photo, index) => {
            const frame = document.createElement("figure");
            frame.className = "memory-photo-item";

            const image = document.createElement("img");
            image.src = photo;
            image.alt = `${memory.title}, photo ${index + 1}`;

            frame.appendChild(image);
            if (sideColumns) {
                const column = index === 1 || index === memory.photos.length - 1
                    ? sideColumns[1]
                    : sideColumns[0];
                column.appendChild(frame);
            } else {
                memoryPhotoCollage.appendChild(frame);
            }
        });
    } else {
        memoryModalMedia.hidden = false;
        memoryPhotoCollage.hidden = true;

        if (memory.video) {
            modalMemoryImage.hidden = true;
            modalMemoryVideo.hidden = false;
            modalMemoryVideo.src = memory.video;
            modalMemoryVideo.poster = memory.thumbnail || memory.image;
            modalMemoryVideo.load();
        } else {
            modalMemoryVideo.hidden = true;
            modalMemoryImage.hidden = false;
            modalMemoryImage.src = memory.image;
        }
    }

    modalMemoryImage.alt = card.querySelector("img").alt;
    modalMemoryNumber.textContent = memory.number;
    modalMemoryTitle.textContent = memory.title;
    modalMemoryDescription.textContent = memory.description;
    memoryModal.classList.add("active");
    memoryModal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    memoryClose.focus();
}

document.querySelectorAll(".memory-card").forEach(card => {
    card.addEventListener("click", () => openMemoryModal(card));
    card.addEventListener("keydown", event => {
        if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            openMemoryModal(card);
        }
    });
});

function closeMemoryModal() {
    modalMemoryVideo.pause();
    modalMemoryVideo.currentTime = 0;
    memoryModal.classList.remove("active");
    memoryModal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
}

memoryClose.addEventListener("click", closeMemoryModal);

memoryModal.addEventListener("click", event => {
    if (event.target.classList.contains("memory-modal-backdrop")) {
        closeMemoryModal();
    }
});

document.addEventListener("keydown", event => {
    if (event.key === "Escape" && memoryModal.classList.contains("active")) {
        closeMemoryModal();
    }
});

