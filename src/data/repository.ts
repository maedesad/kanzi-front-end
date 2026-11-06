import { httpRepository } from './httpRepository';
import { mockRepository } from './mockRepository';

export const isDemo = import.meta.env.VITE_DATA_SOURCE !== 'api';
export const repository = isDemo ? mockRepository : httpRepository;
