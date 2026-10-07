import * as migration_20261007_173103_initial from './20261007_173103_initial';

export const migrations = [
  {
    up: migration_20261007_173103_initial.up,
    down: migration_20261007_173103_initial.down,
    name: '20261007_173103_initial'
  },
];
