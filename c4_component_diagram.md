# C4 Component Diagram (Level 3)

```mermaidflowchart LR
    %% External Systems
        SPA["[System]</br>Single Page Application</br>(React)"]
        ChargilyAPI["[System]</br>Chargily Pay API</br>External Payment Gateway"]
        MetaMessengerAPI["[System]</br>Meta Messenger API</br>External Communication Service"]
  
    %% API Application Container with Technology Stack
    subgraph APIContainer ["[Container: API Application] Express.js REST API"]
      
         subgraph Controllers ["Controller Layer"]
            UserController["[Component]</br>User Controller</br>Handles user authentication and profile requests"]
            StoreController["[Component]</br>Store Controller</br>Handles store management requests"]
            ProductController["[Component]</br>Product Controller</br>Handles product CRUD operations"]
            CategoryController["[Component]</br>Category Controller</br>Handles category management"]
            OrderController["[Component]</br>Order Controller</br>Handles order processing requests"]
            PaymentController["[Component]</br>Payment Controller</br>Handles payment processing requests"]
            CustomerController["[Component]</br>Customer Controller</br>Handles customer data requests"]
            MetaController["[Component]</br>Meta Integration Controller</br>Handles Meta Messenger interactions"]
            WebhookController["[Component]</br>Webhook Controller</br>Handles external service callbacks"]
       end

        %% Service Layer - Component Level
        
            UserService["[Component]</br>User Service</br>Implements authentication & user management logic"]
            StoreService["[Component]</br>Store Service</br>Implements store business logic"]
            ProductService["[Component]</br>Product Service</br>Implements product & inventory management"]
            CategoryService["[Component]</br>Category Service</br>Implements category management logic"]
            OrderService["[Component]</br>Order Service</br>Implements order processing logic"]
            
            PaymentProcessor["[Component]</br>Payment Processor</br>This component handles all payment logic using the Strategy Pattern. It includes the PaymentService, which orchestrates the payment processing workflow, and the PaymentFactory, which dynamically selects and instantiates the appropriate payment strategy. Supported strategies include CashOnDelivery, which implements the logic for cash payments upon delivery, and ChargilyPayment, which handles online payments through the Chargily gateway"]
            
            CustomerService["[Component]</br>Customer Service</br>Implements customer management logic"]
            MetaService["[Component]</br>Meta Integration Service</br>Implements Messenger integration logic"]
            WebhookService["[Component]</br>Webhook Service</br>Implements webhook handling logic"]
            
            %% Mediator Pattern
            CheckoutMediator["[Component]</br>Checkout Mediator</br>Coordinates checkout process using Mediator Pattern"]
        

        %% Repository Layer - Component Level
            UserRepo["[Component]</br>User Repository</br>Data access for users"]
            StoreRepo["[Component]</br>Store Repository</br>Data access for stores"]
            ProductRepo["[Component]</br>Product Repository</br>Data access for products"]
            CategoryRepo["[Component]</br>Category Repository</br>Data access for categories"]
            OrderRepo["[Component]</br>Order Repository</br>Data access for orders"]
            PaymentRepo["[Component]</br>Payment Repository</br>Data access for payments"]
            CustomerRepo["[Component]</br>Customer Repository</br>Data access for customers"]
            MetaRepo["[Component]</br>Meta Repository</br>Data access for Meta integration"]
            RefreshTokenRepo["[Component]</br>Refresh Token Repository</br>Data access for refresh tokens"]
            ProductCacheRepo["[Component]</br>Product Cache Repository</br>Caching layer using Decorator Pattern"]
    end

    %% Data Storage Containers
        Database["[Container: Database]</br>MySQL Database</br>Stores application data"]
        Redis["[Container: Cache]</br>Redis Cache</br>Improves read performance"]
        ImageStorage["[Container: File Storage]</br>File System</br>Stores product images"]

    %% Relationships - SPA to Controllers
    SPA -->|"[Uses] Makes API calls via HTTP/REST"| Controllers

    %% Controller to Service relationships
    UserController -->|"[Uses]"| UserService
    StoreController -->|"[Uses]"| StoreService
    ProductController -->|"[Uses]"| ProductService
    CategoryController -->|"[Uses]"| CategoryService
    OrderController -->|"[Uses]"| OrderService
    PaymentController -->|"[Uses]"| PaymentProcessor
    CustomerController -->|"[Uses]"| CustomerService
    MetaController -->|"[Uses]"| MetaService
    WebhookController -->|"[Uses]"| WebhookService

    %% Payment Processor internals
    PaymentProcessor -->|"[Uses] API Calls"| ChargilyAPI

    %% Meta Service relationships
    MetaService -->|"[Uses] API Calls"| MetaMessengerAPI

    %% Service to Repository relationships with specific purposes
    UserService -->|"[Uses] "| UserRepo
    StoreService -->|"[Uses] "| StoreRepo
    ProductService -->|"[Uses] "| ProductRepo
    ProductService -->|"[Uses]"| ProductCacheRepo
    CategoryService -->|"[Uses] "| CategoryRepo
    OrderService -->|"[Uses] "| OrderRepo
    PaymentProcessor -->|"[Uses] "| PaymentRepo
    CustomerService -->|"[Uses] "| CustomerRepo
    MetaService -->|"[Uses] "| MetaRepo
    UserService -->|"[Uses]"| RefreshTokenRepo

    %% Mediator relationships with specific purposes
    CheckoutMediator -->|"[Uses] Validates customer data"| CustomerService
    CheckoutMediator -->|"[Uses] Checks inventory availability"| ProductService
    CheckoutMediator -->|" Uses to Creates and processes orders"| OrderService
    CheckoutMediator -->|"[Uses] Handles payment transactions"| PaymentProcessor

    %% Repository to Database relationships with specific tables
    UserRepo -->|"[Reads/Writes] "| Database
    StoreRepo -->|"[Reads/Writes] "| Database
    ProductRepo -->|"[Reads/Writes] "| Database
    CategoryRepo -->|"[Reads/Writes] "| Database
    OrderRepo -->|"[Reads/Writes] "| Database
    PaymentRepo -->|"[Reads/Writes] "| Database
    CustomerRepo -->|"[Reads/Writes] "| Database
    MetaRepo -->|"[Reads/Writes] "| Database
    RefreshTokenRepo -->|"[Reads/Writes]"| Database

    %% Cache relationships
    ProductCacheRepo -->|"[Reads/Writes]"| Redis
    ProductCacheRepo -->|"[Delegates to]"| ProductRepo

    %% Image storage relationships
    ProductService -->|"[Stores/Retrieves]"| ImageStorage

    classDef controller fill:#9575CD,color:white,stroke:none
    classDef service fill:#4FC3F7,color:white,stroke:none
    classDef repository fill:#81C784,color:white,stroke:none
    classDef dataAccess fill:#FF8A65,color:white,stroke:none
    classDef pattern fill:#F06292,color:white,stroke:none
    classDef external fill:#999999,color:white,stroke:none
    classDef storage fill:#FF8A65,color:white,stroke:none
    classDef spa fill:#FB8C00,color:white,stroke:none
    classDef boundary fill:none,stroke:#333,stroke-width:2,stroke-dasharray: 5 5
    classDef subgraphTitle fill:none,stroke:none,color:#333,font-weight:bold

    class UserController,StoreController,ProductController,CategoryController,OrderController,PaymentController,CustomerController,MetaController,WebhookController controller
    class UserService,StoreService,ProductService,CategoryService,OrderService,PaymentProcessor,CustomerService,MetaService,WebhookService service
    class UserRepo,StoreRepo,ProductRepo,CategoryRepo,OrderRepo,PaymentRepo,CustomerRepo,MetaRepo,RefreshTokenRepo,ProductCacheRepo repository
    class CheckoutMediator pattern
    class Database,Redis,ImageStorage storage
    class SPA spa
    class ChargilyAPI,MetaMessengerAPI external
    class Controllers,Services,Repositories,DataStorage,External,APIContainer subgraphTitle

```

This component diagram illustrates the internal architecture of the E-commerce Platform API application, highlighting:

## Services
- User Service: Handles user authentication and management
- Store Service: Manages store creation and configuration
- Product Service: Handles product CRUD operations
- Category Service: Manages product categories
- Order Service: Processes and manages orders
- Payment Service: Handles payment processing
- Customer Service: Manages customer information
- Meta Integration Service: Handles Facebook Messenger integration
- Webhook Service: Processes webhooks from external systems

## Repositories
- User Repository: Data access for users
- Store Repository: Data access for stores
- Product Repository: Data access for products
- Category Repository: Data access for categories
- Order Repository: Data access for orders
- Payment Repository: Data access for payments
- Customer Repository: Data access for customers
- Meta Repository: Data access for Meta integration
- Refresh Token Repository: Data access for refresh tokens
- Product Cache Repository: Caching layer for products

## Design Patterns
1. **Repository Pattern**: Separates data access logic from business logic
2. **Dependency Injection**: Uses tsyringe for IoC container
3. **Factory Pattern**: PaymentFactory creates appropriate payment processors
4. **Strategy Pattern**: Different payment strategies (Cash on Delivery, Chargili Pay)
5. **Mediator Pattern**: CheckoutMediator coordinates the checkout process
6. **Decorator Pattern**: Product Cache Repository adds caching to the Product Repository
7. **Interface Segregation**: All repositories and services implement interfaces
