# Custom React app with SSO using Cognito SAML Idp

## Introduction

This project is a simple template for getting started with a react app that has SAML SSO configured. This template also features the ability to restrict access to UI components based on the user's groups that are preconfigured in the Identity provider's console. The template includes:

- Basic React UI and react routing
- Ability to restrict access to components based on groups configured in Idp console.
- CDK for deploying UI to S3 and Cloudfront distribution
- CDK for configuring Cognito userpool, identity pool, SAML identity provider setup, custom attribute setup from Idp

## How it works

This is a react app that uses the Amplify UI library for Authentication. One can authenticate via SSO or username and password. However, this solution is setup to use SSO. Once you deploy the CDK stack and have the corresponding application integration in the identity providers console. You will be able to login by visiting the cloudfront distribution URL and clicking the SSO button on the page that appears. This setup is not entirely automated as you will have to do some configuration in your identity provider console.

### Authentication

If you decide to utilize the ability to restrict access to UI components you will need to ensure that you setup setup an additional attribute to send group membership information as a SAML attribute in the SAML response from the identity provider. The CDK is setup to configure a Cognito custom attribute to which IdP's SAML attribute will be mapped. The setting for the Cognito custom attribute can be found in the `cdk.json` and is called `CognitoMappedSuperadminGroupKey`. Change this value to change the name of the custom attribute. The CDK will also configure the attribute mapping for this.


**Opt out of Idp attributes**

If you want to opt of using the custom attributes configuration you will have to remove the `attributeMapping`, `customAttributes`, `clientWriteAttributes` and `clientReadAttributes` from the CDK stack. Please note, once you create a custom attribute on the userpool it cannot be removed. To remove this you would have to delete the userpool and redeploy.

### UI

The UI is deployed to an S3 bucket and the content is served via a Cloudfront distribution.

## Deployment of AWS CDK stack

Once the stack is deployed you will need to create an application integration with your Identity provider. This configuration with require the Entity ID and the ACS (Assertion consumer service) URL. The Entity ID follows this format `urn:amazon:cognito:sp:<yourUserPoolID>` and the ASC URL is made up of the domain prefix created for the userpool application client this is the format for the ASC URL `https://<yourDomainPrefix>.auth.<region>.amazoncognito.com/saml2/idpresponse`

Learn more in the AWS documentation [here](https://docs.aws.amazon.com/cognito/latest/developerguide/cognito-user-pools-saml-idp.html)

domain prefix must be unique

1. Update environment object in `cdk-intra/cdk.json`.
	- replace the value of `IdentityProviderName` from `<Identity_provider_name>` to the name of the provider you are using. Example: Okta, PingFederate, AzureAd
	- Set the Account Id
2. if running the script locally, grant the execute permissions. `chmod +x scripts/deploy.sh`
3. Run the deploy script `scripts/deploy.sh`. This is to create the userpool, the userpool client and the corresponding domain for the client. This information will be needed for the next step.
4. Setup the application integration on your Identity provider console by provding the Entity ID and ACS URL.
5. Add the SAML metadata from the Identity provider to the `cdk-infra/SAML/metadata.xml` file.
6. Redeploy the stack to update the metadata.

## Local development

1. Run `npm install`
2. Deploy the CDK stack
3. Run  `src/scripts/setup-ui.js`
2. Setup authentication for SSO (configure app integration on IdP console) or password login (create user in Cognito console). 

## Security

See [CONTRIBUTING](CONTRIBUTING.md#security-issue-notifications) for more information.

## License

This library is licensed under the MIT-0 License. See the LICENSE file.
