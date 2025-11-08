# Debugging Camera Focus and Data Sources Panel Issues

## Quick Diagnosis

### Test 1: Check if Changes Are Loaded

Open browser console (F12) and run:

```javascript
// Check if camera controls are available
console.log('Camera controls available:', window.cameraControls !== undefined);

// Check Data Sources Panel state
const panels = document.querySelectorAll('[class*="DataSourceStatusPanel"]');
console.log('Data source panels found:', panels.length);
```

### Test 2: Camera Focus Debugging

1. Open Solar System page: `http://localhost:3002/solar-system`
2. Wait 3 seconds for scene to load
3. Open Camera Controls panel (cyan button, bottom-left)
4. Open browser console (F12)
5. Select "Earth" from Focus Object dropdown
6. Look for console messages:

**Expected output:**
```
🎯 Focusing on Earth
📍 Target position: Vector3 {x: ..., y: ..., z: ...}
📏 Distance: 10
🧭 Direction: Vector3 {x: ..., y: ..., z: ...}
🎥 New camera position: Vector3 {x: ..., y: ..., z: ...}
📐 Current camera: Vector3 {x: ..., y: ..., z: ...}
✅ Camera animation complete
```

**If you see:**
- `⚠️ Object "Earth" not found in scene` → Scene not loaded yet, wait longer
- `📋 Available objects: [...]` → Check if "earth" is in the list
- No messages at all → Camera controls not initialized

### Test 3: Data Sources Panel Minimize

1. Find the "Celestial Data Sources" panel (top area, shows NASA JPL ACTIVE)
2. Look for two buttons in the header: refresh (circular arrow) and chevron
3. The chevron should currently show: **⬆️ up arrow** (if panel is expanded)
4. Click the chevron
5. Panel should collapse, showing only header
6. Chevron should change to: **⬇️ down arrow**

**If it doesn't work:**
- Check if `isMinimized` state is changing (see React DevTools)
- Check if chevron icon is changing
- Check if `{!isMinimized && ...}` conditional is working

---

## Manual Console Testing

### Test Camera Focus Manually

```javascript
// In browser console on Solar System page:

// Get the camera controls (wait for page to load first)
setTimeout(() => {
  // This should be available if page loaded correctly
  const canvas = document.querySelector('canvas');
  console.log('Canvas found:', canvas !== null);
  
  // Try to trigger focus directly if you have access
  // Note: You may need to export cameraControls to window for testing
}, 3000);
```

### Test Panel Minimize Manually

```javascript
// Find the minimize button and click it programmatically
const chevronButton = Array.from(document.querySelectorAll('button'))
  .find(btn => btn.title?.includes('Minimize') || btn.title?.includes('Expand'));

if (chevronButton) {
  console.log('Found chevron button:', chevronButton);
  chevronButton.click();
  console.log('Clicked chevron button');
} else {
  console.log('Chevron button not found');
}
```

---

## Common Issues & Fixes

### Issue: Camera Doesn't Move

**Possible Causes:**
1. **Objects not loaded yet** → Wait 3-5 seconds after page load
2. **Camera controls not initialized** → Check console for initialization messages
3. **Animation conflict** → OrbitControls might be overriding animation

**Fix:**
Try disabling OrbitControls during animation:

```typescript
// In focusObject function, add:
controls.enabled = false; // Disable manual controls during animation

const animateCamera = () => {
  // ... existing animation code ...
  
  if (progress >= 1) {
    controls.enabled = true; // Re-enable after animation
    console.log(`✅ Camera animation complete`);
  }
};
```

### Issue: Objects Not Found

**Check available objects:**
```javascript
// In console:
console.log('Planets in scene:', Array.from(planetsRef.current?.keys() || []));
```

**Expected objects:**
- sun
- mercury
- venus
- earth
- mars
- jupiter
- saturn
- uranus
- neptune

### Issue: Panel Doesn't Minimize

**Possible Causes:**
1. **CSS transition issue** → Panel content still rendering
2. **State not updating** → React not re-rendering
3. **Wrong conditional** → `{!isMinimized && ...}` not wrapping content

**Check in React DevTools:**
1. Open React DevTools (F12 → Components tab)
2. Find `DataSourceStatusPanel` component
3. Look at state: `isMinimized` should toggle between `true` and `false`
4. Click chevron and watch state change

**Force re-render test:**
```javascript
// In console, find the component and check state
const panel = document.querySelector('[class*="rounded-lg"][class*="border-zinc-800"]');
console.log('Panel found:', panel !== null);
console.log('Panel classes:', panel?.className);
```

---

## Hard Refresh Checklist

If changes still not appearing:

1. ✅ **Clear Next.js cache:**
   ```powershell
   cd frontend
   Remove-Item -Path .next -Recurse -Force
   ```

2. ✅ **Clear browser cache:**
   - Chrome: Ctrl+Shift+Delete → Clear cached images and files
   - Or: Hard refresh with Ctrl+Shift+R

3. ✅ **Kill all Node processes:**
   ```powershell
   Get-Process | Where-Object {$_.ProcessName -eq "node"} | Stop-Process -Force
   ```

4. ✅ **Restart dev server:**
   ```powershell
   cd frontend
   npx next dev -p 3002
   ```

5. ✅ **Open in incognito/private window:**
   - Eliminates any cached JavaScript

---

## Verification Steps

### Camera Focus Working:
- [  ] Open Camera Controls panel
- [  ] Dropdown populated with objects
- [  ] Select "Sun" → Camera moves to Sun (far distance ~50 units)
- [  ] Select "Earth" → Camera moves closer to Earth (~10 units)
- [  ] Select "Jupiter" → Camera moves to Jupiter (medium distance ~25 units)
- [  ] Console shows debug messages
- [  ] Animation takes ~1.5 seconds (smooth)
- [  ] Can still manually rotate with mouse after

### Data Sources Panel Working:
- [  ] Panel visible in top area
- [  ] Shows "NASA JPL ACTIVE" 
- [  ] Shows "ESA NEOCC ONLINE"
- [  ] Chevron icon present in header
- [  ] Chevron shows up arrow ⬆️ when expanded
- [  ] Click chevron → Panel collapses
- [  ] Chevron changes to down arrow ⬇️
- [  ] Click again → Panel expands
- [  ] NASA JPL and ESA NEOCC cards visible when expanded

---

## Report Back

If issues persist, please provide:

1. **Console messages** when selecting an object (copy/paste)
2. **React DevTools state** for DataSourceStatusPanel (screenshot)
3. **Browser and version** (Chrome 120, Firefox 121, etc.)
4. **Network tab** - Check if JavaScript files are loading with 304 (cached) or 200 (fresh)

---

## Last Resort: Nuclear Option

If absolutely nothing works:

```powershell
# Delete everything and reinstall
cd frontend
Remove-Item -Path node_modules -Recurse -Force
Remove-Item -Path .next -Recurse -Force
Remove-Item -Path package-lock.json -Force
npm install
npx next dev -p 3002
```

This will take 5-10 minutes but guarantees fresh build.
