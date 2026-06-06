#!/bin/bash

# Ensure script halts on errors
set -e

echo "=================================================="
echo "🧹 Starting Kubernetes & Docker Cleanup Script"
echo "=================================================="

# 1. Clean up Docker cache inside Minikube
echo "👉 Cleaning up unused Docker images, builder cache, and containers in Minikube..."
if minikube status | grep -q "Running"; then
  minikube ssh -- "docker system prune -a -f --volumes"
else
  echo "⚠️ Minikube is not running. Skipping Docker system prune."
fi

# 2. Clean up completed, failed, or evicted pods
echo "👉 Cleaning up completed, failed, or evicted pods in the cluster..."
# Find pods with Completed, Evicted, or Failed status and delete them to free up Kubernetes resource tracking
kubectl get pods --all-namespaces --no-headers | grep -E "Completed|Evicted|Failed|OOMKilled" | while read -r namespace name rest; do
  echo "Deleting stale pod: $name in namespace: $namespace..."
  kubectl delete pod "$name" -n "$namespace" --grace-period=0 --force >/dev/null 2>&1 || true
done

# 3. Option to restart Jenkins Master to release JVM Memory heap
echo "--------------------------------------------------"
read -p "Do you want to restart Jenkins to clear JVM memory leaks? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
  echo "👉 Restarting Jenkins Master..."
  kubectl rollout restart statefulset/jenkins -n jenkins
  echo "Waiting for Jenkins pod to start rolling over..."
  sleep 3
  
  # Wait for Jenkins pod to be ready
  echo "Monitoring Jenkins pod startup (press Ctrl+C to skip wait):"
  kubectl rollout status statefulset/jenkins -n jenkins
fi

echo "=================================================="
echo "✨ Cleanup finished! Cluster resources optimized."
echo "=================================================="
