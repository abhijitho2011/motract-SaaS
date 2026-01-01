const BASE_URL = 'https://motract-backend.onrender.com';

// Test results
const results = {
    passed: [],
    failed: []
};

async function testEndpoint(name, method, url, body = null) {
    try {
        const options = {
            method,
            headers: {
                'Content-Type': 'application/json',
            }
        };

        if (body) {
            options.body = JSON.stringify(body);
        }

        const response = await fetch(url, options);
        const data = await response.json().catch(() => response.text());

        console.log(`✓ ${name}: ${response.status}`);
        results.passed.push({ name, status: response.status, data });
        return { success: true, status: response.status, data };
    } catch (error) {
        console.log(`✗ ${name}: ${error.message}`);
        results.failed.push({ name, error: error.message });
        return { success: false, error: error.message };
    }
}

async function runTests() {
    console.log('Starting API Tests...\n');

    // 1. Health Check
    await testEndpoint('Health Check', 'GET', `${BASE_URL}`);

    // 2. Auth - Register User
    const registerData = {
        mobile: '9876543210',
        password: 'test123',
        role: 'WORKSHOP_ADMIN',
        name: 'Test Workshop Admin'
    };
    const registerResult = await testEndpoint('Auth - Register', 'POST', `${BASE_URL}/auth/register`, registerData);

    // 3. Auth - Login
    const loginData = {
        mobile: '9876543210',
        password: 'test123'
    };
    const loginResult = await testEndpoint('Auth - Login', 'POST', `${BASE_URL}/auth/login`, loginData);

    // 4. Vehicle Masters - Get Models
    await testEndpoint('Vehicle - Get Models', 'GET', `${BASE_URL}/vehicle/masters/models`);

    // 5. Vehicle - Lookup (non-existent)
    await testEndpoint('Vehicle - Lookup', 'GET', `${BASE_URL}/vehicle/lookup/KA01AB1234`);

    console.log('\n=== Test Summary ===');
    console.log(`Passed: ${results.passed.length}`);
    console.log(`Failed: ${results.failed.length}`);

    if (results.failed.length > 0) {
        console.log('\nFailed Tests:');
        results.failed.forEach(f => console.log(`- ${f.name}: ${f.error}`));
    }
}

runTests();
