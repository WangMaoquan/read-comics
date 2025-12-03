import { ApiClient, type ApiClientConfig } from './core/client';
import { AuthService } from './services/auth';
import { ComicsService } from './services/comics';

export * from './core/client';
export * from './core/config';
export * from './services/auth';
export * from './services/comics';

export class ApiService {
  public client: ApiClient;
  public auth: AuthService;
  public comics: ComicsService;

  constructor(config: ApiClientConfig) {
    this.client = new ApiClient(config);
    this.auth = new AuthService(this.client);
    this.comics = new ComicsService(this.client);
  }
}

export function createApi(config: ApiClientConfig) {
  return new ApiService(config);
}
