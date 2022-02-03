import * as config from '@/site-config/site.json'

const awsConfig = {
  Auth: {
    region: config.awsConfig.region,
    userPoolId: config.awsConfig.userPoolId,
    userPoolWebClientId: config.awsConfig.userPoolWebClientId,
    authenticationFlowType: config.awsConfig.authenticationFlowType,
    oauth: {
      domain: config.awsConfig.oauth.domain,
      scope: config.awsConfig.oauth.scope,
      redirectSignIn: config.awsConfig.oauth.redirectSignIn,
      redirectSignOut: config.awsConfig.oauth.redirectSignOut,
      responseType: config.awsConfig.oauth.responseType,
    }
  }
}
export default awsConfig
