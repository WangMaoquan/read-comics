import { defineStore } from 'pinia';
import type { Chapter } from '@read-comics/types';
import { useComicStore } from './comic';
import { imagesService } from '../api/services';

interface ReaderState {
  currentChapter: Chapter | null;
  imagePath: string;
  pageFiles: string[]; // 存储文件名
  currentPage: number;
  totalPages: number;
  loading: boolean;
  error: string | null;
}

export const useReaderStore = defineStore('reader', {
  state: (): ReaderState => ({
    currentChapter: null,
    currentPage: 0,
    totalPages: 0,
    pageFiles: [],
    loading: false,
    error: null,
    imagePath: '',
  }),

  getters: {
    getCurrentPage: (state) => state.currentPage,

    getTotalPages: (state) => state.totalPages,

    getProgress: (state) => {
      if (state.totalPages === 0) return 0;
      return Math.round(((state.currentPage + 1) / state.totalPages) * 100);
    },

    hasNextPage: (state) => state.currentPage < state.totalPages - 1,

    hasPreviousPage: (state) => state.currentPage > 0,

    isLoading: (state) => state.loading,

    hasError: (state) => state.error !== null,

    getError: (state) => state.error,

    // 动态生成 URL 列表
    pageUrls: (state) => {
      if (!state.imagePath || state.pageFiles.length === 0) return [];
      return state.pageFiles.map((page) =>
        imagesService.getImageUrl(state.imagePath, page),
      );
    },

    getCurrentImage: (state): string | null => {
      // @ts-ignore - accessing getter inside getter
      const urls = state.pageUrls;
      if (urls.length === 0 || state.currentPage >= urls.length) {
        return null;
      }
      return urls[state.currentPage];
    },

    isReadComplete: (state) => {
      return state.currentPage + 1 === state.totalPages;
    },

    getNextChapter(state) {
      const comicStore = useComicStore();
      const currentChapterIndex = comicStore.chapters.findIndex(
        (ch) => ch.id === state.currentChapter?.id,
      );
      if (
        currentChapterIndex >= 0 &&
        currentChapterIndex < comicStore.chapters.length - 1
      ) {
        return comicStore.chapters[currentChapterIndex + 1];
      }
    },
  },

  actions: {
    setState(chapter: Chapter) {
      this.currentChapter = chapter;
      // 注意：这里不再重置 currentPage，由组件层决定是否重置或恢复进度
      // 这样可以避免初始化时的闪烁
      this.totalPages = chapter.pages.length;
      this.pageFiles = chapter.pages;
      this.imagePath = chapter.imagePath;
    },

    setCurrentPage(page: number) {
      if (page >= 0 && page < this.totalPages) {
        this.currentPage = page;
      }
    },

    nextPage() {
      if (this.hasNextPage) {
        this.currentPage++;
      }
    },

    previousPage() {
      if (this.hasPreviousPage) {
        this.currentPage--;
      }
    },

    goToPage(page: number) {
      if (page >= 0 && page < this.totalPages) {
        this.currentPage = page;
      }
    },

    setLoading(loading: boolean) {
      this.loading = loading;
    },

    setError(error: string | null) {
      this.error = error;
    },

    clearError() {
      this.error = null;
    },

    reset() {
      this.currentChapter = null;
      this.currentPage = 0;
      this.totalPages = 0;
      this.pageFiles = [];
      this.loading = false;
      this.error = null;
      this.imagePath = '';
    },
  },
});
