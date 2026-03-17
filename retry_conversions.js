import { storage } from './server/storage.js';
import { db } from './server/db.js';
import { contentItems } from './shared/schema.js';
import { eq, or, ilike } from 'drizzle-orm';
import fs from 'fs';
import path from 'path';

import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const pdfParse = require('pdf-parse');

async function retry() {
  console.log('--- MANUAL CONVERSION RETRY ---');
  
  const results = await db.select().from(contentItems).where(
    or(
      ilike(contentItems.title, '%43147'),
      ilike(contentItems.title, '%20773')
    )
  );

  const {
    extractText,
    generateSimplifiedText,
    generateTranscript,
    generateHighContrastPdf,
    generateAudioFile,
  } = await import('./server/services/conversionService.js');

  for (const item of results) {
    console.log(`
Processing: ${item.title} (${item.id})`);
    
    if (!fs.existsSync(item.originalFilePath)) {
      console.error(`❌ Original file NOT FOUND: ${item.originalFilePath}`);
      continue;
    }

    try {
      const fileBuffer = fs.readFileSync(item.originalFilePath);
      const mimeType = item.originalMimeType;
      const filename = item.originalFilename;
      
      const convertedDir = path.join(process.cwd(), 'uploads', 'converted', item.id);
      if (!fs.existsSync(convertedDir)) fs.mkdirSync(convertedDir, { recursive: true });

      // Helper: update content item columns + keep JSONB availableFormats in sync
      const updateItem = async (fields) => {
        const currentItem = await storage.getContentItem(item.id);
        const currentFormats = (currentItem?.availableFormats) || {};
        const jsonbUpdate = { availableFormats: { ...currentFormats } };
        
        const formatMap = {
          transcriptPath: 'transcript', simplifiedPath: 'simplified',
          highContrastPath: 'highContrast', audioPath: 'audio', braillePath: 'braille',
        };
        
        for (const [key, formatKey] of Object.entries(formatMap)) {
          if (key in fields) {
            const statusKey = key.replace('Path', 'Status');
            jsonbUpdate.availableFormats[formatKey] = { 
                path: fields[key] || '', 
                status: fields[statusKey] || 'COMPLETED' 
            };
          }
        }
        await storage.updateContentItem(item.id, { ...fields, ...jsonbUpdate });
      };

      // 1. Extract raw text
      console.log('Extracting text...');
      const rawText = await extractText(fileBuffer, mimeType, filename);
      console.log(`Extracted ${rawText.length} chars.`);

      // 2. Transcript
      if (rawText) {
        console.log('Generating transcript...');
        const transcriptText = generateTranscript(rawText, filename);
        const tPath = path.join(convertedDir, 'transcript.txt');
        fs.writeFileSync(tPath, transcriptText);
        await updateItem({ transcriptPath: tPath, transcriptStatus: 'COMPLETED' });
        console.log('✅ Transcript done');
      }

      // 3. Simplified
      if (rawText) {
        console.log('Generating simplified text...');
        const simplifiedText = generateSimplifiedText(rawText);
        const sPath = path.join(convertedDir, 'simplified.txt');
        fs.writeFileSync(sPath, simplifiedText);
        await updateItem({ simplifiedPath: sPath, simplifiedStatus: 'READYFORREVIEW' });
        console.log('✅ Simplified done');
      }

      // 4. High Contrast
      if (mimeType === 'application/pdf') {
        console.log('Generating high contrast PDF...');
        const hcBuffer = await generateHighContrastPdf(fileBuffer);
        if (hcBuffer) {
          const hcPath = path.join(convertedDir, 'high-contrast.pdf');
          fs.writeFileSync(hcPath, hcBuffer);
          await updateItem({ highContrastPath: hcPath, highContrastStatus: 'COMPLETED' });
          console.log('✅ High contrast done');
        }
      }

      // 5. Audio
      if (rawText) {
        console.log('Generating audio script...');
        const { buffer: aBuffer, extension } = await generateAudioFile(rawText, filename);
        const aPath = path.join(convertedDir, `audio.${extension}`);
        fs.writeFileSync(aPath, aBuffer);
        await updateItem({ audioPath: aPath, audioStatus: 'COMPLETED' });
        console.log('✅ Audio done');
      }

      await storage.updateContentItem(item.id, { publishStatus: 'published' });
      console.log('🎉 Fully converted and published');

    } catch (e) {
      console.error(`❌ Failed processing ${item.id}:`, e);
    }
  }
  process.exit(0);
}

retry();
