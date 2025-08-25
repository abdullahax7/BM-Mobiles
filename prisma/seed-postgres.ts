import { PrismaClient } from '@prisma/client'
import { withAccelerate } from '@prisma/extension-accelerate'

const prisma = new PrismaClient().$extends(withAccelerate()) as any

async function main() {
  console.log('🌱 Starting database seed...')

  // Clear existing data
  console.log('🧹 Clearing existing data...')
  await prisma.saleItem.deleteMany()
  await prisma.sale.deleteMany()
  await prisma.transaction.deleteMany()
  await prisma.partModel.deleteMany()
  await prisma.part.deleteMany()
  await prisma.model.deleteMany()
  await prisma.family.deleteMany()
  await prisma.brand.deleteMany()
  await prisma.platform.deleteMany()
  await prisma.shortcut.deleteMany()

  // Create platforms
  console.log('📱 Creating platforms...')
  const ios = await prisma.platform.create({
    data: {
      name: 'iOS',
      slug: 'ios',
    },
  })

  const android = await prisma.platform.create({
    data: {
      name: 'Android',
      slug: 'android',
    },
  })

  // Create brands
  console.log('🏢 Creating brands...')
  const apple = await prisma.brand.create({
    data: {
      name: 'Apple',
      slug: 'apple',
      platformId: ios.id,
    },
  })

  const samsung = await prisma.brand.create({
    data: {
      name: 'Samsung',
      slug: 'samsung',
      platformId: android.id,
    },
  })

  const xiaomi = await prisma.brand.create({
    data: {
      name: 'Xiaomi',
      slug: 'xiaomi',
      platformId: android.id,
    },
  })

  const oppo = await prisma.brand.create({
    data: {
      name: 'Oppo',
      slug: 'oppo',
      platformId: android.id,
    },
  })

  // Create families
  console.log('👨‍👩‍👧‍👦 Creating families...')
  const iphone = await prisma.family.create({
    data: {
      name: 'iPhone',
      slug: 'iphone',
      brandId: apple.id,
    },
  })

  const ipad = await prisma.family.create({
    data: {
      name: 'iPad',
      slug: 'ipad',
      brandId: apple.id,
    },
  })

  const galaxy = await prisma.family.create({
    data: {
      name: 'Galaxy',
      slug: 'galaxy',
      brandId: samsung.id,
    },
  })

  const redmi = await prisma.family.create({
    data: {
      name: 'Redmi',
      slug: 'redmi',
      brandId: xiaomi.id,
    },
  })

  const reno = await prisma.family.create({
    data: {
      name: 'Reno',
      slug: 'reno',
      brandId: oppo.id,
    },
  })

  // Create models
  console.log('📱 Creating models...')
  const models = await Promise.all([
    // iPhone models
    prisma.model.create({ data: { name: 'iPhone 15 Pro Max', slug: 'iphone-15-pro-max', familyId: iphone.id } }),
    prisma.model.create({ data: { name: 'iPhone 15 Pro', slug: 'iphone-15-pro', familyId: iphone.id } }),
    prisma.model.create({ data: { name: 'iPhone 15', slug: 'iphone-15', familyId: iphone.id } }),
    prisma.model.create({ data: { name: 'iPhone 14 Pro Max', slug: 'iphone-14-pro-max', familyId: iphone.id } }),
    prisma.model.create({ data: { name: 'iPhone 14', slug: 'iphone-14', familyId: iphone.id } }),
    prisma.model.create({ data: { name: 'iPhone 13', slug: 'iphone-13', familyId: iphone.id } }),
    prisma.model.create({ data: { name: 'iPhone 12', slug: 'iphone-12', familyId: iphone.id } }),
    prisma.model.create({ data: { name: 'iPhone 11', slug: 'iphone-11', familyId: iphone.id } }),
    
    // iPad models
    prisma.model.create({ data: { name: 'iPad Pro 12.9', slug: 'ipad-pro-12-9', familyId: ipad.id } }),
    prisma.model.create({ data: { name: 'iPad Air', slug: 'ipad-air', familyId: ipad.id } }),
    prisma.model.create({ data: { name: 'iPad Mini', slug: 'ipad-mini', familyId: ipad.id } }),
    
    // Samsung models
    prisma.model.create({ data: { name: 'Galaxy S24 Ultra', slug: 'galaxy-s24-ultra', familyId: galaxy.id } }),
    prisma.model.create({ data: { name: 'Galaxy S24', slug: 'galaxy-s24', familyId: galaxy.id } }),
    prisma.model.create({ data: { name: 'Galaxy S23', slug: 'galaxy-s23', familyId: galaxy.id } }),
    prisma.model.create({ data: { name: 'Galaxy A54', slug: 'galaxy-a54', familyId: galaxy.id } }),
    prisma.model.create({ data: { name: 'Galaxy A34', slug: 'galaxy-a34', familyId: galaxy.id } }),
    
    // Xiaomi models
    prisma.model.create({ data: { name: 'Redmi Note 13 Pro', slug: 'redmi-note-13-pro', familyId: redmi.id } }),
    prisma.model.create({ data: { name: 'Redmi Note 12', slug: 'redmi-note-12', familyId: redmi.id } }),
    prisma.model.create({ data: { name: 'Redmi 12', slug: 'redmi-12', familyId: redmi.id } }),
    
    // Oppo models
    prisma.model.create({ data: { name: 'Reno 11 Pro', slug: 'reno-11-pro', familyId: reno.id } }),
    prisma.model.create({ data: { name: 'Reno 10', slug: 'reno-10', familyId: reno.id } }),
  ])

  // Create parts
  console.log('🔧 Creating parts...')
  const parts = [
    // iPhone parts
    { name: 'iPhone 15 Pro Max Screen', sku: 'IPH15PM-SCR', description: 'Original OLED display for iPhone 15 Pro Max', realCost: 15000, sellingPrice: 25000, stock: 5, lowStockThreshold: 3 },
    { name: 'iPhone 15 Pro Screen', sku: 'IPH15P-SCR', description: 'Original OLED display for iPhone 15 Pro', realCost: 12000, sellingPrice: 20000, stock: 8, lowStockThreshold: 3 },
    { name: 'iPhone 14 Battery', sku: 'IPH14-BAT', description: 'Replacement battery for iPhone 14', realCost: 2500, sellingPrice: 5000, stock: 15, lowStockThreshold: 5 },
    { name: 'iPhone 13 Screen', sku: 'IPH13-SCR', description: 'OLED display for iPhone 13', realCost: 8000, sellingPrice: 14000, stock: 10, lowStockThreshold: 4 },
    { name: 'iPhone Lightning Port', sku: 'IPH-LTNG', description: 'Lightning charging port flex cable', realCost: 500, sellingPrice: 1500, stock: 25, lowStockThreshold: 10 },
    { name: 'iPhone Camera Module', sku: 'IPH-CAM', description: 'Rear camera module for various iPhone models', realCost: 3000, sellingPrice: 6000, stock: 12, lowStockThreshold: 5 },
    
    // Samsung parts
    { name: 'Galaxy S24 Ultra Screen', sku: 'GS24U-SCR', description: 'AMOLED display for Galaxy S24 Ultra', realCost: 12000, sellingPrice: 20000, stock: 6, lowStockThreshold: 3 },
    { name: 'Galaxy S23 Battery', sku: 'GS23-BAT', description: 'Replacement battery for Galaxy S23', realCost: 2000, sellingPrice: 4000, stock: 18, lowStockThreshold: 6 },
    { name: 'Samsung USB-C Port', sku: 'SAM-USBC', description: 'USB-C charging port for Samsung devices', realCost: 400, sellingPrice: 1200, stock: 30, lowStockThreshold: 10 },
    { name: 'Galaxy Back Glass', sku: 'GAL-BACK', description: 'Replacement back glass for Galaxy phones', realCost: 1500, sellingPrice: 3500, stock: 20, lowStockThreshold: 8 },
    
    // Xiaomi parts
    { name: 'Redmi Note 13 Pro Screen', sku: 'RN13P-SCR', description: 'AMOLED display for Redmi Note 13 Pro', realCost: 4000, sellingPrice: 8000, stock: 12, lowStockThreshold: 4 },
    { name: 'Redmi Battery', sku: 'RED-BAT', description: 'Universal Redmi battery', realCost: 1200, sellingPrice: 2500, stock: 22, lowStockThreshold: 8 },
    { name: 'Xiaomi Power Button', sku: 'XI-PWR', description: 'Power button flex cable', realCost: 200, sellingPrice: 800, stock: 35, lowStockThreshold: 15 },
    
    // Oppo parts
    { name: 'Oppo Reno Screen', sku: 'RENO-SCR', description: 'AMOLED display for Reno series', realCost: 5000, sellingPrice: 9000, stock: 8, lowStockThreshold: 3 },
    { name: 'Oppo Battery', sku: 'OPPO-BAT', description: 'Replacement battery for Oppo phones', realCost: 1500, sellingPrice: 3000, stock: 16, lowStockThreshold: 6 },
    
    // Universal parts
    { name: 'Universal Screen Protector', sku: 'UNI-PROT', description: 'Tempered glass screen protector', realCost: 50, sellingPrice: 200, stock: 100, lowStockThreshold: 30 },
    { name: 'Phone Case', sku: 'UNI-CASE', description: 'Universal silicone phone case', realCost: 100, sellingPrice: 400, stock: 80, lowStockThreshold: 25 },
    { name: 'Charging Cable', sku: 'UNI-CABLE', description: 'USB-C/Lightning charging cable', realCost: 150, sellingPrice: 500, stock: 60, lowStockThreshold: 20 },
    { name: 'Wireless Charger', sku: 'UNI-WCHG', description: '15W wireless charging pad', realCost: 800, sellingPrice: 2000, stock: 25, lowStockThreshold: 10 },
    { name: 'Earbuds', sku: 'UNI-EARB', description: 'Bluetooth wireless earbuds', realCost: 1500, sellingPrice: 3500, stock: 18, lowStockThreshold: 7 },
  ]

  const createdParts = await Promise.all(
    parts.map(part => prisma.part.create({ data: part }))
  )

  // Link parts to models (create relationships)
  console.log('🔗 Linking parts to models...')
  const partModelLinks = []
  
  // Link iPhone parts to iPhone models
  const iphoneModels = models.filter(m => m.familyId === iphone.id)
  const iphoneParts = createdParts.filter(p => p.sku.startsWith('IPH'))
  
  for (const model of iphoneModels) {
    for (const part of iphoneParts) {
      partModelLinks.push({ partId: part.id, modelId: model.id })
    }
  }
  
  // Link Samsung parts to Samsung models
  const samsungModels = models.filter(m => m.familyId === galaxy.id)
  const samsungParts = createdParts.filter(p => p.sku.startsWith('GS') || p.sku.startsWith('GAL') || p.sku.startsWith('SAM'))
  
  for (const model of samsungModels) {
    for (const part of samsungParts) {
      partModelLinks.push({ partId: part.id, modelId: model.id })
    }
  }
  
  // Link universal parts to all models
  const universalParts = createdParts.filter(p => p.sku.startsWith('UNI'))
  for (const model of models) {
    for (const part of universalParts) {
      partModelLinks.push({ partId: part.id, modelId: model.id })
    }
  }
  
  await prisma.partModel.createMany({ data: partModelLinks })

  // Create some initial transactions
  console.log('📊 Creating initial transactions...')
  for (const part of createdParts) {
    await prisma.transaction.create({
      data: {
        type: 'IN',
        quantity: part.stock,
        reason: 'Initial stock',
        partId: part.id,
      },
    })
  }

  // Create some sample sales
  console.log('💰 Creating sample sales...')
  const sampleSales = [
    {
      customerName: 'Ahmed Ali',
      customerPhone: '+923001234567',
      customerEmail: 'ahmed@example.com',
      totalAmount: 25000,
      discount: 2000,
      finalAmount: 23000,
      paymentMethod: 'CASH' as const,
      status: 'COMPLETED' as const,
      notes: 'iPhone 15 Pro Max screen replacement',
      items: [
        { partId: createdParts[0].id, quantity: 1, unitPrice: 25000, totalPrice: 25000 }
      ]
    },
    {
      customerName: 'Fatima Khan',
      customerPhone: '+923009876543',
      totalAmount: 5500,
      discount: 0,
      finalAmount: 5500,
      paymentMethod: 'CARD' as const,
      status: 'COMPLETED' as const,
      notes: 'Battery replacement and screen protector',
      items: [
        { partId: createdParts[2].id, quantity: 1, unitPrice: 5000, totalPrice: 5000 },
        { partId: createdParts[15].id, quantity: 2, unitPrice: 250, totalPrice: 500 }
      ]
    },
    {
      customerName: 'Hassan Malik',
      customerPhone: '+923005555555',
      totalAmount: 8000,
      discount: 500,
      finalAmount: 7500,
      paymentMethod: 'ONLINE' as const,
      status: 'COMPLETED' as const,
      notes: 'Redmi Note 13 Pro screen repair',
      items: [
        { partId: createdParts[10].id, quantity: 1, unitPrice: 8000, totalPrice: 8000 }
      ]
    },
  ]

  for (const saleData of sampleSales) {
    const { items, ...sale } = saleData
    const createdSale = await prisma.sale.create({ data: sale })
    
    // Create sale items
    for (const item of items) {
      await prisma.saleItem.create({
        data: {
          ...item,
          saleId: createdSale.id
        }
      })
      
      // Create transaction for the sale
      await prisma.transaction.create({
        data: {
          type: 'SALE',
          quantity: -item.quantity,
          reason: `Sale #${createdSale.id.slice(-8)}`,
          partId: item.partId,
          saleId: createdSale.id
        }
      })
      
      // Update part stock
      await prisma.part.update({
        where: { id: item.partId },
        data: { stock: { decrement: item.quantity } }
      })
    }
  }

  // Create shortcuts
  console.log('⚡ Creating shortcuts...')
  await prisma.shortcut.createMany({
    data: [
      {
        name: 'Low Stock Items',
        description: 'Parts that are running low on stock',
        filters: JSON.stringify({ lowStock: true })
      },
      {
        name: 'iPhone Parts',
        description: 'All iPhone related parts',
        filters: JSON.stringify({ platform: 'ios' })
      },
      {
        name: 'High Value Parts',
        description: 'Parts worth more than PKR 10,000',
        filters: JSON.stringify({ minPrice: 10000 })
      }
    ]
  })

  console.log('✅ Database seeded successfully!')
  
  // Display summary
  const summary = await Promise.all([
    prisma.platform.count(),
    prisma.brand.count(),
    prisma.family.count(),
    prisma.model.count(),
    prisma.part.count(),
    prisma.partModel.count(),
    prisma.transaction.count(),
    prisma.sale.count(),
    prisma.shortcut.count()
  ])
  
  console.log('\n📊 Summary:')
  console.log(`  - Platforms: ${summary[0]}`)
  console.log(`  - Brands: ${summary[1]}`)
  console.log(`  - Families: ${summary[2]}`)
  console.log(`  - Models: ${summary[3]}`)
  console.log(`  - Parts: ${summary[4]}`)
  console.log(`  - Part-Model Links: ${summary[5]}`)
  console.log(`  - Transactions: ${summary[6]}`)
  console.log(`  - Sales: ${summary[7]}`)
  console.log(`  - Shortcuts: ${summary[8]}`)
}

main()
  .catch(e => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
