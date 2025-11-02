# TurboPlatform: Shared Components Library

## Overview

This document defines the reusable components, patterns, and abstractions that form the TurboPlatform foundation. These components work across all domain apps (TurboCode, TurboNotes, TurboMusic, TurboFitness) and all platforms (macOS, iOS, Web, Android).

---

## Architecture Layers

```
┌─────────────────────────────────────────────────┐
│         Application Layer (Domain Apps)          │  TurboCode, TurboNotes, etc.
└──────────────────────┬──────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────┐
│         Presentation Layer (UI Components)       │  Reusable views
└──────────────────────┬──────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────┐
│         Business Logic Layer (Services)          │  Sync, AI, Search
└──────────────────────┬──────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────┐
│         Data Layer (Models + Storage)            │  Core protocols
└──────────────────────┬──────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────┐
│         Infrastructure Layer (Sync + Backend)    │  Network, CloudKit
└─────────────────────────────────────────────────┘
```

---

## Core Data Models

### Base Protocols

```swift
// TurboPlatform/Core/Models/Entity.swift

/// Base entity protocol - all items inherit from this
protocol Entity: Identifiable, Codable, Hashable {
    var id: UUID { get }
    var title: String { get set }
    var description: String { get set }
    var createdAt: Date { get }
    var updatedAt: Date { get set }
    var tags: [Tag] { get set }

    static var entityType: String { get }
}

extension Entity {
    static var entityType: String {
        String(describing: Self.self).lowercased()
    }
}
```

```swift
// TurboPlatform/Core/Models/Container.swift

/// Container protocol - projects, notebooks, albums, programs
protocol Container: Entity {
    associatedtype Item: Entity

    var name: String { get set }
    var status: ContainerStatus { get set }
    var completion: Double { get }
    var items: [Item] { get set }

    func calculateCompletion() -> Double
}

enum ContainerStatus: String, Codable {
    case active
    case onHold = "on_hold"
    case completed
    case archived
}

extension Container {
    func calculateCompletion() -> Double {
        guard !items.isEmpty else { return 0.0 }

        let completedCount = items.filter { item in
            if let workItem = item as? WorkItem {
                return workItem.isCompleted
            }
            return false
        }.count

        return Double(completedCount) / Double(items.count) * 100.0
    }
}
```

```swift
// TurboPlatform/Core/Models/WorkItem.swift

/// Work item protocol - trackable, prioritizable items
protocol WorkItem: Entity {
    var status: WorkStatus { get set }
    var priority: Priority { get set }
    var dueDate: Date? { get set }
    var assignee: String? { get set }

    var isCompleted: Bool { get }
    var isOverdue: Bool { get }
}

enum WorkStatus: String, Codable, CaseIterable {
    case open
    case ready
    case inProgress = "in_progress"
    case review
    case testing
    case completed
    case blocked
}

enum Priority: String, Codable, CaseIterable {
    case low
    case medium
    case high
    case critical

    var score: Int {
        switch self {
        case .low: return 25
        case .medium: return 50
        case .high: return 75
        case .critical: return 100
        }
    }

    var color: Color {
        switch self {
        case .low: return .gray
        case .medium: return .blue
        case .high: return .orange
        case .critical: return .red
        }
    }
}

extension WorkItem {
    var isCompleted: Bool {
        status == .completed
    }

    var isOverdue: Bool {
        guard let due = dueDate else { return false }
        return due < Date() && !isCompleted
    }
}
```

```swift
// TurboPlatform/Core/Models/Tag.swift

struct Tag: Codable, Hashable, Identifiable {
    let id: UUID
    var name: String
    var color: String  // Hex color
    var description: String?

    init(name: String, color: String, description: String? = nil) {
        self.id = UUID()
        self.name = name
        self.color = color
        self.description = description
    }

    var uiColor: Color {
        Color(hex: color)
    }
}
```

```swift
// TurboPlatform/Core/Models/Comment.swift

struct Comment: Identifiable, Codable {
    let id: UUID
    let entityId: UUID
    let entityType: String
    var content: String
    let authorName: String
    let authorType: AuthorType
    let createdAt: Date
    var updatedAt: Date

    enum AuthorType: String, Codable {
        case user
        case ai
    }
}
```

---

## Storage Layer

### Local Storage Provider

```swift
// TurboPlatform/Core/Services/StorageProvider.swift

import SQLite

actor StorageProvider {
    static let shared = StorageProvider()

    private let db: Connection
    private let location: URL

    private init() {
        // Use App Group container if available
        if let container = FileManager.default.containerURL(
            forSecurityApplicationGroupIdentifier: "group.com.turbo.shared"
        ) {
            location = container.appendingPathComponent("turbo.sqlite")
        } else {
            // Fallback to app support directory
            let dir = FileManager.default.urls(
                for: .applicationSupportDirectory,
                in: .userDomainMask
            )[0]
            location = dir.appendingPathComponent("turbo.sqlite")
        }

        db = try! Connection(location.path)
        try! setupDatabase()
    }

    private func setupDatabase() throws {
        // Enable WAL mode for better concurrency
        try db.execute("PRAGMA journal_mode = WAL")
        try db.execute("PRAGMA synchronous = NORMAL")
        try db.execute("PRAGMA foreign_keys = ON")
    }

    // Generic CRUD operations
    func save<T: Entity>(_ entity: T) throws {
        let json = try JSONEncoder().encode(entity)
        let jsonString = String(data: json, encoding: .utf8)!

        let table = Table(T.entityType)
        let id = Expression<String>("id")
        let data = Expression<String>("data")
        let createdAt = Expression<Date>("created_at")
        let updatedAt = Expression<Date>("updated_at")

        try db.run(table.insert(
            or: .replace,
            id <- entity.id.uuidString,
            data <- jsonString,
            createdAt <- entity.createdAt,
            updatedAt <- entity.updatedAt
        ))
    }

    func fetch<T: Entity>(_ type: T.Type, id: UUID) throws -> T? {
        let table = Table(type.entityType)
        let idCol = Expression<String>("id")
        let data = Expression<String>("data")

        let query = table.filter(idCol == id.uuidString)

        for row in try db.prepare(query) {
            let jsonData = row[data].data(using: .utf8)!
            return try JSONDecoder().decode(T.self, from: jsonData)
        }

        return nil
    }

    func fetchAll<T: Entity>(_ type: T.Type) throws -> [T] {
        let table = Table(type.entityType)
        let data = Expression<String>("data")

        var entities: [T] = []

        for row in try db.prepare(table) {
            let jsonData = row[data].data(using: .utf8)!
            let entity = try JSONDecoder().decode(T.self, from: jsonData)
            entities.append(entity)
        }

        return entities
    }

    func delete<T: Entity>(_ type: T.Type, id: UUID) throws {
        let table = Table(type.entityType)
        let idCol = Expression<String>("id")

        let query = table.filter(idCol == id.uuidString)
        try db.run(query.delete())
    }

    func query<T: Entity>(
        _ type: T.Type,
        where predicate: (T) -> Bool
    ) throws -> [T] {
        let all = try fetchAll(type)
        return all.filter(predicate)
    }
}
```

---

## Sync Engine

### Multi-Layer Sync

```swift
// TurboPlatform/Core/Services/SyncEngine.swift

actor SyncEngine<T: Entity> {
    private let local = StorageProvider.shared
    private let cloud = CloudKitSync<T>()
    private let backend = BackendSync<T>()
    private let queue = SyncQueue<T>()

    private var syncInProgress = false

    /// Save entity with multi-layer sync
    func save(_ entity: T) async throws {
        // Layer 1: Local (instant)
        try await local.save(entity)

        // Layer 2: iCloud (background)
        Task.detached(priority: .utility) {
            try? await self.cloud.save(entity)
        }

        // Layer 3: Backend (background, queued if offline)
        if NetworkMonitor.shared.isConnected {
            Task.detached(priority: .background) {
                try? await self.backend.save(entity)
            }
        } else {
            await queue.enqueue(.create(entity))
        }
    }

    /// Fetch with smart fallback
    func fetch(id: UUID) async throws -> T? {
        // Try local first (fastest)
        if let local = try await local.fetch(T.self, id: id) {
            return local
        }

        // Try backend if online
        if NetworkMonitor.shared.isConnected {
            if let remote = try? await backend.fetch(id: id) {
                try await local.save(remote)  // Cache locally
                return remote
            }
        }

        return nil
    }

    /// Full sync across all layers
    func sync() async throws {
        guard !syncInProgress else { return }
        syncInProgress = true
        defer { syncInProgress = false }

        guard NetworkMonitor.shared.isConnected else {
            throw SyncError.offline
        }

        // Pull from backend (source of truth)
        let serverEntities = try await backend.fetchAll()

        // Merge with local
        for entity in serverEntities {
            try await local.save(entity)
        }

        // Push queued changes
        let pending = await queue.dequeueAll()
        for operation in pending {
            switch operation {
            case .create(let entity):
                try await backend.save(entity)
            case .update(let entity):
                try await backend.save(entity)
            case .delete(let id):
                try await backend.delete(id: id)
            }
        }

        // Update last sync timestamp
        UserDefaults.standard.set(Date(), forKey: "lastSync_\(T.entityType)")
    }

    /// Start periodic background sync
    func startPeriodicSync(interval: TimeInterval = 300) {
        Task.detached {
            while true {
                try? await Task.sleep(nanoseconds: UInt64(interval * 1_000_000_000))
                try? await self.sync()
            }
        }
    }
}
```

### Sync Queue (Offline Support)

```swift
// TurboPlatform/Core/Services/SyncQueue.swift

actor SyncQueue<T: Entity> {
    enum Operation: Codable {
        case create(T)
        case update(T)
        case delete(UUID)
    }

    private var operations: [Operation] = []
    private let storageKey = "syncQueue_\(T.entityType)"

    init() {
        loadQueue()
    }

    func enqueue(_ operation: Operation) {
        operations.append(operation)
        saveQueue()
    }

    func dequeueAll() -> [Operation] {
        let ops = operations
        operations.removeAll()
        saveQueue()
        return ops
    }

    func count() -> Int {
        operations.count
    }

    private func saveQueue() {
        if let data = try? JSONEncoder().encode(operations) {
            UserDefaults.standard.set(data, forKey: storageKey)
        }
    }

    private func loadQueue() {
        guard let data = UserDefaults.standard.data(forKey: storageKey) else { return }
        operations = (try? JSONDecoder().decode([Operation].self, from: data)) ?? []
    }
}
```

---

## UI Components

### EntityListView (Generic List)

```swift
// TurboPlatform/Components/EntityListView.swift

import SwiftUI

struct EntityListView<T: Entity, RowContent: View>: View {
    let entities: [T]
    let rowContent: (T) -> RowContent
    let onSelect: (T) -> Void
    let onDelete: ((T) -> Void)?

    @State private var searchText = ""

    init(
        entities: [T],
        onSelect: @escaping (T) -> Void,
        onDelete: ((T) -> Void)? = nil,
        @ViewBuilder rowContent: @escaping (T) -> RowContent
    ) {
        self.entities = entities
        self.onSelect = onSelect
        self.onDelete = onDelete
        self.rowContent = rowContent
    }

    var filteredEntities: [T] {
        if searchText.isEmpty {
            return entities
        }
        return entities.filter {
            $0.title.localizedCaseInsensitiveContains(searchText) ||
            $0.description.localizedCaseInsensitiveContains(searchText)
        }
    }

    var body: some View {
        List {
            ForEach(filteredEntities) { entity in
                Button {
                    onSelect(entity)
                } label: {
                    rowContent(entity)
                }
                .buttonStyle(.plain)
                .swipeActions(edge: .trailing, allowsFullSwipe: false) {
                    if let onDelete = onDelete {
                        Button(role: .destructive) {
                            onDelete(entity)
                        } label: {
                            Label("Delete", systemImage: "trash")
                        }
                    }
                }
            }
        }
        .searchable(text: $searchText, prompt: "Search \(T.entityType)...")
    }
}
```

### WorkQueueView (Generic Work Queue)

```swift
// TurboPlatform/Components/WorkQueueView.swift

import SwiftUI

struct WorkQueueView<T: WorkItem, CardContent: View>: View {
    @StateObject var viewModel: WorkQueueViewModel<T>
    let cardContent: (T) -> CardContent

    var body: some View {
        VStack(alignment: .leading, spacing: 0) {
            // Header
            HStack {
                Text("Work Queue")
                    .font(.title2.bold())

                Spacer()

                Button {
                    Task {
                        await viewModel.autoRank()
                    }
                } label: {
                    Label("Auto-Rank", systemImage: "wand.and.stars")
                }
            }
            .padding()

            // Queue
            if viewModel.items.isEmpty {
                ContentUnavailableView(
                    "No Items",
                    systemImage: "tray",
                    description: Text("Your work queue is empty")
                )
            } else {
                List {
                    ForEach(viewModel.items) { item in
                        WorkItemCard(item: item) {
                            cardContent(item)
                        }
                    }
                    .onMove { from, to in
                        viewModel.move(from: from, to: to)
                    }
                }
                .listStyle(.plain)
            }
        }
    }
}

@MainActor
class WorkQueueViewModel<T: WorkItem>: ObservableObject {
    @Published var items: [T] = []

    private let syncEngine = SyncEngine<T>()

    func loadItems() async {
        do {
            items = try await syncEngine.fetchAll()
                .filter { !$0.isCompleted }
                .sorted { ($0 as? Rankable)?.workRank ?? 999 < ($1 as? Rankable)?.workRank ?? 999 }
        } catch {
            print("Failed to load items: \(error)")
        }
    }

    func autoRank() async {
        // Score-based ranking
        items = items.sorted { a, b in
            calculateScore(a) > calculateScore(b)
        }

        // Assign ranks
        for (index, item) in items.enumerated() {
            if var rankable = item as? Rankable {
                rankable.workRank = index + 1
                try? await syncEngine.save(item)
            }
        }
    }

    func move(from source: IndexSet, to destination: Int) {
        items.move(fromOffsets: source, toOffset: destination)

        // Update ranks
        for (index, item) in items.enumerated() {
            if var rankable = item as? Rankable {
                rankable.workRank = index + 1
                Task {
                    try? await syncEngine.save(item)
                }
            }
        }
    }

    private func calculateScore(_ item: T) -> Int {
        var score = item.priority.score

        // Age factor (older = higher priority)
        let age = Date().timeIntervalSince(item.createdAt) / 86400  // Days
        score += Int(age * 2)

        // Overdue factor
        if item.isOverdue {
            score += 50
        }

        return score
    }
}

protocol Rankable {
    var workRank: Int? { get set }
}
```

### QuickCaptureSheet (Universal Quick Add)

```swift
// TurboPlatform/Components/QuickCaptureSheet.swift

import SwiftUI

struct QuickCaptureSheet<T: Entity>: View {
    @Environment(\.dismiss) var dismiss
    @Binding var isPresented: Bool

    @State private var title = ""
    @State private var description = ""
    @State private var priority: Priority = .medium

    let onCreate: (String, String, Priority) async throws -> T

    var body: some View {
        NavigationStack {
            Form {
                Section("Details") {
                    TextField("Title", text: $title)
                        .font(.headline)

                    TextEditor(text: $description)
                        .frame(height: 100)
                }

                Section("Priority") {
                    Picker("Priority", selection: $priority) {
                        ForEach(Priority.allCases, id: \.self) { priority in
                            Label(priority.rawValue.capitalized, systemImage: "flag.fill")
                                .tag(priority)
                        }
                    }
                    .pickerStyle(.segmented)
                }
            }
            .navigationTitle("Quick Capture")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Cancel") {
                        dismiss()
                    }
                }

                ToolbarItem(placement: .confirmationAction) {
                    Button("Create") {
                        Task {
                            do {
                                _ = try await onCreate(title, description, priority)
                                dismiss()
                            } catch {
                                print("Failed to create: \(error)")
                            }
                        }
                    }
                    .disabled(title.isEmpty)
                }
            }
        }
    }
}
```

### PriorityBadge (Reusable Badge)

```swift
// TurboPlatform/Components/PriorityBadge.swift

import SwiftUI

struct PriorityBadge: View {
    let priority: Priority

    var body: some View {
        Label(priority.rawValue.capitalized, systemImage: "flag.fill")
            .font(.caption.bold())
            .foregroundColor(.white)
            .padding(.horizontal, 8)
            .padding(.vertical, 4)
            .background(priority.color)
            .clipShape(Capsule())
    }
}
```

### TagPicker (Tag Selection)

```swift
// TurboPlatform/Components/TagPicker.swift

import SwiftUI

struct TagPicker: View {
    @Binding var selectedTags: [Tag]
    let availableTags: [Tag]
    let onCreateTag: (String, String) -> Void

    @State private var showingCreateTag = false

    var body: some View {
        VStack(alignment: .leading) {
            Text("Tags")
                .font(.headline)

            FlowLayout(spacing: 8) {
                ForEach(availableTags) { tag in
                    TagChip(
                        tag: tag,
                        isSelected: selectedTags.contains(tag)
                    ) {
                        toggleTag(tag)
                    }
                }

                Button {
                    showingCreateTag = true
                } label: {
                    Label("Add Tag", systemImage: "plus.circle.fill")
                        .font(.caption)
                        .foregroundColor(.accentColor)
                }
            }
        }
        .sheet(isPresented: $showingCreateTag) {
            CreateTagSheet(onCreate: onCreateTag)
        }
    }

    private func toggleTag(_ tag: Tag) {
        if selectedTags.contains(tag) {
            selectedTags.removeAll { $0.id == tag.id }
        } else {
            selectedTags.append(tag)
        }
    }
}

struct TagChip: View {
    let tag: Tag
    let isSelected: Bool
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            Text(tag.name)
                .font(.caption)
                .foregroundColor(isSelected ? .white : tag.uiColor)
                .padding(.horizontal, 12)
                .padding(.vertical, 6)
                .background(isSelected ? tag.uiColor : tag.uiColor.opacity(0.2))
                .clipShape(Capsule())
        }
    }
}
```

---

## AI Integration

### AI Engine (Universal)

```swift
// TurboPlatform/Core/Services/AIEngine.swift

import Anthropic

actor AIEngine {
    static let shared = AIEngine()

    private let client: AnthropicClient
    private let model = "claude-sonnet-4-5-20250929"

    private init() {
        guard let apiKey = ProcessInfo.processInfo.environment["ANTHROPIC_API_KEY"] else {
            fatalError("ANTHROPIC_API_KEY not set")
        }
        client = AnthropicClient(apiKey: apiKey)
    }

    func chat(
        persona: String,
        context: [any Entity],
        userMessage: String
    ) async throws -> String {
        // Build context from entities
        let contextText = context.map { entity in
            """
            - [\(type(of: entity).entityType)] \(entity.title)
              \(entity.description)
            """
        }.joined(separator: "\n")

        let systemPrompt = """
        \(persona)

        Here is relevant context:
        \(contextText)

        Provide helpful, actionable advice based on this context.
        """

        let messages: [Message] = [
            Message(role: .user, content: .text(userMessage))
        ]

        let response = try await client.messages.create(
            model: model,
            max_tokens: 4096,
            system: systemPrompt,
            messages: messages
        )

        guard case .text(let text) = response.content.first else {
            throw AIError.invalidResponse
        }

        return text
    }

    func summarize(_ text: String, maxLength: Int = 200) async throws -> String {
        let prompt = """
        Summarize the following text in \(maxLength) words or less:

        \(text)
        """

        let messages: [Message] = [
            Message(role: .user, content: .text(prompt))
        ]

        let response = try await client.messages.create(
            model: model,
            max_tokens: 1024,
            messages: messages
        )

        guard case .text(let summary) = response.content.first else {
            throw AIError.invalidResponse
        }

        return summary
    }
}

enum AIError: Error {
    case invalidResponse
}
```

---

## Utilities

### Network Monitor

```swift
// TurboPlatform/Core/Services/NetworkMonitor.swift

import Network

@MainActor
class NetworkMonitor: ObservableObject {
    static let shared = NetworkMonitor()

    @Published var isConnected = true

    private let monitor = NWPathMonitor()
    private let queue = DispatchQueue(label: "NetworkMonitor")

    private init() {
        monitor.pathUpdateHandler = { [weak self] path in
            Task { @MainActor in
                self?.isConnected = path.status == .satisfied
            }
        }
        monitor.start(queue: queue)
    }
}
```

### Logger

```swift
// TurboPlatform/Core/Services/TurboLogger.swift

import OSLog

class TurboLogger {
    static let shared = TurboLogger()

    private let logger = Logger(subsystem: "com.turbo", category: "platform")

    func info(_ message: String) {
        logger.info("\(message)")
    }

    func error(_ error: Error) {
        logger.error("\(error.localizedDescription)")
    }

    func debug(_ message: String) {
        #if DEBUG
        logger.debug("\(message)")
        #endif
    }
}
```

---

## Usage Examples

### Creating a Domain App

```swift
// TurboMusic/Models/Track.swift

import TurboPlatform

struct Track: Entity, WorkItem, Rankable {
    // Entity requirements
    let id: UUID
    var title: String
    var description: String
    let createdAt: Date
    var updatedAt: Date
    var tags: [Tag]

    // WorkItem requirements
    var status: WorkStatus
    var priority: Priority
    var dueDate: Date?
    var assignee: String?

    // Rankable requirement
    var workRank: Int?

    // Domain-specific
    var albumId: UUID?
    var bpm: Int?
    var musicalKey: String?
    var audioFileURL: URL?
}

// TurboMusic/Views/TrackListView.swift

struct TrackListView: View {
    @State private var tracks: [Track] = []

    var body: some View {
        EntityListView(
            entities: tracks,
            onSelect: { track in
                // Navigate to detail
            },
            onDelete: { track in
                // Delete track
            }
        ) { track in
            TrackRow(track: track)
        }
    }
}

// Domain-specific row
struct TrackRow: View {
    let track: Track

    var body: some View {
        HStack {
            VStack(alignment: .leading) {
                Text(track.title)
                    .font(.headline)

                HStack {
                    if let bpm = track.bpm {
                        Text("\(bpm) BPM")
                            .font(.caption)
                            .foregroundColor(.secondary)
                    }

                    if let key = track.musicalKey {
                        Text(key)
                            .font(.caption)
                            .foregroundColor(.secondary)
                    }
                }
            }

            Spacer()

            PriorityBadge(priority: track.priority)
        }
    }
}
```

---

## Conclusion

The TurboPlatform Components Library provides:

1. **Core protocols** - Entity, Container, WorkItem
2. **Storage layer** - Local SQLite with App Groups support
3. **Sync engine** - Multi-layer with offline queue
4. **UI components** - Reusable views for common patterns
5. **AI integration** - Universal AI engine
6. **Utilities** - Network monitoring, logging, etc.

**Result:** Domain apps can focus on what makes them unique, while leveraging battle-tested infrastructure.

**Code Reuse:** 80%+ shared across all domain apps.

---

**Next:** See [DOMAIN_APPS_GUIDE.md](./DOMAIN_APPS_GUIDE.md) for domain-specific implementations.
