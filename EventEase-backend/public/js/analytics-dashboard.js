// Analytics Dashboard JavaScript
document.addEventListener('DOMContentLoaded', function() {
    const totalEventsElem = document.getElementById('totalEvents');
    const totalAttendeesElem = document.getElementById('totalAttendees');
    const ongoingEventsElem = document.getElementById('ongoingEvents');
    const feedbackScoreElem = document.getElementById('feedbackScore');
    const attendanceChartCanvas = document.getElementById('attendanceChart');
    const refreshButton = document.getElementById('refresh-analytics');

    let attendanceChart; // To hold the Chart.js instance

    // Function to fetch data from the API
    const fetchAnalyticsData = async () => {
        try {
            console.log('Fetching analytics data...');
            const response = await fetch('/api/analytics');
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            console.log('Analytics data received:', data);
            
            if (data.success) {
                updateDashboard(data);
            } else {
                throw new Error(data.error || 'Failed to fetch analytics data');
            }
        } catch (error) {
            console.error('Error fetching analytics data:', error);
            showError('Failed to load analytics data. Please refresh the page.');
        }
    };

    // Function to update DOM elements
    const updateDashboard = (data) => {
        console.log('Updating dashboard with data:', data);
        
        if (totalEventsElem) {
            animateNumber(totalEventsElem, data.total_events || 0);
        }
        if (totalAttendeesElem) {
            animateNumber(totalAttendeesElem, data.total_attendees || 0);
        }
        if (ongoingEventsElem) {
            animateNumber(ongoingEventsElem, data.ongoing_events || 0);
        }
        if (feedbackScoreElem) {
            animateNumber(feedbackScoreElem, data.feedback_score || 0);
        }

        updateChart(data.monthly_attendance || {});
    };

    // Function to initialize or update the Chart.js graph
    const updateChart = (monthlyAttendance) => {
        const labels = Object.keys(monthlyAttendance);
        const data = Object.values(monthlyAttendance);

        if (attendanceChart) {
            // Update existing chart
            attendanceChart.data.labels = labels;
            attendanceChart.data.datasets[0].data = data;
            attendanceChart.update();
        } else {
            // Initialize new chart
            if (attendanceChartCanvas) {
                const ctx = attendanceChartCanvas.getContext('2d');
                attendanceChart = new Chart(ctx, {
                    type: 'line',
                    data: {
                        labels: labels,
                        datasets: [{
                            label: 'Monthly Attendance',
                            data: data,
                            borderColor: '#4A56E2',
                            backgroundColor: 'rgba(74, 86, 226, 0.2)',
                            fill: true,
                            tension: 0.3
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            legend: {
                                display: true,
                                position: 'top',
                            },
                            title: {
                                display: true,
                                text: 'Monthly Event Attendance'
                            }
                        },
                        scales: {
                            y: {
                                beginAtZero: true,
                                title: {
                                    display: true,
                                    text: 'Number of Attendees'
                                }
                            },
                            x: {
                                title: {
                                    display: true,
                                    text: 'Month'
                                }
                            }
                        }
                    }
                });
            }
        }
    };

    // Animate number changes
    const animateNumber = (element, newValue) => {
        const currentValue = parseInt(element.textContent) || 0;
        
        if (currentValue === newValue) return;
        
        const duration = 1000;
        const startTime = performance.now();
        
        function updateNumber(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            const current = Math.round(currentValue + (newValue - currentValue) * progress);
            element.textContent = current;
            
            if (progress < 1) {
                requestAnimationFrame(updateNumber);
            }
        }
        
        requestAnimationFrame(updateNumber);
    };

    // Show error message
    const showError = (message) => {
        // Create error notification
        const errorDiv = document.createElement('div');
        errorDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #FEE2E2;
            color: #DC2626;
            padding: 12px 20px;
            border-radius: 8px;
            border: 1px solid #FECACA;
            z-index: 1000;
            font-size: 14px;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        `;
        errorDiv.textContent = message;
        
        document.body.appendChild(errorDiv);
        
        // Remove after 5 seconds
        setTimeout(() => {
            if (errorDiv.parentNode) {
                errorDiv.parentNode.removeChild(errorDiv);
            }
        }, 5000);
    };

    // Refresh button event listener
    if (refreshButton) {
        refreshButton.addEventListener('click', fetchAnalyticsData);
    }

    // Fetch data initially
    fetchAnalyticsData();

    // Fetch data every 30 seconds
    setInterval(fetchAnalyticsData, 30000);
});