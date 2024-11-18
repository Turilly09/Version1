// Añadir al principio de models.js
const FACE_COLORS = {
    FRONT: 0x4287f5,  // Azul
    TOP: 0x42f554,    // Verde
    SIDE: 0xf54242    // Rojo
};

function createOrientedMesh(geometry) {
    const materials = [
        new THREE.MeshPhongMaterial({ color: FACE_COLORS.FRONT, flatShading: true }), // frente
        new THREE.MeshPhongMaterial({ color: FACE_COLORS.FRONT, flatShading: true }), // atrás
        new THREE.MeshPhongMaterial({ color: FACE_COLORS.TOP, flatShading: true }),   // arriba
        new THREE.MeshPhongMaterial({ color: FACE_COLORS.TOP, flatShading: true }),   // abajo
        new THREE.MeshPhongMaterial({ color: FACE_COLORS.SIDE, flatShading: true }),  // derecha
        new THREE.MeshPhongMaterial({ color: FACE_COLORS.SIDE, flatShading: true })   // izquierda
    ];
    return new THREE.Mesh(geometry, materials);
}

const MODELS = {
    pieza1: {
        name: "Pieza 1 - Escalera",
        createGeometry: function() {
            const group = new THREE.Group();

            // Base (3x1x2)
            const baseGeometry = new THREE.BoxGeometry(6, 1, 4);
            const base = createOrientedMesh(baseGeometry);
            base.position.set(0, -2.5, 0);
            group.add(base);

            // Nivel medio (2x1x2)
            const medioGeometry = new THREE.BoxGeometry(2, 1, 2);
            const medio = createOrientedMesh(medioGeometry);
            medio.position.set(-0.5, -1.5, 0);
            group.add(medio);

            // Nivel superior (1x1x2)
            const superiorGeometry = new THREE.BoxGeometry(1, 1, 2);
            const superior = createOrientedMesh(superiorGeometry);
            superior.position.set(-1, -0.5, 0);
            group.add(superior);

            return group;
        }
    },

    pieza2: {
        name: "Pieza 2 - L con extensión",
        createGeometry: function() {
            const material = new THREE.MeshPhongMaterial({
                color: 0x2194ce,
                flatShading: true
            });

            const group = new THREE.Group();

            // Base horizontal (3x1x2)
            const base = new THREE.Mesh(
                new THREE.BoxGeometry(3, 1, 2),
                material
            );
            base.position.set(0, 0.5, 0);
            group.add(base);

            // Parte vertical (1x2x2)
            const vertical = new THREE.Mesh(
                new THREE.BoxGeometry(1, 2, 2),
                material
            );
            vertical.position.set(-1, 2, 0);
            group.add(vertical);

            return group;
        }
    },

    pieza3: {
        name: "Pieza 3 - U con extensión",
        createGeometry: function() {
            const material = new THREE.MeshPhongMaterial({
                color: 0x2194ce,
                flatShading: true
            });

            const group = new THREE.Group();

            // Base (3x1x3)
            const base = new THREE.Mesh(
                new THREE.BoxGeometry(3, 1, 3),
                material
            );
            base.position.set(0, 0.5, 0);
            group.add(base);

            // Vertical izquierda (1x2x1)
            const verticalIzq = new THREE.Mesh(
                new THREE.BoxGeometry(1, 2, 1),
                material
            );
            verticalIzq.position.set(-1, 2, 1);
            group.add(verticalIzq);

            // Vertical derecha (1x2x1)
            const verticalDer = new THREE.Mesh(
                new THREE.BoxGeometry(1, 2, 1),
                material
            );
            verticalDer.position.set(1, 2, 1);
            group.add(verticalDer);

            // Extensión superior (1x1x1)
            const extension = new THREE.Mesh(
                new THREE.BoxGeometry(1, 1, 1),
                material
            );
            extension.position.set(0, 2.5, 0);
            group.add(extension);

            return group;
        }
    },

    pieza4: {
        name: "Pieza 4 - Cubo con extensiones",
        createGeometry: function() {
            const material = new THREE.MeshPhongMaterial({
                color: 0x2194ce,
                flatShading: true
            });

            const group = new THREE.Group();

            // Cubo central (1x1x1)
            const centro = new THREE.Mesh(
                new THREE.BoxGeometry(1, 1, 1),
                material
            );
            centro.position.set(0, 0.5, 0);
            group.add(centro);

            // Extensión frontal
            const front = new THREE.Mesh(
                new THREE.BoxGeometry(1, 1, 1),
                material
            );
            front.position.set(0, 0.5, 1);
            group.add(front);

            // Extensión derecha
            const right = new THREE.Mesh(
                new THREE.BoxGeometry(1, 1, 1),
                material
            );
            right.position.set(1, 0.5, 0);
            group.add(right);

            // Extensión superior
            const top = new THREE.Mesh(
                new THREE.BoxGeometry(1, 1, 1),
                material
            );
            top.position.set(0, 1.5, 0);
            group.add(top);

            return group;
        }
    },

    pieza5: {
        name: "Pieza 5 - Pirámide escalonada",
        createGeometry: function() {
            const material = new THREE.MeshPhongMaterial({
                color: 0x2194ce,
                flatShading: true
            });

            const group = new THREE.Group();

            // Base (3x1x3)
            const base = new THREE.Mesh(
                new THREE.BoxGeometry(3, 1, 3),
                material
            );
            base.position.set(0, 0.5, 0);
            group.add(base);

            // Nivel medio (2x1x2)
            const medio = new THREE.Mesh(
                new THREE.BoxGeometry(2, 1, 2),
                material
            );
            medio.position.set(0, 1.5, 0);
            group.add(medio);

            // Nivel superior (1x1x1)
            const top = new THREE.Mesh(
                new THREE.BoxGeometry(1, 1, 1),
                material
            );
            top.position.set(0, 2.5, 0);
            group.add(top);

            return group;
        }
    },

    pieza6: {
        name: "Pieza 6 - L con bloque",
        createGeometry: function() {
            const material = new THREE.MeshPhongMaterial({
                color: 0x2194ce,
                flatShading: true
            });

            const group = new THREE.Group();

            // Base vertical (1x3x2)
            const vertical = new THREE.Mesh(
                new THREE.BoxGeometry(1, 3, 2),
                material
            );
            vertical.position.set(0, 1.5, 0);
            group.add(vertical);

            // Extensión horizontal (2x2x2)
            const horizontal = new THREE.Mesh(
                new THREE.BoxGeometry(2, 2, 2),
                material
            );
            horizontal.position.set(1.5, 1, 0);
            group.add(horizontal);

            return group;
        }
    }
};

function createModelSelector() {
    const selectorDiv = document.createElement('div');
    selectorDiv.style.cssText = `
        position: absolute;
        top: 10px;
        left: 10px;
        z-index: 100;
        background: white;
        padding: 8px;
        border-radius: 4px;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        display: flex;
        align-items: center;
        gap: 8px;
    `;

    const label = document.createElement('label');
    label.textContent = 'Modelo:';
    label.style.cssText = `
        font-family: Arial, sans-serif;
        font-size: 14px;
        color: #666;
    `;
    selectorDiv.appendChild(label);

    const select = document.createElement('select');
    select.style.cssText = `
        padding: 6px;
        border: 1px solid #ccc;
        border-radius: 4px;
        font-size: 14px;
        cursor: pointer;
    `;
    
    Object.entries(MODELS).forEach(([id, model]) => {
        const option = document.createElement('option');
        option.value = id;
        option.textContent = model.name;
        select.appendChild(option);
    });

    select.addEventListener('change', (e) => {
        loadModel(e.target.value);
    });

    selectorDiv.appendChild(select);
    document.getElementById('viewer-container').appendChild(selectorDiv);

    // Cargar el primer modelo por defecto
    loadModel(Object.keys(MODELS)[0]);
}