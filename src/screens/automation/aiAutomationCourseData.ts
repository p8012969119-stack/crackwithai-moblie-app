export interface AIAutomationStage {
  id: number;
  title: string;
  subtitle: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  duration: string;
  category: string;
  concept: string;
  explanation: string;
  user_raw_idea: string;
  engineered_prompt: string;
  why_it_works: string;
  starterCode: string;
  moduleNumber: number;
  practiceTask: {
    title: string;
    description: string;
    requirements: string[];
    starterCode?: string;
    expectedOutput?: string;
  };
}

export interface AIAutomationModule {
  id: number;
  moduleNumber: number;
  title: string;
  shortDesc: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  lessonCount: number;
  stageIds: number[];
  icon: string;
}

export const AI_AUTOMATION_MODULES: AIAutomationModule[] = [
  {
    id: 1,
    moduleNumber: 1,
    title: 'Module 1 — AI Automation Foundations',
    shortDesc: 'Master triggers, actions, variables, AI reasoning, and prompt design for workflows.',
    level: 'Beginner',
    lessonCount: 7,
    stageIds: [1, 2, 3, 4, 5, 6, 7],
    icon: 'zap'
  },
  {
    id: 2,
    moduleNumber: 2,
    title: 'Module 2 — Trigger, Flow & Logic Engine',
    shortDesc: 'Master Webhooks, JSON parsing, API auth, conditional routing, and loop processing.',
    level: 'Beginner',
    lessonCount: 7,
    stageIds: [8, 9, 10, 11, 12, 13, 14],
    icon: 'sliders'
  },
  {
    id: 3,
    moduleNumber: 3,
    title: 'Module 3 — RAG & Vector Memory Automations',
    shortDesc: 'Build knowledge retrieval pipelines, chunking strategies, and vector search workflows.',
    level: 'Intermediate',
    lessonCount: 7,
    stageIds: [15, 16, 17, 18, 19, 20, 21],
    icon: 'database'
  },
  {
    id: 4,
    moduleNumber: 4,
    title: 'Module 4 — Multi-Agent Systems & Orchestration',
    shortDesc: 'Architect autonomous multi-agent networks, tools, human approval, and error recovery.',
    level: 'Intermediate',
    lessonCount: 7,
    stageIds: [22, 23, 24, 25, 26, 27, 28],
    icon: 'cpu'
  },
  {
    id: 5,
    moduleNumber: 5,
    title: 'Module 5 — Enterprise Integration & Security',
    shortDesc: 'Integrate Slack, CRM, Email, OAuth2, rate limiting, and defensive security controls.',
    level: 'Advanced',
    lessonCount: 7,
    stageIds: [29, 30, 31, 32, 33, 34, 35],
    icon: 'shield'
  },
  {
    id: 6,
    moduleNumber: 6,
    title: 'Module 6 — Production Ops, Reliability & Testing',
    shortDesc: 'Deploy monitoring, telemetry logs, retry strategies, and automated workflow test suites.',
    level: 'Advanced',
    lessonCount: 7,
    stageIds: [36, 37, 38, 39, 40, 41, 42],
    icon: 'activity'
  },
  {
    id: 7,
    moduleNumber: 7,
    title: 'Module 7 — Real-World Capstone Systems',
    shortDesc: 'Build end-to-end production AI automation systems for customer support, lead ops & dev pipelines.',
    level: 'Advanced',
    lessonCount: 7,
    stageIds: [43, 44, 45, 46, 47, 48, 49],
    icon: 'layers'
  }
];

export const AI_AUTOMATION_STAGES: AIAutomationStage[] = [
  // MODULE 1
  {
    id: 1,
    moduleNumber: 1,
    title: 'Lesson 1 — What is Automation?',
    subtitle: 'Learn fundamental trigger-action automation mechanics.',
    level: 'Beginner',
    duration: '10 mins',
    category: 'Foundations',
    concept: 'What is Automation?',
    explanation: 'Automation replaces manual repetitive work with programmatic triggers and actions.',
    user_raw_idea: 'Manually copy customer emails into Excel every morning.',
    engineered_prompt: '[TRIGGER: New Email] -> [EXTRACT: Details] -> [ACTION: Append Row to Spreadsheet]',
    why_it_works: 'Eliminates human delay and manual data entry errors.',
    starterCode: '// Trigger & Action\nonEvent("new_signup", (user) => {\n  saveToDatabase(user);\n  sendWelcomeEmail(user.email);\n});',
    practiceTask: {
      title: 'Define an Automated Trigger-Action Pair',
      description: 'Write a basic trigger and action pair for a user registration event.',
      requirements: ['Specify the trigger event', 'Define at least 2 automated downstream actions', 'Format as clean logic block'],
      starterCode: '// Trigger: New Payment Success\n// Downstream Actions:\n',
      expectedOutput: 'Trigger: New Payment Success -> Action 1: Create Invoice, Action 2: Send Confirmation Email.'
    }
  },
  {
    id: 2,
    moduleNumber: 1,
    title: 'Lesson 2 — Traditional vs AI Automation',
    subtitle: 'Understand deterministic rules vs AI contextual reasoning.',
    level: 'Beginner',
    duration: '10 mins',
    category: 'Foundations',
    concept: 'Traditional vs AI Automation',
    explanation: 'Traditional automation follows hardcoded IF/ELSE rules for structured data; AI automation handles unstructured text, sentiment, and decision making.',
    user_raw_idea: 'If subject line contains "Refund", move to Refund folder.',
    engineered_prompt: '[INPUT: Email] -> [AI CLASSIFIER: Intent & Sentiment] -> [IF: Angry Refund] -> [ACTION: Escalate]',
    why_it_works: 'AI models interpret context and nuance that boolean rules miss.',
    starterCode: 'const category = await ai.classifyText(emailBody, ["Refund", "Support", "Spam"]);\nif (category === "Refund") escalateTicket(emailId);',
    practiceTask: {
      title: 'Distinguish Rule-Based vs AI Automation',
      description: 'Identify whether a workflow step requires traditional rule logic or AI understanding.',
      requirements: ['Provide 1 example of rule-based logic', 'Provide 1 example of AI-based contextual logic'],
      starterCode: '// Rule-Based Example:\n// AI-Based Example:\n'
    }
  },
  {
    id: 3,
    moduleNumber: 1,
    title: 'Lesson 3 — Triggers, Actions, Conditions and Workflows',
    subtitle: 'Build workflow pipelines with event triggers, filtering rules, and downstream tasks.',
    level: 'Beginner',
    duration: '10 mins',
    category: 'Foundations',
    concept: 'Triggers, Actions & Conditions',
    explanation: 'Workflows consist of Triggers (initiating event), Conditions (filtering logic), and Actions (tasks performed).',
    user_raw_idea: 'Process customer reviews.',
    engineered_prompt: 'Trigger: Review Submitted -> Condition: Rating < 3 Stars -> Action: Notify Support Team on Slack.',
    why_it_works: 'Conditions prevent unnecessary execution and route tasks accurately.',
    starterCode: 'workflow.on("review_submitted")\n  .if(review => review.stars < 3)\n  .then(review => sendSlackAlert(review));',
    practiceTask: {
      title: 'Design a 3-Step Workflow Pipeline',
      description: 'Define a complete Trigger -> Condition -> Action flow for lead management.',
      requirements: ['Set a valid trigger event', 'Add a numeric or status condition', 'Define an automated action'],
      starterCode: '// Trigger:\n// Condition:\n// Action:\n'
    }
  },
  {
    id: 4,
    moduleNumber: 1,
    title: 'Lesson 4 — Core Building Blocks of Automation',
    subtitle: 'Learn input nodes, processing nodes, output nodes, and error handler blocks.',
    level: 'Beginner',
    duration: '10 mins',
    category: 'Foundations',
    concept: 'Core Building Blocks of Automation',
    explanation: 'Automated systems consist of Input Nodes, Processing Nodes, Output Nodes, and Error Handlers.',
    user_raw_idea: 'Process incoming PDF invoice.',
    engineered_prompt: '[Input Node: File Upload] -> [Processing Node: OCR + AI Extractor] -> [Output Node: ERP Database] -> [Catch Block: Flag Manual Review]',
    why_it_works: 'Modular node architecture isolates failures and simplifies debugging.',
    starterCode: 'try {\n  const invoiceData = await processPdf(file);\n  await erp.createInvoice(invoiceData);\n} catch (err) {\n  await notifyError(err);\n}',
    practiceTask: {
      title: 'Map Node Components',
      description: 'Break down an automated expense report system into Input, Processing, and Output nodes.',
      requirements: ['Identify Input Node', 'Identify Processing Node', 'Identify Output Node'],
      starterCode: '// Input Node:\n// Processing Node:\n// Output Node:\n'
    }
  },
  {
    id: 5,
    moduleNumber: 1,
    title: 'Lesson 5 — Data Passing & Variables in Workflows',
    subtitle: 'Pass JSON payload variables across multi-step workflow nodes.',
    level: 'Beginner',
    duration: '10 mins',
    category: 'Foundations',
    concept: 'Data Passing & Variables',
    explanation: 'Variables store transient data across nodes, allowing subsequent steps to access payload fields.',
    user_raw_idea: 'Use customer name from step 1 in email step 3.',
    engineered_prompt: 'Step 1: extract {{ $json.customerName }} -> Step 3: Send email to {{ $json.customerEmail }} with body "Hello {{ $json.customerName }}"',
    why_it_works: 'JSON references ensure data consistency without hardcoding static values.',
    starterCode: 'const customerName = $node["Webhook"].json["customer_name"];\nconst message = `Hello ${customerName}, your order is confirmed!`;',
    practiceTask: {
      title: 'Reference Dynamic Variables',
      description: 'Extract and construct a dynamic string using variable references.',
      requirements: ['Extract name and orderId from JSON', 'Construct output message string'],
      starterCode: 'const payload = { customer_name: "Alice", order_id: "ORD-99" };\n// Dynamic string construction:\n'
    }
  },
  {
    id: 6,
    moduleNumber: 1,
    title: 'Lesson 6 — Designing Prompts for Automation Workflows',
    subtitle: 'Structure LLM prompts specifically for deterministic workflow outputs.',
    level: 'Beginner',
    duration: '10 mins',
    category: 'Foundations',
    concept: 'Designing Prompts for Workflows',
    explanation: 'Prompts in automation require strict instructions, system boundaries, and structured format constraints.',
    user_raw_idea: 'Summarize customer ticket for support agents.',
    engineered_prompt: '[SYSTEM] You are an automated classifier. Return JSON only: {"category": string, "urgency": "LOW"|"MED"|"HIGH"}.\n[INPUT]: Ticket text.',
    why_it_works: 'Strict output constraints ensure programmatic downstream nodes can parse the AI response.',
    starterCode: 'const systemPrompt = "Return ONLY valid JSON with keys: intent, sentiment, summary.";\nconst response = await ai.complete({ prompt, systemPrompt });',
    practiceTask: {
      title: 'Draft a Deterministic JSON Automation Prompt',
      description: 'Create a prompt that forces the AI to output clean JSON.',
      requirements: ['Define system constraints', 'Specify exact JSON schema output', 'Prohibit conversational filler text'],
      starterCode: 'const prompt = `System: ...\nInput: ...`;'
    }
  },
  {
    id: 7,
    moduleNumber: 1,
    title: 'Lesson 7 — Error Handling & Retry Mindset',
    subtitle: 'Implement robust fallback logic and exponential backoff retry policies.',
    level: 'Beginner',
    duration: '10 mins',
    category: 'Foundations',
    concept: 'Error Handling & Retry Policy',
    explanation: 'Network glitches, rate limits, and API failures require automated retries and fallback error paths.',
    user_raw_idea: 'If API fails, stop workflow.',
    engineered_prompt: 'Call API -> If 429/500 Error -> Retry up to 3 times with exponential backoff (2s, 4s, 8s) -> If failed 3x -> Route to Alert Queue.',
    why_it_works: 'Transient network spikes auto-recover without failing the entire system.',
    starterCode: 'async function callWithRetry(fn, retries = 3, delay = 1000) {\n  for (let i = 0; i < retries; i++) {\n    try { return await fn(); } catch (err) { await sleep(delay * Math.pow(2, i)); }\n  }\n  throw new Error("Max retries exceeded");\n}',
    practiceTask: {
      title: 'Build Retry Logic',
      description: 'Implement a function that retries an API call up to 3 times on failure.',
      requirements: ['Catch API exception', 'Retry after delay', 'Log attempt count'],
      starterCode: 'async function safeApiCall() {\n  // Implementation here\n}'
    }
  },

  // MODULE 2
  {
    id: 8,
    moduleNumber: 2,
    title: 'Lesson 8 — Understanding Webhooks',
    subtitle: 'Master inbound event HTTP webhooks for real-time automation triggers.',
    level: 'Beginner',
    duration: '10 mins',
    category: 'Flow & Logic',
    concept: 'Understanding Webhooks',
    explanation: 'Webhooks deliver real-time HTTP POST data payloads immediately when an event occurs on external services.',
    user_raw_idea: 'Check Stripe every 5 minutes for new payments.',
    engineered_prompt: '[Stripe Event: payment_intent.succeeded] -> HTTP POST to https://api.myapp.com/webhooks/stripe -> Immediately trigger fulfillment workflow.',
    why_it_works: 'Replaces wasteful HTTP polling with instantaneous event-driven execution.',
    starterCode: 'app.post("/webhooks/stripe", (req, res) => {\n  const event = req.body;\n  if (event.type === "payment_intent.succeeded") {\n    triggerFulfillment(event.data.object);\n  }\n  res.status(200).send("Received");\n});',
    practiceTask: {
      title: 'Create Webhook Handler Endpoint',
      description: 'Define an Express endpoint that receives a POST webhook and verifies payload status.',
      requirements: ['Accept POST request', 'Extract event type', 'Return HTTP 200 acknowledgment'],
      starterCode: 'app.post("/webhook", (req, res) => {\n  // Your code here\n});'
    }
  },
  {
    id: 9,
    moduleNumber: 2,
    title: 'Lesson 9 — Parsing JSON & Dynamic Data',
    subtitle: 'Navigate and transform complex JSON trees and nested object structures.',
    level: 'Beginner',
    duration: '10 mins',
    category: 'Flow & Logic',
    concept: 'Parsing JSON & Dynamic Data',
    explanation: 'JSON is the standard format for web data exchange. Extracting nested properties is vital for workflow data mapping.',
    user_raw_idea: 'Extract buyer city from nested webhook payload.',
    engineered_prompt: 'const buyerCity = payload?.customer?.shipping?.address?.city || "Default City";',
    why_it_works: 'Optional chaining prevents runtime exceptions when optional payload fields are omitted.',
    starterCode: 'const rawData = \'{"user": {"profile": {"email": "user@test.com"}}}\';\nconst parsed = JSON.parse(rawData);\nconsole.log(parsed.user.profile.email);',
    practiceTask: {
      title: 'Safely Extract Nested Properties',
      description: 'Extract shipping postal code from a multi-level JSON object safely.',
      requirements: ['Parse JSON string', 'Use optional chaining', 'Provide default fallback value'],
      starterCode: 'const payload = { data: { order: { shipping: { zip: "90210" } } } };\n// Extract zip safely:\n'
    }
  },
  {
    id: 10,
    moduleNumber: 2,
    title: 'Lesson 10 — API Authentication (API Keys, Bearer, OAuth2)',
    subtitle: 'Secure automation integrations using standard API authorization mechanisms.',
    level: 'Beginner',
    duration: '10 mins',
    category: 'Flow & Logic',
    concept: 'API Authentication Protocols',
    explanation: 'APIs protect resources using Header API Keys, Bearer Tokens, or OAuth2 Access Tokens.',
    user_raw_idea: 'Send requests without authentication headers.',
    engineered_prompt: 'headers: { "Authorization": "Bearer " + process.env.API_SECRET_KEY, "Content-Type": "application/json" }',
    why_it_works: 'Encrypted bearer tokens verify identity without sending cleartext credentials in query parameters.',
    starterCode: 'const response = await fetch("https://api.openai.com/v1/models", {\n  headers: {\n    "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`\n  }\n});',
    practiceTask: {
      title: 'Configure Authenticated HTTP Request',
      description: 'Construct a fetch call with custom Bearer token headers.',
      requirements: ['Set Authorization header with Bearer token', 'Set Content-Type header to application/json'],
      starterCode: 'const apiKey = "secret_123";\n// Construct fetch request:\n'
    }
  },
  {
    id: 11,
    moduleNumber: 2,
    title: 'Lesson 11 — Conditional Routing & Branching Logic',
    subtitle: 'Route payloads dynamically through multi-branch workflows based on conditions.',
    level: 'Beginner',
    duration: '10 mins',
    category: 'Flow & Logic',
    concept: 'Conditional Branching Logic',
    explanation: 'Branching nodes direct payload execution based on evaluated boolean expressions.',
    user_raw_idea: 'Send all support tickets to general queue.',
    engineered_prompt: 'IF leadScore >= 80 -> Route to High Priority Sales Branch; ELSE IF leadScore >= 40 -> Route to Nurture Email Branch; ELSE -> Route to Archive.',
    why_it_works: 'Automates customer segmentation instantly at ingestion.',
    starterCode: 'if (lead.score >= 80) {\n  await assignSalesRep(lead);\n} else if (lead.score >= 40) {\n  await addSequence(lead, "nurture_drip");\n} else {\n  await archiveLead(lead);\n}',
    practiceTask: {
      title: 'Implement Multi-Branch Router',
      description: 'Write a router function that categorizes tickets based on urgency score.',
      requirements: ['Urgency >= 8: Instant SMS Alert', 'Urgency 5-7: Email Alert', 'Urgency < 5: Queue Ticket'],
      starterCode: 'function routeTicket(urgencyScore) {\n  // Code here\n}'
    }
  },
  {
    id: 12,
    moduleNumber: 2,
    title: 'Lesson 12 — Loop & Batch Processing',
    subtitle: 'Iterate over lists of records efficiently without exceeding memory or rate limits.',
    level: 'Beginner',
    duration: '10 mins',
    category: 'Flow & Logic',
    concept: 'Loop & Batch Processing',
    explanation: 'Loop nodes process collections of data items sequentially or in controlled parallel batches.',
    user_raw_idea: 'Loop 10,000 items simultaneously in a single uncontrolled loop.',
    engineered_prompt: 'Process 1,000 records in batches of 50 items with 500ms delay between batches.',
    why_it_works: 'Controlled batch sizes prevent server memory exhaustion and API rate-limiting errors.',
    starterCode: 'for (let i = 0; i < items.length; i += batchSize) {\n  const batch = items.slice(i, i + batchSize);\n  await Promise.all(batch.map(item => processItem(item)));\n  await sleep(500);\n}',
    practiceTask: {
      title: 'Design a Batch Processor',
      description: 'Write a loop that breaks an array into chunks of 10 and processes them.',
      requirements: ['Chunk input array into sub-arrays', 'Simulate async processing per batch'],
      starterCode: 'const items = Array.from({length: 35}, (_, i) => i + 1);\n// Batch processor implementation:\n'
    }
  },
  {
    id: 13,
    moduleNumber: 2,
    title: 'Lesson 13 — Data Filtering & Transformation',
    subtitle: 'Filter out low-signal items and transform raw records into normalized schemas.',
    level: 'Beginner',
    duration: '10 mins',
    category: 'Flow & Logic',
    concept: 'Data Filtering & Transformation',
    explanation: 'Filtering removes invalid/duplicate records while transformation maps fields into target schemas.',
    user_raw_idea: 'Send raw dirty API response straight to database.',
    engineered_prompt: 'items.filter(item => item.email && item.status === "ACTIVE").map(item => ({ id: item.id, email: item.email.toLowerCase() }))',
    why_it_works: 'Clean, sanitized input schemas protect downstream databases from corrupt entries.',
    starterCode: 'const cleanData = rawArray\n  .filter(row => row.isActive)\n  .map(row => ({ name: row.full_name.trim(), email: row.email_address.toLowerCase() }));',
    practiceTask: {
      title: 'Filter & Transform Payload',
      description: 'Filter active users from array and map output to lowercase email objects.',
      requirements: ['Filter users where active === true', 'Map to { userId, email } format'],
      starterCode: 'const users = [{ id: 1, email: "A@X.COM", active: true }, { id: 2, email: "B@X.COM", active: false }];\n// Transform logic:\n'
    }
  },
  {
    id: 14,
    moduleNumber: 2,
    title: 'Lesson 14 — State Management & Delay Nodes',
    subtitle: 'Manage workflow execution state across delayed intervals and multi-day steps.',
    level: 'Beginner',
    duration: '10 mins',
    category: 'Flow & Logic',
    concept: 'State Management & Delays',
    explanation: 'State management persists execution context so workflows can pause for hours/days and resume reliably.',
    user_raw_idea: 'Keep an active node process sleeping in memory for 3 days.',
    engineered_prompt: 'Persist state { workflowId, userId, step: 2 } to Redis DB -> Schedule cron trigger for +72 hours -> Resume workflow from state.',
    why_it_works: 'Offloading state to persistent storage frees active memory and enables long-running sequences.',
    starterCode: 'await stateStore.saveState(executionId, { step: "WAIT_DAY_3", data: currentPayload });\nawait scheduleTimer(executionId, "72h");',
    practiceTask: {
      title: 'Persist Workflow State',
      description: 'Store execution state in a key-value object and simulate step retrieval after pause.',
      requirements: ['Create state object with step ID and timestamp', 'Simulate retrieval by execution ID'],
      starterCode: 'const stateStore = new Map();\n// Save state implementation:\n'
    }
  },

  // MODULE 3
  {
    id: 15,
    moduleNumber: 3,
    title: 'Lesson 15 — Introduction to RAG for Automations',
    subtitle: 'Combine vector retrieval with LLM execution for data-backed automated answers.',
    level: 'Intermediate',
    duration: '10 mins',
    category: 'RAG & Memory',
    concept: 'Retrieval-Augmented Generation (RAG)',
    explanation: 'RAG dynamically queries external vector databases to inject accurate document context into LLM prompts.',
    user_raw_idea: 'Ask LLM about internal company policies without providing document access.',
    engineered_prompt: '1. User Query -> Embed Query -> Search Vector DB -> Inject top 3 matches -> 2. LLM generates answer using injected matches only.',
    why_it_works: 'Grounds model answers in proprietary truth without needing costly model fine-tuning.',
    starterCode: 'const contextDocs = await vectorDb.query(userQuery, { topK: 3 });\nconst prompt = `Context:\n${contextDocs.join("\n")}\n\nQuestion: ${userQuery}`;\nconst response = await ai.complete(prompt);',
    practiceTask: {
      title: 'Build RAG Context Assembler',
      description: 'Concatenate top matching document snippets into a RAG prompt context.',
      requirements: ['Receive array of document strings', 'Combine into structured context block', 'Append user question'],
      starterCode: 'const docs = ["Policy A: Remote work allowed 2 days.", "Policy B: Core hours 10-4."];\n// Prompt assembler:\n'
    }
  },
  {
    id: 16,
    moduleNumber: 3,
    title: 'Lesson 16 — Document Ingestion & Chunking Strategies',
    subtitle: 'Split large documents into optimal chunk sizes for embedding search precision.',
    level: 'Intermediate',
    duration: '10 mins',
    category: 'RAG & Memory',
    concept: 'Chunking Strategies',
    explanation: 'Chunking breaks long documents into smaller semantic units (e.g. 500 tokens with 50 token overlap) for vector index building.',
    user_raw_idea: 'Embed an entire 200-page PDF as a single vector.',
    engineered_prompt: 'Recursive Character Splitting: Chunk Size = 500 tokens, Overlap = 50 tokens, Separators = ["\n\n", "\n", " "].',
    why_it_works: 'Small, semantic chunks improve retrieval precision and prevent diluted vector math averages.',
    starterCode: 'const chunks = textSplitter.splitText(documentText, {\n  chunkSize: 500,\n  chunkOverlap: 50\n});',
    practiceTask: {
      title: 'Implement Basic Text Chunker',
      description: 'Write a chunker that splits paragraph text into array of 100-word chunks.',
      requirements: ['Split input string by spaces', 'Slice array into 100-word blocks', 'Return chunk array'],
      starterCode: 'function chunkText(text, chunkSize = 100) {\n  // Implementation here\n}'
    }
  },
  {
    id: 17,
    moduleNumber: 3,
    title: 'Lesson 17 — Vector Embeddings & Vector Databases',
    subtitle: 'Convert text to floating point vectors and index them in vector stores.',
    level: 'Intermediate',
    duration: '10 mins',
    category: 'RAG & Memory',
    concept: 'Vector Embeddings & Databases',
    explanation: 'Embedding models convert text chunks into numerical vectors (e.g. 1536-dim arrays) stored in vector DBs like Pinecone, Qdrant, or PGVector.',
    user_raw_idea: 'Search documents using exact keyword string matching only.',
    engineered_prompt: 'const vector = await openai.embeddings.create({ input: chunk, model: "text-embedding-3-small" });\nawait index.upsert({ id, values: vector.data[0].embedding, metadata: { text: chunk } });',
    why_it_works: 'Vector distance calculations capture semantic meaning rather than exact keyword matches.',
    starterCode: 'const embedding = await getEmbedding("Employee Healthcare Policy");\nawait vectorStore.insert({ id: "doc_1", vector: embedding, text: "Employee Healthcare Policy" });',
    practiceTask: {
      title: 'Format Vector Upsert Payload',
      description: 'Construct a valid vector database insertion payload with ID, vector, and metadata.',
      requirements: ['Assign unique ID', 'Include 1536 float array mockup', 'Attach raw text metadata'],
      starterCode: 'function createVectorPayload(id, text, vector) {\n  // Return object here\n}'
    }
  },
  {
    id: 18,
    moduleNumber: 3,
    title: 'Lesson 18 — Hybrid Search & Reranking Workflows',
    subtitle: 'Combine BM25 keyword matching with vector search and cross-encoder reranking.',
    level: 'Intermediate',
    duration: '10 mins',
    category: 'RAG & Memory',
    concept: 'Hybrid Search & Reranking',
    explanation: 'Hybrid search merges vector semantic matches with traditional BM25 keyword results, followed by Cohere Rerank for optimal relevance.',
    user_raw_idea: 'Rely solely on cosine similarity for technical product serial numbers.',
    engineered_prompt: 'Results = Merge( VectorSearch(topK=20), BM25KeywordSearch(topK=20) ) -> Rerank(Results, userQuery) -> Top 5 to LLM Context.',
    why_it_works: 'Keyword search captures exact alphanumeric codes while vector search captures general intent; reranking picks the true winners.',
    starterCode: 'const vectorResults = await vectorDb.search(query);\nconst keywordResults = await bm25.search(query);\nconst merged = deduplicate([...vectorResults, ...keywordResults]);\nconst reranked = await cohere.rerank({ query, documents: merged, topN: 5 });',
    practiceTask: {
      title: 'Deduplicate Search Results',
      description: 'Write a function to merge and deduplicate two arrays of document matches by ID.',
      requirements: ['Combine vector and keyword result lists', 'Remove duplicate document IDs', 'Preserve initial order'],
      starterCode: 'function mergeResults(vectorHits, keywordHits) {\n  // Deduplication code:\n}'
    }
  },
  {
    id: 19,
    moduleNumber: 3,
    title: 'Lesson 19 — Knowledge Graph RAG Pipelines',
    subtitle: 'Link entities, relationships, and concepts in graph databases for complex RAG.',
    level: 'Intermediate',
    duration: '10 mins',
    category: 'RAG & Memory',
    concept: 'Knowledge Graph RAG',
    explanation: 'Graph RAG extracts entities (Person, Org, Product) and relationships (WORKS_AT, MANUFACTURES) into graph databases like Neo4j.',
    user_raw_idea: 'Ask RAG about multi-hop relations like "Who manages the team that built Product X?"',
    engineered_prompt: 'MATCH (p:Product {name: "Product X"})<-[:BUILT]-(t:Team)<-[:MANAGES]-(m:Manager) RETURN m.name, t.name',
    why_it_works: 'Graphs preserve multi-step relational links that unstructured vector chunks obscure.',
    starterCode: 'const graphQuery = `MATCH (e:Entity {name: $entity})-[:RELATED_TO*1..2]-(connected) RETURN connected`;\nconst graphContext = await neo4j.run(graphQuery, { entity: "AI Core" });',
    practiceTask: {
      title: 'Define Graph Triplet Schema',
      description: 'Extract Subject -> Relationship -> Object triplets from a sample sentence.',
      requirements: ['Identify Subject entity', 'Identify Relationship edge', 'Identify Object entity'],
      starterCode: 'const sentence = "Acme Corp acquired TechStart in 2024.";\n// Graph triplet:\n'
    }
  },
  {
    id: 20,
    moduleNumber: 3,
    title: 'Lesson 20 — Automated Knowledge Base Ingestion',
    subtitle: 'Build continuous ingestion workflows that auto-sync Google Drive, Notion, and Slack.',
    level: 'Intermediate',
    duration: '10 mins',
    category: 'RAG & Memory',
    concept: 'Automated Knowledge Ingestion',
    explanation: 'Continuous ingestion monitors source tools via webhooks/polling, detects document modifications, and updates the vector database automatically.',
    user_raw_idea: 'Manually re-embed and upload documents once a month.',
    engineered_prompt: 'Trigger: Notion Page Updated -> Extract Clean Markdown -> Diff against Vector DB -> Delete old vectors -> Insert new vectors.',
    why_it_works: 'Guarantees AI RAG workflows always operate on fresh, up-to-date document truth.',
    starterCode: 'onNotionUpdate(async (page) => {\n  await vectorDb.deleteByMetadata({ pageId: page.id });\n  const chunks = chunkMarkdown(page.content);\n  await vectorDb.upsertChunks(page.id, chunks);\n});',
    practiceTask: {
      title: 'Design Sync Trigger Flow',
      description: 'Write logic steps for updating an outdated document vector in index.',
      requirements: ['Step 1: Delete existing vectors by docId', 'Step 2: Generate new embeddings', 'Step 3: Insert new vectors'],
      starterCode: 'async function syncDocument(docId, newText) {\n  // Implementation here\n}'
    }
  },
  {
    id: 21,
    moduleNumber: 3,
    title: 'Lesson 21 — Memory & Conversation Persistence',
    subtitle: 'Maintain short-term chat memory and long-term user memory across automation sessions.',
    level: 'Intermediate',
    duration: '10 mins',
    category: 'RAG & Memory',
    concept: 'Memory & Conversation Persistence',
    explanation: 'Short-term memory buffers recent message history; long-term memory extracts user facts into vector stores for future sessions.',
    user_raw_idea: 'Pass the entire 50-turn conversation history in every API request.',
    engineered_prompt: '1. Keep last 6 chat turns in active prompt window.\n2. Summarize older turns into a running state object.\n3. Extract key user preferences to long-term memory vector store.',
    why_it_works: 'Prevents context window overflow while preserving context across extended interactions.',
    starterCode: 'const recentHistory = chatLog.slice(-6);\nconst summary = await summarizeOlder(chatLog.slice(0, -6));\nconst fullContext = `Summary: ${summary}\nRecent:\n${recentHistory.join("\n")}`;',
    practiceTask: {
      title: 'Implement Windowed Memory Buffer',
      description: 'Write a helper function that returns only the N most recent chat messages.',
      requirements: ['Accept message array', 'Slice last N entries', 'Return windowed array'],
      starterCode: 'function getWindowedMemory(messages, windowSize = 6) {\n  // Return last N messages:\n}'
    }
  },

  // MODULE 4
  {
    id: 22,
    moduleNumber: 4,
    title: 'Lesson 22 — What is an AI Agent?',
    subtitle: 'Learn the core agent loop: Perception -> Planning -> Tool Execution -> Reflection.',
    level: 'Intermediate',
    duration: '10 mins',
    category: 'Multi-Agent',
    concept: 'What is an AI Agent?',
    explanation: 'An AI Agent is an autonomous entity powered by an LLM that evaluates goals, formulates plans, executes external tools, and loops until completion.',
    user_raw_idea: 'Single static prompt returning a text answer.',
    engineered_prompt: 'Goal -> Plan steps -> Tool call 1 (Web Search) -> Observe outcome -> Tool call 2 (Calculator) -> Evaluate goal -> Deliver final response.',
    why_it_works: 'Agents dynamically adapt their action sequence based on real-time tool observation results.',
    starterCode: 'while (!agent.isGoalAchieved()) {\n  const nextAction = await agent.planNextStep();\n  const result = await executeTool(nextAction.tool, nextAction.args);\n  agent.updateObservation(result);\n}',
    practiceTask: {
      title: 'Trace Agent Execution Loop',
      description: 'Map out the 4 steps of an agent loop for booking a flight.',
      requirements: ['Perception / Goal', 'Planning step', 'Tool execution step', 'Final reflection'],
      starterCode: '// Goal: Book flight to NYC under $300\n// Step 1:\n// Step 2:\n// Step 3:\n'
    }
  },
  {
    id: 23,
    moduleNumber: 4,
    title: 'Lesson 23 — Tool Calling & Function Calling',
    subtitle: 'Equip LLMs with executable JSON schema tool definitions.',
    level: 'Intermediate',
    duration: '10 mins',
    category: 'Multi-Agent',
    concept: 'Tool & Function Calling',
    explanation: 'Function calling allows LLMs to output structured JSON arguments targeted to specific software tool schemas.',
    user_raw_idea: 'Ask LLM to guess the weather in Tokyo.',
    engineered_prompt: 'Tools: [{ name: "get_weather", description: "Get current weather", parameters: { location: { type: "string" } } }]',
    why_it_works: 'The model delegates real-world data fetching to dedicated APIs using typed arguments.',
    starterCode: 'const tools = [{\n  type: "function",\n  function: {\n    name: "send_email",\n    description: "Send an email to a user",\n    parameters: {\n      type: "object",\n      properties: {\n        to: { type: "string" },\n        subject: { type: "string" },\n        body: { type: "string" }\n      },\n      required: ["to", "subject", "body"]\n    }\n  }\n}];',
    practiceTask: {
      title: 'Write Function Definition Schema',
      description: 'Define an OpenAI-compatible function schema for a calculator tool.',
      requirements: ['Function name: calculate', 'Parameters: a (number), b (number), operation (string)', 'Specify required fields'],
      starterCode: 'const calculatorToolSchema = {\n  // Schema definition:\n};'
    }
  },
  {
    id: 24,
    moduleNumber: 4,
    title: 'Lesson 24 — ReAct Framework (Reasoning + Acting)',
    subtitle: 'Structure agent thinking using Thought -> Action -> Observation prompt loops.',
    level: 'Intermediate',
    duration: '10 mins',
    category: 'Multi-Agent',
    concept: 'ReAct Framework',
    explanation: 'ReAct interleaves reasoning thoughts with action execution to systematically solve complex multi-step problems.',
    user_raw_idea: 'Execute commands without internal step-by-step reasoning.',
    engineered_prompt: 'Thought: I need to find user email first.\nAction: searchUserDb("Alice")\nObservation: Email found alice@test.com.\nThought: Now send password reset link.\nAction: sendResetEmail("alice@test.com")',
    why_it_works: 'Explicit reasoning step prevents premature or erroneous tool calls.',
    starterCode: 'const reactPrompt = `Solve the task using format:\nThought: reasoning\nAction: tool_name(args)\nObservation: tool result\n...\nFinal Answer: outcome`;',
    practiceTask: {
      title: 'Write a ReAct Sequence',
      description: 'Write a 2-turn ReAct sequence for checking database status and restarting service.',
      requirements: ['Thought 1 & Action 1', 'Observation 1', 'Thought 2 & Action 2'],
      starterCode: '// Thought 1:\n// Action 1:\n// Observation 1:\n'
    }
  },
  {
    id: 25,
    moduleNumber: 4,
    title: 'Lesson 25 — Multi-Agent Collaboration Patterns',
    subtitle: 'Orchestrate specialized agents (Planner, Researcher, Coder, Reviewer) in teams.',
    level: 'Intermediate',
    duration: '10 mins',
    category: 'Multi-Agent',
    concept: 'Multi-Agent Collaboration',
    explanation: 'Multi-agent architectures divide complex jobs among specialized persona agents coordinated by a Manager Agent.',
    user_raw_idea: 'Force a single generic prompt to handle research, coding, writing, and QA.',
    engineered_prompt: '[Manager Agent] -> Assigns sub-task to [Research Agent] -> Passes findings to [Code Agent] -> Output checked by [QA Agent].',
    why_it_works: 'Specialized role prompts perform significantly better than monolithic single-prompt architectures.',
    starterCode: 'const research = await researchAgent.run(topic);\nconst code = await codingAgent.run(research.findings);\nconst audit = await qaAgent.audit(code);\nif (!audit.passed) await codingAgent.fix(audit.issues);',
    practiceTask: {
      title: 'Design Multi-Agent Pipeline',
      description: 'Define roles for a 3-agent team building an automated blog generator.',
      requirements: ['Agent 1: Topic Researcher', 'Agent 2: Content Writer', 'Agent 3: SEO Editor'],
      starterCode: '// Agent 1 Role:\n// Agent 2 Role:\n// Agent 3 Role:\n'
    }
  },
  {
    id: 26,
    moduleNumber: 4,
    title: 'Lesson 26 — Human-in-the-Loop (HITL) Approvals',
    subtitle: 'Insert manual human approval checkpoints for sensitive high-risk automation actions.',
    level: 'Intermediate',
    duration: '10 mins',
    category: 'Multi-Agent',
    concept: 'Human-in-the-Loop Approvals',
    explanation: 'HITL pauses execution on high-impact actions (e.g. wire transfers, bulk deletion) until authorized by a human operator.',
    user_raw_idea: 'Automatically execute refund transfers of $10,000 without human review.',
    engineered_prompt: 'IF action.amount > $500 -> Pause Workflow -> Send Slack approval button to manager -> Wait for callback -> IF approved: Execute, ELSE: Cancel.',
    why_it_works: 'Prevents catastrophic autonomous failures and safeguards financial/data assets.',
    starterCode: 'if (paymentAmount > 500) {\n  await sendSlackApproval({ id: executionId, amount: paymentAmount });\n  await waitForHumanSignal(executionId);\n}\nawait executePayment();',
    practiceTask: {
      title: 'Implement HITL Gate',
      description: 'Write an IF statement checking refund threshold and triggering approval webhook.',
      requirements: ['Check if refund > 100', 'Trigger approval request', 'Return pending status'],
      starterCode: 'function checkApprovalRequired(amount) {\n  // Code here\n}'
    }
  },
  {
    id: 27,
    moduleNumber: 4,
    title: 'Lesson 27 — Agent State & Context Management',
    subtitle: 'Maintain shared memory states across multi-agent handoffs without data corruption.',
    level: 'Intermediate',
    duration: '10 mins',
    category: 'Multi-Agent',
    concept: 'Agent State & Context Management',
    explanation: 'Shared state stores structured artifacts (e.g. LangGraph state, state machines) accessed and mutated by collaborating agents.',
    user_raw_idea: 'Pass unformatted raw string logs back and forth between 5 agents.',
    engineered_prompt: 'State Schema: { goal: string, research_docs: string[], code_draft: string, tests_passed: boolean, step_count: number }',
    why_it_works: 'Typed shared schemas prevent data degradation during multi-agent handoffs.',
    starterCode: 'const state = {\n  task: "Refactor API",\n  artifacts: {},\n  currentAgent: "Researcher",\n  history: []\n};',
    practiceTask: {
      title: 'Create Shared Agent State Schema',
      description: 'Define TypeScript interface for shared state across a multi-agent system.',
      requirements: ['Include taskId property', 'Include activeStep index', 'Include artifacts dictionary'],
      starterCode: 'interface SharedAgentState {\n  // Interface definition:\n}'
    }
  },
  {
    id: 28,
    moduleNumber: 4,
    title: 'Lesson 28 — Fallback & Recovery Strategies for Agents',
    subtitle: 'Detect infinite loops, tool execution errors, and implement agent recovery routines.',
    level: 'Intermediate',
    duration: '10 mins',
    category: 'Multi-Agent',
    concept: 'Agent Recovery Strategies',
    explanation: 'Guardrails monitor agent iteration limits, catch tool runtime errors, and trigger alternative recovery models/prompts.',
    user_raw_idea: 'Let an agent loop infinitely when a tool continuously returns error code 404.',
    engineered_prompt: 'IF loopCount > 10 OR toolFailures > 3 -> Terminate agent -> Switch to fallback model (e.g. Claude 3.5 Sonnet) -> Notify admin.',
    why_it_works: 'Hard bounds prevent runaway API token bills and ungraceful execution hangs.',
    starterCode: 'if (agent.stepCount > MAX_STEPS) {\n  logger.warn("Agent loop limit reached. Escalating to human.");\n  return await fallbackHumanQueue(agent.state);\n}',
    practiceTask: {
      title: 'Implement Guardrail Counter',
      description: 'Write an iteration counter that aborts an agent loop after 5 failed steps.',
      requirements: ['Increment step counter', 'Check if stepCount >= 5', 'Throw loop exceeded error'],
      starterCode: 'let steps = 0;\nfunction incrementAndCheck() {\n  // Code here\n}'
    }
  },

  // MODULE 5
  {
    id: 29,
    moduleNumber: 5,
    title: 'Lesson 29 — Connecting Slack, Teams & Discord',
    subtitle: 'Build interactive chat automation bots that listen to messages and dispatch commands.',
    level: 'Advanced',
    duration: '10 mins',
    category: 'Enterprise & Security',
    concept: 'ChatOps & Messaging Integrations',
    explanation: 'ChatOps integrates automation workflows into team chat platforms via incoming webhooks, slash commands, and bot apps.',
    user_raw_idea: 'Check support dashboard manually every hour for new tickets.',
    engineered_prompt: 'New High Priority Ticket -> Format Slack Block Kit Card with [Assign to Me] and [Escalate] action buttons -> Post to #support-alerts.',
    why_it_works: 'Brings actionable automated workflows directly into existing team communication channels.',
    starterCode: 'await fetch(process.env.SLACK_WEBHOOK_URL, {\n  method: "POST",\n  body: JSON.stringify({ text: "🚨 Alert: System Load > 90%" })\n});',
    practiceTask: {
      title: 'Format Slack Payload',
      description: 'Create a JSON payload structure for sending a Slack message block.',
      requirements: ['Include text property', 'Add formatted bold text string'],
      starterCode: 'const slackPayload = {\n  // Payload format:\n};'
    }
  },
  {
    id: 30,
    moduleNumber: 5,
    title: 'Lesson 30 — CRM Automations (HubSpot, Salesforce)',
    subtitle: 'Automate lead ingestion, deal stage transitions, and contact enrichment.',
    level: 'Advanced',
    duration: '10 mins',
    category: 'Enterprise & Security',
    concept: 'CRM Automations',
    explanation: 'CRM automations sync inbound customer data across marketing and sales platforms while auto-enriching profiles using AI.',
    user_raw_idea: 'Sales reps manually copy lead data from emails into Salesforce.',
    engineered_prompt: 'Form Submit -> Enrich domain with Clearbit API -> AI scores lead quality (0-100) -> Create Salesforce Lead Object.',
    why_it_works: 'Instantly qualifies leads and removes admin overhead from sales teams.',
    starterCode: 'const lead = await hubspot.crm.contacts.basicApi.create({\n  properties: { email: userEmail, firstname: firstName, company: companyName }\n});',
    practiceTask: {
      title: 'Construct CRM Ingestion Payload',
      description: 'Build a contact creation payload object for a CRM REST API.',
      requirements: ['Include email, firstname, lastname', 'Include custom field lead_score'],
      starterCode: 'const crmPayload = {\n  // Properties object:\n};'
    }
  },
  {
    id: 31,
    moduleNumber: 5,
    title: 'Lesson 31 — Database & Cloud Sync Workflows',
    subtitle: 'Sync data across MongoDB, PostgreSQL, Google Sheets, and AWS S3 bucket stores.',
    level: 'Advanced',
    duration: '10 mins',
    category: 'Enterprise & Security',
    concept: 'Database & Storage Sync',
    explanation: 'Storage workflows execute ETL pipelines to keep transactional databases, data warehouses, and cloud files in sync.',
    user_raw_idea: 'Run manual SQL export dumps to update analytics data once a week.',
    engineered_prompt: 'Postgres CDC (Change Data Capture) -> Trigger Kafka Event -> Upsert record to Snowflake Analytics Warehouse.',
    why_it_works: 'Near real-time data replication maintains single source of truth across systems.',
    starterCode: 'const client = await pool.connect();\ntry {\n  await client.query("UPDATE orders SET status = $1 WHERE id = $2", ["SHIPPED", orderId]);\n} finally { client.release(); }',
    practiceTask: {
      title: 'Write SQL Update Execution',
      description: 'Write a parameterized database update query string and values array.',
      requirements: ['Parameterized query with $1, $2', 'Prevent SQL injection risks'],
      starterCode: 'const query = "";\nconst values = [];'
    }
  },
  {
    id: 32,
    moduleNumber: 5,
    title: 'Lesson 32 — Email & Document Automations',
    subtitle: 'Automate PDF document generation, e-signatures, and transactional email flows.',
    level: 'Advanced',
    duration: '10 mins',
    category: 'Enterprise & Security',
    concept: 'Email & Document Automation',
    explanation: 'Document workflows render HTML templates to PDF invoices, dispatch them via SendGrid/Resend, and track signatures via DocuSign.',
    user_raw_idea: 'Manually fill out Word invoice templates for every customer purchase.',
    engineered_prompt: 'Order Event -> Render HTML Template -> Puppeteer HTML-to-PDF -> Attach PDF to Resend API email -> Send to Buyer.',
    why_it_works: 'Programmatic PDF rendering generates crisp, dynamic documents automatically.',
    starterCode: 'const pdfBuffer = await generatePdfFromHtml(invoiceHtml);\nawait resend.emails.send({\n  to: buyerEmail,\n  subject: "Your Invoice",\n  attachments: [{ filename: "invoice.pdf", content: pdfBuffer }]\n});',
    practiceTask: {
      title: 'Build Email Dispatch Payload',
      description: 'Construct a Resend API email dispatch payload with attachment config.',
      requirements: ['Include to, subject, html body', 'Specify attachment object schema'],
      starterCode: 'const emailParams = {\n  // Email params here:\n};'
    }
  },
  {
    id: 33,
    moduleNumber: 5,
    title: 'Lesson 33 — OAuth2 Authentication Flows',
    subtitle: 'Implement user-delegated access tokens, refresh tokens, and consent scopes.',
    level: 'Advanced',
    duration: '10 mins',
    category: 'Enterprise & Security',
    concept: 'OAuth2 Authentication',
    explanation: 'OAuth2 provides authorization grants allowing your automation system to act on behalf of users without seeing passwords.',
    user_raw_idea: 'Ask users to enter their main Google password into your app.',
    engineered_prompt: 'Redirect User -> OAuth Consent Screen -> Receive Auth Code -> Exchange for Access Token + Refresh Token -> Store Encrypted in DB.',
    why_it_works: 'Industry-standard authorization protocol that keeps passwords safe and limits permission scopes.',
    starterCode: 'const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {\n  method: "POST",\n  body: new URLSearchParams({ code, client_id, client_secret, grant_type: "authorization_code" })\n});',
    practiceTask: {
      title: 'Draft Token Refresh Call',
      description: 'Write a function structure to exchange refresh_token for a new access_token.',
      requirements: ['Set grant_type to refresh_token', 'Include refresh_token parameter'],
      starterCode: 'async function refreshAccessToken(refreshToken) {\n  // Fetch logic:\n}'
    }
  },
  {
    id: 34,
    moduleNumber: 5,
    title: 'Lesson 34 — Rate Limiting & Queue Management',
    subtitle: 'Protect downstream APIs using Redis BullMQ queues and token bucket rate limiters.',
    level: 'Advanced',
    duration: '10 mins',
    category: 'Enterprise & Security',
    concept: 'Rate Limiting & Queue Management',
    explanation: 'Job queues (e.g. BullMQ, Celery) buffer spike workloads and process tasks at controlled rates matching API limits.',
    user_raw_idea: 'Fire 500 concurrent HTTP requests to a target server with a 10 req/sec limit.',
    engineered_prompt: 'Push 500 tasks to BullMQ Queue -> Worker concurrency = 5 -> Rate Limiter = Max 10 jobs per 1,000ms.',
    why_it_works: 'Queues absorb traffic surges and guarantee reliable delivery without trigger failures.',
    starterCode: 'const worker = new Worker("emailQueue", async job => {\n  await sendEmail(job.data);\n}, { limiter: { max: 10, duration: 1000 } });',
    practiceTask: {
      title: 'Configure Queue Worker Limiter',
      description: 'Define configuration options for limiting worker to 5 jobs per 2 seconds.',
      requirements: ['Set max parameter to 5', 'Set duration parameter to 2000'],
      starterCode: 'const limiterConfig = {\n  // Limiter config:\n};'
    }
  },
  {
    id: 35,
    moduleNumber: 5,
    title: 'Lesson 35 — Security, Secrets & Compliance',
    subtitle: 'Protect API keys with KMS, sanitize PII data, and comply with GDPR/SOC2 rules.',
    level: 'Advanced',
    duration: '10 mins',
    category: 'Enterprise & Security',
    concept: 'Security & Secrets Management',
    explanation: 'Enterprise security requires secret vaults (AWS Secrets Manager, Vault), log PII redaction, and strict access controls.',
    user_raw_idea: 'Hardcode production API keys directly into public git repository code.',
    engineered_prompt: '1. Store keys in AWS Secrets Manager -> 2. Load at runtime via environment -> 3. Redact email/SSN from workflow logs before saving.',
    why_it_works: 'Prevents credential leaks and guarantees compliance with privacy regulations.',
    starterCode: 'function sanitizeLogs(logText) {\n  return logText.replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}/g, "[REDACTED_EMAIL]");\n}',
    practiceTask: {
      title: 'Write PII Redaction Filter',
      description: 'Write a string replacement regex that masks email addresses in text logs.',
      requirements: ['Regex pattern for emails', 'Replace matches with [REDACTED]'],
      starterCode: 'function redactPii(logString) {\n  // Redaction code:\n}'
    }
  },

  // MODULE 6
  {
    id: 36,
    moduleNumber: 6,
    title: 'Lesson 36 — Monitoring, Telemetry & Logging',
    subtitle: 'Instrument automation workflows with OpenTelemetry, Datadog, and structured logs.',
    level: 'Advanced',
    duration: '10 mins',
    category: 'Production Ops',
    concept: 'Monitoring, Telemetry & Logging',
    explanation: 'Structured logging (JSON format) and telemetry metrics enable real-time observability across multi-step execution graphs.',
    user_raw_idea: 'Use console.log("here") strings without correlation IDs.',
    engineered_prompt: 'logger.info({ traceId, executionId, stepName: "VectorSearch", durationMs: 142, status: "SUCCESS" })',
    why_it_works: 'Correlation IDs tie logs across multiple microservices and asynchronous workers.',
    starterCode: 'logger.info({\n  correlationId: req.headers["x-correlation-id"],\n  event: "WORKFLOW_STARTED",\n  timestamp: new Date().toISOString()\n});',
    practiceTask: {
      title: 'Create Structured Log Object',
      description: 'Write a helper function returning a JSON log record with timestamp and traceId.',
      requirements: ['Include timestamp ISO string', 'Include traceId', 'Include event message'],
      starterCode: 'function formatLog(traceId, message) {\n  // Log object:\n}'
    }
  },
  {
    id: 37,
    moduleNumber: 6,
    title: 'Lesson 37 — Dead-Letter Queues (DLQ) & Fallbacks',
    subtitle: 'Capture failed jobs in DLQs for manual inspection, debugging, and replay.',
    level: 'Advanced',
    duration: '10 mins',
    category: 'Production Ops',
    concept: 'Dead-Letter Queues (DLQ)',
    explanation: 'When a job fails max retries, it moves to a Dead-Letter Queue (DLQ) so developers can inspect and replay without losing data.',
    user_raw_idea: 'Discard failed jobs silently when retries fail.',
    engineered_prompt: 'Primary Queue (3 Retries Fail) -> Move Job to DLQ -> Alert Dev Team on PagerDuty -> Fix bug -> Trigger DLQ Replay batch.',
    why_it_works: 'Guarantees zero data loss during unforeseen system failures or upstream outages.',
    starterCode: 'queue.on("failed", async (job, err) => {\n  if (job.attemptsMade >= job.opts.attempts) {\n    await dlq.add(job.name, { payload: job.data, error: err.message });\n  }\n});',
    practiceTask: {
      title: 'Implement DLQ Push Event',
      description: 'Write logic to push a failed payload to DLQ array when attempts exceed limit.',
      requirements: ['Check if attempts >= maxAttempts', 'Push object to dlqQueue array'],
      starterCode: 'const dlqQueue = [];\nfunction handleJobFailure(job, maxAttempts = 3) {\n  // DLQ push code:\n}'
    }
  },
  {
    id: 38,
    moduleNumber: 6,
    title: 'Lesson 38 — Automated Testing for Workflows',
    subtitle: 'Write unit tests, integration mocks, and end-to-end regression tests for workflows.',
    level: 'Advanced',
    duration: '10 mins',
    category: 'Production Ops',
    concept: 'Workflow Testing Strategies',
    explanation: 'Testing automation workflows requires mocking external API calls and verifying payload shapes at every step.',
    user_raw_idea: 'Test workflows by triggering live billing production APIs manually.',
    engineered_prompt: 'nock("https://api.stripe.com").post("/v1/charges").reply(200, { id: "ch_mock_123", status: "succeeded" });',
    why_it_works: 'Mocks prevent accidental billing changes and allow fast, reliable automated CI/CD runs.',
    starterCode: 'describe("Support Workflow", () => {\n  it("should parse refund ticket correctly", async () => {\n    const mockPayload = { text: "Refund order #12" };\n    const result = await processTicket(mockPayload);\n    expect(result.intent).toBe("REFUND");\n  });\n});',
    practiceTask: {
      title: 'Write Jest Workflow Test Case',
      description: 'Write a basic test assertion checking workflow classification output.',
      requirements: ['Define test block with it()', 'Assert expected intent equals REFUND'],
      starterCode: 'test("ticket classification", () => {\n  // Assertion logic:\n});'
    }
  },
  {
    id: 39,
    moduleNumber: 6,
    title: 'Lesson 39 — CI/CD for Automation Pipelines',
    subtitle: 'Automate testing, linting, and deployment of workflows using GitHub Actions.',
    level: 'Advanced',
    duration: '10 mins',
    category: 'Production Ops',
    concept: 'CI/CD Pipelines for Automation',
    explanation: 'CI/CD pipelines automatically run test suites on git push and deploy validated workflow code to staging/production.',
    user_raw_idea: 'Manually copy files over FTP to production server.',
    engineered_prompt: 'git push main -> GitHub Actions -> npm test -> Build Docker Image -> Deploy to AWS ECS -> Run Health Check.',
    why_it_works: 'Enforces code quality checks and eliminates manual deployment errors.',
    starterCode: 'name: Workflow CI\non: [push]\njobs:\n  build:\n    runs-on: ubuntu-latest\n    steps:\n      - uses: actions/checkout@v3\n      - run: npm install\n      - run: npm test',
    practiceTask: {
      title: 'Draft GitHub Actions Step',
      description: 'Write a YAML snippet for running npm test in GitHub Actions.',
      requirements: ['Specify step name', 'Specify run command npm test'],
      starterCode: '# GitHub Actions Step snippet:\n'
    }
  },
  {
    id: 40,
    moduleNumber: 6,
    title: 'Lesson 40 — Performance Tuning & Latency Optimization',
    subtitle: 'Reduce end-to-end execution time using parallel execution and caching.',
    level: 'Advanced',
    duration: '10 mins',
    category: 'Production Ops',
    concept: 'Performance Tuning & Latency',
    explanation: 'Optimize latency by executing independent steps concurrently with Promise.all and caching static API responses in Redis.',
    user_raw_idea: 'Run 4 independent API calls sequentially in series.',
    engineered_prompt: 'const [user, billing, stats, score] = await Promise.all([ getUser(), getBilling(), getStats(), getScore() ]);',
    why_it_works: 'Parallel execution reduces total latency from sum(t1+t2+t3) to max(t1,t2,t3).',
    starterCode: 'const cachedResult = await redis.get(cacheKey);\nif (cachedResult) return JSON.parse(cachedResult);\nconst freshData = await expensiveApiCall();\nawait redis.set(cacheKey, JSON.stringify(freshData), "EX", 3600);',
    practiceTask: {
      title: 'Refactor Sequential to Parallel',
      description: 'Convert 2 sequential await calls to Promise.all concurrent execution.',
      requirements: ['Use Promise.all()', 'Destructure results into variables'],
      starterCode: '// Sequential:\n// const a = await fetchA();\n// const b = await fetchB();\n// Parallel refactor:\n'
    }
  },
  {
    id: 41,
    moduleNumber: 6,
    title: 'Lesson 41 — Cost Optimization & Token Budgeting',
    subtitle: 'Track and control LLM API token expenses across enterprise workloads.',
    level: 'Advanced',
    duration: '10 mins',
    category: 'Production Ops',
    concept: 'Cost Optimization & Token Budgeting',
    explanation: 'Manage costs by routing simple tasks to lighter models (e.g. GPT-4o-mini), caching embeddings, and capping daily token budgets.',
    user_raw_idea: 'Send simple boolean classification tasks to expensive flagship models.',
    engineered_prompt: 'IF task == "simple_classify" -> Model = gpt-4o-mini ($0.15/M tokens); ELSE IF task == "complex_reasoning" -> Model = gpt-4o ($2.50/M tokens).',
    why_it_works: 'Dynamic model routing cuts operational API costs by 70-90% without sacrificing quality on hard tasks.',
    starterCode: 'function selectModel(complexity) {\n  return complexity === "HIGH" ? "gpt-4o" : "gpt-4o-mini";\n}',
    practiceTask: {
      title: 'Build Model Router by Task Type',
      description: 'Write a router returning model identifier string based on prompt token count.',
      requirements: ['If tokenCount > 2000 return gpt-4o', 'Else return gpt-4o-mini'],
      starterCode: 'function getModelForTokens(tokenCount) {\n  // Code here\n}'
    }
  },
  {
    id: 42,
    moduleNumber: 6,
    title: 'Lesson 42 — High Availability & Disaster Recovery',
    subtitle: 'Ensure zero downtime with multi-region redundancy and database failover.',
    level: 'Advanced',
    duration: '10 mins',
    category: 'Production Ops',
    concept: 'High Availability & Disaster Recovery',
    explanation: 'Design multi-region active-active deployments with automated DNS failover and point-in-time database backups.',
    user_raw_idea: 'Host entire production system on a single server without backups.',
    engineered_prompt: 'AWS Route53 Health Check -> If Primary Region fails -> Auto-route traffic to Secondary Standby Region within 30 seconds.',
    why_it_works: 'Protects critical business automation systems from data center outages.',
    starterCode: 'const dbConnection = await connectPrimaryWithFallback(PRIMARY_URI, SECONDARY_URI);',
    practiceTask: {
      title: 'Write Multi-URI Connection Fallback',
      description: 'Write try/catch logic trying Primary DB URI then falling back to Secondary URI.',
      requirements: ['Try primary connection', 'Catch error and connect secondary', 'Return active client'],
      starterCode: 'async function getDbConnection() {\n  // Fallback connection logic:\n}'
    }
  },

  // MODULE 7
  {
    id: 43,
    moduleNumber: 7,
    title: 'Lesson 43 — Capstone Project 1: AI Customer Support System',
    subtitle: 'Architect an automated customer support bot with ticket routing and RAG lookups.',
    level: 'Advanced',
    duration: '10 mins',
    category: 'Capstone Systems',
    concept: 'AI Customer Support System',
    explanation: 'Build an autonomous support workflow that parses tickets, checks knowledge base RAG, auto-replies to simple queries, and escalates complex issues.',
    user_raw_idea: 'Customer support staff overwhelmed by 1,000 daily repetitive tickets.',
    engineered_prompt: 'Ticket Ingest -> Intent AI Classifier -> IF FAQ: Query RAG & Send Auto-Reply -> IF Complex: Create Zendesk Ticket & Assign Rep -> Send Slack Alert.',
    why_it_works: 'Deflects 60%+ of tier-1 support tickets automatically, cutting resolution times from hours to seconds.',
    starterCode: 'async function handleSupportTicket(ticket) {\n  const intent = await classifyIntent(ticket.text);\n  if (intent.isFaq) {\n    const answer = await ragSearch(ticket.text);\n    await sendCustomerReply(ticket.email, answer);\n  } else {\n    await Zendesk.createTicket(ticket);\n  }\n}',
    practiceTask: {
      title: 'Build Support Ingest Handler',
      description: 'Write the main function skeleton handling support ticket ingestion and decision routing.',
      requirements: ['Parse ticket input', 'Route to FAQ or Escalation branch'],
      starterCode: 'async function processCustomerTicket(ticketData) {\n  // Implementation here\n}'
    }
  },
  {
    id: 44,
    moduleNumber: 7,
    title: 'Lesson 44 — Capstone Project 2: Autonomous Lead Research Agent',
    subtitle: 'Build a multi-agent system that enriches leads, searches the web, and drafts emails.',
    level: 'Advanced',
    duration: '10 mins',
    category: 'Capstone Systems',
    concept: 'Autonomous Lead Research Agent',
    explanation: 'An agent team that scraped target company websites, extracts key tech stack details, and generates personalized outreach emails.',
    user_raw_idea: 'Sales reps spending 20 minutes researching every prospect manually.',
    engineered_prompt: 'Lead Email -> Web Scrape Company Site -> Extract Key Products -> AI Drafts Custom Outreach Email -> Push to Sales Looping Queue.',
    why_it_works: 'Automates research and outreach personalization at scale.',
    starterCode: 'const companyInfo = await scrapeWebsite(lead.companyUrl);\nconst draft = await ai.generate({\n  prompt: `Draft personalized email to ${lead.name} using details: ${companyInfo}`\n});\nawait outboundQueue.add({ leadId: lead.id, emailBody: draft });',
    practiceTask: {
      title: 'Assemble Lead Pipeline Step',
      description: 'Write logic linking website scrape output to personalized prompt generation.',
      requirements: ['Receive scraped company summary', 'Return formatted outreach prompt'],
      starterCode: 'function buildOutreachPrompt(leadName, companySummary) {\n  // Return prompt:\n}'
    }
  },
  {
    id: 45,
    moduleNumber: 7,
    title: 'Lesson 45 — Capstone Project 3: Automated Content & Social Engine',
    subtitle: 'Build a system that converts YouTube videos into blog posts and Twitter threads.',
    level: 'Advanced',
    duration: '10 mins',
    category: 'Capstone Systems',
    concept: 'Automated Content & Social Engine',
    explanation: 'A content pipeline that fetches video transcripts, generates blog posts, creates social media threads, and schedules posts via Buffer API.',
    user_raw_idea: 'Manually rewrite long videos into social posts across 5 platforms.',
    engineered_prompt: 'YouTube Transcript -> AI Summarizer -> Generate Markdown Blog + 5 Tweets + LinkedIn Post -> Schedule via Buffer API.',
    why_it_works: 'Repurposes single content assets across multiple distribution channels automatically.',
    starterCode: 'const transcript = await getYoutubeTranscript(videoId);\nconst posts = await ai.generateSocialPosts(transcript);\nawait bufferApi.schedulePosts(posts);',
    practiceTask: {
      title: 'Design Content Repurposing Schema',
      description: 'Define object structure containing blog post, tweets array, and linkedin post.',
      requirements: ['Include blogTitle and blogBody', 'Include tweets string array', 'Include linkedinContent'],
      starterCode: 'const contentPackage = {\n  // Content structure:\n};'
    }
  },
  {
    id: 46,
    moduleNumber: 7,
    title: 'Lesson 46 — Capstone Project 4: Enterprise Document Processor',
    subtitle: 'Extract data from complex PDF contracts and sync with internal ERP databases.',
    level: 'Advanced',
    duration: '10 mins',
    category: 'Capstone Systems',
    concept: 'Enterprise Document Processor',
    explanation: 'An OCR + LLM pipeline that extracts key clauses, tables, and monetary terms from unformatted legal PDF documents.',
    user_raw_idea: 'Manual review of 50-page vendor contracts by accounting staff.',
    engineered_prompt: 'PDF Upload -> Vision OCR -> Structuring Prompt (Extract Vendor, Total Amount, Payment Terms, Effective Date) -> Schema Validation -> ERP Sync.',
    why_it_works: 'Extracts structured records from complex unstructured PDF documents with high accuracy.',
    starterCode: 'const rawOcr = await runVisionOcr(pdfFile);\nconst structuredData = await ai.extractJson(rawOcr, contractSchema);\nawait erpSystem.createVendorContract(structuredData);',
    practiceTask: {
      title: 'Define Contract Extraction Schema',
      description: 'Write JSON schema for vendor contract extraction.',
      requirements: ['Fields: vendorName, totalAmount, paymentTerms, effectiveDate'],
      starterCode: 'const contractSchema = {\n  // Schema definition:\n};'
    }
  },
  {
    id: 47,
    moduleNumber: 7,
    title: 'Lesson 47 — Capstone Project 5: Automated Code Review & Security Scanner',
    subtitle: 'Build a GitHub PR bot that reviews code changes and runs security static analysis.',
    level: 'Advanced',
    duration: '10 mins',
    category: 'Capstone Systems',
    concept: 'Automated Code Review Bot',
    explanation: 'A GitHub App webhook bot that analyzes PR diffs, checks for security vulnerabilities (e.g. SQLi, XSS), and posts review comments.',
    user_raw_idea: 'Pull requests waiting 3 days for initial code review feedback.',
    engineered_prompt: 'GitHub PR Webhook -> Fetch PR Diff -> AI Security Audit Prompt -> Post Review Comments to PR line numbers.',
    why_it_works: 'Provides instant code review feedback on pull requests prior to human review.',
    starterCode: 'app.post("/webhooks/github", async (req, res) => {\n  const diff = await fetchPrDiff(req.body.pull_request);\n  const audit = await ai.auditDiff(diff);\n  await postGithubComments(req.body.pull_request.number, audit.comments);\n  res.sendStatus(200);\n});',
    practiceTask: {
      title: 'Format PR Comment Payload',
      description: 'Write code structuring a GitHub inline review comment payload.',
      requirements: ['Include path, line, body text'],
      starterCode: 'function createPrComment(filePath, lineNumber, commentText) {\n  // Comment payload:\n}'
    }
  },
  {
    id: 48,
    moduleNumber: 7,
    title: 'Lesson 48 — Capstone Project 6: AI Finance & Expense Auditing System',
    subtitle: 'Automate invoice matching, receipt OCR scanning, and anomaly detection.',
    level: 'Advanced',
    duration: '10 mins',
    category: 'Capstone Systems',
    concept: 'AI Finance & Expense Auditing',
    explanation: 'An expense auditing pipeline that scans receipts, checks against policy rules, flags suspicious charges, and prepares reimbursement payouts.',
    user_raw_idea: 'Finance team manually cross-referencing paper receipts with credit card statements.',
    engineered_prompt: 'Receipt Image -> Vision AI Extractor -> Match with Credit Card Statement -> Check Policy Rules (e.g. Max $50 meal limit) -> Flag Anomaly or Approve.',
    why_it_works: 'Eliminates expense fraud and accelerates reimbursement processing.',
    starterCode: 'const receipt = await visionAi.parse(receiptImg);\nconst match = await findStatementTransaction(receipt.amount, receipt.date);\nif (!match || receipt.amount > POLICY_LIMIT) {\n  await flagForAudit(receipt);\n} else {\n  await approveReimbursement(receipt);\n}',
    practiceTask: {
      title: 'Implement Anomaly Audit Check',
      description: 'Write a function checking if receipt total exceeds policy limit or lacks matching transaction.',
      requirements: ['Check receipt.amount > limit', 'Check if matching transaction exists'],
      starterCode: 'function auditExpense(receipt, matchingTransaction, limit = 50) {\n  // Audit check logic:\n}'
    }
  },
  {
    id: 49,
    moduleNumber: 7,
    title: 'Lesson 49 — Final Capstone Deployment & Production Handoff',
    subtitle: 'Deploy your complete AI Automation system to cloud infrastructure with monitoring.',
    level: 'Advanced',
    duration: '10 mins',
    category: 'Capstone Systems',
    concept: 'Final Capstone Deployment',
    explanation: 'Deploy the full multi-agent automation platform to production cloud (AWS / GCP / Docker / Kubernetes), configure domain SSL, env secrets, and alert dashboards.',
    user_raw_idea: 'Running production automation workflows on a local laptop.',
    engineered_prompt: 'Dockerize App -> Provision Managed Database -> Set up Cloud Run / ECS Cluster -> Configure Secrets Vault -> Enable Telemetry -> System Live 🚀',
    why_it_works: 'Delivers a resilient, enterprise-grade AI Automation platform operating 24/7/365 with high availability.',
    starterCode: 'FROM node:18-alpine\nWORKDIR /app\nCOPY package*.json ./\nRUN npm ci --only=production\nCOPY . .\nCMD ["node", "server.js"]',
    practiceTask: {
      title: 'Write Dockerfile Configuration',
      description: 'Write a basic 5-line Dockerfile for a Node.js production service.',
      requirements: ['FROM base image', 'WORKDIR /app', 'COPY package.json', 'RUN npm install', 'CMD startup command'],
      starterCode: '# Production Dockerfile:\n'
    }
  }
];
