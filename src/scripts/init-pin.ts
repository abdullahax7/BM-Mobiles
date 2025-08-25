import { db } from '../lib/db';
import { generateSalt, hashPin } from '../lib/auth';
import readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(query, resolve);
  });
}

async function initializePin() {
  try {
    // Check if PIN already exists
    const existingPin = await db.authPin.findFirst({
      where: { isActive: true }
    });

    if (existingPin) {
      console.log('⚠️  An active PIN already exists in the database.');
      const overwrite = await question('Do you want to replace it? (yes/no): ');
      
      if (overwrite.toLowerCase() !== 'yes') {
        console.log('Initialization cancelled.');
        process.exit(0);
      }
      
      // Deactivate existing PIN
      await db.authPin.update({
        where: { id: existingPin.id },
        data: { isActive: false }
      });
    }

    // Get PIN from user or environment
    let pin = process.env.INITIAL_PIN;
    
    if (!pin) {
      pin = await question('Enter a PIN (3-6 digits): ');
      
      // Validate PIN
      if (!/^\d{3,6}$/.test(pin)) {
        console.error('❌ Invalid PIN format. PIN must be 3-6 digits.');
        process.exit(1);
      }
    } else {
      console.log(`Using PIN from INITIAL_PIN environment variable.`);
    }

    // Hash and store the PIN
    const salt = generateSalt();
    const hashedPin = hashPin(pin, salt);

    const newPin = await db.authPin.create({
      data: {
        pin: hashedPin,
        salt,
        isActive: true,
        attempts: 0
      }
    });

    console.log('✅ PIN initialized successfully!');
    console.log(`   ID: ${newPin.id}`);
    console.log(`   Created: ${newPin.createdAt}`);
    console.log('\n📝 Note: The PIN has been securely hashed and stored in the database.');
    console.log('   You can now use this PIN to log in to the application.');
    
  } catch (error) {
    console.error('❌ Error initializing PIN:', error);
    process.exit(1);
  } finally {
    rl.close();
    await db.$disconnect();
  }
}

// Run the initialization
initializePin();
