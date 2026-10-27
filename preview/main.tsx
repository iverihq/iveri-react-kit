import { createRoot } from 'react-dom/client';

import { Gallery } from './Gallery.js';

import '../styles/tokens.css';
import './preview.css';

createRoot(document.querySelector('#root')!).render(<Gallery />);
