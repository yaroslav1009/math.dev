let chart; // Глобальная переменная для хранения ссылки на объект графика

// Обработчик события отправки формы
document.getElementById('dataForm').addEventListener('submit', function (event) {
    event.preventDefault(); // Предотвращаем стандартное поведение формы

    // Получаем значения из формы
    const basicVal = parseInt(document.getElementById('basicVal').value);
    const tolVal = parseFloat(document.getElementById('tolVal').value);
    const numberElem = parseInt(document.getElementById('numberElem').value);

    // Генерируем массив и рассчитываем статистические показатели
    const array = generateArray(basicVal, tolVal, numberElem);
    const expectedValue = calculateExpectedValue(array);
    const variance = calculateVariance(array, expectedValue);
    const standardDeviation = calculateStandardDeviation(variance);

    // Отображаем сгенерированный массив и статистику
    displayArray(array);
    displayStatistics(expectedValue, variance, standardDeviation);

    // Рисуем график на основе данных массива
    drawChart(array);

    // Обработчик для экспорта данных в Excel
    document.getElementById('exportBtn').onclick = function () {
        exportToExcel(array, expectedValue, variance, standardDeviation);
    };
});

// Функция для генерации массива значений с шумом
function generateArray(basicVal, tolVal, numberElem) {
    const array = [];
    for (let i = 0; i < numberElem; i++) {
        const noise = Math.random() * tolVal * 2 - tolVal; // Генерация шума в пределах ±tolVal
        array.push(basicVal + noise); // Добавляем базовое значение с шумом
    }
    return array;
}

// Функция для вычисления математического ожидания (среднего значения)
function calculateExpectedValue(array) {
    const sum = array.reduce((acc, val) => acc + val, 0); // Суммируем все значения
    return sum / array.length; // Делим на количество элементов для получения среднего
}

// Функция для вычисления дисперсии
function calculateVariance(array, expectedValue) {
    const sum = array.reduce((acc, val) => acc + Math.pow(val - expectedValue, 2), 0);
    return sum / array.length; // Возвращаем среднее значение квадратов отклонений
}

// Функция для вычисления стандартного отклонения
function calculateStandardDeviation(variance) {
    return Math.sqrt(variance); // Корень квадратный из дисперсии
}

// Функция для отображения сгенерированного массива
function displayArray(array) {
    document.getElementById('generatedArray').textContent = array.join(', ');
}

// Функция для отображения статистических данных
function displayStatistics(expectedValue, variance, standardDeviation) {
    document.getElementById('statistics').innerHTML = `
        Expected Value: ${expectedValue}<br>
        Variance: ${variance}<br>
        Standard Deviation: ${standardDeviation}
    `;
}

// Функция для создания и отображения графика с использованием Chart.js
function drawChart(array) {
    const ctx = document.getElementById('chart').getContext('2d');
    
    if (chart) {
        chart.destroy(); // Уничтожаем предыдущий график, если он существует
    }
    
    chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: array.map((_, index) => index + 1), // Метки на оси X
            datasets: [{
                label: 'Array Values', // Название графика
                data: array, // Данные для графика
                borderColor: 'rgba(75, 192, 192, 1)', // Цвет линии
                borderWidth: 1,
                fill: false
            }]
        },
        options: {
            responsive: true,
            scales: {
                x: {
                    display: true,
                    title: {
                        display: true,
                        text: 'Index'
                    }
                },
                y: {
                    display: true,
                    title: {
                        display: true,
                        text: 'Value'
                    }
                }
            }
        }
    });
}

// Функция для экспорта данных в файл Excel
function exportToExcel(array, expectedValue, variance, standardDeviation) {
    const worksheet = XLSX.utils.json_to_sheet([
        { Index: '', Value: '' },
        ...array.map((value, index) => ({ Index: index + 1, Value: value })), // Данные массива
        { Index: 'Expected Value', Value: expectedValue },
        { Index: 'Variance', Value: variance },
        { Index: 'Standard Deviation', Value: standardDeviation }
    ]);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Data');
    XLSX.writeFile(workbook, 'data.xlsx'); // Сохранение файла
}
