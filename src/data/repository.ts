import { httpRepository } from './httpRepository';
import { mockRepository } from './mockRepository';

export const repository = import.meta.env.VITE_DATA_SOURCE === 'api' ? httpRepository : mockRepository;
