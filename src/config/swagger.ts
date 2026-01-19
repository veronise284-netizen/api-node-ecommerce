import swaggerJsdoc from 'swagger-jsdoc';

interface SwaggerOptions {
  definition: any;
  apis: string[];
}

const swaggerOptions: SwaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'E-Commerce API Documentation',
      version: '1.0.0',
      description: `        
      `,
      contact: {
        name: 'API Support',
        email: 'support@ecommerce.com'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: [
      {
        url: 'https://api-node-ecommerce-0mh7.onrender.com',
        description: 'production server'

      },
      {
        url: 'https://api.ecommerce.com',
        description: 'Production server'
      }
    ],
    tags: [
      {
        name: 'Authentication',
        description: 'User authentication and authorization endpoints'
      },
      {
        name: 'Users',
        description: 'User management endpoints (admin access)'
      },
      {
        name: 'Categories',
        description: 'Product category management'
      },
      {
        name: 'Products',
        description: 'Product management with vendor ownership'
      },
      {
        name: 'Cart',
        description: 'Shopping cart operations'
      },
      {
        name: 'Orders',
        description: 'Order placement and management'
      },
      {
        name: 'Admin',
        description: 'Admin-only operations'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter your JWT token in the format: Bearer <token>'
        }
      },
      schemas: {
        // User schemas
        User: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              example: '507f1f77bcf86cd799439011'
            },
            firstName: {
              type: 'string',
              example: 'John'
            },
            lastName: {
              type: 'string',
              example: 'Doe'
            },
            email: {
              type: 'string',
              format: 'email',
              example: 'john.doe@example.com'
            },
            role: {
              type: 'string',
              enum: ['admin', 'vendor', 'customer'],
              example: 'customer'
            },
            createdAt: {
              type: 'string',
              format: 'date-time'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time'
            }
          }
        },
        RegisterRequest: {
          type: 'object',
          required: ['firstName', 'lastName', 'email', 'password'],
          properties: {
            firstName: {
              type: 'string',
              example: 'John'
            },
            lastName: {
              type: 'string',
              example: 'Doe'
            },
            email: {
              type: 'string',
              format: 'email',
              example: 'john.doe@example.com'
            },
            password: {
              type: 'string',
              format: 'password',
              minLength: 8,
              example: 'Password123!'
            },
            role: {
              type: 'string',
              enum: ['vendor', 'customer'],
              example: 'customer',
              description: 'Optional. Defaults to customer. Admin role cannot be assigned via registration.'
            }
          }
        },
        LoginRequest: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: {
              type: 'string',
              format: 'email',
              example: 'john.customer@example.com'
            },
            password: {
              type: 'string',
              format: 'password',
              example: 'Customer123!'
            }
          }
        },
        AuthResponse: {
          type: 'object',
          properties: {
            message: {
              type: 'string',
              example: 'Login successful'
            },
            token: {
              type: 'string',
              example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
            },
            user: {
              $ref: '#/components/schemas/User'
            }
          }
        },
        
        // Category schemas
        Category: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              example: '507f1f77bcf86cd799439011'
            },
            name: {
              type: 'string',
              example: 'Electronics'
            },
            slug: {
              type: 'string',
              example: 'electronics'
            },
            description: {
              type: 'string',
              example: 'Electronic devices and accessories'
            },
            createdAt: {
              type: 'string',
              format: 'date-time'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time'
            }
          }
        },
        CategoryRequest: {
          type: 'object',
          required: ['name'],
          properties: {
            name: {
              type: 'string',
              example: 'Electronics'
            },
            description: {
              type: 'string',
              example: 'Electronic devices and accessories'
            }
          }
        },
        
        // Product schemas
        Product: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              example: '507f1f77bcf86cd799439011'
            },
            name: {
              type: 'string',
              example: 'Laptop Pro 15'
            },
            slug: {
              type: 'string',
              example: 'laptop-pro-15'
            },
            description: {
              type: 'string',
              example: 'High-performance laptop with 15-inch display'
            },
            price: {
              type: 'number',
              format: 'float',
              example: 1299.99
            },
            categoryId: {
              type: 'string',
              example: '507f1f77bcf86cd799439011'
            },
            stock: {
              type: 'number',
              example: 50
            },
            createdBy: {
              type: 'string',
              example: '507f1f77bcf86cd799439011',
              description: 'User ID of the vendor who created this product'
            },
            createdAt: {
              type: 'string',
              format: 'date-time'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time'
            }
          }
        },
        ProductRequest: {
          type: 'object',
          required: ['name', 'price', 'categoryId', 'stock'],
          properties: {
            name: {
              type: 'string',
              example: 'Laptop Pro 15'
            },
            description: {
              type: 'string',
              example: 'High-performance laptop with 15-inch display'
            },
            price: {
              type: 'number',
              format: 'float',
              example: 1299.99,
              minimum: 0
            },
            categoryId: {
              type: 'string',
              example: '507f1f77bcf86cd799439011'
            },
            stock: {
              type: 'number',
              example: 50,
              minimum: 0
            }
          }
        },
        
        // Cart schemas
        CartItem: {
          type: 'object',
          properties: {
            productId: {
              $ref: '#/components/schemas/Product'
            },
            quantity: {
              type: 'number',
              example: 2
            },
            subtotal: {
              type: 'number',
              format: 'float',
              example: 59.98
            }
          }
        },
        Cart: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              example: '507f1f77bcf86cd799439011'
            },
            userId: {
              type: 'string',
              example: '507f1f77bcf86cd799439011'
            },
            items: {
              type: 'array',
              items: {
                $ref: '#/components/schemas/CartItem'
              }
            },
            totalAmount: {
              type: 'number',
              format: 'float',
              example: 159.97
            },
            createdAt: {
              type: 'string',
              format: 'date-time'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time'
            }
          }
        },
        AddToCartRequest: {
          type: 'object',
          required: ['productId', 'quantity'],
          properties: {
            productId: {
              type: 'string',
              example: '507f1f77bcf86cd799439011'
            },
            quantity: {
              type: 'number',
              example: 2,
              minimum: 1
            }
          }
        },
        UpdateCartRequest: {
          type: 'object',
          required: ['quantity'],
          properties: {
            quantity: {
              type: 'number',
              example: 3,
              minimum: 1
            }
          }
        },
        
        // Order schemas
        OrderItem: {
          type: 'object',
          properties: {
            productId: {
              type: 'string',
              example: '507f1f77bcf86cd799439011'
            },
            name: {
              type: 'string',
              example: 'Laptop Pro 15'
            },
            price: {
              type: 'number',
              format: 'float',
              example: 1299.99
            },
            quantity: {
              type: 'number',
              example: 1
            },
            subtotal: {
              type: 'number',
              format: 'float',
              example: 1299.99
            }
          }
        },
        Order: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              example: '507f1f77bcf86cd799439011'
            },
            userId: {
              type: 'string',
              example: '507f1f77bcf86cd799439011'
            },
            items: {
              type: 'array',
              items: {
                $ref: '#/components/schemas/OrderItem'
              }
            },
            totalAmount: {
              type: 'number',
              format: 'float',
              example: 1299.99
            },
            status: {
              type: 'string',
              enum: ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'],
              example: 'pending'
            },
            createdAt: {
              type: 'string',
              format: 'date-time'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time'
            }
          }
        },
        UpdateOrderStatusRequest: {
          type: 'object',
          required: ['status'],
          properties: {
            status: {
              type: 'string',
              enum: ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'],
              example: 'confirmed'
            }
          }
        },
        
        // Common schemas
        SuccessResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true
            },
            message: {
              type: 'string',
              example: 'Operation successful'
            }
          }
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false
            },
            message: {
              type: 'string',
              example: 'Error message'
            },
            error: {
              type: 'string',
              example: 'Detailed error information'
            }
          }
        }
      },
      responses: {
        UnauthorizedError: {
          description: 'Authentication required or token invalid',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse'
              },
              example: {
                message: 'No token provided, authorization denied'
              }
            }
          }
        },
        ForbiddenError: {
          description: 'Insufficient permissions',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse'
              },
              example: {
                message: 'Access denied. Admin privileges required.'
              }
            }
          }
        },
        NotFoundError: {
          description: 'Resource not found',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse'
              },
              example: {
                message: 'Resource not found'
              }
            }
          }
        },
        BadRequestError: {
          description: 'Invalid request data',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse'
              },
              example: {
                message: 'Validation error',
                error: 'Invalid input data'
              }
            }
          }
        }
      }
    }
  },
  apis: ['./src/routes/*.ts'] // Path to the API routes with JSDoc comments
};

export const swaggerSpec = swaggerJsdoc(swaggerOptions);
