import { Environment } from '@env/ienvironment';

// Local development (used by `ng serve`).
// Production values live in environment.prod.ts and are swapped in by angular.json fileReplacements.
export const environment: Environment = {
  production: false,
  environmentName: 'local',
  api: {
    rootUrl: 'http://localhost:5142',
  },
};
