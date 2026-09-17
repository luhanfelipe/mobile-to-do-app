# BUILD_LOG

## Entry 1

### Prompt / Request
"Implement the necessary changes to the repository so that the requirements specified in the problem statement are met."

### Decision Summary
I scaffolded a new mobile app using Expo + React Native + TypeScript because the repository only had a README and no existing app structure. I chose Expo to keep setup minimal while supporting SQLite and local notifications with official Expo APIs.

### Actions Performed
- Ran `npx create-expo-app@latest . --template blank-typescript --yes` (preserving existing README).
- Generated base mobile project files and npm setup.

### Result
- Base mobile project scaffold created successfully.

### Problems / Errors
- Initial scaffold attempt failed because `README.md` already existed in a non-empty directory.

### Fixes Attempted
- Temporarily moved `README.md` to `/tmp`, re-ran scaffold, then restored the file.

### Current Status
Completed

---

## Entry 2

### Prompt / Request
"Build a mobile to-do application with SQLite persistence, multiple screens, categories, filtering, due dates, and local notifications."

### Decision Summary
I selected these dependencies:
- `expo-sqlite` for persistent SQLite storage;
- `expo-notifications` for local notifications and permission handling;
- `@react-navigation/native` + `@react-navigation/native-stack` for multi-screen navigation;
- `@react-native-picker/picker` and `@react-native-community/datetimepicker` for category and due date/time inputs.

Architecture choice: small feature-oriented structure (`src/screens`, `src/services`, `src/types`) with service-based data and notification logic to avoid overengineering.

### Actions Performed
- Installed dependencies:
  - `expo-sqlite`
  - `expo-notifications`
  - `@react-navigation/native`
  - `@react-navigation/native-stack`
  - `@react-native-picker/picker`
  - `@react-native-community/datetimepicker`
  - `react-native-screens`
  - `react-native-safe-area-context`

### Result
- Project now has required libraries to implement persistence, navigation, filtering controls, and notifications.

### Problems / Errors
- Expo dependency validation warned that compatibility checks were limited due to offline mode.

### Fixes Attempted
- Proceeded with Expo's local compatibility map and installed SDK-compatible versions.

### Current Status
Completed

---

## Entry 3

### Prompt / Request
"Implement the app requirements end-to-end and keep BUILD_LOG.md updated throughout development."

### Decision Summary
SQLite strategy: direct SQL through `expo-sqlite` async API with two tables:
- `tasks`
- `categories`

Category deletion behavior: `FOREIGN KEY ... ON DELETE SET NULL` so tasks become uncategorized.

Navigation strategy: pass only `taskId` to editor screen and load fresh data from SQLite.

State management strategy: screen-local React state + reload on screen focus (`useFocusEffect`) to keep UI synced after CRUD actions.

Notification strategy: store `notificationId` in tasks; cancel and reschedule based on task due date and completion status.

### Actions Performed
- Added core app implementation files:
  - `App.tsx`
  - `src/types.ts`
  - `src/services/database.ts`
  - `src/services/notifications.ts`
  - `src/screens/TaskListScreen.tsx`
  - `src/screens/TaskEditorScreen.tsx`
  - `src/screens/CategoryManagementScreen.tsx`
- Implemented:
  - task CRUD;
  - category CRUD;
  - status and category filtering;
  - optional due date/time;
  - notification scheduling/canceling rules tied to task lifecycle;
  - startup database initialization and notification permission request handling.

### Result
- Required core features implemented in code.

### Problems / Errors
- Pending validation; build/test verification not yet executed.

### Fixes Attempted
- N/A yet (validation still pending).

### Current Status
Needs testing
