import { render } from 'react-dom';
import App from './App';

render(<App />, document.getElementById('app'));

window.__remotes__ = {
    'stepextension': 'http://localhost:3002/remoteEntry.js'
};

if (module.hot) {
    module.hot.accept('./App', () => {
        const NewApp = require('./App').default;

        render(<NewApp />, document.getElementById('app'));
    });

    module.hot.accept();
}
