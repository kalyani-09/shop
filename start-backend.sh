#!/bin/bash
mkdir -p logs
echo "Starting Auth Service..."
nohup mvn -pl auth-service spring-boot:run > logs/auth-service.log 2>&1 &
echo "Starting Inventory Service..."
nohup mvn -pl inventory-service spring-boot:run > logs/inventory-service.log 2>&1 &
echo "Starting Cart Service..."
nohup mvn -pl cart-service spring-boot:run > logs/cart-service.log 2>&1 &
echo "Starting API Gateway..."
nohup mvn -pl api-gateway spring-boot:run > logs/api-gateway.log 2>&1 &
echo "Starting Temporal Worker..."
nohup mvn -pl temporal-worker spring-boot:run > logs/temporal-worker.log 2>&1 &
echo "Starting Reel Service..."
nohup mvn -pl reel-service spring-boot:run > logs/reel-service.log 2>&1 &
echo "All backend services started."
