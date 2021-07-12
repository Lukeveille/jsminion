import React from 'react';
import './styles/App.css';
import Router from './Router';
import { Suspense } from 'react';
import Provider from './Provider';
import Spinner from './components/Spinner';

let api = require('axios/lib/defaults');
api.baseURL = 'http://localhost:1337';

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
