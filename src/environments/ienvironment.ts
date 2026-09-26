export interface Environment {
  api: ApiEnvironment;
  environmentName: string;
  production: boolean;
}

export interface ApiEnvironment {
  rootUrl: string;
}
