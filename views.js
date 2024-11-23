let drawingContext = {
    activeCanvas: null,
    isDrawing: false,
    startX: 0,
    startY: 0,
    currentTool: 'line',
    lineStyle: 'solid',
    gridSize: 40,
    snapThreshold: 10,
    tempLine: null,
    margin: 25,  // Añadimos un margen para los puntos del perímetro
    eraserRadius: 5  // Radio de detección para el borrador
};

function initDrawingSystem(containerId) {
    // Crear contenedor principal
    const mainContainer = document.createElement('div');
    mainContainer.style.cssText = `
        display: flex;
        flex-direction: column;
        gap: 10px;
        padding: 10px;
        background-color: #f5f5f5;
        border: 1px solid #ccc;
        align-items: left;
    `;

    // Crear barra de herramientas superior
    const topToolbar = createTopToolbar();
    mainContainer.appendChild(topToolbar);

    // Contenedor para las vistas
    const viewsContainer = document.createElement('div');
    viewsContainer.className = 'views-container';
    viewsContainer.style.cssText = `
        display: grid;
        grid-template-columns: auto auto;
        grid-template-rows: auto auto;
        gap: 10px;
    `;

    const views = [
        { name: 'Alzado', position: 'bottom-left' },
        { name: 'Perfil', position: 'bottom-right' },
        { name: 'Planta', position: 'top-left' },
    ];

    views.forEach(view => {
        const viewContainer = createViewCanvas(view);
        viewsContainer.appendChild(viewContainer);
    });

    mainContainer.appendChild(viewsContainer);
    document.getElementById(containerId).appendChild(mainContainer);
}

function createTopToolbar() {
    const toolbar = document.createElement('div');
    toolbar.style.cssText = `
        display: flex;
        gap: 10px;
        padding: 10px;
        background: #fff;
        border: 1px solid #ccc;
        border-radius: 4px;
        align-items: center;
    `;

    // Grupo de botones de tipo de línea
    const lineTypeGroup = createButtonGroup([
        {
            id: 'solid-line',
            icon: '━',
            title: 'Línea Continua',
            onClick: () => setLineStyle('solid')
        },
        {
            id: 'dashed-line',
            icon: '┄',
            title: 'Línea Discontinua',
            onClick: () => setLineStyle('dashed')
        },
        {
            id: 'eraser',
            icon: '⌫',
            title: 'Borrador',
            onClick: () => {
                drawingContext.currentTool = 'eraser';
            }
        }
    ]);
    toolbar.appendChild(lineTypeGroup);

    // Separador
    toolbar.appendChild(createSeparator());

    // Botón de limpiar
    const clearButton = document.createElement('button');
    clearButton.textContent = '🗑️';
    clearButton.title = 'Limpiar Todo';
    clearButton.style.cssText = `
        padding: 8px 12px;
        font-size: 16px;
        cursor: pointer;
        background: white;
        border: 1px solid #ccc;
        border-radius: 4px;
        transition: all 0.2s;
        min-width: 40px;
        display: flex;
        align-items: center;
        justify-content: center;
    `;
    clearButton.addEventListener('click', clearAllCanvases);
    toolbar.appendChild(clearButton);

    // Separador
    toolbar.appendChild(createSeparator());

    // Botón de guardar
    const saveButton = document.createElement('button');
    saveButton.textContent = '📷';
    saveButton.title = 'Guardar como JPG';
    saveButton.style.cssText = `
        padding: 8px 12px;
        font-size: 16px;
        cursor: pointer;
        background: white;
        border: 1px solid #ccc;
        border-radius: 4px;
        transition: all 0.2s;
        min-width: 40px;
        display: flex;
        align-items: center;
        justify-content: center;
    `;
    saveButton.addEventListener('click', captureAllToJPG);
    toolbar.appendChild(saveButton);

    return toolbar;
}

function createButtonGroup(buttons) {
    const group = document.createElement('div');
    group.style.cssText = `
        display: flex;
        gap: 2px;
        background: #f0f0f0;
        padding: 2px;
        border-radius: 4px;
    `;

    buttons.forEach(button => {
        const btn = document.createElement('button');
        btn.textContent = button.icon;
        btn.title = button.title;
        btn.dataset.tool = button.id; // Añadimos un identificador de herramienta
        btn.style.cssText = `
            padding: 8px 12px;
            font-size: 16px;
            cursor: pointer;
            background: white;
            border: 1px solid #ccc;
            border-radius: 4px;
            transition: all 0.2s;
            min-width: 40px;
            display: flex;
            align-items: center;
            justify-content: center;
        `;

        btn.addEventListener('mouseenter', () => {
            btn.style.background = '#f8f8f8';
        });

        btn.addEventListener('mouseleave', () => {
            if (drawingContext.currentTool !== button.id) {
                btn.style.background = 'white';
            }
        });

        btn.addEventListener('click', () => {
            drawingContext.currentTool = button.id;
            button.onClick();
            updateButtonSelection(group, btn);
        });

        group.appendChild(btn);
    });

    return group;
}

function createSeparator() {
    const separator = document.createElement('div');
    separator.style.cssText = `
        width: 1px;
        height: 24px;
        background: #ccc;
        margin: 0 5px;
    `;
    return separator;
}

function setLineStyle(style) {
    drawingContext.lineStyle = style;
}

function clearAllCanvases() {
    // Primero mostrar el diálogo de confirmación
    if (confirm('¿Estás seguro de que quieres limpiar todos los lienzos?')) {
        const canvases = document.querySelectorAll('.view-container canvas');
        canvases.forEach(canvas => {
            // Asegurarse de que el array de líneas existe y se limpia
            if (!canvas.savedLines) {
                canvas.savedLines = [];
            } else {
                canvas.savedLines.length = 0;
            }
            // Redibujar el canvas solo con la rejilla
            redrawCanvas(canvas);
        });
    }
}

async function captureAllToJPG() {
    // Crear un canvas temporal para la composición final
    const tempCanvas = document.createElement('canvas');
    const padding = 30;
    
    // Dimensiones base para cada sección
    const viewerSize = 400;
    const viewSize = 200;
    
    // Configurar el canvas temporal con las proporciones correctas
    tempCanvas.width = viewerSize + (viewSize * 2) + padding * 4;
    tempCanvas.height = viewerSize + padding * 3;
    
    const ctx = tempCanvas.getContext('2d');
    
    // Fondo blanco
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);

    try {
        // 1. Capturar vista isométrica (visor 3D)
        const viewerCanvas = document.getElementById('viewer-container').querySelector('canvas');
        renderer.render(scene, camera);
        const viewerImage = await loadImage(viewerCanvas.toDataURL('image/png'));
        ctx.drawImage(viewerImage, padding, padding, viewerSize, viewerSize);

        // 2. Capturar y posicionar las vistas ortográficas
        const views = {
            alzado: { 
                canvas: document.querySelector('.bottom-left canvas'),
                x: viewerSize + padding * 2,
                y: padding
            },
            perfil: {
                canvas: document.querySelector('.bottom-right canvas'),
                x: viewerSize + viewSize + padding * 3,
                y: padding
            },
            planta: {
                canvas: document.querySelector('.top-left canvas'),
                x: viewerSize + padding * 2,
                y: viewSize + padding * 2
            }
        };

        // Dibujar cada vista y su etiqueta
        for (const [name, view] of Object.entries(views)) {
            const viewImage = await loadImage(view.canvas.toDataURL('image/png'));
            ctx.drawImage(viewImage, view.x, view.y, viewSize, viewSize);

            // Añadir etiqueta de la vista
            ctx.font = '16px Arial';
            ctx.fillStyle = 'black';
            ctx.textAlign = 'center';
            ctx.fillText(name.charAt(0).toUpperCase() + name.slice(1), 
                        view.x + viewSize/2, 
                        view.y - 10);
        }

        // Generar y descargar la imagen
        const link = document.createElement('a');
        link.download = 'vistas_ortograficas.jpg';
        link.href = tempCanvas.toDataURL('image/jpeg', 0.9);
        link.click();

    } catch (error) {
        console.error('Error al capturar las vistas:', error);
        alert('Hubo un error al generar la imagen. Por favor, inténtalo de nuevo.');
    }
}

// Función auxiliar para cargar imágenes
function loadImage(src) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = src;
    });
}

function updateButtonSelection(group, activeButton) {
    group.querySelectorAll('button').forEach(button => {
        button.style.background = button === activeButton ? '#e0e0e0' : 'white';
    });
}

function createViewCanvas(view) {
    const viewContainer = document.createElement('div');
    viewContainer.className = `view-container ${view.position}`;
    viewContainer.style.cssText = `
        border: 1px solid #999;
        background: white;
        padding: 5px;
    `;

    const title = document.createElement('div');
    title.textContent = view.name;
    title.style.cssText = `
        text-align: center;
        font-weight: bold;
        margin-bottom: 5px;
    `;
    viewContainer.appendChild(title);

    const canvas = document.createElement('canvas');
    canvas.width = 300;
    canvas.height = 300;
    canvas.style.cssText = `
        border: 1px solid #ccc;
        background: white;
        cursor: crosshair;
    `;
    viewContainer.appendChild(canvas);

    // Inicializar el canvas con la rejilla
    canvas.savedLines = [];
    drawGrid(canvas);
    setupCanvasDrawing(canvas);

    return viewContainer;
}

function createToolbar() {
    const toolbar = document.createElement('div');
    toolbar.className = 'drawing-toolbar';
    toolbar.style.cssText = `
        grid-column: 1 / -1;
        padding: 10px;
        background: #eee;
        border: 1px solid #ccc;
        display: flex;
        gap: 10px;
        align-items: center;
    `;

    const tools = [
        { id: 'line', icon: '━', title: 'Línea continua' },
        { id: 'dashed', icon: '┄', title: 'Línea discontinua' },
        { id: 'eraser', icon: '⌫', title: 'Borrador' },
        { id: 'clear', icon: '🗑️', title: 'Limpiar todo' }
    ];

    tools.forEach(tool => {
        const button = document.createElement('button');
        button.textContent = tool.icon;
        button.title = tool.title;
        button.style.cssText = `
            padding: 5px 10px;
            font-size: 16px;
            cursor: pointer;
            background: white;
            border: 1px solid #ccc;
            border-radius: 4px;
        `;

        button.addEventListener('click', () => {
            if (tool.id === 'clear') {
                clearActiveCanvas();
            } else {
                setActiveTool(tool.id);
                updateToolbarSelection(toolbar, button);
            }
        });

        toolbar.appendChild(button);
    });

    return toolbar;
}

function drawGrid(canvas) {
    const ctx = canvas.getContext('2d');
    const gridSize = drawingContext.gridSize;
    const margin = drawingContext.margin;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    
    // Calcular el número de celdas que caben en el espacio disponible
    const availableWidth = canvas.width - (2 * margin);
    const availableHeight = canvas.height - (2 * margin);
    const numCellsX = Math.floor(availableWidth / gridSize);
    const numCellsY = Math.floor(availableHeight / gridSize);
    
    // Dibujar líneas verticales y horizontales
    ctx.strokeStyle = '#e0e0e0';
    ctx.lineWidth = 0.5;
    
    // Dibujar líneas verticales
    for (let i = 0; i <= numCellsX; i++) {
        const x = margin + (i * gridSize);
        ctx.beginPath();
        ctx.moveTo(x, margin);
        ctx.lineTo(x, canvas.height - margin);
        ctx.stroke();
    }

    // Dibujar líneas horizontales
    for (let i = 0; i <= numCellsY; i++) {
        const y = margin + (i * gridSize);
        ctx.beginPath();
        ctx.moveTo(margin, y);
        ctx.lineTo(canvas.width - margin, y);
        ctx.stroke();
    }

    // Dibujar puntos de intersección
    ctx.fillStyle = '#808080';
    for (let i = 0; i <= numCellsX; i++) {
        for (let j = 0; j <= numCellsY; j++) {
            const x = margin + (i * gridSize);
            const y = margin + (j * gridSize);
            ctx.beginPath();
            ctx.arc(x, y, 2, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    ctx.restore();
}

function snapToGrid(x, y) {
    const gridSize = drawingContext.gridSize;
    const margin = drawingContext.margin;
    const threshold = drawingContext.snapThreshold;
    
    // Ajustar las coordenadas considerando el margen
    const gridX = Math.round((x - margin) / gridSize) * gridSize + margin;
    const gridY = Math.round((y - margin) / gridSize) * gridSize + margin;
    
    const distX = Math.abs(x - gridX);
    const distY = Math.abs(y - gridY);
    
    if (distX <= threshold && distY <= threshold) {
        return { x: gridX, y: gridY };
    }
    return null;
}


function redrawCanvas(canvas) {
    const ctx = canvas.getContext('2d');
    
    // Limpiar el canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Dibujar rejilla
    drawGrid(canvas);
    
    // Asegurarse de que savedLines existe
    if (!canvas.savedLines) {
        canvas.savedLines = [];
    }
    
    // Dibujar líneas guardadas
    canvas.savedLines.forEach(line => {
        ctx.beginPath();
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 2;
        if (line.style === 'dashed') {
            ctx.setLineDash([5, 5]);
        } else {
            ctx.setLineDash([]);
        }
        ctx.moveTo(line.startX, line.startY);
        ctx.lineTo(line.endX, line.endY);
        ctx.stroke();
    });

    // Dibujar línea temporal
    if (drawingContext.tempLine && drawingContext.activeCanvas === canvas) {
        ctx.beginPath();
        ctx.strokeStyle = 'blue';
        ctx.lineWidth = 2;
        if (drawingContext.lineStyle === 'dashed') {
            ctx.setLineDash([5, 5]);
        } else {
            ctx.setLineDash([]);
        }
        ctx.moveTo(drawingContext.tempLine.startX, drawingContext.tempLine.startY);
        ctx.lineTo(drawingContext.tempLine.endX, drawingContext.tempLine.endY);
        ctx.stroke();
    }
}

// Función para calcular la distancia de un punto a una línea
function distanceToLine(point, line) {
    const { x, y } = point;
    const { startX, startY, endX, endY } = line;
    
    // Calcular la distancia usando la fórmula de distancia punto-línea
    const numerator = Math.abs(
        (endY - startY) * x -
        (endX - startX) * y +
        endX * startY -
        endY * startX
    );
    
    const denominator = Math.sqrt(
        Math.pow(endY - startY, 2) +
        Math.pow(endX - startX, 2)
    );
    
    // Verificar si el punto está dentro del segmento de línea
    const dotProduct = 
        ((x - startX) * (endX - startX) +
        (y - startY) * (endY - startY)) /
        (Math.pow(denominator, 2));
        
    if (dotProduct < 0 || dotProduct > 1) {
        return Infinity;
    }
    
    return numerator / denominator;
}


function setupCanvasDrawing(canvas) {
    function handleMouseDown(e) {
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        if (drawingContext.currentTool === 'line') {
            const snappedPoint = snapToGrid(x, y);
            if (snappedPoint) {
                drawingContext.isDrawing = true;
                drawingContext.activeCanvas = canvas;
                drawingContext.startX = snappedPoint.x;
                drawingContext.startY = snappedPoint.y;
            }
        } else if (drawingContext.currentTool === 'eraser') {
            eraseLine(canvas, x, y);
        }
    }

    function handleMouseMove(e) {
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        if (drawingContext.currentTool === 'line' && drawingContext.isDrawing) {
            const snappedPoint = snapToGrid(x, y);
            if (snappedPoint) {
                drawingContext.tempLine = {
                    startX: drawingContext.startX,
                    startY: drawingContext.startY,
                    endX: snappedPoint.x,
                    endY: snappedPoint.y,
                    style: drawingContext.lineStyle
                };
                redrawCanvas(canvas);
            }
        } else if (drawingContext.currentTool === 'eraser') {
            highlightNearestLine(canvas, x, y);
        }
    }

    function handleMouseUp() {
        if (drawingContext.isDrawing && drawingContext.tempLine) {
            if (!canvas.savedLines) {
                canvas.savedLines = [];
            }
            canvas.savedLines.push({...drawingContext.tempLine});
            drawingContext.tempLine = null;
            drawingContext.isDrawing = false;
            redrawCanvas(canvas);
        }
    }

    function handleMouseOut() {
        if (drawingContext.isDrawing) {
            drawingContext.tempLine = null;
            drawingContext.isDrawing = false;
            redrawCanvas(canvas);
        }
    }

    // Eliminar event listeners existentes si los hay
    canvas.removeEventListener('mousedown', handleMouseDown);
    canvas.removeEventListener('mousemove', handleMouseMove);
    canvas.removeEventListener('mouseup', handleMouseUp);
    canvas.removeEventListener('mouseout', handleMouseOut);

    // Agregar nuevos event listeners
    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseup', handleMouseUp);
    canvas.addEventListener('mouseout', handleMouseOut);
}

function setLineStyle(style) {
    drawingContext.lineStyle = style;
    drawingContext.currentTool = 'line'; // Asegurarse de que estamos en modo línea
}


// Función para borrar una línea
function eraseLine(canvas, x, y) {
    if (!canvas.savedLines) return;
    
    let minDistance = drawingContext.eraserRadius;
    let lineToRemove = -1;

    canvas.savedLines.forEach((line, index) => {
        const distance = distanceToLine({x, y}, line);
        if (distance < minDistance) {
            minDistance = distance;
            lineToRemove = index;
        }
    });

    if (lineToRemove !== -1) {
        canvas.savedLines.splice(lineToRemove, 1);
        redrawCanvas(canvas);
    }
}

// Función para resaltar la línea más cercana al cursor en modo borrador
function highlightNearestLine(canvas, x, y) {
    if (!canvas.savedLines) return;
    
    const ctx = canvas.getContext('2d');
    redrawCanvas(canvas); // Redibujar sin resaltado
    
    let minDistance = drawingContext.eraserRadius;
    let nearestLine = null;

    canvas.savedLines.forEach(line => {
        const distance = distanceToLine({x, y}, line);
        if (distance < minDistance) {
            minDistance = distance;
            nearestLine = line;
        }
    });

    // Resaltar la línea más cercana
    if (nearestLine) {
        ctx.beginPath();
        ctx.strokeStyle = 'red';
        ctx.lineWidth = 3;
        ctx.setLineDash([]);
        ctx.moveTo(nearestLine.startX, nearestLine.startY);
        ctx.lineTo(nearestLine.endX, nearestLine.endY);
        ctx.stroke();
    }
}


function setActiveTool(toolId) {
    if (toolId === 'dashed') {
        drawingContext.currentTool = 'line';
        drawingContext.lineStyle = 'dashed';
    } else if (toolId === 'line') {
        drawingContext.currentTool = 'line';
        drawingContext.lineStyle = 'solid';
    } else {
        drawingContext.currentTool = toolId;
    }
}

function updateToolbarSelection(toolbar, activeButton) {
    toolbar.querySelectorAll('button').forEach(button => {
        button.style.background = button === activeButton ? '#ddd' : 'white';
    });
}

function updateButtonSelection(group, activeButton) {
    group.querySelectorAll('button').forEach(button => {
        const isActive = button === activeButton;
        button.style.background = isActive ? '#e0e0e0' : 'white';
        
        // Actualizar el estilo del cursor del canvas según la herramienta
        const canvases = document.querySelectorAll('.view-container canvas');
        canvases.forEach(canvas => {
            canvas.style.cursor = drawingContext.currentTool === 'eraser' ? 'crosshair' : 'default';
        });
    });
}

function clearActiveCanvas() {
    if (drawingContext.activeCanvas) {
        drawingContext.activeCanvas.savedLines = [];
        redrawCanvas(drawingContext.activeCanvas);
    }
}