# Turbo Domain Apps: Complete Guide

## Overview

This guide provides detailed specifications for each Turbo domain app, showing how they map to the universal TurboPlatform architecture and what makes each unique.

---

## 🔧 TurboCode

**"Project management for developers"**

### Target Audience
- Software developers
- Engineering teams
- DevOps engineers
- Technical project managers

### Core Value Proposition
Native project management that integrates deeply with git workflows, understands code, and works offline.

---

### Domain Mapping

| Platform Concept | TurboCode Implementation |
|-----------------|-------------------------|
| **Container** | Project |
| **Entity** | Issue |
| **Work Item** | Issue (with status tracking) |
| **Mentor** | Engineering Mentor |
| **Documents** | Blueprints, ADRs, Specs |
| **Tags** | Feature, Bug, Enhancement, Tech Debt |
| **Queue** | Work Queue (prioritized issues) |

---

### Data Models

```swift
// Project (Container)
struct Project: Container {
    var id: UUID
    var name: String
    var description: String
    var status: ProjectStatus  // active, on_hold, completed, archived
    var priority: Priority     // low, medium, high, critical
    var completion: Double     // 0-100%
    var workspace: Workspace   // personal, freelance, work

    // Relationships
    var issues: [Issue]
    var milestones: [Milestone]
    var initiatives: [Initiative]
    var blueprints: [Blueprint]

    // Metadata
    var createdAt: Date
    var updatedAt: Date
    var repositoryPath: String?  // Optional git repo path
}

// Issue (Entity + WorkItem)
struct Issue: Entity, WorkItem {
    var id: UUID
    var entityKey: String       // TURBOCODE-42
    var title: String
    var description: String
    var status: IssueStatus     // open, ready, in_progress, review, testing, closed
    var priority: Priority
    var type: IssueType         // feature, bug, task, enhancement, documentation

    // Relationships
    var projectId: UUID
    var assignee: String?
    var milestones: [UUID]
    var initiatives: [UUID]
    var tags: [Tag]
    var blockedBy: [UUID]       // Dependencies
    var blocks: [UUID]

    // Work tracking
    var dueDate: Date?
    var workRank: Int?          // Position in work queue
    var worktreePath: String?   // Active git worktree

    // Metadata
    var createdAt: Date
    var updatedAt: Date
    var closedAt: Date?
}

// Blueprint (Architecture Patterns)
struct Blueprint {
    var id: UUID
    var name: String
    var description: String
    var category: BlueprintCategory  // architecture, testing, styling, database, api
    var version: String
    var isActive: Bool

    // Content
    var patterns: [String]      // Design patterns to follow
    var standards: [String]     // Coding standards
    var rules: [String]         // Linting/validation rules
    var templates: [String]     // Code templates

    var projectId: UUID?
}

// Worktree (Git Integration)
struct Worktree {
    var id: UUID
    var issueId: UUID
    var issueKey: String
    var path: String            // ~/worktrees/turboCode-TURBOCODE-42
    var branch: String          // TURBOCODE-42/fix-auth-bug
    var createdAt: Date
    var isActive: Bool
}
```

---

### Unique Features

#### 1. Git Worktree Integration

```swift
// Start work creates isolated workspace
func startWork(on issue: Issue) async throws {
    // Create worktree
    let worktree = try await GitService.shared.createWorktree(
        for: issue,
        at: "~/worktrees/turboCode-\(issue.entityKey)"
    )

    // Update issue status
    issue.status = .in_progress
    issue.worktreePath = worktree.path

    // Create work log
    WorkLog.start(issueId: issue.id, startedBy: "user")
}

// Submit for review
func submitForReview(issue: Issue, commitURL: URL) async throws {
    // Update issue
    issue.status = .review

    // End work log
    WorkLog.end(issueId: issue.id, commitURL: commitURL)

    // Remove worktree
    try await GitService.shared.removeWorktree(issue.worktreePath)
}
```

#### 2. Entity Keys (JIRA-style)

```
TURBOCODE-1, TURBOCODE-2, ...
MYPROJECT-42
CLIENTWORK-123
```

#### 3. Work Queue with Auto-Ranking

```swift
// Intelligent prioritization
func autoRankIssues() async throws {
    let issues = try await fetchOpenIssues()

    let ranked = issues.sorted { a, b in
        // Score based on:
        // - Priority (critical = 100, high = 75, medium = 50, low = 25)
        // - Age (older = higher score)
        // - Dependencies (blockers resolved = higher)
        // - Due date (closer = higher)

        let scoreA = calculateScore(a)
        let scoreB = calculateScore(b)
        return scoreA > scoreB
    }

    // Assign ranks
    for (index, issue) in ranked.enumerated() {
        issue.workRank = index + 1
    }
}
```

#### 4. Engineering Mentor

```
Persona: Senior software engineer with expertise in architecture,
best practices, code review, and technical decision-making.

Context Includes:
- Current project blueprints
- Open issues and priorities
- Recent commits
- Active worktrees
- Technical documentation
```

---

### UI Screens

**macOS:**
- Menu Bar: Work Queue, Quick Add
- Dashboard: Projects overview, metrics
- Project Detail: Issues, milestones, blueprints
- Issue Detail: Full editor, comments, worktree controls
- Mentor Chat: AI engineering assistant
- Work Queue: Drag-to-rank prioritization

**iOS:**
- Tab Bar: Queue, Projects, Mentor, Profile
- Quick Capture: Voice-to-issue
- Work Queue: Swipe actions (start, complete, defer)
- Issue Detail: Compact view with actions
- Notifications: Issue updates, mentions

**Web:**
- Dashboard: Multi-column layout
- Project Kanban: Drag-and-drop status
- Issue Detail: Rich editor with markdown
- Search: Full-text across projects
- Admin: Settings, team management

---

## 📝 TurboNotes

**"Your second brain"** (Formerly Context)

### Target Audience
- Writers and authors
- Researchers and academics
- Knowledge workers
- Students
- Anyone building personal knowledge

### Core Value Proposition
Native notes app with powerful linking, AI writing assistant, and offline-first architecture that actually respects your thinking process.

---

### Domain Mapping

| Platform Concept | TurboNotes Implementation |
|-----------------|-------------------------|
| **Container** | Notebook |
| **Entity** | Note |
| **Work Item** | Draft (unfinished notes) |
| **Mentor** | Writing Assistant |
| **Documents** | Notes (markdown + rich text) |
| **Tags** | Topics, Areas, Themes |
| **Queue** | Quick Access (pinned/recent) |

---

### Data Models

```swift
// Notebook (Container)
struct Notebook: Container {
    var id: UUID
    var name: String
    var description: String
    var status: NotebookStatus  // active, archived
    var icon: String?           // SF Symbol name

    // Relationships
    var notes: [Note]
    var tags: [Tag]

    // Settings
    var defaultTemplate: String?
    var sortOrder: SortOrder    // manual, alphabetical, dateCreated, dateModified

    var createdAt: Date
    var updatedAt: Date
}

// Note (Entity + WorkItem)
struct Note: Entity, WorkItem {
    var id: UUID
    var title: String
    var content: String         // Markdown content
    var format: NoteFormat      // markdown, rich_text, plain_text

    // Status
    var status: NoteStatus      // draft, published, archived
    var priority: Priority      // For drafts in work queue
    var isPinned: Bool
    var isFavorite: Bool

    // Relationships
    var notebookId: UUID?
    var tags: [Tag]
    var linkedNotes: [UUID]     // Backlinks/forward links
    var attachments: [Attachment]

    // Metadata
    var wordCount: Int
    var readingTime: Int        // Minutes
    var createdAt: Date
    var updatedAt: Date
    var publishedAt: Date?
}

// Literature (Reading List)
struct Literature {
    var id: UUID
    var title: String
    var type: LiteratureType    // article, podcast, book, research_paper
    var url: URL?
    var author: String?
    var source: String?         // Publication/podcast name

    // Content
    var content: String?        // Extracted article text
    var summary: String?        // AI-generated summary
    var notes: String?          // Personal notes

    // Reading tracking
    var isRead: Bool
    var isFavorite: Bool
    var isArchived: Bool
    var progress: Int           // 0-100%

    var createdAt: Date
    var readAt: Date?
}

// Linked Note (Obsidian-style)
struct NoteLink {
    var sourceNoteId: UUID
    var targetNoteId: UUID
    var linkText: String        // Text of the link
    var context: String         // Surrounding paragraph
    var type: LinkType          // mention, reference, citation
}
```

---

### Unique Features

#### 1. Linked Thinking (Obsidian-style)

```swift
// Automatic backlink discovery
func findBacklinks(for note: Note) -> [NoteLink] {
    // Find all notes that link to this one
    let pattern = "\\[\\[\\(note.title)\\]\\]"

    return allNotes.compactMap { sourceNote in
        if sourceNote.content.contains(pattern) {
            return NoteLink(
                sourceNoteId: sourceNote.id,
                targetNoteId: note.id,
                linkText: note.title,
                context: extractContext(sourceNote.content, pattern)
            )
        }
        return nil
    }
}

// Link syntax
[[Note Title]]              // Basic link
[[Note Title|Display Text]] // Custom display text
#tag                        // Tag link
@mention                    // Mention
```

#### 2. Knowledge Graph Visualization

```swift
// Graph view of note relationships
struct KnowledgeGraphView: View {
    let notes: [Note]
    let links: [NoteLink]

    var body: some View {
        Canvas { context, size in
            // Draw nodes (notes)
            for note in notes {
                let position = calculatePosition(note)
                context.fill(
                    Circle().path(in: CGRect(x: position.x, y: position.y, width: 20, height: 20)),
                    with: .color(note.priority.color)
                )
            }

            // Draw edges (links)
            for link in links {
                let start = calculatePosition(link.sourceNote)
                let end = calculatePosition(link.targetNote)
                context.stroke(
                    Path { path in
                        path.move(to: start)
                        path.addLine(to: end)
                    },
                    with: .color(.secondary),
                    lineWidth: 1
                )
            }
        }
    }
}
```

#### 3. Smart Reading List

```swift
// Fetch article from URL (Reader View)
func fetchArticle(from url: URL) async throws -> Literature {
    // Use Readability or similar to extract clean content
    let html = try await URLSession.shared.data(from: url)
    let article = try ArticleExtractor.extract(from: html)

    // AI summary
    let summary = try await AIEngine.shared.summarize(article.content)

    return Literature(
        title: article.title,
        type: .article,
        url: url,
        author: article.author,
        content: article.content,
        summary: summary
    )
}

// RSS feed integration
func fetchRSSFeed(from url: URL) async throws -> [Literature] {
    let feed = try await RSSParser.parse(url)

    return feed.items.map { item in
        Literature(
            title: item.title,
            type: .article,
            url: item.url,
            author: item.author,
            source: feed.title
        )
    }
}
```

#### 4. Writing Assistant Mentor

```
Persona: Experienced editor and writing coach. Helps with
structure, clarity, grammar, and style. Encourages good
writing habits and provides constructive feedback.

Context Includes:
- Current note being written
- Related notes via links
- Writing goals and targets
- Recent reading list items
- Personal writing style preferences
```

#### 5. Templates

```markdown
# Daily Note Template
Date: {{date}}
Weather: {{weather}}

## Morning Reflection
What are my top 3 priorities today?
1.
2.
3.

## Notes
[Free-form notes throughout the day]

## Evening Review
What did I accomplish?
What did I learn?
What am I grateful for?

---
# Meeting Notes Template
Meeting: {{meeting_title}}
Date: {{date}}
Attendees: {{attendees}}

## Agenda
- [ ]
- [ ]

## Discussion Notes

## Action Items
- [ ]

## Follow-up
```

---

### UI Screens

**macOS:**
- Menu Bar: Quick capture, recent notes
- Sidebar: Notebooks, tags, favorites
- Editor: Split view (edit + preview)
- Graph View: Visual knowledge graph
- Reading List: Articles/podcasts queue
- Mentor: Writing assistant chat

**iOS:**
- Browse: Notebooks and notes
- Editor: Distraction-free writing
- Quick Capture: Voice note-to-text
- Graph: Interactive touch graph
- Reading: Saved articles
- Widgets: Daily note, quick capture

**Web:**
- Dashboard: Recent notes, pinned
- Editor: Rich text editing
- Search: Full-text with highlighting
- Public Sharing: Published notes

---

## 🎵 TurboMusic

**"Studio management for producers"**

### Target Audience
- Music producers
- Audio engineers
- Songwriters
- Beatmakers
- Home studio musicians

### Core Value Proposition
Organize your music production workflow like software development - track progress, manage versions, store ideas, and get AI production advice.

---

### Domain Mapping

| Platform Concept | TurboMusic Implementation |
|-----------------|-------------------------|
| **Container** | Album / EP / Project |
| **Entity** | Track |
| **Work Item** | Track (with production status) |
| **Mentor** | Production Mentor |
| **Documents** | Lyrics, Charts, Arrangements |
| **Tags** | Genres, Moods, Instruments |
| **Queue** | Recording Queue (next to work on) |

---

### Data Models

```swift
// Album (Container)
struct Album: Container {
    var id: UUID
    var name: String
    var description: String
    var status: AlbumStatus     // writing, recording, mixing, mastering, released
    var releaseDate: Date?
    var completion: Double

    // Music metadata
    var artist: String
    var genre: String?
    var artwork: URL?
    var label: String?

    // Relationships
    var tracks: [Track]
    var collaborators: [Collaborator]

    var createdAt: Date
    var updatedAt: Date
}

// Track (Entity + WorkItem)
struct Track: Entity, WorkItem {
    var id: UUID
    var entityKey: String       // TR-1, TR-2, ...
    var title: String
    var description: String

    // Production status
    var status: TrackStatus     // idea, demo, tracking, mixing, mastering, done
    var priority: Priority
    var dueDate: Date?

    // Music metadata
    var bpm: Int?
    var musicalKey: MusicalKey? // C, C#, D, etc.
    var timeSignature: String?  // 4/4, 3/4, 6/8, etc.
    var duration: TimeInterval?

    // Audio files
    var audioFileURL: URL?      // Latest version
    var waveformData: Data?     // Visual waveform
    var versions: [TrackVersion]

    // Relationships
    var albumId: UUID?
    var lyrics: String?
    var chordChart: String?
    var arrangement: String?
    var tags: [Tag]             // Genre, mood, instruments

    // Collaboration
    var producedBy: [String]
    var writtenBy: [String]
    var featuring: [String]?

    var createdAt: Date
    var updatedAt: Date
}

// Track Version (Git-like versioning)
struct TrackVersion {
    var id: UUID
    var trackId: UUID
    var version: String         // v1.0, v2.0, v2.1-mix-test
    var audioFileURL: URL
    var notes: String?          // What changed
    var createdAt: Date
    var createdBy: String
}

// Sample (Audio library management)
struct Sample {
    var id: UUID
    var name: String
    var category: SampleCategory // drums, bass, synth, fx, vocal
    var fileURL: URL
    var bpm: Int?
    var key: MusicalKey?
    var duration: TimeInterval
    var tags: [Tag]
    var isFavorite: Bool
}
```

---

### Unique Features

#### 1. Audio Playback & Waveforms

```swift
import AVFoundation

class AudioPlayerService {
    private var player: AVAudioPlayer?

    func play(_ track: Track) async throws {
        guard let url = track.audioFileURL else { return }

        player = try AVAudioPlayer(contentsOf: url)
        player?.play()
    }

    func generateWaveform(from url: URL) async throws -> Data {
        let asset = AVAsset(url: url)
        let reader = try AVAssetReader(asset: asset)

        // Extract audio samples
        let audioTrack = asset.tracks(withMediaType: .audio).first!
        let output = AVAssetReaderTrackOutput(
            track: audioTrack,
            outputSettings: nil
        )

        reader.add(output)
        reader.startReading()

        // Process samples into waveform data
        var samples: [Float] = []
        while let sampleBuffer = output.copyNextSampleBuffer() {
            // Extract amplitude values
            samples.append(contentsOf: extractAmplitudes(sampleBuffer))
        }

        // Downsample for visualization
        let waveform = downsample(samples, to: 1000)
        return try JSONEncoder().encode(waveform)
    }
}
```

#### 2. BPM Tapper

```swift
struct BPMTapper: View {
    @State private var taps: [Date] = []
    @State private var bpm: Int?

    var body: some View {
        VStack {
            Text(bpm.map { "\($0) BPM" } ?? "Tap to detect BPM")
                .font(.largeTitle)

            Button("Tap") {
                taps.append(Date())

                // Calculate BPM from last 4 taps
                if taps.count >= 4 {
                    let intervals = zip(taps.dropFirst(), taps).map {
                        $0.timeIntervalSince($1)
                    }
                    let avgInterval = intervals.reduce(0, +) / Double(intervals.count)
                    bpm = Int(60.0 / avgInterval)
                }

                // Reset after 3 seconds of inactivity
                Task {
                    try await Task.sleep(nanoseconds: 3_000_000_000)
                    if taps.last!.timeIntervalSinceNow < -3 {
                        taps.removeAll()
                    }
                }
            }
            .buttonStyle(.borderedProminent)
            .keyboardShortcut(.space)
        }
    }
}
```

#### 3. Sample Library

```swift
class SampleLibrary {
    func importSample(from url: URL) async throws -> Sample {
        // Extract audio metadata
        let asset = AVAsset(url: url)
        let duration = try await asset.load(.duration).seconds

        // Detect BPM and key (using ML or third-party library)
        let bpm = try await detectBPM(from: url)
        let key = try await detectKey(from: url)

        return Sample(
            name: url.deletingPathExtension().lastPathComponent,
            category: categorizeByFilename(url.lastPathComponent),
            fileURL: url,
            bpm: bpm,
            key: key,
            duration: duration
        )
    }

    func search(query: String, filters: SampleFilters) -> [Sample] {
        samples.filter { sample in
            // Text search
            sample.name.localizedCaseInsensitiveContains(query) &&

            // Filter by BPM range
            (filters.bpmMin...filters.bpmMax).contains(sample.bpm ?? 0) &&

            // Filter by key
            (filters.key == nil || sample.key == filters.key) &&

            // Filter by category
            (filters.category == nil || sample.category == filters.category)
        }
    }
}
```

#### 4. Production Mentor

```
Persona: Experienced music producer with 15+ years in the industry.
Expertise in arrangement, mixing, sound design, and creative decisions.
Encouraging but honest about what works.

Context Includes:
- Current album/project
- Track in progress (BPM, key, status)
- Recent production notes
- Sample library (if searching for sounds)
- Arrangement and lyrics docs
```

#### 5. Export & Stems

```swift
func exportStems(for track: Track) async throws -> URL {
    guard let projectFile = track.audioFileURL else {
        throw ExportError.noAudioFile
    }

    // Parse DAW project file (Logic, Ableton, FL Studio)
    let project = try await DAWParser.parse(projectFile)

    // Export each track as individual stem
    let stems: [URL] = try await project.tracks.asyncMap { track in
        try await exportTrack(track, to: stemsDirectory)
    }

    // Create zip file
    let zipURL = FileManager.default.temporaryDirectory
        .appendingPathComponent("\(track.title)-stems.zip")

    try await ZipArchive.create(at: zipURL, with: stems)

    return zipURL
}
```

---

### UI Screens

**macOS:**
- Studio View: Album + tracks grid
- Track Detail: Audio player, waveform, versions
- Lyrics Editor: Split view (lyrics + chords)
- Sample Browser: Searchable library with preview
- Mixer View: Level controls, pan, FX
- Mentor: Production assistant

**iOS:**
- Projects: Albums grid with artwork
- Recording Queue: Swipe to start/complete
- Voice Memos: Quick idea capture
- Lyrics: Mobile-friendly editor
- Sample Pack: Browse and preview
- Widgets: Quick record, recent tracks

---

## 💪 TurboFitness

**"Your personal trainer"**

### Target Audience
- Athletes and fitness enthusiasts
- Personal trainers
- People starting fitness journey
- Anyone tracking workouts

### Core Value Proposition
Structured workout programming with progress tracking, form videos, nutrition planning, and AI trainer guidance - all offline-first.

---

### Domain Mapping

| Platform Concept | TurboFitness Implementation |
|-----------------|-------------------------|
| **Container** | Program / Training Block |
| **Entity** | Workout |
| **Work Item** | Scheduled Session |
| **Mentor** | Trainer AI |
| **Documents** | Exercise guides, meal plans |
| **Tags** | Muscle groups, goals |
| **Queue** | Today's Workout |

---

### Data Models

```swift
// Program (Container)
struct Program: Container {
    var id: UUID
    var name: String
    var description: String
    var status: ProgramStatus   // planning, active, completed
    var goal: FitnessGoal       // strength, hypertrophy, endurance, weight_loss

    // Schedule
    var startDate: Date
    var endDate: Date
    var duration: Int           // Weeks
    var frequency: Int          // Workouts per week

    // Relationships
    var workouts: [Workout]
    var progressPhotos: [ProgressPhoto]
    var measurements: [Measurement]

    var completion: Double
    var createdAt: Date
    var updatedAt: Date
}

// Workout (Entity + WorkItem)
struct Workout: Entity, WorkItem {
    var id: UUID
    var entityKey: String       // WO-1, WO-2, ...
    var title: String           // "Push Day A", "Leg Day", "Full Body"
    var description: String

    // Workout details
    var type: WorkoutType       // strength, cardio, hiit, yoga, sport
    var duration: TimeInterval  // Estimated time
    var difficulty: Difficulty  // beginner, intermediate, advanced

    // Scheduling
    var scheduledDate: Date?
    var completedAt: Date?
    var status: WorkoutStatus   // planned, in_progress, completed, skipped

    // Exercises
    var exercises: [Exercise]

    // Metrics
    var totalVolume: Double     // Total weight lifted (lbs/kg)
    var totalReps: Int
    var caloriesBurned: Int?

    // Relationships
    var programId: UUID?
    var tags: [Tag]             // Muscle groups worked

    var createdAt: Date
    var updatedAt: Date
}

// Exercise
struct Exercise {
    var id: UUID
    var name: String
    var muscleGroup: MuscleGroup // chest, back, legs, shoulders, arms, core
    var equipment: Equipment     // barbell, dumbbell, machine, bodyweight

    // Performance
    var sets: Int
    var reps: Int
    var weight: Double?          // lbs or kg
    var restPeriod: Int?         // Seconds

    // Instructions
    var instructions: String?
    var formVideoURL: URL?
    var notes: String?

    // Tracking
    var completed: Bool
    var actualSets: [ExerciseSet]
}

// Exercise Set (Actual performance)
struct ExerciseSet {
    var setNumber: Int
    var reps: Int
    var weight: Double
    var rpe: Int?                // Rate of Perceived Exertion (1-10)
    var notes: String?
}

// Progress Photo
struct ProgressPhoto {
    var id: UUID
    var programId: UUID
    var imageURL: URL
    var takenAt: Date
    var weight: Double?
    var bodyFat: Double?
    var notes: String?
}

// Meal Plan
struct MealPlan {
    var id: UUID
    var name: String
    var dailyCalories: Int
    var macros: Macros           // Protein, carbs, fat
    var meals: [Meal]
    var programId: UUID?
}

struct Meal {
    var name: String             // Breakfast, Lunch, Dinner, Snack
    var foods: [Food]
    var totalCalories: Int
    var macros: Macros
}
```

---

### Unique Features

#### 1. Workout Timer & Rest Periods

```swift
class WorkoutTimer: ObservableObject {
    @Published var timeRemaining: Int
    @Published var isRunning: Bool = false

    func startRestTimer(duration: Int) {
        timeRemaining = duration
        isRunning = true

        Timer.scheduledTimer(withTimeInterval: 1, repeats: true) { timer in
            if self.timeRemaining > 0 {
                self.timeRemaining -= 1
            } else {
                timer.invalidate()
                self.isRunning = false
                self.playCompletionSound()
            }
        }
    }
}

struct RestTimerView: View {
    @ObservedObject var timer: WorkoutTimer

    var body: some View {
        VStack {
            Text("\(timer.timeRemaining)s")
                .font(.system(size: 72, weight: .bold))

            HStack {
                Button("Add 15s") { timer.timeRemaining += 15 }
                Button("Skip") { timer.timeRemaining = 0 }
            }
        }
    }
}
```

#### 2. Progress Tracking & Charts

```swift
import Charts

struct ProgressChart: View {
    let workouts: [Workout]
    let exercise: String

    var body: some View {
        Chart {
            ForEach(workoutHistory(for: exercise)) { entry in
                LineMark(
                    x: .value("Date", entry.date),
                    y: .value("Max Weight", entry.maxWeight)
                )
                .foregroundStyle(.blue)

                PointMark(
                    x: .value("Date", entry.date),
                    y: .value("Max Weight", entry.maxWeight)
                )
            }
        }
        .chartXAxis {
            AxisMarks(values: .stride(by: .week))
        }
        .chartYAxis {
            AxisMarks { value in
                AxisValueLabel("\(value.as(Double.self)!) lbs")
            }
        }
    }
}
```

#### 3. Form Check Videos

```swift
// Upload form check video
func uploadFormCheck(for exercise: Exercise, video: URL) async throws {
    // Store video
    let storedURL = try await StorageService.shared.upload(video)

    // Optional: AI form analysis
    let analysis = try await AIFormChecker.analyze(video)

    // Save to exercise
    exercise.formVideoURL = storedURL
    exercise.formNotes = analysis.feedback
}

// View form video
struct FormVideoPlayer: View {
    let videoURL: URL

    var body: some View {
        VideoPlayer(player: AVPlayer(url: videoURL))
            .frame(height: 300)
            .overlay(alignment: .topTrailing) {
                Button("Slow-mo") {
                    player.rate = 0.5
                }
            }
    }
}
```

#### 4. Trainer AI

```
Persona: Certified personal trainer with expertise in strength
training, programming, form correction, and motivation. Supportive
and encouraging but ensures proper form and recovery.

Context Includes:
- Current program and phase
- Recent workouts and performance
- Progress photos and measurements
- Injury history or limitations
- Fitness goals
- Nutrition plan
```

#### 5. Apple Health Integration

```swift
import HealthKit

class HealthKitService {
    let healthStore = HKHealthStore()

    func requestAuthorization() async throws {
        let types: Set<HKSampleType> = [
            HKObjectType.quantityType(forIdentifier: .activeEnergyBurned)!,
            HKObjectType.quantityType(forIdentifier: .bodyMass)!,
            HKObjectType.workoutType()
        ]

        try await healthStore.requestAuthorization(toShare: types, read: types)
    }

    func saveWorkout(_ workout: Workout) async throws {
        let hkWorkout = HKWorkout(
            activityType: workout.type.hkActivityType,
            start: workout.startedAt!,
            end: workout.completedAt!,
            duration: workout.duration,
            totalEnergyBurned: HKQuantity(
                unit: .kilocalorie(),
                doubleValue: Double(workout.caloriesBurned ?? 0)
            ),
            totalDistance: nil,
            metadata: [
                "Program": workout.programId.uuidString,
                "TotalVolume": workout.totalVolume
            ]
        )

        try await healthStore.save(hkWorkout)
    }
}
```

---

### UI Screens

**macOS:**
- Programs: Grid of training programs
- Calendar: Month view with scheduled workouts
- Workout Detail: Exercise list, timer, notes
- Progress Dashboard: Charts, photos, metrics
- Meal Planner: Weekly meal grid
- Trainer Chat: AI coaching

**iOS:**
- Today: Current workout with timer
- Programs: Browse and select
- Exercise Library: Searchable with videos
- Progress: Photos and measurements
- Nutrition: Meal logging
- Widgets: Today's workout, quick start

**Apple Watch:**
- Workout mode: Sets/reps tracker
- Rest timer
- Heart rate monitoring
- Activity rings integration

---

## Domain Comparison Matrix

| Feature | TurboCode | TurboNotes | TurboMusic | TurboFitness |
|---------|-----------|-----------|------------|--------------|
| **Primary Action** | Fix/Build | Write/Link | Record/Mix | Train/Track |
| **Work Unit** | Issue | Note | Track | Workout |
| **Container** | Project | Notebook | Album | Program |
| **Completion** | Close Issue | Publish | Release | Complete Session |
| **Versioning** | Git Commits | Note History | Track Versions | Workout Logs |
| **Collaboration** | Code Review | Shared Notes | Features/Credits | Trainer Review |
| **Offline Critical** | Yes (git) | Yes (writing) | Yes (audio) | Yes (gym) |
| **AI Mentor Focus** | Engineering | Writing | Production | Training |
| **Media Type** | Code/Docs | Text/Images | Audio/Waveforms | Videos/Photos |
| **Key Metric** | Issues Closed | Notes Created | Tracks Finished | Workouts Done |

---

## Conclusion

Each domain app provides a specialized experience while leveraging the universal TurboPlatform:

- **Same foundation** → Sync, storage, AI, cross-platform
- **Different interfaces** → Optimized for domain workflows
- **Shared patterns** → Consistent UX, easy to learn
- **Unique features** → Domain-specific tools that matter

**Result:** Build domain apps in weeks, not months. Focus on what makes each domain special, not rebuilding infrastructure.

---

**Next Steps:**
1. Choose which domain to build next (recommend TurboNotes - quickest win)
2. Define domain models (4 hours)
3. Customize UI for domain (1-2 weeks)
4. Deploy across platforms (already done!)

See [TURBO_PLATFORM_VISION.md](./TURBO_PLATFORM_VISION.md) for overall strategy.
