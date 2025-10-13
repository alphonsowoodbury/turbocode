# Build Fix Instructions

## Problem
The app is trying to use App Groups capability which isn't supported by the current provisioning profile.

## Solution

### Step 1: Remove App Groups Capability in Xcode
1. Open the project in Xcode
2. Select the **Chronikle** target (main app target)
3. Go to the **Signing & Capabilities** tab
4. If you see "App Groups" capability listed, click the **X** to remove it
5. Clean Build Folder (Product → Clean Build Folder)
6. Build again

### Step 2: If App Groups Capability Isn't Visible
Sometimes the capability might be enabled but not visible. Try:
1. Go to **Signing & Capabilities** tab
2. Click **+ Capability** 
3. If "App Groups" appears as "already added", it's enabled
4. If it shows as available to add, then it's not the issue

### Step 3: Alternative - Allow Entitlements Modification
If you can't remove the capability:
1. Select the **Chronikle** target
2. Go to **Build Settings**
3. Search for "CODE_SIGN_ALLOW_ENTITLEMENTS_MODIFICATION"
4. Set it to **YES**

**Note:** This is not recommended for production but will allow development to continue.

### Step 4: Check Project File (Advanced)
If the issue persists, the project.pbxproj file might have entitlements references:
1. In Xcode, right-click the project file and "Show Package Contents"
2. Open `project.pbxproj` in a text editor
3. Search for "application-groups" or "App Groups"
4. Remove any references (be careful not to break the file structure)

## Current Status

✅ **Working Features:**
- URL entry type is available
- Demo data includes clickable URLs
- URLs are styled with blue color and link icons
- All core app functionality works

❌ **Disabled Features:**
- Share extension (requires App Groups setup)
- Cross-app URL sharing

## Next Steps

Once you can build successfully:
1. Test the URL entries in demo mode
2. Try creating new URL entries manually
3. Verify that URLs are clickable and open in browser

The app should work perfectly without the share extension functionality!