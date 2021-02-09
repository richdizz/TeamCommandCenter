# TeamCommandCenter
Simple app for Microsoft Teams that aggregates multiple channel chats into a single static tab dashboard in the Team's General channel. The application uses Resource Specific Consent (RSC) to gain access to channel threads/messages as the application is installed into Teams. It uses tab single sign-in (SSO) with Azure AD to get profile photos for users and to post messages on behalf of the signed in user.

## High-level Getting Started
1. Verify Resource-Specific Consent (RSC) is turned on in your tenant. RSC is used to allow applications to get a smaller scope of data than typical application permissions (ex: threads/messages for one specific Team instead of ALL Teams). See these instructions for validating this feature is turned on: https://docs.microsoft.com/en-us/microsoftteams/platform/graph-api/rsc/resource-specific-consent
2. Register an application in Azure AD with the following criteria:
  - Go to *Expose and API* under *Manage* and change the App URI to the following pattern: api://{host domain}/{app id} (for example: api://richdizz.ngrok.io/3b71b554-9382-46eb-bc2e-56f7498e4290)
  - On the same screen create a permission scope for the application called access_as_user that both admins and users can consent to
  - At the bottom of the screen, click the *Add a client application* to authorize the following two client IDs for the permission scope you created in the previous step: 1fec8e78-bce4-4aaf-ab1b-5451cc387264 (Teams Client), 5e3ce6c0-2b1f-4285-8d4b-75ee78787346 (Teams Mobile App)
  - Go to *API Permissions* under *Manage* and add the following *delegated* permissions to the application from the Microsoft Graph: ChannelMessage.Send, User.Read, User.ReadBasic.All, email, offline_access, profile, openid
3. Generate and base64 encode a certificate with both a public and private keys. The public key will be sent to the Microsoft Graph when a notification subscription is created. Microsoft Graph will use this to encrypt resource data it sends to the application in notifications. The private key will be used to decrypt the resource data within the application.
4. Update the *AzureAD* section of the *appsettings.json* file in the solution.
5. Run the command *npm run build* to build the client application.
6. The website in the sample must be internet accessible for the Microsoft Graph to send it notifications. I did this using a tunneling software called ngrok (https://ngrok.com/).
7. The *Manifest* folder of the solution contains the *manifest.json* file the defines the solution. It should be updated with your information and then packaged into a .zip file with the two icons. This package can be side-loaded a Teams team.
8. The solution does NOT handle notification subscription management. I manually generated a access token using a client_credential grant and created notification subscriptions using PostMan (or any HTTP composer). You can read about setting up notifications here: https://docs.microsoft.com/en-us/graph/webhooks. I have also included a sample playload for creating the subscription:

```
{
  "changeType": "created,updated",
  "notificationUrl": "https://richdizz.ngrok.io/api/webhook",
  "resource": "/teams/{TEAM_ID}/channels/{CHANNEL_ID}/messages",
  "includeResourceData": true,
  "encryptionCertificate": "MY_CERT_PUBLIC_KEY",
  "encryptionCertificateId": "SomeIdentifier",
  "expirationDateTime": "2021-02-08T16:40:00.0000000Z",
  "clientState": "SecretClientState"
}
```
