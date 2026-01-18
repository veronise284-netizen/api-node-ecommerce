# Test RBAC Implementation
Write-Host "Starting RBAC Tests..." -ForegroundColor Cyan

# 1. Login as Admin
Write-Host "`n[TEST 1] Login as Admin..." -ForegroundColor Yellow
try {
    $adminLogin = Invoke-RestMethod -Uri "http://localhost:3000/api/auth/login" -Method POST -ContentType "application/json" -Body '{"email":"admin@example.com","password":"Admin123!"}'
    $adminToken = $adminLogin.token
    Write-Host "✓ Admin login successful" -ForegroundColor Green
} catch {
    Write-Host "✗ Admin login failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# 2. Login as Vendor
Write-Host "`n[TEST 2] Login as Vendor..." -ForegroundColor Yellow
try {
    $vendorLogin = Invoke-RestMethod -Uri "http://localhost:3000/api/auth/login" -Method POST -ContentType "application/json" -Body '{"email":"veronise.akim@example.com","password":"Password123"}'
    $vendorToken = $vendorLogin.token
    Write-Host "✓ Vendor login successful" -ForegroundColor Green
} catch {
    Write-Host "✗ Vendor login failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# 3. Admin accesses user management
Write-Host "`n[TEST 3] Admin accessing user management..." -ForegroundColor Yellow
try {
    $users = Invoke-RestMethod -Uri "http://localhost:3000/api/users" -Headers @{Authorization="Bearer $adminToken"}
    Write-Host "✓ Admin can access users ($($users.count) users found)" -ForegroundColor Green
} catch {
    Write-Host "✗ Admin cannot access users: $($_.Exception.Message)" -ForegroundColor Red
}

# 4. Vendor tries to access user management
Write-Host "`n[TEST 4] Vendor accessing user management (should fail)..." -ForegroundColor Yellow
try {
    $users = Invoke-RestMethod -Uri "http://localhost:3000/api/users" -Headers @{Authorization="Bearer $vendorToken"}
    Write-Host "✗ Vendor should NOT be able to access users!" -ForegroundColor Red
} catch {
    if ($_.Exception.Response.StatusCode -eq 403) {
        Write-Host "✓ Vendor correctly blocked from accessing users" -ForegroundColor Green
    } else {
        Write-Host "✗ Unexpected error: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# 5. Vendor creates a product
Write-Host "`n[TEST 5] Vendor creating product..." -ForegroundColor Yellow
try {
    $newProduct = Invoke-RestMethod -Uri "http://localhost:3000/api/products" -Method POST -Headers @{Authorization="Bearer $vendorToken"} -ContentType "application/json" -Body '{"name":"RBAC Test Product","price":49.99,"category":"electronics","description":"Testing RBAC"}'
    $vendorProductId = $newProduct._id
    Write-Host "✓ Vendor can create products (ID: $vendorProductId)" -ForegroundColor Green
} catch {
    Write-Host "✗ Vendor cannot create product: $($_.Exception.Message)" -ForegroundColor Red
}

# 6. Vendor updates own product
Write-Host "`n[TEST 6] Vendor updating own product..." -ForegroundColor Yellow
try {
    $updated = Invoke-RestMethod -Uri "http://localhost:3000/api/products/$vendorProductId" -Method PUT -Headers @{Authorization="Bearer $vendorToken"} -ContentType "application/json" -Body '{"price":59.99}'
    Write-Host "✓ Vendor can update own products" -ForegroundColor Green
} catch {
    Write-Host "✗ Vendor cannot update own product: $($_.Exception.Message)" -ForegroundColor Red
}

# 7. Get products to find one from another vendor
Write-Host "`n[TEST 7] Finding product from another vendor..." -ForegroundColor Yellow
$allProducts = Invoke-RestMethod -Uri "http://localhost:3000/api/products"
$otherProduct = $allProducts.products | Where-Object { $_.createdBy -ne $null -and $_.createdBy -ne $vendorLogin.user._id } | Select-Object -First 1

if ($otherProduct) {
    # 8. Vendor tries to update another vendor's product
    Write-Host "`n[TEST 8] Vendor updating another vendor's product (should fail)..." -ForegroundColor Yellow
    try {
        $updated = Invoke-RestMethod -Uri "http://localhost:3000/api/products/$($otherProduct._id)" -Method PUT -Headers @{Authorization="Bearer $vendorToken"} -ContentType "application/json" -Body '{"price":999.99}'
        Write-Host "✗ Vendor should NOT be able to update other vendor's products!" -ForegroundColor Red
    } catch {
        if ($_.Exception.Response.StatusCode -eq 403) {
            Write-Host "✓ Vendor correctly blocked from updating other vendor's products" -ForegroundColor Green
        } else {
            Write-Host "✗ Unexpected error: $($_.Exception.Message)" -ForegroundColor Red
        }
    }

    # 9. Admin updates any product
    Write-Host "`n[TEST 9] Admin updating any product..." -ForegroundColor Yellow
    try {
        $updated = Invoke-RestMethod -Uri "http://localhost:3000/api/products/$($otherProduct._id)" -Method PUT -Headers @{Authorization="Bearer $adminToken"} -ContentType "application/json" -Body '{"price":29.99}'
        Write-Host "✓ Admin can update any product" -ForegroundColor Green
    } catch {
        Write-Host "✗ Admin cannot update product: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# 10. Vendor tries to create category
Write-Host "`n[TEST 10] Vendor creating category (should fail)..." -ForegroundColor Yellow
try {
    $category = Invoke-RestMethod -Uri "http://localhost:3000/api/categories" -Method POST -Headers @{Authorization="Bearer $vendorToken"} -ContentType "application/json" -Body '{"name":"Test Category","description":"Should fail"}'
    Write-Host "✗ Vendor should NOT be able to create categories!" -ForegroundColor Red
} catch {
    if ($_.Exception.Response.StatusCode -eq 403) {
        Write-Host "✓ Vendor correctly blocked from creating categories" -ForegroundColor Green
    } else {
        Write-Host "✗ Unexpected error: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# 11. Admin creates category
Write-Host "`n[TEST 11] Admin creating category..." -ForegroundColor Yellow
try {
    $category = Invoke-RestMethod -Uri "http://localhost:3000/api/categories" -Method POST -Headers @{Authorization="Bearer $adminToken"} -ContentType "application/json" -Body '{"name":"RBAC Test Category","description":"Testing admin privileges"}'
    Write-Host "✓ Admin can create categories" -ForegroundColor Green
} catch {
    Write-Host "✗ Admin cannot create category: $($_.Exception.Message)" -ForegroundColor Red
}

# 12. Clean up - Delete test product
Write-Host "`n[TEST 12] Cleaning up..." -ForegroundColor Yellow
try {
    Invoke-RestMethod -Uri "http://localhost:3000/api/products/$vendorProductId" -Method DELETE -Headers @{Authorization="Bearer $vendorToken"}
    Write-Host "✓ Test product deleted" -ForegroundColor Green
} catch {
    Write-Host "✗ Could not delete test product: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n=== RBAC Tests Complete ===" -ForegroundColor Cyan
Write-Host "`nTest Summary:" -ForegroundColor Cyan
Write-Host "✓ = Test passed as expected" -ForegroundColor Green
Write-Host "✗ = Test failed (unexpected result)" -ForegroundColor Red
