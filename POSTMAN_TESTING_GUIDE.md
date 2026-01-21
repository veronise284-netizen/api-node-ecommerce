# Postman Testing Guide - Task 7 Features

## 🚀 Quick Setup

### 1. Start Your Server
```bash
# Seed the database first
npm run seed

# Start the server
npm run dev
```

### 2. Base URL
```
http://localhost:8080
```

---

## 📋 Step-by-Step Testing Guide

## STEP 1: Seed the Database

Before testing, make sure you have data:

**Terminal Command:**
```bash
npm run seed
```

This creates:
- 7 test users (admin, vendors, customers)
- 30 products across 5 categories
- 10 reviews

---

## STEP 2: Login to Get Token

### 2.1 Login as Customer

**Method:** `POST`  
**URL:** `http://localhost:8080/api/auth/login`  
**Headers:**
```
Content-Type: application/json
```

**Body (raw JSON):**
```json
{
  "email": "john.customer@example.com",
  "password": "Customer123!"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "...",
    "email": "john.customer@example.com",
    "role": "customer"
  }
}
```

**⚠️ IMPORTANT:** Copy the `token` value - you'll need it for authenticated requests!

### 2.2 Other Test Users

**Admin:**
```json
{
  "email": "admin@example.com",
  "password": "Admin123!"
}
```

**Vendor:**
```json
{
  "email": "veronise.akim@example.com",
  "password": "Password123"
}
```

---

## STEP 3: Test Product Endpoints with Pagination & Filtering

### 3.1 Get All Products (Basic)

**Method:** `GET`  
**URL:** `http://localhost:8080/api/products`  
**Headers:** None required

**Response includes:**
```json
{
  "success": true,
  "data": [...products...],
  "pagination": {
    "currentPage": 1,
    "totalPages": 3,
    "totalItems": 30,
    "itemsPerPage": 10,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

### 3.2 Pagination

**Method:** `GET`  
**URL:** `http://localhost:8080/api/products?page=2&limit=5`

**Test different pages:**
- Page 1: `?page=1&limit=10`
- Page 2: `?page=2&limit=10`
- Large page size: `?page=1&limit=20`

### 3.3 Filter by Category

**Method:** `GET`  
**URL:** `http://localhost:8080/api/products?category=electronics`

**Try other categories:**
- `?category=clothing`
- `?category=books`
- `?category=home`
- `?category=sports`

### 3.4 Filter by Price Range

**Method:** `GET`  
**URL:** `http://localhost:8080/api/products?minPrice=100&maxPrice=500`

**Try different ranges:**
- Under $50: `?maxPrice=50`
- $100-$500: `?minPrice=100&maxPrice=500`
- Over $1000: `?minPrice=1000`

### 3.5 Filter by Stock Status

**Method:** `GET`  
**URL:** `http://localhost:8080/api/products?inStock=true`

### 3.6 Search Products (Text Search)

**Method:** `GET`  
**URL:** `http://localhost:8080/api/products?search=laptop`

**Try other searches:**
- `?search=phone`
- `?search=shirt`
- `?search=book`
- `?search=coffee`

### 3.7 Sort Products

**By Price (Ascending):**
**URL:** `http://localhost:8080/api/products?sortBy=price&sortOrder=asc`

**By Price (Descending):**
**URL:** `http://localhost:8080/api/products?sortBy=price&sortOrder=desc`

**By Date:**
**URL:** `http://localhost:8080/api/products?sortBy=createdAt&sortOrder=desc`

### 3.8 Combined Query (Everything Together!)

**Method:** `GET`  
**URL:** 
```
http://localhost:8080/api/products?category=electronics&minPrice=100&maxPrice=2000&inStock=true&search=laptop&sortBy=price&sortOrder=asc&page=1&limit=5
```

This searches for:
- Electronics category
- Price between $100-$2000
- In stock only
- Contains "laptop"
- Sorted by price (low to high)
- Page 1, 5 items

---

## STEP 4: Test Aggregation Endpoints

### 4.1 Product Statistics

**Method:** `GET`  
**URL:** `http://localhost:8080/api/products/stats`  
**Headers:** None required

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "category": "electronics",
      "totalProducts": 12,
      "avgPrice": 599.99,
      "minPrice": 9.99,
      "maxPrice": 2499.99,
      "totalQuantity": 845
    }
  ]
}
```

### 4.2 Top Products (Most Expensive)

**Method:** `GET`  
**URL:** `http://localhost:8080/api/products/top`

**With custom limit:**
**URL:** `http://localhost:8080/api/products/top?limit=5`

**Response:**
```json
{
  "success": true,
  "count": 10,
  "data": [
    {
      "name": "MacBook Pro 16\"",
      "price": 2499.99,
      "category": "electronics",
      "quantity": 15
    }
  ]
}
```

### 4.3 Low Stock Alert (Requires Authentication)

**Method:** `GET`  
**URL:** `http://localhost:8080/api/products/low-stock`  
**Headers:**
```
Authorization: Bearer YOUR_TOKEN_HERE
```

**With custom threshold:**
**URL:** `http://localhost:8080/api/products/low-stock?threshold=10`

**Response:**
```json
{
  "success": true,
  "count": 5,
  "threshold": 10,
  "data": [
    {
      "name": "Limited Edition Headphones",
      "quantity": 5,
      "alert": "Only 5 left in stock!"
    }
  ]
}
```

### 4.4 Price Distribution

**Method:** `GET`  
**URL:** `http://localhost:8080/api/products/price-distribution`

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "priceRange": "$0 - $50",
      "count": 8,
      "avgPrice": 24.99,
      "products": [...]
    }
  ]
}
```

---

## STEP 5: Test Review System (Population)

### 5.1 Create a Review

**First, get a product ID from the products list**

**Method:** `POST`  
**URL:** `http://localhost:8080/api/reviews`  
**Headers:**
```
Content-Type: application/json
Authorization: Bearer YOUR_TOKEN_HERE
```

**Body (raw JSON):**
```json
{
  "productId": "PUT_PRODUCT_ID_HERE",
  "rating": 5,
  "comment": "Excellent product! Fast delivery and great quality. Highly recommended!"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Review created successfully",
  "data": {
    "_id": "...",
    "product": {
      "name": "MacBook Pro 16\"",
      "price": 2499.99
    },
    "user": {
      "firstName": "John",
      "lastName": "Customer",
      "email": "john.customer@example.com"
    },
    "rating": 5,
    "comment": "Excellent product!..."
  }
}
```

### 5.2 Get Product Reviews (with User Info - Population)

**Method:** `GET`  
**URL:** `http://localhost:8080/api/products/PRODUCT_ID/reviews`  
**Headers:** None required

**With pagination:**
**URL:** `http://localhost:8080/api/products/PRODUCT_ID/reviews?page=1&limit=10`

**Response shows user info populated:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "...",
      "rating": 5,
      "comment": "Great product!",
      "user": {
        "firstName": "John",
        "lastName": "Customer",
        "email": "john.customer@example.com"
      },
      "createdAt": "2026-01-21T10:30:00.000Z"
    }
  ],
  "stats": {
    "averageRating": 4.5,
    "totalReviews": 10
  }
}
```

### 5.3 Get My Reviews (with Product Info - Population)

**Method:** `GET`  
**URL:** `http://localhost:8080/api/users/me/reviews`  
**Headers:**
```
Authorization: Bearer YOUR_TOKEN_HERE
```

**With pagination:**
**URL:** `http://localhost:8080/api/users/me/reviews?page=1&limit=10`

**Response shows product info populated:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "...",
      "rating": 5,
      "comment": "Great product!",
      "product": {
        "name": "MacBook Pro 16\"",
        "price": 2499.99,
        "images": [...],
        "category": "electronics"
      },
      "createdAt": "2026-01-21T10:30:00.000Z"
    }
  ]
}
```

### 5.4 Update a Review

**Method:** `PATCH`  
**URL:** `http://localhost:8080/api/reviews/REVIEW_ID`  
**Headers:**
```
Content-Type: application/json
Authorization: Bearer YOUR_TOKEN_HERE
```

**Body (raw JSON):**
```json
{
  "rating": 4,
  "comment": "Updated my review - still good but found a small issue."
}
```

### 5.5 Delete a Review

**Method:** `DELETE`  
**URL:** `http://localhost:8080/api/reviews/REVIEW_ID`  
**Headers:**
```
Authorization: Bearer YOUR_TOKEN_HERE
```

---

## STEP 6: Test Transactions

### 6.1 Add Product to Cart

**Method:** `POST`  
**URL:** `http://localhost:8080/api/cart/items`  
**Headers:**
```
Content-Type: application/json
Authorization: Bearer YOUR_TOKEN_HERE
```

**Body:**
```json
{
  "productId": "PUT_PRODUCT_ID_HERE",
  "quantity": 2
}
```

### 6.2 Check Product Quantity BEFORE Order

**Method:** `GET`  
**URL:** `http://localhost:8080/api/products/PRODUCT_ID`

**Note the `quantity` value!** Example: `"quantity": 15`

### 6.3 Create Order (Transaction Test)

**Method:** `POST`  
**URL:** `http://localhost:8080/api/orders`  
**Headers:**
```
Authorization: Bearer YOUR_TOKEN_HERE
```

**What happens:**
✅ Creates order  
✅ Reduces product inventory  
✅ Clears cart  
❌ Rolls back everything if ANY step fails

**Response:**
```json
{
  "success": true,
  "message": "Order created successfully",
  "order": {
    "_id": "ORDER_ID_HERE",
    "items": [...],
    "totalAmount": 1999.98,
    "status": "pending"
  }
}
```

### 6.4 Check Product Quantity AFTER Order

**Method:** `GET`  
**URL:** `http://localhost:8080/api/products/PRODUCT_ID`

**Quantity should be reduced!** Example: `"quantity": 13` (was 15, ordered 2)

### 6.5 Cancel Order (Transaction Rollback Test)

**Method:** `PATCH`  
**URL:** `http://localhost:8080/api/orders/ORDER_ID/cancel`  
**Headers:**
```
Authorization: Bearer YOUR_TOKEN_HERE
```

**What happens:**
✅ Cancels order  
✅ Restores product inventory  
❌ Rolls back if ANY step fails

### 6.6 Check Product Quantity AFTER Cancel

**Method:** `GET`  
**URL:** `http://localhost:8080/api/products/PRODUCT_ID`

**Quantity should be restored!** Example: `"quantity": 15` (back to original)

---

## 📊 Postman Collection Structure

Create folders in Postman to organize:

```
📁 E-Commerce API - Task 7
  📁 1. Authentication
    - POST Login (Customer)
    - POST Login (Admin)
    - POST Login (Vendor)
  
  📁 2. Products - Pagination & Filtering
    - GET All Products
    - GET Products (Paginated)
    - GET Products (Filter by Category)
    - GET Products (Filter by Price)
    - GET Products (Search)
    - GET Products (Sorted)
    - GET Products (Combined Query)
  
  📁 3. Aggregation
    - GET Product Statistics
    - GET Top Products
    - GET Low Stock Alert
    - GET Price Distribution
  
  📁 4. Reviews (Population)
    - POST Create Review
    - GET Product Reviews
    - GET My Reviews
    - PATCH Update Review
    - DELETE Delete Review
  
  📁 5. Transactions
    - POST Add to Cart
    - GET Product (Check Quantity)
    - POST Create Order
    - GET Product (Verify Reduced)
    - PATCH Cancel Order
    - GET Product (Verify Restored)
```

---

## 🎯 Testing Scenarios

### Scenario 1: Search & Filter Electronics
1. Search for laptops: `?search=laptop`
2. Filter electronics: `?category=electronics`
3. Price range $500-$2500: `?minPrice=500&maxPrice=2500`
4. Sort by price: `?sortBy=price&sortOrder=asc`
5. Paginate: `?page=1&limit=5`

### Scenario 2: Create & Manage Review
1. Login as customer
2. Get product list, choose a product
3. Create review with 5-star rating
4. View product reviews (see your review with user info)
5. View your reviews (see product info)
6. Update review to 4 stars
7. Delete review

### Scenario 3: Test Transaction Safety
1. Login as customer
2. Add product to cart (note quantity)
3. Check product stock (e.g., 20 items)
4. Create order with 3 items
5. Verify stock reduced to 17
6. Cancel order
7. Verify stock restored to 20

### Scenario 4: Admin Analytics
1. Login as admin
2. Get product statistics
3. Get top 10 expensive products
4. Get low stock alert
5. Get price distribution

---

## 💡 Pro Tips for Postman

### 1. Save Token as Environment Variable
1. Create environment: `E-Commerce Dev`
2. Add variable: `token`
3. After login, save token to variable
4. Use `{{token}}` in Authorization headers

### 2. Use Variables for IDs
```
{{base_url}} = http://localhost:8080
{{product_id}} = [paste from response]
{{order_id}} = [paste from response]
```

### 3. Pre-request Script for Auto-Login
```javascript
// Auto-login and save token
pm.sendRequest({
    url: 'http://localhost:8080/api/auth/login',
    method: 'POST',
    header: 'Content-Type: application/json',
    body: {
        mode: 'raw',
        raw: JSON.stringify({
            email: 'john.customer@example.com',
            password: 'Customer123!'
        })
    }
}, function (err, res) {
    pm.environment.set('token', res.json().token);
});
```

### 4. Test Script Examples
```javascript
// Check status code
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});

// Check response has data
pm.test("Response has data", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData.success).to.eql(true);
    pm.expect(jsonData.data).to.be.an('array');
});

// Save product ID
var jsonData = pm.response.json();
pm.environment.set("product_id", jsonData.data[0]._id);
```

---

## 🐛 Common Issues

### Issue: "Unauthorized" error
**Solution:** Make sure you:
1. Logged in successfully
2. Copied the token
3. Added `Authorization: Bearer YOUR_TOKEN` header

### Issue: "Product not found"
**Solution:** 
1. Run `npm run seed` to create products
2. Get actual product ID from product list first

### Issue: "Text search not working"
**Solution:** Restart MongoDB to ensure text indexes are created

### Issue: No pagination metadata
**Solution:** Make sure you're using the updated endpoints

---

## ✅ Quick Test Checklist

- [ ] Login successful (token received)
- [ ] Get all products (pagination works)
- [ ] Filter by category
- [ ] Search products (text search)
- [ ] Sort products by price
- [ ] Get product statistics
- [ ] Get top products
- [ ] Get low stock alert
- [ ] Create review (product info populated)
- [ ] Get product reviews (user info populated)
- [ ] Get my reviews (product info populated)
- [ ] Create order (inventory reduced)
- [ ] Cancel order (inventory restored)

---

**Happy Testing! 🚀**

Need help? Check the response bodies for detailed error messages!
