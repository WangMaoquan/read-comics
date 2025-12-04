import { ApiClient, type ApiClientConfig } from './core/client';
import { AuthService } from './services/auth';
import { ComicsService } from './services/comics';
import { ChaptersService } from './services/chapters';
import { TagsService } from './services/tags';
import { FavoritesService } from './services/favorites';
import { FilesService } from './services/files';
import { ImagesService } from './services/images';
import { UsersService } from './services/users';
import { StatsService } from './services/stats';
import { LogsService } from './services/logs';
import { TasksService } from './services/tasks';
import { BackupsService } from './services/backups';

export * from './core/client';
export * from './core/config';
export * from './services/auth';
export * from './services/comics';
export * from './services/chapters';
export * from './services/tags';
export * from './services/favorites';
export * from './services/files';
export * from './services/images';
export * from './services/users';
export * from './services/stats';
export * from './services/logs';
export * from './services/tasks';
export * from './services/backups';

export class ApiService {
  public client: ApiClient;
  public auth: AuthService;
  public comics: ComicsService;
  public chapters: ChaptersService;
  public tags: TagsService;
  public favorites: FavoritesService;
  public files: FilesService;
  public images: ImagesService;
  public users: UsersService;
  public stats: StatsService;
  public logs: LogsService;
  public tasks: TasksService;
  public backups: BackupsService;

  constructor(config: ApiClientConfig) {
    this.client = new ApiClient(config);
    this.auth = new AuthService(this.client);
    this.comics = new ComicsService(this.client);
    this.chapters = new ChaptersService(this.client);
    this.tags = new TagsService(this.client);
    this.favorites = new FavoritesService(this.client);
    this.files = new FilesService(this.client);
    this.images = new ImagesService(config.baseURL);
    this.users = new UsersService(this.client);
    this.stats = new StatsService(this.client);
    this.logs = new LogsService(this.client);
    this.tasks = new TasksService(this.client);
    this.backups = new BackupsService(this.client);
  }
}

export function createApi(config: ApiClientConfig) {
  return new ApiService(config);
}
