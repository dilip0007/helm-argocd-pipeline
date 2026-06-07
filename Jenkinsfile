pipeline {
    agent any

    options {
        buildDiscarder(logRotator(numToKeepStr: '2'))
        disableConcurrentBuilds()
    }

    triggers {
        // Poll GitHub every 2 minutes — auto-triggers CI when you push code
        pollSCM('H/2 * * * *')
    }

    environment {
        PATH        = "/usr/local/bin:/opt/homebrew/bin:${env.PATH}"
        REGISTRY    = "docker.io/dilipnigam007"
        TAG         = "${BUILD_NUMBER}"
        GITOPS_REPO = "github.com/dilip0007/helm-gitops-config.git"
        JENKINS_URL = "http://localhost:8082"
        CD_JOB_PATH = "job/CD/job/hello-kubernetes-cd/job/main"
    }

    stages {

        stage('1. Checkout Code') {
            steps {
                checkout scm
                script {
                    // Skip build entirely for empty commits
                    def changedFiles = sh(
                        script: 'git diff-tree --no-commit-id -r HEAD --name-only',
                        returnStdout: true
                    ).trim()

                    if (changedFiles) {
                        env.HAS_CHANGES = 'true'
                        echo "✅ Real code changes detected:"
                        echo changedFiles
                    } else {
                        env.HAS_CHANGES = 'false'
                        echo "⏭️  Empty commit — skipping build and deploy."
                    }
                }
            }
        }

        stage('2. Build & Test') {
            when { expression { return env.HAS_CHANGES == 'true' } }
            steps {
                echo 'Running tests... (add your test commands here)'
            }
        }

        stage('3. Build & Push Docker Images') {
            when { expression { return env.HAS_CHANGES == 'true' } }
            steps {
                withCredentials([usernamePassword(credentialsId: 'dockerhub', usernameVariable: 'DH_USER', passwordVariable: 'DH_PASS')]) {
                    sh "echo \$DH_PASS | docker login -u \$DH_USER --password-stdin"
                }

                // Build and push all 4 microservice images
                script {
                    def services = [
                        [name: 'family-gateway', path: 'services/api-gateway'],
                        [name: 'family-svc',     path: 'services/family-service'],
                        [name: 'messages-svc',   path: 'services/messages-service'],
                        [name: 'events-svc',     path: 'services/events-service']
                    ]
                    for (svc in services) {
                        echo "🐳 Building ${svc.name}:${TAG}..."
                        sh "docker build --no-cache -t ${REGISTRY}/${svc.name}:${TAG} ${svc.path}/"
                        sh "docker push ${REGISTRY}/${svc.name}:${TAG}"
                        echo "✅ Pushed ${REGISTRY}/${svc.name}:${TAG}"
                    }
                }
            }
        }

        stage('4. Update Image Tags in GitOps Config') {
            when {
                allOf {
                    branch 'main'
                    expression { return env.HAS_CHANGES == 'true' }
                }
            }
            steps {
                echo "📝 Updating all 4 image tags to ${TAG} in helm-gitops-config..."
                withCredentials([usernamePassword(credentialsId: 'github-token', usernameVariable: 'GH_USER', passwordVariable: 'GH_TOKEN')]) {
                    sh """
                        rm -rf config-repo
                        git clone https://${GH_USER}:${GH_TOKEN}@${GITOPS_REPO} config-repo
                        cd config-repo

                        # Update all 4 image tags in values.yaml
                        perl -i -pe 's|(family-gateway.*?tag:).*|\\1 "${TAG}"|' hello-kubernetes/values.yaml || true
                        perl -i -pe 's|(family-svc.*?tag:).*|\\1 "${TAG}"|'     hello-kubernetes/values.yaml || true
                        perl -i -pe 's|(messages-svc.*?tag:).*|\\1 "${TAG}"|'   hello-kubernetes/values.yaml || true
                        perl -i -pe 's|(events-svc.*?tag:).*|\\1 "${TAG}"|'     hello-kubernetes/values.yaml || true

                        # Simpler approach — replace all tag: "OLD" with tag: "NEW"
                        sed -i '' 's/tag: "[0-9]*"/tag: "${TAG}"/g' hello-kubernetes/values.yaml 2>/dev/null || \
                        sed -i 's/tag: "[0-9]*"/tag: "${TAG}"/g'    hello-kubernetes/values.yaml

                        git config user.email "jenkins@nigam.family"
                        git config user.name "Jenkins CI"
                        git add hello-kubernetes/values.yaml
                        git commit -m "image update: bump all services to tag ${TAG} [skip ci]"
                        git push origin main
                    """
                }
                echo "✅ Tags updated in helm-gitops-config."
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
                echo "🚀 Triggering CD pipeline to deploy all services at tag ${TAG}..."
                sh '''
                    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" \
                        -u admin:admin \
                        -X POST "http://localhost:8082/job/CD/job/hello-kubernetes-cd/job/main/build")
                    echo "Jenkins CD trigger HTTP: ${HTTP_CODE}"
                    if echo "${HTTP_CODE}" | grep -qE "^(200|201)$"; then
                        echo "✅ CD pipeline triggered!"
                    else
                        echo "⚠️  HTTP ${HTTP_CODE} — check Jenkins CD manually."
                    fi
                '''
            }
        }

    }

    post {
        always {
            echo 'Cleaning up...'
            cleanWs()
            sh 'docker image prune -f'
            sh 'docker builder prune -f'
            script {
                // Remove all built images to save disk
                ['family-gateway','family-svc','messages-svc','events-svc'].each { svc ->
                    sh "docker rmi ${REGISTRY}/${svc}:${TAG} -f || true"
                }
            }
        }
        success {
            script {
                if (env.HAS_CHANGES == 'true') {
                    echo """
============================================================
✅  CI COMPLETE — 4 IMAGES BUILT & CD TRIGGERED
============================================================
📦  Tag         : ${TAG}
🐳  Images      : family-gateway, family-svc, messages-svc, events-svc
🚀  CD Pipeline : triggered
============================================================"""
                }
            }
        }
    }
}
