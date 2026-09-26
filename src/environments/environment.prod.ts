import { Environment } from '@env/ienvironment';

export const environment: Environment = {
  production: true,
  environmentName: 'production',
  api: {
    // TODO: set to the hosted API URL once the API is deployed (e.g. Azure App Service)
    rootUrl: '',
  },
};
