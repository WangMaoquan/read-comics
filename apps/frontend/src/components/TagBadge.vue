<template>
  <div
    class="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium transition-all duration-300 cursor-pointer hover:scale-105"
    :style="{
      backgroundColor: `${tag.color}20`,
      color: tag.color,
      borderColor: tag.color,
    }"
    :class="['border', clickable ? 'hover:shadow-md' : '']"
    @click="handleClick"
  >
    <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
      <path
        fill-rule="evenodd"
        d="M17.707 9.293a1 1 0 010 1.414l-7 7a1 1 0 01-1.414 0l-7-7A.997.997 0 012 10V5a3 3 0 013-3h5c.256 0 .512.098.707.293l7 7zM5 6a1 1 0 100-2 1 1 0 000 2z"
        clip-rule="evenodd"
      />
    </svg>
    <span>{{ tag.name }}</span>
    <span v-if="showCount" class="text-xs opacity-75">({{ tag.count }})</span>
  </div>
</template>

<script setup lang="ts">
  import type { Tag } from '@api/services';

  const props = withDefaults(
    defineProps<{
      tag: Tag;
      clickable?: boolean;
      showCount?: boolean;
    }>(),
    {
      clickable: true,
      showCount: false,
    },
  );

  const emit = defineEmits<{
    (e: 'click', tag: Tag): void;
  }>();

  const handleClick = () => {
    if (props.clickable) {
      emit('click', props.tag);
    }
  };
</script>
