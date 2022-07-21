// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import React, { useState, useEffect } from 'react';
import { Auth } from 'aws-amplify';
import { useNavigate } from "react-router-dom";
import { Authenticator, useAuthenticator } from '@aws-amplify/ui-react';

import Avatar from '@mui/material/Avatar';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import '@aws-amplify/ui-react/styles.css';
import Typography from '@mui/material/Typography';
import { makeStyles } from '@mui/styles';
import Grid from '@mui/material/Grid';
import OAuthButton from "../components/OAuthButton.js"
import config from '../config.js'
import { isLocalhost } from '../utils/helper'

const useStyles = makeStyles((theme) => ({
  box: {
    marginTop: theme.spacing(8),
  },
  paper: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatar: {
    margin: theme.spacing(1),
    backgroundColor: theme.palette.secondary.main,
  },
}));

function Login(props) {
  const { authStatus } = useAuthenticator(context => [context.authStatus]);
  const navigate = useNavigate()
  const classes = useStyles();

  useEffect(() => {
    if(authStatus === 'authenticated') {
      navigate("/", {replace: true})
    }
  }, [authStatus]);

  const sso = () => {
    return(
      <>
        <Avatar className={classes.avatar}>
          <LockOutlinedIcon />
        </Avatar>
        <Typography component='h1' variant='h5'>
          Sign in
        </Typography>
        <OAuthButton />
      </>
    )
  }

  return (
    <Grid
      container
      spacing={0}
      direction='column'
      alignItems='center'
      style={{
        minHeight: '100vh',
        justifyContent: 'center',
      }}
    >
      <Grid className={classes.paper} item>
        <div className={classes.authenticator}>
          { (isLocalhost) ? <Authenticator hideSignUp={true} /> : sso() }
        </div>
      </Grid>
    </Grid>
  );
}

export default Login;
