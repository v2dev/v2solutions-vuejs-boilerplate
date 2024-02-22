pipeline {
    agent any
    options {
        skipDefaultCheckout(true)
    }

    // Setup Environment Variables
    environment {
        SONARQUBE_CREDENTIALS = credentials('sonar-cred')
        SONARQUBE_SERVER = 'sonarconfig'
        SCAN_TOKEN = credentials('vuejs-scan-token')
    }

    stages {
        // Initialise
        stage("Initialise") {
            steps {
                cleanWs()
            }
        }

        // Setting up Git
        stage("Git") {
            steps {
                git branch: 'Chandrashekar_main', credentialsId: 'git_token_cs', url: 'https://github.com/v2dev/v2solutions-vuejs-boilerplate'
            }
        }

        //SonarQube Scan Stage
        stage('SonarQube Scan') {
            steps {
                script {
                    def scannerHome = tool 'SonarQubeScanner'
                    def projectKey = "SaaS-Boilerplate-Vuejs"
                    withSonarQubeEnv(SONARQUBE_SERVER) {
                        echo "Current working directory: ${pwd()}"
                        bat "./sonarqube_script.bat ${scannerHome} ${projectKey}"

                        // Manually construct the SonarQube Analysis URL
                        def sonarqubeUrl = "${SONARQUBE_SERVER}/dashboard?id=${projectKey}"
                        echo "SonarQube Analysis URL: ${sonarqubeUrl}"

                        // Set the URL as an environment variable to use it in later stages
                        env.SONARQUBE_URL = sonarqubeUrl
                    }
                }
            }   
        }

        // Commenting this stage as this will be used once the email servers are setup on the actual environment
        // // Email Notification Stage
        // stage('Email Notification') {
        //     steps {
        //         script {
        //             // Check if the SONARQUBE_URL environment variable is set
        //             if (env.SONARQUBE_URL) {
        //                 // Compose the email body with the manually constructed SonarQube Analysis URL
        //                 def emailBody = "SonarQube Analysis URL: ${env.SONARQUBE_URL}"

        //                 // Send email using the emailext plugin
        //                 emailext body: emailBody,
        //                         subject: 'SonarQube Analysis Report',
        //                         to: 'testemail@v2solutions.com',
        //                         mimeType: 'text/html'
        //             } else {
        //                 error "SonarQube Analysis URL is not available. Make sure the previous stage executed successfully."
        //             }
        //         }
        //     }
        // }

        // Quality Gate Stage
        stage('Quality Gate') {
            steps {
                script {
                    withSonarQubeEnv(SONARQUBE_SERVER) {
                        def qg = waitForQualityGate()
                        if (qg.status != 'OK') {
                            currentBuild.result = 'FAILURE'
                            echo "Quality Gate failed: ${qg.status}"
                        } else {
                            echo "Quality Gate Success"
                        }
                        env.QUALITY_GATE_STATUS = qg.status
                    }
                }
            }
        }

        // Configure Infrastructure
        stage("Config Infra") {
            steps {
                bat '@echo off'
                bat 'echo %WORKSPACE%'
                dir("scripts") {
                    bat './configTerragrunt.bat %WORKSPACE%'
                }
            }
        }

        // Delete s3 bucket objects so as to delete the s3 bucket
        stage('Delete S3 Objects') {
            when {
                expression { params.INFRA_ACTION?.toLowerCase() == 'destroy' }
            }
            steps {
                script {
                    def bucketName = "v2-vuejs-boilerplate"
                    def bucketExists = false
                    
                    // Check if the bucket exists
                    def checkBucketCommand = "aws s3api head-bucket --bucket ${bucketName} 2>&1"
                    def checkBucketResult = bat(script: checkBucketCommand, returnStatus: true)
                    
                    if (checkBucketResult == 0) {
                        bucketExists = true
                        echo "Bucket ${bucketName} exists."
                    } else {
                        echo "Bucket ${bucketName} does not exist."
                    }

                    // Perform delete operation only if the bucket exists
                    if (bucketExists) {
                        bat 'echo "RunningS3DeleteObject"'
                        bat '@echo off'
                        script {
                            dir("scripts") {
                                bat "delete-objects.bat"
                            }
                        }
                    } else {
                        echo "Skipping delete operation as the bucket does not exist."
                    }
                }
            }
        }
        
        // Conditional stage based on INFRA_ACTION parameter
        stage("Infrastructure Deployment") {
            steps {
                script {
                    // Check if INFRA_ACTION parameter is set to "create", "delete", "no action", "na"
                    def infraActionFlag = params.INFRA_ACTION?.toLowerCase()
                    echo "INFRA_ACTION flag value: ${infraActionFlag}"
                    
                    if (infraActionFlag in ['destroy', 'delete']) {
                        // Destroy Infrastructure stage
                        bat 'echo "Running Destroy infra stage"'
                        bat '@echo off'
                        bat 'echo %WORKSPACE%'
                        dir("scripts") {
                            bat './terraformDestroy.bat %AWS_ACCESS_KEY_ID% %AWS_SECRET_ACCESS_KEY% %AWS_DEFAULT_REGION% %WORKSPACE%'
                            infraCreated = false
                        }
                    } else if (infraActionFlag in ['create', 'update']) {
                        // Create Infrastructure stage
                        bat 'echo "Running Create infra stage"'
                        bat '@echo off'
                        bat 'echo %WORKSPACE%'
                        dir("scripts") {
                            bat './terragruntInvocation.bat %AWS_ACCESS_KEY_ID% %AWS_SECRET_ACCESS_KEY% %AWS_DEFAULT_REGION% %WORKSPACE%'
                            infraCreated = true
                        }
                    } else if (infraActionFlag in ['na', 'no action']) {
                        echo "No Action Required"
                    } else {
                        error "Invalid value for INFRA_ACTION parameter. Expected 'create', 'delete', 'no action', 'na'."
                    }
                }
            }
        }

        // Install dependencies
        stage("Install dependencies") {
            when {
                expression { params.INFRA_ACTION != 'destroy' }
            }
            steps {
                bat '@echo off'
                bat 'echo %WORKSPACE%'
                bat "echo 'Install Dependencies'"
                bat 'npm install'
            }
        }

        // Install dependencies and Build Vuejs App
        stage("Build Vuejs App") {
            when {
                expression { params.INFRA_ACTION != 'destroy' }
            }
            steps {
                script {
                    // Modify .env file with the provided EKS_API_ENDPOINT
                    def eksApiEndpoint = params.EKS_API_ENDPOINT
                    def filePath = "${WORKSPACE}/.env"
                    // Read the file content
                    def fileContent = readFile(filePath)
                    // Replace the apiUrl value with the provided EKS_API_ENDPOINT
                    def modifiedContent = fileContent.replaceAll(/VUE_APP_API_BASE_URL:\s*'(.*)'/, "VUE_APP_API_BASE_URL: '${eksApiEndpoint}:8080'")
                    // Write the modified content back to the file
                    writeFile file: filePath, text: modifiedContent
                }
                bat '@echo off'
                bat 'echo %WORKSPACE%'
                bat "echo 'Building vuejs application'"
                bat 'npm run build'
            }
        }

        // Copy built VueJS code to S3 bucket
        stage("Copy Artifacts to S3") {
            steps {
                script {
                    def bucketName = "v2-vuejs-boilerplate"
                    def bucketExists = false
                    
                    // Check if the bucket exists
                    def checkBucketCommand = "aws s3api head-bucket --bucket ${bucketName} 2>&1"
                    def checkBucketResult = bat(script: checkBucketCommand, returnStatus: true)
                    
                    if (checkBucketResult == 0) {
                        bucketExists = true
                        echo "Bucket ${bucketName} exists."
                    } else {
                        echo "Bucket ${bucketName} does not exist."
                    }
                    
                    // Perform the copy operation if the bucket exists
                    if (bucketExists) {
                        bat 'aws s3 cp dist s3://v2-vuejs-boilerplate --recursive'
                    } else {
                        echo "Skipping copy operation as the bucket does not exist."
                        echo "Provide 'create' value for INFRA_ACTION parameter while running the pipeline."
                    }
                }
            }
        }

    }
}
