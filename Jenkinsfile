pipeline {
    agent {
        kubernetes {
            yaml '''
apiVersion: v1
kind: Pod
spec:
  containers:
  - name: docker
    image: docker:latest
    command:
    - cat
    tty: true
    volumeMounts:
    - mountPath: /var/run/docker.sock
      name: docker-sock
  volumes:
  - name: docker-sock
    hostPath:
      path: /var/run/docker.sock
'''
        }
    }

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
            }
        }

        stage('3. Build & Push Docker Image') {
            steps {
                // Execute this stage inside the 'docker' container defined in the pod template above
                container('docker') {
                    echo "Building Docker Image: ${REGISTRY}/${IMAGE_NAME}:${IMAGE_TAG}"
                    sh "docker build -t ${REGISTRY}/${IMAGE_NAME}:${IMAGE_TAG} ."
                    withCredentials([usernamePassword(credentialsId: 'dockerhub', usernameVariable: 'USER', passwordVariable: 'PASS')]) {
                        sh "echo \$PASS | docker login -u \$USER --password-stdin"
                        sh "docker push ${REGISTRY}/${IMAGE_NAME}:${IMAGE_TAG}"
                    }
                }
            }
        }

        // OPTION A: GitOps CI/CD Pipeline (Recommended when using ArgoCD)
        // Jenkins updates the Helm values.yaml tag in Git, and ArgoCD automatically deploys it.
        stage('4. Update Git for GitOps (ArgoCD Pull)') {
            steps {
                echo 'Updating image tag in Helm values.yaml...'
                // Run in default container since it has sed and git pre-installed
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
    }
}
