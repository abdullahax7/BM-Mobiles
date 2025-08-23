import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9 -]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

async function main() {
  console.log('🌱 Starting database seed...')
  
  // Create platforms
  const androidPlatform = await prisma.platform.create({
    data: {
      name: 'Android',
      slug: generateSlug('Android'),
    }
  })

  const iosPlatform = await prisma.platform.create({
    data: {
      name: 'iOS',
      slug: generateSlug('iOS'),
    }
  })

  // Create brands for Android
  const samsungBrand = await prisma.brand.create({
    data: {
      name: 'Samsung',
      slug: generateSlug('Samsung'),
      platformId: androidPlatform.id,
    }
  })


  // Create brands for iOS
  const appleBrand = await prisma.brand.create({
    data: {
      name: 'Apple',
      slug: generateSlug('Apple'),
      platformId: iosPlatform.id,
    }
  })

  // Create families for Samsung
  const galaxySFamily = await prisma.family.create({
    data: {
      name: 'Galaxy S',
      slug: generateSlug('Galaxy S'),
      brandId: samsungBrand.id,
    }
  })


  // Create families for Apple
  const iphoneFamily = await prisma.family.create({
    data: {
      name: 'iPhone',
      slug: generateSlug('iPhone'),
      brandId: appleBrand.id,
    }
  })

  // Create models for Galaxy S
  const galaxyS21 = await prisma.model.create({
    data: {
      name: 'Galaxy S21',
      slug: generateSlug('Galaxy S21'),
      familyId: galaxySFamily.id,
    }
  })

  const galaxyS22 = await prisma.model.create({
    data: {
      name: 'Galaxy S22',
      slug: generateSlug('Galaxy S22'),
      familyId: galaxySFamily.id,
    }
  })

  // Create models for iPhone
  const iphone12 = await prisma.model.create({
    data: {
      name: 'iPhone 12',
      slug: generateSlug('iPhone 12'),
      familyId: iphoneFamily.id,
    }
  })

  const iphone13 = await prisma.model.create({
    data: {
      name: 'iPhone 13',
      slug: generateSlug('iPhone 13'),
      familyId: iphoneFamily.id,
    }
  })

  const iphone14 = await prisma.model.create({
    data: {
      name: 'iPhone 14',
      slug: generateSlug('iPhone 14'),
      familyId: iphoneFamily.id,
    }
  })

  // Create parts
  const parts = [
    {
      name: 'LCD Screen',
      description: 'High-quality LCD replacement screen',
      sku: 'LCD-SCREEN-001',
      realCost: 45.00,
      sellingPrice: 89.99,
      stock: 25,
      lowStockThreshold: 5,
    },
    {
      name: 'Battery',
      description: 'Lithium-ion battery replacement',
      sku: 'BAT-LI-001',
      realCost: 15.00,
      sellingPrice: 35.99,
      stock: 50,
      lowStockThreshold: 10,
    },
    {
      name: 'Camera Module',
      description: 'Rear camera module',
      sku: 'CAM-REAR-001',
      realCost: 35.00,
      sellingPrice: 75.99,
      stock: 3, // Low stock
      lowStockThreshold: 5,
    },
    {
      name: 'Charging Port',
      description: 'USB-C charging port assembly',
      sku: 'PORT-USBC-001',
      realCost: 12.00,
      sellingPrice: 25.99,
      stock: 0, // Out of stock
      lowStockThreshold: 8,
    },
    {
      name: 'Home Button',
      description: 'Home button with Touch ID',
      sku: 'BTN-HOME-001',
      realCost: 25.00,
      sellingPrice: 49.99,
      stock: 15,
      lowStockThreshold: 5,
    },
    {
      name: 'Speaker',
      description: 'Main speaker assembly',
      sku: 'SPKR-MAIN-001',
      realCost: 8.00,
      sellingPrice: 19.99,
      stock: 30,
      lowStockThreshold: 10,
    }
  ]

  const createdParts = []
  for (const partData of parts) {
    const part = await prisma.part.create({
      data: partData
    })
    createdParts.push(part)
  }

  // Create part-model relationships
  // LCD Screen - compatible with multiple models
  await prisma.partModel.create({
    data: {
      partId: createdParts[0].id,
      modelId: galaxyS21.id,
    }
  })

  await prisma.partModel.create({
    data: {
      partId: createdParts[0].id,
      modelId: galaxyS22.id,
    }
  })

  // Battery - different for each model
  await prisma.partModel.create({
    data: {
      partId: createdParts[1].id,
      modelId: iphone12.id,
    }
  })

  await prisma.partModel.create({
    data: {
      partId: createdParts[1].id,
      modelId: iphone13.id,
    }
  })

  // Camera - for Samsung models
  await prisma.partModel.create({
    data: {
      partId: createdParts[2].id,
      modelId: galaxyS21.id,
    }
  })

  // Charging port - universal
  for (const model of [galaxyS21, galaxyS22, iphone12, iphone13, iphone14]) {
    await prisma.partModel.create({
      data: {
        partId: createdParts[3].id,
        modelId: model.id,
      }
    })
  }

  // Home button - iPhone specific
  for (const model of [iphone12, iphone13, iphone14]) {
    await prisma.partModel.create({
      data: {
        partId: createdParts[4].id,
        modelId: model.id,
      }
    })
  }

  // Speaker - universal
  for (const model of [galaxyS21, galaxyS22, iphone12, iphone13, iphone14]) {
    await prisma.partModel.create({
      data: {
        partId: createdParts[5].id,
        modelId: model.id,
      }
    })
  }

  // Create some sample transactions
  const transactions = [
    {
      type: 'IN',
      quantity: 50,
      reason: 'Initial stock',
      partId: createdParts[0].id,
    },
    {
      type: 'OUT',
      quantity: 25,
      reason: 'Repair: Screen replacement',
      partId: createdParts[0].id,
    },
    {
      type: 'IN',
      quantity: 100,
      reason: 'Bulk purchase',
      partId: createdParts[1].id,
    },
    {
      type: 'OUT',
      quantity: 50,
      reason: 'Multiple repairs',
      partId: createdParts[1].id,
    },
    {
      type: 'ADJUST',
      quantity: -2,
      reason: 'Damaged in shipping',
      partId: createdParts[2].id,
    }
  ]

  for (const transactionData of transactions) {
    await prisma.transaction.create({
      data: transactionData
    })
  }

  // Create sample shortcuts
  await prisma.shortcut.create({
    data: {
      name: 'Samsung Parts',
      description: 'All parts compatible with Samsung devices',
      filters: JSON.stringify({
        brandSlugs: ['samsung']
      })
    }
  })

  await prisma.shortcut.create({
    data: {
      name: 'iOS Parts',
      description: 'All parts compatible with iOS devices',
      filters: JSON.stringify({
        platformSlugs: ['ios']
      })
    }
  })

  await prisma.shortcut.create({
    data: {
      name: 'Low Stock',
      description: 'Parts with low inventory',
      filters: JSON.stringify({
        lowStockOnly: true
      })
    }
  })

  console.log('✅ Database seeded successfully!')
  console.log(`Created:`)
  console.log(`- 2 platforms`)
  console.log(`- 3 brands`) 
  console.log(`- 3 families`)
  console.log(`- 5 models`)
  console.log(`- ${parts.length} parts`)
  console.log(`- Multiple part-model relationships`)
  console.log(`- ${transactions.length} transactions`)
  console.log(`- 3 shortcuts`)
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })