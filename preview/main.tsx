import { createRoot } from 'react-dom/client';

import { Gallery } from './Gallery.js';
import { ShellPreview } from './ShellPreview.js';

import './preview.css';

createRoot(document.querySelector('#root')!).render(
    new URLSearchParams(window.location.search).has('shell') ? <ShellPreview /> : <Gallery />,
);
