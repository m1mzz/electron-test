import './index.css';
import { createApp } from 'vue';
import { createPinia } from 'pinia'
import App from './App.vue';
// import { devtools } from '@vue/devtools';

const pinia = createPinia()
const app = createApp(App)

app.use(pinia)

app.mount('#app')

// if (process.env.NODE_ENV === 'development') {
//   TODO: fix connection to devtools. then remove connect in index.html
//   devtools.connect(/* host, port */)
// }