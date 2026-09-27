import { Environment } from '@env/ienvironment';

// Production (used by `ng build --configuration production`, e.g. the Azure DevOps pipeline).
export const environment: Environment = {
  production: true,
  environmentName: 'production',
  api: {
    // The API on Azure App Service (Free F1 tier: no custom domain, so use the azurewebsites address).
    // After upgrading to Basic B1 + custom domain, change this to 'https://api.flipleo.com'.
    rootUrl: 'https://flipleo-api-a7ahcqhwgdbuc9cc.centralus-01.azurewebsites.net',
  },
};
