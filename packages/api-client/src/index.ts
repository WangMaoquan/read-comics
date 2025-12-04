import { ApiClient, type ApiClientConfig } from './core/client';
import { AuthService } from './services/auth';
import { ComicsService } from './services/comics';
import { ChaptersService } from './services/chapters';
import { TagsService } from './services/tags';
import { FavoritesService } from './services/favorites';

export * from './core/client';
export * from './core/config';
export * from './services/auth';
export * from './services/comics';
export * from './services/chapters';
export * from './services/tags';
export * from './services/favorites';

export class ApiService {
  public client: ApiClient;
  public auth: AuthService;
  public comics: ComicsService;
  public chapters: ChaptersService;
  public tags: TagsService;
  public favorites: FavoritesService;

  constructor(config: ApiClientConfig) {
    this.client = new ApiClient(config);
    this.auth = new AuthService(this.client);
    this.comics = new ComicsService(this.client);
    this.chapters = new ChaptersService(this.client);
    this.tags = new TagsService(this.client);
    this.favorites = new FavoritesService(this.client);
  }
}

export function createApi(config: ApiClientConfig) {
  return new ApiService(config);
}
