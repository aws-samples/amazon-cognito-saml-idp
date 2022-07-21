/*
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT-0
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this
 * software and associated documentation files (the "Software"), to deal in the Software
 * without restriction, including without limitation the rights to use, copy, modify,
 * merge, publish, distribute, sublicense, and/or sell copies of the Software, and to
 * permit persons to whom the Software is furnished to do so.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED,
 * INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A
 * PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
 * HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
 * OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
 * SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */
import { Stack, StackProps} from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as cdk from "aws-cdk-lib";
import * as iam from 'aws-cdk-lib/aws-iam';
import * as cognito from "aws-cdk-lib/aws-cognito";
import * as cloudfront from "aws-cdk-lib/aws-cloudfront";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as ssm from "aws-cdk-lib/aws-ssm";
import * as fs from 'fs';

export interface CDKInfraStackProps extends StackProps {
  env: cdk.Environment;
  envObject: any;
}

export class CDKInfraStack extends Stack {

  constructor(scope: Construct, id: string, props: CDKInfraStackProps) {
    super(scope, id);

    const prefix = `${props.envObject.EnvironmentStage}-${props.envObject.Prefix}`;

    /**************************************************************
     * S3 DEPLOYMENT BUCKET 
     **************************************************************/
    const uiDeploymentBucket = new s3.Bucket(this, 'uiDeploymentBucket', {
      bucketName: `${props.envObject.Prefix}-ui-${props.envObject.EnvironmentStage}`,
      versioned: false,
      websiteIndexDocument: 'index.html',
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL
    });

    new ssm.StringParameter(this, 'uiDeploymentBucketNameParam', {
      description: 'Name of the distributionId deployment Bucket',
      parameterName: `/${props.envObject.Prefix}/bucket/uiDeploymentBucketName`,
      stringValue: uiDeploymentBucket.bucketName
    });
    new cdk.CfnOutput(this, "UIDeploymentBucketNameCfnOutput", { value: uiDeploymentBucket.bucketName});

    // create an origin access identity for the archifacts bucket
    const originAccessIdentity = new cloudfront.OriginAccessIdentity(this, "uiDeploymentBucketOAI", {
      comment: "CICD-UI-DeploymentBucket-OAI"
    });
    uiDeploymentBucket.grantRead(originAccessIdentity);

    new ssm.StringParameter(this, 'uiDeploymentBucketOaiNameParam', {
      description: 'Name of the custom ui deployment Bucket Origin Access Identity',
      parameterName: `/${props.envObject.Prefix}/cloudfront/uiDeploymentBucketOaiName`,
      stringValue: originAccessIdentity.originAccessIdentityId
    });
    new cdk.CfnOutput(this, "uiDeploymentBucketOaiNameCfnOutput", { value: originAccessIdentity.originAccessIdentityId});

    /**************************************************************
     * CLOUDFRONT DISTRIBUTION 
     **************************************************************/
    const cloudFrontWebDistribution = new cloudfront.CloudFrontWebDistribution(this, "DistributionForUI", {
      originConfigs: [
        {
          s3OriginSource: {
            // id: `${props.envObject.Prefix}-build`,
            s3BucketSource: uiDeploymentBucket,
            originAccessIdentity: originAccessIdentity,
            originPath: "/build" },
          behaviors: [
            { isDefaultBehavior: true }
          ],
        }
      ],
      comment: "custom UI"
    });
    new cdk.CfnOutput(this, "cloudFrontUrl", { value: `https://${cloudFrontWebDistribution.distributionDomainName}`});
    new cdk.CfnOutput(this, "cloudFrontDistributionId", { value: cloudFrontWebDistribution.distributionId});

    //set a parameter for the cloudfront url
    new ssm.StringParameter(this, 'CustomUICloudFrontURL', {
      description: 'Custom UI CloudFront url',
      parameterName: `/${props.envObject.Prefix}/cloudfront/distributionUrl`,
      stringValue: `https://${cloudFrontWebDistribution.distributionDomainName}`
    });

    //set a parameter for the cloudfront destribution id
    new ssm.StringParameter(this, 'CustomUICloudFrontDistributionId', {
      description: 'Custom UI CloudFront Distribution ID',
      parameterName: `/${props.envObject.Prefix}/cloudfront/distributionId`,
      stringValue: cloudFrontWebDistribution.distributionId
    });

    /**************************************************************
     * COGNITO CONFIGURATION 
     **************************************************************/

    const userPool = new cognito.UserPool(this, `${prefix}-user-pool`, {
      selfSignUpEnabled: true, // Allow users to sign up
      userPoolName: `${prefix}-user-pool`,
      signInCaseSensitive: false,
      autoVerify: { email: true }, // Verify email addresses by sending a verification code
      signInAliases: { email: true }, // Set email as an alias
      customAttributes: {
        [props.envObject.CognitoMappedSuperadminGroupKey]: new cognito.StringAttribute({ minLen: 1, maxLen: 2048, mutable: true })
      }
    }); 
  
    // add User pool domain for SAML Idp with Ping Federate
    const userPoolDomain = userPool.addDomain('CognitoDomain', {
      cognitoDomain: {
        domainPrefix: prefix
      }
    })

    // user pool federation - identity provider and attribute mapping
    const cfnUserPoolIdentityProvider = new cognito.CfnUserPoolIdentityProvider(this, 'MyCfnUserPoolIdentityProvider', {
      providerName: props.envObject.IdentityProviderName,
      providerType: props.envObject.IdentityProviderType,
      providerDetails: {
        MetadataFile: fs.readFileSync(props.envObject.SamlMetadataFile, {encoding: 'utf8'})
      },
      userPoolId: userPool.userPoolId,

      // Your identity provider might offer sample SAML assertions for reference. 
      // Some identity providers use simple names, such as email, while others use URL-formatted attribute names
      // This attribute mapping maps attributes the idp sends to custom attributes you set in cognito
      attributeMapping: {
        "email": "http://shemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress",
        [`custom:${props.envObject.CognitoMappedSuperadminGroupKey}`]: props.envObject.IdentityProviderSAMLGroupKey
      },
    });

    const clientWriteAttributes = (new cognito.ClientAttributes())
      .withStandardAttributes({ 
        birthdate: true,
        familyName: true,
        fullname: true,
        gender: true,
        givenName: true,
        lastUpdateTime: true,
        locale: true,
        middleName: true,
        nickname: true,
        preferredUsername: true,
        profilePage: true,
        profilePicture: true,
        timezone: true,
        website: true,
      })
      .withCustomAttributes(`custom:${props.envObject.CognitoMappedSuperadminGroupKey}`);

    const clientReadAttributes = (new cognito.ClientAttributes())
      .withStandardAttributes({
        emailVerified: true, 
        birthdate: true,
        email: true,
        familyName: true,
        fullname: true,
        gender: true,
        givenName: true,
        lastUpdateTime: true,
        locale: true,
        middleName: true,
        nickname: true,
        preferredUsername: true,
        profilePage: true,
        profilePicture: true,
        timezone: true,
        website: true,
      })
      .withCustomAttributes(`custom:${props.envObject.CognitoMappedSuperadminGroupKey}`);

    const customIdp = cognito.UserPoolClientIdentityProvider.custom(props.envObject.IdentityProviderName)
        
    const userPoolAppClient = new cognito.UserPoolClient(this, `${prefix}-app-client`, {
      userPool: userPool,
      userPoolClientName: `${prefix}-app-client`,
      generateSecret: false, // Don't need to generate secret for app running on browsers
      oAuth: {
        flows: {
          implicitCodeGrant: true,
          authorizationCodeGrant: true,
        },
        scopes: [cognito.OAuthScope.EMAIL,cognito.OAuthScope.OPENID,cognito.OAuthScope.COGNITO_ADMIN, cognito.OAuthScope.PROFILE],
        callbackUrls: ["http://localhost:3000", `https://${cloudFrontWebDistribution.distributionDomainName}`]
      },
      supportedIdentityProviders: [cognito.UserPoolClientIdentityProvider.COGNITO, customIdp],
      readAttributes: clientReadAttributes,
      writeAttributes: clientWriteAttributes
    });

      // Identity pool
    const identityPool = new cognito.CfnIdentityPool(this, `${prefix}-identity-pool`, {
      identityPoolName: `${prefix}-identity-pool`,
      allowUnauthenticatedIdentities: false,
      cognitoIdentityProviders: [
        {
          clientId: userPoolAppClient.userPoolClientId,
          providerName: userPool.userPoolProviderName,
        },
      ],
    });

    // Cognito role (For now, both unauthenticated and authenticated)
    const cognitoAuthRole = new iam.Role(this, 'cognitoAuthRole', {
      assumedBy: new iam.FederatedPrincipal(
        'cognito-identity.amazonaws.com',
        {
          StringEquals: {
            'cognito-identity.amazonaws.com:aud': identityPool.ref,
          },
        },
        'sts:AssumeRoleWithWebIdentity'
      ),
      path: '/',
    });
    cognitoAuthRole.addToPolicy(
      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: ['mobileanalytics:PutEvents', 'cognito-sync:*', 'cognito-identity:*'],
        resources: ['*'],
      })
    );

    // // Attach role to Identity Pool (auth + unauth)
    new cognito.CfnIdentityPoolRoleAttachment(this, 'IdentityPoolRoleAttachment', {
      identityPoolId: identityPool.ref,
      roles: { authenticated: cognitoAuthRole.roleArn },
    });

    //Writing useful parameters into SystemManager ParameterStore
    new ssm.StringParameter(this, "SSM-UserPoolId", {
      parameterName: `/${props.envObject.EnvironmentStage}/${props.envObject.Prefix}/UserPoolId`,
      description: "Cognito UserPoolId for application",
      stringValue: userPool.userPoolId,
    });

    new ssm.StringParameter(this, "SSM-AppClientId", {
      parameterName: `/${props.envObject.EnvironmentStage}/${props.envObject.Prefix}/AppClientId`,
      description: "Cognito AppClientId for application",
      stringValue: userPoolAppClient.userPoolClientId,
    });

    new ssm.StringParameter(this, "SSM-IdentityPoolId", {
      parameterName: `/${props.envObject.EnvironmentStage}/${props.envObject.Prefix}/IdentityPoolId`,
      description: "Cognito IdentityPoolId for application",
      stringValue: identityPool.ref,
    });

    new ssm.StringParameter(this, "SSM-DomainUrl", {
      parameterName: `/${props.envObject.EnvironmentStage}/${props.envObject.Prefix}/DomainUrl`,
      description: "Cognito UserPool domain url for app client",
      stringValue: `${userPoolDomain.domainName}.auth.${props.envObject.Region}.amazoncognito.com`,
    });

    new ssm.StringParameter(this, "SSM-SAMLIdpName", {
      parameterName: `/${props.envObject.EnvironmentStage}/${props.envObject.Prefix}/SAMLIdpName`,
      description: "Cognito UserPool SAML Idp name for user pool federated SAML SSO",
      stringValue: props.envObject.IdentityProviderName,
    });

    new ssm.StringParameter(this, "SSM-SSORedirectURL", {
      parameterName: `/${props.envObject.EnvironmentStage}/${props.envObject.Prefix}/SSORedirectURL`,
      description: "Cognito UserPool redirect url for user pool federated SAML SSO",
      stringValue: `https://${cloudFrontWebDistribution.distributionDomainName}`,
    });

    new ssm.StringParameter(this, "SSM-SuperadminGroupKey", {
      parameterName: `/${props.envObject.EnvironmentStage}/${props.envObject.Prefix}/SuperadminGroupKey`,
      description: "The cognito userpool user attribute that has the group name as the value.",
      stringValue: `custom:${props.envObject.CognitoMappedSuperadminGroupKey}`,
    });

    new ssm.StringParameter(this, "SSM-SuperadminGroupName", {
      parameterName: `/${props.envObject.EnvironmentStage}/${props.envObject.Prefix}/SuperadminGroupName`,
      description: "The name of the group configured in identity provider console  that is sent in the SAML response",
      stringValue: props.envObject.IdentityProviderSuperadminGroupName,
    });
  }
}
