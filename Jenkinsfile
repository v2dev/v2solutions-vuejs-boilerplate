pipeline{
    agent any
    options {
        skipDefaultCheckout(true)
    }

      environment {
        SONARQUBE_CREDENTIALS = credentials('sonar-cred')
        SONARQUBE_SERVER = 'sonarconfig'
        SCAN_TOKEN = credentials('vuejs-scan-token')
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

        // Helm Chart Stage
        stage("Helm Chart") {
            steps {
                script {
                    // Update Helm chart values.yaml with the build number
                    updateHelmChartValues(env.BUILD_NUMBER)
                    dir("vue-js-app-chart") {
                        // Run commands to create the Helm chart (e.g., helm package)
                        bat '@echo off'
                        bat 'echo "Creating package"'
                        bat 'helm package .'
                    }
                }
            }
        }

        // Push Helm Chart to Docker Hub
        stage("Push Helm Chart to Docker Hub") {
            steps {
                script {
                    dir("node-js-app-chart") {
                        withDockerRegistry(credentialsId: 'docker', toolName: 'docker'){
                            // Push the Helm chart to Docker Hub
                            bat "helm push vuejs-app-0.1.0.tgz  oci://registry-1.docker.io/v2devops"
                            // echo "helm chart push successful"
                        }
                    }
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

def updateHelmChartValues(buildNumber) {
    // Read values.yaml file
    def valuesYamlPath = "vue-js-app-chart/values.yaml"
    def valuesYamlContent = readFile(file: valuesYamlPath).trim()

    // Update image tag with the build number
    valuesYamlContent = valuesYamlContent.replaceAll(/tag: latest/, "tag: ${buildNumber}")

    // Write updated values.yaml file
    writeFile(file: valuesYamlPath, text: valuesYamlContent)
}