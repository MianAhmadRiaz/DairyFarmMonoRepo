/**
 * Test script for Employee Salaries API endpoint
 * 
 * This script tests the new employee salaries endpoint without authentication
 * to verify the endpoint is accessible and the route is properly configured.
 */

console.log('Testing Employee Salaries API Endpoint...');
console.log('Server URL: http://localhost:2500');
console.log('');

// Test the base API endpoint first
fetch('http://localhost:2500/')
    .then(response => response.text())
    .then(data => {
        console.log('✅ Base API Response:', data);
        console.log('');
        
        // Now test a public endpoint to verify API structure
        return fetch('http://localhost:2500/api/v1/auth/signin', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: 'test@example.com',
                password: 'testpassword'
            })
        });
    })
    .then(response => response.json())
    .then(data => {
        console.log('🔍 Auth endpoint test (expected to fail with validation error):');
        console.log('Status:', data.success ? 'Success' : 'Failed (Expected)');
        console.log('Message:', data.message || 'No message');
        console.log('');
        
        // Test our new endpoint (should fail with auth error, but route should exist)
        return fetch('http://localhost:2500/api/v1/salaries/employees');
    })
    .then(response => response.json())
    .then(data => {
        console.log('🎯 Employee Salaries Endpoint Test:');
        console.log('Status:', data.success ? 'Success' : 'Failed (Expected - Auth Required)');
        console.log('Message:', data.message || 'No message');
        
        if (data.message && data.message.includes('Authorization')) {
            console.log('✅ Endpoint exists and requires authentication (as expected)');
        } else if (data.message && data.message.includes('Employee salaries')) {
            console.log('✅ Endpoint is working!');
        } else {
            console.log('❌ Unexpected response');
        }
    })
    .catch(error => {
        console.error('❌ Error testing endpoints:', error.message);
        
        if (error.message.includes('ECONNREFUSED')) {
            console.log('');
            console.log('🚨 Server is not running on port 2500');
            console.log('   Please start the server with: npm run start:local');
        }
    });
