// materials.js

// Configuración de colores por orientación
const FACE_MATERIALS = {
    COLORS: {
        FRONT: 0x4287f5,  // Azul para caras frontales
        TOP: 0x42f554,    // Verde para caras superiores
        SIDE: 0xf54242    // Rojo para caras laterales
    },
    PROPERTIES: {
        shininess: 30,
        flatShading: true,
        transparent: false,
        opacity: 1
    }
};

// Crear materiales base
function createOrientedMaterials() {
    return {
        front: new THREE.MeshPhongMaterial({
            ...FACE_MATERIALS.PROPERTIES,
            color: FACE_MATERIALS.COLORS.FRONT
        }),
        back: new THREE.MeshPhongMaterial({
            ...FACE_MATERIALS.PROPERTIES,
            color: FACE_MATERIALS.COLORS.FRONT
        }),
        top: new THREE.MeshPhongMaterial({
            ...FACE_MATERIALS.PROPERTIES,
            color: FACE_MATERIALS.COLORS.TOP
        }),
        bottom: new THREE.MeshPhongMaterial({
            ...FACE_MATERIALS.PROPERTIES,
            color: FACE_MATERIALS.COLORS.TOP
        }),
        right: new THREE.MeshPhongMaterial({
            ...FACE_MATERIALS.PROPERTIES,
            color: FACE_MATERIALS.COLORS.SIDE
        }),
        left: new THREE.MeshPhongMaterial({
            ...FACE_MATERIALS.PROPERTIES,
            color: FACE_MATERIALS.COLORS.SIDE
        })
    };
}

// Función para crear una malla con materiales orientados
function createOrientedMesh(geometry) {
    const materials = Object.values(createOrientedMaterials());
    return new THREE.Mesh(geometry, materials);
}

// Función para actualizar una geometría existente a materiales orientados
function updateToOrientedMaterials(mesh) {
    const materials = Object.values(createOrientedMaterials());
    mesh.material = materials;
    mesh.material.needsUpdate = true;
    return mesh;
}

// Función para crear una pieza completa con materiales orientados
function createOrientedPiece(createGeometryFunc) {
    const group = new THREE.Group();
    
    // Obtener la geometría base
    const baseGeometry = createGeometryFunc();
    
    // Si la geometría es un grupo, procesar cada hijo
    if (baseGeometry instanceof THREE.Group) {
        baseGeometry.children.forEach(child => {
            if (child instanceof THREE.Mesh) {
                const orientedMesh = createOrientedMesh(child.geometry);
                orientedMesh.position.copy(child.position);
                orientedMesh.rotation.copy(child.rotation);
                orientedMesh.scale.copy(child.scale);
                group.add(orientedMesh);
            }
        });
    } else if (baseGeometry instanceof THREE.Mesh) {
        const orientedMesh = createOrientedMesh(baseGeometry.geometry);
        group.add(orientedMesh);
    }
    
    return group;
}

// Exportar funciones y configuraciones
export {
    FACE_MATERIALS,
    createOrientedMaterials,
    createOrientedMesh,
    updateToOrientedMaterials,
    createOrientedPiece
};