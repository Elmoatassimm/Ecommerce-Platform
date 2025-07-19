# E-commerce Platform Architecture Documentation

This documentation provides a comprehensive view of the E-commerce Platform architecture using C4 model diagrams and system analysis.

## Table of Contents

1. [System Analysis](system_analysis.md) - Detailed analysis of the system architecture, design patterns, and components
2. [Context Diagram (Level 1)](c4_context_diagram.md) - High-level view of the system and its interactions with users and external systems
3. [Container Diagram (Level 2)](c4_container_diagram.md) - Shows the major containers (applications, data stores) that make up the system
4. [Component Diagram (Level 3)](c4_component_diagram.md) - Detailed view of components within the API application, including services, repositories, and design patterns
5. [Sequence Diagram](c4_sequence_diagram.md) - Illustrates the checkout process flow
6. [Data Flow Diagram](data_flow_diagram.md) - Shows how data flows through the system

## How to View the Diagrams

These diagrams are created using Mermaid, a markdown-based diagramming tool. You can view them:

1. Directly in GitHub, which supports Mermaid rendering
2. Using the Mermaid Live Editor: https://mermaid.live/
3. Using any Markdown viewer that supports Mermaid syntax

## System Overview

The E-commerce Platform is a comprehensive solution designed to enable store owners to manage their online stores, products, and orders. The platform supports multiple sales channels including a web platform and Facebook Messenger integration. It also provides payment processing capabilities through integration with the Chargili payment gateway.

## Key Components

- **Backend API**: Express.js application with TypeScript
- **Database**: MySQL with Prisma ORM
- **Caching**: Redis for performance optimization
- **External Integrations**: Meta API (Facebook Messenger), Chargili Payment API

## Design Patterns Used

1. **Repository Pattern**: Separates data access logic from business logic
2. **Dependency Injection**: Uses tsyringe for IoC container
3. **Factory Pattern**: PaymentFactory creates appropriate payment processors
4. **Strategy Pattern**: Different payment strategies (Cash on Delivery, Chargili Pay)
5. **Mediator Pattern**: CheckoutMediator coordinates the checkout process
6. **Decorator Pattern**: Product Cache Repository adds caching to the Product Repository
7. **Interface Segregation**: All repositories and services implement interfaces
