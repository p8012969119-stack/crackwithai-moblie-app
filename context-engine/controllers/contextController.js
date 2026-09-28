const crypto = require('crypto');
const ContextRecord = require('../models/Context');

/**
 * Helper to generate a unique source ID from URL
 */
const generateSourceId = (url) => {
  return crypto.createHash('md5').update(url.toLowerCase().trim()).digest('hex');
};

/**
 * Helper to normalize reliability score into [0.0, 1.0] range
 */
const normalizeScore = (rawScore) => {
  if (typeof rawScore !== 'number' || isNaN(rawScore)) return 0.88;
  if (rawScore > 1.0) return Math.min(1.0, Number((rawScore / 100).toFixed(2)));
  return Math.max(0.0, Math.min(1.0, Number(rawScore.toFixed(2))));
};

/**
 * Controller: processContextPipeline
 * Pipeline step 1: Validate request input
 * Pipeline step 2: Execute Tavily Search API call (top 3 results)
 * Pipeline step 3: Map & sanitize raw payload to strict schema
 * Pipeline step 4: Bulk upsert database records into MongoDB
 * Pipeline step 5: Return clean JSON array payload to caller
 */
const processContextPipeline = async (req, res) => {
  try {
    const { userQuery, tavilyApiKey } = req.body;

    // Step 1: Input Validation
    if (!userQuery || typeof userQuery !== 'string' || !userQuery.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Missing or invalid userQuery parameter.'
      });
    }

    const apiKey = tavilyApiKey || process.env.TAVILY_API_KEY;
    if (!apiKey || typeof apiKey !== 'string' || !apiKey.trim()) {
      return res.status(401).json({
        success: false,
        error: 'Tavily API key is required. Please provide it in the request body or server environment.'
      });
    }

    console.log(`[Context Pipeline] Executing context search for query: "${userQuery.trim()}"`);

    // Step 2: Query Tavily Search API
    const tavilyEndpoint = 'https://api.tavily.com/search';
    const tavilyPayload = {
      api_key: apiKey.trim(),
      query: userQuery.trim(),
      max_results: 3,
      include_answer: true,
      search_depth: 'advanced',
      include_domains: []
    };

    const tavilyResponse = await fetch(tavilyEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(tavilyPayload)
    });

    if (!tavilyResponse.ok) {
      const errText = await tavilyResponse.text().catch(() => '');
      console.error(`[Context Pipeline Error] Tavily API HTTP ${tavilyResponse.status}:`, errText);
      return res.status(tavilyResponse.status).json({
        success: false,
        error: `Tavily API request failed with status ${tavilyResponse.status}`,
        details: errText || tavilyResponse.statusText
      });
    }

    const tavilyData = await tavilyResponse.json();
    const rawResults = Array.isArray(tavilyData.results) ? tavilyData.results : [];

    if (rawResults.length === 0) {
      return res.status(200).json({
        success: true,
        count: 0,
        query: userQuery.trim(),
        answer: tavilyData.answer || 'No search results returned for the given query.',
        data: []
      });
    }

    // Step 3: Map & Sanitize incoming data into ContextRecord Schema
    const sanitizedRecords = rawResults.slice(0, 3).map((item, index) => {
      const itemUrl = item.url || `https://unknown-source.org/${index}`;
      const itemScore = item.score !== undefined ? item.score : (0.92 - index * 0.05);

      return {
        query: userQuery.trim(),
        sourceId: generateSourceId(itemUrl),
        title: (item.title || 'Untitled Knowledge Source').trim(),
        extractedFacts: (item.content || item.snippet || 'No extracted content available.').trim(),
        reliabilityScore: normalizeScore(itemScore),
        url: itemUrl,
        timestamp: new Date()
      };
    });

    // Step 4: Bulk Upsert into MongoDB
    let savedRecords = sanitizedRecords;
    try {
      if (ContextRecord.db && ContextRecord.db.readyState === 1) {
        const bulkOperations = sanitizedRecords.map((doc) => ({
          updateOne: {
            filter: { query: doc.query, sourceId: doc.sourceId },
            update: { $set: doc },
            upsert: true
          }
        }));

        await ContextRecord.bulkWrite(bulkOperations, { ordered: false });
        console.log(`[Context Pipeline] Bulk upserted ${sanitizedRecords.length} records to MongoDB.`);

        // Fetch back clean stored documents
        savedRecords = await ContextRecord.find({
          query: userQuery.trim(),
          sourceId: { $in: sanitizedRecords.map((r) => r.sourceId) }
        }).sort({ reliabilityScore: -1 });
      } else {
        console.warn('[Context Pipeline Warning] MongoDB offline. Returning sanitized pipeline results directly.');
      }
    } catch (dbError) {
      console.error('[Context Pipeline DB Error] Bulk insert issue:', dbError.message);
      // Fallback: continue returning sanitized records
    }

    // Step 5: Return clean JSON payload
    return res.status(200).json({
      success: true,
      count: savedRecords.length,
      query: userQuery.trim(),
      answer: tavilyData.answer || null,
      data: savedRecords
    });
  } catch (error) {
    console.error('[Context Pipeline Fatal Error]:', error);
    return res.status(500).json({
      success: false,
      error: 'An internal error occurred while processing the context pipeline.',
      message: error.message
    });
  }
};

/**
 * Controller: getContextHistory
 * Fetch stored context records from database
 */
const getContextHistory = async (req, res) => {
  try {
    if (!ContextRecord.db || ContextRecord.db.readyState !== 1) {
      return res.status(200).json({
        success: true,
        count: 0,
        data: [],
        note: 'Database disconnected.'
      });
    }

    const limit = Math.min(50, parseInt(req.query.limit || '20', 10));
    const records = await ContextRecord.find().sort({ timestamp: -1 }).limit(limit);

    return res.status(200).json({
      success: true,
      count: records.length,
      data: records
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

module.exports = {
  processContextPipeline,
  getContextHistory
};
