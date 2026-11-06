import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@fontsource/poppins/400.css';
import '@fontsource/poppins/500.css';
import '@fontsource/poppins/600.css';
import '@fontsource/inter/400.css';
import '@fontsource/inter/500.css';
import '@fontsource/inter/700.css';
import '@fontsource/vazirmatn/400.css';
import './styles/theme.css';
import './styles/app.css';
import { App } from './app/App';

createRoot(document.getElementById('root')!).render(<StrictMode><App /></StrictMode>);
