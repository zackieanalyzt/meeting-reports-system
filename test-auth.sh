#!/bin/bash

# Test Authentication System
# สำหรับทดสอบระบบ Authentication

echo "🔐 Testing Authentication System"
echo "================================"

# Test 1: Health Check
echo ""
echo "Test 1: Health Check"
curl -s http://localhost:3001/api/health | jq

# Test 2: Login (ต้องแก้ไข username/password ให้ตรงกับข้อมูลจริง)
echo ""
echo "Test 2: Login"
LOGIN_RESPONSE=$(curl -s -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"password"}')

echo $LOGIN_RESPONSE | jq

# Extract token
TOKEN=$(echo $LOGIN_RESPONSE | jq -r '.token')

if [ "$TOKEN" != "null" ] && [ -n "$TOKEN" ]; then
  echo "✅ Login successful! Token: ${TOKEN:0:20}..."
  
  # Test 3: Verify Token
  echo ""
  echo "Test 3: Verify Token"
  curl -s http://localhost:3001/api/auth/verify \
    -H "Authorization: Bearer $TOKEN" | jq
  
  # Test 4: Get Meetings (Protected Route)
  echo ""
  echo "Test 4: Get Meetings (Protected)"
  curl -s http://localhost:3001/api/meetings \
    -H "Authorization: Bearer $TOKEN" | jq '.success, .count'
  
  # Test 5: Get Agendas (Protected Route)
  echo ""
  echo "Test 5: Get Agendas (Protected)"
  curl -s http://localhost:3001/api/agendas \
    -H "Authorization: Bearer $TOKEN" | jq '.success, .count'
  
  # Test 6: Logout
  echo ""
  echo "Test 6: Logout"
  curl -s -X POST http://localhost:3001/api/auth/logout \
    -H "Authorization: Bearer $TOKEN" | jq
  
else
  echo "❌ Login failed!"
fi

echo ""
echo "================================"
echo "✅ Testing completed!"
