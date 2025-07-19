import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcryptjs";
import { Prisma } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const password_hash = await bcrypt.hash("password", 10);
  // Create a user
  const user = await prisma.user.create({
    data: {
      username: "store_ownnnner",
      email: "owner@exampppppple.com",
      password_hash: password_hash,
    },
  });

  // Create a store
  const store = await prisma.store.create({
    data: {
      name: "My Awesome Store",
      description: "Sample store for testing purposes",
      owner_id: user.id,
      meta_integration_status: true,
      payment_setup_status: true,
    },
  });

  // Create categories
  const categories = await prisma.category.createMany({
    data: [
      {
        store_id: store.id,
        name: "Electronics",
      },
      {
        store_id: store.id,
        name: "Clothing",
      },
    ],
  });

  // Create products
  const products = await prisma.product.createMany({
    data: [
      {
        store_id: store.id,
        name: "Smartphone",
        description: "Latest model smartphone",
        price: 599.99,
        category_id: (await prisma.category.findFirst({
          where: { name: "Electronics" },
        }))!.id,
        inventory_count: 50,
        images: ["1738443877695-565753061.png", "1738443877695-565753061.png"],
      },
      {
        store_id: store.id,
        name: "T-Shirt",
        description: "Cotton t-shirt",
        price: 29.99,
        category_id: (await prisma.category.findFirst({
          where: { name: "Clothing" },
        }))!.id,
        inventory_count: 100,
        images: ["1738443877695-565753061.png"],
      },
      {
        store_id: store.id,
        name: "T-Shirt",
        description: "Cotton t-shirt",
        price: 29.99,
        category_id: (await prisma.category.findFirst({
          where: { name: "Clothing" },
        }))!.id,
        inventory_count: 100,
        images: ["1738443877695-565753061.png"],
      },
      {
        store_id: store.id,
        name: "T-Shirt",
        description: "Cotton t-shirt",
        price: 29.99,
        category_id: (await prisma.category.findFirst({
          where: { name: "Clothing" },
        }))!.id,
        inventory_count: 100,
        images: ["1738443877695-565753061.png"],
      },
      {
        store_id: store.id,
        name: "T-Shirt",
        description: "Cotton t-shirt",
        price: 29.99,
        category_id: (await prisma.category.findFirst({
          where: { name: "Clothing" },
        }))!.id,
        inventory_count: 100,
        images: ["1738443877695-565753061.png"],
      },
      {
        store_id: store.id,
        name: "T-Shirt",
        description: "Cotton t-shirt",
        price: 29.99,
        category_id: (await prisma.category.findFirst({
          where: { name: "Clothing" },
        }))!.id,
        inventory_count: 100,
        images: ["1738443877695-565753061.png"],
      },
    ],
  });

  // Create a customer
  const customer = await prisma.customer.create({
    data: {
      name: "John Doe",
      email: "john@example.com",
      phone: "+1234567890",
      store_id: store.id,
    },
  });

  // Create an order
  const order = await prisma.order.create({
    data: {
      store_id: store.id,
      customer_id: customer.id,
      total_amount: 629.98,
      status: "pending",
      payment_method: "cash_on_delivery",
      order_source: "platform",
      address: {
        street: "123 Main St",
        city: "Anytown",
        country: "Country",
      },
    },
  });

  // Create order items
  const orderItems = await prisma.orderItem.createMany({
    data: [
      {
        order_id: order.id,
        product_id: (await prisma.product.findFirst({
          where: { name: "Smartphone" },
        }))!.id,
        quantity: 1,
        unit_price: 599.99,
      },
      {
        order_id: order.id,
        product_id: (await prisma.product.findFirst({
          where: { name: "T-Shirt" },
        }))!.id,
        quantity: 1,
        unit_price: 29.99,
      },
    ],
  });

  // Create payment
  const payment = await prisma.payment.create({
    data: {
      order_id: order.id,
      amount: 629.98,
      payment_method: "cash_on_delivery",
      status: "pending",
      transaction_id: "444444444444444",
    },
  });

  // Create Meta integration
  const metaIntegration = await prisma.metaIntegration.create({
    data: {
      store_id: store.id,
      page_id: "123456789",
      app_id: "987654321",
      access_token: "meta_access_token_here",
    },
  });

  // Create Chargili account
  const chargiliAccount = await prisma.chargiliAccount.create({
    data: {
      store_id: store.id,
      SECRET_KEY: "chargili_secret_key_here",
    },
  });

  console.log("Database seeded successfully!");
}

main()
  .catch((e) => {
    console.log("tnakt");
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
