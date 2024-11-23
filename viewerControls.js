function createViewerControls(container) {
    const controlsDiv = document.createElement('div');
    controlsDiv.style.cssText = `
        display: flex;
        gap: 5px; 
    `;

    const views = [
        { id: 'front', label: 'Alzado', position: [0, 0, 20] },
        { id: 'top', label: 'Planta', position: [0, 20, 0] },
        { id: 'side', label: 'Perfil', position: [20, 0, 0] }
    ];

    views.forEach(view => {
        const button = document.createElement('button');
        button.textContent = view.label;
        button.style.cssText = `
            padding: 8px;
            background: #f0f0f0;
            border: 1px solid #ccc;
            border-radius: 4px;
            cursor: pointer;
            font-size: 12px;
            transition: all 0.2s;
            min-width: 30px;
            max-height: 50px;
        `;
        
        button.addEventListener('mouseover', () => {
            button.style.background = '#e0e0e0';
        });
        
        button.addEventListener('mouseout', () => {
            if (!button.classList.contains('active')) {
                button.style.background = '#f0f0f0';
            }
        });
        
        button.addEventListener('click', () => {
            setView(view.position);
            highlightActiveButton(controlsDiv, button);
        });
        
        controlsDiv.appendChild(button);
    });

    // Botones de acción
    const resetButton = createActionButton('↺ Reset', () => {
        camera.position.set(20, 10, 10);
        camera.lookAt(0, 0, 0);
        controls.reset();
    });
    
    const helpButton = createActionButton('? Ayuda', toggleHelp);

    controlsDiv.appendChild(resetButton);
    controlsDiv.appendChild(helpButton);

    container.appendChild(controlsDiv);
}

function updateModelSelector(container, difficulty) {
    container.innerHTML = '';
    
    // Contenedor para el desplegable y la etiqueta
    const selectWrapper = document.createElement('div');
    selectWrapper.style.cssText = `
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 10px;
        margin-top: 10px;
    `;

    // Etiqueta
    const label = document.createElement('span');
    label.textContent = 'Modelo:';
    label.style.cssText = `
        font-size: 14px;
        color: #666;
    `;

    // Crear el desplegable
    const select = document.createElement('select');
    select.style.cssText = `
        padding: 8px 12px;
        border: 1px solid #ccc;
        border-radius: 4px;
        font-size: 14px;
        min-width: 200px;
        background: white;
        cursor: pointer;
    `;

    const models = MODELS[difficulty].models;
    Object.keys(models).forEach(modelId => {
        const option = document.createElement('option');
        option.value = modelId;
        option.textContent = models[modelId].name;
        select.appendChild(option);
    });

    select.addEventListener('change', (e) => {
        loadModel(difficulty, e.target.value);
    });

    selectWrapper.appendChild(label);
    selectWrapper.appendChild(select);
    container.appendChild(selectWrapper);

    // Cargar el primer modelo
    loadModel(difficulty, Object.keys(models)[0]);
}

function createModelSelector(container) {
    const selectorContainer = document.createElement('div');
    selectorContainer.style.cssText = `
        display: flex;
        flex-direction: column;
        gap: 11px;
    `;

    // Título para la sección
    const title = document.createElement('h3');
    title.textContent = 'Selección de Modelos';
    title.style.cssText = `
        margin: 0;
        font-size: 16px;
        color: #333;
        text-align: center;
    `;
    selectorContainer.appendChild(title);

    // Etiqueta para el nivel de dificultad
    const difficultyLabel = document.createElement('div');
    difficultyLabel.textContent = 'Nivel de dificultad:';
    difficultyLabel.style.cssText = `
        font-size: 14px;
        color: #666;
        text-align: center;
        margin-top: 5px;
    `;
    selectorContainer.appendChild(difficultyLabel);

    // Contenedor para botones de dificultad
    const difficultyContainer = document.createElement('div');
    difficultyContainer.style.cssText = `
        display: flex;
        gap: 10px;
        justify-content: center;
    `;

    // Crear botones de dificultad
    Object.keys(MODELS).forEach(difficulty => {
        const button = createActionButton(MODELS[difficulty].title, () => {
            highlightActiveButton(difficultyContainer, button);
            updateModelSelector(modelSelectContainer, difficulty);
        });
        button.style.cssText += `
            padding: 10px 20px;
            font-size: 14px;
            flex: 1;
            max-width: 150px;
        `;
        difficultyContainer.appendChild(button);
    });

    selectorContainer.appendChild(difficultyContainer);

    // Contenedor para el selector de modelos
    const modelSelectContainer = document.createElement('div');
    modelSelectContainer.style.cssText = `
        display: flex;
        gap: 10px;
        align-items: center;
        justify-content: center;
    `;
    selectorContainer.appendChild(modelSelectContainer);

    container.appendChild(selectorContainer);

    // Inicializar con la primera dificultad
    const firstDifficulty = Object.keys(MODELS)[0];
    updateModelSelector(modelSelectContainer, firstDifficulty);
    highlightActiveButton(difficultyContainer, difficultyContainer.firstChild);
}

function createHelpPanel(container) {
    const helpPanel = document.createElement('div');
    helpPanel.id = 'help-panel';
    helpPanel.style.cssText = `
        position: absolute;
        top: 60px;
        right: 10px;
        background: white;
        padding: 15px;
        border-radius: 8px;      
        box-shadow: 0 2px 6px rgba(0,0,0,0.1);
        max-width: 200px;
        display: none;
        z-index: 1000;
    `;

    helpPanel.innerHTML = `
        <h3 style="margin: 0 0 10px 0; font-size: 16px;">Ayuda para dibujar vistas</h3>
        <ul style="margin: 0; padding-left: 20px; font-size: 14px;">
            <li style="margin-bottom: 8px;">Usa la vista isométrica para entender la pieza en 3D</li>
            <li style="margin-bottom: 8px;">Las líneas continuas representan aristas visibles</li>
            <li style="margin-bottom: 8px;">Las líneas discontinuas son para aristas ocultas</li>
            <li style="margin-bottom: 8px;">Alinea las vistas según las proyecciones del sistema europeo</li>
            <li style="margin-bottom: 8px;">Usa la rejilla como referencia para las medidas</li>
        </ul>
    `;

    container.appendChild(helpPanel);
}

function toggleHelp() {
    const helpPanel = document.getElementById('help-panel');
    if (helpPanel) {
        helpPanel.style.display = helpPanel.style.display === 'none' ? 'block' : 'none';
    }
}

// Función auxiliar para crear un separador visual
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