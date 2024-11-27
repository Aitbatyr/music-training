let randomNote = null; // Сохраненная случайная нота
let correctCountForChart = 0;  // Счетчик правильных попыток для графика
let incorrectCountForChart = 0; // Счетчик неправильных попыток для графика
let correctCountTotal = 0;  // Общий счетчик правильных попыток
let incorrectCountTotal = 0; // Общий счетчик неправильных попыток
let attempts = 0; // Общее количество попыток
let correctAttemptsData = []; // Данные для правильных ответов
let incorrectAttemptsData = []; // Данные для неправильных ответов

// Инициализация графика
const ctx = document.getElementById('stats-chart').getContext('2d');
const chart = new Chart(ctx, {
    type: 'line',
    data: {
        labels: [], // Метки для графика
        datasets: [
            {
                label: 'Правильные ответы каждые 10 попыток',
                data: correctAttemptsData,
                borderColor: 'blue',
                fill: false
            },
            {
                label: 'Неправильные ответы каждые 10 попыток',
                data: incorrectAttemptsData,
                borderColor: 'red',
                fill: false
            }
        ]
    },
    options: {
        plugins: {
            legend: {
                display: true,
                position: 'top',
                align: 'start', // Выровнять по левому краю
                labels: {
                    boxWidth: 20, // Ширина прямоугольника
                    padding: 10,  // Отступы между текстом и прямоугольниками
                }
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                max: 10
            }
        }
    }
});

document.querySelectorAll('.key').forEach((key) => {
    key.addEventListener('mousedown', () => {
        if (randomNote) {
            checkGuess(key);
        } else {
            playNoteAndHighlight(key);
        }
    });

    key.addEventListener('mouseup', () => {
        removeHighlight(key);
    });

    key.addEventListener('mouseleave', () => {
        removeHighlight(key);
    });
});

document.getElementById('play-random-note').addEventListener('click', () => {
    resetPiano(); // Убираем подсветку с предыдущих клавиш
    playRandomNote();
});

document.addEventListener('keydown', (event) => {
    const keyMap = {
        'A': 'C',
        'W': 'Cs',
        'S': 'D',
        'E': 'Ds',
        'D': 'E',
        'F': 'F',
        'T': 'Fs',
        'G': 'G',
        'Y': 'Gs',
        'H': 'A',
        'U': 'As',
        'J': 'B'
    };
    const note = keyMap[event.key.toUpperCase()];
    const keyElement = document.querySelector(`div[data-note="${note}"]`);
    if (keyElement) {
        if (randomNote) {
            checkGuess(keyElement);
        } else {
            playNoteAndHighlight(keyElement);
        }
    }
});

function playNoteAndHighlight(keyElement) {
    const note = keyElement.getAttribute('data-note');
    if (note) {
        const audio = new Audio(`sounds/${note}.mp3`);
        audio.play().catch(error => console.error('Ошибка воспроизведения:', error));
    }
    keyElement.classList.add('pressed');

    // Удаляем подсветку через короткий промежуток времени
    setTimeout(() => {
        keyElement.classList.remove('pressed');
    }, 100); // 100 мс задержка перед удалением подсветки
}

function playRandomNote() {
    const notes = ['C', 'Cs', 'D', 'Ds', 'E', 'F', 'Fs', 'G', 'Gs', 'A', 'As', 'B'];
    randomNote = notes[Math.floor(Math.random() * notes.length)]; // Сохраняем случайную ноту
    const audio = new Audio(`sounds/${randomNote}.mp3`);
    audio.play().catch(error => console.error('Ошибка воспроизведения:', error));
}

function checkGuess(keyElement) {
    const guessedNote = keyElement.getAttribute('data-note');
    if (guessedNote === randomNote) {
        keyElement.classList.add('correct'); // Подсветка зеленым
        correctCountForChart++;
        correctCountTotal++;
    } else {
        keyElement.classList.add('incorrect'); // Подсветка красным
        document.querySelector(`div[data-note="${randomNote}"]`).classList.add('correct'); // Подсветка правильной ноты зеленым
        incorrectCountForChart++;
        incorrectCountTotal++;
    }

    // Обновляем счетчики для отображения общего числа попыток
    document.getElementById('correct-count').textContent = correctCountTotal;
    document.getElementById('incorrect-count').textContent = incorrectCountTotal;

    // Увеличиваем количество попыток
    attempts++;

    // Проверяем, достигли ли мы 10 попыток
    if (attempts % 10 === 0) {
        updateChart();
    }

    // Отключаем дальнейшие нажатия
    randomNote = null;
}

function updateChart() {
    // Добавляем количество правильных и неправильных попыток за последние 10 попыток
    correctAttemptsData.push(correctCountForChart);
    incorrectAttemptsData.push(10 - correctCountForChart); // Неправильные попытки = 10 - правильные попытки

    // Если данных больше 10, удаляем самые старые
    if (correctAttemptsData.length > 10) {
        correctAttemptsData.shift();
        incorrectAttemptsData.shift();
    }

    // Обновляем данные графика
    chart.data.labels = correctAttemptsData.map((_, index) => (index + 1) * 10); // Метки по 10 попыток
    chart.data.datasets[0].data = correctAttemptsData;
    chart.data.datasets[1].data = incorrectAttemptsData;
    chart.update();

    // Сбрасываем счетчики правильных и неправильных попыток для графика
    correctCountForChart = 0;
    incorrectCountForChart = 0;
}

function resetPiano() {
    // Убираем все подсветки перед новой попыткой
    document.querySelectorAll('.key').forEach((key) => {
        key.classList.remove('correct', 'incorrect', 'pressed');
    });
}

function removeHighlight(keyElement) {
    keyElement.classList.remove('pressed');
}
