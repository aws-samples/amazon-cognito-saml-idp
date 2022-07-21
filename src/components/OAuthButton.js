// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import React, { useState } from 'react';
import Amplify, { Auth } from 'aws-amplify';

import Button from '@mui/material/Button';
import config from "../config.js";

const OAuthButton = () => {

	const handleClick = () => {
		Auth.federatedSignIn({customProvider: config.cognito.SAML_IDP_NAME})
	}

	return(
		<div className="login">
			<Button onClick={handleClick}>
				with SSO
			</Button>
		</div>
	)
}

export default OAuthButton;