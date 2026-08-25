<script>
  import { customCourses, courseProgress, deleteCourse, setActiveCourse,
           completionPercent, countTopics, ensureProgress } from '../stores/courses.js';
  import Radar from './Radar.svelte';
  import CustomTopicPage from './CustomTopicPage.svelte';
  import CourseWizard from './CourseWizard.svelte';

  export let navigate;

  // view: 'list' | 'wizard' | 'course' | 'topic'
  let view = 'list';
  let selectedCourse = null;
  let selectedTopic = null;
  let confirmDeleteId = null;

  function openCourse(course) {
    ensureProgress(course.id, course);
    setActiveCourse(course.id);
    selectedCourse = course;
    view = 'course';
  }

  function openTopic(topic) {
    selectedTopic = topic;
    view = 'topic';
  }

  function backToList() { view = 'list'; selectedCourse = null; selectedTopic = null; }
  function backToCourse() { view = 'course'; selectedTopic = null; }

  function exportCourse(course) {
    const blob = new Blob([JSON.stringify(course, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${course.id}.json`;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  function doDelete(id) {
    deleteCourse(id);
    confirmDeleteId = null;
    if (selectedCourse?.id === id) backToList();
  }

  // Reactive progress for the open course.
  $: prog = selectedCourse ? ($courseProgress[selectedCourse.id] || {}) : {};
  $: completedTopics = new Set(prog.completedTopics || []);
</script>

{#if view === 'wizard'}
  <CourseWizard
    on:cancel={() => view = 'list'}
    on:done={(e) => {
      const c = $customCourses.find(x => x.id === e.detail.courseId);
      if (c) openCourse(c); else view = 'list';
    }}
  />
{:else if view === 'topic' && selectedCourse && selectedTopic}
  <CustomTopicPage
    course={selectedCourse}
    topic={selectedTopic}
    on:exit={backToCourse}
    on:complete={backToCourse}
  />
{:else if view === 'course' && selectedCourse}
  <!-- Per-course dashboard -->
  <div class="max-w-3xl mx-auto px-4 py-6 space-y-5">
    <div class="flex items-center gap-3">
      <button class="text-text-muted hover:text-text-secondary" on:click={backToList}>←</button>
      <h1 class="text-xl font-bold text-text-primary flex-1">{selectedCourse.title}</h1>
      <button class="btn-secondary text-xs" on:click={() => exportCourse(selectedCourse)}>📥 Export</button>
    </div>

    <div class="grid sm:grid-cols-2 gap-4">
      <!-- Progress + radar -->
      <div class="card flex flex-col items-center gap-2">
        <h3 class="text-xs uppercase text-text-muted self-start">Skill Radar</h3>
        <Radar axes={selectedCourse.radarAxes} conceptData={prog.concepts || {}} size={200} />
      </div>
      <div class="card space-y-3">
        <h3 class="text-xs uppercase text-text-muted">Progress</h3>
        <div class="text-3xl font-bold text-accent-blue">{completionPercent(selectedCourse.id, selectedCourse)}%</div>
        <div class="h-2 rounded-full bg-surface-3 overflow-hidden">
          <div class="h-full bg-accent-green transition-all" style="width:{completionPercent(selectedCourse.id, selectedCourse)}%"></div>
        </div>
        <p class="text-xs text-text-muted">
          {completedTopics.size} / {countTopics(selectedCourse)} topics · {prog.totalXP || 0} XP
        </p>
      </div>
    </div>

    <!-- Modules → topics -->
    {#each selectedCourse.modules as m}
      <div class="card space-y-2">
        <h3 class="text-sm font-semibold text-text-primary">{m.title}</h3>
        <div class="space-y-1">
          {#each m.topics as t}
            <button
              class="w-full flex items-center justify-between text-left px-3 py-2 rounded-lg
                     bg-surface-0 hover:bg-surface-2 border border-surface-3 transition-colors"
              on:click={() => openTopic(t)}
            >
              <span class="text-sm text-text-primary">{t.title}</span>
              <span class="text-xs">
                {completedTopics.has(t.id) ? '✅' : `${t.blocks.length} blocks`}
              </span>
            </button>
          {/each}
        </div>
      </div>
    {/each}
  </div>
{:else}
  <!-- Course list -->
  <div class="max-w-3xl mx-auto px-4 py-6 space-y-5">
    <div class="flex items-center gap-3">
      <button class="text-text-muted hover:text-text-secondary" on:click={() => navigate('dashboard')}>←</button>
      <h1 class="text-xl font-bold text-text-primary flex-1">Your Courses</h1>
      <button class="btn-primary text-sm" on:click={() => view = 'wizard'}>+ Add course</button>
    </div>

    {#if $customCourses.length === 0}
      <div class="card text-center space-y-3 py-10">
        <div class="text-4xl">📚</div>
        <p class="text-text-primary font-medium">No custom courses yet</p>
        <p class="text-sm text-text-muted max-w-sm mx-auto">
          Build your own course with any AI, import the JSON, and learn it here with videos,
          practice, quizzes, progress tracking and a skill radar.
        </p>
        <button class="btn-primary text-sm" on:click={() => view = 'wizard'}>+ Add your first course</button>
      </div>
    {:else}
      <div class="grid sm:grid-cols-2 gap-4">
        {#each $customCourses as c}
          <div class="card space-y-3">
            <div class="flex items-start justify-between gap-2">
              <div>
                <h3 class="font-semibold text-text-primary">{c.title}</h3>
                {#if c.description}<p class="text-xs text-text-muted mt-0.5">{c.description}</p>{/if}
              </div>
            </div>
            <div class="h-1.5 rounded-full bg-surface-3 overflow-hidden">
              <div class="h-full bg-accent-green" style="width:{completionPercent(c.id, c)}%"></div>
            </div>
            <p class="text-xs text-text-muted">{completionPercent(c.id, c)}% · {countTopics(c)} topics</p>
            <div class="flex gap-2">
              <button class="btn-primary text-xs flex-1" on:click={() => openCourse(c)}>Open</button>
              <button class="btn-secondary text-xs" on:click={() => exportCourse(c)}>📥</button>
              {#if confirmDeleteId === c.id}
                <button class="btn-danger text-xs" on:click={() => doDelete(c.id)}>Confirm</button>
                <button class="btn-secondary text-xs" on:click={() => confirmDeleteId = null}>✕</button>
              {:else}
                <button class="btn-danger text-xs" on:click={() => confirmDeleteId = c.id}>🗑</button>
              {/if}
            </div>
          </div>
        {/each}
      </div>
    {/if}
  </div>
{/if}
