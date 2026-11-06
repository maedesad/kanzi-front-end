import { useCallback, useState } from 'react';
import { repository } from '../data/repository';
import { useAsync } from './useAsync';

export function useLibrary() {
  const [revision, setRevision] = useState(0);
  const state = useAsync(signal => repository.listWords('', signal), [revision]);
  const refresh = useCallback(() => setRevision(value => value + 1), []);
  return { ...state, words: state.data ?? [], refresh, revision };
}
