// --- Loading Simulation ---
let loadProgress = 0;
const progressEl = document.getElementById('progress');
const startBtn = document.getElementById('start-btn');
const loader = document.getElementById('loader');
const uiOverlay = document.getElementById('ui-overlay');

const interval = setInterval(() => {
    loadProgress += Math.floor(Math.random() * 15) + 1;
    if (loadProgress >= 100) {
        loadProgress = 100;
        clearInterval(interval);
        progressEl.innerText = loadProgress;
        
        // Show start button
        document.querySelector('.spinner').style.display = 'none';
        document.querySelector('.loader-content p').style.display = 'none';
        startBtn.style.display = 'block';
        
        gsap.fromTo(startBtn, {opacity: 0, scale: 0.8}, {opacity: 1, scale: 1, duration: 0.5});
    } else {
        progressEl.innerText = loadProgress;
    }
}, 80);

// --- Three.js Setup (GTA Vice City / Synthwave Theme) ---
const canvas = document.getElementById('webgl-canvas');
const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x1A052E, 0.03); // deep purple fog

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 2, 10);

const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    alpha: true,
    antialias: true
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// --- Retrowave Floor Grid ---
const gridGeometry = new THREE.PlaneGeometry(200, 200, 40, 40);
// Displace vertices to make "mountains" on the sides
const pos = gridGeometry.attributes.position;
for(let i=0; i<pos.count; i++) {
    const x = pos.getX(i);
    const y = pos.getY(i);
    if(Math.abs(x) > 10) {
        pos.setZ(i, Math.random() * (Math.abs(x) * 0.2));
    }
}
gridGeometry.computeVertexNormals();

const gridMaterial = new THREE.MeshBasicMaterial({
    color: 0x00F3FF, // Neon cyan
    wireframe: true,
    transparent: true,
    opacity: 0.4
});

const gridMesh = new THREE.Mesh(gridGeometry, gridMaterial);
gridMesh.rotation.x = -Math.PI / 2;
gridMesh.position.y = -3;
scene.add(gridMesh);

// --- Synthwave Sun ---
const sunGeometry = new THREE.CircleGeometry(20, 64);
const sunMaterial = new THREE.MeshBasicMaterial({
    color: 0xFF007F, // Neon Pink
    transparent: true,
    opacity: 0.8
});
const sun = new THREE.Mesh(sunGeometry, sunMaterial);
sun.position.set(0, 5, -80);
scene.add(sun);

// --- Floating Geometric "Palm Trees" / Diamonds ---
const geometries = [];
const materialWire = new THREE.MeshBasicMaterial({ 
    color: 0xFFAA00, // Sunset orange
    wireframe: true,
    transparent: true,
    opacity: 0.8
});

for(let i=0; i<20; i++) {
    const geom = new THREE.OctahedronGeometry(Math.random() * 1.5 + 0.5, 0);
    const mesh = new THREE.Mesh(geom, materialWire);
    
    mesh.position.x = (Math.random() - 0.5) * 80;
    mesh.position.y = Math.random() * 10 + 2;
    mesh.position.z = (Math.random() - 0.5) * 60 - 20;
    
    // Custom properties
    mesh.userData = {
        rotSpeedX: (Math.random() - 0.5) * 0.05,
        rotSpeedY: (Math.random() - 0.5) * 0.05,
        floatSpeed: Math.random() * 0.02 + 0.01,
        baseY: mesh.position.y,
        timeOff: Math.random() * 100
    };
    
    geometries.push(mesh);
    scene.add(mesh);
}

// --- Interaction & Animation ---
let mouseX = 0;
let mouseY = 0;
let mouseTargetX = 0;
let mouseTargetY = 0;
let baseCameraX = 0;
let baseCameraZ = 10;
const windowHalfX = window.innerWidth / 2;
const windowHalfY = window.innerHeight / 2;

document.addEventListener('mousemove', (event) => {
    mouseX = (event.clientX - windowHalfX);
    mouseY = (event.clientY - windowHalfY);
});

// Scroll handling for camera movement
let scrollY = 0;
uiOverlay.addEventListener('scroll', () => {
    scrollY = uiOverlay.scrollTop;
    
    const panels = document.querySelectorAll('.glass');
    panels.forEach(panel => {
        const rect = panel.getBoundingClientRect();
        if(rect.top < window.innerHeight * 0.85) {
            panel.classList.add('visible');
        }
    });
});

const clock = new THREE.Clock();

let isWanted = false;
let policeFlashTime = 0;
let wantedLevel = 0;
const wantedStars = document.querySelectorAll('#wanted-stars i');
const wantedBtn = document.getElementById('wanted-btn');

if(wantedBtn) {
    wantedBtn.addEventListener('click', () => {
        if(wantedLevel < 5) {
            wantedStars[wantedLevel].classList.add('active');
            wantedLevel++;
            isWanted = true;
        }
    });
}

function animate() {
    requestAnimationFrame(animate);
    const elapsedTime = clock.getElapsedTime();

    // Police flashing effect if wanted
    if(isWanted) {
        policeFlashTime += 0.1;
        if(Math.sin(policeFlashTime) > 0) {
            scene.fog.color.setHex(0xff0000); // Red
        } else {
            scene.fog.color.setHex(0x0000ff); // Blue
        }
    } else {
        scene.fog.color.setHex(0x1A052E); // Default
    }

    mouseTargetX = mouseX * 0.005;
    mouseTargetY = mouseY * 0.005;

    // Move grid towards camera to simulate driving
    gridMesh.position.z += 0.2;
    if (gridMesh.position.z > 5) {
        gridMesh.position.z = 0;
    }

    // Animate floating geometries
    geometries.forEach(mesh => {
        mesh.rotation.x += mesh.userData.rotSpeedX;
        mesh.rotation.y += mesh.userData.rotSpeedY;
        mesh.position.y = mesh.userData.baseY + Math.sin(elapsedTime * mesh.userData.floatSpeed * 50 + mesh.userData.timeOff);
    });

    // Move camera based on map target, scroll, & mouse parallax
    let desiredY = 2 - scrollY * 0.01;
    camera.position.x += ((baseCameraX + mouseTargetX) - camera.position.x) * 0.05;
    camera.position.y += (-mouseTargetY + desiredY - camera.position.y) * 0.05;
    camera.position.z += (baseCameraZ - camera.position.z) * 0.05;

    renderer.render(scene, camera);
}

// --- GPS Map Navigation ---
const mapLinks = document.querySelectorAll('.map-locations li');
mapLinks.forEach(link => {
    link.addEventListener('click', () => {
        // Smooth scroll UI
        const targetSelector = link.getAttribute('data-target');
        const targetEl = document.querySelector(targetSelector);
        if(targetEl) {
            uiOverlay.scrollTo({
                top: targetEl.offsetTop,
                behavior: 'smooth'
            });
        }
        
        // Update 3D Camera Target
        baseCameraX = parseFloat(link.getAttribute('data-cam-x'));
        baseCameraZ = parseFloat(link.getAttribute('data-cam-z'));
    });
});

// Handle Resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// --- Start Experience ---
startBtn.addEventListener('click', () => {
    loader.style.opacity = '0';
    setTimeout(() => {
        loader.style.display = 'none';
        uiOverlay.style.opacity = '1';
        uiOverlay.style.pointerEvents = 'auto';
        
        const heroPanel = document.querySelector('#hero .glass');
        if(heroPanel) heroPanel.classList.add('visible');
        
        animate();
    }, 1000);
});
