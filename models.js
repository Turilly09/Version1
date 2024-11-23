const BufferGeometryUtils = {
    mergeBufferGeometries: function(geometries, useGroups) {
        const isIndexed = geometries[0].index !== null;
        const attributesUsed = new Set(Object.keys(geometries[0].attributes));
        const morphAttributesUsed = new Set(Object.keys(geometries[0].morphAttributes));
        const attributes = {};
        const morphAttributes = {};
        const morphTargetsRelative = geometries[0].morphTargetsRelative;
        const mergedGeometry = new THREE.BufferGeometry();
        let offset = 0;

        for (let i = 0; i < geometries.length; ++i) {
            const geometry = geometries[i];
            let attributesCount = 0;

            // ensure that all geometries are indexed, or none
            if (isIndexed !== (geometry.index !== null)) {
                console.error('THREE.BufferGeometryUtils: .mergeBufferGeometries() failed with geometry at index ' + i + '. All geometries must have compatible attributes; make sure index attribute exists among all geometries, or in none of them.');
                return null;
            }

            // gather attributes, exit early if they're different
            for (const name in geometry.attributes) {
                if (!attributesUsed.has(name)) {
                    console.error('THREE.BufferGeometryUtils: .mergeBufferGeometries() failed with geometry at index ' + i + '. All geometries must have compatible attributes; make sure "' + name + '" attribute exists among all geometries, or in none of them.');
                    return null;
                }

                if (attributes[name] === undefined) attributes[name] = [];
                attributes[name].push(geometry.attributes[name]);
                attributesCount++;
            }

            // ensure geometries have the same number of attributes
            if (attributesCount !== attributesUsed.size) {
                console.error('THREE.BufferGeometryUtils: .mergeBufferGeometries() failed with geometry at index ' + i + '. Make sure all geometries have the same number of attributes.');
                return null;
            }

            // gather morph attributes, exit early if they're different
            if (morphTargetsRelative !== geometry.morphTargetsRelative) {
                console.error('THREE.BufferGeometryUtils: .mergeBufferGeometries() failed with geometry at index ' + i + '. .morphTargetsRelative must be consistent throughout all geometries.');
                return null;
            }

            for (const name in geometry.morphAttributes) {
                if (!morphAttributesUsed.has(name)) {
                    console.error('THREE.BufferGeometryUtils: .mergeBufferGeometries() failed with geometry at index ' + i + '.  .morphAttributes must be consistent throughout all geometries.');
                    return null;
                }

                if (morphAttributes[name] === undefined) morphAttributes[name] = [];
                morphAttributes[name].push(geometry.morphAttributes[name]);
            }

            if (useGroups) {
                let count;
                if (isIndexed) {
                    count = geometry.index.count;
                } else if (geometry.attributes.position !== undefined) {
                    count = geometry.attributes.position.count;
                } else {
                    console.error('THREE.BufferGeometryUtils: .mergeBufferGeometries() failed with geometry at index ' + i + '. The geometry must have either an index or a position attribute');
                    return null;
                }

                mergedGeometry.addGroup(offset, count, i);
                offset += count;
            }
        }

        // merge indices
        if (isIndexed) {
            let indexOffset = 0;
            const mergedIndex = [];

            for (let i = 0; i < geometries.length; ++i) {
                const index = geometries[i].index;

                for (let j = 0; j < index.count; ++j) {
                    mergedIndex.push(index.getX(j) + indexOffset);
                }

                indexOffset += geometries[i].attributes.position.count;
            }

            mergedGeometry.setIndex(mergedIndex);
        }

        // merge attributes
        for (const name in attributes) {
            const mergedAttribute = BufferGeometryUtils.mergeBufferAttributes(attributes[name]);
            if (!mergedAttribute) {
                console.error('THREE.BufferGeometryUtils: .mergeBufferGeometries() failed while trying to merge the ' + name + ' attribute.');
                return null;
            }

            mergedGeometry.setAttribute(name, mergedAttribute);
        }

        // merge morph attributes
        for (const name in morphAttributes) {
            const numMorphTargets = morphAttributes[name][0].length;
            if (numMorphTargets === 0) break;

            mergedGeometry.morphAttributes = mergedGeometry.morphAttributes || {};
            mergedGeometry.morphAttributes[name] = [];

            for (let i = 0; i < numMorphTargets; ++i) {
                const morphAttributesToMerge = [];

                for (let j = 0; j < morphAttributes[name].length; ++j) {
                    morphAttributesToMerge.push(morphAttributes[name][j][i]);
                }

                const mergedMorphAttribute = BufferGeometryUtils.mergeBufferAttributes(morphAttributesToMerge);
                if (!mergedMorphAttribute) {
                    console.error('THREE.BufferGeometryUtils: .mergeBufferGeometries() failed while trying to merge the ' + name + ' morphAttribute.');
                    return null;
                }

                mergedGeometry.morphAttributes[name].push(mergedMorphAttribute);
            }
        }

        return mergedGeometry;
    },

    mergeBufferAttributes: function(attributes) {
        let TypedArray;
        let itemSize;
        let normalized;
        let arrayLength = 0;

        for (let i = 0; i < attributes.length; ++i) {
            const attribute = attributes[i];

            if (attribute.isInterleavedBufferAttribute) {
                console.error('THREE.BufferGeometryUtils: .mergeBufferAttributes() failed. InterleavedBufferAttributes are not supported.');
                return null;
            }

            if (TypedArray === undefined) TypedArray = attribute.array.constructor;
            if (TypedArray !== attribute.array.constructor) {
                console.error('THREE.BufferGeometryUtils: .mergeBufferAttributes() failed. BufferAttribute.array must be of consistent array types across matching attributes.');
                return null;
            }

            if (itemSize === undefined) itemSize = attribute.itemSize;
            if (itemSize !== attribute.itemSize) {
                console.error('THREE.BufferGeometryUtils: .mergeBufferAttributes() failed. BufferAttribute.itemSize must be consistent across matching attributes.');
                return null;
            }

            if (normalized === undefined) normalized = attribute.normalized;
            if (normalized !== attribute.normalized) {
                console.error('THREE.BufferGeometryUtils: .mergeBufferAttributes() failed. BufferAttribute.normalized must be consistent across matching attributes.');
                return null;
            }

            arrayLength += attribute.array.length;
        }

        const array = new TypedArray(arrayLength);
        let offset = 0;

        for (let i = 0; i < attributes.length; ++i) {
            array.set(attributes[i].array, offset);
            offset += attributes[i].array.length;
        }

        return new THREE.BufferAttribute(array, itemSize, normalized);
    },

    mergeVertices: function(geometry, tolerance = 1e-4) {
        // Generar array de vértices únicos
        const verticesMap = new Map();
        const uniqueVertices = [];
        const indexMap = new Map();
        const uniquePositions = [];
        const uniqueNormals = [];
        const uniqueUvs = [];
    
        const vertices = geometry.attributes.position.array;
        const normals = geometry.attributes.normal ? geometry.attributes.normal.array : null;
        const uvs = geometry.attributes.uv ? geometry.attributes.uv.array : null;
        
        // Procesar cada vértice
        for (let i = 0; i < vertices.length; i += 3) {
            const x = vertices[i];
            const y = vertices[i + 1];
            const z = vertices[i + 2];
            const key = `${Math.round(x/tolerance)},${Math.round(y/tolerance)},${Math.round(z/tolerance)}`;
    
            if (!verticesMap.has(key)) {
                verticesMap.set(key, uniqueVertices.length);
                uniqueVertices.push(i/3);
                uniquePositions.push(x, y, z);
                if (normals) {
                    uniqueNormals.push(normals[i], normals[i + 1], normals[i + 2]);
                }
                if (uvs) {
                    const uvIndex = (i/3) * 2;
                    uniqueUvs.push(uvs[uvIndex], uvs[uvIndex + 1]);
                }
            }
            indexMap.set(i/3, verticesMap.get(key));
        }
    
        // Crear nueva geometría con vértices únicos
        const mergedGeometry = new THREE.BufferGeometry();
        
        // Posiciones
        mergedGeometry.setAttribute('position', 
            new THREE.Float32BufferAttribute(uniquePositions, 3));
    
        // Normales
        if (normals) {
            mergedGeometry.setAttribute('normal',
                new THREE.Float32BufferAttribute(uniqueNormals, 3));
        }
    
        // UVs
        if (uvs) {
            mergedGeometry.setAttribute('uv',
                new THREE.Float32BufferAttribute(uniqueUvs, 2));
        }
    
        // Actualizar índices
        if (geometry.index) {
            const indices = geometry.index.array;
            const newIndices = [];
            for (let i = 0; i < indices.length; i++) {
                newIndices.push(indexMap.get(indices[i]));
            }
            mergedGeometry.setIndex(newIndices);
        } else {
            const indices = [];
            for (let i = 0; i < vertices.length/3; i++) {
                indices.push(indexMap.get(i));
            }
            mergedGeometry.setIndex(indices);
        }
    
        // Copiar grupos de materiales
        if (geometry.groups && geometry.groups.length > 0) {
            mergedGeometry.groups = JSON.parse(JSON.stringify(geometry.groups));
        }
    
        return mergedGeometry;
    }
    
};

// Colores según orientación
const FACE_COLORS = {
    FRONT: 0x4287f5,  // Azul
    TOP: 0x42f554,    // Verde
    SIDE: 0xf54242    // Rojo
};

function createOrientedMesh(geometryOrGroup) {
    // Definir los materiales para cada orientación
    const materials = [
        new THREE.MeshPhongMaterial({ 
            color: FACE_COLORS.FRONT,  // Azul - Frente
            side: THREE.DoubleSide,
            flatShading: true
        }),
        new THREE.MeshPhongMaterial({ 
            color: FACE_COLORS.FRONT,  // Azul - Atrás
            side: THREE.DoubleSide,
            flatShading: true
        }),
        new THREE.MeshPhongMaterial({ 
            color: FACE_COLORS.TOP,    // Verde - Arriba
            side: THREE.DoubleSide,
            flatShading: true
        }),
        new THREE.MeshPhongMaterial({ 
            color: FACE_COLORS.TOP,    // Verde - Abajo
            side: THREE.DoubleSide,
            flatShading: true
        }),
        new THREE.MeshPhongMaterial({ 
            color: FACE_COLORS.SIDE,   // Rojo - Derecha
            side: THREE.DoubleSide,
            flatShading: true
        }),
        new THREE.MeshPhongMaterial({ 
            color: FACE_COLORS.SIDE,   // Rojo - Izquierda
            side: THREE.DoubleSide,
            flatShading: true
        })
    ];
    
    if (geometryOrGroup instanceof THREE.Group) {
        const geometriesToMerge = [];
        
        // Asegurar que las matrices de transformación están actualizadas
        geometryOrGroup.updateMatrixWorld(true);
        
        // Recolectar todas las geometrías con sus transformaciones aplicadas
        geometryOrGroup.traverse((child) => {
            if (child instanceof THREE.Mesh) {
                const clonedGeometry = child.geometry.clone();
                clonedGeometry.applyMatrix4(child.matrixWorld);
                geometriesToMerge.push(clonedGeometry);
            }
        });
    
        if (geometriesToMerge.length === 0) return null;
    
        // Fusionar las geometrías
        const mergedGeometry = BufferGeometryUtils.mergeBufferGeometries(geometriesToMerge, false);
        
        // Añadir grupos de materiales basados en las normales
        const normals = mergedGeometry.attributes.normal;
        mergedGeometry.clearGroups();
    
        for (let i = 0; i < normals.count; i += 3) {
            const nx = Math.abs(normals.getX(i));
            const ny = Math.abs(normals.getY(i));
            const nz = Math.abs(normals.getZ(i));
            
            let materialIndex;
            if (nz > nx && nz > ny) {
                materialIndex = 0; // Front/Back
            } else if (ny > nx) {
                materialIndex = 1; // Top/Bottom
            } else {
                materialIndex = 2; // Left/Right
            }
            
            mergedGeometry.addGroup(i, 3, materialIndex);
        }
    
        // Recalcular normales
        mergedGeometry.computeVertexNormals();
    
        // Crear el mesh con la geometría fusionada
        const mesh = new THREE.Mesh(mergedGeometry, materials);
        
        // Crear las aristas solo para los bordes externos
        const edges = new THREE.EdgesGeometry(mergedGeometry, 30);
        const line = new THREE.LineSegments(
            edges,
            new THREE.LineBasicMaterial({ 
                color: 0x000000,
                linewidth: 1
            })
        );
    
        const resultGroup = new THREE.Group();
        resultGroup.add(mesh);
        resultGroup.add(line);
        
        return resultGroup;
    } 
    else {
        // Es una geometría individual - mantener el comportamiento original
        const mesh = new THREE.Mesh(geometryOrGroup, materials);
        
        const edges = new THREE.EdgesGeometry(geometryOrGroup);
        const line = new THREE.LineSegments(
            edges,
            new THREE.LineBasicMaterial({ 
                color: 0x000000,
                linewidth: 1,
                transparent: false
            })
        );
        
        const resultGroup = new THREE.Group();
        resultGroup.add(mesh);
        resultGroup.add(line);
        return resultGroup;
    }
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

            escalonadaCompuesta: {
                name: "Escalonada Compuesta",
                createGeometry: function() {
                    const group = new THREE.Group();
            
                    // Primero creamos todos los cubos como geometrías simples (sin createOrientedMesh)
                    const baseGeometry = new THREE.BoxGeometry(4, 1, 3);
                    const base = new THREE.Mesh(baseGeometry);
                    base.position.set(0, 0.5, 0);
            
                    const medioGeometry = new THREE.BoxGeometry(4, 1, 3);
                    const medio = new THREE.Mesh(medioGeometry);
                    medio.position.set(0, 1.5, 0);
            
                    const superiorGeometry = new THREE.BoxGeometry(4, 1, 3);
                    const superior = new THREE.Mesh(superiorGeometry);
                    superior.position.set(0, 2.5, 0);
            
                    // Añadimos los meshes al grupo
                    group.add(base);
                    group.add(medio);
                    group.add(superior);
            
                    // Ahora sí, aplicamos createOrientedMesh al grupo completo
                    return createOrientedMesh(group);
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