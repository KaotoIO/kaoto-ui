import App from './App';
import { createRoot } from 'react-dom/client';

// NOTE: Uncomment this to enable OpenTelemetry
// import webTracer from './webTracer';

// NOTE: Uncomment this to enable OpenTelemetry
// webTracer();

const container = document.getElementById('app');
const root = createRoot(container!);
root.render(<App />);
