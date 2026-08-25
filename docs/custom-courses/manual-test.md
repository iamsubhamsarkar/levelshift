# Custom Courses — Manual Test Script

Feature branch: `feature/custom-courses`. Dev server: `cd app && npm run dev` → http://localhost:5173/

These steps cover the parts that can only be verified in a browser (YouTube playback,
live multi-language code execution, and the paste-JSON import round-trip).

## 1. Navigation
1. Open the app → Dashboard.
2. Confirm a **🧭 Your Courses** action button appears (shows "0 custom").
3. Click it → "Your Courses" tab with an empty state and **+ Add course**.

## 2. Import a course (the core flow)
1. In Your Courses, click **+ Add course** → wizard step 1.
2. Click **📋 Copy the generation prompt** → confirm "✓ Copied!".
   - (Optional) Expand "Preview the prompt" and confirm it embeds the schema + example.
3. Click **I have my JSON → Next**.
4. Either:
   - Paste the contents of `docs/custom-courses/sample-course.json`, or
   - Click **📤 Import .json file** and choose that file.
5. Click **Validate** → should jump to step 3 (Preview) with title
   "Python Basics (Sample)", 1 module, 2 topics, axes Fundamentals/Practice, no errors.
6. Click **✓ Add this course** → opens the course dashboard.

### Negative test (import safety)
- Paste `{ "title": "x" }` → Validate → should show an error (needs a module).
- Paste `not json` → should report invalid JSON.
- Paste a course with `"videoId": "bad id"` → import succeeds but that video is dropped
  (a warning is listed on the preview).

## 3. Course dashboard
1. Confirm a **Skill Radar** renders with the course's own axes (Fundamentals, Practice).
2. Confirm **Progress** shows 0% and topic count 0/2.
3. Confirm modules → topics are listed and clickable.

## 4. Topic page — video, practice, quiz
Open "Hello, Python":
1. **Video block**: the YouTube player loads and plays inside the app. As you watch,
   the "Watched %" bar climbs. Add a note at the current timestamp → it appears in the
   list; clicking the timestamp seeks the player. Reaching ~80% marks the video done.
2. **Practice block**: language shows "python". Click **▶ Run** → output "hello" and a
   green ✅ Passed (expectedOutput matched). Try Show solution.
   - Test another language by importing a course with e.g. a JS/Go practice block.
3. **Quiz block**: pick the correct option (print()) → turns green with explanation.
4. Once video + practice + quiz are done, **Mark topic complete →** enables. Click it.
5. Back on the course dashboard, Progress should now be 50% (1/2 topics), radar for
   Fundamentals should rise.

## 5. Streak integration
- Completing a topic calls the global `recordActivity`, so the Dashboard streak/heatmap
  should reflect today's activity (🔥 increments if it was 0).

## 6. Export / delete
- On a course card (or dashboard) click **📥 Export** → downloads `<id>.json`.
- Click **🗑** on a course card → **Confirm** → course and its progress are removed.

## 7. Persistence
- Reload the page. Custom courses, progress, notes, and completion should persist
  (stored in localStorage keys: `levelshift_courses`, `levelshift_course_progress`,
  `levelshift_active_course`). These are separate from the base course data and are NOT
  part of the base Export backup.

## Automated checks (already green)
- `node build-content.js` → 97 units / 780 cards
- `npm test` → 115 tests pass (incl. 15 validation, 6 runner, 4 courses-store)
- `npm run build` → succeeds
