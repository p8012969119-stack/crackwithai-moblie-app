export interface PromptStage {
  id: number;
  slug: string;
  title: string;
  subtitle: string;
  tag: string;
  badge: string;
  description: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  category: string;
  concept: string;
  explanation: string;
  user_raw_idea: string;
  engineered_prompt: string;
  why_it_works: string;
  starterCode: string;
  practiceTask: {
    title: string;
    description: string;
    requirements: string[];
    starterCode: string;
    expectedOutput: string;
  };
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
    slug: 'defining-personas',
    title: 'Lesson 1 — Defining Personas',
    subtitle: 'Giving the AI a specific professional identity forces correct jargon, tone & depth.',
    tag: 'Role Persona',
    badge: 'Lesson 1',
    description: 'Giving the AI a specific professional identity forces it to adopt the correct jargon, tone, and depth of knowledge required.',
    difficulty: 'Beginner',
    category: 'Role-Based Prompting',
    concept: 'Defining Personas',
    explanation: 'Giving the AI a specific professional identity forces it to adopt the correct jargon, tone, and depth of knowledge required.',
    user_raw_idea: 'Write an article about healthy eating.',
    engineered_prompt: 'Act as a Registered Clinical Dietitian. Task: Write a 300-word introductory article about the benefits of a plant-based diet for office workers. Constraints: Focus on energy levels, avoid overly medical jargon, and include 3 actionable meal swaps. Format: Use bullet points for the meal swaps.',
    why_it_works: "Locks the AI into a certified health professional's perspective rather than pulling generic internet blog posts.",
    starterCode: 'Act as a Registered Clinical Dietitian. Task: Write a short 200-word article about plant-based meals for office workers. Include 3 quick meal ideas as bullet points.',
    practiceTask: {
      title: 'Persona Definition Task',
      description: 'Define an explicit expert role (Dietitian, Engineer, Mentor) in your prompt and instruct the AI to write a target response.',
      requirements: ['Assign a specific expert persona', 'Specify topic and target audience', 'Set length or output constraints'],
      starterCode: 'Act as a Registered Clinical Dietitian. Task: Write a 300-word introductory article about the benefits of a plant-based diet for office workers. Constraints: Focus on energy levels and include 3 actionable meal swaps.',
      expectedOutput: 'Professional dietitian article with 3 meal swaps in bullet points.'
    }
  },
  {
    id: 2,
    slug: 'adding-style-and-constraints',
    title: 'Lesson 2 — Adding Style & Constraints',
    subtitle: 'Setting boundaries ensures output fits exact operational requirements.',
    tag: 'Constraints',
    badge: 'Lesson 2',
    description: 'Setting boundaries ensures the AI output fits your exact professional or operational requirements without extra fluff.',
    difficulty: 'Beginner',
    category: 'Constraints & Formatting',
    concept: 'Adding Style & Constraints',
    explanation: 'Setting boundaries ensures the AI output fits your exact professional or operational requirements without extra fluff.',
    user_raw_idea: 'Email my boss that I am sick today.',
    engineered_prompt: 'Act as a Corporate Employee. Task: Draft a professional, brief email to my direct manager informing them that I am taking a sick day today due to sudden fever. Constraints: Keep it under 4 lines, maintain a respectful and direct tone, and mention that I will check urgent messages in the evening.',
    why_it_works: 'Prevents the AI from sounding overly dramatic or sharing unnecessary medical details, keeping it clean.',
    starterCode: 'Act as a Corporate Employee. Task: Draft a concise 4-line email to my manager taking a sick day today.',
    practiceTask: {
      title: 'Constraint Enforcement Task',
      description: 'Draft a concise email prompt specifying exact line limits, respectful tone, and essential details.',
      requirements: ['Set a clear line limit (under 4 lines)', 'Maintain a professional corporate tone', 'Include key operational detail'],
      starterCode: 'Act as a Corporate Employee. Task: Draft a professional email to my manager taking a sick day today. Constraints: Under 4 lines, respectful tone, mention evening check-in.',
      expectedOutput: 'Short, 4-line corporate sick leave email.'
    }
  },
  {
    id: 3,
    slug: 'audience-adaptation',
    title: 'Lesson 3 — Audience Adaptation',
    subtitle: 'Specifying who the output is for changes vocabulary and tone.',
    tag: 'Audience',
    badge: 'Lesson 3',
    description: 'Specifying who the output is for changes the complexity of vocabulary, depth of explanation, and tone used by the AI.',
    difficulty: 'Beginner',
    category: 'Target Audience',
    concept: 'Audience Adaptation',
    explanation: 'Specifying who the output is for changes the complexity of vocabulary, depth of explanation, and tone used by the AI.',
    user_raw_idea: 'Explain blockchain.',
    engineered_prompt: 'Act as a Tech Teacher. Task: Explain the concept of blockchain technology. Context: Target audience is 10-year-old children. Constraints: Do not use cryptographic jargon. Use an analogy involving a shared digital diary or ledger that everyone can see but no one can erase. Max 2 paragraphs.',
    why_it_works: 'Forces the model to strip away complex math or coding terms and replace them with universally understandable concepts.',
    starterCode: 'Act as a Tech Teacher. Task: Explain blockchain to 10-year-old kids using a digital diary analogy in 2 paragraphs.',
    practiceTask: {
      title: 'Audience Adaptation Task',
      description: 'Prompt AI to explain a complex topic to a 10-year-old child using an intuitive real-world analogy.',
      requirements: ['Specify target audience (10-year-old kids)', 'Include a specific real-world analogy', 'Limit length to 2 paragraphs'],
      starterCode: 'Act as a Tech Teacher. Task: Explain blockchain technology to 10-year-old children using a digital diary analogy without technical jargon. Max 2 paragraphs.',
      expectedOutput: '2-paragraph kid-friendly explanation of blockchain using a shared digital diary analogy.'
    }
  },
  {
    id: 4,
    slug: 'markdown-and-tables',
    title: 'Lesson 4 — Markdown & Tables',
    subtitle: 'Specifying output structure saves formatting and cleanup time.',
    tag: 'Markdown',
    badge: 'Lesson 4',
    description: 'AI can present data in tables, JSON, markdown, or lists. Specifying this directly saves immense formatting and clean-up time.',
    difficulty: 'Beginner',
    category: 'Formatting Output',
    concept: 'Markdown & Tables',
    explanation: 'AI can present data in tables, JSON, markdown, or lists. Specifying this directly saves immense formatting and clean-up time.',
    user_raw_idea: 'Give me a list of top tech companies and their founders.',
    engineered_prompt: 'Act as a Tech Historian. Task: List 5 globally dominant technology companies founded after 1975. Format: Present the output strictly as a clean Markdown table with three columns: Company Name, Founder(s), and Year Founded. Order chronologically.',
    why_it_works: "Eliminates conversational introductions like 'Sure, here is your list' and outputs data ready to be parsed or pasted into documentation.",
    starterCode: 'Act as a Tech Historian. Task: List 5 tech companies in a Markdown table with columns: Company Name | Founder(s) | Year Founded.',
    practiceTask: {
      title: 'Markdown Table Formatting Task',
      description: 'Instruct AI to return a clean Markdown table with specified columns and chronological order.',
      requirements: ['Request Markdown table format', 'Define explicit table columns', 'Specify sorting order'],
      starterCode: 'Act as a Tech Historian. Task: List 5 major tech companies in a Markdown table with columns: Company Name, Founder(s), Year Founded.',
      expectedOutput: 'Clean Markdown table listing 5 tech companies with exact 3 columns.'
    }
  },
  {
    id: 5,
    slug: 'providing-examples-few-shot',
    title: 'Lesson 5 — Providing Examples',
    subtitle: 'Providing examples teaches exact pattern and classification logic.',
    tag: 'Few-Shot',
    badge: 'Lesson 5',
    description: 'Providing examples teaches the AI the exact pattern, formatting, and classification logic you expect before it processes data.',
    difficulty: 'Intermediate',
    category: 'Few-Shot Prompting',
    concept: 'Providing Examples',
    explanation: 'Providing examples teaches the AI the exact pattern, formatting, and classification logic you expect before it processes data.',
    user_raw_idea: 'Categorize inputs into positive or negative: The food was cold, Excellent service, The screen is cracked.',
    engineered_prompt: "Act as an AI Data Labeling Engine. Task: Classify customer feedback into 'Positive' or 'Negative'.\n\nExamples:\n- 'Delivery took two weeks' -> Negative\n- 'Absolutely love the color!' -> Positive\n\nNow classify these text inputs:\n1. 'The food was cold'\n2. 'Excellent service'\nFormat: Output as a clean bulleted list.",
    why_it_works: 'By showing patterns first, the model outputs clean classifications without conversational filler.',
    starterCode: "Act as an AI Data Labeling Engine. Task: Classify text into 'Positive' or 'Negative' using 2 demonstration examples.",
    practiceTask: {
      title: 'Few-Shot Classification Task',
      description: 'Provide 2 demonstration input-output pairs to train AI classification on target sentences.',
      requirements: ['Include at least 2 demonstration examples', 'Specify target categories (Positive / Negative)', 'Request bulleted list output'],
      starterCode: "Act as an AI Data Labeling Engine. Task: Classify feedback into 'Positive' or 'Negative'.\nExamples:\n- 'Delivery was slow' -> Negative\n- 'Awesome product' -> Positive\n\nInputs:\n1. 'The food was cold'\n2. 'Excellent service'",
      expectedOutput: 'Clean Few-Shot classification list.'
    }
  },
  {
    id: 6,
    slug: 'content-summarization',
    title: 'Lesson 6 — Content Summarization',
    subtitle: 'Directing focus prevents missing crucial information during summaries.',
    tag: 'Summarization',
    badge: 'Lesson 6',
    description: 'Instructing the AI on what specific data points to focus on prevents it from missing crucial information during a summary.',
    difficulty: 'Intermediate',
    category: 'Information Extraction',
    concept: 'Content Summarization',
    explanation: 'Instructing the AI on what specific data points to focus on prevents it from missing crucial information during a summary.',
    user_raw_idea: 'Summarize this meeting note.',
    engineered_prompt: 'Act as an Executive Secretary. Task: Summarize the attached transcript of a business meeting. Constraints: Extract only three distinct sections: 1. Core Decisions Made, 2. Assigned Action Items (with names), 3. Next Meeting Date. Ignore all casual side-conversations. Max 150 words.',
    why_it_works: 'Filters out background noise and pleasantries, giving management a highly actionable brief.',
    starterCode: 'Act as an Executive Secretary. Task: Summarize meeting notes into 3 sections: Core Decisions, Action Items, and Next Meeting Date.',
    practiceTask: {
      title: 'Structured Summarization Task',
      description: 'Prompt AI to extract decisions, action items, and next meeting dates from meeting transcripts.',
      requirements: ['Specify 3 required extraction sections', 'Instruct AI to ignore casual conversation', 'Set word count cap (under 150 words)'],
      starterCode: 'Act as an Executive Secretary. Task: Summarize meeting notes into 3 sections: 1. Core Decisions, 2. Action Items with names, 3. Next Meeting Date. Max 150 words.',
      expectedOutput: 'Structured meeting summary in 3 distinct sections.'
    }
  },
  {
    id: 7,
    slug: 'altering-emotional-resonance',
    title: 'Lesson 7 — Altering Emotional Resonance',
    subtitle: 'Prompting for specific tone alters word choice for brand alignment.',
    tag: 'Tone & Style',
    badge: 'Lesson 7',
    description: 'Prompting for a specific tone (e.g., empathetic, assertive, persuasive) alters word choice to suit corporate policies or brand voices.',
    difficulty: 'Intermediate',
    category: 'Tone Modulation',
    concept: 'Altering Emotional Resonance',
    explanation: 'Prompting for a specific tone (e.g., empathetic, assertive, persuasive) alters word choice to suit corporate policies or brand voices.',
    user_raw_idea: 'Tell a client their feature request is denied.',
    engineered_prompt: 'Act as a Senior Product Manager. Task: Draft a response to a high-value enterprise client explaining that their custom software feature request cannot be built this quarter. Tone: Empathetic, highly professional, yet firm. Constraints: Frame it around keeping our platform stable and offer a workaround or timeline review for next quarter.',
    why_it_works: 'Prevents the response from sounding rude or overly defensive, keeping customer satisfaction intact.',
    starterCode: 'Act as a Senior Product Manager. Task: Write an empathetic yet firm email declining a client feature request for this quarter while offering a next quarter review.',
    practiceTask: {
      title: 'Empathetic Customer Denial Task',
      description: 'Draft a product manager email declining a feature request with empathetic and professional tone.',
      requirements: ['Set persona to Senior Product Manager', 'Maintain empathetic yet firm tone', 'Offer alternative workaround or future review'],
      starterCode: 'Act as a Senior Product Manager. Task: Write a response to an enterprise client declining their custom feature request for this quarter. Tone: Empathetic, professional, firm. Offer a next quarter review.',
      expectedOutput: 'Empathetic product manager denial email with workaround.'
    }
  },
  {
    id: 8,
    slug: 'dynamic-brainstorming',
    title: 'Lesson 8 — Dynamic Brainstorming',
    subtitle: 'Negative constraints force AI to break away from cliché tropes.',
    tag: 'Brainstorming',
    badge: 'Lesson 8',
    description: 'Placing negative constraints (telling AI what NOT to do) forces it to break away from cliché, heavily repeated internet tropes.',
    difficulty: 'Intermediate',
    category: 'Creative Generation',
    concept: 'Dynamic Brainstorming',
    explanation: 'Placing negative constraints (telling AI what NOT to do) forces it to break away from cliché, heavily repeated internet tropes.',
    user_raw_idea: 'Give me marketing ideas for a coffee shop.',
    engineered_prompt: 'Act as a Creative Marketing Director. Task: Brainstorm 5 unique local marketing campaign ideas for a boutique coffee shop. Constraints: Do NOT suggest loyalty punch cards, discount coupons, or basic Instagram giveaways. Focus entirely on experiential or community-driven marketing.',
    why_it_works: 'Forces the model to skip the obvious, standard suggestions and generate truly innovative marketing angles.',
    starterCode: 'Act as a Creative Marketing Director. Task: Brainstorm 5 coffee shop marketing ideas. Negative Constraints: Do NOT suggest punch cards or Instagram giveaways.',
    practiceTask: {
      title: 'Negative Constraint Marketing Task',
      description: 'Brainstorm marketing ideas while placing negative constraints against cliché options.',
      requirements: ['Assign Creative Marketing Director persona', 'Include negative constraints (no coupons, no basic giveaways)', 'Focus on experiential / community marketing'],
      starterCode: 'Act as a Creative Marketing Director. Task: Brainstorm 5 unique local marketing ideas for a coffee shop. Constraints: Do NOT suggest punch cards, discounts, or basic Instagram giveaways.',
      expectedOutput: '5 unique coffee shop marketing ideas using negative constraints.'
    }
  },
  {
    id: 9,
    slug: 'chain-of-thought-reasoning',
    title: 'Lesson 9 — Chain-of-Thought (CoT)',
    subtitle: 'Thinking step-by-step reduces logic errors and fake calculations.',
    tag: 'Reasoning',
    badge: 'Lesson 9',
    description: 'Forcing the AI to think out loud step-by-step prevents computational rushes and severely reduces logic errors or fake calculations.',
    difficulty: 'Advanced',
    category: 'Reasoning & Logic',
    concept: 'Chain-of-Thought (CoT)',
    explanation: 'Forcing the AI to think out loud step-by-step prevents computational rushes and severely reduces logic errors or fake calculations.',
    user_raw_idea: 'If a store buys 10 apples for $5 and sells 8 of them for $1 each, what is the profit percentage?',
    engineered_prompt: 'Act as a Mathematical Logic Tutor. Task: Solve the word problem provided in the context. Context: Store buys 10 apples for a total of $5. Sells 8 apples for $1 each. Constraints: Think step-by-step. Break down your answer into: Cost Price per unit, Total Revenue, Net Profit, and Profit Percentage. Do not skip steps.',
    why_it_works: 'Forces the model to calculate the unit cost and total revenue sequentially before outputting the percentage, eliminating bad math.',
    starterCode: 'Act as a Mathematical Logic Tutor. Solve step-by-step: Store buys 10 apples for $5 and sells 8 for $1 each. Show unit cost, revenue, profit, and profit percentage.',
    practiceTask: {
      title: 'Chain-of-Thought Math Task',
      description: 'Solve a profit percentage word problem by instructing AI to think step-by-step.',
      requirements: ['Require step-by-step reasoning', 'Break down cost price, revenue, and profit', 'Output explicit percentage calculation'],
      starterCode: 'Act as a Mathematical Logic Tutor. Task: Solve step-by-step: Store buys 10 apples for $5 and sells 8 of them for $1 each. Show Cost Price per unit, Total Revenue, Net Profit, and Profit Percentage.',
      expectedOutput: 'Step-by-step math solution calculating 60% profit percentage.'
    }
  },
  {
    id: 10,
    slug: 'preventing-hallucinations',
    title: 'Lesson 10 — Preventing Hallucinations',
    subtitle: 'Giving an explicit escape hatch stops fake answers when data is missing.',
    tag: 'Guardrails',
    badge: 'Lesson 10',
    description: 'Giving the AI a strict "escape hatch" (telling it to say "I don\'t know") stops it from making up fake answers when data is missing.',
    difficulty: 'Advanced',
    category: 'Defensive Prompting',
    concept: 'Preventing Hallucinations',
    explanation: 'Giving the AI a strict "escape hatch" (telling it to say "I don\'t know") stops it from making up fake answers when data is missing.',
    user_raw_idea: 'Who won the corporate golf championship at TechCorp in 2025?',
    engineered_prompt: "Act as a Corporate Records Archivist. Task: Answer the question regarding company event winners. Constraints: Rely strictly on verified historical data. If the answer is not found in your public training data or if you are unsure of the exact name, reply exactly with: 'Information not available in company archives.' Do not guess.",
    why_it_works: 'Explicitly forbids speculation, protecting your application or database from delivering hallucinated or false answers.',
    starterCode: "Act as a Corporate Records Archivist. Answer event winner query. Strict Rule: If not in data, respond exactly: 'Information not available in company archives.'",
    practiceTask: {
      title: 'Defensive Escape Hatch Task',
      description: 'Write a defensive prompt with a strict escape hatch phrase to prevent AI hallucinations.',
      requirements: ['Include Corporate Archivist persona', 'Instruct strict reliance on verified data', 'Define exact fallback escape hatch text'],
      starterCode: "Act as a Corporate Records Archivist. Task: Answer company event winner query. Constraints: Rely strictly on verified data. If unsure, reply exactly with: 'Information not available in company archives.' Do not guess.",
      expectedOutput: "Defensive prompt returning exact 'Information not available' fallback."
    }
  },
  {
    id: 11,
    slug: 'dynamic-meta-prompting',
    title: 'Lesson 11 — Dynamic Meta-Prompting',
    subtitle: 'Using AI to optimize prompts creates robust instructions.',
    tag: 'Meta-Prompting',
    badge: 'Lesson 11',
    description: 'Using AI to write or optimize a prompt for another AI creates highly complex instructions that a human might not think to structure manually.',
    difficulty: 'Advanced',
    category: 'System Prompt Optimization',
    concept: 'Dynamic Meta-Prompting',
    explanation: 'Using AI to write or optimize a prompt for another AI creates highly complex instructions that a human might not think to structure manually.',
    user_raw_idea: 'Make a prompt that helps me learn vocabulary words.',
    engineered_prompt: 'Act as an Expert Prompt Engineer. Task: Write a comprehensive, robust system prompt for an AI Vocabulary Tutor. Constraints: The generated prompt must instruct the AI to quiz the user on one word at a time, provide immediate feedback, track scores, and use spaced repetition principles. Output only the finished system prompt code block.',
    why_it_works: 'Leverages the LLM’s deep understanding of prompt dynamics to build an incredibly stable interactive system.',
    starterCode: 'Act as an Expert Prompt Engineer. Task: Write a robust system prompt for an AI Vocabulary Tutor that quizzes one word at a time and tracks scores.',
    practiceTask: {
      title: 'System Meta-Prompt Generation Task',
      description: 'Prompt AI to design a production-grade system prompt for a Vocabulary Tutor app.',
      requirements: ['Assign Expert Prompt Engineer role', 'Require one-word quiz mechanism & score tracking', 'Output only finished system prompt code block'],
      starterCode: 'Act as an Expert Prompt Engineer. Task: Write a robust system prompt for an AI Vocabulary Tutor. Constraints: Quiz one word at a time, track scores, use spaced repetition. Output only the prompt code block.',
      expectedOutput: 'Production-ready system prompt for Vocabulary Tutor.'
    }
  },
  {
    id: 12,
    slug: 'secure-code-generation',
    title: 'Lesson 12 — Secure Code Generation',
    subtitle: 'Adding security and testing requirements prevents buggy scripts.',
    tag: 'Code Safety',
    badge: 'Lesson 12',
    description: 'Adding security, optimization, and testing requirements into a programming prompt prevents buggy or highly vulnerable scripts.',
    difficulty: 'Advanced',
    category: 'Code Synthesis',
    concept: 'Secure Code Generation',
    explanation: 'Adding security, optimization, and testing requirements into a programming prompt prevents buggy or highly vulnerable scripts.',
    user_raw_idea: 'Write an SQL query to delete old users.',
    engineered_prompt: 'Act as a Senior Database Administrator. Task: Write a PostgreSQL query to delete accounts that have been inactive for over 3 years. Constraints: Include safety measures. Use a soft-delete mechanism (updating an is_deleted status) rather than a hard destructive drop. Include a transaction block (BEGIN and COMMIT) to ensure safety.',
    why_it_works: 'Ensures the generated code adheres to enterprise safety and data retention laws, preventing catastrophic human error.',
    starterCode: 'Act as a Senior Database Administrator. Task: Write a PostgreSQL query for 3-year inactive user accounts using soft-delete and transaction block (BEGIN / COMMIT).',
    practiceTask: {
      title: 'Secure SQL Synthesis Task',
      description: 'Prompt AI for a PostgreSQL query using soft-delete mechanism and safe transaction blocks.',
      requirements: ['Set Senior DBA persona', 'Require soft-delete mechanism (is_deleted)', 'Include BEGIN and COMMIT transaction safety'],
      starterCode: 'Act as a Senior Database Administrator. Task: Write a PostgreSQL query to handle accounts inactive for over 3 years. Constraints: Use soft-delete (is_deleted status) and transaction block (BEGIN and COMMIT).',
      expectedOutput: 'Secure PostgreSQL script with soft-delete and transaction bounds.'
    }
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
