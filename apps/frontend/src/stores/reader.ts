import { defineStore } from 'pinia';
import type { Chapter } from '@read-comics/types';
import { useComicStore } from './comic';

interface ReaderState {
  currentChapter: Chapter | null;
  imagePath: string;
  pages: string[];
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
    pages: [],
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

    getCurrentImage: (state) => {
      if (state.pages.length === 0 || state.currentPage >= state.pages.length) {
        return null;
      }
      return state.pages[state.currentPage];
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
      this.currentPage = chapter.readingProgress?.currentPage || 0;
      this.totalPages = chapter.pages.length;
      this.pages = chapter.pages;
      this.imagePath = chapter.imagePath;
    },

    setImages(pages: string[]) {
      this.pages = pages;
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
      this.pages = [];
      this.loading = false;
      this.error = null;
      this.imagePath = '';
    },
  },
});
