<template>
  <UCard
    :class="[
      'transition-all hover:shadow-md',
      isHighlighted ? 'ring-2 ring-primary-400 dark:ring-primary-600' : '',
    ]"
  >
    <div class="flex items-start justify-between gap-3">
      <div class="flex-1 min-w-0">
        <!-- Reference + badge row -->
        <div class="flex items-center gap-2 flex-wrap mb-1">
          <a
            :href="bibleUrl"
            target="_blank"
            rel="noopener noreferrer"
            class="font-semibold text-sm text-primary-600 dark:text-primary-300 hover:underline"
          >
            {{ verse.human_reference }}
          </a>

          <UBadge
            v-if="isHighlighted"
            size="xs"
            color="success"
            variant="subtle"
            icon="i-heroicons-bookmark-square-20-solid"
            label="Highlighted"
          />
        </div>

        <!-- Verse text with query keyword highlighted -->
        <!-- eslint-disable vue/no-v-html -->
        <p
          class="text-sm text-gray-700 dark:text-gray-300 leading-relaxed"
          v-html="markedText"
        />
      </div>

      <!-- Color swatch when highlighted -->
      <span
        v-if="isHighlighted && highlightColor"
        class="shrink-0 inline-block size-4 rounded-full border border-gray-200 dark:border-gray-700 mt-0.5"
        :style="{ backgroundColor: `#${highlightColor}` }"
        :title="`Your highlight: #${highlightColor}`"
      />
    </div>
  </UCard>
</template>

<script setup lang="ts">
import type { VerseResult } from '~/server/api/search.get'

const props = defineProps<{
  verse: VerseResult
  isHighlighted: boolean
  highlightColor?: string
  /** The search query — used to bold-mark matching words in the verse text */
  searchQuery?: string
}>()

const bibleUrl = computed(() => {
  const ref = props.verse.reference.toLowerCase()
  return `https://www.bible.com/bible/${props.verse.bible_id}/${ref}`
})

const markedText = computed(() => {
  const text = props.verse.text
  if (!props.searchQuery) return text
  const escaped = props.searchQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const re = new RegExp(`(${escaped})`, 'gi')
  return text.replace(
    re,
    '<mark class="bg-yellow-200 dark:bg-yellow-700 rounded px-0.5">$1</mark>',
  )
})
</script>
