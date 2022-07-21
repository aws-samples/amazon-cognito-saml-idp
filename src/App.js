// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import React, { useEffect, useState } from "react"
import {
  Routes,
  Route,
} from "react-router-dom";
import { makeStyles } from '@mui/styles';
import { Auth } from 'aws-amplify';
import '@aws-amplify/ui-react/styles.css';
import { Authenticator, useAuthenticator } from '@aws-amplify/ui-react';

import Header from "./components/Header.js"
import Home from "./containers/Home.js"
import Items from "./containers/Items.js"
import Login from "./containers/Login.js"
import Item from "./components/Item.js"
import config from './config.js';
import isLocalhost from './utils/helper'

import './App.css';

const useStyles = makeStyles((theme) => ({
  authenticator: {
    padding: theme.spacing(3, 2),
    margin: '0 auto',
  },
}));

function App() {
  const classes = useStyles();
  const [userGroup, setUserGroup] = useState(null);
  const { authStatus } = useAuthenticator(context => [context.authStatus]);

  useEffect(() => {
    initApp();
  }, []);

  const initApp = async () => {
    try {
      const session = await Auth.currentSession();
      if (session) {
        console.debug('COGNITO: USER SESSION ESTABLISHED', session);
      }
    } catch (e) {
      if (e !== 'No current user') {
        console.warn(e);
      }
    }
  };

  const routes = () => {
    return(
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/items" >
          <Route index element={<Items />} />
          <Route path=":itemId" element={<Item />} />
        </ Route>
        <Route path="/login" element={<Login />} />
      </Routes>
    )
  }
  return (
    <div className="App">
      <Header/>
      {console.log("APP authStatus", authStatus)}
      {authStatus !== 'authenticated' ? <Login /> : routes()}
    </div>
  );
}

export default App;
