# E-Commerce API Testing Script
# Run this script to test the complete API flow

Write-Host "E-Commerce API Testing Script" -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan
Write-Host ""

$baseUrl = "http://localhost:3000/api"

# Test 1: Register User
Write-Host "1. Testing User Registration..." -ForegroundColor Yellow
$registerBody = @{
    firstName = "Test"
    lastName = "User"
    email = "test@example.com"
    password = "Password123"
    age = 39
} | ConvertTo-Json

try {
    $registerResponse = Invoke-RestMethod -Uri "$baseUrl/auth/register" -Method POST -Body $registerBody -ContentType "application/json"
    $token = $registerResponse.token
    Write-Host "✅ Registration successful!" -ForegroundColor Green
    Write-Host "   Token: $($token.Substring(0, 20))..." -ForegroundColor Gray
} catch {
    Write-Host "❌ Registration failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "" 

# Test 2: Login
Write-Host "2. Testing User Login..." -ForegroundColor Yellow
$loginBody = @{
    email = "test@example.com"
    password = "Password123"
} | ConvertTo-Json

try {
    $loginResponse = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method POST -Body $loginBody -ContentType "application/json"
    $token = $loginResponse.token
    Write-Host "✅ Login successful!" -ForegroundColor Green
    Write-Host "   User: $($loginResponse.user.firstName) $($loginResponse.user.lastName)" -ForegroundColor Gray
} catch {
    Write-Host "❌ Login failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Setup headers for authenticated requests
$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}

Write-Host ""

# Test 3: Get Profile
Write-Host "3. Testing Get Profile..." -ForegroundColor Yellow
try {
    $profile = Invoke-RestMethod -Uri "$baseUrl/auth/profile" -Headers $headers
    Write-Host "✅ Profile retrieved!" -ForegroundColor Green
    Write-Host "   Email: $($profile.user.email)" -ForegroundColor Gray
} catch {
    Write-Host "❌ Get profile failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# Test 4: Get Categories (Public)
Write-Host "4. Testing Get Categories (Public)..." -ForegroundColor Yellow
try {
    $categories = Invoke-RestMethod -Uri "$baseUrl/categories"
    Write-Host "✅ Categories retrieved! Count: $($categories.count)" -ForegroundColor Green
    $categories.categories | ForEach-Object { Write-Host "   - $($_.name)" -ForegroundColor Gray }
} catch {
    Write-Host "❌ Get categories failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# Test 5: Create Category (Protected)
Write-Host "5. Testing Create Category (Protected)..." -ForegroundColor Yellow
$categoryBody = @{
    name = "Test Category"
    description = "Category created by test script"
} | ConvertTo-Json

try {
    $newCategory = Invoke-RestMethod -Uri "$baseUrl/categories" -Method POST -Body $categoryBody -Headers $headers
    $categoryId = $newCategory.category._id
    Write-Host "✅ Category created!" -ForegroundColor Green
    Write-Host "   ID: $categoryId" -ForegroundColor Gray
    Write-Host "   Name: $($newCategory.category.name)" -ForegroundColor Gray
} catch {
    Write-Host "❌ Create category failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# Test 6: Get Products (Public)
Write-Host "6. Testing Get Products (Public)..." -ForegroundColor Yellow
try {
    $products = Invoke-RestMethod -Uri "$baseUrl/products"
    Write-Host "✅ Products retrieved! Count: $($products.pagination.total)" -ForegroundColor Green
    $products.products | Select-Object -First 3 | ForEach-Object { 
        Write-Host "   - $($_.name) - `$$($_.price)" -ForegroundColor Gray 
    }
} catch {
    Write-Host "❌ Get products failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# Test 7: Create Product (Protected)
Write-Host "7. Testing Create Product (Protected)..." -ForegroundColor Yellow
$productBody = @{
    name = "Test Product"
    price = 99.99
    description = "Product created by test script"
    category = "electronics"
    quantity = 10
} | ConvertTo-Json

try {
    $newProduct = Invoke-RestMethod -Uri "$baseUrl/products" -Method POST -Body $productBody -Headers $headers
    $productId = $newProduct._id
    Write-Host "✅ Product created!" -ForegroundColor Green
    Write-Host "   ID: $productId" -ForegroundColor Gray
    Write-Host "   Name: $($newProduct.name)" -ForegroundColor Gray
    Write-Host "   Price: `$$($newProduct.price)" -ForegroundColor Gray
} catch {
    Write-Host "❌ Create product failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# Test 8: Add to Cart (Protected)
Write-Host "8. Testing Add to Cart (Protected)..." -ForegroundColor Yellow
$cartBody = @{
    productId = $productId
    quantity = 2
} | ConvertTo-Json

try {
    $cartResponse = Invoke-RestMethod -Uri "$baseUrl/cart" -Method POST -Body $cartBody -Headers $headers
    Write-Host "✅ Item added to cart!" -ForegroundColor Green
    Write-Host "   Total: `$$($cartResponse.cart.totalAmount)" -ForegroundColor Gray
    Write-Host "   Items: $($cartResponse.cart.items.Count)" -ForegroundColor Gray
} catch {
    Write-Host "❌ Add to cart failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# Test 9: Get Cart (Protected)
Write-Host "9. Testing Get Cart (Protected)..." -ForegroundColor Yellow
try {
    $cart = Invoke-RestMethod -Uri "$baseUrl/cart" -Headers $headers
    Write-Host "✅ Cart retrieved!" -ForegroundColor Green
    Write-Host "   Total: `$$($cart.cart.totalAmount)" -ForegroundColor Gray
    $cart.cart.items | ForEach-Object {
        Write-Host "   - $($_.productId.name) x $($_.quantity) = `$$($_.price * $_.quantity)" -ForegroundColor Gray
    }
} catch {
    Write-Host "❌ Get cart failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# Test 10: Update Cart Item (Protected)
Write-Host "10. Testing Update Cart Item (Protected)..." -ForegroundColor Yellow
$updateCartBody = @{
    quantity = 5
} | ConvertTo-Json

try {
    $updateCart = Invoke-RestMethod -Uri "$baseUrl/cart/$productId" -Method PUT -Body $updateCartBody -Headers $headers
    Write-Host "✅ Cart item updated!" -ForegroundColor Green
    Write-Host "   New Total: `$$($updateCart.cart.totalAmount)" -ForegroundColor Gray
} catch {
    Write-Host "❌ Update cart failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# Summary
Write-Host "=================================" -ForegroundColor Cyan
Write-Host "Testing Complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Cyan
Write-Host "   1. Test remaining endpoints manually" -ForegroundColor White
Write-Host "   2. Test error cases (invalid data, unauthorized access)" -ForegroundColor White
Write-Host "   3. Test with MongoDB Compass to verify data" -ForegroundColor White
Write-Host ""
Write-Host "Full API documentation: ASSIGNMENT_API_DOCS.md" -ForegroundColor Yellow
