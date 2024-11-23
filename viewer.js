// Variables globales de Three.js
let scene, camera, renderer, controls;

// Función de animación principal
function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}

// Función de cambio de vista
function setView(position) {
    camera.position.set(...position);
    camera.lookAt(0, 0, 0);
    camera.updateProjectionMatrix();
    controls.update();
}

// Función principal de inicialización
function init(containerId) {
    // Crear el contenedor principal con layout
    const mainContainer = document.createElement('div');
    mainContainer.style.cssText = `
        display: flex;
        flex-direction: column;
        gap: 10px;
        padding: 10px;
        background-color: #f5f5f5;
        border: 1px solid #ccc;
        height: 100%;
    `;

    // Crear la barra de herramientas superior
    const toolbarContainer = document.createElement('div');
    toolbarContainer.style.cssText = `
        display: flex;
        gap: 10px;
        padding: 10px;
        background: white;
        border: 1px solid #ccc;
        border-radius: 4px;
        align-items: center;
        justify-content: space-between;
    `;

    // Contenedor del visor 3D
    const viewerContainer = document.createElement('div');
    viewerContainer.style.cssText = `
        flex: 1;
        position: relative;
        background: white;
        border: 1px solid #ccc;
        border-radius: 4px;
        overflow: hidden;
        min-height: 500px;
    `;

    // Nuevo contenedor para los selectores de dificultad
    const difficultyContainer = document.createElement('div');
    difficultyContainer.style.cssText = `
        display: flex;
        flex-direction: column;
        gap: 10px;
        padding: 10px;
        background: white;
        border: 1px solid #ccc;
        border-radius: 4px;
    `;

    // Mover los elementos existentes
    const container = document.getElementById(containerId);
    container.style.height = '100%';
    container.innerHTML = '';
    container.appendChild(mainContainer);
    
    mainContainer.appendChild(toolbarContainer);
    mainContainer.appendChild(viewerContainer);
    mainContainer.appendChild(difficultyContainer);

    // Inicializar Three.js con el nuevo contenedor
    initThreeJS(viewerContainer);

    // Crear los controles en la barra de herramientas
    createViewerControls(toolbarContainer);

    // Crear los selectores de dificultad en el nuevo contenedor
    createModelSelector(difficultyContainer);

    // Agregar el panel de ayuda al contenedor principal
    createHelpPanel(mainContainer);
}

function initThreeJS(container) {
    const width = container.clientWidth;
    const height = container.clientHeight;

    // Escena
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf0f0f0);

    // Cámara Ortográfica
    const frustumSize = 10;
    const aspect = width / height;

    camera = new THREE.OrthographicCamera(
        -frustumSize * aspect / 2,
        frustumSize * aspect / 2,
        frustumSize / 2,
        -frustumSize / 2,
        0.1,
        1000
    );
    camera.position.set(5, 5, 5);
    camera.zoom = 0.8;
    camera.updateProjectionMatrix();

    // Renderer
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(renderer.domElement);

    // Controles
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.screenSpacePanning = false;
    controls.minZoom = 0.5;
    controls.maxZoom = 4;

    // Luces
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 20, 10);
    scene.add(directionalLight);

    // Añadir rejillas de referencia
    addReferenceGrids();

    // Iniciar animación
    animate();

    // Configurar el observer de redimensionamiento
    const resizeObserver = new ResizeObserver(() => {
        const newWidth = container.clientWidth;
        const newHeight = container.clientHeight;
        const newAspect = newWidth / newHeight;
        
        camera.left = -frustumSize * newAspect / 2;
        camera.right = frustumSize * newAspect / 2;
        camera.top = frustumSize / 2;
        camera.bottom = -frustumSize / 2;
        
        camera.updateProjectionMatrix();
        renderer.setSize(newWidth, newHeight);
    });
    
    resizeObserver.observe(container);
}

function addReferenceGrids() {
    const size = 6;
    const divisions = 6;
    
    const gridMaterial = new THREE.LineBasicMaterial({
        color: 0xaaaaaa,
        transparent: true,
        opacity: 0.3
    });

    function createGrid() {
        const grid = new THREE.Group();
        grid.isGrid = true;

        const step = size / divisions;

        for (let i = 0; i <= divisions; i++) {
            const lineGeometry1 = new THREE.BufferGeometry();
            const lineGeometry2 = new THREE.BufferGeometry();

            const pos = (i * step) - (size / 2);

            const hPoints = new Float32Array([
                -size/2, pos, 0,
                size/2, pos, 0
            ]);

            const vPoints = new Float32Array([
                pos, -size/2, 0,
                pos, size/2, 0
            ]);

            lineGeometry1.setAttribute('position', new THREE.BufferAttribute(hPoints, 3));
            lineGeometry2.setAttribute('position', new THREE.BufferAttribute(vPoints, 3));

            const hLine = new THREE.Line(lineGeometry1, gridMaterial);
            const vLine = new THREE.Line(lineGeometry2, gridMaterial);

            grid.add(hLine);
            grid.add(vLine);
        }

        return grid;
    }

    // Alzado (frente)
    const frontGrid = createGrid();
    frontGrid.position.z = -size/2;
    scene.add(frontGrid);

    // Planta (arriba)
    const topGrid = createGrid();
    topGrid.rotation.x = -Math.PI/2;
    topGrid.position.y = -size/2;
    scene.add(topGrid);

    // Perfil (lateral)
    const sideGrid = createGrid();
    sideGrid.rotation.y = Math.PI/2;
    sideGrid.position.x = -size/2;
    scene.add(sideGrid);

    function createLabel(text, position) {
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.width = 128;
        canvas.height = 32;

        context.fillStyle = '#ffffff';
        context.fillRect(0, 0, canvas.width, canvas.height);
        context.font = 'bold 20px Arial';
        context.fillStyle = '#000000';
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.fillText(text, canvas.width/2, canvas.height/2);

        const texture = new THREE.CanvasTexture(canvas);
        const spriteMaterial = new THREE.SpriteMaterial({ map: texture });
        const sprite = new THREE.Sprite(spriteMaterial);
        
        sprite.position.copy(position);
        sprite.scale.set(2, 0.5, 1);
        sprite.isGrid = true;
        
        scene.add(sprite);
    }

    createLabel('Alzado', new THREE.Vector3(0, size/2 + 1, -size/2));
    createLabel('Planta', new THREE.Vector3(0, -size/2 - 1, 0));
    createLabel('Perfil', new THREE.Vector3(-size/2, size/2 + 1, 0));
}

// Función de carga de modelos
function loadModel(difficulty, modelId) {
    if (!MODELS[difficulty] || !MODELS[difficulty].models[modelId]) {
        console.error('Modelo no encontrado:', difficulty, modelId);
        return;
    }

    // Eliminar modelos anteriores
    scene.children.forEach(child => {
        if (!child.isGrid && !(child instanceof THREE.Light)) {
            scene.remove(child);
        }
    });

    // Crear y añadir el nuevo modelo
    const model = MODELS[difficulty].models[modelId].createGeometry();
    scene.add(model);

    // Resetear cámara
    camera.position.set(20, 10, 10);
    camera.lookAt(0, 0, 0);
    controls.reset();
}

// Función auxiliar para crear botones de acción
function createActionButton(label, onClick) {
    const button = document.createElement('button');
    button.textContent = label;
    button.style.cssText = `
        padding: 8px;
        background: #f0f0f0;
        border: 1px solid #ccc;
        border-radius: 4px;
        cursor: pointer;
        font-size: 12px;
        flex: 1;
        transition: all 0.2s;
    `;
    
    button.addEventListener('mouseover', () => {
        button.style.background = '#e0e0e0';
    });
    
    button.addEventListener('mouseout', () => {
        button.style.background = '#f0f0f0';
    });
    
    button.addEventListener('click', onClick);
    
    return button;
}

function highlightActiveButton(container, activeButton) {
    container.querySelectorAll('button').forEach(button => {
        button.style.background = button === activeButton ? '#d0d0d0' : '#f0f0f0';
    });
}