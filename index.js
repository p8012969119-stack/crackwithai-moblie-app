import { AppRegistry } from 'react-native';
import App from './App';
import appConfig from './app.json';

const appName = appConfig?.name || 'CrackWithAI';

AppRegistry.registerComponent(appName, () => App);
if (appName !== 'crackwithai') {
  AppRegistry.registerComponent('crackwithai', () => App);
}
if (appName !== 'CrackWithAI') {
  AppRegistry.registerComponent('CrackWithAI', () => App);
}

