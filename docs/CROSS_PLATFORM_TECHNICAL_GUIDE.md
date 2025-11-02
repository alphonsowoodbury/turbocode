# TurboPlatform: Cross-Platform Technical Guide

## Overview

This document provides technical implementation details for building Turbo apps across macOS, iOS, Web, and Android platforms. It covers data sharing, sync architecture, and platform-specific considerations.

---

## Platform Matrix

| Feature | macOS | iOS | iPadOS | Web | Android |
|---------|-------|-----|--------|-----|---------|
| **Native UI** | SwiftUI | SwiftUI | SwiftUI | React | Kotlin/Flutter |
| **Offline-First** | ✅ | ✅ | ✅ | ⚠️ Limited | ⚠️ Limited |
| **iCloud Sync** | ✅ | ✅ | ✅ | ❌ | ❌ |
| **Backend Sync** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **App Groups** | ✅ | ✅ | ✅ | ❌ | ❌ |
| **Menu Bar** | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Widgets** | ✅ | ✅ | ✅ | ❌ | ✅ |
| **Shortcuts** | ✅ | ✅ | ✅ | ❌ | ❌ |
| **File System** | Full | Sandboxed | Sandboxed | Limited | Limited |
| **Git Integration** | ✅ | ❌ | ⚠️ Limited | ❌ | ❌ |

---

## Data Sharing Architecture

### 1. Same Platform, Multiple Apps (iOS ↔ iOS Lite)

**Use Case:** Turbo Full and Turbo Capture on same iPhone

**Technology:** App Groups + Shared Container

#### Implementation

```swift
// Enable in Xcode:
// Target → Signing & Capabilities → App Groups
// Add: group.com.turbo.shared

// Shared SQLite Database
class SharedDatabase {
    static let shared = SharedDatabase()

    private let containerURL: URL = {
        guard let url = FileManager.default.containerURL(
            forSecurityApplicationGroupIdentifier: "group.com.turbo.shared"
        ) else {
            fatalError("App Group not configured")
        }
        return url
    }()

    private lazy var databaseURL: URL = {
        containerURL.appendingPathComponent("turbo.sqlite")
    }()

    private lazy var db: SQLiteDatabase = {
        try! SQLiteDatabase(url: databaseURL)
    }()

    // Both apps read/write to same database
    func save<T: Entity>(_ entity: T) throws {
        try db.insert(entity)

        // Notify other apps
        DistributedNotificationCenter.default().post(
            name: Notification.Name("com.turbo.dataChanged"),
            object: nil
        )
    }

    func fetch<T: Entity>() throws -> [T] {
        try db.query()
    }
}

// Listen for changes from other app
class DataObserver {
    init() {
        DistributedNotificationCenter.default().addObserver(
            self,
            selector: #selector(dataChanged),
            name: Notification.Name("com.turbo.dataChanged"),
            object: nil
        )
    }

    @objc func dataChanged() {
        // Reload data
        Task {
            await refreshData()
        }
    }
}
```

#### Directory Structure

```
App Group Container: group.com.turbo.shared/
├── turbo.sqlite              # Shared database
├── turbo.sqlite-wal          # Write-ahead log
├── turbo.sqlite-shm          # Shared memory
├── Documents/                # Shared documents
│   ├── attachments/
│   └── exports/
├── Library/
│   ├── Caches/              # Shared cache
│   └── Preferences/         # Shared settings
└── tmp/                      # Shared temp files
```

#### Best Practices

1. **Use WAL mode** for SQLite (allows concurrent reads)
2. **File coordination** for database access
3. **Notifications** to alert other apps of changes
4. **Defensive coding** - assume other app might be writing

```swift
// File Coordination for Safety
let coordinator = NSFileCoordinator()
var error: NSError?

coordinator.coordinate(
    writingItemAt: databaseURL,
    options: .forMerging,
    error: &error
) { url in
    // Perform database write
    try? db.insert(entity)
}
```

---

### 2. Cross-Platform, Same User (macOS ↔ iOS)

**Use Case:** Create issue on Mac, see on iPhone

**Technology:** CloudKit + iCloud

#### CloudKit Architecture

```swift
import CloudKit

class TurboCloudSync {
    // Private database (user's iCloud)
    let container = CKContainer(identifier: "iCloud.com.turbo")
    let database: CKDatabase

    init() {
        database = container.privateCloudDatabase
    }

    // Save entity to CloudKit
    func save<T: Entity>(_ entity: T) async throws {
        let record = CKRecord(recordType: String(describing: T.self))
        record["id"] = entity.id.uuidString
        record["title"] = entity.title
        record["description"] = entity.description
        record["createdAt"] = entity.createdAt
        record["updatedAt"] = entity.updatedAt

        // Save to iCloud
        try await database.save(record)

        // Also save locally
        try LocalDatabase.shared.save(entity)
    }

    // Fetch from CloudKit
    func fetch<T: Entity>() async throws -> [T] {
        let query = CKQuery(
            recordType: String(describing: T.self),
            predicate: NSPredicate(value: true)
        )

        let results = try await database.records(matching: query)

        return results.matchResults.compactMap { result in
            guard let record = try? result.1.get() else { return nil }
            return T(from: record)
        }
    }

    // Sync local changes to cloud
    func sync() async throws {
        // Get local changes since last sync
        let localChanges = try LocalDatabase.shared.pendingChanges()

        for change in localChanges {
            try await save(change)
        }

        // Get remote changes
        let remoteChanges = try await fetchChanges()

        // Merge into local database
        try LocalDatabase.shared.merge(remoteChanges)
    }

    // Subscribe to changes (real-time updates)
    func subscribeToChanges() async throws {
        let subscription = CKQuerySubscription(
            recordType: "Issue",
            predicate: NSPredicate(value: true),
            options: [.firesOnRecordCreation, .firesOnRecordUpdate]
        )

        let notification = CKSubscription.NotificationInfo()
        notification.shouldSendContentAvailable = true
        subscription.notificationInfo = notification

        try await database.save(subscription)
    }
}
```

#### SwiftData + CloudKit (Modern Approach)

```swift
import SwiftData
import CloudKit

// Define model
@Model
class Issue {
    @Attribute(.unique) var id: UUID
    var title: String
    var description: String
    var createdAt: Date
    var updatedAt: Date

    init(title: String, description: String) {
        self.id = UUID()
        self.title = title
        self.description = description
        self.createdAt = Date()
        self.updatedAt = Date()
    }
}

// App setup with CloudKit sync
@main
struct TurboApp: App {
    var body: some Scene {
        WindowGroup {
            ContentView()
        }
        .modelContainer(
            for: [Issue.self, Project.self],
            inMemory: false,
            isAutosaveEnabled: true,
            // Enable CloudKit sync
            isUndoEnabled: true
        )
    }
}

// Automatic sync across devices!
// No manual sync code needed
```

#### Conflict Resolution

```swift
// CloudKit provides automatic conflict resolution
// But you can customize it:

class ConflictResolver {
    func resolve<T: Entity>(
        local: T,
        remote: T
    ) -> T {
        // Strategy 1: Last Write Wins
        return local.updatedAt > remote.updatedAt ? local : remote

        // Strategy 2: Merge fields
        var merged = local
        if remote.updatedAt > local.updatedAt {
            // Remote is newer for some fields
            merged.title = remote.title
        }
        return merged

        // Strategy 3: User chooses
        // Show merge UI and let user decide
    }
}
```

---

### 3. Backend Sync (All Platforms)

**Use Case:** Access from any device, including non-Apple platforms

**Technology:** FastAPI + PostgreSQL

#### Sync Architecture

```
Device (Local SQLite)
    ↓
Sync Queue (Pending Operations)
    ↓
Sync Engine (Background)
    ↓
FastAPI Backend
    ↓
PostgreSQL (Source of Truth)
```

#### Implementation

```swift
// Sync Engine
actor SyncEngine<T: Entity> {
    private let api = BackendAPI.shared
    private let localDB = LocalDatabase.shared
    private var syncInProgress = false
    private let queue = SyncQueue<T>()

    // Save locally, queue for sync
    func save(_ entity: T) async throws {
        // 1. Save locally first (instant)
        try localDB.save(entity)

        // 2. Queue for backend sync
        queue.enqueue(.create(entity))

        // 3. Trigger sync if online
        if NetworkMonitor.shared.isConnected {
            try? await sync()
        }
    }

    // Background sync process
    func sync() async throws {
        guard !syncInProgress else { return }
        syncInProgress = true
        defer { syncInProgress = false }

        // Step 1: Pull from backend (source of truth)
        let serverEntities = try await api.fetchAll(T.self)
        try localDB.merge(serverEntities)

        // Step 2: Push local changes
        let pending = queue.dequeueAll()
        for operation in pending {
            switch operation {
            case .create(let entity):
                let created = try await api.create(entity)
                try localDB.updateServerID(entity.id, serverID: created.id)

            case .update(let entity):
                try await api.update(entity)

            case .delete(let id):
                try await api.delete(id)
            }
        }

        // Step 3: Mark sync timestamp
        UserDefaults.standard.set(Date(), forKey: "lastSyncDate")
    }

    // Periodic sync (every 5 minutes)
    func startPeriodicSync() {
        Timer.scheduledTimer(withTimeInterval: 300, repeats: true) { _ in
            Task {
                try? await self.sync()
            }
        }
    }
}
```

#### Sync Queue (Offline Support)

```swift
// Persistent queue for offline operations
class SyncQueue<T: Entity> {
    enum Operation: Codable {
        case create(T)
        case update(T)
        case delete(UUID)
    }

    private let queueURL: URL = {
        let dir = FileManager.default.urls(
            for: .applicationSupportDirectory,
            in: .userDomainMask
        )[0]
        return dir.appendingPathComponent("syncQueue.json")
    }()

    private var operations: [Operation] = []

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

    private func saveQueue() {
        let encoder = JSONEncoder()
        if let data = try? encoder.encode(operations) {
            try? data.write(to: queueURL)
        }
    }

    private func loadQueue() {
        guard let data = try? Data(contentsOf: queueURL) else { return }
        let decoder = JSONDecoder()
        operations = (try? decoder.decode([Operation].self, from: data)) ?? []
    }
}
```

#### Backend API Client

```swift
import Foundation

class BackendAPI {
    static let shared = BackendAPI()

    private let baseURL = URL(string: "https://api.turbo.app")!
    private let session: URLSession

    init() {
        let config = URLSessionConfiguration.default
        config.timeoutIntervalForRequest = 30
        config.waitsForConnectivity = true
        session = URLSession(configuration: config)
    }

    // Generic CRUD operations
    func fetchAll<T: Entity>(_ type: T.Type) async throws -> [T] {
        let url = baseURL.appendingPathComponent("/api/v1/\(type.endpoint)")
        let (data, _) = try await session.data(from: url)
        return try JSONDecoder().decode([T].self, from: data)
    }

    func create<T: Entity>(_ entity: T) async throws -> T {
        let url = baseURL.appendingPathComponent("/api/v1/\(T.endpoint)")
        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.httpBody = try JSONEncoder().encode(entity)

        let (data, _) = try await session.data(for: request)
        return try JSONDecoder().decode(T.self, from: data)
    }

    func update<T: Entity>(_ entity: T) async throws {
        let url = baseURL.appendingPathComponent("/api/v1/\(T.endpoint)/\(entity.id)")
        var request = URLRequest(url: url)
        request.httpMethod = "PUT"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.httpBody = try JSONEncoder().encode(entity)

        _ = try await session.data(for: request)
    }

    func delete<T: Entity>(_ type: T.Type, id: UUID) async throws {
        let url = baseURL.appendingPathComponent("/api/v1/\(type.endpoint)/\(id)")
        var request = URLRequest(url: url)
        request.httpMethod = "DELETE"

        _ = try await session.data(for: request)
    }
}

// Entity extension
protocol Entity {
    static var endpoint: String { get }
}

extension Issue: Entity {
    static var endpoint: String { "issues" }
}

extension Project: Entity {
    static var endpoint: String { "projects" }
}
```

---

### 4. Complete Multi-Layer Sync System

Combining all three layers for ultimate reliability:

```swift
// Unified Data Manager
class TurboDataManager<T: Entity> {
    private let localDB = LocalDatabase.shared
    private let cloudSync = CloudKitSync<T>()
    private let backendSync = BackendSync<T>()

    // Save with multi-layer sync
    func save(_ entity: T) async throws {
        // Layer 1: Local (instant, always works)
        try localDB.save(entity)

        // Layer 2: iCloud (cross-device, Apple only)
        #if !DEBUG
        Task.detached(priority: .utility) {
            try? await self.cloudSync.save(entity)
        }
        #endif

        // Layer 3: Backend (authoritative, all platforms)
        if NetworkMonitor.shared.isConnected {
            Task.detached(priority: .background) {
                try? await self.backendSync.save(entity)
            }
        } else {
            // Queue for later
            SyncQueue<T>.shared.enqueue(.create(entity))
        }
    }

    // Fetch with fallback strategy
    func fetch() async throws -> [T] {
        // Try backend first (source of truth)
        if NetworkMonitor.shared.isConnected {
            do {
                let entities = try await backendSync.fetch()
                try localDB.merge(entities)  // Update local cache
                return entities
            } catch {
                print("Backend fetch failed, falling back to local")
            }
        }

        // Fallback to local cache
        return try localDB.fetch()
    }

    // Full sync across all layers
    func fullSync() async throws {
        guard NetworkMonitor.shared.isConnected else {
            throw SyncError.offline
        }

        // Pull from backend (truth)
        let serverData = try await backendSync.fetch()

        // Merge with local
        try localDB.merge(serverData)

        // Push local changes to backend
        let localChanges = try localDB.pendingChanges()
        for change in localChanges {
            try await backendSync.save(change)
        }

        // Update iCloud (happens automatically with SwiftData)
        // Or manually:
        try await cloudSync.sync()
    }
}
```

---

## Platform-Specific Features

### macOS

#### Menu Bar App

```swift
@main
struct TurboApp: App {
    var body: some Scene {
        // Menu bar extra (persistent)
        MenuBarExtra("Turbo", systemImage: "bolt.fill") {
            MenuBarView()
        }
        .menuBarExtraStyle(.window)

        // Main window (optional)
        WindowGroup {
            ContentView()
        }
        .commands {
            TurboCommands()
        }
    }
}

struct MenuBarView: View {
    @StateObject var workQueue = WorkQueueViewModel()

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text("Work Queue")
                .font(.headline)

            ForEach(workQueue.items.prefix(5)) { item in
                WorkItemRow(item: item)
            }

            Divider()

            Button("Quick Add Issue") {
                showQuickAdd()
            }
            .keyboardShortcut("n", modifiers: [.command, .shift])

            Button("Open Dashboard") {
                openDashboard()
            }

            Button("Quit") {
                NSApplication.shared.terminate(nil)
            }
        }
        .padding()
        .frame(width: 300)
    }
}
```

#### Global Hotkeys

```swift
import Carbon

class HotkeyManager {
    static let shared = HotkeyManager()

    func registerQuickAdd() {
        // Cmd+Shift+T to quick add
        let hotkey = HotKey(
            key: .t,
            modifiers: [.command, .shift]
        )

        hotkey.keyDownHandler = {
            self.showQuickAdd()
        }
    }

    func showQuickAdd() {
        // Show quick add window
        NSApp.activate(ignoringOtherApps: true)
        NotificationCenter.default.post(name: .showQuickAdd, object: nil)
    }
}
```

#### Spotlight Integration

```swift
import CoreSpotlight

class SpotlightIndexer {
    func index(_ issue: Issue) {
        let attributes = CSSearchableItemAttributeSet(
            contentType: .text
        )
        attributes.title = issue.title
        attributes.contentDescription = issue.description
        attributes.keywords = issue.tags.map { $0.name }

        let item = CSSearchableItem(
            uniqueIdentifier: issue.id.uuidString,
            domainIdentifier: "com.turbo.code.issue",
            attributeSet: attributes
        )

        CSSearchableIndex.default().indexSearchableItems([item])
    }
}
```

---

### iOS

#### Widgets

```swift
import WidgetKit
import SwiftUI

struct WorkQueueWidget: Widget {
    let kind = "WorkQueueWidget"

    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: Provider()) { entry in
            WorkQueueWidgetView(entry: entry)
        }
        .configurationDisplayName("Work Queue")
        .description("See your top priority tasks")
        .supportedFamilies([.systemSmall, .systemMedium, .systemLarge])
    }
}

struct WorkQueueWidgetView: View {
    let entry: WorkQueueEntry

    var body: some View {
        VStack(alignment: .leading, spacing: 4) {
            Text("Work Queue")
                .font(.headline)

            ForEach(entry.items.prefix(3)) { item in
                HStack {
                    Circle()
                        .fill(item.priority.color)
                        .frame(width: 8, height: 8)

                    Text(item.title)
                        .font(.caption)
                        .lineLimit(1)
                }
            }
        }
        .padding()
    }
}
```

#### Shortcuts Integration

```swift
import AppIntents

struct CreateIssueIntent: AppIntent {
    static var title: LocalizedStringResource = "Create Issue"

    @Parameter(title: "Title")
    var title: String

    @Parameter(title: "Description")
    var description: String

    @Parameter(title: "Priority")
    var priority: Priority

    func perform() async throws -> some IntentResult {
        let issue = Issue(
            title: title,
            description: description,
            priority: priority
        )

        try await TurboDataManager<Issue>().save(issue)

        return .result(value: "Created issue: \(title)")
    }
}

struct TurboShortcuts: AppShortcutsProvider {
    static var appShortcuts: [AppShortcut] {
        AppShortcut(
            intent: CreateIssueIntent(),
            phrases: [
                "Create a \(.applicationName) issue",
                "Add a task to \(.applicationName)"
            ],
            shortTitle: "Create Issue",
            systemImageName: "plus.circle"
        )
    }
}
```

#### Share Extension

```swift
// ShareViewController.swift
class ShareViewController: UIViewController {
    override func viewDidLoad() {
        super.viewDidLoad()

        // Get shared content
        guard let extensionItem = extensionContext?.inputItems.first as? NSExtensionItem else {
            return
        }

        // Extract URL or text
        if let attachment = extensionItem.attachments?.first {
            attachment.loadItem(forTypeIdentifier: "public.url") { data, error in
                if let url = data as? URL {
                    self.createIssue(from: url)
                }
            }
        }
    }

    func createIssue(from url: URL) {
        let issue = Issue(
            title: url.absoluteString,
            description: "Shared from Safari"
        )

        Task {
            try? await SharedDatabase.shared.save(issue)
            self.extensionContext?.completeRequest(
                returningItems: nil,
                completionHandler: nil
            )
        }
    }
}
```

---

### Web (Next.js)

#### Service Worker for Offline

```typescript
// service-worker.ts
import { precacheAndRoute } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { NetworkFirst, CacheFirst } from 'workbox-strategies';

// Precache static assets
precacheAndRoute(self.__WB_MANIFEST);

// API requests: Network first, cache fallback
registerRoute(
  /\/api\/.*/,
  new NetworkFirst({
    cacheName: 'api-cache',
    networkTimeoutSeconds: 5,
  })
);

// Static assets: Cache first
registerRoute(
  /\.(js|css|png|jpg|svg)$/,
  new CacheFirst({
    cacheName: 'static-cache',
  })
);
```

#### IndexedDB for Local Storage

```typescript
// lib/db.ts
import Dexie, { Table } from 'dexie';

interface Issue {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  createdAt: Date;
  updatedAt: Date;
  synced: boolean;
}

class TurboDatabase extends Dexie {
  issues!: Table<Issue>;

  constructor() {
    super('TurboDB');
    this.version(1).stores({
      issues: 'id, status, priority, synced',
    });
  }
}

export const db = new TurboDatabase();

// Save offline
export async function saveIssue(issue: Issue) {
  // Save to IndexedDB
  await db.issues.put({ ...issue, synced: false });

  // Try to sync to backend
  if (navigator.onLine) {
    try {
      await fetch('/api/issues', {
        method: 'POST',
        body: JSON.stringify(issue),
      });

      // Mark as synced
      await db.issues.update(issue.id, { synced: true });
    } catch (error) {
      console.log('Offline, will sync later');
    }
  }
}
```

#### Background Sync

```typescript
// Register background sync
if ('serviceWorker' in navigator && 'sync' in ServiceWorkerRegistration.prototype) {
  navigator.serviceWorker.ready.then(registration => {
    return registration.sync.register('sync-issues');
  });
}

// Service worker sync handler
self.addEventListener('sync', event => {
  if (event.tag === 'sync-issues') {
    event.waitUntil(syncIssues());
  }
});

async function syncIssues() {
  // Get unsynced issues from IndexedDB
  const unsynced = await db.issues.where('synced').equals(false).toArray();

  for (const issue of unsynced) {
    try {
      await fetch('/api/issues', {
        method: 'POST',
        body: JSON.stringify(issue),
      });

      await db.issues.update(issue.id, { synced: true });
    } catch (error) {
      console.error('Sync failed:', error);
    }
  }
}
```

---

## Performance Optimization

### Lazy Loading

```swift
// Load data on demand
class IssueListViewModel: ObservableObject {
    @Published var issues: [Issue] = []
    private var page = 0
    private let pageSize = 50

    func loadMore() async {
        let start = page * pageSize
        let end = start + pageSize

        let newIssues = try? await localDB.fetch(
            limit: pageSize,
            offset: start
        )

        DispatchQueue.main.async {
            self.issues.append(contentsOf: newIssues ?? [])
            self.page += 1
        }
    }
}
```

### Pagination

```swift
// API pagination
func fetchIssues(page: Int, limit: Int) async throws -> [Issue] {
    let url = baseURL
        .appendingPathComponent("/api/v1/issues")
        .appending(queryItems: [
            URLQueryItem(name: "page", value: "\(page)"),
            URLQueryItem(name: "limit", value: "\(limit)")
        ])

    let (data, _) = try await session.data(from: url)
    return try JSONDecoder().decode([Issue].self, from: data)
}
```

### Caching Strategy

```swift
class CacheManager {
    private var cache: [String: Any] = [:]
    private let expirationTime: TimeInterval = 300 // 5 minutes

    func get<T>(_ key: String) -> T? {
        cache[key] as? T
    }

    func set<T>(_ key: String, value: T) {
        cache[key] = value

        // Auto-expire after 5 minutes
        Task {
            try await Task.sleep(nanoseconds: UInt64(expirationTime * 1_000_000_000))
            cache.removeValue(forKey: key)
        }
    }
}
```

---

## Security Considerations

### Authentication

```swift
class AuthManager {
    private let keychain = Keychain(service: "com.turbo.app")

    func saveToken(_ token: String) {
        keychain["authToken"] = token
    }

    func getToken() -> String? {
        keychain["authToken"]
    }

    func logout() {
        try? keychain.remove("authToken")
    }
}

// API requests with auth
extension BackendAPI {
    private func authorizedRequest(url: URL) -> URLRequest {
        var request = URLRequest(url: url)
        if let token = AuthManager.shared.getToken() {
            request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        }
        return request
    }
}
```

### Data Encryption

```swift
import CryptoKit

class EncryptionManager {
    // Encrypt sensitive data before storing
    func encrypt(_ data: Data, using key: SymmetricKey) throws -> Data {
        let sealedBox = try AES.GCM.seal(data, using: key)
        return sealedBox.combined!
    }

    func decrypt(_ data: Data, using key: SymmetricKey) throws -> Data {
        let sealedBox = try AES.GCM.SealedBox(combined: data)
        return try AES.GCM.open(sealedBox, using: key)
    }
}
```

---

## Testing Strategy

### Unit Tests

```swift
import XCTest

class SyncEngineTests: XCTestCase {
    var sut: SyncEngine<Issue>!

    override func setUp() {
        sut = SyncEngine()
    }

    func testSaveLocallyFirst() async throws {
        let issue = Issue(title: "Test", description: "Test")

        try await sut.save(issue)

        // Verify saved locally
        let local = try LocalDatabase.shared.fetch(Issue.self)
        XCTAssertEqual(local.first?.id, issue.id)
    }

    func testQueueWhenOffline() async throws {
        NetworkMonitor.shared.isConnected = false

        let issue = Issue(title: "Test", description: "Test")
        try await sut.save(issue)

        // Verify queued for sync
        let queue = SyncQueue<Issue>.shared
        XCTAssertEqual(queue.count, 1)
    }
}
```

### Integration Tests

```swift
class SyncIntegrationTests: XCTestCase {
    func testFullSyncCycle() async throws {
        // Create issue on device A
        let deviceA = TurboDataManager<Issue>()
        let issue = Issue(title: "Test", description: "Test")
        try await deviceA.save(issue)

        // Wait for sync
        try await Task.sleep(nanoseconds: 2_000_000_000)

        // Verify appears on device B
        let deviceB = TurboDataManager<Issue>()
        let issues = try await deviceB.fetch()
        XCTAssertTrue(issues.contains { $0.id == issue.id })
    }
}
```

---

## Monitoring & Observability

### Logging

```swift
import OSLog

class TurboLogger {
    static let shared = TurboLogger()

    private let logger = Logger(
        subsystem: "com.turbo.app",
        category: "sync"
    )

    func logSync(_ message: String) {
        logger.info("🔄 \(message)")
    }

    func logError(_ error: Error) {
        logger.error("❌ \(error.localizedDescription)")
    }
}
```

### Analytics

```swift
class AnalyticsManager {
    func track(event: String, properties: [String: Any] = [:]) {
        // Send to analytics service
        Task {
            try? await api.post("/analytics/event", body: [
                "event": event,
                "properties": properties,
                "timestamp": Date(),
                "platform": platformName()
            ])
        }
    }

    private func platformName() -> String {
        #if os(macOS)
        return "macOS"
        #elseif os(iOS)
        return "iOS"
        #else
        return "Unknown"
        #endif
    }
}
```

---

## Deployment Checklist

### iOS/macOS App Store

- [ ] App Groups configured
- [ ] iCloud entitlement enabled
- [ ] CloudKit container created
- [ ] Push notifications configured
- [ ] App icons for all sizes
- [ ] Screenshots for App Store
- [ ] Privacy policy URL
- [ ] Terms of service
- [ ] App Store description
- [ ] TestFlight beta testing

### Web Deployment

- [ ] Service worker configured
- [ ] HTTPS enabled
- [ ] Environment variables set
- [ ] Database migrations run
- [ ] CDN configured
- [ ] Monitoring setup
- [ ] Error tracking (Sentry)
- [ ] Analytics configured

---

## Conclusion

This cross-platform architecture enables:
- **Offline-first** operation on all platforms
- **Real-time sync** between devices
- **Native performance** where it matters
- **Graceful degradation** for web/offline
- **Data portability** across platforms
- **Scalable architecture** for future growth

**Next:** See [TURBO_PLATFORM_VISION.md](./TURBO_PLATFORM_VISION.md) for the overall platform strategy.
