pipeline {
    agent any

    environment {
        // Define repository and image variables
        REGISTRY = "docker.io/dilip0007"
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
                // sh 'npm test' or similar build/test commands
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

        /* -------------------------------------------------------------
           CHOOSE ONE OF THE TWO APPROACHES BELOW FOR DEPLOYMENT:
           ------------------------------------------------------------- */

        // OPTION A: GitOps CI/CD Pipeline (Recommended when using ArgoCD)
        // Jenkins updates the Helm values.yaml tag in Git, and ArgoCD automatically deploys it.
        stage('4. Update Git for GitOps (ArgoCD Pull)') {
            steps {
                echo 'Updating image tag in Helm values.yaml...'
                // Use sed to update the tag value in place robustly
                sh "sed -i 's/tag: .*/tag: \"${IMAGE_TAG}\"/g' hello-kubernetes/values.yaml"
                
                // Commit and push back to Git
                withCredentials([usernamePassword(credentialsId: 'github-token', usernameVariable: 'GH_USER', passwordVariable: 'GH_TOKEN')]) {
                    sh """
                        git config user.email "jenkins@yourdomain.com"
                        git config user.name "Jenkins CI"
                        git add hello-kubernetes/values.yaml
                        git commit -m "image update: bump hello-gitops-app tag to ${IMAGE_TAG} [skip ci]"
                        git push https://${GH_USER}:${GH_TOKEN}@${GITOPS_REPO} main
                    """
                }
            }
        }

        // OPTION B: Traditional Pipeline (Push Model - No ArgoCD)
        // Jenkins directly deploys the Helm chart using the 'helm' CLI.
        stage('4. Traditional Helm Deploy (Push)') {
            when {
                expression { false } // Disabled by default, change to true to use this model
            }
            steps {
                echo 'Deploying directly to Kubernetes cluster using Helm...'
                // withKubeConfig([credentialsId: 'kubeconfig-credentials']) {
                //     sh "helm upgrade --install hello-kubernetes ./hello-kubernetes \
                //         --namespace hello-kubernetes-ns \
                //         --set image.tag=${IMAGE_TAG} \
                //         --create-namespace"
                // }
            }
        }
    }
}
