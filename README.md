# Interactive Artwork with Firebase 🎨

Control artwork in real-time from anywhere in the world using Firebase!

## Features

✅ **Real-time synchronization** - Changes appear instantly on all devices  
✅ **Works globally** - Control from US, friend watches in Japan  
✅ **No server to manage** - Firebase handles everything  
✅ **Multiple controllers** - Many people can control at once  

## Quick Setup (5 Minutes)

### Step 1: Create Firebase Project

1. Go to https://console.firebase.google.com/
2. Click "Add project"
3. Name it: `interactive-artwork` (or anything you want)
4. **Disable Google Analytics** (not needed, makes setup faster)
5. Click "Create project"

### Step 2: Set Up Realtime Database

1. In your Firebase console, click "Realtime Database" in the left menu
2. Click "Create Database"
3. **Location**: Choose closest to you (United States, Europe, etc.)
4. **Security Rules**: Start in **TEST MODE** 
   - This allows read/write for 30 days (perfect for testing)
   - Click "Enable"

### Step 3: Get Your Firebase Config

1. In Firebase Console, click the gear icon ⚙️ → "Project settings"
2. Scroll down to "Your apps"
3. Click the **Web icon** `</>`
4. App nickname: `interactive-artwork`
5. **Don't** check "Firebase Hosting" (we're using Netlify)
6. Click "Register app"
7. **Copy the firebaseConfig object** - it looks like this:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyXXXXXXXXXXXXXXX",
  authDomain: "your-project.firebaseapp.com",
  databaseURL: "https://your-project-default-rtdb.firebaseio.com",
  projectId: "your-project",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdefghijk"
};
```

### Step 4: Add Config to Your App

1. Open `src/firebase.js` in your code editor
2. **Replace** the placeholder config with YOUR config from Firebase
3. Save the file

### Step 5: Install and Run

```bash
cd ~/Desktop/interactive-artwork
npm install
npm start
```

### Step 6: Test Locally

1. Open http://localhost:3000
2. Click "Artwork Display" - open this in one browser tab
3. Click "Controller" - open this in another tab
4. Move the sliders in Controller → Watch Artwork change! ✨

### Step 7: Deploy to Netlify

```bash
npm run build
```

Then drag the `build` folder to Netlify.

## How to Use

### For Gallery/Exhibition Setup:

1. **Laptop/TV**: Open `https://your-site.netlify.app/artwork`
   - This shows ONLY the artwork (fullscreen, no controls)
   
2. **Create QR Code**: Generate QR code for `https://your-site.netlify.app/controller`
   - Print it or display it near the artwork
   
3. **Visitors**: Scan QR → Opens controller on their phone → They control the artwork!

### For Remote Collaboration:

1. **You**: Open `/artwork` on your laptop
2. **Friend in US**: Opens `/controller` on their phone
3. They move sliders → Your artwork changes instantly! 🌎

## URLs

- **Home**: `https://your-site.netlify.app/`
- **Artwork Display**: `https://your-site.netlify.app/artwork`
- **Controller**: `https://your-site.netlify.app/controller`

## Firebase Security (Important!)

The test mode rules expire in 30 days. For production:

1. Go to Firebase Console → Realtime Database → Rules
2. Replace with:

```json
{
  "rules": {
    "artwork": {
      ".read": true,
      ".write": true
    }
  }
}
```

This allows anyone to read/write the artwork data (fine for this use case).

## Troubleshooting

**"Firebase error" or not connecting:**
- Check that you copied the FULL firebaseConfig (all 7 fields)
- Make sure databaseURL is included
- Verify Realtime Database is enabled in Firebase Console

**Changes not syncing:**
- Check Firebase Console → Realtime Database → Data tab
- You should see an "artwork" node appear when you use the controller
- If not, check your security rules

**Build fails:**
- Make sure you replaced the placeholder config in firebase.js
- Run `npm install` again

## File Structure

```
src/
├── firebase.js              ← Firebase configuration (EDIT THIS!)
├── App.js                   ← Routes for home/artwork/controller
├── components/
│   ├── ArtworkDisplay.js    ← Listens to Firebase, shows animation
│   ├── Controller.js        ← Writes to Firebase when sliders move
│   └── [CSS files]
```

## That's It!

No servers. No networking headaches. Just Firebase magic! ✨

Questions? The Firebase docs are excellent: https://firebase.google.com/docs/database
