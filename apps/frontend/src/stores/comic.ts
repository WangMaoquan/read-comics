import { defineStore } from 'pinia';
import type { Comic, Chapter } from '@read-comics/types';

interface ComicState {
  comics: Comic[];
  chapters: Chapter[];
  loading: boolean;
  error: string | null;
  currentComic: Comic | null;
}

export const useComicStore = defineStore('comic', {
  state: (): ComicState => ({
    comics: [],
    chapters: [],
    loading: false,
    error: null,
    currentComic: null,
  }),

  getters: {
    getComicById: (state) => (id: string) => {
      return state.comics.find((comic) => comic.id === id);
    },

    getComicsCount: (state) => {
      return state.comics.length;
    },

    isLoading: (state) => {
      return state.loading;
    },

    hasError: (state) => {
      return state.error !== null;
    },

    getError: (state) => {
      return state.error;
    },
  },

  actions: {
    async fetchComics() {
      this.loading = true;
      this.error = null;

      try {
        const response = await fetch('http://localhost:4399/comics');
        if (!response.ok) {
          throw new Error('获取漫画列表失败');
        }

        const comics = await response.json();
        this.comics = comics;
      } catch (error) {
        this.error =
          error instanceof Error ? error.message : 'Failed to fetch comics';
        console.error('Error fetching comics:', error);
      } finally {
        this.loading = false;
      }
    },

    async fetchComicById(id: string) {
      this.loading = true;
      this.error = null;

      try {
        const response = await fetch(`http://localhost:4399/comics/${id}`);
        if (!response.ok) {
          throw new Error('获取漫画详情失败');
        }

        const comic = await response.json();
        this.currentComic = comic;
        return comic;
      } catch (error) {
        this.error =
          error instanceof Error ? error.message : 'Failed to fetch comic';
        console.error('Error fetching comic:', error);
        return null;
      } finally {
        this.loading = false;
      }
    },

    async fetchChapters(comicId: string) {
      this.loading = true;
      this.error = null;

      try {
        const response = await fetch(
          `http://localhost:4399/chapters?comicId=${comicId}`,
        );
        if (!response.ok) {
          throw new Error('获取章节列表失败');
        }

        const chapters = await response.json();
        this.chapters = chapters;
        return chapters;
      } catch (error) {
        this.error =
          error instanceof Error ? error.message : 'Failed to fetch chapters';
        console.error('Error fetching chapters:', error);
        return [];
      } finally {
        this.loading = false;
      }
    },

    addComic(comic: Comic) {
      this.comics.unshift(comic);
    },

    updateComic(id: string, updates: Omit<Partial<Comic>, 'id'>) {
      const index = this.comics.findIndex((comic) => comic.id === id);
      if (index !== -1) {
        this.comics[index] = { ...this.comics[index], ...updates } as Comic;
      }
    },

    removeComic(id: string) {
      this.comics = this.comics.filter((comic) => comic.id !== id);
    },

    setCurrentComic(comic: Comic | null) {
      this.currentComic = comic;
    },

    clearError() {
      this.error = null;
    },

    clear() {
      this.comics = [];
      this.chapters = [];
      this.currentComic = null;
      this.error = null;
      this.loading = false;
    },
  },
});
