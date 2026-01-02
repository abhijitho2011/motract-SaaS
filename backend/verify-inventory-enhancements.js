// using global fetch (Node 18+)

// const BASE_URL = 'http://localhost:3000'; // If running locally
const BASE_URL = 'https://motract-backend-5sct.onrender.com';

async function main() {
    console.log(`Running Inventory Verification against ${BASE_URL}`);

    // 1. Login
    console.log('\n[1] Logging in...');
    const loginRes = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobile: '9876543210', password: 'password123' })
    });

    if (!loginRes.ok) {
        throw new Error(`Login failed: ${await loginRes.text()}`);
    }

    const { access_token, user } = await loginRes.json();
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${access_token}`
    };
    console.log('Login successful.');

    // 2. Create Masters
    console.log('\n[2] Creating Masters...');

    // Create Make
    const makeRes = await fetch(`${BASE_URL}/vehicle/masters/makes`, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify({ name: 'TestMake-' + Date.now() })
    });
    const make = await makeRes.json();
    console.log('Make created:', make.name);

    // Create Model
    const modelRes = await fetch(`${BASE_URL}/vehicle/masters/models`, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify({ makeId: make.id, name: 'TestModel' })
    });
    const model = await modelRes.json();
    console.log('Model created:', model.name);

    // Create Variant
    const variantRes = await fetch(`${BASE_URL}/vehicle/masters/variants`, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify({ modelId: model.id, name: 'TestVariant', fuelType: 'PETROL' })
    });
    const variant = await variantRes.json();
    console.log('Variant created:', variant.name);

    // Create Category
    const catRes = await fetch(`${BASE_URL}/inventory/masters/categories`, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify({ name: 'TestCategory-' + Date.now() })
    });
    const category = await catRes.json();
    console.log('Category created:', category.name);

    // Create SubCategory
    const subCatRes = await fetch(`${BASE_URL}/inventory/masters/sub-categories`, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify({ categoryId: category.id, name: 'TestSubCat' })
    });
    const subCategory = await subCatRes.json();
    console.log('SubCategory created:', subCategory.name);

    // 3. Create Complex Item
    console.log('\n[3] Creating Complex Inventory Item...');
    const itemPayload = {
        workshopId: user.workshopId || 'test-workshop',
        name: 'Complex Brake Pad',
        brand: 'Bosch',
        isOem: false,
        hsnCode: '8708',
        taxPercent: 18,
        reorderLevel: 5,
        categoryId: category.id,
        subCategoryId: subCategory.id,
        description: 'High performance brake pad',
        partNumbers: ['BP-001', 'BP-001-ALT'],
        compatibleVehicles: [
            { modelId: model.id, variantId: variant.id }
        ],
        initialStock: {
            quantity: 10,
            purchasePrice: 500,
            salePrice: 800
        }
    };

    const itemRes = await fetch(`${BASE_URL}/inventory/items`, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(itemPayload)
    });

    if (!itemRes.ok) {
        throw new Error(`Item creation failed: ${await itemRes.text()}`);
    }

    const item = await itemRes.json();
    console.log('Item created ID:', item.id);

    // 4. Verify Relations
    console.log('\n[4] Verifying Item Details...');
    // The createItem response (from findOne) should have the relations remapped
    if (item.partNumbers.length !== 2) console.error('FAILED: SKUs not created/returned');
    else console.log('SUCCESS: Part Numbers Verified');

    if (item.compatibleVehicles.length !== 1) console.error('FAILED: Compatibility not created/returned');
    else console.log('SUCCESS: Compatibility Verified');

    if (item.batches.length !== 1) console.error('FAILED: Initial stock batch not created');
    else console.log('SUCCESS: Initial Stock Verified');

    if (item.categoryId !== category.id) console.error('FAILED: Category link');
    else console.log('SUCCESS: Category Linked');

    console.log('\nVerification Complete.');
}

main().catch(console.error);
