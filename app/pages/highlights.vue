<template>
  <div>
    <!-- Page header -->
    <div class="mb-6">
      <h1 class="text-xl font-bold text-gray-900 dark:text-white">My Highlights</h1>
      <p class="text-gray-500 dark:text-gray-400 text-sm mt-1">
        Synced from YouVersion · cached locally · {{ totalCount }} verse{{ totalCount === 1 ? '' : 's' }}
      </p>
    </div>

    <!-- Controls card -->
    <div class="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-4 mb-6">
      <div class="flex flex-col sm:flex-row gap-3">
        <!-- Passage input (required by YouVersion API) -->
        <div class="flex-1 relative">
          <UIcon name="i-heroicons-magnifying-glass-20-solid" class="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
          <input
            v-model="passageInput"
            type="text"
            placeholder="Chapter to sync, e.g. JHN.3, PSA.23, ROM.8"
            class="w-full h-10 pl-9 pr-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-colors"
            :disabled="isSyncing"
          />
        </div>

        <!-- Bible version selector -->
        <select
          v-model="selectedBibleId"
          class="h-10 px-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-colors w-full sm:w-32"
          :disabled="isSyncing"
        >
          <option v-for="v in bibleVersions" :key="v.id" :value="v.id">{{ v.label }}</option>
        </select>

        <UButton
          :loading="isSyncing"
          :disabled="isSyncing || !passageInput.trim()"
          label="Sync"
          icon="i-heroicons-arrow-path-20-solid"
          class="bg-primary-500 hover:bg-primary-600 text-white h-10"
          @click="handleSync"
        />
      </div>

      <p class="text-xs text-gray-400 dark:text-gray-500 mt-2">
        The YouVersion API requires a passage reference (chapter or verse) to fetch highlights.
      </p>
    </div>

    <!-- Error banner -->
    <div v-if="syncError" class="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-xl p-4 mb-4">
      <div class="flex items-start gap-2">
        <UIcon name="i-heroicons-exclamation-circle-20-solid" class="size-4.5 text-red-500 mt-0.5 shrink-0" />
        <div class="flex-1">
          <p class="text-sm text-red-700 dark:text-red-400">{{ syncError }}</p>
        </div>
        <button class="text-red-400 hover:text-red-600" @click="syncError = null">
          <UIcon name="i-heroicons-x-mark-20-solid" class="size-4" />
        </button>
      </div>
    </div>

    <!-- Filter bar (only if we have items) -->
    <div v-if="totalCount > 0" class="flex items-center gap-3 mb-4">
      <div class="flex-1 relative">
        <UIcon name="i-heroicons-magnifying-glass-20-solid" class="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
        <input
          v-model="localSearch"
          type="text"
          placeholder="Filter by reference…"
          class="w-full h-9 pl-9 pr-3 rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-colors"
        />
      </div>
      <button
        class="text-xs font-medium text-red-500 hover:text-red-600 transition-colors px-2 py-1"
        @click="handleClear"
      >
        Clear cache
      </button>
    </div>

    <!-- Empty state -->
    <div
      v-if="totalCount === 0 && !isSyncing"
      class="flex flex-col items-center justify-center py-20 text-center"
    >
      <div class="size-12 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
        <UIcon name="i-heroicons-bookmark-square-20-solid" class="size-6 text-gray-400" />
      </div>
      <p class="text-sm text-gray-500 dark:text-gray-400 mb-1">No highlights synced yet</p>
      <p class="text-xs text-gray-400 dark:text-gray-500">Enter a chapter reference above and click "Sync" to pull your highlights.</p>
    </div>

    <!-- Highlights grid -->
    <div v-if="filteredItems.length > 0" class="grid sm:grid-cols-2 gap-3">
      <div
        v-for="item in filteredItems"
        :key="`${item.passage_id}-${item.bible_id}`"
        class="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-4 hover:shadow-sm transition-shadow"
        :style="{ borderLeftWidth: '4px', borderLeftColor: `#${item.color}` }"
      >
        <div class="flex items-start justify-between gap-3">
          <div class="flex-1 min-w-0">
            <a
              :href="youversionVerseUrl(item.passage_id, item.bible_id)"
              target="_blank"
              rel="noopener noreferrer"
              class="font-semibold text-sm text-gray-900 dark:text-white hover:text-primary-500 transition-colors font-mono"
            >
              {{ item.passage_id }}
            </a>
            <div class="flex items-center gap-2 mt-1">
              <span class="text-xs text-gray-400 dark:text-gray-500">
                {{ versionLabel(item.bible_id) }}
              </span>
              <span class="text-xs text-gray-300 dark:text-gray-600">·</span>
              <span class="text-xs text-gray-400 dark:text-gray-500">
                {{ formatDate(item.synced_at) }}
              </span>
            </div>
          </div>
          <span
            class="size-4 rounded-full shrink-0 mt-0.5"
            :style="{ backgroundColor: `#${item.color}` }"
          />
        </div>
      </div>
    </div>

    <!-- Pagination -->
    <div v-if="totalCount > pageSize" class="flex justify-center mt-8">
      <UPagination
        v-model:page="currentPage"
        :total="filteredTotal"
        :page-size="pageSize"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { LocalHighlight } from '~/composables/useDexie'

definePageMeta({ middleware: 'auth' })

useSeoMeta({ title: 'My Highlights · YouVersion Web' })

// ---------------------------------------------------------------------------
// Composables
// ---------------------------------------------------------------------------
const config = useRuntimeConfig()
const { syncHighlights, listHighlights, clearHighlights } = useDexie()
const { fetchHighlights } = useHighlightsApi()

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

const selectedBibleId = ref<number>(config.public.defaultBibleId as number)
const passageInput = ref('')
const currentPage = ref(1)
const pageSize = 20
const isSyncing = ref(false)
const syncError = ref<string | null>(null)
const localSearch = ref('')

const items = ref<LocalHighlight[]>([])
const totalCount = ref(0)

// ---------------------------------------------------------------------------
// Derived
// ---------------------------------------------------------------------------
const filteredItems = computed(() => {
  if (!localSearch.value) return items.value
  const needle = localSearch.value.toLowerCase()
  return items.value.filter(h => h.passage_id.toLowerCase().includes(needle))
})

const filteredTotal = computed(() =>
  localSearch.value ? filteredItems.value.length : totalCount.value,
)

// ---------------------------------------------------------------------------
// Fetch from local Dexie
// ---------------------------------------------------------------------------
async function loadPage(): Promise<void> {
  const { items: rows, total } = await listHighlights(currentPage.value, pageSize)
  items.value = rows
  totalCount.value = total
}

onMounted(loadPage)
watch(currentPage, loadPage)

// ---------------------------------------------------------------------------
// Sync from YouVersion API → Dexie
// ---------------------------------------------------------------------------
async function handleSync(): Promise<void> {
  const passageId = passageInput.value.trim().toUpperCase()
  if (!passageId) return

  isSyncing.value = true
  syncError.value = null
  try {
    const apiHighlights = await fetchHighlights({
      bibleId: selectedBibleId.value,
      passageId,
    })
    await syncHighlights(apiHighlights)
    await loadPage()
  }
  catch (err) {
    syncError.value = err instanceof Error ? err.message : 'Sync failed. Please try again.'
  }
  finally {
    isSyncing.value = false
  }
}

// ---------------------------------------------------------------------------
// Clear local cache
// ---------------------------------------------------------------------------
async function handleClear(): Promise<void> {
  await clearHighlights()
  items.value = []
  totalCount.value = 0
  currentPage.value = 1
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
const versionLabels: Record<number, string> = {
  1: 'KJV', 59: 'ESV', 111: 'NIV', 206: 'NLT', 3034: 'BSB',
}

function versionLabel(bibleId: number): string {
  return versionLabels[bibleId] ?? String(bibleId)
}

function youversionVerseUrl(passageId: string, bibleId: number): string {
  return `https://www.bible.com/bible/${bibleId}/${passageId.toLowerCase()}`
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}
</script>
