const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const OpenAI = require('openai');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const multer = require('multer');
const detailedMockResponses = require('./mock_responses.js');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;
const openaiKey = process.env.OPENAI_API_KEY;
const geminiKey = process.env.GEMINI_API_KEY;

console.log('Starting AgroVision server with OpenAI + Gemini...');
console.log('OpenAI Key loaded:', openaiKey ? 'Yes' : 'No');
console.log('Gemini Key loaded:', geminiKey ? 'Yes' : 'No');

let openaiClient = null;
if (openaiKey) {
  openaiClient = new OpenAI({ apiKey: openaiKey });
  console.log('OpenAI client created - gpt-4o-mini ready');
}

let genAI = null;
if (geminiKey) {
  genAI = new GoogleGenerativeAI(geminiKey);
  console.log('Gemini client created');
}

// Load dataset catalog
const datasetCatalogPath = path.join(__dirname, 'dataset-catalog.json');
let datasetCatalog = [];
try {
  datasetCatalog = JSON.parse(fs.readFileSync(datasetCatalogPath, 'utf8'));
  console.log(`Dataset catalog loaded: ${datasetCatalog.length} classes`);
} catch (err) {
  console.error('Failed to load dataset-catalog.json:', err.message);
}

// Load medicine kits
const medicineKitsPath = path.join(__dirname, 'medicine-kits.json');
let medicineKits = [];
try {
  const kitsData = JSON.parse(fs.readFileSync(medicineKitsPath, 'utf8'));
  medicineKits = kitsData.kits || [];
  console.log(`Medicine kits loaded: ${medicineKits.length} kits`);
} catch (err) {
  console.error('Failed to load medicine-kits.json:', err.message);
}

const datasetBasePath = path.join(__dirname, 'Data Set', 'New Plant Diseases Dataset(Augmented)', 'New Plant Diseases Dataset(Augmented)');

// Multer setup for image uploads (memory storage)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|gif|webp/i;
    const extname = allowed.test(path.extname(file.originalname));
    const mimetype = allowed.test(file.mimetype);
    if (extname && mimetype) return cb(null, true);
    cb(new Error('Only image files are allowed'));
  }
});

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// Serve dataset images statically
app.use('/dataset-images', express.static(datasetBasePath));

// ═══════════════════════════════════════════
// DATASET API ENDPOINTS
// ═══════════════════════════════════════════

// GET /api/dataset/classes — return full catalog
app.get('/api/dataset/classes', (req, res) => {
  res.json({ success: true, classes: datasetCatalog });
});

// GET /api/dataset/samples?classId=...&count=N — return sample image URLs
app.get('/api/dataset/samples', (req, res) => {
  const classId = req.query.classId;
  const count = Math.min(parseInt(req.query.count) || 4, 12);

  if (!classId) {
    return res.status(400).json({ error: 'classId query param required' });
  }

  const catalogEntry = datasetCatalog.find(c => c.id === classId);
  if (!catalogEntry) {
    return res.status(404).json({ error: 'Class not found' });
  }

  const classFolder = path.join(datasetBasePath, 'train', catalogEntry.folder);
  try {
    const files = fs.readdirSync(classFolder)
      .filter(f => /\.(jpg|jpeg|png|gif|webp|JPG|JPEG|PNG)$/i.test(f));

    // Shuffle and pick `count`
    const shuffled = files.sort(() => 0.5 - Math.random()).slice(0, count);
    const samples = shuffled.map(f => ({
      url: `/dataset-images/train/${encodeURIComponent(catalogEntry.folder)}/${encodeURIComponent(f)}`,
      filename: f
    }));

    res.json({ success: true, classId, samples, totalAvailable: files.length });
  } catch (err) {
    console.error('Dataset samples error:', err.message);
    res.status(500).json({ error: 'Failed to read dataset samples' });
  }
});

// POST /api/classify-image — classify uploaded image using Gemini Vision (or demo fallback)
app.post('/api/classify-image', upload.single('image'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No image uploaded' });
  }

  // If Gemini is available, use it for real classification
  if (genAI) {
    try {
      const classOptions = datasetCatalog.map(c =>
        `- "${c.id}": ${c.displayName}`
      ).join('\n');

      const prompt = `You are an expert plant pathologist AI. Analyze the provided leaf image and classify it into EXACTLY ONE of the following classes from our dataset. Respond ONLY with a JSON object in this exact format, no markdown, no explanation:

{"classId": "<one_of_the_ids_below>", "confidence": <0_to_1>, "reasoning": "<brief 1-sentence reasoning>"}

Available classes:
${classOptions}

Rules:
- Choose the class that best matches the visual symptoms in the image.
- confidence is your certainty (0.0 to 1.0).
- If the image is not a plant leaf at all, use classId "unknown" and confidence 0.0.`;

      const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

      const result = await model.generateContent({
        contents: [{
          role: 'user',
          parts: [
            { text: prompt },
            { inlineData: { mimeType: req.file.mimetype, data: req.file.buffer.toString('base64') } }
          ]
        }]
      });

      const responseText = result.response.text().trim();
      let parsed;
      try {
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        parsed = JSON.parse(jsonMatch ? jsonMatch[0] : responseText);
      } catch (parseErr) {
        console.error('Gemini response parse error:', responseText);
        return res.status(500).json({ error: 'Failed to parse classification result', raw: responseText });
      }

      const matchedClass = datasetCatalog.find(c => c.id === parsed.classId) || null;

      return res.json({
        success: true,
        classification: {
          classId: parsed.classId,
          confidence: parsed.confidence,
          reasoning: parsed.reasoning,
          matchedClass: matchedClass ? {
            id: matchedClass.id,
            displayName: matchedClass.displayName,
            plant: matchedClass.plant,
            condition: matchedClass.condition,
            diseaseName: matchedClass.diseaseName
          } : null
        }
      });
    } catch (error) {
      console.error('Classify image error:', error.message);
      return res.status(500).json({ error: 'Image classification failed: ' + error.message });
    }
  }

  // DEMO FALLBACK: Gemini not configured — return random dataset class
  console.log('[Demo] Gemini not configured. Returning demo classification from dataset catalog.');

  const randomClass = datasetCatalog[Math.floor(Math.random() * datasetCatalog.length)];
  const demoConfidence = 0.75 + (Math.random() * 0.2); // 75-95% confidence

  res.json({
    success: true,
    demo: true,
    message: 'Running in demo mode — Gemini API not configured. Add GEMINI_API_KEY to .env for real AI classification.',
    classification: {
      classId: randomClass.id,
      confidence: parseFloat(demoConfidence.toFixed(4)),
      reasoning: `Demo classification: ${randomClass.displayName} selected from dataset catalog.`,
      matchedClass: {
        id: randomClass.id,
        displayName: randomClass.displayName,
        plant: randomClass.plant,
        condition: randomClass.condition,
        diseaseName: randomClass.diseaseName
      }
    }
  });
});

// POST /api/analyze — enhanced to accept optional datasetClass
app.post('/api/analyze', async (req, res) => {
  const { disease, datasetClass } = req.body;
  if (!disease || typeof disease !== 'string') {
    return res.status(400).json({ error: 'Disease text required' });
  }

  const catalogEntry = datasetClass ? datasetCatalog.find(c => c.id === datasetClass) : null;
  const plantContext = catalogEntry ? `Plant: ${catalogEntry.plant}\nCondition: ${catalogEntry.condition}\nDataset class: ${catalogEntry.displayName}` : '';

  try {
    const prompt = `You are an expert agricultural assistant.
Analyze the given plant leaf disease and provide:
1. Disease name
2. Causes
3. Symptoms (simple words)
4. Prevention methods
5. Treatment (organic + chemical)
6. Farmer-friendly advice
Keep response simple and structured.
${plantContext ? '\n' + plantContext : ''}

Disease: ${disease}`;

    const completion = await openaiClient.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3
    });

    const analysis = completion.choices[0].message.content.trim();
    res.json({
      success: true,
      analysis,
      disease,
      datasetClass: catalogEntry ? catalogEntry.id : null,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('OpenAI analyze error:', error.message);
    res.status(500).json({ error: 'Analysis failed: ' + error.message });
  }
});

// ═══════════════════════════════════════════
// ENHANCED DISEASE MATCHING WITH DATASET INTEGRATION
// ═══════════════════════════════════════════

// Helper to find matching dataset class for a disease
function findMatchingDatasetClass(diseaseName, plantName = null) {
  const lowerDisease = diseaseName.toLowerCase();
  const lowerPlant = plantName ? plantName.toLowerCase() : null;

  return datasetCatalog.find(c => {
    const matchesDisease = c.diseaseName.toLowerCase().includes(lowerDisease) || 
                          diseaseName.toLowerCase().includes(c.diseaseName.toLowerCase());
    const matchesPlant = !lowerPlant || c.plant.toLowerCase().includes(lowerPlant);
    return matchesDisease && matchesPlant;
  });
}

// Synonym mapping for crops and diseases
const CROP_SYNONYMS = {
  'corn': ['maize', 'corn'],
  'maize': ['maize', 'corn'],
  'bell pepper': ['pepper', 'bell pepper', 'chilli', 'chili'],
  'pepper': ['pepper', 'bell pepper', 'chilli', 'chili'],
  'chilli': ['pepper', 'bell pepper', 'chilli', 'chili'],
  'chili': ['pepper', 'bell pepper', 'chilli', 'chili']
};

// Helper: normalize crop name using synonyms
function normalizeCropName(name) {
  const lower = name.toLowerCase().trim();
  for (const [canonical, synonyms] of Object.entries(CROP_SYNONYMS)) {
    if (synonyms.some(s => lower.includes(s))) {
      return canonical;
    }
  }
  return lower;
}

// Helper: extract crop and disease from structured prediction messages
function extractCropAndDisease(message) {
  const lower = message.toLowerCase();
  let crop = null;
  let disease = null;

  // Pattern 1: "Crop Name: X Disease: Y"
  const cropDiseaseMatch = message.match(/crop\s*name\s*[:\-]?\s*([^\n,]+)[,\n]?\s*disease\s*[:\-]?\s*([^\n,]+)/i);
  if (cropDiseaseMatch) {
    crop = cropDiseaseMatch[1].trim();
    disease = cropDiseaseMatch[2].trim();
  }

  // Pattern 2: "Plant: X Condition: Y" or "Plant: X Disease: Y"
  if (!crop) {
    const plantMatch = message.match(/plant\s*[:\-]?\s*([^\n,]+)/i);
    const conditionMatch = message.match(/(?:condition|disease)\s*[:\-]?\s*([^\n,]+)/i);
    if (plantMatch) crop = plantMatch[1].trim();
    if (conditionMatch) disease = conditionMatch[1].trim();
  }

  // Pattern 3: "X - Y" or "X — Y" (dataset display name format)
  if (!crop) {
    const dashMatch = message.match(/^([^-\n—]+)[-\n—]+\s*(.+)$/);
    if (dashMatch) {
      crop = dashMatch[1].trim();
      disease = dashMatch[2].trim();
    }
  }

  return { crop, disease };
}

// Enhanced disease matching with dataset context
function findMockResponse(message) {
  const lowerMessage = message.toLowerCase().trim();
  const keys = Object.keys(detailedMockResponses);
  let matchedDisease = null;
  let response = null;
  let bestScore = 0;

  // --- STEP 1: Extract structured crop/disease from prediction results ---
  const { crop: extractedCrop, disease: extractedDisease } = extractCropAndDisease(message);

  if (extractedCrop && extractedDisease) {
    const normalizedCrop = normalizeCropName(extractedCrop);
    const normalizedDisease = extractedDisease.toLowerCase();

    // Check for "healthy" condition first
    if (normalizedDisease === 'healthy') {
      const healthyKey = `${normalizedCrop} healthy`;
      if (detailedMockResponses[healthyKey]) {
        return { 
          response: detailedMockResponses[healthyKey][0], 
          matchedDisease: healthyKey 
        };
      }
    }

    // Find best matching disease key for this crop
    for (const key of keys) {
      if (key === 'default') continue;
      const keyParts = key.split(' ');
      const keyCrop = keyParts[0]; // e.g., "maize", "potato"
      const keyDiseaseWords = keyParts.slice(1); // e.g., ["common", "rust"]

      // Skip generic crop-only keys when we have a specific disease
      if (keyDiseaseWords.length === 0) continue;

      // Check if crop matches
      const cropMatches = (
        normalizedCrop === keyCrop ||
        (CROP_SYNONYMS[keyCrop] && CROP_SYNONYMS[keyCrop].includes(normalizedCrop)) ||
        (CROP_SYNONYMS[normalizedCrop] && CROP_SYNONYMS[normalizedCrop].includes(keyCrop))
      );

      if (!cropMatches) continue;

      // Score based on disease word matches
      let score = 0;
      for (const word of keyDiseaseWords) {
        if (normalizedDisease.includes(word)) {
          score += 2; // Strong match for disease word
        } else if (word.length > 3 && normalizedDisease.includes(word.substring(0, 4))) {
          score += 1; // Partial match for longer words
        }
      }

      // Boost score for longer disease names (more specific)
      score += keyDiseaseWords.length * 0.5;

      if (score > bestScore) {
        bestScore = score;
        matchedDisease = key;
      }
    }

    // If we found a good match from structured extraction, use it
    if (matchedDisease && bestScore >= 2) {
      return { 
        response: detailedMockResponses[matchedDisease][0], 
        matchedDisease 
      };
    }
  }

  // --- STEP 2: Exact phrase match for disease names ---
  if (!response) {
    // Sort keys by length (longest first) to match most specific first
    const sortedKeys = keys.filter(k => k !== 'default').sort((a, b) => b.length - a.length);
    
    for (const key of sortedKeys) {
      if (lowerMessage.includes(key)) {
        matchedDisease = key;
        response = detailedMockResponses[key][0];
        break;
      }
    }
  }

  // --- STEP 3: Word-level scoring for unstructured messages ---
  if (!response) {
    for (const key of keys) {
      if (key === 'default') continue;
      
      const keyWords = key.split(' ');
      let score = 0;
      let matchedWords = 0;

      for (const word of keyWords) {
        if (lowerMessage.includes(word)) {
          score += 2;
          matchedWords++;
        }
      }

      // Penalize generic crop-only keys when disease words are present in message
      const diseaseWords = ['rust', 'blight', 'spot', 'rot', 'wilt', 'virus', 'mosaic', 'mildew', 
                           'anthracnose', 'bacterial', 'scab', 'sigatoka', 'curl'];
      const hasDiseaseWord = diseaseWords.some(dw => lowerMessage.includes(dw));
      if (hasDiseaseWord && keyWords.length === 1) {
        score -= 5; // Strong penalty for generic crop match when disease is mentioned
      }

      // Boost for matching all words in the key
      if (matchedWords === keyWords.length) {
        score += 3;
      }

      if (score > bestScore && score >= 3) {
        bestScore = score;
        matchedDisease = key;
      }
    }

    if (matchedDisease) {
      response = detailedMockResponses[matchedDisease][0];
    }
  }

  // --- STEP 4: Dataset catalog exact match fallback ---
  if (!response && datasetCatalog.length > 0) {
    for (const catalogEntry of datasetCatalog) {
      const catalogDisease = catalogEntry.diseaseName.toLowerCase();
      const catalogPlant = catalogEntry.plant.toLowerCase();
      
      if (lowerMessage.includes(catalogDisease) && 
          (lowerMessage.includes(catalogPlant) || 
           (extractedCrop && normalizeCropName(extractedCrop) === normalizeCropName(catalogPlant)))) {
        // Find corresponding mock response
        for (const key of keys) {
          if (key === 'default') continue;
          const keyDiseasePart = key.split(' ').slice(1).join(' ');
          if (catalogDisease.includes(keyDiseasePart) || keyDiseasePart.includes(catalogDisease)) {
            matchedDisease = key;
            response = detailedMockResponses[key][0];
            break;
          }
        }
        if (response) break;
      }
    }
  }

  // --- STEP 5: Default response ---
  if (!response) {
    const defaultResponses = detailedMockResponses['default'];
    response = Array.isArray(defaultResponses) ? defaultResponses[0] : defaultResponses;
    matchedDisease = null;
  }

  return { response, matchedDisease };
}

// Format response with dataset references
function formatResponseWithDataset(response, matchedDisease) {
  if (!matchedDisease || !datasetCatalog.length) {
    return response;
  }

  // Find matching dataset classes
  const matchingClasses = datasetCatalog.filter(c => {
    if (matchedDisease.includes('potato') && c.plant.includes('Potato')) return true;
    if (matchedDisease.includes('tomato') && c.plant.includes('Tomato')) return true;
    if (matchedDisease.includes('rice') && c.plant.includes('Rice')) return true;
    if (matchedDisease.includes('wheat') && c.plant.includes('Wheat')) return true;
    if (matchedDisease.includes('banana') && c.plant.includes('Banana')) return true;
    if (matchedDisease.includes('maize') && (c.plant.includes('Corn') || c.plant.includes('Maize'))) return true;
    if (matchedDisease.includes('corn') && (c.plant.includes('Corn') || c.plant.includes('Maize'))) return true;
    if (matchedDisease.includes('pepper') && c.plant.includes('Pepper')) return true;
    return false;
  });

  let formatted = response;

  // Add dataset reference section if matches found
  if (matchingClasses.length > 0) {
    formatted += '\n\n📊 **Dataset References:**';
    matchingClasses.forEach(c => {
      formatted += `\n• ${c.displayName}`;
      formatted += `\n  - Type: ${c.condition}`;
      formatted += `\n  - Category: ${c.diseaseName}`;
    });
  }


  // Add summary paragraph at the end
  formatted += '\n\n📋 **Summary:**';
  formatted += `\nThis information is based on the AgroVision agricultural database for "${matchedDisease.replace(/_/g, ' ')}". `;
  formatted += 'The recommendations include organic and chemical solutions, prevention strategies, and expert advice tailored to this specific condition. ';
  formatted += 'For best results, apply treatments early and maintain good field hygiene. ';
  formatted += 'Regular monitoring and timely intervention are key to protecting your crop yield and quality.';

  return formatted;
}

// Helper: Find applicable medicine kits for a disease
function findMedicineKits(matchedDisease) {
  if (!matchedDisease || !medicineKits.length) {
    return [];
  }

  const diseaseKey = matchedDisease.toLowerCase();
  const applicableKits = [];

  for (const kit of medicineKits) {
    // Check if this kit matches the disease
    const kitMatches = kit.diseases.some(disease => 
      diseaseKey.includes(disease.toLowerCase()) || disease.toLowerCase().includes(diseaseKey)
    );

    // Also match by crop name from disease key
    let cropMatch = false;
    if (diseaseKey.includes('rice')) cropMatch = kit.applicableCrops.some(c => c.toLowerCase().includes('rice'));
    else if (diseaseKey.includes('potato')) cropMatch = kit.applicableCrops.some(c => c.toLowerCase().includes('potato'));
    else if (diseaseKey.includes('tomato')) cropMatch = kit.applicableCrops.some(c => c.toLowerCase().includes('tomato'));
    else if (diseaseKey.includes('wheat')) cropMatch = kit.applicableCrops.some(c => c.toLowerCase().includes('wheat'));
    else if (diseaseKey.includes('corn') || diseaseKey.includes('maize')) 
      cropMatch = kit.applicableCrops.some(c => c.toLowerCase().includes('corn') || c.toLowerCase().includes('maize'));
    else if (diseaseKey.includes('pepper') || diseaseKey.includes('bell')) 
      cropMatch = kit.applicableCrops.some(c => c.toLowerCase().includes('pepper'));
    else if (diseaseKey.includes('banana')) cropMatch = kit.applicableCrops.some(c => c.toLowerCase().includes('banana'));

    if (kitMatches || cropMatch) {
      applicableKits.push(kit);
    }
  }

  return applicableKits;
}

// GET /api/medicine-kits?disease=... — get medicine kits for a disease
app.get('/api/medicine-kits', (req, res) => {
  const disease = req.query.disease || '';
  
  if (!disease) {
    return res.json({ success: true, kits: medicineKits });
  }

  const applicableKits = findMedicineKits(disease);
  res.json({ success: true, disease, kits: applicableKits });
});

// GET /api/medicine-kits/:kitId — get specific medicine kit details
app.get('/api/medicine-kits/:kitId', (req, res) => {
  const kit = medicineKits.find(k => k.id === req.params.kitId);
  if (!kit) {
    return res.status(404).json({ error: 'Medicine kit not found' });
  }
  res.json({ success: true, kit });
});

app.get('/api/diseases/search', (req, res) => {
  const query = (req.query.q || '').toLowerCase();
  
  if (!query || query.length < 2) {
    return res.status(400).json({ error: 'Search query must be at least 2 characters' });
  }

  const keys = Object.keys(detailedMockResponses);
  const matches = [];

  // Search for matching disease keys
  for (const key of keys) {
    if (key !== 'default') {
      const words = key.split(' ');
      if (key.includes(query) || words.some(w => w.includes(query))) {
        matches.push({
          diseaseKey: key,
          displayName: key.charAt(0).toUpperCase() + key.slice(1),
          response: detailedMockResponses[key][0]
        });
      }
    }
  }

  // If no direct matches, try word-based search
  if (matches.length === 0) {
    for (const key of keys) {
      if (key !== 'default') {
        const response = detailedMockResponses[key][0];
        if (response.toLowerCase().includes(query)) {
          matches.push({
            diseaseKey: key,
            displayName: key.charAt(0).toUpperCase() + key.slice(1),
            response: response.substring(0, 200) + '...'
          });
        }
      }
    }
  }

  // Add dataset class matches
  const results = matches.slice(0, 10).map(match => {
    const datasetMatches = datasetCatalog.filter(c => 
      c.diseaseName.toLowerCase().includes(query) ||
      c.displayName.toLowerCase().includes(query)
    );

    return {
      ...match,
      datasetClasses: datasetMatches
    };
  });

  res.json({
    success: true,
    query,
    results,
    totalFound: results.length
  });
});

// GET /api/diseases/{diseaseKey} — get detailed disease info from mock_responses
app.get('/api/diseases/:diseaseKey', (req, res) => {
  const diseaseKey = req.params.diseaseKey.toLowerCase();
  
  if (!detailedMockResponses[diseaseKey]) {
    return res.status(404).json({ error: `Disease "${diseaseKey}" not found in database` });
  }

  const response = detailedMockResponses[diseaseKey][0];
  
  // Find matching dataset classes
  const datasetMatches = datasetCatalog.filter(c => {
    const diseaseWords = diseaseKey.split('_');
    return diseaseWords.some(word => 
      c.diseaseName.toLowerCase().includes(word) ||
      c.displayName.toLowerCase().includes(word)
    );
  });

  res.json({
    success: true,
    diseaseKey,
    displayName: diseaseKey.charAt(0).toUpperCase() + diseaseKey.slice(1).replace(/_/g, ' '),
    description: response,
    datasetClasses: datasetMatches,
    totalDatasetMatches: datasetMatches.length
  });
});

// GET /api/diseases — list all diseases from mock_responses
app.get('/api/diseases', (req, res) => {
  const keys = Object.keys(detailedMockResponses).filter(k => k !== 'default');
  
  const diseases = keys.map(key => ({
    id: key,
    name: key.replace(/_/g, ' ').charAt(0).toUpperCase() + key.slice(1).replace(/_/g, ' '),
    preview: detailedMockResponses[key][0].substring(0, 100) + '...'
  }));

  res.json({
    success: true,
    totalDiseases: diseases.length,
    diseases: diseases.sort((a, b) => a.name.localeCompare(b.name))
  });
});

// POST /api/chat
app.post('/api/chat', async (req, res) => {
  const { message } = req.body;

  if (!message || typeof message !== 'string') {
    return res.status(400).json({ error: 'Valid message required' });
  }

  try {
    if (openaiClient) {
      console.log('Using OpenAI API for chat...');
      const response = await openaiClient.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: `You are AgroVision AI assistant for farmers. Answer about crops, plant disease, farming tips.

User: ${message}` }],
        temperature: 0.7,
        timeout: 10000
      });

      const reply = response.choices[0].message.content.trim();
      return res.json({ reply });
    } else {
      console.log('Using enhanced mock responses from database...');
      const { response, matchedDisease } = findMockResponse(message);
      const formattedReply = formatResponseWithDataset(response, matchedDisease);
      
      // Find applicable medicine kits
      const medicineKits = findMedicineKits(matchedDisease);
      
      console.log(`[Chat] Matched disease: ${matchedDisease || 'default'}`);
      console.log(`[Chat] Found ${medicineKits.length} applicable medicine kits`);
      
      return res.json({ 
        reply: formattedReply,
        source: 'mock_responses',
        matchedDisease: matchedDisease || 'general_query',
        medicineKits: medicineKits
      });
    }
  } catch (error) {
    console.error('Chat API error:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      type: error.type,
      status: error.status
    });

    // Fallback to enhanced mock responses on error
    console.log('Falling back to enhanced mock responses due to API error...');
    const { response, matchedDisease } = findMockResponse(message);
    const formattedReply = formatResponseWithDataset(response, matchedDisease);
    const medicineKits = findMedicineKits(matchedDisease);
    
    return res.json({ 
      reply: `${formattedReply}\n\n⚠️ Note: Currently operating in demo mode with database responses.`,
      source: 'mock_responses_fallback',
      matchedDisease: matchedDisease || 'general_query',
      medicineKits: medicineKits
    });
  }
});
const server = app.listen(port, () => {
  console.log(`AgroVision server is running at http://localhost:${port}`);
});

// Unhandled rejection handler
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Uncaught exception handler
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
});

