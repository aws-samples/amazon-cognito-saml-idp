// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router } from 'react-router-dom';

import App from './App';
import config from './config.js';
import reportWebVitals from './reportWebVitals';
import Amplify, { Auth } from 'aws-amplify';
import { Authenticator } from '@aws-amplify/ui-react';

import { ThemeProvider } from '@mui/styles';
import CssBaseline from '@mui/material/CssBaseline';
import defaultTheme from './theme/defaultTheme';
import './index.css';

// This tells the authorization server (Amazon Cognito) that the application is initiating the implicit flow
const OAUTH_RESPONSE_TYPE = 'token';

// The email scope grants access to the email and email_verified claims. This scope can only be requested with the openid scope.
// The openid scope returns all user attributes in the ID token that are readable by the client. The ID token is not returned if the openid scope is not requested by the client
// The aws.cognito.signin.user.admin scope grants access to Amazon Cognito user pool API operations that require access tokens, such as UpdateUserAttributes and VerifyUserAttribute
// The profile scope grants access to all user attributes that are readable by the client. This scope can only be requested with the openid scope
// See AWS documentation here https://docs.aws.amazon.com/cognito/latest/developerguide/cognito-user-pools-app-idp-settings.html#cognito-user-pools-app-idp-settings-about
// See section Allowed OAuth Scopes

const OAUTH_SCOPES = ['email', 'openid', 'aws.cognito.signin.user.admin', 'profile'];

Amplify.configure({
  Auth: {
    mandatorySignIn: true,
    region: config.cognito.REGION,
    userPoolId: config.cognito.USER_POOL_ID,
    identityPoolId: config.cognito.IDENTITY_POOL_ID,
    userPoolWebClientId: config.cognito.APP_CLIENT_ID,
  },
  oauth: {
    domain: config.cognito.DOMAIN_URL,
    scope: OAUTH_SCOPES,
    redirectSignIn: config.cognito.SSO_REDIRECT_SIGN_IN_URL,
    responseType: OAUTH_RESPONSE_TYPE,
    clientId: config.cognito.APP_CLIENT_ID,
  },
});

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <ThemeProvider theme={defaultTheme}>
      <CssBaseline />
      <Router>
        <Authenticator.Provider>
          <App />
        </Authenticator.Provider>
      </Router>
    </ThemeProvider>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
