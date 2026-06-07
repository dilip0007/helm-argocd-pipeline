#!/bin/bash

# Configuration: port mapping and service targets
# Format: LOCAL_PORT:NAMESPACE:SERVICE_NAME:TARGET_PORT
TUNNELS=(
  "8080:argocd:svc/argocd-server:443"
  "8081:hello-kubernetes-ns:svc/api-gateway:3000"
  "3001:hello-kubernetes-ns:svc/family-service:3001"
  "3002:hello-kubernetes-ns:svc/messages-service:3002"
  "3003:hello-kubernetes-ns:svc/events-service:3003"
)

echo "Starting Port-Forward Keeper..."
echo "Logs are written to /tmp/pf-<port>.log"
echo "Press [Ctrl+C] to stop this script."
echo "------------------------------------------------"

while true; do
  for tunnel in "${TUNNELS[@]}"; do
    # Parse the configuration
    IFS=":" read -r local_port namespace service target_port <<< "$tunnel"
    
    # Check if a process is actively listening on the local port
    if ! lsof -i tcp:"$local_port" -sTCP:LISTEN -t >/dev/null 2>&1; then
      echo "[$(date '+%H:%M:%S')] 🔴 Port $local_port is closed. Restarting tunnel to $service ($namespace)..."
      
      # Kill any stale kubectl port-forward processes associated with this local port
      stale_pids=$(pgrep -f "port-forward.*$local_port")
      if [ -n "$stale_pids" ]; then
        echo "  Cleaning up stale process(es): $stale_pids"
        kill -9 $stale_pids >/dev/null 2>&1
      fi
      
      # Start the port forward command in the background
      nohup kubectl port-forward -n "$namespace" "$service" "$local_port:$target_port" > "/tmp/pf-$local_port.log" 2>&1 &
    else
      # Port is running fine
      echo -n ""
    fi
  done
  sleep 5
done
