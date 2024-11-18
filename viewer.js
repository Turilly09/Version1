let scene, camera, renderer, controls;

function init(containerId) {
    // Contenedor
    const container = document.getElementById(containerId);
    const width = container.clientWidth;
    const height = container.clientHeight;

    // Escena
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf0f0f0);

    // Cámara Ortográfica
    const frustumSize = 10;
    const aspect = width / height;
    camera = new THREE.OrthographicCamera(
        frustumSize * aspect / -2,
        frustumSize * aspect / 2,
        frustumSize / 2,
        frustumSize / -2,
        1,
        1000
    );
    camera.position.set(5, 5, 5);
    camera.zoom = 1;
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
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 20, 10);
    scene.add(directionalLight);

    // Añadir rejillas de referencia
    addReferenceGrids();

    // Manejo de redimensionamiento
    window.addEventListener('resize', onWindowResize, false);

    // Observer para el contenedor
    const resizeObserver = new ResizeObserver(() => {
        onWindowResize();
    });
    resizeObserver.observe(container);

    // Hacer globales las variables necesarias
    window.scene = scene;
    window.camera = camera;
    window.renderer = renderer;
    window.controls = controls;

    // Crear selector y cargar modelo inicial
    setTimeout(() => {
        createModelSelector();
        loadModel('pieza1');
    }, 100);

    animate();
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

function loadModel(modelId) {
    if (!MODELS[modelId]) {
        console.error('Modelo no encontrado:', modelId);
        return;
    }

    // Eliminar modelos anteriores
    scene.children.forEach(child => {
        if (!child.isGrid && !(child instanceof THREE.Light)) {
            scene.remove(child);
        }
    });

    // Crear y añadir el nuevo modelo
    const model = MODELS[modelId].createGeometry();
    scene.add(model);

    // Resetear cámara
    camera.position.set(20, 10, 10);
    camera.lookAt(0, 0, 0);
    controls.reset();
}

function animate() {
    requestAnimationFrame(animate);
    controls.update();
    updateMaterials();
    renderer.render(scene, camera);
}

function updateMaterials() {
    scene.traverse((object) => {
        if (object.material && object.material.onBeforeCompile) {
            object.material.needsUpdate = true;
            if (object.material.userData.shader) {
                object.material.userData.shader.uniforms.cameraPosition.value.copy(camera.position);
            }
        }
    });
}

function onWindowResize() {
    const container = renderer.domElement.parentElement;
    const width = container.clientWidth;
    const height = container.clientHeight;
    const aspect = width / height;
    const frustumSize = 10;
    
    camera.left = -frustumSize * aspect / 2;
    camera.right = frustumSize * aspect / 2;
    camera.top = frustumSize / 2;
    camera.bottom = -frustumSize / 2;
    
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
}