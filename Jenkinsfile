pipeline {
    agent any

    environment {
        COMPOSE_PROJECT_NAME = 'weather'
        COMPOSE_FILE = 'docker-compose.yaml'
    }

    stages {
        stage('Checkout') {
            steps { checkout scm }
        }

        stage('Write .env') {
            steps {
                withCredentials([string(credentialsId: 'vite-openweather-api-key', variable: 'VITE_OPENWEATHER_API_KEY')]) {
                    sh '''
                      set -eu
                      printf "VITE_OPENWEATHER_API_KEY=%s\n" "$VITE_OPENWEATHER_API_KEY" > .env
                      chmod 600 .env
                    '''
                }
            }
        }

        stage('Build and Start') {
            steps {
                sh 'docker compose up --build -d'
            }
        }

        stage('Verify') {
            steps { sh 'docker compose ps' }
        }
    }

    post {
        always {
            sh 'rm -f .env'
            echo 'Pipeline execution completed.'
        }
        failure {
            sh 'docker compose logs'
        }
    }
}
