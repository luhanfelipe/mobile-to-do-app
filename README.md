# To-Do App (Kotlin Multiplatform)

A Kotlin Multiplatform to-do project using **Compose Multiplatform**, **SQLDelight**, and **Koin**.

## Project Structure

- `/home/runner/work/to-do-app/to-do-app/shared`  
  Shared Kotlin code (models, SQLDelight schema/queries, repositories, view models, DI)
- `/home/runner/work/to-do-app/to-do-app/androidApp`  
  Android target app entrypoint
- `/home/runner/work/to-do-app/to-do-app/desktopApp`  
  Desktop JVM target app entrypoint

## Architecture

The project follows **MVVM + Repository** in shared code.

```mermaid
flowchart LR
    UI[Compose UI (Android/Desktop)] --> VM[ViewModels\nTaskViewModel / CategoryViewModel]
    VM --> Repo[Repositories\nTaskRepository / CategoryRepository]
    Repo --> SQL[SQLDelight Queries]
    SQL --> DB[(SQLite Database)]
```

### Layers

- **Models**: `Task`, `Category`
- **Persistence**: SQLDelight `.sq` files for schema + CRUD/filter queries
- **Repositories**: map SQLDelight generated entities to domain models
- **ViewModels**: `StateFlow` state + actions (add/edit/delete/toggle/filter)
- **DI**: Koin module in shared code (`sharedModule`)

## Main Dependencies

- Kotlin Multiplatform (`org.jetbrains.kotlin.multiplatform`)
- Compose Multiplatform (`org.jetbrains.compose`)
- SQLDelight (`app.cash.sqldelight`)
- Koin (`io.insert-koin:koin-core`)
- Kotlin Coroutines (`kotlinx-coroutines-core`)
- Kotlin Datetime (`kotlinx-datetime`)

## Data Layer Implemented

### Task model fields
- `id`
- `title`
- `description`
- `completed`
- `dueDateTime`
- `createdAt`
- `categoryId`

### Category model fields
- `id`
- `name`

### SQLDelight queries
- Task: insert, update, delete, select all, select by id, select by status, select by category
- Category: insert, update, delete, select all, select by id

## Build and Run

> Note: this environment had restricted network/plugin resolution during validation. If plugin download is blocked, Gradle sync/build will fail before compilation.

### Prerequisites

- JDK 17+
- Android SDK (for Android target)
- Gradle (or Gradle wrapper if generated in your local environment)

### Android

```bash
cd /home/runner/work/to-do-app/to-do-app
gradle :androidApp:assembleDebug
```

### Desktop

```bash
cd /home/runner/work/to-do-app/to-do-app
gradle :desktopApp:run
```

### Shared checks

```bash
cd /home/runner/work/to-do-app/to-do-app
gradle :shared:build
```

## Development History

Detailed chronological development history is maintained in:

- `/home/runner/work/to-do-app/to-do-app/BUILD_LOG.md`
