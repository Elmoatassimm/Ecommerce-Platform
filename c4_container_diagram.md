# C4 Container Diagram (Level 2)

```mermaid
flowchart TB
    %% People/Actors
    Customer["Customer\n[Person]\nA user who browses products\nand places orders"]
    StoreOwner["Store Owner\n[Person]\nA merchant who manages\ntheir online store"]

    %% External Systems
    MetaAPI["Meta API\n[External System]\nFacebook Messenger platform\nfor chat commerce"]
    ChargiliAPI["Chargili Payment API\n[External System]\nPayment processing service"]

    subgraph "E-commerce Platform\n[Software System]"
        %% Containers
        SPA["Single Page Application\n[Container: React]\nProvides e-commerce functionality\nto customers via web browser"]
        API["API Application\n[Container: Express.js]\nProvides e-commerce functionality\nvia JSON/HTTPS API"]
        Database["Database\n[Container: MySQL]\nStores user, product,\norder and payment information"]
        Cache["Cache\n[Container: Redis]\nCaches product data\nfor improved performance"]
        ImageStorage["Image Storage\n[Container: File System]\nStores product images\nand other media files"]

        %% Internal relationships
        SPA -->|"Makes API calls to\n[JSON/HTTPS]"| API
        API -->|"Reads from and writes to\n[SQL/TCP]"| Database
        API -->|"Reads from and writes to\n[Redis Protocol]"| Cache
        API -->|"Reads from and writes to\n[File I/O]"| ImageStorage
    end

    %% External relationships
    Customer -->|"Visits e-commerce website\nusing\n[HTTPS]"| SPA
    StoreOwner -->|"Manages store using\n[HTTPS]"| SPA
    Customer -->|"Places orders via\nMessenger\n[HTTPS]"| MetaAPI
    MetaAPI -->|"Sends messages to\n[Webhooks/HTTPS]"| API
    API -->|"Sends messages to\n[REST/HTTPS]"| MetaAPI
    API -->|"Processes payments using\n[REST/HTTPS]"| ChargiliAPI
    ChargiliAPI -->|"Sends payment notifications to\n[Webhooks/HTTPS]"| API

    %% Styling
    classDef person fill:#08427B,color:white,stroke:none
    classDef system fill:#1168BD,color:white,stroke:none
    classDef external fill:#999999,color:white,stroke:none
    classDef container fill:#438DD5,color:white,stroke:none
    classDef database fill:#438DD5,color:white,stroke:none

    class Customer,StoreOwner person
    class SPA,API,ImageStorage container
    class Database,Cache database
    class MetaAPI,ChargiliAPI external
```

This container diagram shows the main components of the E-commerce Platform:

1. **Single Page Application (React)** - Provides the user interface for customers and store owners
2. **API Application (Express.js)** - Handles all business logic and API requests
3. **Database (MySQL)** - Stores user, product, order, and payment information
4. **Cache (Redis)** - Provides caching for improved performance
5. **Image Storage (File System)** - Stores product images and other media files

The diagram follows the C4 model notation guidelines:
- Each element includes its type (Person, Container, External System)
- Each element has a short description of its responsibilities
- Each container specifies its technology
- All relationships are labeled with descriptions and technologies/protocols
- Relationships show clear direction and intent
