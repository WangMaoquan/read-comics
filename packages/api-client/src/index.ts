import { ApiClient, type ApiClientConfig } from './core/client';
import { AuthService } from './services/auth';

export * from './core/client';
export * from './core/config';
export * from './services/auth';

export class ApiService {
  public client: ApiClient;
  public auth: AuthService;

  constructor(config: ApiClientConfig) {
    this.client = new ApiClient(config);
    this.auth = new AuthService(this.client);
  }
}

export function createApi(config: ApiClientConfig) {
  return new ApiService(config);
}
