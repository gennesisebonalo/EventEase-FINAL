<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>RFID Attendance - EventEase</title>
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
    <style>
        :root {
            --primary: #5d5fef;
            --primary-hover: #4b4dbf;
            --bg-primary: #0f172a;
            --bg-secondary: #1e293b;
            --bg-card: #1e293b;
            --text-primary: #f8fafc;
            --text-secondary: #94a3b8;
            --border-color: #334155;
            --success: #10b981;
            --warning: #f59e0b;
            --danger: #ef4444;
            --info: #3b82f6;
        }

        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            justify-content: center;
            align-items: center;
            padding: 20px;
        }

        .container {
            background: white;
            border-radius: 20px;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
            padding: 40px;
            max-width: 700px;
            width: 100%;
        }

        h1 {
            color: #333;
            margin-bottom: 10px;
            font-size: 2rem;
        }

        .subtitle {
            color: #666;
            margin-bottom: 30px;
            font-size: 1rem;
        }

        .status {
            padding: 15px;
            border-radius: 10px;
            margin-bottom: 20px;
            text-align: center;
            font-weight: 600;
        }

        .status.waiting {
            background: #e3f2fd;
            color: #1976d2;
            border: 2px solid #1976d2;
        }

        .status.scanning {
            background: #fff3e0;
            color: #f57c00;
            border: 2px solid #f57c00;
        }

        .status.success {
            background: #e8f5e9;
            color: #388e3c;
            border: 2px solid #388e3c;
        }

        .status.error {
            background: #ffebee;
            color: #c62828;
            border: 2px solid #c62828;
        }

        .input-group {
            margin-bottom: 20px;
        }

        label {
            display: block;
            margin-bottom: 8px;
            color: #333;
            font-weight: 600;
        }

        input, select {
            width: 100%;
            padding: 12px;
            border: 2px solid #ddd;
            border-radius: 8px;
            font-size: 1rem;
            transition: border-color 0.3s;
        }

        input:focus, select:focus {
            outline: none;
            border-color: #667eea;
        }

        .rfid-input {
            font-size: 1.5rem;
            font-weight: bold;
            text-align: center;
            letter-spacing: 2px;
            background: #f5f5f5;
        }

        .info-box {
            background: #f8f9fa;
            padding: 15px;
            border-radius: 10px;
            margin-bottom: 20px;
            border-left: 4px solid #667eea;
        }

        .info-box p {
            margin: 5px 0;
            color: #555;
        }

        .last-scan {
            margin-top: 20px;
            padding: 15px;
            background: #f0f0f0;
            border-radius: 10px;
        }

        .last-scan h3 {
            margin-bottom: 10px;
            color: #333;
        }

        .last-scan-info {
            color: #666;
            font-size: 0.9rem;
        }

        .instructions {
            background: #fff9c4;
            padding: 15px;
            border-radius: 10px;
            margin-bottom: 20px;
            border-left: 4px solid #fbc02d;
        }

        .instructions h3 {
            margin-bottom: 10px;
            color: #333;
        }

        .instructions ul {
            margin-left: 20px;
            color: #555;
        }

        .instructions li {
            margin: 5px 0;
        }

        .btn {
            padding: 12px 24px;
            border-radius: 8px;
            border: none;
            cursor: pointer;
            font-size: 1rem;
            font-weight: 600;
            transition: all 0.2s ease;
            width: 100%;
            margin-top: 10px;
        }

        .btn-primary {
            background: #667eea;
            color: white;
        }

        .btn-primary:hover {
            background: #5568d3;
        }

        .event-card {
            background: #f0f7ff;
            padding: 15px;
            border-radius: 10px;
            border-left: 4px solid #667eea;
            margin-bottom: 15px;
        }

        .event-card h4 {
            color: #667eea;
            margin-bottom: 5px;
        }

        .event-card p {
            color: #666;
            font-size: 0.9rem;
            margin: 3px 0;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>📋 RFID Attendance</h1>
        <p class="subtitle">Event Check-in System</p>

        <div id="status" class="status waiting">
            ⏳ Select an event and tap student ID card...
        </div>

        <div class="instructions">
            <h3>📋 Instructions:</h3>
            <ul>
                <li><strong>Step 1:</strong> Select an event from the dropdown below</li>
                <li><strong>Step 2:</strong> Click on the "Tap Student ID Card" area</li>
                <li><strong>Step 3:</strong> Tap the student's ID card on the RFID reader</li>
                <li><strong>Step 4:</strong> The system will automatically check them in</li>
            </ul>
        </div>

        <div class="input-group">
            <label for="eventId">Select Event:</label>
            <select id="eventId" style="width: 100%; padding: 12px; border: 2px solid #ddd; border-radius: 8px; font-size: 1rem; background: white; cursor: pointer;" tabindex="0">
                <option value="">-- Select an event --</option>
                @forelse($events as $event)
                    <option value="{{ $event->id }}">{{ $event->title }}</option>
                @empty
                    <option value="">No events available</option>
                @endforelse
            </select>
            <button 
                onclick="loadEvents()" 
                style="margin-top: 10px; padding: 8px 16px; background: #667eea; color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 0.875rem;"
            >
                🔄 Refresh Events
            </button>
        </div>

        <div id="selectedEventInfo" style="display: none;" class="event-card">
            <h4 id="eventTitle"></h4>
            <p id="eventDate"></p>
            <p id="eventVenue"></p>
        </div>

        <div class="input-group" style="background: #f0f7ff; padding: 20px; border-radius: 12px; border: 2px solid #667eea; margin-bottom: 20px;">
            <label style="font-weight: 600; color: #333; margin-bottom: 8px; display: block;">Tap Student ID Card Here:</label>
            <input 
                type="text" 
                id="rfidInput" 
                class="rfid-input" 
                placeholder="Tap student ID card here..."
                autocomplete="off"
                autofocus
                style="width: 100%; padding: 12px; border: 2px solid #667eea; border-radius: 8px; font-size: 1.1rem; background: white; text-align: center; font-weight: 600; letter-spacing: 1px; display: none;"
            >
            <div id="tapArea" style="width: 100%; padding: 40px; border: 3px solid #667eea; border-radius: 8px; text-align: center; background: #f0f7ff; transition: all 0.3s;">
                <i class="fas fa-id-card" style="font-size: 3rem; color: #667eea; margin-bottom: 10px;"></i>
                <p style="font-size: 1.1rem; color: #667eea; font-weight: 600; margin: 0;">Ready to Scan</p>
                <p style="font-size: 0.875rem; color: #666; margin-top: 5px;" id="tapAreaStatus">Tap student ID card now</p>
            </div>
            <p style="margin: 8px 0 0 0; font-size: 0.75rem; color: #666; font-style: italic;">
                The system will automatically detect the card when tapped - no clicking needed
            </p>
        </div>

        <div class="info-box">
            <p><strong>Status:</strong> <span id="connectionStatus">Ready</span></p>
            <p><strong>Current Event:</strong> <span id="currentEvent">None selected</span></p>
        </div>

        <div class="last-scan" id="lastScan" style="display: none;">
            <h3>Last Check-in Result:</h3>
            <div class="last-scan-info" id="lastScanInfo"></div>
        </div>

        <!-- Toast Notification -->
        <div id="toast" style="display: none; position: fixed; top: 20px; right: 20px; background: white; padding: 20px; border-radius: 10px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); z-index: 10000; max-width: 400px; border-left: 4px solid #667eea;">
            <div style="display: flex; align-items: center; gap: 10px;">
                <i id="toastIcon" style="font-size: 1.5rem;"></i>
                <div style="flex: 1;">
                    <p id="toastMessage" style="margin: 0; font-weight: 600; color: #333;"></p>
                </div>
                <button onclick="closeToast()" style="background: none; border: none; font-size: 1.2rem; cursor: pointer; color: #666;">&times;</button>
            </div>
        </div>
    </div>

    <script>
        const apiBaseUrl = window.location.origin;
        let currentEventId = null;
        let currentEventData = null;
        let rfidBuffer = '';
        let lastKeyTime = 0;
        const RFID_TIMEOUT = 100;
        let eventSelectionLocked = false; // Prevent event from changing during processing
        let preventChangeEvent = false; // Flag to prevent change event from firing

        // Load events on page load - using same endpoint as admin panel
        async function loadEvents() {
            try {
                updateStatus('waiting', 'Loading events...');
                const select = document.getElementById('eventId');
                select.innerHTML = '<option value="">-- Loading events... --</option>';
                select.disabled = true;
                
                // Use the same endpoint as admin panel to get all events
                const response = await fetch(`${apiBaseUrl}/api/events/list?per_page=1000`);
                
                if (!response.ok) {
                    const errorText = await response.text();
                    console.error('API Error Response:', errorText);
                    throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
                }
                
                const result = await response.json();
                console.log('Events API response:', result);
                
                // Handle response format from /api/events/list
                let events = [];
                if (result.success && result.data && result.data.events && Array.isArray(result.data.events)) {
                    events = result.data.events;
                } else if (result.data && Array.isArray(result.data)) {
                    events = result.data;
                } else if (Array.isArray(result)) {
                    events = result;
                }
                
                console.log(`Found ${events.length} events`);
                
                select.disabled = false;
                select.innerHTML = '<option value="">-- Select an event --</option>';
                
                if (events.length === 0) {
                    select.innerHTML = '<option value="">No events available</option>';
                    updateStatus('waiting', 'No events found. Please create an event first.');
                    showToast('No events found. Please create an event in the admin panel.', 'warning');
                    return;
                }
                
                // Sort events by start_time (upcoming first)
                events.sort((a, b) => {
                    const dateA = a.start_time ? new Date(a.start_time) : new Date(0);
                    const dateB = b.start_time ? new Date(b.start_time) : new Date(0);
                    return dateA - dateB;
                });
                
                events.forEach(event => {
                    const option = document.createElement('option');
                    option.value = event.id;
                    option.textContent = event.title;
                    select.appendChild(option);
                });
                
                updateStatus('waiting', 'Select an event and tap student card...');
                showToast(`Loaded ${events.length} event(s)`, 'success');
            } catch (error) {
                console.error('Error loading events:', error);
                const select = document.getElementById('eventId');
                select.disabled = false;
                select.innerHTML = '<option value="">Error loading events</option>';
                updateStatus('error', `Failed to load events: ${error.message}`);
                showToast(`Failed to load events: ${error.message}`, 'error');
            }
        }

        // Handle event selection
        const eventSelect = document.getElementById('eventId');
        let preventChangeEvent = false;
        
        // Store the original change handler
        const originalChangeHandler = function(e) {
            // Block change event if processing or if we're preventing it
            if (isProcessing || preventChangeEvent || eventSelectionLocked) {
                console.log('Event change blocked - processing attendance or locked');
                // Immediately restore previous selection
                if (currentEventId) {
                    preventChangeEvent = true;
                    e.target.value = currentEventId;
                    // Force update after a brief delay to ensure it sticks
                    setTimeout(() => {
                        if (e.target.value !== currentEventId) {
                            e.target.value = currentEventId;
                        }
                        preventChangeEvent = false;
                    }, 50);
                }
                e.preventDefault();
                e.stopPropagation();
                return false;
            }
            
            const newEventId = e.target.value;
            console.log('Event changed from', currentEventId, 'to', newEventId);
            
            // Store the selected event ID
            currentEventId = newEventId;
            const select = e.target;
            const selectedOption = select.options[select.selectedIndex];
            
            if (currentEventId) {
                // Fetch event details using same endpoint as admin panel
                fetch(`${apiBaseUrl}/api/events/list?per_page=1000`)
                    .then(res => {
                        if (!res.ok) {
                            throw new Error(`HTTP error! status: ${res.status}`);
                        }
                        return res.json();
                    })
                    .then(result => {
                        // Handle response format from /api/events/list
                        let events = [];
                        if (result.success && result.data && result.data.events && Array.isArray(result.data.events)) {
                            events = result.data.events;
                        } else if (result.data && Array.isArray(result.data)) {
                            events = result.data;
                        } else if (Array.isArray(result)) {
                            events = result;
                        }
                        
                        currentEventData = events.find(e => String(e.id) === String(currentEventId));
                        
                        if (currentEventData) {
                            document.getElementById('selectedEventInfo').style.display = 'block';
                            document.getElementById('eventTitle').textContent = currentEventData.title;
                            document.getElementById('eventDate').textContent = 
                                `Date: ${new Date(currentEventData.start_time).toLocaleString()} - ${new Date(currentEventData.end_time).toLocaleTimeString()}`;
                            document.getElementById('eventVenue').textContent = `Venue: ${currentEventData.location || 'N/A'}`;
                        }
                        
                        document.getElementById('currentEvent').textContent = selectedOption.textContent;
                        updateStatus('waiting', 'Ready for student card tap...');
                        // Auto-focus input after event selection
                        setTimeout(() => {
                            rfidInput.focus();
                        }, 100);
                    })
                    .catch(error => {
                        console.error('Error fetching event details:', error);
                        updateStatus('error', 'Failed to load event details');
                    });
            } else {
                document.getElementById('selectedEventInfo').style.display = 'none';
                document.getElementById('currentEvent').textContent = 'None selected';
                updateStatus('waiting', 'Select an event and tap student card...');
            }
        });

        // Handle RFID input
        const rfidInput = document.getElementById('rfidInput');
        let isProcessing = false;
        
        // Prevent any keyboard input from affecting the event dropdown
        document.addEventListener('keydown', function(e) {
            // If RFID input is focused, prevent event dropdown from receiving focus
            if (document.activeElement === rfidInput) {
                // Allow normal RFID input processing
                return;
            }
        }, true);
        
        function logDebug(message) {
            console.log('[RFID Debug]', message);
        }
        
        rfidInput.addEventListener('keydown', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                if (!isProcessing) {
                    processAttendance();
                }
                return;
            }

            const currentTime = Date.now();
            
            if (currentTime - lastKeyTime > RFID_TIMEOUT) {
                logDebug('Resetting buffer - new scan detected');
                rfidBuffer = '';
                // Don't display chip ID
            }
            
            if (e.key.length === 1) {
                if (/[a-zA-Z0-9\-_]/.test(e.key)) {
                    const timeSinceLastKey = currentTime - lastKeyTime;
                    if (timeSinceLastKey < 50 || rfidBuffer.length === 0) {
                        rfidBuffer += e.key;
                        // Don't display chip ID in input field
                        lastKeyTime = currentTime;
                        updateStatus('scanning', 'Scanning card...');
                        // Update tap area visual feedback
                        const tapArea = document.getElementById('tapArea');
                        const tapAreaStatus = document.getElementById('tapAreaStatus');
                        tapArea.style.borderColor = '#f59e0b';
                        tapArea.style.background = '#fff9e6';
                        tapAreaStatus.textContent = 'Scanning...';
                        logDebug(`Buffer: "${rfidBuffer}"`);
                    }
                }
            }
            
            clearTimeout(window.rfidTimeout);
            const timeSinceLastKey = currentTime - lastKeyTime;
            if (timeSinceLastKey < 50) {
                window.rfidTimeout = setTimeout(() => {
                    if (rfidBuffer.length >= 4 && !isProcessing) {
                        logDebug(`Auto-processing: "${rfidBuffer}"`);
                        processAttendance();
                    }
                }, RFID_TIMEOUT + 100);
            }
        });

        rfidInput.addEventListener('input', function(e) {
            const value = e.target.value;
            const currentTime = Date.now();
            
            logDebug(`Input event: value="${value}", length=${value.length}`);
            
            if (value.length > rfidBuffer.length) {
                rfidBuffer = value;
                lastKeyTime = currentTime;
                updateStatus('scanning', 'Scanning card...');
                // Clear the visible input
                rfidInput.value = '';
                // Update tap area visual feedback
                const tapArea = document.getElementById('tapArea');
                const tapAreaStatus = document.getElementById('tapAreaStatus');
                tapArea.style.borderColor = '#f59e0b';
                tapArea.style.background = '#fff9e6';
                tapAreaStatus.textContent = 'Scanning...';
                
                clearTimeout(window.rfidTimeout);
                window.rfidTimeout = setTimeout(() => {
                    if (rfidBuffer.length >= 4 && !isProcessing) {
                        logDebug(`Auto-processing from input: "${rfidBuffer}"`);
                        processAttendance();
                    }
                }, RFID_TIMEOUT + 100);
            }
        });

        // Process attendance check-in
        async function processAttendance() {
            if (isProcessing) {
                logDebug('Already processing, skipping...');
                return;
            }
            
            // Lock event selection during processing
            isProcessing = true;
            eventSelectionLocked = true;
            preventChangeEvent = true;
            
            // Ensure event dropdown is disabled during processing and preserve value
            const eventSelect = document.getElementById('eventId');
            // Store current value and selected index before disabling
            const currentValue = eventSelect.value;
            const currentIndex = eventSelect.selectedIndex;
            if (currentValue && !currentEventId) {
                currentEventId = currentValue;
            }
            
            // Disable dropdown to prevent changes - use multiple methods
            eventSelect.disabled = true;
            eventSelect.style.pointerEvents = 'none';
            eventSelect.style.opacity = '0.6';
            eventSelect.setAttribute('readonly', 'readonly');
            eventSelect.tabIndex = -1;
            
            // Prevent dropdown from opening by blocking all interaction events
            const preventInteraction = function(e) {
                if (isProcessing || eventSelectionLocked) {
                    e.preventDefault();
                    e.stopPropagation();
                    e.stopImmediatePropagation();
                    eventSelect.blur();
                    return false;
                }
            };
            
            // Add event listeners to prevent dropdown from opening
            ['mousedown', 'click', 'focus', 'keydown', 'keyup', 'keypress'].forEach(eventType => {
                eventSelect.addEventListener(eventType, preventInteraction, true);
            });
            
            // Store the selected option text for restoration
            const selectedOptionText = currentIndex > 0 ? eventSelect.options[currentIndex].textContent : null;
            
            let chipId = rfidBuffer.trim() || document.getElementById('rfidInput').value.trim();
            
            logDebug(`Processing attendance for chip ID: "${chipId}"`);
            
            if (!chipId) {
                updateStatus('error', 'No RFID card ID detected. Please tap the card.');
                isProcessing = false;
                return;
            }

            if (!currentEventId) {
                updateStatus('error', 'Please select an event first.');
                const tapArea = document.getElementById('tapArea');
                const tapAreaStatus = document.getElementById('tapAreaStatus');
                tapArea.style.borderColor = '#ef4444';
                tapArea.style.background = '#fee2e2';
                tapAreaStatus.textContent = 'Please select an event first';
                isProcessing = false;
                eventSelectionLocked = false;
                setTimeout(() => {
                    tapArea.style.borderColor = '#667eea';
                    tapArea.style.background = '#f0f7ff';
                    tapAreaStatus.textContent = 'Tap student ID card now';
                    rfidInput.focus();
                }, 2000);
                return;
            }
            
            // Log current event to debug
            console.log('Processing attendance for event ID:', currentEventId);
            console.log('Event dropdown value:', document.getElementById('eventId').value);

            chipId = chipId.replace(/[^a-zA-Z0-9\-_]/g, '');
            rfidBuffer = chipId;
            // Don't display chip ID in input field
            document.getElementById('rfidInput').value = '';

            try {
                updateStatus('scanning', 'Processing check-in...');
                const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';
                
                const response = await fetch(`${apiBaseUrl}/api/attendance/rfid-complete-by-card`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                        'X-CSRF-TOKEN': csrfToken
                    },
                    body: JSON.stringify({
                        rfid_card_id: chipId,
                        event_id: currentEventId
                    })
                });

                const result = await response.json();

                if (result.success) {
                    const displayId = result.data.printed_id || chipId;
                    const successMsg = `✓ Check-in successful!\n\nStudent: ${result.data.user_name}\nID: ${displayId}\nEvent: ${currentEventData?.title || 'N/A'}`;
                    updateStatus('success', `✓ ${result.data.user_name} checked in successfully!`);
                    showLastScan(chipId, `${result.data.user_name} - ID: ${displayId}`, true);
                    
                    // Update tap area visual feedback for success
                    const tapArea = document.getElementById('tapArea');
                    const tapAreaStatus = document.getElementById('tapAreaStatus');
                    tapArea.style.borderColor = '#10b981';
                    tapArea.style.background = '#f0fdf4';
                    tapAreaStatus.textContent = `✓ ${result.data.user_name} checked in!`;
                    
                    // Show toast notification instead of alert
                    showToast(`✓ ${result.data.user_name} checked in successfully!`, 'success');
                    
                    setTimeout(() => {
                        rfidInput.value = '';
                        rfidBuffer = '';
                        isProcessing = false;
                        eventSelectionLocked = false;
                        preventChangeEvent = true;
                        
                        // Re-enable event dropdown and restore selected value
                        const eventSelectEl = document.getElementById('eventId');
                        eventSelectEl.disabled = false;
                        eventSelectEl.style.pointerEvents = 'auto';
                        eventSelectEl.style.opacity = '1';
                        eventSelectEl.removeAttribute('readonly');
                        eventSelectEl.tabIndex = 0;
                        
                        // Force restore the value
                        if (currentEventId) {
                            eventSelectEl.value = currentEventId;
                            // Double-check after a brief delay
                            setTimeout(() => {
                                if (eventSelectEl.value !== currentEventId) {
                                    eventSelectEl.value = currentEventId;
                                }
                                preventChangeEvent = false;
                            }, 100);
                        } else {
                            preventChangeEvent = false;
                        }
                        
                        updateStatus('waiting', 'Ready for next student card tap...');
                        // Reset tap area
                        tapArea.style.borderColor = '#667eea';
                        tapArea.style.background = '#f0f7ff';
                        tapAreaStatus.textContent = 'Tap student ID card now';
                        // Auto-focus for next tap (ensure event dropdown doesn't get focus)
                        setTimeout(() => {
                            rfidInput.focus();
                            // Force event dropdown to not be focused
                            if (document.activeElement === eventSelectEl) {
                                rfidInput.focus();
                            }
                        }, 100);
                    }, 2000);
                } else {
                    updateStatus('error', result.message || 'Check-in failed');
                    showLastScan(chipId, result.message || 'Failed', false);
                    
                    // Update tap area visual feedback for error
                    const tapArea = document.getElementById('tapArea');
                    const tapAreaStatus = document.getElementById('tapAreaStatus');
                    tapArea.style.borderColor = '#ef4444';
                    tapArea.style.background = '#fee2e2';
                    tapAreaStatus.textContent = result.message || 'Check-in failed';
                    
                    // Show toast notification instead of alert
                    showToast(result.message || 'Check-in failed', 'error');
                    
                    setTimeout(() => {
                        isProcessing = false;
                        eventSelectionLocked = false;
                        preventChangeEvent = true;
                        
                        // Re-enable event dropdown and restore selected value
                        const eventSelectEl = document.getElementById('eventId');
                        eventSelectEl.disabled = false;
                        eventSelectEl.style.pointerEvents = 'auto';
                        eventSelectEl.style.opacity = '1';
                        eventSelectEl.removeAttribute('readonly');
                        eventSelectEl.tabIndex = 0;
                        
                        // Force restore the value
                        if (currentEventId) {
                            eventSelectEl.value = currentEventId;
                            // Double-check after a brief delay
                            setTimeout(() => {
                                if (eventSelectEl.value !== currentEventId) {
                                    eventSelectEl.value = currentEventId;
                                }
                                preventChangeEvent = false;
                            }, 100);
                        } else {
                            preventChangeEvent = false;
                        }
                        
                        updateStatus('waiting', 'Ready for next student card tap...');
                        // Reset tap area
                        tapArea.style.borderColor = '#667eea';
                        tapArea.style.background = '#f0f7ff';
                        tapAreaStatus.textContent = 'Tap student ID card now';
                        // Auto-focus for next tap (ensure event dropdown doesn't get focus)
                        setTimeout(() => {
                            rfidInput.focus();
                            // Force event dropdown to not be focused
                            if (document.activeElement === eventSelectEl) {
                                rfidInput.focus();
                            }
                        }, 100);
                    }, 3000);
                }
            } catch (error) {
                console.error('Error processing attendance:', error);
                const errorMsg = error.message || 'Network error. Please check your connection and try again.';
                updateStatus('error', errorMsg);
                showLastScan(chipId, errorMsg, false);
                isProcessing = false;
                
                // Update tap area visual feedback for error
                const tapArea = document.getElementById('tapArea');
                const tapAreaStatus = document.getElementById('tapAreaStatus');
                tapArea.style.borderColor = '#ef4444';
                tapArea.style.background = '#fee2e2';
                tapAreaStatus.textContent = errorMsg;
                
                // Show toast notification instead of alert
                showToast(errorMsg, 'error');
                
                setTimeout(() => {
                    isProcessing = false;
                    eventSelectionLocked = false;
                    preventChangeEvent = true;
                    
                    // Re-enable event dropdown and restore selected value
                    const eventSelect = document.getElementById('eventId');
                    eventSelect.disabled = false;
                    eventSelect.style.pointerEvents = 'auto';
                    eventSelect.style.opacity = '1';
                    eventSelect.removeAttribute('readonly');
                    eventSelect.tabIndex = 0;
                    
                    // Force restore the value
                    if (currentEventId) {
                        eventSelect.value = currentEventId;
                        // Double-check after a brief delay
                        setTimeout(() => {
                            if (eventSelect.value !== currentEventId) {
                                eventSelect.value = currentEventId;
                            }
                            preventChangeEvent = false;
                        }, 100);
                    } else {
                        preventChangeEvent = false;
                    }
                    
                    updateStatus('waiting', 'Ready for next student card tap...');
                    // Reset tap area
                    tapArea.style.borderColor = '#667eea';
                    tapArea.style.background = '#f0f7ff';
                    tapAreaStatus.textContent = 'Tap student ID card now';
                    // Auto-focus for next tap (ensure event dropdown doesn't get focus)
                    setTimeout(() => {
                        rfidInput.focus();
                        // Force event dropdown to not be focused
                        if (document.activeElement === eventSelect) {
                            rfidInput.focus();
                        }
                    }, 100);
                }, 3000);
            }
        }

        function updateStatus(type, message) {
            const statusEl = document.getElementById('status');
            statusEl.className = `status ${type}`;
            statusEl.textContent = message;
            document.getElementById('connectionStatus').textContent = message;
        }

        function showLastScan(cardId, info, success) {
            const lastScan = document.getElementById('lastScan');
            const lastScanInfo = document.getElementById('lastScanInfo');
            
            lastScan.style.display = 'block';
            lastScanInfo.innerHTML = `
                <p><strong>Result:</strong> ${info}</p>
                <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
            `;
        }

        // Toast notification system (replaces alert)
        function showToast(message, type = 'success') {
            const toast = document.getElementById('toast');
            const toastIcon = document.getElementById('toastIcon');
            const toastMessage = document.getElementById('toastMessage');
            
            toastMessage.textContent = message;
            
            if (type === 'success') {
                toast.style.borderLeftColor = '#10b981';
                toastIcon.className = 'fas fa-check-circle';
                toastIcon.style.color = '#10b981';
            } else if (type === 'error') {
                toast.style.borderLeftColor = '#ef4444';
                toastIcon.className = 'fas fa-exclamation-circle';
                toastIcon.style.color = '#ef4444';
            } else {
                toast.style.borderLeftColor = '#667eea';
                toastIcon.className = 'fas fa-info-circle';
                toastIcon.style.color = '#667eea';
            }
            
            toast.style.display = 'block';
            
            // Auto-close after 3 seconds
            setTimeout(() => {
                closeToast();
            }, 3000);
        }

        function closeToast() {
            const toast = document.getElementById('toast');
            toast.style.display = 'none';
            // Ensure RFID input stays focused after toast closes
            setTimeout(() => {
                if (!isProcessing) {
                    rfidInput.focus();
                }
            }, 100);
        }

        // Make tap area focus the input when clicked (optional, but auto-focus is already enabled)
        document.getElementById('tapArea').addEventListener('click', function() {
            rfidInput.focus();
        });

        // Initialize on page load
        window.addEventListener('load', function() {
            loadEvents();
            // Auto-focus the input so tapping works immediately
            setTimeout(() => {
                rfidInput.focus();
            }, 500);
        });

        // Keep input focused (except when selecting event)
        let allowBlur = false;
        rfidInput.addEventListener('blur', function() {
            if (!allowBlur && !isProcessing) {
                setTimeout(() => {
                    const activeElement = document.activeElement;
                    const isOtherInput = activeElement && (
                        activeElement.id === 'eventId' ||
                        (activeElement.tagName === 'SELECT' && activeElement.id === 'eventId') ||
                        activeElement.id === 'toast' ||
                        activeElement.closest('#toast')
                    );
                    
                    // Only refocus if not selecting event and not processing
                    if (!isOtherInput && document.activeElement !== rfidInput && !isProcessing) {
                        rfidInput.focus();
                    }
                }, 100);
            }
        });

        // Allow blur when selecting event
        const eventSelect = document.getElementById('eventId');
        eventSelect.addEventListener('mousedown', function() {
            allowBlur = true;
        });
        eventSelect.addEventListener('change', function(e) {
            // Store the selected value immediately
            const selectedValue = e.target.value;
            if (selectedValue) {
                currentEventId = selectedValue;
            }
            // After event selection, refocus input and prevent dropdown from staying open
            setTimeout(() => {
                allowBlur = false;
                // Ensure value is preserved
                if (currentEventId && e.target.value !== currentEventId) {
                    e.target.value = currentEventId;
                }
                // Blur the event dropdown to close it
                eventSelect.blur();
                // Focus RFID input
                rfidInput.focus();
            }, 200);
        });
        
        // Prevent event dropdown from opening when it shouldn't
        eventSelect.addEventListener('focus', function() {
            // Only allow focus if not processing
            if (isProcessing || eventSelectionLocked) {
                this.blur();
                rfidInput.focus();
            }
        });
        
        // Preserve event selection on blur
        eventSelect.addEventListener('blur', function() {
            // Restore value if it changed
            if (currentEventId && this.value !== currentEventId) {
                this.value = currentEventId;
            }
        });
    </script>
</body>
</html>

