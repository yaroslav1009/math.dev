let chart; // Global variable to store the chart instance

// Event handler for form submission
document.getElementById('dataForm').addEventListener('submit', function (event) {
    event.preventDefault(); // Prevent default form submission behavior

    // Retrieve values from the form
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
    displayStatistics(expectedValue.toFixed(2), variance.toFixed(2), standardDeviation.toFixed(2));

    // Render the chart based on the array data, including the mean line
    drawChart(array.map(num => parseFloat(num.toFixed(2))), parseFloat(expectedValue.toFixed(2)));

    // Event handler for exporting data to Excel
    document.getElementById('exportBtn').onclick = function () {
        exportToExcel(array, expectedValue, variance, standardDeviation);
    };

    // Task 2: Estimate the expected value and variance for a larger population (X)
    const estimatedExpectedValue = expectedValue; // Estimated mean for X
    const estimatedVariance = variance; // Estimated variance for X

    console.log(`Estimated Expected Value for larger sample (X): ${estimatedExpectedValue.toFixed(2)}`);
    console.log(`Estimated Variance for larger sample (X): ${estimatedVariance.toFixed(2)}`);

    // Task 3: Calculate the confidence interval for a 95% confidence level
    const confidenceInterval = calculateConfidenceInterval(expectedValue, standardDeviation, numberElem, 0.95);
    console.log(`95% Confidence Interval: ${confidenceInterval[0].toFixed(2)} to ${confidenceInterval[1].toFixed(2)}`);
    displayConfidenceInterval(confidenceInterval.map(num => num.toFixed(2)));
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

// Function to calculate the confidence interval
function calculateConfidenceInterval(mean, stdDev, n, confidenceLevel) {
    const z = 1.96; // Z-score for a 95% confidence interval
    const marginOfError = z * (stdDev / Math.sqrt(n));
    return [mean - marginOfError, mean + marginOfError];
}

// Function to display the generated array
function displayArray(array) {
    document.getElementById('generatedArray').textContent = array.map(num => num.toFixed(2)).join(', ');
}

// Function to display statistical data
function displayStatistics(expectedValue, variance, standardDeviation) {
    // Display in a specific section for expected value
    document.getElementById('expectedValue').textContent = `Expected Value: ${expectedValue}`;
    
    // Display other statistical data
    document.getElementById('statistics').innerHTML = `
        Variance: ${variance}<br>
        Standard Deviation: ${standardDeviation}
    `;
}

// Function to display the confidence interval
function displayConfidenceInterval(confidenceInterval) {
    const [lowerLimit, upperLimit] = confidenceInterval;
    document.getElementById('statistics').innerHTML += `
        <br>95% Confidence Interval: ${lowerLimit} to ${upperLimit}
    `;
}

// Function to create and display a chart using Chart.js
function drawChart(array, expectedValue) {
    const ctx = document.getElementById('chart').getContext('2d');
    
    if (chart) {
        chart.destroy(); // Destroy the previous chart if it exists
    }

    // Create the mean line data
    const meanLineData = Array(array.length).fill(expectedValue); // Array of the same value (expectedValue)

    chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: array.map((_, index) => index + 1), // Labels for the x-axis
            datasets: [{
                label: 'Array Values', // Label for the data
                data: array, // Data for the chart
                borderColor: 'rgba(75, 192, 192, 1)', // Line color
                borderWidth: 1,
                fill: false
            },
            {
                label: 'Expected Value', // Label for the mean line
                data: meanLineData, // Mean line data
                borderColor: 'rgba(255, 99, 132, 1)', // Color of the mean line
                borderWidth: 1,
                borderDash: [5, 5], // Dashed line
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
    // Prepare data for Excel
    const data = [
        { Index: 'Data', Value: '' }, // A header or description
        ...array.map((value, index) => ({ Index: index + 1, Value: value.toFixed(2) })), // Array data
        { Index: '', Value: '' }, // Blank row for separation
        { Index: 'Expected Value', Value: expectedValue.toFixed(2) },
        { Index: 'Variance', Value: variance.toFixed(2) },
        { Index: 'Standard Deviation', Value: standardDeviation.toFixed(2) }
    ];

    // Create a worksheet and workbook
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Data');

    // Write the workbook to a file
    XLSX.writeFile(workbook, 'data.xlsx'); // Save the file

    // Note: Creating a chart in Excel programmatically using JavaScript is complex and often not supported directly. You may need to add the chart manually in Excel using the data provided.
}

