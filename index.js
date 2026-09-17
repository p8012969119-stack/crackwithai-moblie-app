import { AppRegistry } from 'react-native';
import App from './App';
import appConfig from './app.json';

const appName = appConfig?.name || 'CrackWithAI';

AppRegistry.registerComponent(appName, () => App);

