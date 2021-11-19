import * as config from '@/site-config/site.json'

const awsConfig = {
  Auth: {
    region: config.awsConfig.region,
    userPoolId: config.awsConfig.userPoolId,
    userPoolWebClientId: config.awsConfig.userPoolWebClientId,
    authenticationFlowType: config.awsConfig.authenticationFlowType,
  }
}
export default awsConfig