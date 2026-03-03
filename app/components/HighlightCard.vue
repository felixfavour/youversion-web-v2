<template>
  <UCard
    :class="[
      'transition-all hover:shadow-md',
      isHighlighted ? 'ring-2 ring-primary-400 dark:ring-primary-600' : '',
    ]"
  >
    <div class="flex items-start gap-3">
      <!-- Color swatch -->
      <div
        class="size-4 rounded-full shrink-0 mt-0.5 border border-gray-200 dark:border-gray-700"
        :style="{ backgroundColor: `#${highlight.color}` }"
        :title="`Color: #${highlight.color}`"
      />

      <!-- Content -->
      <div class="flex-1 min-w-0">
        <!-- Reference -->
        <div class="flex items-center gap-2 flex-wrap">
          <a
            :href="bibleUrl"
            target="_blank"
            rel="noopener noreferrer"
            class="font-semibold text-sm text-primary-600 dark:text-primary-300 hover:underline font-mono"
          >
            {{ highlight.passage_id }}
          </a>
          <UBadge size="xs" color="neutral" variant="subtle">
            {{ versionLabel }}
          </UBadge>
        </div>

        <!-- Synced at -->
        <p class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
          Synced {{ formattedDate }}
        </p>
      </div>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import type { LocalHighlight } from '~/composables/useDexie'

const props = defineProps<{
  highlight: LocalHighlight
  isHighlighted?: boolean
}>()

const bibleVersionLabels: Record<number, string> = {
  1: 'KJV',
  59: 'ESV',
  111: 'NIV',
  206: 'NLT',
  3034: 'WEB',
}

const versionLabel = computed(
  () => bibleVersionLabels[props.highlight.bible_id] ?? String(props.highlight.bible_id),
)

const bibleUrl = computed(() => {
  const ref = props.highlight.passage_id.toLowerCase()
  return `https://www.bible.com/bible/${props.highlight.bible_id}/${ref}`
})

const formattedDate = computed(() =>
  new Date(props.highlight.synced_at).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }),
)
</script>
