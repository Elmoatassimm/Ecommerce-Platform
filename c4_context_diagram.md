# C4 Context Diagram (Level 1)

```mermaid
flowchart TB
    subgraph "E-commerce Platform"
        System["E-commerce Platform System"]
    end

    Customer["Customer\n(Person)"]
    StoreOwner["Store Owner\n(Person)"]
    MetaAPI["Meta API\n(External System)"]
    ChargiliAPI["Chargili Payment API\n(External System)"]
    
    Customer -->|"Browses products,\nplaces orders"| System
    StoreOwner -->|"Manages store,\nproducts, orders"| System
    System <-->|"Integrates with\nMessenger for chat commerce"| MetaAPI
    System <-->|"Processes payments"| ChargiliAPI

    classDef person fill:#08427B,color:white,stroke:none
    classDef system fill:#1168BD,color:white,stroke:none
    classDef external fill:#999999,color:white,stroke:none

    class Customer,StoreOwner person
    class System system
    class MetaAPI,ChargiliAPI external
```

This context diagram shows the high-level interactions between users (Customers and Store Owners) and external systems (Meta API for Messenger integration and Chargili Payment API) with the E-commerce Platform.
