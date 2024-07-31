let chart; // Global variable to store the chart instance

// Form submission event handler
document.getElementById('dataForm').addEventListener('submit', function (event) {
    event.preventDefault(); // Prevent default form submission behavior

    // Get values from the form
    const basicVal = parseInt(document.getElementById('basicVal').value);
    const tolVal = parseFloat(document.getElementById('tolVal').value);
    const numberElem = parseInt(document.getElementById('numberElem').value);

    // Generate array and calculate statistical metrics
    const array = generateArray(basicVal, tolVal, numberElem);
    const expectedValue = calculateExpectedValue(array);
    const variance = calculateVariance(array, expectedValue);
    const standardDeviation = calculateStandardDeviation(variance);

    // Display the generated array and statistics
    displayArray(array);
    displayStatistics(expectedValue, variance, standardDeviation);

    // Draw the chart based on the array data
    drawChart(array);

    // Event handler for exporting data to Excel
    document.getElementById('exportBtn').onclick = function () {
        exportToExcel(array, expectedValue, variance, standardDeviation);
    };
});

// Function to generate an array of values with noise
function generateArray(basicVal, tolVal, numberElem) {
    const array = [];
    for (let i = 0; i < numberElem; i++) {
        const noise = Math.random() * tolVal * 2 - tolVal; // Generate noise within ±tolVal
        array.push(basicVal + noise); // Add the basic value with noise
    }
    return array;
}

// Function to calculate the expected value (mean)
function calculateExpectedValue(array) {
    const sum = array.reduce((acc, val) => acc + val, 0); // Sum all values
    return sum / array.length; // Divide by the number of elements to get the mean
}

// Function to calculate variance
function calculateVariance(array, expectedValue) {
    const sum = array.reduce((acc, val) => acc + Math.pow(val - expectedValue, 2), 0);
    return sum / array.length; // Return the mean of squared deviations
}

// Function to calculate standard deviation
function calculateStandardDeviation(variance) {
    return Math.sqrt(variance); // Square root of variance
}

// Function to display the generated array
function displayArray(array) {
    document.getElementById('generatedArray').textContent = array.join(', ');
}

// Function to display statistical data
function displayStatistics(expectedValue, variance, standardDeviation) {
    document.getElementById('statistics').innerHTML = `
        Expected Value: ${expectedValue}<br>
        Variance: ${variance}<br>
        Standard Deviation: ${standardDeviation}
    `;
}

// Function to create and display a chart using Chart.js
function drawChart(array) {
    const ctx = document.getElementById('chart').getContext('2d');
    
    if (chart) {
        chart.destroy(); // Destroy the previous chart if it exists
    }
    
    chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: array.map((_, index) => index + 1), // Labels for the x-axis
            datasets: [{
                label: 'Array Values', // Chart label
                data: array, // Data for the chart
                borderColor: 'rgba(75, 192, 192, 1)', // Line color
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

// Function to export data to an Excel file
function exportToExcel(array, expectedValue, variance, standardDeviation) {
    const worksheet = XLSX.utils.json_to_sheet([
        { Index: '', Value: '' },
        ...array.map((value, index) => ({ Index: index + 1, Value: value })), // Array data
        { Index: 'Expected Value', Value: expectedValue },
        { Index: 'Variance', Value: variance },
        { Index: 'Standard Deviation', Value: standardDeviation }
    ]);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Data');
    XLSX.writeFile(workbook, 'data.xlsx'); // Save the file
}
