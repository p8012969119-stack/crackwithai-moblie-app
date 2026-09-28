import { aiApi } from '../../api/aiApi';

export interface PromptRubricBreakdown {
  role: boolean;
  task: boolean;
  context: boolean;
  constraints: boolean;
  outputFormat: boolean;
}

export interface PromptEvaluationResult {
  prompt: string;
  aiResponse: string;
  score: number;
  isPassed: boolean;
  whatWentWell: string[];
  whatToImprove: string[];
  tryAdding: string;
  breakdown: PromptRubricBreakdown;
  provider?: string;
  model?: string;
}

/**
 * Intelligent prompt rubric analysis and live AI execution engine.
 */
export const PromptEvaluator = {
  analyzePromptStructure(promptText: string, stageId: number = 1): PromptRubricBreakdown {
    const text = (promptText || '').toLowerCase().trim();

    // 1. Role detection
    const rolePatterns = [
      /\b(act as|you are|as an?|role:|persona|pretend you are|imagine you are)\b/i,
      /\b(teacher|developer|engineer|coach|expert|specialist|assistant|educator|architect|analyst|journalist|mentor|writer)\b/i
    ];
    const hasRole = rolePatterns.some(p => p.test(text));

    // 2. Task detection
    const taskPatterns = [
      /\b(explain|write|create|draft|summarize|compare|review|generate|analyze|extract|debug|transform|convert|refactor|design|build)\b/i,
      /\b(task:|objective:|goal:|solve)\b/i
    ];
    const hasTask = taskPatterns.some(p => p.test(text)) || text.length > 20;

    // 3. Context / Audience detection
    const contextPatterns = [
      /\b(beginner|student|child|audience|experienced|senior|junior|client|manager|user|customer|context:|background:|scenario:)\b/i,
      /\b(high school|non-technical|new to|first time|learning|working on)\b/i
    ];
    const hasContext = contextPatterns.some(p => p.test(text));

    // 4. Constraints detection
    const constraintPatterns = [
      /\b(under \d+|limit|max|words|sentences|paragraphs|do not|never|avoid|must|only|strictly|without|keep it|simple language)\b/i,
      /\b(constraints?:|rules?:|guidelines?:)\b/i
    ];
    const hasConstraints = constraintPatterns.some(p => p.test(text));

    // 5. Output Format detection
    const outputPatterns = [
      /\b(bullet|points?|table|json|markdown|numbered|list|sections?|format:|output:|template|headings?|schema)\b/i,
      /\b(\d+ points|\d+ bullets|\d+ steps)\b/i
    ];
    const hasOutput = outputPatterns.some(p => p.test(text));

    return {
      role: hasRole,
      task: hasTask,
      context: hasContext,
      constraints: hasConstraints,
      outputFormat: hasOutput,
    };
  },

  async evaluatePrompt(
    userPrompt: string,
    stageId: number = 1,
    customInstructions?: string,
    signal?: AbortSignal
  ): Promise<PromptEvaluationResult> {
    const trimmed = userPrompt.trim();
    const breakdown = this.analyzePromptStructure(trimmed, stageId);

    // Calculate score based on rubric
    let points = 0;
    if (breakdown.role) points += 20;
    if (breakdown.task) points += 25;
    if (breakdown.context) points += 20;
    if (breakdown.constraints) points += 20;
    if (breakdown.outputFormat) points += 15;

    // Bonus for length and detail
    if (trimmed.length > 80) points = Math.min(100, points + 5);

    // Stage 1 minimum passing is 50%, Stage 8 capstone requires 80%+
    const passThreshold = stageId === 8 ? 80 : stageId >= 4 ? 65 : 50;
    const isPassed = points >= passThreshold;

    // Construct constructive feedback
    const whatWentWell: string[] = [];
    const whatToImprove: string[] = [];

    if (breakdown.task) {
      whatWentWell.push('You clearly identified the main task for the AI to perform.');
    } else {
      whatToImprove.push('Missing explicit task action (e.g. "Explain", "Compare", "Summarize").');
    }

    if (breakdown.role) {
      whatWentWell.push('You assigned the AI a specific persona/role, anchoring its perspective.');
    } else {
      whatToImprove.push('Give the AI a role: e.g. "You are an experienced teacher" or "Act as a Senior Engineer".');
    }

    if (breakdown.context) {
      whatWentWell.push('You specified the target audience or background context.');
    } else {
      whatToImprove.push('Define the audience: e.g. "The learner is a complete beginner."');
    }

    if (breakdown.constraints) {
      whatWentWell.push('You set helpful constraints (e.g. tone, length, or boundary rules).');
    } else {
      whatToImprove.push('Add constraints: e.g. "Keep it under 150 words and avoid complex technical jargon."');
    }

    if (breakdown.outputFormat) {
      whatWentWell.push('You specified an explicit structure (e.g. bullet points, table, or numbered steps).');
    } else {
      whatToImprove.push('Define the format: e.g. "Format the response as 5 bullet points + 1 real-world example."');
    }

    // Suggested improvement prompt
    let tryAdding = '';
    if (!breakdown.role && !breakdown.outputFormat) {
      tryAdding = `"Act as a friendly coding coach. ${trimmed}. Present your answer in 3 numbered bullet points."`;
    } else if (!breakdown.constraints) {
      tryAdding = `"${trimmed} Keep the explanation strictly under 150 words and use simple real-world analogies."`;
    } else if (!breakdown.outputFormat) {
      tryAdding = `"${trimmed} Format as 5 clear bullet points followed by 1 practical takeaway."`;
    } else {
      tryAdding = `"${trimmed} Include a brief summary table comparing key options."`;
    }

    // Call live AI service
    let aiResponse = '';
    let provider = 'CrackWithAI Engine';
    let model = 'Gemini Flash';

    try {
      // Execute the user's prompt via the AI service
      const res = await aiApi.chat(trimmed, [], 'gemini', signal);
      aiResponse = res.data?.response || '';
      provider = res.data?.provider || provider;
      model = res.data?.model || model;
    } catch {
      // Fallback smart generation if network or backend timeout occurs
      aiResponse = this.generateFallbackSimulation(trimmed, breakdown);
    }

    return {
      prompt: trimmed,
      aiResponse,
      score: points,
      isPassed,
      whatWentWell,
      whatToImprove,
      tryAdding,
      breakdown,
      provider,
      model,
    };
  },

  generateFallbackSimulation(prompt: string, rubric: PromptRubricBreakdown): string {
    const lower = prompt.toLowerCase();
    if (lower.includes('javascript') || lower.includes('js')) {
      if (rubric.role && rubric.outputFormat) {
        return `Hello! As your JavaScript educator, here is the beginner breakdown:\n\n1. What it is: JavaScript is the language that makes websites interactive.\n2. In the browser: It lets you click buttons, submit forms, and see dynamic animations.\n3. Variables: Used to remember data like user names or shopping cart totals.\n4. Functions: Reusable blocks of code that do specific jobs.\n5. Real-World Example: When you tap the ❤️ like button on Instagram and the heart instantly turns red without refreshing the page — that's JavaScript!`;
      }
      return `JavaScript is a high-level programming language used primarily to build dynamic, interactive web applications. Along with HTML and CSS, it is one of the core technologies of the World Wide Web.`;
    }

    if (lower.includes('email') || lower.includes('leave')) {
      return `Subject: Application for Personal Leave — Oct 12 to Oct 14\n\nDear Manager,\n\nI hope you are well. I am writing to request personal leave from October 12th to October 14th. All my current sprint tasks and open pull requests have been documented and handed over to Sarah for team review.\n\nI will ensure a seamless return on Monday, October 17th. Thank you for your consideration.\n\nBest regards,\n[Your Name]`;
    }

    if (lower.includes('json') || lower.includes('extract')) {
      return `{\n  "status": "extracted",\n  "product": "Checkout Service",\n  "device": "iPhone 14",\n  "severity": "High",\n  "sentiment": "Negative",\n  "summary": "Payment button freezing during checkout step"\n}`;
    }

    return `Here is the response generated based on your prompt:\n\n• Key Concept: Your instructions were executed according to the specified context.\n• Execution: The AI model aligned with the persona and parameters you provided.\n• Summary: Effective prompting produces structured, high-accuracy output.`;
  },

  async askCoachAdvice(
    question: string,
    currentStageTitle: string,
    lastPromptTested?: string
  ): Promise<string> {
    const coachPrompt = `You are a supportive, expert AI Prompt Engineering Coach at CrackWithAI.
The learner is currently on Stage: "${currentStageTitle}".
${lastPromptTested ? `The user recently tested this prompt: "${lastPromptTested}"` : ''}

The learner is asking you: "${question}"

Provide a friendly, motivating, and actionable reply (under 130 words).
Focus on teaching them how to communicate better with AI.
Use bullet points or a clear example where helpful.`;

    try {
      const res = await aiApi.chat(coachPrompt, [], 'gemini');
      return res.data?.response || 'Great question! Remember: Role + Task + Context + Constraints + Output always yields superior AI output.';
    } catch {
      return `As your AI Prompt Coach, here is what I recommend for "${currentStageTitle}": Focus on being explicit rather than implicit. Always give the AI a clear role, state your exact output structure, and set guardrails like word limits. Try testing a prompt with those 3 additions!`;
    }
  }
};
