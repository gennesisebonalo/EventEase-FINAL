<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>RFID Card Registration - EventEase</title>
    <style>
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
            max-width: 600px;
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
    </style>
</head>
<body>
    <div class="container">
        <h1>🆔 RFID Card Registration</h1>
        <p class="subtitle">Register Student ID Cards to the System</p>

        <div id="status" class="status waiting">
            ⏳ Ready to register RFID card...
        </div>

        <div class="instructions">
            <h3>📋 Registration Instructions:</h3>
            <ul>
                <li><strong>Step 1:</strong> Click in the "RFID Chip ID" field below</li>
                <li><strong>Step 2:</strong> Tap the student's ID card on the RFID reader</li>
                <li><strong>Step 3:</strong> Enter the student's printed ID number (e.g., 20111111)</li>
                <li><strong>Step 4:</strong> Click "Register Card" to link the chip ID to the student</li>
                <li><strong>Note:</strong> Make sure the student has already entered their printed ID in their mobile app profile</li>
            </ul>
        </div>


        <div class="input-group" style="background: #f0f7ff; padding: 20px; border-radius: 12px; border: 2px solid #667eea; margin-bottom: 20px;">
            <h3 style="margin: 0 0 15px 0; color: #667eea; font-size: 1.1rem;">Step 1: Scan RFID Chip ID</h3>
            <label style="font-weight: 600; color: #333; margin-bottom: 8px; display: block;">RFID Chip ID (from card tap):</label>
            <input 
                type="text" 
                id="rfidInput" 
                class="rfid-input" 
                placeholder="Tap student ID card here to get chip ID..."
                autocomplete="off"
                autofocus
                oninput="handleManualInput()"
                style="width: 100%; padding: 12px; border: 2px solid #667eea; border-radius: 8px; font-size: 1.1rem; background: white; text-align: center; font-weight: 600; letter-spacing: 1px;"
            >
            <p style="margin: 8px 0 0 0; font-size: 0.75rem; color: #666; font-style: italic;">
                The chip ID will appear automatically when you tap the card (e.g., bbcc1199ff116622)
            </p>
        </div>

        <div class="input-group" style="background: #fff9e6; padding: 20px; border-radius: 12px; border: 2px solid #f59e0b; margin-bottom: 20px;">
            <h3 style="margin: 0 0 15px 0; color: #92400e; font-size: 1.1rem;">Step 2: Enter Student's Printed ID Number</h3>
            <label style="font-weight: 600; color: #92400e; margin-bottom: 8px; display: block;">Printed ID Number (from student's card):</label>
            <input 
                type="text" 
                id="linkPrintedId" 
                placeholder="Enter printed ID number"
                style="width: 100%; padding: 12px; border: 2px solid #f59e0b; border-radius: 8px; font-size: 1rem; margin-bottom: 10px; background: white;"
                onfocus="this.style.borderColor='#f59e0b'; this.style.boxShadow='0 0 0 3px rgba(245, 158, 11, 0.1)';"
                onblur="this.style.borderColor='#f59e0b'; this.style.boxShadow='none';"
            >
            <button 
                onclick="linkChipIdToUser()" 
                style="padding: 12px 24px; background: #f59e0b; color: white; border: none; border-radius: 8px; cursor: pointer; width: 100%; font-weight: 600; font-size: 1rem;"
                type="button"
            >
                ✅ Register Card to Student
            </button>
            <p style="margin: 10px 0 0 0; font-size: 0.75rem; color: #92400e; font-style: italic;">
                ⚠️ Make sure the student has already entered this printed ID in their mobile app profile (Profile → Edit Profile → ID Number)
            </p>
        </div>


        <div class="info-box">
            <p><strong>Registration Status:</strong> <span id="connectionStatus">Ready</span></p>
            <p><strong>Debug Mode:</strong> <span style="color: #667eea;">Open browser console (F12) to see RFID detection logs</span></p>
        </div>

        <div class="last-scan" id="lastScan" style="display: none;">
            <h3>Last Scan Result:</h3>
            <div class="last-scan-info" id="lastScanInfo"></div>
        </div>
    </div>

    <script>
        const apiBaseUrl = window.location.origin;
        let rfidBuffer = '';
        let lastKeyTime = 0;
        const RFID_TIMEOUT = 100; // milliseconds between key presses

        // Handle RFID input - multiple event listeners for better compatibility
        const rfidInput = document.getElementById('rfidInput');
        let isProcessing = false;
        
        // Debug logging
        function logDebug(message) {
            console.log('[RFID Debug]', message);
        }
        
        // Handle keydown events (for most RFID readers)
        rfidInput.addEventListener('keydown', function(e) {
            logDebug(`Keydown: key="${e.key}", code="${e.code}", value="${rfidInput.value}"`);
            
            // Prevent form submission
            if (e.key === 'Enter') {
                e.preventDefault();
                if (!isProcessing) {
                    processRFID();
                }
                return;
            }

            const currentTime = Date.now();
            
            // Reset buffer if too much time has passed (new card scan)
            if (currentTime - lastKeyTime > RFID_TIMEOUT) {
                logDebug('Resetting buffer - new scan detected');
                rfidBuffer = '';
                rfidInput.value = ''; // Clear visible input
            }
            
            // Capture alphanumeric characters and special characters that might be sent
            // But only if it's rapid input (RFID scan), not manual typing
            if (e.key.length === 1) {
                // Allow numbers, letters, and some special chars that RFID readers might send
                if (/[a-zA-Z0-9\-_]/.test(e.key)) {
                    const timeSinceLastKey = currentTime - lastKeyTime;
                    // If keys are coming very fast (< 50ms apart), it's likely RFID scan
                    // If slower, it's manual typing - don't auto-process
                    if (timeSinceLastKey < 50 || rfidBuffer.length === 0) {
                        rfidBuffer += e.key;
                        rfidInput.value = rfidBuffer; // Show in input field
                        lastKeyTime = currentTime;
                        updateStatus('scanning', `Scanning... (${rfidBuffer.length} chars)`);
                        logDebug(`Buffer: "${rfidBuffer}"`);
                    }
                }
            }
            
            // Process after a short delay (RFID readers typically send data quickly)
            // Only auto-process if input is very fast (RFID scan), not manual typing
            clearTimeout(window.rfidTimeout);
            const timeSinceLastKey = currentTime - lastKeyTime;
            if (timeSinceLastKey < 50) { // Only auto-process rapid input
                window.rfidTimeout = setTimeout(() => {
                    if (rfidBuffer.length >= 4 && !isProcessing) {
                        logDebug(`Auto-processing: "${rfidBuffer}"`);
                        processRFID();
                    }
                }, RFID_TIMEOUT + 100);
            }
        });

        // Handle keypress events (some readers use this)
        rfidInput.addEventListener('keypress', function(e) {
            logDebug(`Keypress: key="${e.key}", charCode="${e.charCode}"`);
        });

        // Handle input events (for some RFID readers that use input events)
        rfidInput.addEventListener('input', function(e) {
            const value = e.target.value;
            const currentTime = Date.now();
            
            logDebug(`Input event: value="${value}", length=${value.length}`);
            
            // If input is being typed quickly (RFID scan), capture it
            if (value.length > rfidBuffer.length) {
                rfidBuffer = value;
                lastKeyTime = currentTime;
                updateStatus('scanning', `Scanning... (${rfidBuffer.length} chars)`);
                
                // Process if we have enough characters
                clearTimeout(window.rfidTimeout);
                window.rfidTimeout = setTimeout(() => {
                    if (rfidBuffer.length >= 4 && !isProcessing) {
                        logDebug(`Auto-processing from input: "${rfidBuffer}"`);
                        processRFID();
                    }
                }, RFID_TIMEOUT + 100);
            }
        });

        // Handle paste events (manual entry)
        rfidInput.addEventListener('paste', function(e) {
            setTimeout(() => {
                rfidBuffer = rfidInput.value.trim();
                logDebug(`Paste: "${rfidBuffer}"`);
                if (rfidBuffer.length >= 4 && !isProcessing) {
                    processRFID();
                }
            }, 10);
        });

        // Also listen to document level for RFID readers that don't focus the input
        document.addEventListener('keydown', function(e) {
            // Only capture if input is focused or if it looks like RFID input (rapid typing)
            if (document.activeElement === rfidInput || 
                (e.key.length === 1 && /[0-9]/.test(e.key) && !document.activeElement.matches('input, textarea, select'))) {
                // Let the input handler deal with it
                return;
            }
        });

        // Handle manual input in the main RFID field
        function handleManualInput() {
            const inputValue = document.getElementById('rfidInput').value.trim();
            // If user is manually typing (not from RFID scan), update buffer
            if (inputValue && !isProcessing) {
                rfidBuffer = inputValue;
            }
        }


        // Process RFID card ID
        async function processRFID() {
            if (isProcessing) {
                logDebug('Already processing, skipping...');
                return;
            }
            
            isProcessing = true;
            
            // Always use the chip ID from RFID scan (not printed ID)
            // The chip ID is what the reader detects (e.g., bbcc1199ff116622)
            let chipId = rfidBuffer.trim() || document.getElementById('rfidInput').value.trim();
            
            
            logDebug(`Processing RFID Chip ID: "${chipId}"`);
            
            if (!chipId) {
                updateStatus('error', 'No RFID card ID detected. Please tap your card on the reader.');
                isProcessing = false;
                return;
            }

            // Clean the chip ID (remove any non-alphanumeric except dashes)
            chipId = chipId.replace(/[^a-zA-Z0-9\-_]/g, '');
            
            // Update buffer with cleaned chip ID
            rfidBuffer = chipId;
            document.getElementById('rfidInput').value = chipId;

            // This is registration only - show chip ID and prompt for printed ID
            updateStatus('success', `✓ Chip ID detected: ${chipId}. Now enter the student's printed ID number below to register.`);
            showLastScan(chipId, `Chip ID: ${chipId} - Ready for registration. Enter printed ID below.`, true);
            isProcessing = false;
            
            // Focus on the printed ID input field
            setTimeout(() => {
                document.getElementById('linkPrintedId').focus();
            }, 500);
        }

        // Update status display
        function updateStatus(type, message) {
            const statusEl = document.getElementById('status');
            statusEl.className = `status ${type}`;
            statusEl.textContent = message;
            document.getElementById('connectionStatus').textContent = message;
        }

        // Show last scan result
        function showLastScan(cardId, info, success) {
            const lastScan = document.getElementById('lastScan');
            const lastScanInfo = document.getElementById('lastScanInfo');
            
            lastScan.style.display = 'block';
            lastScanInfo.innerHTML = `
                <p><strong>Card ID:</strong> ${cardId}</p>
                <p><strong>Result:</strong> ${info}</p>
                <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
            `;
        }

        // Link chip ID to user's printed ID
        async function linkChipIdToUser() {
            console.log('linkChipIdToUser called');
            
            const chipId = rfidBuffer.trim() || document.getElementById('rfidInput').value.trim();
            const printedId = document.getElementById('linkPrintedId').value.trim();
            
            console.log('Chip ID:', chipId);
            console.log('Printed ID:', printedId);
            
            if (!chipId) {
                updateStatus('error', 'Please scan a chip ID first by tapping a card.');
                alert('Please scan a chip ID first by tapping a card.');
                return;
            }
            
            if (!printedId) {
                updateStatus('error', 'Please enter the user\'s printed ID number.');
                alert('Please enter the user\'s printed ID number.');
                return;
            }
            
            try {
                updateStatus('scanning', 'Linking chip ID to user...');
                const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';
                
                console.log('Fetching users...');
                // First, find user by printed_id
                const userResponse = await fetch(`${apiBaseUrl}/api/users`);
                
                if (!userResponse.ok) {
                    throw new Error(`HTTP error! status: ${userResponse.status}`);
                }
                
                const userResult = await userResponse.json();
                console.log('Users result:', userResult);
                
                const users = userResult.data || [];
                console.log('Total users:', users.length);
                console.log('Sample user:', users[0]); // Debug: show first user structure
                
                // Try to find user by printed_id first (exact match)
                let user = users.find(u => u.printed_id && String(u.printed_id).trim() === String(printedId).trim());
                
                console.log('Searching for printed_id:', printedId);
                console.log('Users with printed_id:', users.filter(u => u.printed_id).map(u => ({ id: u.id, name: u.name, printed_id: u.printed_id })));
                
                if (!user) {
                    // If no user found by printed_id, try to find by email or name
                    user = users.find(u => 
                        (u.email && u.email.toLowerCase().includes(printedId.toLowerCase())) ||
                        (u.name && u.name.toLowerCase().includes(printedId.toLowerCase()))
                    );
                }
                
                console.log('Found user:', user);
                
                if (!user) {
                    const errorMsg = `User with printed ID "${printedId}" not found. Please make sure the user has registered their printed ID in their profile.`;
                    updateStatus('error', errorMsg);
                    alert(errorMsg);
                    return;
                }
                
                console.log('Linking chip ID to user ID:', user.id);
                
                // Update user's rfid_card_id (chip ID) via admin endpoint
                const updateResponse = await fetch(`${apiBaseUrl}/api/users/${user.id}/link-rfid`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                        'X-CSRF-TOKEN': csrfToken
                    },
                    body: JSON.stringify({
                        rfid_card_id: chipId,
                        printed_id: printedId
                    })
                });
                
                console.log('Update response status:', updateResponse.status);
                
                if (!updateResponse.ok) {
                    const errorText = await updateResponse.text();
                    console.error('Update failed:', errorText);
                    throw new Error(`HTTP error! status: ${updateResponse.status}, ${errorText}`);
                }
                
                const updateResult = await updateResponse.json();
                console.log('Update result:', updateResult);
                
                if (updateResult.success) {
                    const successMsg = `✓ Card Registered Successfully!\n\nChip ID: ${chipId}\nStudent: ${user.name}\nPrinted ID: ${printedId}`;
                    updateStatus('success', `✓ Card registered to ${user.name} (ID: ${printedId})`);
                    document.getElementById('linkPrintedId').value = '';
                    document.getElementById('rfidInput').value = '';
                    rfidBuffer = '';
                    showLastScan(chipId, `Registered: ${user.name} (${printedId})`, true);
                    alert(successMsg);
                    
                    // Reset for next registration
                    setTimeout(() => {
                        updateStatus('waiting', 'Ready to register next card. Tap a card to begin.');
                        rfidInput.focus();
                    }, 2000);
                } else {
                    const errorMsg = updateResult.message || 'Failed to register card.';
                    updateStatus('error', errorMsg);
                    alert(errorMsg);
                }
            } catch (error) {
                console.error('Error linking chip ID:', error);
                const errorMsg = `Error linking chip ID: ${error.message}. Please check the browser console for details.`;
                updateStatus('error', errorMsg);
                alert(errorMsg);
            }
        }

        // Initialize on page load
        window.addEventListener('load', function() {
            updateStatus('waiting', 'Ready to register RFID cards. Tap a card to begin.');
            rfidInput.focus();
        });

        // Keep input focused (but allow manual clicking on other inputs)
        let allowBlur = false;
        rfidInput.addEventListener('blur', function() {
            if (!allowBlur) {
                setTimeout(() => {
                    // Only refocus if user didn't click on another input field
                    const activeElement = document.activeElement;
                    const isOtherInput = activeElement && (
                        activeElement.id === 'linkPrintedId' ||
                        activeElement.tagName === 'INPUT' ||
                        activeElement.tagName === 'SELECT' ||
                        activeElement.tagName === 'TEXTAREA'
                    );
                    
                    if (!isOtherInput && document.activeElement !== rfidInput) {
                        rfidInput.focus();
                    }
                }, 100);
            }
        });

        // Allow blur when clicking buttons or other inputs
        document.querySelector('button[onclick="processRFID()"]')?.addEventListener('mousedown', function() {
            allowBlur = true;
            setTimeout(() => { allowBlur = false; }, 200);
        });
        
        // Allow blur when clicking on link printed ID input
        const linkPrintedIdInput = document.getElementById('linkPrintedId');
        if (linkPrintedIdInput) {
            linkPrintedIdInput.addEventListener('focus', function() {
                allowBlur = true;
            });
            linkPrintedIdInput.addEventListener('blur', function() {
                setTimeout(() => { allowBlur = false; }, 200);
            });
        }
        
    </script>
</body>
</html>

