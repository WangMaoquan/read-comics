import { defineStore } from 'pinia';
import type { Comic, Chapter } from '@read-comics/types';

interface ReaderState {
  currentComic: Comic | null;
  currentChapter: Chapter | null;
  currentPage: number;
  totalPages: number;
  images: string[];
  loading: boolean;
  error: string | null;
}

export const useReaderStore = defineStore('reader', {
  state: (): ReaderState => ({
    currentComic: null,
    currentChapter: null,
    currentPage: 0,
    totalPages: 0,
    images: [],
    loading: false,
    error: null,
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
      if (
        state.images.length === 0 ||
        state.currentPage >= state.images.length
      ) {
        return null;
      }
      return state.images[state.currentPage];
    },
  },

  actions: {
    setComic(comic: Comic) {
      this.currentComic = comic;
    },

    setChapter(chapter: Chapter) {
      this.currentChapter = chapter;
      this.totalPages = chapter.pages?.length || 0;
    },

    setImages(images: string[]) {
      this.images = images;
      this.totalPages = images.length;
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
      this.currentComic = null;
      this.currentChapter = null;
      this.currentPage = 0;
      this.totalPages = 0;
      this.images = [];
      this.loading = false;
      this.error = null;
    },
  },
});
