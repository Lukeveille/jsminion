import React from 'react';
import './styles/App.css';
import Router from './Router';
import { Suspense } from 'react';
import Provider from './Provider';
import Spinner from './components/Spinner';


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
