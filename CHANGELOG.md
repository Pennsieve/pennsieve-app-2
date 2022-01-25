### 35.1.0 (2022-01-25)

##### New Features

* **integrations:**  Adding support for custom event tracking (21a49b9d)

##### Bug Fixes

*  on logout, remove user_token then call Auth.signOut -- because it will redirect on federated login and the state never gets properly cleared (013bd923)

##### Other Changes

*  comment out Login with ORCiD button (f0a22d00)
*  update Cognito user pool id, client id, auth flow type (8b50bc26)
*  post-authentication handling of redirect with access token (812365ab)
