// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

const { SSMClient, GetParameterCommand } = require("@aws-sdk/client-ssm");

const fs = require('fs');
const path = require('path');

const UI_CONFIG_TEMPLATE = './src/scripts/ui-config.template';
const UI_CONFIG_FILE = './src/config.js';
const AWS_REGION = 'us-east-1';
var envName = "qa"
var envPrefix = "example-saml-idp"

const userPoolIdSSMName = '/'+envName+'/'+envPrefix+'/UserPoolId';
const identityPoolIdSSMName = '/'+envName+'/'+envPrefix+'/IdentityPoolId';
const appClientIdSSMName = '/'+envName+'/'+envPrefix+'/AppClientId';
const domainUrlSSMName = '/'+envName+'/'+envPrefix+'/DomainUrl';
const samlIdpNameSSMName = '/'+envName+'/'+envPrefix+'/SAMLIdpName';
const ssoRedirectSignInUrlSSMName = '/'+envName+'/'+envPrefix+'/SSORedirectURL';
const superadminGroupKeySSMName = '/'+envName+'/'+envPrefix+'/SuperadminGroupKey';
const superadminGroupNameSSMName = '/'+envName+'/'+envPrefix+'/SuperadminGroupName';

const ssm = new SSMClient({
  region: AWS_REGION
});

const getParam = async (input) => {
  const command = new GetParameterCommand(input);
  return ssm.send(command)
}

(async () => {

  try {

    console.log("START");
    console.log("fetching userPoolIdResponse");
    const userPoolIdResponse = await getParam({ Name: userPoolIdSSMName });
    const userPoolId = userPoolIdResponse.Parameter.Value;
    console.log("userPoolId", userPoolId);
    
    console.log("fetching identityPoolIdResponse");
    const identityPoolIdResponse = await getParam({ Name: identityPoolIdSSMName })
    const identityPoolId = identityPoolIdResponse.Parameter.Value;
    console.log("identityPoolId", identityPoolId);

    console.log("fetching appClientIdResponse");
    const appClientIdResponse = await getParam({ Name: appClientIdSSMName })
    const appClientId = appClientIdResponse.Parameter.Value;
    console.log("appClientId", appClientIdResponse.Parameter.Value);

    console.log("fetching domainUrlResponse");
    const domainUrlResponse = await getParam({ Name: domainUrlSSMName })
    const domainUrl = domainUrlResponse.Parameter.Value;
    console.log("domainUrl", domainUrlResponse.Parameter.Value);

    console.log("fetching samlIdpNameResponse");
    const samlIdpNameResponse = await getParam({ Name: samlIdpNameSSMName })
    const samlIdpName = samlIdpNameResponse.Parameter.Value;
    console.log("samlIdpName", samlIdpNameResponse.Parameter.Value);

    console.log("fetching ssoRedirectSignInUrlResponse");
    const ssoRedirectSignInUrlResponse = await getParam({ Name: ssoRedirectSignInUrlSSMName })
    const ssoRedirectSignInUrl = ssoRedirectSignInUrlResponse.Parameter.Value;
    console.log("ssoRedirectSignInUrl", ssoRedirectSignInUrlResponse.Parameter.Value);

    console.log("fetching superadminGroupKeyResponse");
    const superadminGroupKeyResponse = await getParam({ Name: superadminGroupKeySSMName })
    const superadminGroupKey = superadminGroupKeyResponse.Parameter.Value;
    console.log("superadminGroupKey", superadminGroupKeyResponse.Parameter.Value);

    console.log("fetching superadminGroupNameResponse");
    const superadminGroupNameResponse = await getParam({ Name: superadminGroupNameSSMName })
    const superadminGroupName = superadminGroupNameResponse.Parameter.Value;
    console.log("superadminGroupName", superadminGroupNameResponse.Parameter.Value);

    fs.readFile(path.join(process.cwd(), UI_CONFIG_TEMPLATE), 'utf8', function (err, data) {
      // Replaces
      var formatted = data.replace(/%AWS_REGION%/g, AWS_REGION);
      formatted = formatted.replace(/%USER_POOL_ID%/g, userPoolId);
      formatted = formatted.replace(/%APP_CLIENT_ID%/g, appClientId);
      formatted = formatted.replace(/%DOMAIN_URL%/g, domainUrl);
      formatted = formatted.replace(/%SAML_IDP_NAME%/g, samlIdpName);
      formatted = formatted.replace(/%SSO_REDIRECT_SIGN_IN_URL%/g, ssoRedirectSignInUrl);
      formatted = formatted.replace(/%SUPERADMIN_GROUP_KEY%/g, superadminGroupKey);
      formatted = formatted.replace(/%IDENTITY_POOL_ID%/g, identityPoolId);
      formatted = formatted.replace(/%SUPERADMIN_GROUP_NAME%/g, superadminGroupName);
      console.log('generated file: ' + formatted);
      fs.writeFile(UI_CONFIG_FILE, formatted, 'utf8', function (err) {
        console.log('generated file: ' + formatted);
        if (err) return console.log(err);
      });
    });
    console.log('Successfully initialized UI static configuration file.');
    //return true;
  } catch (e) {
    console.error('Script failed to initialized UI static configuration file: ' + e);
  }
})();
