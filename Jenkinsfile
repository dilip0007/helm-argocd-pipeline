pipeline {
    agent any

    options {
        buildDiscarder(logRotator(numToKeepStr: '2'))
        disableConcurrentBuilds()
    }

    environment {
        // Define execution PATH for macOS binaries (Docker, perl, git)
        PATH = "/usr/local/bin:/opt/homebrew/bin:${env.PATH}"

        // Define repository and image variables
        REGISTRY = "docker.io/dilipnigam007"
        IMAGE_NAME = "hello-gitops-app"
        IMAGE_TAG = "${BUILD_NUMBER}" // Use build number as the image tag
        GITOPS_REPO = "github.com/dilip0007/helm-argocd-pipeline.git"
    }

    stages {
        stage('1. Checkout Code') {
            steps {
                checkout scm
            }
        }

        stage('2. Build & Test') {
            steps {
                echo 'Running application tests...'
            }
        }

        stage('3. Build & Push Docker Image') {
            steps {
                echo "Building Docker Image: ${REGISTRY}/${IMAGE_NAME}:${IMAGE_TAG}"
                sh "docker build -t ${REGISTRY}/${IMAGE_NAME}:${IMAGE_TAG} ."
                withCredentials([usernamePassword(credentialsId: 'dockerhub', usernameVariable: 'USER', passwordVariable: 'PASS')]) {
                    sh "echo \$PASS | docker login -u \$USER --password-stdin"
                    sh "docker push ${REGISTRY}/${IMAGE_NAME}:${IMAGE_TAG}"
                }
            }
        }

        stage('4. Update Git for GitOps (ArgoCD Pull)') {
            steps {
                echo 'Updating image tag in Helm values.yaml...'
                sh "perl -i -pe 's/tag: .*/tag: \"${IMAGE_TAG}\"/g' hello-kubernetes/values.yaml"
                
                // Commit and push back to Git
                withCredentials([usernamePassword(credentialsId: 'github-token', usernameVariable: 'GH_USER', passwordVariable: 'GH_TOKEN')]) {
                    sh """
                        git config user.email "jenkins@yourdomain.com"
                        git config user.name "Jenkins CI"
                        git add hello-kubernetes/values.yaml
                        git commit -m "image update: bump hello-gitops-app tag to ${IMAGE_TAG} [skip ci]"
                        git push https://${GH_USER}:${GH_TOKEN}@${GITOPS_REPO} HEAD:main
                    """
                }

                // Notify ArgoCD locally to refresh and sync immediately
                echo 'Triggering ArgoCD webhook sync locally...'
                sh """
                    curl -k -X POST -H "X-GitHub-Event: push" \
                      -H "Content-Type: application/json" \
                      -d '{"repository":{"html_url":"https://github.com/dilip0007/helm-argocd-pipeline"}}' \
                      https://localhost:8080/api/v1/webhooks/github
                """
            }
        }
    }
    post {
        always {
            echo 'Cleaning up workspace...'
            cleanWs()
            echo 'Cleaning up Docker build cache and dangling images...'
            sh 'docker builder prune -f'
            sh 'docker image prune -f'
        }
    }
}
