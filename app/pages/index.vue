<template>
  <div>
    <!-- Hero section -->
    <div class="flex flex-col items-center text-center pt-12 pb-10">
      <!-- Badge -->
      <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 text-xs font-medium mb-6">
        <UIcon name="i-heroicons-sparkles-20-solid" class="size-3.5" />
        <span>Your personal Bible companion</span>
      </div>

      <h1 class="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white tracking-tight leading-tight mb-4">
        Read the Bible,<br/>
        Save <span class="text-primary-500">Highlights</span>
      </h1>

      <p class="text-gray-500 dark:text-gray-400 text-base max-w-md mb-8">
        Look up passages, browse your highlights offline, and pick up right where you left off — all from one place.
      </p>

      <!-- CTAs -->
      <div class="flex items-center gap-3">
        <template v-if="!isAuthenticated">
          <UButton size="lg" variant="outline" label="Learn more" to="/read" />
          <UButton size="lg" label="Get started today" @click="login" class="bg-primary-500 hover:bg-primary-600 text-white" />
        </template>
        <template v-else>
          <UButton size="lg" variant="outline" label="Read Bible" to="/read" icon="i-heroicons-book-open-20-solid" />
          <UButton size="lg" label="My Highlights" to="/highlights" class="bg-primary-500 hover:bg-primary-600 text-white" icon="i-heroicons-bookmark-square-20-solid" />
        </template>
      </div>

      <p v-if="user" class="text-sm text-gray-500 dark:text-gray-400 mt-4">
        Welcome back, <strong class="text-gray-800 dark:text-gray-200">{{ user.name }}</strong>
      </p>
    </div>

    <!-- Feature cards -->
    <div class="grid sm:grid-cols-3 gap-4 max-w-3xl mx-auto mt-4 mb-16">
      <div
        v-for="feature in features"
        :key="feature.title"
        class="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 hover:shadow-sm transition-shadow"
      >
        <div class="size-9 rounded-xl flex items-center justify-center mb-3" :class="feature.iconBg">
          <UIcon :name="feature.icon" class="size-4.5" :class="feature.iconColor" />
        </div>
        <h3 class="text-sm font-semibold text-gray-900 dark:text-white mb-1">{{ feature.title }}</h3>
        <p class="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{{ feature.description }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { isAuthenticated, user, login } = useAuth()

const features = [
  {
    icon: 'i-heroicons-book-open-20-solid',
    iconBg: 'bg-blue-50 dark:bg-blue-950/30',
    iconColor: 'text-blue-500',
    title: 'Passage Lookup',
    description: 'Look up any verse or chapter instantly across multiple Bible translations.',
  },
  {
    icon: 'i-heroicons-signal-slash-20-solid',
    iconBg: 'bg-purple-50 dark:bg-purple-950/30',
    iconColor: 'text-purple-500',
    title: 'Offline Highlights',
    description: 'Your highlights are cached locally so they load instantly — even without internet.',
  },
  {
    icon: 'i-heroicons-lock-closed-20-solid',
    iconBg: 'bg-emerald-50 dark:bg-emerald-950/30',
    iconColor: 'text-emerald-500',
    title: 'Secure OAuth',
    description: 'Sign in with your real YouVersion account. Tokens live only in httpOnly cookies.',
  },
]

useSeoMeta({
  title: 'YouVersion Web — Bible Passages & Highlights',
  description: 'Look up Bible passages and manage your YouVersion highlights from the web.',
})
</script>
