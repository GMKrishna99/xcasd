pipeline {
    agent any

    parameters {
        string(name: 'ENVIRONMENT', defaultValue: 'dev', description: 'The Environment to deploy (dev, staging, qa)')
        string(name: 'DOCKER_TAG', defaultValue: 'latest', description: 'The tag of the Docker image to deploy')
    }

    environment {
        IMAGE_NAME = "dealvisor-frontend-${params.ENVIRONMENT}"
        DOCKER_IMAGE = "b2yinfy/dealvisor-frontend-${params.ENVIRONMENT}"
        VPS_HOST = "${env.VPS_HOST}"
        VPS_USER = "${env.VPS_USER}"
    }

    stages {
        stage('Prepare Variables') {
            steps {
                script {
                    env.SERVICE_PORT = params.ENVIRONMENT == 'dev' ? '3011' : 
                                       params.ENVIRONMENT == 'staging' ? '3012' : 
                                       params.ENVIRONMENT == 'qa' ? '3013' : '3011'

                    env.REACT_APP_API_BASE_URL = params.ENVIRONMENT == 'dev' ? 'https://dealvisor-dev-be.b2yinfy.com/api' : 
                                                 params.ENVIRONMENT == 'staging' ? 'https://dealvisor-dev-be.b2yinfy.com/api' : 
                                                 'https://dealvisor-dev-be.b2yinfy.com/api'
                }

                echo "Environment: ${params.ENVIRONMENT}"
                echo "Frontend Service Port: ${env.SERVICE_PORT}"
                echo "API Base URL: ${env.REACT_APP_API_BASE_URL}"
                echo "Docker Image: ${env.DOCKER_IMAGE}:${params.DOCKER_TAG}"
            }
        }

        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Build Docker Image') {
            steps {
                script {
                    sh """
                        docker build --build-arg REACT_APP_API_BASE_URL=${env.REACT_APP_API_BASE_URL} \
                        -t ${DOCKER_IMAGE}:${params.DOCKER_TAG} .
                    """
                }
            }
        }

        stage('Login to DockerHub') {
            steps {
                script {
                    withCredentials([usernamePassword(credentialsId: 'dockerhub-jenkins-token', usernameVariable: 'DOCKERHUB_CREDENTIALS_USR', passwordVariable: 'DOCKERHUB_CREDENTIALS_PSW')]) {
                        sh """
                            echo ${DOCKERHUB_CREDENTIALS_PSW} | docker login -u ${DOCKERHUB_CREDENTIALS_USR} --password-stdin
                        """
                    }
                }
            }
        }

        stage('Push Docker Image') {
            steps {
                script {
                    sh "docker push ${DOCKER_IMAGE}:${params.DOCKER_TAG}"
                }
            }
        }

        stage('Deploy to VPS') {
            steps {
                script {
                    withCredentials([sshUserPrivateKey(credentialsId: 'ssh-jenkins-token', keyFileVariable: 'SSH_KEY')]) {
                        sh """
                            ssh -o StrictHostKeyChecking=no -i ${SSH_KEY} ${VPS_USER}@${VPS_HOST} '
                                docker pull ${DOCKER_IMAGE}:${params.DOCKER_TAG}
                                docker ps -q --filter "name=${IMAGE_NAME}" | grep -q . && docker stop ${IMAGE_NAME} || echo "Container ${IMAGE_NAME} not running"
                                docker ps -aq --filter "name=${IMAGE_NAME}" | grep -q . && docker rm ${IMAGE_NAME} || echo "Container ${IMAGE_NAME} does not exist"
                                docker run -d \\
                                    --name ${IMAGE_NAME} \\
                                    -p ${env.SERVICE_PORT}:${env.SERVICE_PORT} \\
                                    --network dms-network \\
                                    -e REACT_APP_API_BASE_URL=${env.REACT_APP_API_BASE_URL} \\
                                    ${DOCKER_IMAGE}:${params.DOCKER_TAG}
                            '
                        """
                    }
                }
            }
        }
    }

    post {
        always {
            sh 'docker logout'
        }
    }
}
