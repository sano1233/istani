# Cursor-Style AI Code Generation Examples

This guide provides practical examples of using GitHub Copilot to generate Java code with plain English descriptions.

## Table of Contents

1. [REST API Endpoint Generation](#rest-api-endpoint-generation)
2. [Database Entity Creation](#database-entity-creation)
3. [Repository Layer](#repository-layer)
4. [Service Layer with Business Logic](#service-layer-with-business-logic)
5. [Unit Test Generation](#unit-test-generation)
6. [Integration Test Setup](#integration-test-setup)
7. [Advanced Examples](#advanced-examples)

---

## REST API Endpoint Generation

### Example 1: Basic CRUD Controller

**Prompt as a comment:**

```java
// Create a REST controller for managing products with endpoints for:
// - GET /api/products - list all products
// - GET /api/products/{id} - get product by ID
// - POST /api/products - create new product
// - PUT /api/products/{id} - update existing product
// - DELETE /api/products/{id} - delete product
```

**Expected Copilot output:**

```java
package com.example.controller;

import com.example.model.Product;
import com.example.service.ProductService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/products")
public class ProductController {

    @Autowired
    private ProductService productService;

    @GetMapping
    public ResponseEntity<List<Product>> getAllProducts() {
        List<Product> products = productService.findAll();
        return ResponseEntity.ok(products);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Product> getProductById(@PathVariable Long id) {
        Product product = productService.findById(id);
        return ResponseEntity.ok(product);
    }

    @PostMapping
    public ResponseEntity<Product> createProduct(@RequestBody Product product) {
        Product created = productService.create(product);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Product> updateProduct(@PathVariable Long id, @RequestBody Product product) {
        Product updated = productService.update(id, product);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProduct(@PathVariable Long id) {
        productService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
```

### Example 2: Controller with Validation

**Prompt:**

```java
// Create a UserController with validation:
// - POST /api/users - create user with @Valid annotation
// - Handle validation errors with @ExceptionHandler
// - Return proper HTTP status codes
```

**Expected output:**

```java
package com.example.controller;

import com.example.dto.UserDTO;
import com.example.exception.ValidationException;
import com.example.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserService userService;

    @PostMapping
    public ResponseEntity<UserDTO> createUser(@Valid @RequestBody UserDTO userDTO, BindingResult result) {
        if (result.hasErrors()) {
            throw new ValidationException("Validation failed", result);
        }
        UserDTO created = userService.create(userDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @ExceptionHandler(ValidationException.class)
    public ResponseEntity<Map<String, String>> handleValidationException(ValidationException ex) {
        Map<String, String> errors = new HashMap<>();
        ex.getBindingResult().getFieldErrors().forEach(error -> 
            errors.put(error.getField(), error.getDefaultMessage())
        );
        return ResponseEntity.badRequest().body(errors);
    }
}
```

---

## Database Entity Creation

### Example 3: JPA Entity with Relationships

**Prompt:**

```java
// Create a Product entity with:
// - id (Long, auto-generated)
// - name (String, not null)
// - description (String)
// - price (BigDecimal, not null)
// - category (ManyToOne relationship with Category)
// - createdAt and updatedAt timestamps
// - Include getters, setters, and builder pattern
```

**Expected output:**

```java
package com.example.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import javax.persistence.*;
import javax.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "products")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull
    @Column(nullable = false)
    private String name;

    @Column(length = 1000)
    private String description;

    @NotNull
    @Column(nullable = false)
    private BigDecimal price;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id")
    private Category category;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
```

### Example 4: Entity with Embedded Value Object

**Prompt:**

```java
// Create a User entity with:
// - id, username, email
// - embedded Address (street, city, state, zipCode)
// - List of orders (OneToMany relationship)
```

**Expected output:**

```java
package com.example.model;

import lombok.Data;

import javax.persistence.*;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "users")
@Data
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String username;

    @Column(unique = true, nullable = false)
    private String email;

    @Embedded
    private Address address;

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Order> orders = new ArrayList<>();
}

@Embeddable
@Data
class Address {
    private String street;
    private String city;
    private String state;
    private String zipCode;
}
```

---

## Repository Layer

### Example 5: Spring Data JPA Repository

**Prompt:**

```java
// Create a ProductRepository interface extending JpaRepository with custom queries:
// - Find products by category
// - Find products by price range
// - Find products by name containing (case insensitive)
// - Find top 10 products ordered by price descending
```

**Expected output:**

```java
package com.example.repository;

import com.example.model.Category;
import com.example.model.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {

    List<Product> findByCategory(Category category);

    List<Product> findByPriceBetween(BigDecimal minPrice, BigDecimal maxPrice);

    List<Product> findByNameContainingIgnoreCase(String name);

    @Query("SELECT p FROM Product p ORDER BY p.price DESC")
    List<Product> findTop10ByOrderByPriceDesc();

    @Query("SELECT p FROM Product p WHERE p.category.id = :categoryId AND p.price <= :maxPrice")
    List<Product> findByCategoryAndMaxPrice(@Param("categoryId") Long categoryId, 
                                           @Param("maxPrice") BigDecimal maxPrice);
}
```

---

## Service Layer with Business Logic

### Example 6: Service with Transaction Management

**Prompt:**

```java
// Create a ProductService with:
// - findAll, findById, create, update, delete methods
// - Transactional operations
// - Custom exception handling (ProductNotFoundException)
// - Business validation (price must be positive)
```

**Expected output:**

```java
package com.example.service;

import com.example.exception.ProductNotFoundException;
import com.example.model.Product;
import com.example.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
@Transactional(readOnly = true)
public class ProductService {

    @Autowired
    private ProductRepository productRepository;

    public List<Product> findAll() {
        return productRepository.findAll();
    }

    public Product findById(Long id) {
        return productRepository.findById(id)
            .orElseThrow(() -> new ProductNotFoundException("Product not found with id: " + id));
    }

    @Transactional
    public Product create(Product product) {
        validatePrice(product.getPrice());
        return productRepository.save(product);
    }

    @Transactional
    public Product update(Long id, Product product) {
        Product existing = findById(id);
        validatePrice(product.getPrice());
        
        existing.setName(product.getName());
        existing.setDescription(product.getDescription());
        existing.setPrice(product.getPrice());
        existing.setCategory(product.getCategory());
        
        return productRepository.save(existing);
    }

    @Transactional
    public void delete(Long id) {
        Product product = findById(id);
        productRepository.delete(product);
    }

    private void validatePrice(BigDecimal price) {
        if (price == null || price.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Price must be positive");
        }
    }
}
```

### Example 7: Service with Complex Business Logic

**Prompt:**

```java
// Create an OrderService with:
// - placeOrder method that creates order and reduces product inventory
// - cancelOrder method with refund logic
// - calculateTotal method considering discounts
// - All operations should be transactional
```

**Expected output:**

```java
package com.example.service;

import com.example.model.Order;
import com.example.model.OrderItem;
import com.example.model.Product;
import com.example.repository.OrderRepository;
import com.example.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
@Transactional
public class OrderService {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private ProductRepository productRepository;

    public Order placeOrder(Order order) {
        BigDecimal total = calculateTotal(order.getItems());
        order.setTotal(total);
        
        // Reduce inventory
        for (OrderItem item : order.getItems()) {
            Product product = productRepository.findById(item.getProduct().getId())
                .orElseThrow(() -> new IllegalArgumentException("Product not found"));
            
            if (product.getInventory() < item.getQuantity()) {
                throw new IllegalStateException("Insufficient inventory for product: " + product.getName());
            }
            
            product.setInventory(product.getInventory() - item.getQuantity());
            productRepository.save(product);
        }
        
        return orderRepository.save(order);
    }

    public void cancelOrder(Long orderId) {
        Order order = orderRepository.findById(orderId)
            .orElseThrow(() -> new IllegalArgumentException("Order not found"));
        
        if (!"PENDING".equals(order.getStatus())) {
            throw new IllegalStateException("Only pending orders can be cancelled");
        }
        
        // Restore inventory
        for (OrderItem item : order.getItems()) {
            Product product = item.getProduct();
            product.setInventory(product.getInventory() + item.getQuantity());
            productRepository.save(product);
        }
        
        order.setStatus("CANCELLED");
        orderRepository.save(order);
    }

    private BigDecimal calculateTotal(List<OrderItem> items) {
        BigDecimal total = BigDecimal.ZERO;
        
        for (OrderItem item : items) {
            BigDecimal itemTotal = item.getProduct().getPrice()
                .multiply(BigDecimal.valueOf(item.getQuantity()));
            
            // Apply discount if applicable
            if (item.getDiscount() != null) {
                BigDecimal discount = itemTotal.multiply(item.getDiscount())
                    .divide(BigDecimal.valueOf(100));
                itemTotal = itemTotal.subtract(discount);
            }
            
            total = total.add(itemTotal);
        }
        
        return total;
    }
}
```

---

## Unit Test Generation

### Example 8: Service Layer Unit Tests

**Prompt:**

```java
// Create unit tests for ProductService using JUnit 5 and Mockito:
// - Test findById with existing product
// - Test findById with non-existing product (should throw exception)
// - Test create with valid product
// - Test create with invalid price (should throw exception)
```

**Expected output:**

```java
package com.example.service;

import com.example.exception.ProductNotFoundException;
import com.example.model.Product;
import com.example.repository.ProductRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ProductServiceTest {

    @Mock
    private ProductRepository productRepository;

    @InjectMocks
    private ProductService productService;

    private Product testProduct;

    @BeforeEach
    void setUp() {
        testProduct = Product.builder()
            .id(1L)
            .name("Test Product")
            .description("Test Description")
            .price(new BigDecimal("99.99"))
            .build();
    }

    @Test
    void testFindById_ExistingProduct_ReturnsProduct() {
        // Arrange
        when(productRepository.findById(1L)).thenReturn(Optional.of(testProduct));

        // Act
        Product result = productService.findById(1L);

        // Assert
        assertNotNull(result);
        assertEquals(testProduct.getId(), result.getId());
        assertEquals(testProduct.getName(), result.getName());
        verify(productRepository, times(1)).findById(1L);
    }

    @Test
    void testFindById_NonExistingProduct_ThrowsException() {
        // Arrange
        when(productRepository.findById(999L)).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(ProductNotFoundException.class, () -> {
            productService.findById(999L);
        });
        verify(productRepository, times(1)).findById(999L);
    }

    @Test
    void testCreate_ValidProduct_ReturnsCreatedProduct() {
        // Arrange
        when(productRepository.save(any(Product.class))).thenReturn(testProduct);

        // Act
        Product result = productService.create(testProduct);

        // Assert
        assertNotNull(result);
        assertEquals(testProduct.getName(), result.getName());
        verify(productRepository, times(1)).save(testProduct);
    }

    @Test
    void testCreate_InvalidPrice_ThrowsException() {
        // Arrange
        Product invalidProduct = Product.builder()
            .name("Invalid Product")
            .price(new BigDecimal("-10.00"))
            .build();

        // Act & Assert
        assertThrows(IllegalArgumentException.class, () -> {
            productService.create(invalidProduct);
        });
        verify(productRepository, never()).save(any(Product.class));
    }
}
```

### Example 9: Controller Unit Tests

**Prompt:**

```java
// Create unit tests for ProductController using MockMvc:
// - Test GET /api/products returns 200 and list of products
// - Test GET /api/products/{id} returns 200 with product
// - Test POST /api/products returns 201 with created product
// - Test DELETE /api/products/{id} returns 204
```

**Expected output:**

```java
package com.example.controller;

import com.example.model.Product;
import com.example.service.ProductService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.util.Arrays;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(ProductController.class)
class ProductControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private ProductService productService;

    @Test
    void testGetAllProducts_ReturnsOkAndList() throws Exception {
        // Arrange
        List<Product> products = Arrays.asList(
            Product.builder().id(1L).name("Product 1").price(new BigDecimal("10.00")).build(),
            Product.builder().id(2L).name("Product 2").price(new BigDecimal("20.00")).build()
        );
        when(productService.findAll()).thenReturn(products);

        // Act & Assert
        mockMvc.perform(get("/api/products"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.length()").value(2))
            .andExpect(jsonPath("$[0].name").value("Product 1"));
    }

    @Test
    void testGetProductById_ReturnsOkAndProduct() throws Exception {
        // Arrange
        Product product = Product.builder()
            .id(1L)
            .name("Test Product")
            .price(new BigDecimal("99.99"))
            .build();
        when(productService.findById(1L)).thenReturn(product);

        // Act & Assert
        mockMvc.perform(get("/api/products/1"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.id").value(1))
            .andExpect(jsonPath("$.name").value("Test Product"));
    }

    @Test
    void testCreateProduct_ReturnsCreatedAndProduct() throws Exception {
        // Arrange
        Product product = Product.builder()
            .name("New Product")
            .price(new BigDecimal("49.99"))
            .build();
        Product created = Product.builder()
            .id(1L)
            .name("New Product")
            .price(new BigDecimal("49.99"))
            .build();
        when(productService.create(any(Product.class))).thenReturn(created);

        // Act & Assert
        mockMvc.perform(post("/api/products")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(product)))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.id").value(1))
            .andExpect(jsonPath("$.name").value("New Product"));
    }

    @Test
    void testDeleteProduct_ReturnsNoContent() throws Exception {
        // Act & Assert
        mockMvc.perform(delete("/api/products/1"))
            .andExpect(status().isNoContent());
    }
}
```

---

## Integration Test Setup

### Example 10: Integration Test with Test Database

**Prompt:**

```java
// Create an integration test for ProductRepository:
// - Use @SpringBootTest and @AutoConfigureTestDatabase
// - Test saving and retrieving products
// - Test custom query methods
// - Clean up data after each test
```

**Expected output:**

```java
package com.example.repository;

import com.example.model.Category;
import com.example.model.Product;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;

import java.math.BigDecimal;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@DataJpaTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
class ProductRepositoryIntegrationTest {

    @Autowired
    private TestEntityManager entityManager;

    @Autowired
    private ProductRepository productRepository;

    private Category testCategory;
    private Product testProduct;

    @BeforeEach
    void setUp() {
        testCategory = Category.builder()
            .name("Electronics")
            .build();
        entityManager.persist(testCategory);

        testProduct = Product.builder()
            .name("Laptop")
            .description("High-performance laptop")
            .price(new BigDecimal("999.99"))
            .category(testCategory)
            .build();
    }

    @AfterEach
    void tearDown() {
        productRepository.deleteAll();
    }

    @Test
    void testSaveAndRetrieveProduct() {
        // Act
        Product saved = productRepository.save(testProduct);
        Product retrieved = productRepository.findById(saved.getId()).orElse(null);

        // Assert
        assertNotNull(retrieved);
        assertEquals(testProduct.getName(), retrieved.getName());
        assertEquals(testProduct.getPrice(), retrieved.getPrice());
    }

    @Test
    void testFindByCategory() {
        // Arrange
        productRepository.save(testProduct);

        // Act
        List<Product> products = productRepository.findByCategory(testCategory);

        // Assert
        assertFalse(products.isEmpty());
        assertEquals(1, products.size());
        assertEquals(testProduct.getName(), products.get(0).getName());
    }

    @Test
    void testFindByPriceBetween() {
        // Arrange
        productRepository.save(testProduct);

        // Act
        List<Product> products = productRepository.findByPriceBetween(
            new BigDecimal("500.00"), 
            new BigDecimal("1500.00")
        );

        // Assert
        assertFalse(products.isEmpty());
        assertEquals(1, products.size());
    }

    @Test
    void testFindByNameContainingIgnoreCase() {
        // Arrange
        productRepository.save(testProduct);

        // Act
        List<Product> products = productRepository.findByNameContainingIgnoreCase("laptop");

        // Assert
        assertFalse(products.isEmpty());
        assertEquals(1, products.size());
        assertEquals(testProduct.getName(), products.get(0).getName());
    }
}
```

---

## Advanced Examples

### Example 11: REST API with Pagination and Sorting

**Prompt:**

```java
// Create a ProductController endpoint with pagination and sorting:
// - GET /api/products with Pageable parameter
// - Support page, size, and sort query parameters
// - Return Page<Product> with metadata
```

**Expected output:**

```java
package com.example.controller;

import com.example.model.Product;
import com.example.service.ProductService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/products")
public class ProductController {

    @Autowired
    private ProductService productService;

    @GetMapping
    public ResponseEntity<Page<Product>> getAllProducts(
        @PageableDefault(size = 10, sort = "name", direction = Sort.Direction.ASC) Pageable pageable
    ) {
        Page<Product> products = productService.findAll(pageable);
        return ResponseEntity.ok(products);
    }

    @GetMapping("/search")
    public ResponseEntity<Page<Product>> searchProducts(
        @RequestParam String query,
        @PageableDefault(size = 10) Pageable pageable
    ) {
        Page<Product> products = productService.search(query, pageable);
        return ResponseEntity.ok(products);
    }
}
```

### Example 12: Global Exception Handler

**Prompt:**

```java
// Create a global exception handler with @ControllerAdvice:
// - Handle ProductNotFoundException (return 404)
// - Handle ValidationException (return 400)
// - Handle generic exceptions (return 500)
// - Return consistent error response structure
```

**Expected output:**

```java
package com.example.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.context.request.WebRequest;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@ControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(ProductNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleProductNotFoundException(
        ProductNotFoundException ex, WebRequest request
    ) {
        ErrorResponse error = ErrorResponse.builder()
            .timestamp(LocalDateTime.now())
            .status(HttpStatus.NOT_FOUND.value())
            .error("Not Found")
            .message(ex.getMessage())
            .path(request.getDescription(false))
            .build();
        
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
    }

    @ExceptionHandler(ValidationException.class)
    public ResponseEntity<ErrorResponse> handleValidationException(
        ValidationException ex, WebRequest request
    ) {
        Map<String, String> fieldErrors = new HashMap<>();
        ex.getBindingResult().getFieldErrors().forEach(error -> 
            fieldErrors.put(error.getField(), error.getDefaultMessage())
        );

        ErrorResponse error = ErrorResponse.builder()
            .timestamp(LocalDateTime.now())
            .status(HttpStatus.BAD_REQUEST.value())
            .error("Validation Failed")
            .message(ex.getMessage())
            .path(request.getDescription(false))
            .fieldErrors(fieldErrors)
            .build();
        
        return ResponseEntity.badRequest().body(error);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGenericException(
        Exception ex, WebRequest request
    ) {
        ErrorResponse error = ErrorResponse.builder()
            .timestamp(LocalDateTime.now())
            .status(HttpStatus.INTERNAL_SERVER_ERROR.value())
            .error("Internal Server Error")
            .message("An unexpected error occurred")
            .path(request.getDescription(false))
            .build();
        
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
    }
}
```

---

## Tips for Effective Copilot Usage

### 1. Be Specific
Instead of: `// Create a controller`
Use: `// Create a REST controller for user management with GET, POST, PUT, DELETE endpoints`

### 2. Include Context
Mention frameworks, patterns, and conventions:
```java
// Create a Spring Boot service class using constructor injection and @Transactional
```

### 3. Break Down Complex Tasks
For large features, use multiple smaller prompts:
```java
// Step 1: Create the entity
// Step 2: Create the repository
// Step 3: Create the service
// Step 4: Create the controller
```

### 4. Review and Refine
Always review Copilot's suggestions. Press **Tab** to accept, **Esc** to reject, or edit as needed.

### 5. Use Copilot Chat for Explanations
Ask Copilot to explain code:
- "Explain what this method does"
- "How can I optimize this query?"
- "What are the potential issues with this code?"

---

## Summary

This guide demonstrates how to use GitHub Copilot to generate production-ready Java code for Spring Boot applications. The automation system will:

✅ Auto-format all generated code with Google Java Format  
✅ Run SpotBugs to detect security issues  
✅ Execute tests automatically  
✅ Commit fixes back to your PR  
✅ Enable auto-merge when all checks pass  

Start with simple prompts and gradually tackle more complex implementations. The more context you provide, the better Copilot's suggestions will be!
