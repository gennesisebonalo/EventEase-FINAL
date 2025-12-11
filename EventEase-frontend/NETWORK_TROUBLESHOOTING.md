# Network Error Troubleshooting Guide

## 🚨 Issue: "AxiosError: Network Error" during Sign In

This error occurs when the EventEase frontend cannot connect to the Laravel backend server. Here's how to fix it:

## 🔍 Quick Diagnosis

### 1. Check Server Status
- **Server Running?** Make sure your Laravel backend is running
- **Correct Port?** Verify the server is running on the expected port (usually 8000)
- **Network Access?** Ensure the server is accessible from your device/emulator

### 2. Check Network Configuration
- **IP Address:** Verify the server IP address in `constants/axios.js`
- **Firewall:** Check if firewall is blocking the connection
- **Network:** Ensure both devices are on the same network

## 🛠️ Step-by-Step Solutions

### Solution 1: Start Your Laravel Server

```bash
# Navigate to your Laravel backend directory
cd EventEase-backend

# Start the Laravel development server
php artisan serve

# Or specify host and port
php artisan serve --host=0.0.0.0 --port=8000
```

**Expected Output:**
```
Laravel development server started: http://0.0.0.0:8000
```

### Solution 2: Update Server IP Address

1. **Find Your Computer's IP Address:**
   ```bash
   # Windows
   ipconfig
   
   # macOS/Linux
   ifconfig
   ```

2. **Update `constants/axios.js`:**
   ```javascript
   const SERVER_CONFIGS = [
     'http://YOUR_IP_ADDRESS:8000',  // Replace with your actual IP
     'http://localhost:8000',
     'http://127.0.0.1:8000',
     'http://10.0.2.2:8000', // Android emulator
   ];
   ```

### Solution 3: Configure Laravel for External Access

1. **Update Laravel Configuration:**
   ```bash
   # In your Laravel backend
   php artisan serve --host=0.0.0.0 --port=8000
   ```

2. **Check Laravel CORS Settings:**
   ```php
   // config/cors.php
   'allowed_origins' => ['*'], // For development only
   'allowed_methods' => ['*'],
   'allowed_headers' => ['*'],
   ```

### Solution 4: Device-Specific Configuration

#### For Android Emulator:
```javascript
// Use this IP for Android emulator
const LARAVEL_BASE_URL = 'http://10.0.2.2:8000';
```

#### For iOS Simulator:
```javascript
// Use this IP for iOS simulator
const LARAVEL_BASE_URL = 'http://127.0.0.1:8000';
```

#### For Physical Device:
```javascript
// Use your computer's actual IP address
const LARAVEL_BASE_URL = 'http://192.168.1.XXX:8000';
```

## 🔧 Advanced Troubleshooting

### Check Laravel Routes
```bash
# In your Laravel backend
php artisan route:list | grep login
```

**Expected Output:**
```
POST   api/login  App\Http\Controllers\AuthController@login
```

### Test API Endpoint Manually
```bash
# Test the login endpoint
curl -X POST http://YOUR_IP:8000/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password"}'
```

### Check Laravel Logs
```bash
# Check Laravel logs for errors
tail -f storage/logs/laravel.log
```

## 📱 Device-Specific Solutions

### Android Emulator
1. **Use `10.0.2.2`** instead of `localhost`
2. **Enable Network Security Config:**
   ```xml
   <!-- android/app/src/main/res/xml/network_security_config.xml -->
   <network-security-config>
       <domain-config cleartextTrafficPermitted="true">
           <domain includeSubdomains="true">10.0.2.2</domain>
       </domain-config>
   </network-security-config>
   ```

### iOS Simulator
1. **Use `127.0.0.1`** or `localhost`
2. **Check iOS Simulator Network Settings**

### Physical Device
1. **Ensure both devices are on the same WiFi network**
2. **Use your computer's actual IP address**
3. **Check firewall settings**

## 🚀 Quick Fix Commands

### Reset Everything
```bash
# Stop all servers
# Kill any running Laravel processes
pkill -f "php artisan serve"

# Restart Laravel server
cd EventEase-backend
php artisan serve --host=0.0.0.0 --port=8000

# Clear React Native cache
cd EventEase-frontend
npx expo start --clear
```

### Test Connection
```bash
# Test if server is accessible
curl http://YOUR_IP:8000/api/health

# Or test from browser
# Open: http://YOUR_IP:8000/api/health
```

## 🔍 Debug Information

### Enable Debug Logging
```javascript
// In constants/axios.js
const DEBUG = true;

if (DEBUG) {
  console.log('API Request:', config.url);
  console.log('API Base URL:', config.baseURL);
}
```

### Check Network Requests
1. **Open React Native Debugger**
2. **Check Network Tab**
3. **Look for failed requests**

## 📋 Common Error Messages & Solutions

| Error Message | Solution |
|---------------|----------|
| `Network Error` | Server not running or wrong IP |
| `Connection Refused` | Server not running on specified port |
| `Timeout` | Server too slow or network issues |
| `404 Not Found` | Wrong API endpoint or server not configured |
| `CORS Error` | Laravel CORS not configured properly |

## 🆘 Still Having Issues?

### 1. Check These Files:
- `EventEase-backend/.env` - Database and app configuration
- `EventEase-backend/routes/api.php` - API routes
- `EventEase-frontend/constants/axios.js` - API configuration

### 2. Verify Laravel Installation:
```bash
cd EventEase-backend
php artisan --version
composer install
php artisan key:generate
```

### 3. Test with Simple Endpoint:
```php
// routes/api.php
Route::get('/test', function () {
    return response()->json(['message' => 'Server is working!']);
});
```

### 4. Contact Support:
- Check the EventEase documentation
- Review Laravel documentation
- Check React Native networking guide

## ✅ Success Indicators

You'll know it's working when:
- ✅ Laravel server shows "Laravel development server started"
- ✅ Server status shows "Connected" in the app
- ✅ Sign in works without network errors
- ✅ API requests appear in Laravel logs

## 🔄 Prevention Tips

1. **Always start Laravel server before testing**
2. **Use consistent IP addresses**
3. **Keep both frontend and backend updated**
4. **Test on same network**
5. **Use development-friendly CORS settings**

---

**Remember:** Network errors are usually configuration issues, not code problems. Take your time to verify each step!
