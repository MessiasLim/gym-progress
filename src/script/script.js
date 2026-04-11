
import { workoutPlan } from './exercicios.js';
document.addEventListener('DOMContentLoaded', () => {            

    // --- ELEMENTOS DO DOM ---
    const daySelect = document.getElementById('day-select');
    const exerciseSelect = document.getElementById('exercise-select');
    const exerciseDetailsDiv = document.getElementById('exercise-details');
    const feedbackSection = document.getElementById('feedback-section');
    const saveExerciseBtn = document.getElementById('save-exercise-btn');
    const finishWorkoutBtn = document.getElementById('finish-workout-btn');
    const notesInput = document.getElementById('notes-input');
    const suggestionDiv = document.getElementById('suggestion');
    const toggleHistoryBtn = document.getElementById('toggle-history-btn');
    const historyLogDiv = document.getElementById('history-log');
    const historyContent = document.getElementById('history-content');
    const clearHistoryBtn = document.getElementById('clear-history-btn');

    // --- VARIÁVEIS DE ESTADO ---
    let currentWorkout = [];

    // --- FUNÇÕES DE LÓGICA DO APP ---
    function populateDays() {
        const days = Object.keys(workoutPlan);
        daySelect.innerHTML = days.map(day => `<option value="${day}">${day.charAt(0).toUpperCase() + day.slice(1)}</option>`).join('');
    }

    function populateExercises() {
        const selectedDay = daySelect.value;
        const exercises = workoutPlan[selectedDay];
        exerciseSelect.innerHTML = exercises.map(ex => `<option value="${ex.name}">${ex.name}</option>`).join('');
        displaySeriesControls();
    }

    function displaySeriesControls() {
        const selectedDay = daySelect.value;
        const exerciseName = exerciseSelect.value;
        const exercise = workoutPlan[selectedDay].find(ex => ex.name === exerciseName);
        
        const inputsHTML = `
            <h3>${exercise.name}</h3>
            <p><strong>Média:</strong> ${exercise.reps} repetições.</p>
            <div class="series-control">
                <label for="series-count">Número de Séries:</label>
                <input type="number" id="series-count" value="${exercise.sets}" min="1">
                <button id="add-series-btn">+</button>
                <button id="remove-series-btn">-</button>
            </div>
            <div id="series-inputs-container"></div>
            <div class="control-group" style="margin-top: 1rem;">
                <label for="weight-input">Peso Utilizado (kg)</label>
                <input type="number" id="weight-input" placeholder="Ex: 35">
            </div>
        `;
        
        exerciseDetailsDiv.innerHTML = inputsHTML;
        setupSeriesListeners();
        updateSeriesInputs();

        feedbackSection.classList.remove('hidden');
        suggestionDiv.classList.add('hidden');
        notesInput.value = '';
    }

    function setupSeriesListeners() {
        const addSeriesBtn = document.getElementById('add-series-btn');
        const removeSeriesBtn = document.getElementById('remove-series-btn');
        const seriesCountInput = document.getElementById('series-count');

        addSeriesBtn.addEventListener('click', () => {
            const currentVal = parseInt(seriesCountInput.value);
            if (currentVal < 5) {
                seriesCountInput.value = parseInt(seriesCountInput.value) + 1;
                updateSeriesInputs();
            }
        });
        
        removeSeriesBtn.addEventListener('click', () => {
            const currentVal = parseInt(seriesCountInput.value);
            if (currentVal > 1) {
                seriesCountInput.value = currentVal - 1;
                updateSeriesInputs();
            }
        });

        seriesCountInput.addEventListener('change', updateSeriesInputs);
        seriesCountInput.addEventListener('input', updateSeriesInputs);
    }

    function updateSeriesInputs() {
        const seriesCount = parseInt(document.getElementById('series-count').value);
        const container = document.getElementById('series-inputs-container');
        container.innerHTML = '';
        
        let inputsHTML = '<div class="series-inputs">';
        for (let i = 1; i <= seriesCount; i++) {
            inputsHTML += `
                <div class="control-group">
                    <label for="set-${i}-reps">Série ${i} (Reps)</label>
                    <input type="number" id="set-${i}-reps" placeholder="Reps">
                </div>
            `;
        }
        inputsHTML += '</div>';
        container.innerHTML = inputsHTML;
    }
    
    function saveExercise() {
        const selectedDay = daySelect.value;
        const exerciseName = exerciseSelect.value;
        const weight = parseFloat(document.getElementById('weight-input').value);
        const repInputs = Array.from(document.querySelectorAll('#series-inputs-container input[type="number"]'));
        const repsArray = repInputs.map(input => parseInt(input.value)).filter(val => !isNaN(val));
        const notes = notesInput.value.trim();

        if (repsArray.length === 0 || isNaN(weight) || weight <= 0) {
            alert("Por favor, preencha as repetições para todas as séries e o peso.");
            return;
        }

        const exerciseData = {
            name: exerciseName,
            reps: repsArray,
            weight: weight,
            notes: notes
        };
        
        currentWorkout.push(exerciseData);
        // SALVA O TREINO ATUAL NO LOCALSTORAGE APÓS CADA EXERCÍCIO
        localStorage.setItem('currentWorkout', JSON.stringify(currentWorkout));

        alert(`Exercício "${exerciseName}" salvo! Você pode selecionar outro.`);
        
        document.getElementById('weight-input').value = '';
        repInputs.forEach(input => input.value = '');
    }
    
    function finishAndSaveWorkout() {
        if (currentWorkout.length === 0) {
            alert("Nenhum exercício foi salvo neste treino.");
            return;
        }

        const history = getHistory();
        const newWorkoutEntry = {
            date: new Date().toLocaleDateString('pt-BR'),
            day: daySelect.value,
            exercises: currentWorkout
        };
        history.unshift(newWorkoutEntry);
        localStorage.setItem('workoutHistory', JSON.stringify(history));
        
        currentWorkout = []; // Limpa o treino atual
        // REMOVE O TREINO TEMPORÁRIO DO LOCALSTORAGE APÓS FINALIZAR
        localStorage.removeItem('currentWorkout');

        alert("Treino finalizado e salvo no histórico!");
        loadHistory();
    }

    function getHistory() {
        return JSON.parse(localStorage.getItem('workoutHistory')) || [];
    }

    function loadHistory() {
        const history = getHistory();
        if (history.length === 0) {
            historyContent.innerHTML = '<p>Nenhum treino registrado ainda.</p>';
            return;
        }

        historyContent.innerHTML = history.map(workoutBlock => {
            const workoutDate = workoutBlock.date;
            const workoutDay = workoutBlock.day;
            const exercises = workoutBlock.exercises.map(ex => `
                <div class="history-item">
                    <h4>${ex.name}</h4>
                    <p><strong>Séries:</strong> ${ex.reps.join(', ')} reps</p>
                    <p><strong>Peso:</strong> ${ex.weight} kg</p>
                    <p><strong>Anotações:</strong> ${ex.notes || 'N/A'}</p>
                </div>
            `).join('');
            
            return `
                <div class="history-block">
                    <h2>Treino de ${workoutDay.charAt(0).toUpperCase() + workoutDay.slice(1)} - ${workoutDate}</h2>
                    ${exercises}
                </div>
            `;
        }).join('');
    }

    function toggleHistory() {
        historyLogDiv.classList.toggle('hidden');
        if (!historyLogDiv.classList.contains('hidden')) {
            loadHistory();
        }
    }

    function clearHistory() {
        if (confirm("Tem certeza que deseja apagar TODO o histórico?")) {
            localStorage.removeItem('workoutHistory');
            loadHistory();
        }
    }

    // --- EVENT LISTENERS ---
    daySelect.addEventListener('change', populateExercises);
    exerciseSelect.addEventListener('change', displaySeriesControls);
    saveExerciseBtn.addEventListener('click', saveExercise);
    finishWorkoutBtn.addEventListener('click', finishAndSaveWorkout);
    toggleHistoryBtn.addEventListener('click', toggleHistory);
    clearHistoryBtn.addEventListener('click', clearHistory);

    // --- INICIALIZAÇÃO ---
    function init() {
        populateDays();
        populateExercises();
        loadHistory();

        // CARREGA O TREINO TEMPORÁRIO AO INICIAR A PÁGINA
        const savedWorkout = localStorage.getItem('currentWorkout');
        if (savedWorkout) {
            currentWorkout = JSON.parse(savedWorkout);
            alert("Um treino anterior foi recuperado. Continue de onde parou!");
        }
    }

    init();

    document.addEventListener("DOMContentLoaded", () => {
        const inputs = document.querySelectorAll("input, select, textarea");

        // 🔹 Restaurar valores salvos ao carregar a página
        inputs.forEach(input => {
            const savedValue = localStorage.getItem(input.id);
            if (savedValue !== null) {
                if (input.tagName === "SELECT") {
                    input.value = savedValue;
                } else {
                    input.value = savedValue;
                }
            }
        });

        // 🔹 Salvar automaticamente sempre que houver mudança
        inputs.forEach(input => {
            input.addEventListener("input", () => {
                localStorage.setItem(input.id, input.value);
            });
        });

        // 🔹 Função para limpar os dados salvos (opcional)
        const clearButton = document.getElementById("clear-history-btn");
        if (clearButton) {
            clearButton.addEventListener("click", () => {
                if (confirm("Tem certeza que deseja apagar todo o histórico e os dados dos campos?")) {
                    localStorage.clear();
                    location.reload();
                }
            });
        }
    });
});
