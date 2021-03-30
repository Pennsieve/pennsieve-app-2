import * as config from '@/site-config/site.json'

const awsConfig = {
  Auth: {
    region: config.awsConfig.region,
    userPoolId: config.awsConfig.userPoolId,
    userPoolWebClientId: config.awsConfig.userPoolWebClientId,
  }
}
export default awsConfig