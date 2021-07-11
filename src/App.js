import React from 'react';
import './styles/App.css';
import Router from './Router';
import { Suspense } from 'react';
import Provider from './Provider';
import Spinner from './components/Spinner';

let axiosDefaults = require('axios/lib/defaults');
axiosDefaults.baseURL = 'https://pokeapi.co/api';

function App() {
  return (
    <Provider>
      <Suspense fallback={<Spinner />}>
        <Router />
      </Suspense>
    </Provider>
  );
}

export default App;
