#!/bin/bash

echo "=========================================="
echo "  API Testing Script"
echo "=========================================="
echo ""

API_URL="http://localhost:3001/api"
PASSED=0
FAILED=0

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Test function
test_endpoint() {
    local name=$1
    local url=$2
    local expected_status=$3
    
    echo -n "Testing $name... "
    
    response=$(curl -s -w "\n%{http_code}" "$url")
    status_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | sed '$d')
    
    if [ "$status_code" -eq "$expected_status" ]; then
        echo -e "${GREEN}✅ PASSED${NC} (Status: $status_code)"
        ((PASSED++))
        return 0
    else
        echo -e "${RED}❌ FAILED${NC} (Expected: $expected_status, Got: $status_code)"
        echo "Response: $body"
        ((FAILED++))
        return 1
    fi
}

# Test 1: Health Check
echo "1️⃣  Health Check"
test_endpoint "Health endpoint" "$API_URL/health" 200
echo ""

# Test 2: Get All Meetings
echo "2️⃣  Get All Meetings"
test_endpoint "Get meetings" "$API_URL/meetings" 200

# Check response format
response=$(curl -s "$API_URL/meetings")
if echo "$response" | jq -e '.success' > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Response format valid${NC}"
    ((PASSED++))
else
    echo -e "${RED}❌ Invalid response format${NC}"
    ((FAILED++))
fi
echo ""

# Test 3: Search Meetings
echo "3️⃣  Search Functionality"
test_endpoint "Search by keyword" "$API_URL/meetings?search=คณะกรรมการ" 200

# Test empty search
test_endpoint "Empty search" "$API_URL/meetings?search=" 200
echo ""

# Test 4: Search with special characters
echo "4️⃣  Special Characters"
test_endpoint "Search with Thai" "$API_URL/meetings?search=ประชุม" 200
test_endpoint "Search with number" "$API_URL/meetings?search=1/2568" 200
echo ""

# Test 5: Invalid endpoints
echo "5️⃣  Error Handling"
test_endpoint "Invalid endpoint" "$API_URL/invalid" 404
echo ""

# Test 6: Response time
echo "6️⃣  Performance"
echo -n "Testing response time... "
start_time=$(date +%s%N)
curl -s "$API_URL/meetings" > /dev/null
end_time=$(date +%s%N)
duration=$(( (end_time - start_time) / 1000000 ))

if [ $duration -lt 1000 ]; then
    echo -e "${GREEN}✅ PASSED${NC} (${duration}ms)"
    ((PASSED++))
else
    echo -e "${YELLOW}⚠️  SLOW${NC} (${duration}ms)"
fi
echo ""

# Test 7: Database Connection
echo "7️⃣  Database Connection"
health_response=$(curl -s "$API_URL/health")
db_status=$(echo "$health_response" | jq -r '.database')

if [ "$db_status" = "connected" ]; then
    echo -e "${GREEN}✅ Database connected${NC}"
    ((PASSED++))
else
    echo -e "${RED}❌ Database not connected${NC}"
    ((FAILED++))
fi
echo ""

# Summary
echo "=========================================="
echo "  Test Summary"
echo "=========================================="
echo -e "Total Tests: $((PASSED + FAILED))"
echo -e "${GREEN}Passed: $PASSED${NC}"
echo -e "${RED}Failed: $FAILED${NC}"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}🎉 All tests passed!${NC}"
    exit 0
else
    echo -e "${RED}❌ Some tests failed${NC}"
    exit 1
fi
