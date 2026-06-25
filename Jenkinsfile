pipeline {
    agent any

    environment {
        COMPOSE_PROJECT_NAME = 'weather'
        COMPOSE_FILE = 'docker-compose.yaml'
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Build and Start') {
            steps {
                script {
                    sh 'docker compose up --build -d'
                }
            }
        }

        stage('Verify') {
            steps {
                script {
                    sh 'docker compose ps'
                }
            }
        }
    }

    post {
        always {
            echo 'Pipeline execution completed.'
        }
        failure {
            sh 'docker compose logs'
        }
    }
}
