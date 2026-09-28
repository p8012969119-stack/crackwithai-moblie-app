export interface PromptStage {
  id: number;
  slug: string;
  title: string;
  subtitle: string;
  tag: string;
  badge: string;
  description: string;
}

export interface PromptMistake {
  id: number;
  title: string;
  summary: string;
  badPrompt: string;
  whyBad: string;
  betterPrompt: string;
  tryPrompt: string;
  taskTitle: string;
}

export interface PromptTechnique {
  id: string;
  name: string;
  tag: string;
  summary: string;
  explanation: string;
  example: string;
  challenge: string;
  starterPrompt: string;
  targetCriteria: string[];
}

export interface RealWorldScenario {
  id: string;
  title: string;
  icon: string;
  role: string;
  taskDescription: string;
  starterPrompt: string;
  evaluationChecklist: string[];
}

export const PROMPT_STAGES: PromptStage[] = [
  {
    id: 1,
    slug: 'what-is-prompt-engineering',
    title: 'What is Prompt Engineering?',
    subtitle: 'Learn how to give clear instructions to AI',
    tag: 'Core Concept',
    badge: 'Stage 1',
    description: 'Understand how prompts work and compare vague prompts with high-performing structured prompts.'
  },
  {
    id: 2,
    slug: 'prompt-builder',
    title: 'The 5-Element Prompt Formula',
    subtitle: 'Build prompts using Role, Task, Context, Constraints, Output',
    tag: 'Interactive Builder',
    badge: 'Stage 2',
    description: 'Use the interactive 5-block prompt builder to assemble professional-grade instructions.'
  },
  {
    id: 3,
    slug: 'avoid-mistakes',
    title: 'Avoid These 5 Common Mistakes',
    subtitle: 'Transform broken, vague prompts into crisp commands',
    tag: 'Mistake Lab',
    badge: 'Stage 3',
    description: 'Inspect real prompt anti-patterns, understand why models fail, and test better alternatives.'
  },
  {
    id: 4,
    slug: 'prompt-techniques',
    title: 'Prompting Techniques',
    subtitle: 'Zero-shot, Few-shot, Role & Step-by-Step prompting',
    tag: 'Power Techniques',
    badge: 'Stage 4',
    description: 'Master specialized prompting patterns that dramatically boost AI intelligence and precision.'
  },
  {
    id: 5,
    slug: 'iterative-prompting',
    title: 'Iterative Prompting Loop',
    subtitle: 'Prompt → Response → Critique → Refine → Master',
    tag: 'Refinement Cycle',
    badge: 'Stage 5',
    description: 'Prompting is a conversation. Learn how to steer, correct, and iteratively refine model outputs.'
  },
  {
    id: 6,
    slug: 'real-world-practice',
    title: 'Real-World Prompt Challenges',
    subtitle: 'Code, Email, Research, Content, Data & Creative',
    tag: 'Hands-on Labs',
    badge: 'Stage 6',
    description: 'Solve realistic workplace challenges across coding, communications, research, and data workflows.'
  },
  {
    id: 7,
    slug: 'debugging-guardrails',
    title: 'Prompt Debugging & Guardrails',
    subtitle: 'Prevent hallucinations and lock down output schemas',
    tag: 'Quality & Safety',
    badge: 'Stage 7',
    description: 'Ground responses strictly in reference data and enforce negative constraints to eliminate hallucinations.'
  },
  {
    id: 8,
    slug: 'final-challenge',
    title: 'Build Your Own AI Assistant',
    subtitle: 'Capstone: Production AI Customer Support Prompt',
    tag: 'Capstone Project',
    badge: 'Stage 8',
    description: 'Design a robust production prompt meeting all 5 professional rubric criteria to earn your official certificate.'
  }
];

export const PROMPT_MISTAKES: PromptMistake[] = [
  {
    id: 1,
    title: 'Mistake 1: Too Vague',
    summary: 'Asking for general topics without scope or target outcome.',
    badPrompt: 'Write something about AI.',
    whyBad: 'The AI has to guess the audience, length, style, and goal. The result will be generic fluff.',
    betterPrompt: 'Write a beginner-friendly 300-word explanation of Generative AI with 3 real-world examples.',
    tryPrompt: 'You are a tech journalist. Write a concise 200-word overview of Generative AI for high school students, using a smartphone assistant analogy.',
    taskTitle: 'Make this vague prompt specific and actionable:'
  },
  {
    id: 2,
    title: 'Mistake 2: Missing Context',
    summary: 'Expecting AI to understand your situation without giving relevant background.',
    badPrompt: 'Why is my code broken?',
    whyBad: 'The AI does not know what language, error message, expected output, or framework you are using.',
    betterPrompt: 'I have a React Native app where useState is throwing "undefined is not a function". Here is the component code: [code snippet]. How do I fix it?',
    tryPrompt: 'Act as a Senior React Native Developer. Review this code error: "TypeError: Cannot read property map of undefined" occurring when rendering a list of products. Explain why it happens and provide the fix.',
    taskTitle: 'Add critical context and error details to this prompt:'
  },
  {
    id: 3,
    title: 'Mistake 3: No Output Format',
    summary: 'Not telling the AI how to structure its final answer.',
    badPrompt: 'Compare Python and JavaScript.',
    whyBad: 'AI will generate long, wandering paragraphs that are tedious to scan and compare.',
    betterPrompt: 'Compare Python and JavaScript in a Markdown table with columns: Feature, Python, JavaScript, and Best Use Case.',
    tryPrompt: 'You are a software engineering lead. Compare Python vs JavaScript for a new startup backend. Present the comparison in a Markdown table followed by 3 key bullet points.',
    taskTitle: 'Enforce a structured table or bullet format:'
  },
  {
    id: 4,
    title: 'Mistake 4: Conflicting Instructions',
    summary: 'Giving contradictory requirements that confuse the AI attention window.',
    badPrompt: 'Explain quantum computing in comprehensive extreme detail but make it under 20 words for a child.',
    whyBad: '"Extreme detail" contradicts "under 20 words for a child", causing the model to hallucinate or compromise poorly.',
    betterPrompt: 'Explain the core idea of quantum computing to a 10-year-old in 3 simple sentences using a spinning coin analogy.',
    tryPrompt: 'Explain how cloud servers work to an elementary school student in exactly 2 simple sentences using an analogy of a public library.',
    taskTitle: 'Eliminate contradictions and set harmonious constraints:'
  },
  {
    id: 5,
    title: 'Mistake 5: Unnecessary Information (Noise)',
    summary: 'Pasting huge blocks of unrelated background that dilute model attention.',
    badPrompt: 'My name is Alex and yesterday I woke up at 7am and drank coffee, then worked on my server. Can you tell me what HTTP 401 means?',
    whyBad: 'Irrelevant biographical details dilute the attention weights and waste precious token limits.',
    betterPrompt: 'Explain the HTTP 401 Unauthorized status code, its most common causes in REST APIs, and how a client should handle it.',
    tryPrompt: 'Explain the difference between HTTP 401 Unauthorized and HTTP 403 Forbidden in 3 concise bullet points with quick code examples.',
    taskTitle: 'Strip out the noise and focus directly on the technical core:'
  }
];

export const PROMPT_TECHNIQUES: PromptTechnique[] = [
  {
    id: 'zero-shot',
    name: 'Zero-Shot Prompting',
    tag: 'Zero-Shot',
    summary: 'Direct instruction without providing previous examples.',
    explanation: 'Zero-shot prompting relies entirely on the pre-trained weights of the model. It works best for straightforward definitions, summarization, or clear transformations.',
    example: 'Translate the following English customer review to Spanish: "The shipping was very fast!"',
    challenge: 'Classify sentiment of user feedback into Positive, Neutral, or Negative without examples.',
    starterPrompt: 'Classify the sentiment of this review into [Positive, Neutral, Negative]: "The app is okay, but loading takes a bit too long."',
    targetCriteria: ['Direct instruction', 'Clear classification categories', 'Single test sample']
  },
  {
    id: 'one-shot',
    name: 'One-Shot Prompting',
    tag: 'One-Shot',
    summary: 'Provide exactly one high-quality input-output example.',
    explanation: 'One-shot prompting gives the AI a clear pattern to replicate. It eliminates guessing about the desired format, punctuation, or tone.',
    example: `Convert casual text to formal business tone:
Input: "Hey, can't make the call today, super busy."
Output: "Good morning. I apologize, but I have a scheduling conflict today and will need to reschedule our meeting."

Input: "Send me that spreadsheet asap."
Output:`,
    challenge: 'Create a one-shot prompt that converts product descriptions into marketing slogans.',
    starterPrompt: `Convert product descriptions into catchy 5-word marketing slogans:

Product: Lightweight wireless noise-cancelling headphones
Slogan: Pure sound, total wireless freedom.

Product: Organic cold-brew iced coffee in recyclable cans
Slogan:`,
    targetCriteria: ['Includes 1 example', 'Shows input/output mapping', 'Maintains consistent formatting']
  },
  {
    id: 'few-shot',
    name: 'Few-Shot Prompting',
    tag: 'Few-Shot',
    summary: 'Provide 2-3 examples to establish deep pattern consistency.',
    explanation: 'Few-shot prompting is the gold standard for complex categorization, structured JSON extraction, and nuanced tone replication.',
    example: `Extract technical terms and sentiment:
Text: "Loved the fast PostgreSQL query execution!"
Data: {"term": "PostgreSQL", "sentiment": "Positive"}

Text: "CSS Grid is frustrating to configure."
Data: {"term": "CSS Grid", "sentiment": "Negative"}

Text: "The Redis caching layer cut our latency in half."
Data:`,
    challenge: 'Write a few-shot prompt that converts informal questions into structured search queries.',
    starterPrompt: `Format user questions into structured search queries:

User: "How do I make a button rounded in css?"
Query: {"topic": "css", "property": "border-radius", "intent": "styling"}

User: "Why is node server crashing on port 3000?"
Query: {"topic": "nodejs", "error": "EADDRINUSE", "intent": "troubleshooting"}

User: "How to store auth tokens securely in react native?"
Query:`,
    targetCriteria: ['Provides 2+ examples', 'Consistent key-value format', 'Clear target query']
  },
  {
    id: 'role-prompting',
    name: 'Role Prompting (Persona)',
    tag: 'Role Persona',
    summary: 'Give the AI a specific profession, perspective, and tone.',
    explanation: 'Assigning a role ("Act as a Staff Security Architect", "Act as a Patient Kindergarten Teacher") primes the LLM attention toward specialized vocabulary, standards, and depth.',
    example: 'Act as a Senior Database Administrator. Analyze the query "SELECT * FROM orders WHERE status = 1" and explain why using SELECT * can hurt production database performance.',
    challenge: 'Assign AI the role of a Senior Code Reviewer to review code readability and maintainability.',
    starterPrompt: 'You are a Senior Staff Frontend Engineer at a high-growth tech startup. Review this function for performance and readability, and provide 3 constructive suggestions:\n\nfunction getItems(d) { return d.filter(x => x.active == true).map(x => x.name); }',
    targetCriteria: ['Explicit role assigned', 'Professional standard stated', 'Actionable suggestions requested']
  },
  {
    id: 'chain-of-thought',
    name: 'Step-by-Step (Chain of Thought)',
    tag: 'Step-by-Step',
    summary: 'Force AI to reason out loud before jumping to a conclusion.',
    explanation: 'Prompting the model to "Think step by step" or decompose a problem into sequential stages dramatically reduces logic errors and mathematical hallucinations.',
    example: 'A store gives a 20% discount on a $100 jacket, and then adds 8% sales tax. Think step by step to calculate the final price.',
    challenge: 'Break down an API design task into 4 sequential logical steps.',
    starterPrompt: 'You are an API Architect. Design a secure user password reset flow. Think step by step: Step 1 (Request), Step 2 (Verification), Step 3 (Token Validation), Step 4 (Password Update). Format each step clearly.',
    targetCriteria: ['Uses step-by-step reasoning', 'Breaks complex task into stages', 'Clear logical sequencing']
  },
  {
    id: 'templates',
    name: 'Prompt Templates',
    tag: 'Reusable Templates',
    summary: 'Create parameterized prompt blueprints for repeatable work.',
    explanation: 'Templates use placeholders like {TOPIC}, {AUDIENCE}, and {FORMAT}. They can be saved, shared across teams, and integrated into automated software pipelines.',
    example: `Template:
Role: Tech Educator
Audience: {AUDIENCE}
Topic: {TOPIC}
Constraints: Under {WORD_COUNT} words, no buzzwords.
Format: 3 key takeaways.`,
    challenge: 'Build a reusable prompt template for bug reporting.',
    starterPrompt: `Act as a Quality Assurance Engineer. Create a standardized Bug Report based on the following variables:
- Feature: [User Login]
- Expected: [Redirect to dashboard]
- Actual: [White screen error]
- Device: [iOS 18]

Format the output with sections: Summary, Steps to Reproduce, Severity, and Recommended Fix.`,
    targetCriteria: ['Uses structured placeholders', 'Separates variables from rules', 'Standardized output schema']
  }
];

export const REAL_WORLD_SCENARIOS: RealWorldScenario[] = [
  {
    id: 'coding',
    title: 'Coding Assistant',
    icon: 'code',
    role: 'Staff Software Architect',
    taskDescription: 'Create a prompt for an AI pair programmer to debug an async race condition in JavaScript.',
    starterPrompt: 'Act as a Senior JavaScript Architect. Debug a race condition where multiple quick button taps trigger duplicate API requests in a React component. Provide the debounce or abort controller fix with concise code.',
    evaluationChecklist: ['Specifies language & framework', 'Identifies race condition issue', 'Requests working code solution', 'Includes explanation']
  },
  {
    id: 'research',
    title: 'Research & Synthesis',
    icon: 'search',
    role: 'Principal Research Scientist',
    taskDescription: 'Create a prompt to synthesize pros and cons of Vector Databases (e.g. Pinecone, Chroma) for AI apps.',
    starterPrompt: 'Act as an AI Research Specialist. Synthesize the pros, cons, and performance trade-offs of Vector Databases compared to traditional PostgreSQL with pgvector. Format as a clean comparison table with an executive summary.',
    evaluationChecklist: ['Defines comparison scope', 'Requests pros and cons', 'Specifies structured table format', 'Executive summary constraint']
  },
  {
    id: 'email',
    title: 'Professional Email',
    icon: 'mail',
    role: 'Executive Communications Specialist',
    taskDescription: 'Create a prompt that drafts a polite, professional leave request to a manager.',
    starterPrompt: 'Act as an Executive Workplace Communications Coach. Draft a polite and professional email to my engineering manager requesting 3 days of personal leave from Oct 12 to 14. Mention that my pending PRs will be handed over to a teammate.',
    evaluationChecklist: ['Sets professional tone', 'Specifies leave dates', 'Covers project handover', 'Includes subject line']
  },
  {
    id: 'content',
    title: 'Content Creation',
    icon: 'file-text',
    role: 'Content Strategist',
    taskDescription: 'Create a prompt to generate an engaging LinkedIn technical post about learning AI engineering.',
    starterPrompt: 'Act as a Developer Relations Lead. Write an engaging LinkedIn post (under 150 words) sharing 3 core takeaways from learning Prompt Engineering. Use a hook in the first sentence, bullet points, and 3 relevant hashtags.',
    evaluationChecklist: ['Defines platform (LinkedIn)', 'Sets word limit under 150', 'Hook opening + bullet format', 'Relevant hashtags']
  },
  {
    id: 'data',
    title: 'Data Extraction',
    icon: 'database',
    role: 'Data Engineer',
    taskDescription: 'Create a prompt to extract structured JSON data from messy customer feedback transcripts.',
    starterPrompt: 'Act as a Data Extraction Pipeline. Extract sentiment, product mentioned, and issue severity from this customer review: "The payment button in checkout kept freezing on my iPhone 14." Return ONLY valid JSON with keys: product, device, issue, severity (Low/Med/High), sentiment.',
    evaluationChecklist: ['Strict JSON constraint', 'Specifies explicit schema keys', 'Includes raw input context', 'Negative constraint: ONLY valid JSON']
  },
  {
    id: 'image',
    title: 'Image Generation',
    icon: 'image',
    role: 'Generative AI Artist',
    taskDescription: 'Create a descriptive prompt for an AI image generator (e.g. Midjourney) to generate a cyber-security concept graphic.',
    starterPrompt: 'Generate a detailed image prompt: Futuristic cyber-security command center, glowing holographic network graphs in deep purple and cyan neon, isometric 3D render, hyper-detailed, clean lighting, 8k resolution, minimalist dark background.',
    evaluationChecklist: ['Specifies subject & atmosphere', 'Defines color palette', 'Includes artistic style & lighting', 'Resolution/rendering cues']
  },
  {
    id: 'productivity',
    title: 'Productivity & Planning',
    icon: 'award',
    role: 'Agile Product Manager',
    taskDescription: 'Create a prompt that turns a messy meeting brain dump into a prioritized Jira-ready action item list.',
    starterPrompt: 'Act as an Agile Scrum Master. Transform the following rough notes into prioritized sprint tasks: "We need auth done by Friday, Sarah needs the API docs, and database backup should run nightly." Format with columns: Priority (P0-P2), Task, Owner, and Definition of Done.',
    evaluationChecklist: ['Assigns Scrum Master role', 'Converts unstructured input', 'Defines priority scoring', 'Specifies table columns']
  }
];
