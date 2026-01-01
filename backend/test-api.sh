#!/bin/bash

BASE_URL="https://motract-backend.onrender.com"

echo "==================================="
echo "Motract Backend API Test Suite"
echo "==================================="
echo ""

# Test 1: Health Check
echo "1. Testing Health Check..."
curl -s -o /dev/null -w "Status: %{http_code}\n" $BASE_URL
echo ""

# Test 2: Register User (Workshop Admin)
echo "2. Testing User Registration..."
curl -X POST $BASE_URL/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "mobile": "9876543210",
    "password": "test123",
    "role": "WORKSHOP_ADMIN",
    "name": "Test Workshop"
  }' \
  -w "\nStatus: %{http_code}\n"
echo ""

# Test 3: Login
echo "3. Testing User Login..."
LOGIN_RESPONSE=$(curl -s -X POST $BASE_URL/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "mobile": "9876543210",
    "password": "test123"
  }')
echo $LOGIN_RESPONSE | jq '.'
TOKEN=$(echo $LOGIN_RESPONSE | jq -r '.access_token')
echo "Token: ${TOKEN:0:50}..."
echo ""

# Test 4: Get Vehicle Models (Master Data)
echo "4. Testing Get Vehicle Models..."
curl -s $BASE_URL/vehicle/masters/models | jq '.'
echo ""

# Test 5: Vehicle Lookup (Non-existent)
echo "5. Testing Vehicle Lookup (Non-existent)..."
curl -s -w "\nStatus: %{http_code}\n" $BASE_URL/vehicle/lookup/KA01AB1234
echo ""

# Test 6: Register Vehicle
echo "6. Testing Vehicle Registration..."
curl -X POST $BASE_URL/vehicle/register \
  -H "Content-Type: application/json" \
  -d '{
    "regNumber": "KA01AB1234",
    "variantId": "test-variant-id",
    "mfgYear": 2020
  }' \
  -w "\nStatus: %{http_code}\n"
echo ""

# Test 7: Get Inventory Items
echo "7. Testing Get Inventory Items..."
curl -s "$BASE_URL/inventory/items?workshopId=test-workshop-id" | jq '.'
echo ""

# Test 8: Get Job Cards
echo "8. Testing Get Job Cards..."
curl -s "$BASE_URL/job-cards?workshopId=test-workshop-id" | jq '.'
echo ""

# Test 9: Get Bays
echo "9. Testing Get Bays..."
curl -s "$BASE_URL/slots/bays?workshopId=test-workshop-id" | jq '.'
echo ""

echo "==================================="
echo "Test Suite Complete"
echo "==================================="
