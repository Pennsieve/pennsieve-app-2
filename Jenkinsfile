#!groovy

if (env.BRANCH_NAME == "prod") {
    buildEnv = "production"
    executorEnv = "prod"
} else {
    buildEnv = "dev"
    executorEnv = "dev"
}

node('executor') {
    ws("/tmp/${env.JOB_NAME}/${env.BRANCH_NAME}") {
        checkout scm
        def authorName = sh(returnStdout: true, script: 'git --no-pager show --format="%an" --no-patch').trim()

        stage("Build") {
            try {
                sh """#!/bin/bash -ex
                    node -v
                    yarn
                    yarn build-${buildEnv}"""

                stash includes: "**/dist/**", name: 'dist'
//                 stash includes: "**/web-components/build/**", name: 'buildComponents'
            } catch (e) {
                slackSend(color: '#b20000', message: "FAILED: Build! '${env.JOB_NAME} [${env.BUILD_NUMBER}]' (${env.BUILD_URL}) by ${authorName}")
                throw e
            }
        }
        stage("Test") {
            try {
                sh """#!/bin/bash
                    xvfb-run --auto-servernum --server-args='-screen 0, 1024x768x16' yarn test"""
            } catch (e) {
                slackSend(color: '#b20000', message: "FAILED: Tests! '${env.JOB_NAME} [${env.BUILD_NUMBER}]' (${env.BUILD_URL}) by ${authorName}")
                throw e
            }
        }
        //if (["main", "prod"].contains(env.BRANCH_NAME)) {

            stage('Deploy') {
                when {
                    expression {
                        env.EVENT_NAME == 'release'
                    }
                }
                steps {
                node("${executorEnv}-executor") {
                    def bucketName = "pennsieve-${executorEnv}-app-use1"

                    try {
                        unstash 'dist'
//                         unstash 'buildComponents'
                        sh "aws s3 --region us-east-1 rm --recursive s3://$bucketName/"
                        sh "aws s3 --region us-east-1 cp --recursive dist s3://$bucketName"
                        sh "aws s3 --region us-east-1 cp --cache-control 0 dist/index.html s3://$bucketName/"
//                         sh "aws s3 --region us-east-1 cp --recursive web-components/build s3://$bucketName/web-components"
                        def distributionId = sh(
                            script: "aws cloudfront list-distributions --query \"DistributionList.Items[?contains(Origins.Items[0].DomainName, '${bucketName}.s3.amazonaws.com')].Id\" --output text",
                            returnStdout: true
                        ).trim()
                        def response = sh(returnStdout: true, script: "aws cloudfront create-invalidation --distribution-id ${distributionId} --paths '/*'").trim()
                        println "$response"
                        def responseMap = new groovy.json.JsonSlurperClassic().parseText(response)
                        def invalidation = responseMap.Invalidation
                        sh "aws cloudfront wait invalidation-completed --distribution-id ${distributionId} --id ${invalidation.Id}"
                    } catch (e) {
                        slackSend(color: '#b20000', message: "FAILED: Job '${env.JOB_NAME} [${env.BUILD_NUMBER}]' (${env.BUILD_URL}) by ${authorName}")
                        throw e
                    }
                }
            }
        }
        //}
      slackSend(color: '#006600', message: "SUCCESSFUL: Job '${env.JOB_NAME} [${env.BUILD_NUMBER}]' (${env.BUILD_URL}) by ${authorName}")
    }
}
