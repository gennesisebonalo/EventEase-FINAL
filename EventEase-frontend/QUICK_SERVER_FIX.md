# 🚀 Quick Server Fix - Laravel Backend Setup

## ❌ Current Issue
Your EventEase app is getting "Network Error" because the Laravel backend server is not running.

## ✅ Solution: Start Laravel Server

### Step 1: Open Terminal/Command Prompt
- **Windows**: Press `Win + R`, type `cmd`, press Enter
- **Mac**: Press `Cmd + Space`, type `Terminal`, press Enter
- **Linux**: Press `Ctrl + Alt + T`

### Step 2: Navigate to Laravel Backend
```bash
# Navigate to your EventEase backend folder
cd C:\Users\Angelica\Desktop\EventEase-CAPSTONE09\EventEase-backend

# Or if using relative path from frontend
cd ..\EventEase-backend
```

### Step 3: Start Laravel Server
```bash
# Start the development server
php artisan serve --host=0.0.0.0 --port=8000
```

### Step 4: Verify Server is Running
You should see:
```
Laravel development server started: http://0.0.0.0:8000
[Sun Dec 15 10:30:00 2024] PHP 8.x.x Development Server (http://0.0.0.0:8000) started
```

---

## 🔍 Troubleshooting

### ❌ Error: "php is not recognized as internal or external command"
**Solution**: Install PHP or add it to your PATH
1. Download PHP from [php.net](https://www.php.net/downloads)
2. Or install XAMPP/WAMP which includes PHP

### ❌ Error: "artisan not found"
**Solution**: Make sure you're in the correct Laravel project directory
```bash
# Check if artisan file exists
dir artisan  # Windows
ls artisan   # Mac/Linux

# If not found, navigate to correct directory
cd C:\Users\Angelica\Desktop\EventEase-CAPSTONE09\EventEase-backend
```

### ❌ Error: "Port 8000 is already in use"
**Solution**: Use a different port
```bash
php artisan serve --host=0.0.0.0 --port=8001
```

Then update your frontend config:
```javascript
// In constants/axios.js
const SERVER_CONFIGS = [
  'http://192.168.1.17:8001',  // Updated port
  // ... other servers
];
```

### ❌ Error: "Access denied" or "Permission denied"
**Solution**: Run as administrator (Windows) or use sudo (Mac/Linux)
```bash
# Windows: Right-click Command Prompt → "Run as administrator"

# Mac/Linux: Use sudo
sudo php artisan serve --host=0.0.0.0 --port=8000
```

---

## 🌐 Network Configuration

### Find Your Computer's IP Address
```bash
# Windows
ipconfig

# Mac/Linux
ifconfig
```

Look for:
- **IPv4 Address**: `192.168.1.XXX` (this is what you need)

### Update Frontend Configuration
Open `EventEase-frontend/constants/axios.js` and update:
```javascript
const SERVER_CONFIGS = [
  'http://YOUR_IP:8000',        // Replace YOUR_IP with your actual IP
  'http://localhost:8000',     // Local development
  'http://127.0.0.1:8000',     // iOS simulator
  'http://10.0.2.2:8000',      // Android emulator
];
```

---

## 📱 Device-Specific Setup

### Android Emulator
- Use: `http://10.0.2.2:8000`
- Make sure emulator is running

### iOS Simulator
- Use: `http://localhost:8000` or `http://127.0.0.1:8000`
- Make sure simulator is running

### Physical Device
- Use your computer's actual IP address
- Both devices must be on the same WiFi network

---

## ✅ Test Your Setup

### 1. Test in Browser
Open: `http://localhost:8000`
You should see Laravel welcome page or your app

### 2. Test API Endpoint
Open: `http://localhost:8000/api/health`
(If this returns 404, that's normal - the endpoint might not exist yet)

### 3. Test from App
- Open EventEase app
- Try to sign in
- Server status should show "Connected"

---

## 🚀 Quick Commands Reference

```bash
# Start Laravel server
php artisan serve --host=0.0.0.0 --port=8000

# Check Laravel version
php artisan --version

# Check routes
php artisan route:list

# Clear Laravel cache (if needed)
php artisan config:clear
php artisan cache:clear

# Stop server
# Press Ctrl + C in the terminal where server is running
```

---

## 🆘 Still Having Issues?

### Check These Files Exist:
- `EventEase-backend/artisan` ✅
- `EventEase-backend/composer.json` ✅
- `EventEase-backend/.env` ✅
- `EventEase-backend/routes/api.php` ✅

### Verify Laravel Installation:
```bash
cd EventEase-backend
php artisan --version
composer install
```

### Check Firewall:
- Windows: Allow PHP through Windows Firewall
- Mac: Check Security & Privacy settings
- Make sure port 8000 is not blocked

---

## 📞 Need Help?

1. **Check the terminal output** - Laravel shows helpful error messages
2. **Verify PHP is installed**: `php --version`
3. **Check if Composer is installed**: `composer --version`
4. **Make sure you're in the right directory**: Look for `artisan` file

---

**Remember**: Laravel server must be running for the app to work. Keep the terminal window open while testing your app!

