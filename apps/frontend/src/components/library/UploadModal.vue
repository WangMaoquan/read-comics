<script setup lang="ts">
  import { ref, reactive } from 'vue';
  import LoadingSpinner from '../LoadingSpinner.vue';
  import { filesService } from '../../api/services';
  import { toast } from '../../composables/useToast';

  import { handleError } from '../../utils/errorHandler';

  const props = defineProps<{
    modelValue: boolean;
    file: File | null;
  }>();

  const emit = defineEmits<{
    (e: 'update:modelValue', value: boolean): void;
    (e: 'update:file', value: File | null): void;
    (e: 'success'): void;
  }>();

  const uploadingFile = ref(false);
  const uploadProgress = ref(0);
  const tagInput = ref('');

  const uploadForm = reactive({
    title: '',
    author: '',
    description: '',
    tags: [] as string[],
  });

  // Initialize form when file changes
  const initForm = (file: File) => {
    uploadForm.title = file.name.replace(/\.(cbz|zip)$/i, '');
    uploadForm.author = '';
    uploadForm.description = '';
    uploadForm.tags = [];
  };

  // Expose init method if needed, or watch props.file
  import { watch } from 'vue';
  watch(
    () => props.file,
    (newFile) => {
      if (newFile) {
        initForm(newFile);
      }
    },
  );

  const closeUploadModal = () => {
    emit('update:modelValue', false);
    emit('update:file', null);
    uploadForm.title = '';
    uploadForm.author = '';
    uploadForm.description = '';
    uploadForm.tags = [];
    tagInput.value = '';
  };

  const addTag = () => {
    const tag = tagInput.value.trim();
    if (tag && !uploadForm.tags.includes(tag)) {
      uploadForm.tags.push(tag);
      tagInput.value = '';
    }
  };

  const removeTag = (index: number) => {
    uploadForm.tags.splice(index, 1);
  };

  const confirmUpload = async () => {
    if (!props.file) return;

    // 自动添加输入框中未添加的标签
    const pendingTag = tagInput.value.trim();
    if (pendingTag && !uploadForm.tags.includes(pendingTag)) {
      uploadForm.tags.push(pendingTag);
      tagInput.value = '';
    }

    uploadingFile.value = true;
    uploadProgress.value = 0;

    try {
      await filesService.uploadFile(
        props.file,
        {
          title: uploadForm.title,
          author: uploadForm.author,
          description: uploadForm.description,
          tags: uploadForm.tags,
        },
        (progress) => {
          uploadProgress.value = progress;
        },
      );

      emit('success');
      closeUploadModal();
      toast.success('文件上传成功!');
    } catch (error) {
      handleError(error, '上传错误');
    } finally {
      uploadingFile.value = false;
      uploadProgress.value = 0;
    }
  };
</script>

<template>
  <div
    v-if="modelValue"
    class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
  >
    <div
      class="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-scale-in"
    >
      <div class="p-6 border-b border-gray-100 dark:border-gray-700">
        <h3 class="text-xl font-bold text-gray-900 dark:text-white">
          上传漫画
        </h3>
      </div>

      <div class="p-6 space-y-4">
        <!-- 文件信息 -->
        <div
          class="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg flex items-center gap-3"
        >
          <div
            class="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-800 flex items-center justify-center text-blue-600 dark:text-blue-300"
          >
            <svg
              class="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
          <div class="flex-1 min-w-0">
            <p
              class="text-sm font-medium text-gray-900 dark:text-white truncate"
            >
              {{ file?.name }}
            </p>
            <p class="text-xs text-gray-500 dark:text-gray-400">
              {{ file ? (file.size / 1024 / 1024).toFixed(2) : 0 }}
              MB
            </p>
          </div>
        </div>

        <!-- 标题 -->
        <div>
          <label
            class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >标题</label
          >
          <input
            v-model="uploadForm.title"
            type="text"
            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>

        <!-- 作者 -->
        <div>
          <label
            class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >作者</label
          >
          <input
            v-model="uploadForm.author"
            type="text"
            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>

        <!-- 标签 -->
        <div>
          <label
            class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >标签</label
          >
          <div class="flex gap-2 mb-2">
            <input
              v-model="tagInput"
              type="text"
              placeholder="输入标签后按回车"
              @keyup.enter="addTag"
              class="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
            />
            <button
              type="button"
              @click="addTag"
              class="px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors"
            >
              添加
            </button>
          </div>
          <div class="flex flex-wrap gap-2">
            <span
              v-for="(tag, index) in uploadForm.tags"
              :key="index"
              class="px-2 py-1 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 rounded-full text-sm flex items-center gap-1"
            >
              {{ tag }}
              <button
                type="button"
                @click="removeTag(index)"
                class="hover:text-red-600"
              >
                ×
              </button>
            </span>
          </div>
        </div>

        <!-- 描述 -->
        <div>
          <label
            class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >描述</label
          >
          <textarea
            v-model="uploadForm.description"
            rows="3"
            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
          ></textarea>
        </div>

        <!-- 进度条 -->
        <div v-if="uploadingFile" class="space-y-2">
          <div
            class="flex justify-between text-sm text-gray-600 dark:text-gray-400"
          >
            <span>上传中...</span>
            <span>{{ uploadProgress }}%</span>
          </div>
          <div
            class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden"
          >
            <div
              class="bg-blue-600 h-2 rounded-full transition-all duration-300"
              :style="{ width: `${uploadProgress}%` }"
            ></div>
          </div>
        </div>
      </div>

      <div
        class="p-6 border-t border-gray-100 dark:border-gray-700 flex justify-end gap-3"
      >
        <button
          type="button"
          @click="closeUploadModal"
          :disabled="uploadingFile"
          class="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50"
        >
          取消
        </button>
        <button
          type="button"
          @click="confirmUpload"
          :disabled="uploadingFile"
          class="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
        >
          <LoadingSpinner v-if="uploadingFile" size="sm" />
          {{ uploadingFile ? '上传中...' : '确认上传' }}
        </button>
      </div>
    </div>
  </div>
</template>
