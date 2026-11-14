// --- AUDIO & MUSIC TOGGLE ---
const musicBtn = document.getElementById('music-toggle');
const bgMusic = document.getElementById('bg-music');
let isMusicPlaying = false;

musicBtn.addEventListener('click', () => {
    if (isMusicPlaying) {
        bgMusic.pause();
        musicBtn.classList.remove('playing');
    } else {
        bgMusic.play().catch(e => console.log("Audio autoplay restricted"));
        musicBtn.classList.add('playing');
    }
    isMusicPlaying = !isMusicPlaying;
});

// --- STAGE NAVIGATION ---
const btnStart = document.getElementById('btn-start');
const stageIntro = document.getElementById('stage-intro');
const stageGift = document.getElementById('stage-gift');
const stageMain = document.getElementById('stage-main');
const btnContinueJourney = document.getElementById('btn-continue-journey');
const btnFinalSurprise = document.getElementById('btn-final-surprise');
const stageSecret = document.getElementById('stage-secret');

btnStart.addEventListener('click', () => {
    stageIntro.classList.add('hidden');
    stageGift.classList.remove('hidden');
    musicBtn.classList.remove('hidden');
    bgMusic.play().then(() => {
        isMusicPlaying = true;
        musicBtn.classList.add('playing');
    }).catch(e => console.log("Audio play blocked"));
    initGiftScene();
});

btnContinueJourney.addEventListener('click', () => {
    stageGift.classList.add('hidden');
    stageMain.classList.remove('hidden');
    initEnvelopeScene();
    setupScrollReveal();
});

btnFinalSurprise.addEventListener('click', () => {
    stageMain.classList.add('hidden');
    stageSecret.classList.remove('hidden');
});

// --- FLOATING HEARTS BACKGROUND ---
function createFloatingHeart() {
    const ambientBg = document.getElementById('ambient-bg');
    if (!ambientBg) return;
    const heart = document.createElement('div');
    heart.classList.add('floating-heart');
    heart.innerHTML = '❤️';
    heart.style.left = Math.random() * 100 + 'vw';
    heart.style.fontSize = (Math.random() * 12 + 10) + 'px';
    const duration = Math.random() * 6 + 6;
    heart.style.animationDuration = duration + 's';
    ambientBg.appendChild(heart);
    setTimeout(() => heart.remove(), duration * 1000);
}
setInterval(createFloatingHeart, 800);

// --- 3D GIFT BOX SCENE (Three.js) ---
let giftOpened = false;
function initGiftScene() {
    const container = document.getElementById('gift-canvas-container');
    if (!container || container.hasChildNodes()) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 1000);
    camera.position.set(0, 3, 6);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.2);
    directionalLight.position.set(5, 10, 7);
    scene.add(directionalLight);

    const giftGroup = new THREE.Group();
    scene.add(giftGroup);

    // Box base
    const boxGeo = new THREE.BoxGeometry(2, 1.6, 2);
    const boxMat = new THREE.MeshStandardMaterial({ color: 0xff8fab, roughness: 0.3 });
    const box = new THREE.Mesh(boxGeo, boxMat);
    box.position.y = 0.8;
    giftGroup.add(box);

    // Ribbons
    const ribbonMat = new THREE.MeshStandardMaterial({ color: 0xe63956, roughness: 0.2 });
    const ribV = new THREE.Mesh(new THREE.BoxGeometry(2.05, 1.62, 0.4), ribbonMat);
    ribV.position.y = 0.8;
    giftGroup.add(ribV);
    const ribH = new THREE.Mesh(new THREE.BoxGeometry(0.4, 1.62, 2.05), ribbonMat);
    ribH.position.y = 0.8;
    giftGroup.add(ribH);

    // Lid Group
    const lidGroup = new THREE.Group();
    lidGroup.position.set(0, 1.6, -1);
    giftGroup.add(lidGroup);

    const lidBoxGroup = new THREE.Group();
    lidBoxGroup.position.set(0, 0, 1);
    lidGroup.add(lidBoxGroup);

    const lidMesh = new THREE.Mesh(new THREE.BoxGeometry(2.1, 0.3, 2.1), boxMat);
    lidMesh.position.y = 0.15;
    lidBoxGroup.add(lidMesh);

    const ribLid = new THREE.Mesh(new THREE.BoxGeometry(2.15, 0.32, 0.45), ribbonMat);
    ribLid.position.y = 0.15;
    lidBoxGroup.add(ribLid);

    // Inside Items (Hacipupu, Matcha, Chocolate)
    const insideGroup = new THREE.Group();
    insideGroup.position.y = 0.8;
    insideGroup.scale.set(0, 0, 0);
    giftGroup.add(insideGroup);

    const dollHead = new THREE.Mesh(new THREE.SphereGeometry(0.3, 16, 16), new THREE.MeshStandardMaterial({ color: 0xffb3c6 }));
    dollHead.position.set(-0.5, 0.4, 0);
    insideGroup.add(dollHead);
    const dollBody = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.25, 0.5, 16), new THREE.MeshStandardMaterial({ color: 0xff477e }));
    dollBody.position.set(-0.5, -0.1, 0);
    insideGroup.add(dollBody);

    const cup = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.14, 0.5, 16), new THREE.MeshStandardMaterial({ color: 0xa8dadc }));
    cup.position.set(0.5, 0.1, 0);
    insideGroup.add(cup);
    const matchaLiquid = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.17, 0.1, 16), new THREE.MeshStandardMaterial({ color: 0x52b788 }));
    matchaLiquid.position.set(0.5, 0.3, 0);
    insideGroup.add(matchaLiquid);

    const choco = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.1, 0.6), new THREE.MeshStandardMaterial({ color: 0x582f0e }));
    choco.position.set(0, -0.2, 0);
    insideGroup.add(choco);

    let isDragging = false;
    let prevMousePos = { x: 0, y: 0 };

    container.addEventListener('pointerdown', (e) => {
        isDragging = true;
        prevMousePos = { x: e.clientX, y: e.clientY };
    });

    window.addEventListener('pointermove', (e) => {
        if (!isDragging) return;
        giftGroup.rotation.y += (e.clientX - prevMousePos.x) * 0.008;
        giftGroup.rotation.x += (e.clientY - prevMousePos.y) * 0.008;
        prevMousePos = { x: e.clientX, y: e.clientY };
    });

    window.addEventListener('pointerup', () => { isDragging = false; });

    container.addEventListener('click', () => {
        if (giftOpened) return;
        giftOpened = true;

        let progress = 0;
        function openAnim() {
            progress += 0.04;
            if (progress <= 1) {
                lidGroup.rotation.x = -Math.PI * 0.6 * progress;
                insideGroup.scale.set(progress, progress, progress);
                insideGroup.position.y = 0.8 + (0.4 * progress);
                requestAnimationFrame(openAnim);
            } else {
                if (typeof confetti === 'function') {
                    confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
                }
                btnContinueJourney.classList.remove('hidden');
            }
        }
        openAnim();
    });

    function animate() {
        requestAnimationFrame(animate);
        if (!isDragging && !giftOpened) {
            giftGroup.rotation.y += 0.005;
        }
        renderer.render(scene, camera);
    }
    animate();
}

// --- 3D ENVELOPE SCENE ---
let envelopeOpened = false;
function initEnvelopeScene() {
    const container = document.getElementById('envelope-canvas-container');
    if (!container || container.hasChildNodes()) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 1000);
    camera.position.set(0, 0, 5);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(renderer.domElement);

    scene.add(new THREE.AmbientLight(0xffffff, 1));

    const envGroup = new THREE.Group();
    scene.add(envGroup);

    const envMesh = new THREE.Mesh(
        new THREE.BoxGeometry(2.4, 1.6, 0.1),
        new THREE.MeshStandardMaterial({ color: 0xffccd5, roughness: 0.4 })
    );
    envGroup.add(envMesh);

    const flapGroup = new THREE.Group();
    flapGroup.position.set(0, 0.8, 0.05);
    envGroup.add(flapGroup);

    const flapGeo = new THREE.ConeGeometry(1.7, 0.9, 4);
    flapGeo.rotateY(Math.PI / 4);
    flapGeo.scale(1, 0.3, 1);
    const flapMesh = new THREE.Mesh(flapGeo, new THREE.MeshStandardMaterial({ color: 0xffb3c6 }));
    flapMesh.position.set(0, 0.45, 0);
    flapGroup.add(flapMesh);

    let isDraggingEnv = false;
    let prevPos = { x: 0, y: 0 };
    container.addEventListener('pointerdown', (e) => {
        isDraggingEnv = true;
        prevPos = { x: e.clientX, y: e.clientY };
    });
    window.addEventListener('pointermove', (e) => {
        if (!isDraggingEnv) return;
        envGroup.rotation.y += (e.clientX - prevPos.x) * 0.008;
        prevPos = { x: e.clientX, y: e.clientY };
    });
    window.addEventListener('pointerup', () => { isDraggingEnv = false; });

    container.addEventListener('click', () => {
        if (envelopeOpened) return;
        envelopeOpened = true;

        let p = 0;
        function openEnv() {
            p += 0.05;
            if (p <= 1) {
                flapGroup.rotation.x = Math.PI * p;
                requestAnimationFrame(openEnv);
            } else {
                document.getElementById('letter-paper').classList.remove('hidden');
                document.getElementById('letter-paper').scrollIntoView({ behavior: 'smooth' });
            }
        }
        openEnv();
    });

    function animateEnv() {
        requestAnimationFrame(animateEnv);
        if (!isDraggingEnv && !envelopeOpened) {
            envGroup.rotation.y += 0.004;
        }
        renderer.render(scene, camera);
    }
    animateEnv();
}

// --- SCROLL REVEAL ---
function setupScrollReveal() {
    const reveals = document.querySelectorAll('.reveal');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, { threshold: 0.15 });

    reveals.forEach(el => observer.observe(el));
}

// --- PASSWORD UNLOCK ---
const btnUnlock = document.getElementById('btn-unlock');
const passwordInput = document.getElementById('password-input');
const passwordError = document.getElementById('password-error');
const secretUnlocked = document.getElementById('secret-unlocked');

btnUnlock.addEventListener('click', () => {
    const val = passwordInput.value.trim().toLowerCase();
    if (val === '26112026' || val === 'medina' || val === 'rollade') {
        passwordError.classList.add('hidden');
        secretUnlocked.classList.remove('hidden');
        if (typeof confetti === 'function') {
            confetti({ particleCount: 150, spread: 100, origin: { y: 0.6 } });
        }
    } else {
        passwordError.classList.remove('hidden');
    }
});