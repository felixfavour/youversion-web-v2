<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col">
    <!-- Navigation bar -->
    <header class="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 sticky top-0 z-50">
      <div class="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
        <!-- Logo -->
        <NuxtLink to="/" class="flex items-center gap-2.5 font-bold text-gray-900 dark:text-white select-none">
          <div class="size-8 rounded-lg bg-primary-500 flex items-center justify-center">
            <UIcon name="i-heroicons-book-open-20-solid" class="text-white size-4.5" />
          </div>
          <span class="text-[15px] tracking-tight">YouVersion Web</span>
        </NuxtLink>

        <!-- Center nav links (desktop) -->
        <nav class="hidden sm:flex items-center gap-1 mx-auto">
          <NuxtLink
            v-for="link in navLinks"
            :key="link.to"
            :to="link.to"
            class="px-3 py-1.5 text-[13px] font-medium rounded-lg transition-colors"
            :class="$route.path === link.to
              ? 'text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-800'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800/50'"
          >
            {{ link.label }}
          </NuxtLink>
        </nav>

        <!-- Right side actions -->
        <div class="flex items-center gap-2">
          <!-- Dark mode toggle -->
          <button
            class="size-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            :aria-label="isDark ? 'Switch to light mode' : 'Switch to dark mode'"
            @click="toggleDark"
          >
            <UIcon :name="isDark ? 'i-heroicons-sun-20-solid' : 'i-heroicons-moon-20-solid'" class="size-4" />
          </button>

          <template v-if="isAuthenticated">
            <!-- User avatar -->
            <div v-if="user" class="hidden sm:flex items-center gap-2 pl-2 border-l border-gray-100 dark:border-gray-800">
              <img
                v-if="user.profilePicture"
                :src="user.profilePicture"
                :alt="user.name"
                class="size-7 rounded-full object-cover"
              />
              <span class="text-[13px] font-medium text-gray-700 dark:text-gray-300 max-w-[100px] truncate">
                {{ user.name }}
              </span>
            </div>
            <button
              class="text-[13px] font-medium text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
              @click="logout"
            >
              Sign out
            </button>
          </template>
          <template v-else>
            <UButton
              size="sm"
              label="Login"
              icon="i-heroicons-arrow-right-start-on-rectangle-20-solid"
              @click="login"
            />
          </template>

          <!-- Mobile menu button -->
          <button
            class="sm:hidden size-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            @click="mobileMenuOpen = !mobileMenuOpen"
          >
            <UIcon name="i-heroicons-bars-3-20-solid" class="size-4" />
          </button>
        </div>
      </div>

      <!-- Mobile nav -->
      <div v-if="mobileMenuOpen" class="sm:hidden border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 px-4 py-2 flex flex-col gap-1">
        <NuxtLink
          v-for="link in navLinks"
          :key="link.to"
          :to="link.to"
          class="px-3 py-2 text-sm rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"
          @click="mobileMenuOpen = false"
        >
          {{ link.label }}
        </NuxtLink>
      </div>
    </header>

    <!-- Page content -->
    <main class="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6">
      <slot />
    </main>

    <!-- Footer -->
    <footer class="border-t border-gray-100 dark:border-gray-800 py-4 text-center text-xs text-gray-400 dark:text-gray-500">
      YouVersion Web — not affiliated with YouVersion or Life.Church.
    </footer>
  </div>
</template>

<script setup lang="ts">
const { isAuthenticated, user, login, logout, checkAuth } = useAuth()

const mobileMenuOpen = ref(false)

// ── Dark mode ──────────────────────────────────────────────────────────────
const colorMode = useColorMode()
const isDark = computed(() => colorMode.value === 'dark')
function toggleDark() {
  colorMode.preference = isDark.value ? 'light' : 'dark'
}

const navLinks = [
  { to: '/', label: 'Home' },
  { to: '/read', label: 'Read' },
  { to: '/highlights', label: 'Highlights' },
]

// Close mobile menu on route change
const route = useRoute()
watch(() => route.path, () => { mobileMenuOpen.value = false })

// Bootstrap auth state on layout mount
onMounted(async () => {
  await checkAuth()
})
</script>
