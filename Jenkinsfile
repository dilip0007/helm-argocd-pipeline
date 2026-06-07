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
        GITOPS_REPO = "github.com/dilip0007/helm-gitops-config.git"
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
                sh "docker build --no-cache -t ${REGISTRY}/${IMAGE_NAME}:${IMAGE_TAG} ."
                withCredentials([usernamePassword(credentialsId: 'dockerhub', usernameVariable: 'USER', passwordVariable: 'PASS')]) {
                    sh "echo \$PASS | docker login -u \$USER --password-stdin"
                    sh "docker push ${REGISTRY}/${IMAGE_NAME}:${IMAGE_TAG}"
                }
            }
        }

        stage('4. Update Image Tag in GitOps Config') {
            when {
                branch 'main'
            }
            steps {
                echo 'Updating image tag in Helm values.yaml in config repository...'
                
                // Clone the config repository, update values.yaml, and push back
                withCredentials([usernamePassword(credentialsId: 'github-token', usernameVariable: 'GH_USER', passwordVariable: 'GH_TOKEN')]) {
                    sh """
                        # Remove any existing config-repo folder
                        rm -rf config-repo
                        
                        # Clone the config repo
                        git clone https://${GH_USER}:${GH_TOKEN}@${GITOPS_REPO} config-repo
                        
                        cd config-repo
                        
                        # Update the image tag in values.yaml
                        perl -i -pe 's/tag: .*/tag: "${IMAGE_TAG}"/g' hello-kubernetes/values.yaml
                        
                        # Configure git client
                        git config user.email "jenkins@yourdomain.com"
                        git config user.name "Jenkins CI"
                        
                        # Stage, commit and push changes back
                        git add hello-kubernetes/values.yaml
                        git commit -m "image update: bump hello-gitops-app tag to ${IMAGE_TAG} [skip ci]"
                        git push origin main
                    """
                }
                // Tag updated — CD pipeline (watching helm-gitops-config) will
                // detect this commit and handle ArgoCD sync + verification.
                echo "✅ Tag ${IMAGE_TAG} pushed to helm-gitops-config. CD pipeline will take it from here."
            }
        }
    }
    post {
        always {
            echo 'Cleaning up workspace...'
            cleanWs()
            echo 'Cleaning up local Docker image...'
            sh "docker rmi ${REGISTRY}/${IMAGE_NAME}:${IMAGE_TAG} -f || true"
            echo 'Cleaning up Docker build cache and dangling images...'
            sh 'docker builder prune -f'
            sh 'docker image prune -f'
        }
    }
}
