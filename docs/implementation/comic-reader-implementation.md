# 漫画阅读器功能实现文档

## 概述

本文档详细描述了漫画阅读器（Reader）的完整功能实现，包括三种阅读模式、键盘控制、进度保存、响应式设计等核心功能。

## 目录

- [核心功能](#核心功能)
- [技术栈](#技术栈)
- [文件结构](#文件结构)
- [功能详解](#功能详解)
- [API 集成](#api-集成)
- [状态管理](#状态管理)
- [用户交互](#用户交互)
- [响应式设计](#响应式设计)
- [性能优化](#性能优化)

---

## 核心功能

### 1. 三种阅读模式

#### 单页模式 (Single Page)

- **描述**: 一次显示一页漫画
- **适用场景**: 适合精细阅读，注重细节
- **快捷键**: `1`
- **实现要点**:
  - 使用 `currentPage` 索引控制当前显示的页面
  - 左右箭头键切换页面
  - 支持触摸滑动（移动端）

#### 双页模式 (Double Page)

- **描述**: 一次显示两页漫画（模拟纸质书阅读）
- **适用场景**: 适合宽屏设备，更接近传统阅读体验
- **快捷键**: `2`
- **实现要点**:
  - 偶数页和奇数页成对显示
  - 自动处理单页情况（如封面）
  - 响应式布局适配不同屏幕

#### 滚动模式 (Continuous Scroll)

- **描述**: 连续滚动浏览所有页面
- **适用场景**: 适合快速浏览，追求流畅体验
- **快捷键**: `3`
- **实现要点**:
  - 所有图片垂直排列
  - 滚动位置自动保存
  - 懒加载优化性能

### 2. 阅读进度管理

#### 自动保存

- **触发时机**:
  - 切换页面时
  - 更改阅读模式时
  - 离开阅读器时
- **保存内容**:
  ```typescript
  {
    comicId: string,
    chapterId: string,
    currentPage: number,
    readingMode: ReadingMode,
    timestamp: string
  }
  ```
- **存储方式**: `localStorage`
- **Key 格式**: `reading_progress_{comicId}_{chapterId}`

#### 自动恢复

- **时机**: 重新打开同一章节时
- **恢复内容**: 上次阅读的页码和阅读模式
- **容错处理**:
  - 验证页码是否在有效范围内
  - 默认值兜底（第一页 + 单页模式）

### 3. 键盘控制

| 按键            | 功能       | 说明                      |
| --------------- | ---------- | ------------------------- |
| `←` `↑` `Space` | 上一页     | 在单页/双页模式下向前翻页 |
| `→` `↓` `Enter` | 下一页     | 在单页/双页模式下向后翻页 |
| `Esc`           | 返回       | 返回漫画详情页            |
| `H`             | 切换控制栏 | 显示/隐藏顶部和底部控制栏 |
| `1`             | 单页模式   | 切换到单页阅读模式        |
| `2`             | 双页模式   | 切换到双页阅读模式        |
| `3`             | 滚动模式   | 切换到连续滚动模式        |

**防止误触**: 输入框聚焦时禁用键盘快捷键

### 4. 触摸/鼠标控制

#### 点击区域划分

- **左侧 1/3**: 上一页
- **中间 1/3**: 切换控制栏显示
- **右侧 1/3**: 下一页

#### 移动端触摸手势

- **左滑**: 下一页
- **右滑**: 上一页
- **双指缩放**: 图片放大/缩小（待实现）

### 5. 设置集成

#### 与 SettingsStore 同步

```typescript
import { useSettingsStore } from '../stores/settings';
const settingsStore = useSettingsStore();

// 读取设置
const { readingMode, zoomMode } = storeToRefs(settingsStore);

// 更新设置
settingsStore.updateSettings({ zoomMode: 'fit' });
```

#### 支持的设置项

- **阅读模式**: single/double/scroll
- **缩放模式**: fit/width/original
- **阅读方向**: ltr/rtl（待实现）
- **字体大小**: 影响界面文字显示

### 6. 缩放模式

#### 适应屏幕 (Fit)

```css
object-fit: contain;
width: 100%;
height: 100vh;
```

#### 适应宽度 (Width)

```css
object-fit: cover;
width: 100%;
height: auto;
```

#### 原始大小 (Original)

```css
width: auto;
height: auto;
max-width: 100%;
```

#### 移动端强制优化

- 窗口宽度 < 640px 时，自动切换为 "适应屏幕" 模式
- 防止横向滚动，提升移动端阅读体验

---

## 技术栈

### 前端框架

- **Vue 3**: Composition API
- **TypeScript**: 类型安全
- **Vue Router**: 路由管理

### UI 和样式

- **Tailwind CSS v4**: 响应式设计
- **@vueuse/core**: 组合式工具函数
  - `useWindowSize`: 窗口大小响应

### 状态管理

- **Pinia**:
  - `useSettingsStore`: 阅读设置
- **LocalStorage**: 阅读进度持久化

---

## 文件结构

```
apps/frontend/src/
├── views/
│   └── Reader.vue           # 主阅读器组件
├── stores/
│   └── settings.ts          # 设置状态管理
├── api/
│   └── services/
│       ├── comicsService.ts    # 漫画 API
│       ├── chaptersService.ts  # 章节 API
│       └── imagesService.ts    # 图片 API
└── components/
    └── LoadingSpinner.vue   # 加载动画
```

---

## 功能详解

### 1. 组件初始化

```typescript
onMounted(async () => {
  // 1. 加载章节列表（用于章节导航）
  await loadChapters();

  // 2. 加载当前章节的图片
  await loadChapterImages();

  // 3. 注册键盘事件监听
  window.addEventListener('keydown', handleKeyDown);

  // 4. 注册滚动事件监听（滚动模式下同步页码）
  window.addEventListener('scroll', handleScroll);
});

onUnmounted(() => {
  // 清理事件监听器
  window.removeEventListener('keydown', handleKeyDown);
  window.removeEventListener('scroll', handleScroll);

  // 保存最终进度
  saveProgress();
});
```

### 2. 图片加载流程

```typescript
const loadChapterImages = async () => {
  loading.value = true;
  try {
    // 1. 获取章节详情
    const chapter = await chaptersService.getChapterById(chapterId.value);
    currentChapter.value = chapter;

    // 2. 构建图片 URL 列表
    if (chapter.pages && chapter.pages.length > 0) {
      images.value = chapter.pages.map((page: string) => {
        return imagesService.getImageUrl(chapter.imagePath, page);
      });
    }

    // 3. 恢复阅读进度
    restoreProgress();
  } catch (error) {
    console.error('Failed to load chapter images:', error);
  } finally {
    loading.value = false;
  }
};
```

### 3. 页面导航逻辑

```typescript
// 上一页
const previousPage = () => {
  if (readingMode.value === ReadingMode.CONTINUOUS_SCROLL) {
    // 滚动模式：向上滚动一个屏幕高度
    window.scrollTo({
      top: window.scrollY - window.innerHeight,
      behavior: 'smooth',
    });
  } else if (currentPage.value > 0) {
    // 分页模式：页码 -1
    currentPage.value--;
    saveProgress();
  }
};

// 下一页
const nextPage = () => {
  if (readingMode.value === ReadingMode.CONTINUOUS_SCROLL) {
    // 滚动模式：向下滚动一个屏幕高度
    window.scrollTo({
      top: window.scrollY + window.innerHeight,
      behavior: 'smooth',
    });
  } else if (currentPage.value < totalPages.value - 1) {
    // 分页模式：页码 +1
    currentPage.value++;
    saveProgress();
  } else if (isLastPage.value && hasNextChapter.value) {
    // 最后一页且有下一章：提示或自动跳转
    goToNextChapter();
  }
};
```

### 4. 滚动同步（滚动模式）

```typescript
const handleScroll = () => {
  if (readingMode.value !== ReadingMode.CONTINUOUS_SCROLL) return;

  // 防抖处理
  if (isScrolling.value) return;
  isScrolling.value = true;

  setTimeout(() => {
    // 根据滚动位置计算当前页码
    const scrollPercentage =
      window.scrollY / (document.body.scrollHeight - window.innerHeight);
    currentPage.value = Math.floor(scrollPercentage * totalPages.value);

    saveProgress();
    isScrolling.value = false;
  }, 100);
};
```

### 5. 模式切换

```typescript
const changeReadingMode = (mode: ReadingMode) => {
  const prevMode = readingMode.value;
  readingMode.value = mode;

  // 同步到设置 Store
  settingsStore.updateSettings({ readingMode: mode });

  // 滚动模式特殊处理
  if (mode === ReadingMode.CONTINUOUS_SCROLL) {
    // 滚动到当前页面对应的位置
    const scrollPosition =
      (currentPage.value / totalPages.value) * document.body.scrollHeight;
    window.scrollTo({
      top: scrollPosition,
      behavior: 'smooth',
    });
  }

  saveProgress();
};
```

---

## API 集成

### 1. Chapters Service

```typescript
// 获取章节详情
interface Chapter {
  id: string;
  comicId: string;
  title: string;
  pageNumber: number;
  imagePath: string;  // 漫画压缩包路径
  pages?: string[];   // 章节内的图片列表
  createdAt: Date;
  updatedAt: Date;
}

chaptersService.getChapterById(chapterId: string): Promise<Chapter>
```

### 2. Images Service

```typescript
// 获取图片 URL
imagesService.getImageUrl(
  comicPath: string,   // 漫画文件路径
  imagePath: string    // 图片在压缩包内的路径
): string

// 返回格式
// http://localhost:4399/images/view?comicPath=xxx&imagePath=yyy
```

### 3. Comics Service

```typescript
// 获取漫画的所有章节
comicsService.getComicChapters(comicId: string): Promise<Chapter[]>
```

---

## 状态管理

### 组件本地状态

```typescript
// 数据状态
const loading = ref(false); // 加载状态
const currentChapter = ref<Chapter | null>(null); // 当前章节
const chapters = ref<Chapter[]>([]); // 所有章节列表
const images = ref<string[]>([]); // 当前章节图片 URL 列表
const currentPage = ref(0); // 当前页码

// UI 状态
const readingMode = ref<ReadingMode>(ReadingMode.SINGLE_PAGE); // 阅读模式
const showControls = ref(true); // 控制栏显示状态
const isScrolling = ref(false); // 滚动防抖标志
```

### 计算属性

```typescript
// 总页数
const totalPages = computed(() => images.value.length);

// 当前图片
const currentImage = computed(() => images.value[currentPage.value]);

// 阅读进度百分比
const progress = computed(() => {
  if (totalPages.value === 0) return 0;
  return Math.round(((currentPage.value + 1) / totalPages.value) * 100);
});

// 是否有下一章
const hasNextChapter = computed(() => {
  return (
    currentChapterIndex.value >= 0 &&
    currentChapterIndex.value < chapters.value.length - 1
  );
});

// 是否在最后一页
const isLastPage = computed(() => {
  return currentPage.value >= totalPages.value - 1;
});
```

### Settings Store 集成

```typescript
// stores/settings.ts
import { defineStore } from 'pinia';

export const useSettingsStore = defineStore('settings', {
  state: () => ({
    readingMode: 'single', // 'single' | 'double' | 'scroll'
    readingDirection: 'ltr', // 'ltr' | 'rtl'
    zoomMode: 'fit', // 'fit' | 'width' | 'original'
    fontSize: 16,
    autoUpdate: true,
    comicStoragePath: '',
  }),

  actions: {
    updateSettings(updates: Partial<SettingsState>) {
      Object.assign(this, updates);
      this.saveToLocalStorage();
    },

    saveToLocalStorage() {
      localStorage.setItem('app_settings', JSON.stringify(this.$state));
    },

    loadFromLocalStorage() {
      const saved = localStorage.getItem('app_settings');
      if (saved) {
        Object.assign(this.$state, JSON.parse(saved));
      }
    },
  },
});
```

---

## 用户交互

### 1. 控制栏

#### 顶部导航栏

- **返回按钮**: 返回漫画详情页
- **章节信息**: 显示章节标题
- **页码显示**: 当前页 / 总页数 (如: 5 / 24)
- **阅读模式切换**: 三个按钮切换模式
- **设置按钮**: 显示/隐藏控制栏

#### 底部导航栏

- **上一页按钮**: 带图标和文字
- **进度条**: 拖动跳转到指定页
- **进度百分比**: 如 "45%"
- **下一页按钮**: 带图标和文字
- **下一章按钮**: 最后一页显示（如有）

#### 响应式适配

```css
/* 小屏幕（< 640px） */
- 隐藏章节标题，仅显示页码
- 按钮显示图标，隐藏文字
- 减小字体和内边距
- 收起进度条高度

/* 大屏幕（>= 640px） */
- 显示完整信息
- 保持标准尺寸
```

### 2. 快捷键提示

```vue
<div v-if="showControls && !isMobile" class="fixed bottom-20 right-4">
  <div class="bg-black/70 text-white p-4 rounded-lg text-sm">
    <p>← → 翻页 | H 隐藏控制栏</p>
    <p>1 2 3 切换模式 | Esc 返回</p>
  </div>
</div>
```

- 仅在 PC 端显示
- 移动端自动隐藏（`isMobile` 检测）

### 3. 移动端检测

```typescript
import { useWindowSize } from '@vueuse/core';

// 响应式窗口大小
const { width } = useWindowSize();

// 组合检测：User Agent 或 窗口宽度
const isMobileDevice = /Android|webOS|iPhone|iPad|iPod/i.test(
  navigator.userAgent,
);
const isMobile = computed(() => isMobileDevice || width.value < 640);

// 应用
watch(isMobile, (newIsMobile) => {
  if (newIsMobile && zoomMode.value !== 'fit') {
    // 移动端强制适应屏幕
    settingsStore.updateSettings({ zoomMode: 'fit' });
  }
});
```

---

## 响应式设计

### Tailwind 断点使用

```vue
<!-- 示例：顶部导航栏 -->
<div class="flex items-center justify-between p-4">
  <!-- 左侧：返回按钮 + 信息 -->
  <div class="flex items-center space-x-2 sm:space-x-4">
    <button class="text-gray-300 hover:text-white shrink-0">
      <svg class="w-5 h-5 sm:w-6 sm:h-6"><!-- Icon --></svg>
    </button>

    <!-- 章节信息：小屏隐藏标题 -->
    <div>
      <h2 class="hidden sm:block text-white font-semibold">
        {{ currentChapter?.title }}
      </h2>
      <p class="text-gray-400 text-xs sm:text-sm">
        {{ currentPage + 1 }} / {{ totalPages }}
      </p>
    </div>
  </div>

  <!-- 右侧：模式切换 -->
  <div class="flex items-center space-x-1 sm:space-x-2">
    <button
      v-for="mode in readingModes"
      :key="mode.value"
      class="px-2 py-1 text-xs sm:text-sm sm:px-3 sm:py-2"
    >
      <span class="sm:hidden">{{ mode.label.charAt(0) }}</span>
      <span class="hidden sm:inline">{{ mode.label }}</span>
    </button>
  </div>
</div>
```

### 关键断点

| 断点 | 宽度   | 用途            |
| ---- | ------ | --------------- |
| `sm` | 640px  | 手机 / 平板分界 |
| `md` | 768px  | 平板 / 桌面分界 |
| `lg` | 1024px | 桌面布局优化    |

---

## 性能优化

### 1. 图片懒加载

```vue
<img
  v-for="(image, index) in images"
  :key="index"
  :src="image"
  loading="lazy"
  class="w-full"
/>
```

### 2. 滚动防抖

```typescript
let scrollTimeout: NodeJS.Timeout | null = null;

const handleScroll = () => {
  if (scrollTimeout) clearTimeout(scrollTimeout);

  scrollTimeout = setTimeout(() => {
    // 处理滚动逻辑
    updateCurrentPageByScroll();
  }, 100);
};
```

### 3. 图片预加载（可选）

```typescript
const preloadNextImages = () => {
  const nextPage = currentPage.value + 1;
  if (nextPage < totalPages.value) {
    const img = new Image();
    img.src = images.value[nextPage];
  }
};
```

### 4. 组件缓存

```vue
<!-- App.vue 或 路由配置 -->
<router-view v-slot="{ Component }">
  <keep-alive :max="5">
    <component :is="Component" :key="$route.fullPath" />
  </keep-alive>
</router-view>
```

---

## 待实现功能

### 高优先级

- [ ] 阅读方向支持（从右到左 RTL）
- [ ] 图片缩放手势（双指缩放）
- [ ] 阅读历史记录同步到服务器
- [ ] 章节预加载

### 中优先级

- [ ] 全屏模式
- [ ] 页面跳转输入框
- [ ] 阅读统计（时长、页数）
- [ ] 书签功能

### 低优先级

- [ ] 自定义快捷键
- [ ] 主题色自定义
- [ ] 阅读计时器
- [ ] 护眼模式

---

## 错误处理

### 图片加载失败

```vue
<img :src="image" @error="handleImageError" alt="Page" />
```

```typescript
const handleImageError = (event: Event) => {
  const img = event.target as HTMLImageElement;
  img.src = '/placeholder-image.png'; // 占位图
};
```

### 章节加载失败

```typescript
const loadChapterImages = async () => {
  loading.value = true;
  try {
    // ...
  } catch (error) {
    console.error('Failed to load chapter:', error);

    // 显示错误提示
    alert('加载失败，请重试');

    // 返回上一页
    goBack();
  } finally {
    loading.value = false;
  }
};
```

---

## 总结

漫画阅读器是整个应用的核心功能，通过：

- **三种阅读模式**满足不同用户偏好
- **完善的键盘和触摸控制**提供流畅体验
- **自动进度保存和恢复**确保用户体验连续性
- **响应式设计**适配各种设备
- **与设置系统集成**实现全局配置管理

未来可以继续优化性能、增加高级功能（如 RTL 支持、手势缩放等），为用户提供更好的阅读体验。
