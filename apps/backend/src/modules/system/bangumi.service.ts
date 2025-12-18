import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class BangumiService {
  private readonly logger = new Logger(BangumiService.name);
  private readonly baseUrl = 'https://api.bgm.tv';

  /**
   * 搜索漫画/书籍条目
   */
  async searchSubject(keyword: string) {
    try {
      this.logger.log(`Searching Bangumi for: ${keyword}`);
      // type 1 为书籍/漫画
      const response = await axios.get(
        `${this.baseUrl}/search/subject/${encodeURIComponent(keyword)}`,
        {
          params: {
            type: 1,
            responseGroup: 'medium',
          },
          headers: {
            'User-Agent':
              'read-comics-app (https://github.com/wangmaoquan/read-comics)',
          },
        },
      );

      if (
        response.data &&
        response.data.list &&
        response.data.list.length > 0
      ) {
        return response.data.list[0]; // 返回最相关的第一个结果
      }
      return null;
    } catch (error) {
      this.logger.error(`Bangumi search failed: ${error.message}`);
      return null;
    }
  }

  /**
   * 获取条目详情
   */
  async getSubjectDetails(subjectId: number) {
    try {
      const response = await axios.get(
        `${this.baseUrl}/v0/subjects/${subjectId}`,
        {
          headers: {
            'User-Agent': 'read-comics-app',
          },
        },
      );
      return response.data;
    } catch (error) {
      this.logger.error(
        `Failed to get Bangumi details for ${subjectId}: ${error.message}`,
      );
      return null;
    }
  }
}
