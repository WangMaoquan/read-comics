import { defineStore } from 'pinia';
import { ComicStatus } from '@read-comics/types';
import { useComicStore } from './comic';

interface ImportProgress {
  total: number;
  current: number;
  currentFile: string;
  status: 'idle' | 'scanning' | 'importing' | 'completed' | 'error';
  error: string | null;
  logs: string[];
}

export const useFileStore = defineStore('files', {
  state: (): ImportProgress => ({
    total: 0,
    current: 0,
    currentFile: '',
    status: 'idle',
    error: null,
    logs: [],
  }),

  actions: {
    addLog(message: string) {
      this.logs.push(`[${new Date().toLocaleTimeString()}] ${message}`);
    },

    async importComics() {
      if (this.status === 'scanning' || this.status === 'importing') return;

      this.status = 'scanning';
      this.error = null;
      this.logs = [];
      this.current = 0;
      this.total = 0;

      try {
        this.addLog('开始扫描漫画目录...');
        // 1. Scan directory
        const scanResponse = await fetch('http://localhost:4399/files/scan');
        if (!scanResponse.ok) throw new Error('扫描失败');

        const scanResult = await scanResponse.json();
        if (!scanResult.success)
          throw new Error(scanResult.error || '扫描失败');

        const files = scanResult.files;
        this.total = files.length;
        this.addLog(`扫描完成，发现 ${this.total} 个文件`);

        if (this.total === 0) {
          this.status = 'completed';
          return;
        }

        this.status = 'importing';
        const comicStore = useComicStore();

        // 2. Process each file
        for (const filePath of files) {
          this.currentFile = filePath;
          this.current++;
          this.addLog(`正在处理 (${this.current}/${this.total}): ${filePath}`);

          try {
            // Parse file
            const parseResponse = await fetch(
              `http://localhost:4399/files/parse/${encodeURIComponent(filePath)}`,
            );
            if (!parseResponse.ok) {
              this.addLog(`解析失败: ${filePath}`);
              continue;
            }

            const parseResult = await parseResponse.json();
            if (!parseResult.success) {
              this.addLog(`解析错误: ${parseResult.error}`);
              continue;
            }

            const metadata = parseResult.data;

            // Create comic
            const createResponse = await fetch('http://localhost:4399/comics', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                title: metadata.title,
                filePath: filePath,
                fileSize: 0,
                fileFormat: metadata.format,
                totalPages: metadata.totalPages,
                status: ComicStatus.UNREAD,
                chapters: metadata.chapters,
              }),
            });

            if (!createResponse.ok) {
              this.addLog(`创建失败: ${filePath}`);
              continue;
            }

            this.addLog(`导入成功: ${metadata.title}`);
          } catch (err) {
            console.error(err);
            this.addLog(`处理出错: ${filePath}`);
          }
        }

        this.status = 'completed';
        this.addLog('导入流程结束');

        // Refresh comic list
        await comicStore.fetchComics();
      } catch (error) {
        this.status = 'error';
        this.error = error instanceof Error ? error.message : '导入失败';
        this.addLog(`发生错误: ${this.error}`);
      }
    },

    resetStatus() {
      this.status = 'idle';
      this.error = null;
      this.logs = [];
      this.current = 0;
      this.total = 0;
      this.currentFile = '';
    },
  },
});
