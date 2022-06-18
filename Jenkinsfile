def gitUrl = "git@github.com:meterXu/mtMonkeyJs.git"
def branch = "master"
def credentialsId = "github_sshKey"
def rootPath= "./"
def appName = "tampermonkey"
def bakPath = "/home/jenkins_bak"
def putPath = "/home/jenkins_put"
def publishPath= "/home/html/tampermonkey"

pipeline {
    agent any
    stages {
            stage('拉取代码') {
                steps {
                    git branch: "$branch", credentialsId: "$credentialsId", url: "$gitUrl"
                }
            }
            stage('项目部署') {
                steps {
                    script {
                         def remote = [:]
                         remote.name = 'remote'
                         remote.host ='192.168.1.8'
                         remote.user = 'root'
                         remote.password ='xhgQq13814741964'
                         remote.allowAnyHosts= true
                         stage ('备份') {
                            sshCommand remote: remote,command: "mkdir -p ${bakPath}/${appName}"
                            sshCommand remote: remote,command: "mkdir -p ${publishPath}"
                            sshCommand remote: remote,command: "cp -r ${publishPath} ${bakPath}/${appName}/${BUILD_NUMBER}"
                         }
                         stage ('更新') {
                            sshCommand remote: remote,command: "mkdir -p ${putPath}/${appName}"
                            sshPut remote: remote,from: "${rootPath}",into:"${putPath}/${appName}"
                         }
                         stage ('启动') {
                            sshCommand remote: remote,command: "rm -rf ${publishPath}"
                            sshCommand remote: remote,command: "mv ${putPath}/${appName}/* ${publishPath}"
                         }
                    }
                }
            }
    }
}
