pipeline {
    agent any

    options {
        buildDiscarder(logRotator(numToKeepStr: '2'))
        disableConcurrentBuilds()
    }

    triggers {
        // Poll GitHub every 2 minutes — auto-triggers CI when you push real code changes
        pollSCM('H/2 * * * *')
    }

    environment {
        // Execution PATH for macOS binaries (Docker, perl, git)
        PATH        = "/usr/local/bin:/opt/homebrew/bin:${env.PATH}"

        REGISTRY    = "docker.io/dilipnigam007"
        IMAGE_NAME  = "hello-gitops-app"
        IMAGE_TAG   = "${BUILD_NUMBER}"
        GITOPS_REPO = "github.com/dilip0007/helm-gitops-config.git"

        // Jenkins CD job location (for auto-trigger after tag bump)
        JENKINS_URL = "http://localhost:8082"
        CD_JOB_PATH = "job/CD/job/hello-kubernetes-cd/job/main"
    }

    stages {

        stage('1. Checkout Code') {
            steps {
                checkout scm
                script {
                    // Skip build for empty commits (no real file changes)
                    def changedFiles = sh(
                        script: 'git diff-tree --no-commit-id -r HEAD --name-only',
                        returnStdout: true
                    ).trim()

                    if (changedFiles) {
                        env.HAS_CHANGES = 'true'
                        echo "✅ Real code changes detected — will build and push image."
                        echo "Changed files:\n${changedFiles}"
                    } else {
                        env.HAS_CHANGES = 'false'
                        echo "⏭️  Empty commit — skipping Docker build and tag update."
                    }
                }
            }
        }

        stage('2. Build & Test') {
            when { expression { return env.HAS_CHANGES == 'true' } }
            steps {
                echo 'Running application tests...'
            }
        }

        stage('3. Build & Push Docker Image') {
            when { expression { return env.HAS_CHANGES == 'true' } }
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
                allOf {
                    branch 'main'
                    expression { return env.HAS_CHANGES == 'true' }
                }
            }
            steps {
                echo "Updating image tag to ${IMAGE_TAG} in helm-gitops-config..."
                withCredentials([usernamePassword(credentialsId: 'github-token', usernameVariable: 'GH_USER', passwordVariable: 'GH_TOKEN')]) {
                    sh """
                        rm -rf config-repo
                        git clone https://${GH_USER}:${GH_TOKEN}@${GITOPS_REPO} config-repo
                        cd config-repo
                        perl -i -pe 's/tag: .*/tag: "${IMAGE_TAG}"/g' hello-kubernetes/values.yaml
                        git config user.email "jenkins@yourdomain.com"
                        git config user.name "Jenkins CI"
                        git add hello-kubernetes/values.yaml
                        git commit -m "image update: bump hello-gitops-app tag to ${IMAGE_TAG} [skip ci]"
                        git push origin main
                    """
                }
                echo "✅ Tag ${IMAGE_TAG} pushed to helm-gitops-config."
            }
        }

        stage('5. Trigger CD Pipeline') {
            when {
                allOf {
                    branch 'main'
                    expression { return env.HAS_CHANGES == 'true' }
                }
            }
            steps {
                echo "🚀 Kicking off CD pipeline to deploy image tag ${IMAGE_TAG}..."
                sh '''
                    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" \
                        -u admin:admin \
                        -X POST "http://localhost:8082/job/CD/job/hello-kubernetes-cd/job/main/build")
                    echo "Jenkins CD trigger response: HTTP ${HTTP_CODE}"
                    if echo "${HTTP_CODE}" | grep -qE "^(200|201)$"; then
                        echo "✅ CD pipeline triggered successfully."
                    else
                        echo "⚠️  Unexpected HTTP ${HTTP_CODE} — check Jenkins CD job manually."
                    fi
                '''
            }
        }

    }

    post {
        always {
            echo 'Cleaning up workspace...'
            cleanWs()
            echo 'Cleaning up local Docker image...'
            sh "docker rmi ${REGISTRY}/${IMAGE_NAME}:${IMAGE_TAG} -f || true"
            sh 'docker builder prune -f'
            sh 'docker image prune -f'
        }
        success {
            script {
                if (env.HAS_CHANGES == 'true') {
                    echo """
============================================================
✅  CI PIPELINE COMPLETE
============================================================
📦  Image Tag   : ${IMAGE_TAG}
🐳  Docker Hub  : ${REGISTRY}/${IMAGE_NAME}:${IMAGE_TAG}
🚀  CD Pipeline : triggered — deployment in progress
============================================================"""
                } else {
                    echo "⏭️  Empty commit — nothing built or deployed."
                }
            }
        }
    }
}
