import { apiClient } from '../client';
import { API_ENDPOINTS } from '../config';

/**
 * 文件上传响应
 */
export interface UploadResponse {
  success: boolean;
  message?: string;
  data?: {
    filename: string;
    originalname: string;
    size: number;
    path: string;
    comic: {
      id: string;
      title: string;
      chaptersCount: number;
    };
  };
}

/**
 * 扫描结果
 */
export interface ScanResult {
  success: boolean;
  count: number;
  files: string[];
}

/**
 * 文件上传进度回调
 */
export type UploadProgressCallback = (progress: number) => void;

/**
 * 文件服务
 */
export const filesService = {
  /**
   * 上传文件
   */
  async uploadFile(
    file: File,
    onProgress?: UploadProgressCallback,
  ): Promise<UploadResponse> {
    return new Promise((resolve, reject) => {
      const formData = new FormData();
      formData.append('file', file);

      const xhr = new XMLHttpRequest();

      // 监听上传进度
      if (onProgress) {
        xhr.upload.addEventListener('progress', (e) => {
          if (e.lengthComputable) {
            const progress = Math.round((e.loaded / e.total) * 100);
            onProgress(progress);
          }
        });
      }

      // 处理上传完成
      xhr.addEventListener('load', () => {
        if (xhr.status === 200 || xhr.status === 201) {
          try {
            const response = JSON.parse(xhr.responseText);
            resolve(response);
          } catch (error) {
            reject(new Error('Failed to parse response'));
          }
        } else {
          reject(new Error(`Upload failed: ${xhr.statusText}`));
        }
      });

      // 处理上传错误
      xhr.addEventListener('error', () => {
        reject(new Error('Upload failed'));
      });

      xhr.open('POST', `${apiClient['baseURL']}${API_ENDPOINTS.files.upload}`);
      xhr.send(formData);
    });
  },

  /**
   * 扫描漫画目录
   */
  async scanComicsDirectory(): Promise<ScanResult> {
    return apiClient.get<ScanResult>(API_ENDPOINTS.files.scan);
  },

  /**
   * 获取支持的文件格式
   */
  async getSupportedFormats(): Promise<any> {
    return apiClient.get(API_ENDPOINTS.files.formats);
  },
};
