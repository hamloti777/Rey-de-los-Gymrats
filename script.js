document.addEventListener('DOMContentLoaded', () => {
    const trainingDaysContainer = document.getElementById('training-days-container');
    const daysOfWeek = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

    // Función para cargar datos desde localStorage
    const loadData = (day) => {
        const data = localStorage.getItem(`gymrat_data_${day}`);
        return data ? JSON.parse(data) : { exercises: [], comments: '', records: {} };
    };

    // Función para guardar datos en localStorage
    const saveData = (day, data) => {
        localStorage.setItem(`gymrat_data_${day}`, JSON.stringify(data));
    };

    // Generar las tarjetas para cada día
    daysOfWeek.forEach(day => {
        const dayData = loadData(day);

        const dayCard = document.createElement('div');
        dayCard.classList.add('day-card');
        dayCard.innerHTML = `
            <h2>${day}</h2>
            <div class="exercises-list">
                </div>
            <button class="add-exercise-btn" data-day="${day}">+ Añadir Ejercicio</button>

            <div class="records-section">
                <h3>Mis Récords</h3>
                <div class="saved-records-list">
                    </div>
            </div>

            <div class="comment-section">
                <h3>Comentarios del Día</h3>
                <textarea class="day-comments" rows="3" placeholder="Añade tus observaciones aquí..."></textarea>
            </div>
            <button class="save-day-btn" data-day="${day}">Guardar Progreso</button>
        `;
        trainingDaysContainer.appendChild(dayCard);

        const exercisesList = dayCard.querySelector('.exercises-list');
        const savedRecordsList = dayCard.querySelector('.saved-records-list');
        const dayCommentsTextarea = dayCard.querySelector('.day-comments');

        // Cargar ejercicios guardados
        dayData.exercises.forEach(exercise => {
            addExerciseInput(exercisesList, exercise.name, exercise.sets);
        });

        // Cargar comentarios guardados
        dayCommentsTextarea.value = dayData.comments;

        // Cargar récords guardados
        for (const exerciseName in dayData.records) {
            const record = dayData.records[exerciseName];
            const recordElement = document.createElement('div');
            recordElement.classList.add('saved-record');
            recordElement.textContent = `${exerciseName}: ${record.weight}kg x ${record.reps} reps (Record)`;
            savedRecordsList.appendChild(recordElement);
        }

        // Evento para añadir un nuevo ejercicio
        dayCard.querySelector('.add-exercise-btn').addEventListener('click', () => {
            addExerciseInput(exercisesList);
        });

        // Evento para guardar todo el progreso del día
        dayCard.querySelector('.save-day-btn').addEventListener('click', () => {
            const currentDayData = {
                exercises: [],
                comments: dayCommentsTextarea.value,
                records: {}
            };

            // Recorrer los ejercicios y guardar sus datos
            exercisesList.querySelectorAll('.exercise-entry').forEach(entry => {
                const exerciseName = entry.querySelector('.exercise-name').value;
                const sets = [];
                entry.querySelectorAll('.set-input').forEach(setInput => {
                    const reps = setInput.querySelector('.reps-input').value;
                    const weight = setInput.querySelector('.weight-input').value;
                    if (reps && weight) {
                        sets.push({ reps: parseInt(reps), weight: parseFloat(weight) });
                    }
                });

                if (exerciseName) {
                    currentDayData.exercises.push({ name: exerciseName, sets: sets });

                    // Actualizar récords si aplica
                    let currentMaxWeight = 0;
                    let currentMaxReps = 0;
                    sets.forEach(set => {
                        if (set.weight > currentMaxWeight) {
                            currentMaxWeight = set.weight;
                            currentMaxReps = set.reps;
                        } else if (set.weight === currentMaxWeight && set.reps > currentMaxReps) {
                            currentMaxReps = set.reps;
                        }
                    });

                    if (!dayData.records[exerciseName] || currentMaxWeight > dayData.records[exerciseName].weight || (currentMaxWeight === dayData.records[exerciseName].weight && currentMaxReps > dayData.records[exerciseName].reps)) {
                        currentDayData.records[exerciseName] = { weight: currentMaxWeight, reps: currentMaxReps };
                    } else {
                        currentDayData.records[exerciseName] = dayData.records[exerciseName]; // Mantener el récord anterior si no se supera
                    }
                }
            });

            saveData(day, currentDayData);
            alert(`¡Progreso del ${day} guardado!`);
            // Recargar la página o actualizar solo la sección de récords
            // Para simplificar, aquí se recarga, pero podrías actualizar solo el DOM
            location.reload();
        });
    });

    // Función auxiliar para añadir campos de ejercicio
    function addExerciseInput(exercisesList, initialName = '', initialSets = []) {
        const exerciseEntry = document.createElement('div');
        exerciseEntry.classList.add('exercise-entry');
        exerciseEntry.innerHTML = `
            <label>Nombre del Ejercicio:</label>
            <input type="text" class="exercise-name" value="${initialName}" placeholder="Ej. Press de Banca">
            <div class="sets-container">
                </div>
            <button type="button" class="add-set-btn">+ Añadir Serie</button>
            <button type="button" class="remove-exercise-btn">Eliminar Ejercicio</button>
        `;
        exercisesList.appendChild(exerciseEntry);

        const setsContainer = exerciseEntry.querySelector('.sets-container');
        const addSetBtn = exerciseEntry.querySelector('.add-set-btn');
        const removeExerciseBtn = exerciseEntry.querySelector('.remove-exercise-btn');

        // Cargar sets iniciales si existen
        initialSets.forEach(set => {
            addSetInput(setsContainer, set.reps, set.weight);
        });
        
        // Si no hay sets iniciales, añadir uno por defecto
        if (initialSets.length === 0) {
            addSetInput(setsContainer);
        }

        addSetBtn.addEventListener('click', () => addSetInput(setsContainer));
        removeExerciseBtn.addEventListener('click', () => exerciseEntry.remove());
    }

    // Función auxiliar para añadir campos de serie (reps y peso)
    function addSetInput(setsContainer, initialReps = '', initialWeight = '') {
        const setDiv = document.createElement('div');
        setDiv.classList.add('set-input');
        setDiv.innerHTML = `
            <label>Reps:</label>
            <input type="number" class="reps-input" value="${initialReps}" placeholder="Ej. 10" min="1">
            <label>Peso (kg):</label>
            <input type="number" class="weight-input" value="${initialWeight}" placeholder="Ej. 60" min="0">
            <button type="button" class="remove-set-btn">X</button>
        `;
        setsContainer.appendChild(setDiv);

        setDiv.querySelector('.remove-set-btn').addEventListener('click', () => setDiv.remove());
    }
});