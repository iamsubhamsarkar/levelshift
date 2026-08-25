<script>
  import { onMount } from 'svelte';
  import Dashboard from './lib/components/Dashboard.svelte';
  import LearnView from './lib/components/LearnView.svelte';
  import QuickChallenge from './lib/components/QuickChallenge.svelte';
  import Settings from './lib/components/Settings.svelte';
  import Onboarding from './lib/components/Onboarding.svelte';
  import ReadinessReport from './lib/components/ReadinessReport.svelte';
  import CourseMap from './lib/components/CourseMap.svelte';
  import CoursesTab from './lib/components/CoursesTab.svelte';
  import InstallPrompt from './lib/components/InstallPrompt.svelte';
  import { initializeApp, userSettings, streak } from './lib/stores/progress.js';
  import { initializeGamification } from './lib/engines/gamification.js';
  import { initPwa } from './lib/utils/pwa.js';
  import { shouldNudgeToday, maybeFireLocalReminder } from './lib/utils/reminders.js';

  let currentRoute = 'dashboard';
  let notifications = null;
  let showNotification = false;
  let needsOnboarding = false;
  let showReminderNudge = false;

  function handleRouteChange() {
    const hash = window.location.hash.slice(1) || 'dashboard';
    currentRoute = hash;
  }

  function navigate(route) {
    window.location.hash = route;
  }

  function dismissNotification() {
    showNotification = false;
  }

  function completeOnboarding() {
    needsOnboarding = false;
    navigate('dashboard');
  }

  onMount(() => {
    initializeApp();
    initPwa();

    // Check if first-time user
    const unsub = userSettings.subscribe(s => {
      needsOnboarding = !s.onboarded;
    });
    unsub();

    if (!needsOnboarding) {
      notifications = initializeGamification();
      if (notifications && notifications.length > 0) {
        showNotification = true;
      }

      // Local reminder: in-app nudge if not studied today, plus a tab-open
      // notification if the user enabled reminders and granted permission.
      let lastActive = null;
      const unsubStreak = streak.subscribe(s => { lastActive = s.lastActiveDate; });
      unsubStreak();
      showReminderNudge = shouldNudgeToday(lastActive);
      maybeFireLocalReminder(lastActive);
    }

    handleRouteChange();
    window.addEventListener('hashchange', handleRouteChange);
    return () => window.removeEventListener('hashchange', handleRouteChange);
  });
</script>

<!-- Notification banner -->
{#if showNotification && notifications}
  <div class="fixed top-0 left-0 right-0 z-50 p-3 animate-slide-up">
    {#each notifications as notif}
      <div 
        class="max-w-lg mx-auto rounded-lg p-4 border shadow-lg mb-2
          {notif.type === 'critical' || notif.type === 'severe' ? 'bg-accent-red/10 border-accent-red/30' : ''}
          {notif.type === 'danger' || notif.type === 'warning' ? 'bg-accent-yellow/10 border-accent-yellow/30' : ''}
          {notif.type === 'info' ? 'bg-accent-blue/10 border-accent-blue/30' : ''}"
      >
        <div class="flex items-start justify-between gap-3">
          <p class="text-sm text-text-primary">{notif.message}</p>
          <button class="text-text-muted hover:text-text-primary text-lg leading-none" on:click={dismissNotification}>×</button>
        </div>
        {#if notif.xpLoss}
          <p class="text-xs text-accent-red mt-1">{notif.xpLoss} XP</p>
        {/if}
      </div>
    {/each}
  </div>
{/if}

<main class="min-h-screen bg-surface-0 overflow-x-hidden">
  {#if needsOnboarding}
    <Onboarding onComplete={completeOnboarding} />
  {:else if currentRoute === 'dashboard'}
    {#if showReminderNudge}
      <div class="max-w-6xl mx-auto px-4 pt-4">
        <div class="bg-accent-blue/10 border border-accent-blue/30 rounded-lg p-3 flex items-center justify-between gap-3">
          <p class="text-sm text-text-primary">👋 You haven't studied today — 15 minutes keeps your streak alive.</p>
          <button class="text-text-muted hover:text-text-primary text-lg leading-none" on:click={() => showReminderNudge = false}>×</button>
        </div>
      </div>
    {/if}
    <Dashboard {navigate} />
  {:else if currentRoute.startsWith('learn')}
    <LearnView {navigate} />
  {:else if currentRoute === 'challenge'}
    <QuickChallenge {navigate} />
  {:else if currentRoute === 'settings'}
    <Settings {navigate} />
  {:else if currentRoute === 'report'}
    <ReadinessReport {navigate} />
  {:else if currentRoute === 'course'}
    <CourseMap {navigate} />
  {:else if currentRoute === 'courses'}
    <CoursesTab {navigate} />
  {:else}
    <div class="flex items-center justify-center min-h-screen">
      <div class="card text-center">
        <h2 class="text-xl font-semibold text-accent-red">404</h2>
        <p class="text-text-secondary">Route not found</p>
        <button class="btn-primary mt-4" on:click={() => navigate('dashboard')}>Go Home</button>
      </div>
    </div>
  {/if}
</main>

<!-- PWA install prompt (shows only when the browser offers it) -->
<InstallPrompt />
