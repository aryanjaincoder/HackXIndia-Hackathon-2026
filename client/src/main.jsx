<<<<<<< HEAD
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom'; // <-- YEH BAHUT ZAROORI HAI
import App from './App';
import './index.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {/* BrowserRouter ko App ke baahar hona chahiye */}
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>
);

=======
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom'; // <-- YEH BAHUT ZAROORI HAI
import App from './App';
import './index.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {/* BrowserRouter ko App ke baahar hona chahiye */}
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>
);

>>>>>>> 2456ec264d991bff9cb8d8ee3f6e135ecaf2b092
