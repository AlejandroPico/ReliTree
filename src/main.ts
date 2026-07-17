import { mount } from 'svelte';
import './styles/global.css';
import App from './App.svelte';

const target = document.getElementById('app');
if (!target) throw new Error('No se encontró el contenedor #app.');

mount(App, { target });
