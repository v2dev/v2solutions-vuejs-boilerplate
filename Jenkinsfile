pipeline{
    agent any
    options {
        skipDefaultCheckout(true)
    }
    stages{
        stage("Initialise"){
            steps{
                cleanWs()
            }
        }
        stage("git"){
            steps{
                git branch: 'Chandrashekar_main', url: 'https://github.com/v2dev/v2solutions-vuejs-boilerplate.git'
            }
        }

        stage('SonarQube Scan') {
            steps {
                script {
                    def scannerHome = tool 'SonarQubeScanner'
                    def projectKey = "Vuejs"
                    withSonarQubeEnv(SONARQUBE_SERVER) {
                        echo "Current working directory: ${pwd()}"
                        bat "./sonarqube_script.bat ${scannerHome} ${projectKey}"
                    }
                }
            }   
        }

        stage("build"){
            steps{
                bat '@echo off'
                bat 'echo %WORKSPACE%'
                dir("DevOpsScripts") {
                    bat './build_script.bat %BUILD_NUMBER%'
                }
            }
        }
        stage("push"){
            steps{
                withDockerRegistry(credentialsId: 'docker', toolName: 'docker'){
                    bat '@echo off'
                    bat 'echo %WORKSPACE%'
                    dir("DevOpsScripts") {
                        bat './push_script.bat %BUILD_NUMBER%'
                    }
                }
            }
        }
    }
}