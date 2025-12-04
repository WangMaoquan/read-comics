export const API_ENDPOINTS = {
  auth: {
    login: '/auth/login',
    register: '/auth/register',
    profile: '/auth/profile',
    logout: '/auth/logout',
  },
  comics: {
    list: '/comics',
    detail: (id: string) => `/comics/${id}`,
    chapters: (id: string) => `/chapters?comicId=${id}`,
    progress: (id: string) => `/comics/${id}/progress`,
    toggleFavorite: (id: string) => `/comics/${id}/favorite`,
  },
  chapters: {
    detail: (id: string) => `/chapters/${id}`,
  },
  tags: {
    base: '/tags',
    list: '/tags',
    detail: (id: string) => `/tags/${id}`,
    update: (id: string) => `/tags/${id}`,
    delete: (id: string) => `/tags/${id}`,
    comics: (id: string) => `/tags/${id}/comics`,
    addToComic: (comicId: string, tagId: string) =>
      `/comics/${comicId}/tags/${tagId}`,
    removeFromComic: (comicId: string, tagId: string) =>
      `/comics/${comicId}/tags/${tagId}`,
  },
  favorites: {
    base: '/favorites',
    check: (comicId: string) => `/favorites/check/${comicId}`,
    update: (comicId: string) => `/favorites/${comicId}`,
    remove: (comicId: string) => `/favorites/${comicId}`,
    stats: '/favorites/stats',
  },
  files: {
    upload: '/files/upload',
    scan: '/files/scan',
    formats: '/files/formats',
  },
  images: {
    view: '/images/view',
    thumbnail: '/images/thumbnail',
    formats: '/images/formats',
  },
};
