<template>
  <div>
    <!-- Page header -->
    <div class="mb-6">
      <h1 class="text-xl font-bold text-gray-900 dark:text-white">Read the Bible</h1>
      <p class="text-gray-500 dark:text-gray-400 text-sm mt-1">
        Look up any verse, chapter, or passage by USFM reference.
      </p>
    </div>

    <!-- Lookup bar -->
    <div class="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-4 mb-6">
      <form class="flex flex-col sm:flex-row gap-3" @submit.prevent="handleLookup">
        <!-- Reference input -->
        <div class="flex-1 relative">
          <UIcon name="i-heroicons-magnifying-glass-20-solid" class="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
          <input
            v-model="referenceInput"
            type="text"
            placeholder="Enter reference, e.g. JHN.3.16, PSA.23, GEN.1"
            class="w-full h-10 pl-9 pr-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-colors"
            :disabled="isLoading"
          />
        </div>

        <!-- Bible version selector -->
        <select
          v-model="selectedBibleId"
          class="h-10 px-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-colors w-full sm:w-32"
          :disabled="isLoading"
        >
          <option v-for="v in bibleVersions" :key="v.id" :value="v.id">{{ v.label }}</option>
        </select>

        <UButton
          type="submit"
          size="md"
          label="Look up"
          :loading="isLoading"
          :disabled="!referenceInput.trim() || isLoading"
          class="bg-primary-500 hover:bg-primary-600 text-white h-10"
        />
      </form>

      <!-- Quick links -->
      <div class="flex flex-wrap gap-2 mt-3">
        <button
          v-for="q in quickLinks"
          :key="q.ref"
          class="px-2.5 py-1 text-xs rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          @click="quickLookup(q.ref)"
        >
          {{ q.label }}
        </button>
      </div>
    </div>

    <!-- Error state -->
    <div v-if="error" class="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-xl p-4 mb-4">
      <div class="flex items-start gap-2">
        <UIcon name="i-heroicons-exclamation-circle-20-solid" class="size-4.5 text-red-500 mt-0.5 shrink-0" />
        <p class="text-sm text-red-700 dark:text-red-400">{{ error }}</p>
      </div>
    </div>

    <!-- Empty/initial state -->
    <div
      v-if="!passage && !isLoading && !error"
      class="flex flex-col items-center justify-center py-20 text-center"
    >
      <div class="size-12 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
        <UIcon name="i-heroicons-book-open-20-solid" class="size-6 text-gray-400" />
      </div>
      <p class="text-sm text-gray-500 dark:text-gray-400 mb-1">Enter a reference to look up a passage</p>
      <p class="text-xs text-gray-400 dark:text-gray-500">For example: <code class="font-mono bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded">JHN.3.16</code> or <code class="font-mono bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded">PSA.23</code></p>
    </div>

    <!-- Loading -->
    <div v-if="isLoading" class="space-y-3">
      <div class="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6">
        <div class="h-5 w-40 bg-gray-100 dark:bg-gray-800 rounded animate-pulse mb-4" />
        <div class="space-y-2">
          <div class="h-4 w-full bg-gray-100 dark:bg-gray-800 rounded animate-pulse" />
          <div class="h-4 w-5/6 bg-gray-100 dark:bg-gray-800 rounded animate-pulse" />
          <div class="h-4 w-4/6 bg-gray-100 dark:bg-gray-800 rounded animate-pulse" />
        </div>
      </div>
    </div>

    <!-- Passage result -->
    <div
      v-if="passage && !isLoading"
      class="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden"
    >
      <!-- Header -->
      <div class="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
        <div>
          <h2 class="text-lg font-semibold text-gray-900 dark:text-white">{{ passage.reference }}</h2>
          <p class="text-xs text-gray-400 dark:text-gray-500 font-mono mt-0.5">{{ passage.id }}</p>
        </div>
        <a
          :href="`https://www.bible.com/bible/${selectedBibleId}/${passage.id.toLowerCase()}`"
          target="_blank"
          rel="noopener noreferrer"
          class="flex items-center gap-1.5 text-xs font-medium text-primary-500 hover:text-primary-600 transition-colors"
        >
          Open in YouVersion
          <UIcon name="i-heroicons-arrow-top-right-on-square-20-solid" class="size-3.5" />
        </a>
      </div>

      <!-- Content -->
      <div class="px-6 py-5">
        <p class="text-[15px] leading-7 text-gray-700 dark:text-gray-300 whitespace-pre-line">
          {{ passage.content }}
        </p>
      </div>

      <!-- Highlight check footer (if authenticated) -->
      <div
        v-if="isAuthenticated && highlightData.length > 0"
        class="px-6 py-3 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-800"
      >
        <div class="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
          <UIcon name="i-heroicons-bookmark-square-20-solid" class="size-3.5 text-primary-500" />
          <span>{{ highlightData.length }} highlight{{ highlightData.length === 1 ? '' : 's' }} in this passage</span>
        </div>
        <div class="flex flex-wrap gap-1.5 mt-2">
          <span
            v-for="hl in highlightData"
            :key="hl.passage_id"
            class="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs font-mono text-gray-600 dark:text-gray-300"
          >
            <span class="size-2.5 rounded-full" :style="{ backgroundColor: `#${hl.color}` }" />
            {{ hl.passage_id }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { HighlightItem } from '~/server/api/highlights.get'

useSeoMeta({ title: 'Read the Bible · YouVersion Web' })

// ---------------------------------------------------------------------------
// Composables
// ---------------------------------------------------------------------------
const config = useRuntimeConfig()
const { passage, isLoading, error, lookupPassage, reset } = usePassageLookup()
const { fetchHighlights } = useHighlightsApi()
const { isAuthenticated } = useAuth()

// ---------------------------------------------------------------------------
// State
// ---------------------------------------------------------------------------
const bibleVersions = [
  { id: 1, label: 'KJV' },
  { id: 59, label: 'ESV' },
  { id: 111, label: 'NIV' },
  { id: 206, label: 'NLT' },
  { id: 3034, label: 'BSB' },
]

const quickLinks = [
  { ref: 'JHN.3.16', label: 'John 3:16' },
  { ref: 'PSA.23', label: 'Psalm 23' },
  { ref: 'ROM.8.28', label: 'Romans 8:28' },
  { ref: 'GEN.1', label: 'Genesis 1' },
  { ref: 'PRO.3.5-6', label: 'Proverbs 3:5-6' },
  { ref: 'PHP.4.13', label: 'Philippians 4:13' },
]

const referenceInput = ref('')
const selectedBibleId = ref<number>(config.public.defaultBibleId as number)
const highlightData = ref<HighlightItem[]>([])

// ---------------------------------------------------------------------------
// Handlers
// ---------------------------------------------------------------------------
async function handleLookup(): Promise<void> {
  const ref = referenceInput.value.trim().toUpperCase()
  if (!ref) return

  highlightData.value = []
  await lookupPassage(selectedBibleId.value, ref)

  // If authenticated, also check for highlights on this passage
  if (isAuthenticated.value && passage.value) {
    try {
      const hl = await fetchHighlights({
        bibleId: selectedBibleId.value,
        passageId: passage.value.id,
      })
      highlightData.value = hl
    }
    catch {
      // Silently ignore — highlights are a bonus, not essential
    }
  }
}

function quickLookup(ref: string): void {
  referenceInput.value = ref
  handleLookup()
}

// Reset on unmount
onUnmounted(reset)
</script>
