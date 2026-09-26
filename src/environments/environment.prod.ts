import { Environment } from '@env/ienvironment';

// Production (used by `ng build --configuration production`, e.g. the Azure DevOps pipeline).
export const environment: Environment = {
  production: true,
  environmentName: 'production',
  api: {
    // The API on Azure App Service, via the custom domain (see the go-live guide).
    // No custom domain yet? Use the App Service URL instead, e.g. 'https://flipleo-api.azurewebsites.net'
    rootUrl: 'https://api.flipleo.com',
  },
};
