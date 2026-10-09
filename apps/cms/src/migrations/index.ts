import * as migration_20261007_173103_initial from './20261007_173103_initial';
import * as migration_20261009_133621_drafts_for_globals_and_series from './20261009_133621_drafts_for_globals_and_series';

export const migrations = [
  {
    up: migration_20261007_173103_initial.up,
    down: migration_20261007_173103_initial.down,
    name: '20261007_173103_initial',
  },
  {
    up: migration_20261009_133621_drafts_for_globals_and_series.up,
    down: migration_20261009_133621_drafts_for_globals_and_series.down,
    name: '20261009_133621_drafts_for_globals_and_series'
  },
];
