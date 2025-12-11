# RFID Reader Setup Guide

## Overview
This guide will help you set up the RFID reader system for event check-ins using student ID cards.

## Prerequisites
- USB RFID reader device (connected to a computer)
- Student ID cards with RFID chips
- Computer with web browser (connected to the same network as your Laravel server)

## Step 1: Access the RFID Reader Interface

1. Open a web browser on the computer connected to the RFID reader
2. Navigate to: `http://YOUR_SERVER_IP:8000/rfid-reader`
   - Replace `YOUR_SERVER_IP` with your actual server IP address
   - Example: `http://192.168.1.8:8000/rfid-reader`

## Step 2: Register RFID Card IDs for Users

Before users can check in with their RFID cards, you need to link their user accounts to their RFID card IDs.

### Option A: Using the Web Interface (Test Mode)
1. Go to the RFID reader page
2. Click in the "RFID Card Input" field
3. Tap a student ID card on the reader
4. Note the card ID that appears in the input field
5. Use this ID to register it to a user (see Option B or C)

### Option B: Update User Profile via API
Send a PUT request to `/api/profile` with the RFID card ID:

```json
{
  "name": "Student Name",
  "email": "student@example.com",
  "rfid_card_id": "20222121"
}
```

### Option C: Update via Database (Admin)
You can directly update the `rfid_card_id` field in the `users` table:

```sql
UPDATE users SET rfid_card_id = '20222121' WHERE email = 'student@example.com';
```

## Step 3: Using the System

### For Event Check-in:

1. **Student joins event in mobile app**
   - Student opens the mobile app
   - Joins an event
   - Gets redirected to the RFID tapping screen
   - Mobile app shows "Waiting for RFID card tap..."

2. **Admin/Staff opens RFID reader interface**
   - Open `http://YOUR_SERVER_IP:8000/rfid-reader` on the computer
   - Select the event from the dropdown
   - Make sure the input field is focused (click in it)

3. **Student taps their ID card**
   - Student taps their student ID card on the RFID reader
   - The card ID is automatically captured
   - The system processes the check-in

4. **Check-in confirmation**
   - The web interface shows success message
   - The mobile app automatically detects the check-in (polls every 2 seconds)
   - Student sees success message on their phone

## Troubleshooting

### RFID Card Not Detected
- Make sure the RFID reader is properly connected via USB
- Check that the reader's indicator light is on
- Try clicking in the input field again
- Ensure the card is held close enough to the reader

### "RFID card not registered" Error
- The card ID needs to be registered to a user account first
- Check that the `rfid_card_id` field in the database matches the card's actual ID
- Verify the user has joined the event first (status should be 'pending')

### "No pending attendance found" Error
- The user must join the event in the mobile app first
- Check that the user has a pending attendance record for the event
- Verify the event ID matches between mobile app and web interface

### Mobile App Not Detecting Check-in
- The mobile app polls every 2 seconds
- Make sure the mobile app is still on the RFID tapping screen
- Check that the user's attendance status was updated to 'present' in the database

## Testing the RFID Card ID

To find out what ID your RFID card has:
1. Open the RFID reader page
2. Click in the input field
3. Tap the card
4. The card ID will appear in the input field
5. Use this ID to register it to the user account

## Notes

- The RFID card ID might be different from the student ID number printed on the card
- Each RFID card has a unique ID that is read by the device
- The card ID is typically a string of numbers and/or letters
- Make sure each user has a unique RFID card ID (enforced by database constraint)

