// Colores según orientación
const FACE_COLORS = {
    FRONT: 0x4287f5,  // Azul
    TOP: 0x42f554,    // Verde
    SIDE: 0xf54242    // Rojo
};

function createOrientedMesh(geometryOrGroup) {
    // Si es un grupo, combinar sus geometrías manualmente
    let mergedGeometry = new THREE.BufferGeometry();
    
    if (geometryOrGroup instanceof THREE.Group) {
        geometryOrGroup.updateMatrixWorld(true); // Actualizar matrices
        
        // Recolectar todas las geometrías del grupo
        geometryOrGroup.traverse((child) => {
            if (child instanceof THREE.Mesh) {
                const geom = child.geometry.clone();
                geom.applyMatrix4(child.matrixWorld);
                if (mergedGeometry.attributes.position === undefined) {
                    mergedGeometry = geom;
                } else {
                    // Combinar atributos manualmente
                    const positions = [...Array.from(mergedGeometry.attributes.position.array), 
                                     ...Array.from(geom.attributes.position.array)];
                    mergedGeometry.setAttribute('position', 
                        new THREE.Float32BufferAttribute(positions, 3));
                }
            }
        });
    } else {
        mergedGeometry = geometryOrGroup;
    }
    
    const materials = [
        new THREE.MeshPhongMaterial({ color: FACE_COLORS.FRONT, flatShading: true }),
        new THREE.MeshPhongMaterial({ color: FACE_COLORS.FRONT, flatShading: true }),
        new THREE.MeshPhongMaterial({ color: FACE_COLORS.TOP, flatShading: true }),
        new THREE.MeshPhongMaterial({ color: FACE_COLORS.TOP, flatShading: true }),
        new THREE.MeshPhongMaterial({ color: FACE_COLORS.SIDE, flatShading: true }),
        new THREE.MeshPhongMaterial({ color: FACE_COLORS.SIDE, flatShading: true })
    ];
    
    const mesh = new THREE.Mesh(mergedGeometry, materials);
    const edges = new THREE.EdgesGeometry(mergedGeometry);
    const edgesMesh = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({ color: 0x000000 }));
    
    const resultGroup = new THREE.Group();
    resultGroup.add(mesh);
    resultGroup.add(edgesMesh);
    
    return resultGroup;
}

const MODELS = {
    principiante: {
        title: "Principiante",
        models: {
            cuboBasico: {
                name: "Cubo Simple",
                createGeometry: function() {
                    const geometry = new THREE.BoxGeometry(2, 2, 2);
                    return createOrientedMesh(geometry);
                }
            },
            prismaRectangular: {
                name: "Prisma Rectangular",
                createGeometry: function() {
                    const geometry = new THREE.BoxGeometry(3, 2, 1.5);
                    return createOrientedMesh(geometry);
                }
            },
            escalonSimple: {
                name: "Escalón Simple",
                createGeometry: function() {
                    const group = new THREE.Group();
                    
                    const baseGeometry = new THREE.BoxGeometry(3, 1, 2);
                    const base = createOrientedMesh(baseGeometry);
                    base.position.set(0, -0.5, 0);
                    
                    const superiorGeometry = new THREE.BoxGeometry(1.5, 1, 2);
                    const superior = createOrientedMesh(superiorGeometry);
                    superior.position.set(0.75, 0.5, 0);
                    
                    group.add(base);
                    group.add(superior);
                    return group;
                }
            },
            elementoL: {
                name: "Elemento en L",
                createGeometry: function() {
                    const group = new THREE.Group();
                    
                    const baseGeometry = new THREE.BoxGeometry(2, 1, 2);
                    const base = createOrientedMesh(baseGeometry);
                    base.position.set(0, -0.5, 0);
                    
                    const verticalGeometry = new THREE.BoxGeometry(1, 2, 2);
                    const vertical = createOrientedMesh(verticalGeometry);
                    vertical.position.set(-0.5, 0.5, 0);
                    
                    group.add(base);
                    group.add(vertical);
                    return group;
                }
            },
            baseConSaliente: {
                name: "Base con Saliente",
                createGeometry: function() {
                    const group = new THREE.Group();
                    
                    const baseGeometry = new THREE.BoxGeometry(3, 1, 2);
                    const base = createOrientedMesh(baseGeometry);
                    base.position.set(0, -0.5, 0);
                    
                    const saliente = createOrientedMesh(new THREE.BoxGeometry(1, 1, 1));
                    saliente.position.set(0, 0.5, 0.5);
                    
                    group.add(base);
                    group.add(saliente);
                    return group;
                }
            },
            elementoT: {
                name: "Elemento en T",
                createGeometry: function() {
                    const group = new THREE.Group();
                    
                    const baseGeometry = new THREE.BoxGeometry(3, 1, 2);
                    const base = createOrientedMesh(baseGeometry);
                    base.position.set(0, -0.5, 0);
                    
                    const superiorGeometry = new THREE.BoxGeometry(1, 1, 2);
                    const superior = createOrientedMesh(superiorGeometry);
                    superior.position.set(0, 0.5, 0);
                    
                    group.add(base);
                    group.add(superior);
                    return group;
                }
            },
            escaleraDoble: {
                name: "Escalera Doble",
                createGeometry: function() {
                    const group = new THREE.Group();
                    
                    const baseGeometry = new THREE.BoxGeometry(4, 1, 2);
                    const base = createOrientedMesh(baseGeometry);
                    base.position.set(0, -0.5, 0);
                    
                    const medio1 = createOrientedMesh(new THREE.BoxGeometry(1, 1, 2));
                    medio1.position.set(-1, 0.5, 0);
                    
                    const medio2 = createOrientedMesh(new THREE.BoxGeometry(1, 1, 2));
                    medio2.position.set(1, 0.5, 0);
                    
                    group.add(base);
                    group.add(medio1);
                    group.add(medio2);
                    return group;
                }
            },
            cuboHueco: {
                name: "Cubo con Hueco",
                createGeometry: function() {
                    const group = new THREE.Group();
                    
                    // Base
                    const base = createOrientedMesh(new THREE.BoxGeometry(3, 1, 3));
                    base.position.set(0, -1, 0);
                    
                    // Paredes
                    const pared1 = createOrientedMesh(new THREE.BoxGeometry(3, 1, 1));
                    pared1.position.set(0, 0, -1);
                    
                    const pared2 = createOrientedMesh(new THREE.BoxGeometry(3, 1, 1));
                    pared2.position.set(0, 0, 1);
                    
                    const pared3 = createOrientedMesh(new THREE.BoxGeometry(1, 1, 3));
                    pared3.position.set(-1, 0, 0);
                    
                    const pared4 = createOrientedMesh(new THREE.BoxGeometry(1, 1, 3));
                    pared4.position.set(1, 0, 0);
                    
                    group.add(base);
                    group.add(pared1);
                    group.add(pared2);
                    group.add(pared3);
                    group.add(pared4);
                    return group;
                }
            },
            elementoCruz: {
                name: "Cruz Simple",
                createGeometry: function() {
                    const group = new THREE.Group();
                    
                    const horizontal = createOrientedMesh(new THREE.BoxGeometry(3, 1, 1));
                    horizontal.position.set(0, 0, 0);
                    
                    const vertical = createOrientedMesh(new THREE.BoxGeometry(1, 1, 3));
                    vertical.position.set(0, 0, 0);
                    
                    group.add(horizontal);
                    group.add(vertical);
                    return group;
                }
            },
            baseEscalonada: {
                name: "Base Escalonada",
                createGeometry: function() {
                    const group = new THREE.Group();
                    
                    const base = createOrientedMesh(new THREE.BoxGeometry(3, 1, 3));
                    base.position.set(0, -1, 0);
                    
                    const medio = createOrientedMesh(new THREE.BoxGeometry(2, 1, 2));
                    medio.position.set(0, 0, 0);
                    
                    const superior = createOrientedMesh(new THREE.BoxGeometry(1, 1, 1));
                    superior.position.set(0, 1, 0);
                    
                    group.add(base);
                    group.add(medio);
                    group.add(superior);
                    return group;
                }
            }
        }
    },
    intermedio: {
        title: "Intermedio",
        models: {
            pieza1: {
                name: "Escalera",
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
            }
        }
    },
    avanzado: {
        title: "Avanzado",
        models: {
            pieza3: {
                name: "T invertida",
                createGeometry: function() {
                    const group = new THREE.Group();
        
                    // Base horizontal (4x1x2)
                    const baseGeometry = new THREE.BoxGeometry(3, 1, 3);
                    const base = createOrientedMesh(baseGeometry);
                    base.position.set(0.5, -2.5, 0.5);
                    group.add(base);
        
                    // Parte vertical (1x3x2)
                    const verticalGeometry = new THREE.BoxGeometry(1, 3, 2);
                    const vertical = createOrientedMesh(verticalGeometry);
                    vertical.position.set(0, -0.5, 0);
                    group.add(vertical);
        
                    return group;
                }
            }
        }
    }
};

// Asegurarnos de que MODELS está disponible globalmente
window.MODELS = MODELS;