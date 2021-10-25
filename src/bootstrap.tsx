import { render } from 'react-dom';
import App from './App';

render(<App />, document.getElementById('app'));

if (module.hot) {
    module.hot.accept('./App', () => {
        const NewApp = require('./App').default;

        render(<NewApp />, document.getElementById('app'));
    });

    module.hot.accept();
}
