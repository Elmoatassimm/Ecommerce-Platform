# Data Flow Diagram

```mermaid
flowchart TD
    Customer([Customer]) --> |Browse Products| API
    Customer --> |Place Order| API
    StoreOwner([Store Owner]) --> |Manage Store| API
    StoreOwner --> |Manage Products| API
    StoreOwner --> |View Orders| API
    
    subgraph API[API Layer]
        Controllers[Controllers]
    end
    
    subgraph BusinessLogic[Business Logic Layer]
        Services[Services]
        Mediator[Checkout Mediator]
        PaymentFactory[Payment Factory]
    end
    
    subgraph DataAccess[Data Access Layer]
        Repositories[Repositories]
        Cache[Redis Cache]
    end
    
    subgraph Storage[Storage Layer]
        Database[(MySQL Database)]
    end
    
    subgraph ExternalSystems[External Systems]
        MetaAPI[Meta API]
        ChargiliAPI[Chargili Payment API]
    end
    
    API --> |Request Processing| BusinessLogic
    BusinessLogic --> |Data Operations| DataAccess
    DataAccess --> |Cache Operations| Cache
    DataAccess --> |CRUD Operations| Storage
    BusinessLogic --> |Messenger Integration| ExternalSystems
    BusinessLogic --> |Payment Processing| ExternalSystems
    
    %% Return flows
    Storage --> |Data Retrieval| DataAccess
    Cache --> |Cached Data| DataAccess
    DataAccess --> |Data Results| BusinessLogic
    BusinessLogic --> |Response Data| API
    API --> |API Response| Customer
    API --> |API Response| StoreOwner
    ExternalSystems --> |Integration Response| BusinessLogic
    
    classDef external fill:#999999,color:white,stroke:none
    classDef user fill:#08427B,color:white,stroke:none
    classDef api fill:#9575CD,color:white,stroke:none
    classDef business fill:#4FC3F7,color:white,stroke:none
    classDef data fill:#81C784,color:white,stroke:none
    classDef storage fill:#FF8A65,color:white,stroke:none
    
    class Customer,StoreOwner user
    class API,Controllers api
    class BusinessLogic,Services,Mediator,PaymentFactory business
    class DataAccess,Repositories,Cache data
    class Storage,Database storage
    class ExternalSystems,MetaAPI,ChargiliAPI external
```

This data flow diagram illustrates how data moves through the E-commerce Platform system, from user interactions through the various layers of the application to the database and external systems.
