---
doc_type: other
project_name: Turbo Code Platform
title: "\U0001F680 Chronikle Action Button & Shortcuts Setup Guide"
version: '1.0'
---

# 🚀 Chronikle Action Button & Shortcuts Setup Guide

## 📱 **Setting Up Your Action Button (iPhone 15 Pro)**

### **Option 1: Quick Voice Entry (Recommended)**
Perfect for capturing thoughts instantly with your Action Button!

1. **Open Shortcuts app**
2. **Tap "+"** to create new shortcut
3. **Add Action** → Search "Chronikle"
4. **Select "Quick Chronikle Voice Entry"**
5. **Customize** (optional):
   - Rename to "Quick Journal"
   - Add icon
6. **Settings** → **Action Button** → **Shortcut**
7. **Select your Chronikle shortcut**

**Usage**: Press Action Button → Speak your thought → Done!

### **Option 2: Text Entry with Prompt**
For when you want to type your entries:

1. **Create new shortcut**
2. **Add "Ask for Input"** action
   - Input Type: Text
   - Prompt: "What's on your mind?"
3. **Add "Add Chronikle Entry"** action
   - Connect text input to Content field
4. **Set as Action Button shortcut**

**Usage**: Press Action Button → Type entry → Tap Done

### **Option 3: Open Chronikle App**
Simple but effective:

1. **Create new shortcut**
2. **Add "Open Chronikle"** action
3. **Set as Action Button shortcut**

**Usage**: Press Action Button → Chronikle opens instantly

## 🎙️ **Voice Entry Shortcuts**

### **Advanced Voice Entry with Type Selection**
1. **Create new shortcut**
2. **Add "Ask for Input"** action
   - Input Type: Text
   - Prompt: "Speak your entry"
   - Allow Dictation: ON
3. **Add "Choose from Menu"**
   - Options: Thought, Idea, Dream, Question
4. **Add "Add Chronikle Entry"** for each menu option
5. **Connect inputs appropriately**

### **Context-Aware Voice Entry**
1. **Add "Get Current Location"** (optional)
2. **Add "Ask for Spoken Text"**
3. **Add "Add Chronikle Entry"**
4. **Include location in entry** if desired

## ⚡ **Siri Shortcuts**

### **Built-in Phrases**
These work automatically after setup:
- *"Add to Chronikle"*
- *"Quick note in Chronikle"* 
- *"Save thought to Chronikle"*
- *"Journal entry"*
- *"Write in Chronikle"*
- *"Open Chronikle"*

### **Custom Siri Phrases**
1. **Record shortcut** in Shortcuts app
2. **Tap shortcut settings** (three dots)
3. **"Add to Siri"**
4. **Record your phrase**: 
   - "Log this thought"
   - "Brain dump"
   - "Quick capture"
   - "Journal this"

## 🔧 **Advanced Automation**

### **Time-Based Auto Journaling**
1. **Create automation** (Personal tab in Shortcuts)
2. **Time of Day** trigger (e.g., 9 PM)
3. **Add "Ask for Input"**: "How was your day?"
4. **Add "Add Chronikle Entry"**
5. **Set entry type**: "Reflection"

### **Location-Based Prompts**
1. **Create automation**
2. **Arrive/Leave** trigger (Home, Work, etc.)
3. **Add contextual prompts**:
   - Arriving home: "What are you grateful for today?"
   - Leaving work: "What did you accomplish?"

### **Focus Mode Integration**
1. **Create automation**
2. **Focus** trigger (Work, Sleep, etc.)
3. **Auto-create entries** based on focus:
   - Work Focus: "Starting focused work session"
   - Sleep Focus: "Reflecting on today"

## 📋 **Pre-Built Shortcut Templates**

### **Morning Pages**
```
Ask for Input: "Morning thoughts?"
Add Chronikle Entry: Content = Input, Type = Thought
```

### **Gratitude Journal**
```
Ask for Input: "What are you grateful for?"
Add Chronikle Entry: Content = "Grateful for: " + Input, Type = Gratitude
```

### **Dream Journal**
```
Ask for Input: "Describe your dream"
Add Chronikle Entry: Content = Input, Type = Dream
```

### **Quick Idea Capture**
```
Ask for Spoken Text
Add Chronikle Entry: Content = Spoken Text, Type = Idea
```

## 🎯 **Pro Tips**

### **Action Button Best Practices**
- **Voice entry** is fastest for Action Button
- **Keep it simple** - fewer taps = better UX
- **Test different phrases** to find what feels natural

### **Siri Optimization**
- **Use consistent phrases** you'll remember
- **Keep phrases short** and natural
- **Train Siri** by using shortcuts regularly

### **Automation Ideas**
- **Daily check-ins** at set times
- **Mood tracking** after meals
- **Work session** start/end logging
- **Travel journaling** based on location

## 🔍 **Troubleshooting**

### **Action Button Not Working?**
1. Check iOS version (requires iOS 16+)
2. Verify shortcut permissions
3. Restart Shortcuts app
4. Re-record voice shortcuts

### **Siri Not Recognizing?**
1. Speak clearly and consistently
2. Re-record phrase in quieter environment
3. Check Siri language settings
4. Use simpler phrases

### **Shortcut Failing?**
1. Test each action individually
2. Check Chronikle app permissions
3. Verify network connection (if using location)
4. Update Chronikle app

## 🌟 **Advanced Workflows**

### **Weekly Review Automation**
- Trigger: Sunday 7 PM
- Action: Generate summary of week's entries
- Output: Create reflection entry

### **Mood Pattern Detection**
- Monitor entry frequency
- Track emotional keywords
- Auto-suggest check-ins during low periods

### **Cross-App Integration**
- Import from other note apps
- Export to Day One, Obsidian, etc.
- Sync with calendar events

---

**🎉 You're all set! Your Action Button is now a direct portal to your thoughts. Press and capture any moment of inspiration instantly!**