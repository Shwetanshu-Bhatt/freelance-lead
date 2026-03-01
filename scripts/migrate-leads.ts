import xlsx from 'xlsx';
import * as fs from 'fs';
import * as path from 'path';
import connectDB from '../lib/db.js';
import Lead from '../models/Lead.js';
import Category from '../models/Category.js';

interface LeadRow {
  Name: string;
  Contact: number | string;
  Rating: string;
  Link: string;
  Address: string;
  Status: string;
  Categories: string;
}

function parseRating(ratingStr: string): { rating: number; reviewCount: number } {
  if (!ratingStr) return { rating: 0, reviewCount: 0 };
  
  // Match patterns like "4.9 (131)" or "4.9(404)" or "5.0(237)"
  const match = ratingStr.toString().match(/([\d.]+)\s*\(?(\d+)\)?/);
  if (match) {
    return {
      rating: parseFloat(match[1]),
      reviewCount: parseInt(match[2], 10)
    };
  }
  return { rating: 0, reviewCount: 0 };
}

function mapStatus(status: string): 'lead_generated' | 'contacted' | 'declined' | 'proposed' {
  const statusMap: Record<string, 'lead_generated' | 'contacted' | 'declined' | 'proposed'> = {
    'New': 'lead_generated',
    'Messaged': 'contacted',
    'Contacted': 'contacted',
    'Declined': 'declined',
    'Proposed': 'proposed',
    'Proposal Sent': 'proposed',
  };
  return statusMap[status] || 'lead_generated';
}

function parseAddress(addressStr: string): {
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
} {
  // Try to extract postal code (6 digits at end)
  const postalMatch = addressStr.match(/(\d{6})$/);
  const postalCode = postalMatch ? postalMatch[1] : '';
  
  // Try to extract state (usually before postal code)
  const parts = addressStr.split(',').map(p => p.trim());
  const state = parts.length > 1 ? parts[parts.length - 2].replace(/\d+$/, '').trim() : 'Uttarakhand';
  const city = parts.length > 2 ? parts[parts.length - 3] : 'Dehradun';
  
  // Street is everything except last 3 parts (city, state, country)
  const streetParts = parts.slice(0, parts.length - 2);
  const street = streetParts.join(', ');
  
  return {
    street: street || addressStr,
    city: city || 'Dehradun',
    state: state || 'Uttarakhand',
    postalCode,
    country: 'India'
  };
}

async function migrateLeads() {
  const odsPath = path.join(process.cwd(), 'Leads.ods');
  
  if (!fs.existsSync(odsPath)) {
    console.error('❌ Leads.ods file not found at:', odsPath);
    process.exit(1);
  }

  console.log('📊 Reading Leads.ods...\n');
  
  const workbook = xlsx.readFile(odsPath);
  const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
  const data = xlsx.utils.sheet_to_json(firstSheet) as LeadRow[];
  
  // Filter out empty rows
  const validLeads = data.filter((row: LeadRow) => row.Name && row.Name.trim() !== '');
  
  console.log(`Found ${validLeads.length} leads to migrate\n`);
  
  // Connect to database
  await connectDB();
  
  // Get or create categories
  const categoryMap = new Map<string, string>();
  const uniqueCategories = [...new Set(validLeads.map(l => l.Categories).filter(Boolean))];
  
  console.log('🏷️  Processing categories:', uniqueCategories.join(', '));
  
  for (const catName of uniqueCategories) {
    const slug = catName.toLowerCase().replace(/\s+/g, '-');
    let category = await Category.findOne({ slug });
    if (!category) {
      try {
        category = await Category.create({
          name: catName,
          slug,
        });
        console.log(`  ✓ Created category: ${catName}`);
      } catch (err: any) {
        // If duplicate key error, try to find again
        if (err.code === 11000) {
          category = await Category.findOne({ slug });
          console.log(`  ✓ Found existing category: ${catName}`);
        } else {
          throw err;
        }
      }
    } else {
      console.log(`  ✓ Found category: ${catName}`);
    }
    if (category) {
      categoryMap.set(catName, category._id.toString());
    }
  }
  
  console.log('\n📝 Migrating leads...\n');
  
  let successCount = 0;
  let errorCount = 0;
  
  for (let i = 0; i < validLeads.length; i++) {
    const row = validLeads[i];
    
    try {
      const { rating, reviewCount } = parseRating(row.Rating);
      const address = parseAddress(row.Address);
      const status = mapStatus(row.Status);
      const categoryId = categoryMap.get(row.Categories);
      
      // Check if lead already exists (by phone)
      const existingLead = await Lead.findOne({
        phone: row.Contact?.toString(),
        isDeleted: false,
      });

      if (existingLead) {
        console.log(`  ⚠️  Skipped (duplicate phone: ${row.Contact}): ${row.Name}`);
        continue;
      }
      
      await Lead.create({
        name: row.Name,
        category: categoryId,
        phone: row.Contact?.toString(),
        rating,
        reviewCount,
        googleMapsUrl: row.Link,
        address: {
          street: address.street,
          city: address.city,
          state: address.state,
          postalCode: address.postalCode,
          country: address.country,
          latitude: 0,
          longitude: 0,
        },
        status,
        source: 'google',
        tags: [row.Categories],
        notes: `Imported from Leads.ods on ${new Date().toISOString()}`,
        priority: 'medium',
        isDeleted: false,
      });
      
      successCount++;
      console.log(`  ✓ Migrated: ${row.Name}`);
      
    } catch (error) {
      errorCount++;
      console.error(`  ❌ Error migrating ${row.Name}:`, (error as Error).message);
    }
  }
  
  console.log(`\n✅ Migration complete!`);
  console.log(`   Success: ${successCount}`);
  console.log(`   Errors: ${errorCount}`);
  console.log(`   Skipped: ${validLeads.length - successCount - errorCount}`);
  
  process.exit(0);
}

migrateLeads().catch(error => {
  console.error('Migration failed:', error);
  process.exit(1);
});
