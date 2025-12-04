import { ApiClient } from '../core/client';
import { API_ENDPOINTS } from '../core/config';

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
 * 文件上传元数据
 */
export interface UploadMetadata {
  title?: string;
  author?: string;
  description?: string;
  tags?: string[];
}

export class FilesService {
  constructor(private client: ApiClient) {}

  /**
   * 上传文件（支持进度回调）
   */
  async uploadFile(
    file: File,
    metadata?: UploadMetadata,
    onProgress?: UploadProgressCallback,
  ): Promise<UploadResponse> {
    return new Promise((resolve, reject) => {
      const formData = new FormData();
      formData.append('file', file);

      if (metadata) {
        if (metadata.title) formData.append('title', metadata.title);
        if (metadata.author) formData.append('author', metadata.author);
        if (metadata.description)
          formData.append('description', metadata.description);
        if (metadata.tags && metadata.tags.length > 0) {
          formData.append('tags', JSON.stringify(metadata.tags));
        }
      }

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
          try {
            const errorResponse = JSON.parse(xhr.responseText);
            reject(
              new Error(
                errorResponse.message || `Upload failed: ${xhr.statusText}`,
              ),
            );
          } catch {
            reject(new Error(`Upload failed: ${xhr.statusText}`));
          }
        }
      });

      // 处理上传错误
      xhr.addEventListener('error', () => {
        reject(new Error('Upload failed'));
      });

      // 获取 baseURL（注意：这里需要访问 client 内部的配置）
      // 我们可以通过 API_ENDPOINTS 直接拼接
      const baseURL = (this.client as any).instance?.defaults?.baseURL || '';
      xhr.open('POST', `${baseURL}${API_ENDPOINTS.files.upload}`);

      // 添加认证 token（使用 client 的 getToken 方法）
      const token = localStorage.getItem('token');
      if (token) {
        xhr.setRequestHeader('Authorization', `Bearer ${token}`);
      }

      xhr.send(formData);
    });
  }

  /**
   * 扫描漫画目录
   */
  async scanComicsDirectory(): Promise<ScanResult> {
    return this.client.get<ScanResult>(API_ENDPOINTS.files.scan);
  }

  /**
   * 获取支持的文件格式
   */
  async getSupportedFormats(): Promise<any> {
    return this.client.get(API_ENDPOINTS.files.formats);
  }
}
