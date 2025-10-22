---
doc_type: other
project_name: Turbo Code Platform
title: Share Extension Setup Guide
version: '1.0'
---

# Share Extension Setup Guide

This guide explains how to add the share extension target to enable sharing URLs from any app to Chronikle.

## ⚠️ Current Status

**App Groups functionality is temporarily disabled** due to provisioning profile limitations. The URL type and demo data are ready, but the share extension requires App Groups to be configured in your Apple Developer account.

## Immediate Solution

The main app now includes:
- ✅ URL entry type 
- ✅ URL demo data with clickable links
- ✅ Visual styling for URLs (blue color, link icon)

The share extension functionality is ready but disabled until App Groups are properly configured.

## Files Created

The following files have been created for the share extension:

- `/ChronikleShareExtension/ShareViewController.swift` - Main share extension logic
- `/ChronikleShareExtension/Info.plist` - Extension configuration
- `/ChronikleShareExtension/Base.lproj/MainInterface.storyboard` - UI interface
- `/ChronikleShareExtension/ChronikleShareExtension.entitlements` - App group entitlements

## Setup Instructions

### 1. Add Share Extension Target in Xcode

1. Open the Chronikle project in Xcode
2. File → New → Target
3. Choose "Share Extension" from iOS templates
4. Product Name: `ChronikleShareExtension`
5. Bundle Identifier: `com.chronikle.ChronikleShareExtension` (adjust to match your team)
6. Click "Finish"

### 2. Replace Generated Files

Replace the generated ShareViewController.swift, Info.plist, and MainInterface.storyboard with the ones created in this repository.

### 3. Add App Groups Capability

#### For Main App:
1. Select Chronikle target
2. Go to "Signing & Capabilities"
3. Click "+" and add "App Groups"
4. Add group: `group.com.chronikle.shared`

#### For Share Extension:
1. Select ChronikleShareExtension target
2. Go to "Signing & Capabilities" 
3. Click "+" and add "App Groups"
4. Add group: `group.com.chronikle.shared`

### 4. Configure Bundle Identifiers

Ensure your bundle identifiers follow this pattern:
- Main app: `com.yourteam.chronikle`
- Share extension: `com.yourteam.chronikle.ChronikleShareExtension`

### 5. Update Entitlements

The entitlements files have been updated to include the app group. Make sure both targets use the correct entitlements files.

## How It Works

1. User shares URL from Safari, Twitter, etc.
2. "Save to Chronikle" appears in share sheet
3. URL is saved to shared UserDefaults container
4. When Chronikle app becomes active, it imports shared entries
5. URLs appear as entries with "URL" type
6. URLs are clickable links that open in default browser

## Features

- **Auto-detection**: Automatically detects URLs and plain text containing URLs
- **Deduplication**: Prevents duplicate entries on the same day
- **App Groups**: Uses secure app groups for data sharing between main app and extension
- **Success Feedback**: Shows confirmation alert when URL is saved
- **Clickable Links**: URLs in entries are clickable and open in browser

## Testing

1. Build and run the main app first
2. Build the share extension target
3. Open Safari and navigate to any website
4. Tap share button
5. Look for "Save to Chronikle" in the share sheet
6. Tap it to save the URL
7. Return to Chronikle app to see the saved URL

## Troubleshooting

- **Share extension not appearing**: Check bundle identifiers and signing
- **URLs not importing**: Verify app group configuration matches between targets
- **Crashes**: Check that both targets have proper entitlements and signing