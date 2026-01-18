# Node.js CRUD API - Categories, Products & Cart

Complete REST API with TypeScript, Express, and UUID support for Categories, Products, and Shopping Cart management.

## Features

- ✅ **Categories CRUD** - Manage product categories
- ✅ **Products CRUD** - Full product management with category relationships
- ✅ **Cart CRUD** - User shopping cart with item management
- ✅ **UUID Support** - All IDs use UUID v4 (no auto-increment)
- ✅ **TypeScript** - Fully typed with interfaces
- ✅ **In-Memory Storage** - Map-based storage (easily replaceable with database)

## Setup

### Install Dependencies
```powershell
npm install
```

### Start Development Server
```powershell
npm run dev
```

### Start Production Server
```powershell
npm start
```

Server runs on: `http://localhost:7000`

## API Endpoints

### 1. Categories API

#### Get All Categories
```http
GET /api/categories
```

#### Get Category by ID
```http
GET /api/categories/:id
```

#### Create Category
```http
POST /api/categories
Content-Type: application/json

{
  "name": "Electronics",
  "description": "Electronic devices and accessories"
}
```

#### Update Category
```http
PUT /api/categories/:id
Content-Type: application/json

{
  "name": "Updated Electronics",
  "description": "Updated description"
}
```

#### Delete Category
```http
DELETE /api/categories/:id
```

**Category Model:**
```typescript
{
  id: string;        // UUID
  name: string;
  description?: string;
}
```

---

### 2. Products API

#### Get All Products
```http
GET /api/products
```

#### Get Product by ID
```http
GET /api/products/:id
```

#### Create Product
```http
POST /api/products
Content-Type: application/json

{
  "name": "iPhone 15 Pro",
  "price": 999.99,
  "description": "Latest iPhone model",
  "categoryId": "uuid-of-category",
  "inStock": true,
  "quantity": 50
}
```

#### Update Product
```http
PUT /api/products/:id
Content-Type: application/json

{
  "name": "iPhone 15 Pro Max",
  "price": 1199.99,
  "inStock": false,
  "quantity": 0
}
```

#### Delete Product
```http
DELETE /api/products/:id
```

**Product Model:**
```typescript
{
  id: string;          // UUID
  name: string;
  price: number;
  description?: string;
  categoryId: string;  // UUID
  inStock: boolean;
  quantity: number;
}
```

---

### 3. Cart API

#### Get User's Cart
```http
GET /api/cart/:userId
```

#### Add Item to Cart
```http
POST /api/cart/:userId/items
Content-Type: application/json

{
  "productId": "uuid-of-product",
  "quantity": 2
}
```

#### Update Cart Item
```http
PUT /api/cart/:userId/items/:id
Content-Type: application/json

{
  "quantity": 5
}
```

#### Remove Item from Cart
```http
DELETE /api/cart/:userId/items/:id
```

#### Clear User's Cart
```http
DELETE /api/cart/:userId
```

**Cart Models:**
```typescript
interface Cart {
  userId: string;      // UUID
  items: CartItem[];
}

interface CartItem {
  id: string;          // UUID
  productId: string;   // UUID
  quantity: number;
}
```

---

## Testing with PowerShell

### Create a Category
```powershell
$body = @{ name='Electronics'; description='Electronic devices' } | ConvertTo-Json
Invoke-WebRequest -Uri http://localhost:7000/api/categories -Method POST -Body $body -ContentType 'application/json' -UseBasicParsing | Select-Object -ExpandProperty Content
```

### Create a Product
```powershell
$body = @{ 
  name='iPhone 15'; 
  price=999.99; 
  description='Latest iPhone'; 
  categoryId='your-category-uuid';
  inStock=$true;
  quantity=50 
} | ConvertTo-Json
Invoke-WebRequest -Uri http://localhost:7000/api/products -Method POST -Body $body -ContentType 'application/json' -UseBasicParsing | Select-Object -ExpandProperty Content
```

### Add Item to Cart
```powershell
$userId = 'user-uuid-123'
$body = @{ productId='product-uuid'; quantity=2 } | ConvertTo-Json
Invoke-WebRequest -Uri "http://localhost:7000/api/cart/$userId/items" -Method POST -Body $body -ContentType 'application/json' -UseBasicParsing | Select-Object -ExpandProperty Content
```

### Get All Categories
```powershell
Invoke-WebRequest -Uri http://localhost:7000/api/categories -UseBasicParsing | Select-Object -ExpandProperty Content
```

### Get User's Cart
```powershell
$userId = 'user-uuid-123'
Invoke-WebRequest -Uri "http://localhost:7000/api/cart/$userId" -UseBasicParsing | Select-Object -ExpandProperty Content
```

---

## Testing with Postman

### Important Postman Settings

1. **Set Content-Type Header:**
   - Go to Headers tab
   - Add: `Content-Type: application/json`

2. **Body Settings:**
   - Select `Body` tab
   - Choose `raw`
   - Select `JSON` from dropdown

3. **Example POST Request:**
   ```
   Method: POST
   URL: http://localhost:7000/api/categories
   Headers: Content-Type: application/json
   Body (raw JSON):
   {
     "name": "Books",
     "description": "Physical and digital books"
   }
   ```

---

## Testing with cURL

### Create Category
```bash
curl -X POST http://localhost:7000/api/categories \
  -H "Content-Type: application/json" \
  -d '{"name":"Electronics","description":"Electronic devices"}'
```

### Get All Products
```bash
curl http://localhost:7000/api/products
```

### Add to Cart
```bash
curl -X POST http://localhost:7000/api/cart/user-123/items \
  -H "Content-Type: application/json" \
  -d '{"productId":"product-uuid","quantity":2}'
```

---

## Project Structure

```
src/
├── routes/
│   ├── app.ts           # Main Express app with middleware
│   ├── categories.ts    # Categories CRUD endpoints
│   ├── product.ts       # Products CRUD endpoints
│   ├── cart.ts          # Cart CRUD endpoints
│   └── ...
├── middlewares/
│   └── loggers.ts       # Custom logging middleware
server.ts                # Server entry point
package.json
tsconfig.json
```

---

## Response Codes

- `200 OK` - Successful GET/PUT
- `201 Created` - Successful POST
- `204 No Content` - Successful DELETE
- `400 Bad Request` - Invalid request body
- `404 Not Found` - Resource not found

---

## Notes

- **UUID Generation**: All IDs are generated using `uuid` v4
- **In-Memory Storage**: Data persists only while server is running
- **Validation**: Basic validation included; extend as needed
- **Debugging**: Request body logging middleware included for troubleshooting

---

## Next Steps

- [ ] Add database persistence (MongoDB, PostgreSQL, etc.)
- [ ] Add authentication/authorization
- [ ] Add input validation library (Zod, Joi)
- [ ] Add pagination for GET all endpoints
- [ ] Add filtering and search
- [ ] Add tests (Jest, Supertest)

---

## License

MIT
