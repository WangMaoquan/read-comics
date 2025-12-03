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
    list: '/tags',
    detail: (id: string) => `/tags/${id}`,
    comics: (id: string) => `/tags/${id}/comics`,
  },
  files: {
    upload: '/files/upload',
    scan: '/files/scan',
  },
};
