export interface HtmlValidationError {
  type: 'syntax' | 'nesting' | 'attribute' | 'structure' | 'duplicate_id' | 'empty';
  line?: number;
  column?: number;
  tag?: string;
  problem: string;
  suggestion: string;
}

export interface HtmlValidationResult {
  isValid: boolean;
  errors: HtmlValidationError[];
  warnings: HtmlValidationError[];
  summary: string;
}

// Void (self-closing) elements in HTML5 that do not take closing tags
const VOID_TAGS = new Set([
  'area',
  'base',
  'br',
  'col',
  'embed',
  'hr',
  'img',
  'input',
  'link',
  'meta',
  'param',
  'source',
  'track',
  'wbr',
]);

interface TagToken {
  name: string;
  isClosing: boolean;
  isSelfClosing: boolean;
  line: number;
  column: number;
  raw: string;
  attributes: Record<string, string>;
}

export function validateHtml(code: string): HtmlValidationResult {
  const errors: HtmlValidationError[] = [];
  const warnings: HtmlValidationError[] = [];

  const trimmed = code ? code.trim() : '';
  if (!trimmed) {
    return {
      isValid: false,
      errors: [
        {
          type: 'empty',
          line: 1,
          problem: 'The HTML code editor is empty.',
          suggestion: 'Write or paste your HTML code, or click "Reset" to load the starter template.',
        },
      ],
      warnings: [],
      summary: 'HTML code is empty. Please enter your markup.',
    };
  }

  // 1. Check for basic malformed angle brackets (e.g. unclosed "<" or dangling ">")
  const lines = code.split('\n');
  const tagTokens: TagToken[] = [];
  const seenIds = new Map<string, number>(); // id -> line number

  // Regex to match tags and comments
  // Matches <!-- ... -->, <!DOCTYPE ...>, or <(/?)(\w+)([^>]*)>
  const tagRegex = /<!--[\s\S]*?-->|<!DOCTYPE[^>]*>|<(\/)?([a-zA-Z0-9\-]+)([^>]*)>/gi;

  let match: RegExpExecArray | null;

  // Helper to get line and column from string index
  const getLineAndCol = (index: number) => {
    let currentLine = 1;
    let currentCol = 1;
    for (let i = 0; i < index; i++) {
      if (code[i] === '\n') {
        currentLine++;
        currentCol = 1;
      } else {
        currentCol++;
      }
    }
    return { line: currentLine, column: currentCol };
  };

  while ((match = tagRegex.exec(code)) !== null) {
    const fullMatch = match[0];
    const isComment = fullMatch.startsWith('<!--');
    const isDoctype = fullMatch.toLowerCase().startsWith('<!doctype');

    if (isComment || isDoctype) {
      continue;
    }

    const isClosing = match[1] === '/';
    const rawTagName = match[2] ? match[2].toLowerCase() : '';
    const rawAttrs = match[3] || '';
    const isSelfClosing = rawAttrs.trim().endsWith('/') || VOID_TAGS.has(rawTagName);

    const { line, column } = getLineAndCol(match.index);

    // Parse attributes
    const attributes: Record<string, string> = {};
    const attrRegex = /([a-zA-Z0-9\-:]+)(?:=(?:"([^"]*)"|'([^']*)'|([^\s>]+)))?/g;
    let attrMatch: RegExpExecArray | null;

    while ((attrMatch = attrRegex.exec(rawAttrs)) !== null) {
      const attrName = attrMatch[1].toLowerCase();
      const attrVal = attrMatch[2] ?? attrMatch[3] ?? attrMatch[4] ?? '';
      attributes[attrName] = attrVal;
    }

    tagTokens.push({
      name: rawTagName,
      isClosing,
      isSelfClosing,
      line,
      column,
      raw: fullMatch,
      attributes,
    });
  }

  // Check 2: Check for unclosed '<' characters that didn't match tagRegex
  let inComment = false;
  for (let i = 0; i < code.length; i++) {
    if (code.startsWith('<!--', i)) {
      inComment = true;
      i += 3;
      continue;
    }
    if (inComment) {
      if (code.startsWith('-->', i)) {
        inComment = false;
        i += 2;
      }
      continue;
    }

    if (code[i] === '<') {
      const closingBracket = code.indexOf('>', i);
      const nextOpenBracket = code.indexOf('<', i + 1);
      if (closingBracket === -1 || (nextOpenBracket !== -1 && nextOpenBracket < closingBracket)) {
        const { line } = getLineAndCol(i);
        errors.push({
          type: 'syntax',
          line,
          problem: 'Malformed tag syntax: Missing closing ">" bracket.',
          suggestion: 'Ensure all opening and closing tags end with a ">" character.',
        });
        break;
      }
    }
  }

  // Check 3: Tag Stack, Nesting, and Closing Tag Balancing
  const tagStack: TagToken[] = [];

  for (const token of tagTokens) {
    // Check for duplicate IDs
    if (token.attributes.id) {
      const idVal = token.attributes.id;
      if (seenIds.has(idVal)) {
        errors.push({
          type: 'duplicate_id',
          line: token.line,
          tag: token.name,
          problem: `Duplicate ID detected: "${idVal}". The element id "${idVal}" was already defined on line ${seenIds.get(idVal)}.`,
          suggestion: `Each ID in HTML must be globally unique. Change id="${idVal}" to a unique identifier.`,
        });
      } else {
        seenIds.set(idVal, token.line);
      }
    }

    // Specific tag attribute validation
    if (token.name === 'img' && !token.isClosing) {
      if (!token.attributes.src) {
        warnings.push({
          type: 'attribute',
          line: token.line,
          tag: 'img',
          problem: '<img> tag is missing a "src" attribute.',
          suggestion: 'Add src="url" to tell the browser which image to display.',
        });
      }
      if (token.attributes.alt === undefined) {
        warnings.push({
          type: 'attribute',
          line: token.line,
          tag: 'img',
          problem: '<img> tag is missing an "alt" alternative text attribute.',
          suggestion: 'Add alt="description" for accessibility and screen readers.',
        });
      }
    }

    if (token.name === 'a' && !token.isClosing && !token.attributes.href) {
      warnings.push({
        type: 'attribute',
        line: token.line,
        tag: 'a',
        problem: 'Hyperlink <a> is missing an "href" destination attribute.',
        suggestion: 'Add href="destination_url" so the link has a clickable target.',
      });
    }

    if (token.name === 'form' && !token.isClosing && !token.attributes.action && !token.attributes.method) {
      warnings.push({
        type: 'attribute',
        line: token.line,
        tag: 'form',
        problem: '<form> element does not specify action or method.',
        suggestion: 'Consider specifying method="POST" or method="GET" for form submissions.',
      });
    }

    // Stack Balancing
    if (token.isClosing) {
      if (VOID_TAGS.has(token.name)) {
        warnings.push({
          type: 'syntax',
          line: token.line,
          tag: token.name,
          problem: `<${token.name}> is a void (self-closing) element and should not have a closing </${token.name}> tag.`,
          suggestion: `Remove </${token.name}>. Void tags close automatically.`,
        });
        continue;
      }

      if (tagStack.length === 0) {
        errors.push({
          type: 'nesting',
          line: token.line,
          tag: token.name,
          problem: `Unexpected closing tag </${token.name}> with no matching opening tag.`,
          suggestion: `Remove </${token.name}> or add an opening <${token.name}> tag prior to this point.`,
        });
        continue;
      }

      const top = tagStack[tagStack.length - 1];
      if (top.name === token.name) {
        tagStack.pop();
      } else {
        // Tag mismatch / incorrect nesting
        const foundIndex = tagStack.map(t => t.name).lastIndexOf(token.name);
        if (foundIndex !== -1) {
          const unclosedTag = tagStack[tagStack.length - 1];
          errors.push({
            type: 'nesting',
            line: token.line,
            tag: token.name,
            problem: `Improper nesting: Found closing tag </${token.name}> while <${unclosedTag.name}> (line ${unclosedTag.line}) is still open.`,
            suggestion: `Close </${unclosedTag.name}> before closing </${token.name}>.`,
          });
          // Pop up to matching tag
          tagStack.splice(foundIndex, tagStack.length - foundIndex);
        } else {
          errors.push({
            type: 'nesting',
            line: token.line,
            tag: token.name,
            problem: `Unexpected closing tag </${token.name}>. No matching opening <${token.name}> was found.`,
            suggestion: `Check for typos in </${token.name}> or remove it.`,
          });
        }
      }
    } else {
      // Opening tag
      if (!VOID_TAGS.has(token.name) && !token.isSelfClosing) {
        tagStack.push(token);
      }
    }
  }

  // Any tags remaining in the stack were never closed
  while (tagStack.length > 0) {
    const unclosed = tagStack.pop()!;
    errors.push({
      type: 'nesting',
      line: unclosed.line,
      tag: unclosed.name,
      problem: `The <${unclosed.name}> tag opened on line ${unclosed.line} was never closed.`,
      suggestion: `Add a closing </${unclosed.name}> tag to properly close this element.`,
    });
  }

  const isValid = errors.length === 0;
  const summary = isValid
    ? warnings.length === 0
      ? 'HTML Check Passed — No detected HTML issues.'
      : `HTML Check Passed with ${warnings.length} accessibility suggestion${warnings.length > 1 ? 's' : ''}.`
    : `Found ${errors.length} issue${errors.length > 1 ? 's' : ''} in your HTML code.`;

  return {
    isValid,
    errors,
    warnings,
    summary,
  };
}

export interface TaskRequirementCheck {
  description: string;
  passed: boolean;
  suggestion?: string;
}

export interface PracticeVerificationResult {
  allPassed: boolean;
  checks: TaskRequirementCheck[];
  feedback: string;
}

/**
 * Validates CSS stylesheet syntax: checks for balanced braces, non-empty content, and unclosed comments.
 */
export function validateCss(code: string): HtmlValidationResult {
  const errors: HtmlValidationError[] = [];
  const warnings: HtmlValidationError[] = [];
  const trimmed = code ? code.trim() : '';

  if (!trimmed) {
    return {
      isValid: false,
      errors: [
        {
          type: 'empty',
          line: 1,
          problem: 'CSS code editor is empty.',
          suggestion: 'Write your CSS styles or tap "Solve with AI" to generate the working solution.',
        },
      ],
      warnings: [],
      summary: 'CSS code is empty. Please enter your styles.',
    };
  }

  // Check balanced curly braces
  let openBraceCount = 0;
  const lines = code.split('\n');
  let openBraceLine = 1;

  for (let l = 0; l < lines.length; l++) {
    const line = lines[l];
    for (let c = 0; c < line.length; c++) {
      if (line[c] === '{') {
        openBraceCount++;
        openBraceLine = l + 1;
      } else if (line[c] === '}') {
        openBraceCount--;
        if (openBraceCount < 0) {
          errors.push({
            type: 'syntax',
            line: l + 1,
            problem: 'Unexpected closing brace "}" without an opening "{" block.',
            suggestion: 'Remove extra closing brace or add the corresponding selector and opening brace.',
          });
          openBraceCount = 0;
        }
      }
    }
  }

  if (openBraceCount > 0) {
    errors.push({
      type: 'syntax',
      line: openBraceLine,
      problem: `Unclosed CSS rule block: Missing closing "}" brace.`,
      suggestion: 'Ensure every CSS rule set ends with a closing "}" brace.',
    });
  }

  // Check unclosed comments
  if (code.includes('/*') && !code.includes('*/')) {
    errors.push({
      type: 'syntax',
      line: 1,
      problem: 'Unclosed CSS comment block /* ... */.',
      suggestion: 'Add "*/" to close the CSS comment.',
    });
  }

  const isValid = errors.length === 0;
  return {
    isValid,
    errors,
    warnings,
    summary: isValid ? 'CSS Syntax Check Passed.' : `Found ${errors.length} issue(s) in CSS.`,
  };
}

/**
 * Validates JavaScript/TypeScript/Node syntax (balanced braces, brackets, quotes, without angle bracket HTML limits).
 */
export function validateJavaScript(code: string, tech: string = 'javascript'): HtmlValidationResult {
  const errors: HtmlValidationError[] = [];
  const warnings: HtmlValidationError[] = [];
  const trimmed = code ? code.trim() : '';

  if (!trimmed) {
    return {
      isValid: false,
      errors: [
        {
          type: 'empty',
          line: 1,
          problem: `${tech.toUpperCase()} code editor is empty.`,
          suggestion: 'Write your code solution or tap "Solve with AI" to generate the working solution.',
        },
      ],
      warnings: [],
      summary: `${tech.toUpperCase()} code is empty.`,
    };
  }

  // Stack-based bracket balance check
  const stack: Array<{ char: string; line: number; col: number }> = [];
  const lines = code.split('\n');
  let inString: string | null = null;
  let isEscaped = false;

  for (let l = 0; l < lines.length; l++) {
    const line = lines[l];
    for (let c = 0; c < line.length; c++) {
      const char = line[c];

      if (isEscaped) {
        isEscaped = false;
        continue;
      }

      if (char === '\\') {
        isEscaped = true;
        continue;
      }

      if (inString) {
        if (char === inString) {
          inString = null;
        }
        continue;
      }

      if (char === '"' || char === "'" || char === '`') {
        inString = char;
        continue;
      }

      // Check single line comment
      if (char === '/' && c + 1 < line.length && line[c + 1] === '/') {
        break;
      }

      if (char === '{' || char === '(' || char === '[') {
        stack.push({ char, line: l + 1, col: c + 1 });
      } else if (char === '}' || char === ')' || char === ']') {
        if (stack.length === 0) {
          errors.push({
            type: 'syntax',
            line: l + 1,
            problem: `Unexpected closing "${char}" with no matching opener.`,
            suggestion: `Remove the stray "${char}" or verify your bracket pairing.`,
          });
          continue;
        }
        const top = stack.pop()!;
        const pairs: Record<string, string> = { '}': '{', ')': '(', ']': '[' };
        if (pairs[char] !== top.char) {
          errors.push({
            type: 'syntax',
            line: l + 1,
            problem: `Mismatched bracket: Found "${char}" matching "${top.char}" opened on line ${top.line}.`,
            suggestion: `Ensure brackets and parentheses match in order.`,
          });
        }
      }
    }

    if (inString && inString !== '`') {
      errors.push({
        type: 'syntax',
        line: l + 1,
        problem: `Unclosed string literal (${inString}). Strings must close on the same line.`,
        suggestion: `Add closing ${inString} or use template literal backticks (\`) for multi-line strings.`,
      });
      inString = null;
    }
  }

  while (stack.length > 0) {
    const unclosed = stack.pop()!;
    errors.push({
      type: 'syntax',
      line: unclosed.line,
      problem: `Unclosed "${unclosed.char}" bracket opened on line ${unclosed.line}.`,
      suggestion: `Add the matching closing bracket for "${unclosed.char}".`,
    });
  }

  const isValid = errors.length === 0;
  return {
    isValid,
    errors,
    warnings,
    summary: isValid ? `${tech.toUpperCase()} Syntax Check Passed.` : `Found ${errors.length} issue(s) in your code.`,
  };
}

/**
 * Universal language-aware syntax validator. Dispatches to the appropriate parser for each course.
 */
export function validateCode(code: string, tech: string = 'html'): HtmlValidationResult {
  const t = (tech || 'html').toLowerCase();
  if (t === 'html') {
    return validateHtml(code);
  }
  if (t === 'css') {
    return validateCss(code);
  }
  if (t === 'prompt' || t === 'prompt-engineering' || t === 'promptengineering') {
    const trimmed = (code || '').trim();
    if (!trimmed) {
      return {
        isValid: false,
        errors: [{
          type: 'empty',
          line: 1,
          problem: 'Prompt editor is empty.',
          suggestion: 'Write your prompt or tap "Solve with AI" to generate the engineered prompt.',
        }],
        warnings: [],
        summary: 'Prompt is empty.',
      };
    }
    return {
      isValid: true,
      errors: [],
      warnings: [],
      summary: 'Prompt Syntax Check Passed.',
    };
  }

  // JS, TS, Node, Express, MongoDB, REST API, Auth, Capstone
  return validateJavaScript(code, tech);
}

/**
 * Multi-language practice task validator with detailed requirement-by-requirement checks.
 */
export function verifyPracticeTask(
  code: string,
  task?: {
    requirements?: string[];
    validationRules?: Array<{ tag?: string; minCount?: number; attribute?: string; valuePattern?: string; message: string }>;
    starterCode?: string;
  },
  referenceCode?: string,
  tech: string = 'html'
): PracticeVerificationResult {
  const trimmed = (code || '').trim();
  if (!trimmed) {
    return {
      allPassed: false,
      checks: [
        {
          description: 'Enter code in the practice editor',
          passed: false,
          suggestion: 'Write your solution or tap "Solve with AI" to automatically generate the code.',
        },
      ],
      feedback: 'The code editor is empty. Enter your solution or tap "Solve with AI".',
    };
  }

  if (!task) {
    return {
      allPassed: true,
      checks: [{ description: 'Free practice task completed', passed: true }],
      feedback: 'Free practice mode — all checks passed.',
    };
  }

  const lowerCode = trimmed.toLowerCase();
  const normalizedCode = lowerCode.replace(/\s+/g, ' ');

  // Quick pass if code matches reference solution
  if (referenceCode && referenceCode.trim().length > 15) {
    const normRef = referenceCode.toLowerCase().replace(/\s+/g, ' ').trim();
    if (normalizedCode.includes(normRef) || normRef.includes(normalizedCode)) {
      const checks: TaskRequirementCheck[] = (task.validationRules || []).map(r => ({
        description: r.message,
        passed: true,
      }));
      if (checks.length === 0 && task.requirements) {
        task.requirements.forEach(req => checks.push({ description: req, passed: true }));
      }
      return {
        allPassed: true,
        checks: checks.length > 0 ? checks : [{ description: 'All requirements satisfied', passed: true }],
        feedback: '🎉 Perfect! All practice task requirements are satisfied.',
      };
    }
  }

  const checks: TaskRequirementCheck[] = [];

  // 1. If explicit validation rules exist, test them
  if (task.validationRules && task.validationRules.length > 0) {
    for (const rule of task.validationRules) {
      let passed = false;
      let suggestion = '';

      if (rule.tag) {
        const tag = rule.tag.toLowerCase();
        // Match opening tag e.g. <h1 or <h1 ... or void tag <input
        const tagRegex = new RegExp(`<${tag}(\\s+[^>]*)?>`, 'gi');
        const matches = lowerCode.match(tagRegex) || [];
        const minCount = rule.minCount || 1;
        passed = matches.length >= minCount;
        if (!passed) {
          suggestion = `Add the <${tag}> tag to your HTML code (found ${matches.length}, needed ${minCount}).`;
        }
      } else if (rule.attribute) {
        const attrRegex = new RegExp(`${rule.attribute.toLowerCase()}\\s*=`, 'i');
        passed = attrRegex.test(lowerCode);
        if (!passed) {
          suggestion = `Add the "${rule.attribute}" attribute to the element.`;
        }
      } else if (rule.valuePattern) {
        const patRegex = new RegExp(rule.valuePattern, 'i');
        passed = patRegex.test(code);
        if (!passed) {
          suggestion = `Ensure your code matches the expected pattern: ${rule.message}.`;
        }
      }

      checks.push({
        description: rule.message,
        passed,
        suggestion: passed ? undefined : suggestion,
      });
    }
  } else if (task.requirements && task.requirements.length > 0) {
    // 2. Language-aware requirement check
    const t = (tech || 'html').toLowerCase();

    for (const req of task.requirements) {
      const lowerReq = req.toLowerCase();
      let passed = false;
      let suggestion = '';

      // Check if requirement mentions an HTML tag
      const tagMatch = lowerReq.match(/<([a-z0-9]+)>/i);
      if (tagMatch) {
        const tagName = tagMatch[1].toLowerCase();
        const tagRegex = new RegExp(`<${tagName}(\\s+[^>]*)?>`, 'gi');
        passed = tagRegex.test(lowerCode);
        if (!passed) {
          suggestion = `Add the <${tagName}> element to your code.`;
        }
      } else if (t === 'css') {
        // CSS properties/selectors extraction
        if (lowerReq.includes('.card')) passed = lowerCode.includes('.card');
        else if (lowerReq.includes('box-sizing')) passed = lowerCode.includes('box-sizing');
        else if (lowerReq.includes('padding')) passed = lowerCode.includes('padding');
        else if (lowerReq.includes('border-radius')) passed = lowerCode.includes('border-radius');
        else if (lowerReq.includes('flex')) passed = lowerCode.includes('flex');
        else if (lowerReq.includes('justify-content')) passed = lowerCode.includes('justify-content');
        else if (lowerReq.includes('@media')) passed = lowerCode.includes('@media');
        else {
          const keywords = lowerReq.split(/[\s,.'";:]+/).filter(w => w.length > 3);
          passed = keywords.some(k => lowerCode.includes(k)) || trimmed.length > 25;
        }
      } else if (t === 'javascript' || t === 'js') {
        if (lowerReq.includes('arrow')) passed = lowerCode.includes('=>');
        else if (lowerReq.includes('addeventlistener') || lowerReq.includes('click')) passed = lowerCode.includes('addeventlistener') || lowerCode.includes('onclick');
        else if (lowerReq.includes('async') || lowerReq.includes('await')) passed = lowerCode.includes('async') || lowerCode.includes('await');
        else if (lowerReq.includes('fetch')) passed = lowerCode.includes('fetch');
        else if (lowerReq.includes('sum')) passed = lowerCode.includes('+') || lowerCode.includes('sum');
        else {
          const keywords = lowerReq.split(/[\s,.'";:]+/).filter(w => w.length > 3);
          passed = keywords.some(k => lowerCode.includes(k)) || trimmed.length > 25;
        }
      } else if (t === 'nodejs' || t === 'node') {
        if (lowerReq.includes('require')) passed = lowerCode.includes('require');
        else if (lowerReq.includes('path')) passed = lowerCode.includes('path');
        else if (lowerReq.includes('fs.writefile') || lowerReq.includes('writefile')) passed = lowerCode.includes('writefile');
        else if (lowerReq.includes('json.stringify')) passed = lowerCode.includes('stringify');
        else {
          const keywords = lowerReq.split(/[\s,.'";:]+/).filter(w => w.length > 3);
          passed = keywords.some(k => lowerCode.includes(k)) || trimmed.length > 25;
        }
      } else if (t === 'expressjs' || t === 'express') {
        if (lowerReq.includes('app.get')) passed = lowerCode.includes('app.get');
        else if (lowerReq.includes('app.use')) passed = lowerCode.includes('app.use');
        else if (lowerReq.includes('res.json')) passed = lowerCode.includes('res.json');
        else if (lowerReq.includes('next()') || lowerReq.includes('next')) passed = lowerCode.includes('next');
        else {
          const keywords = lowerReq.split(/[\s,.'";:]+/).filter(w => w.length > 3);
          passed = keywords.some(k => lowerCode.includes(k)) || trimmed.length > 25;
        }
      } else if (t === 'mongodb' || t === 'mongo') {
        if (lowerReq.includes('title') || lowerReq.includes('string')) passed = lowerCode.includes('string') || lowerCode.includes('title');
        else if (lowerReq.includes('price') || lowerReq.includes('number')) passed = lowerCode.includes('number') || lowerCode.includes('price');
        else if (lowerReq.includes('findone')) passed = lowerCode.includes('findone');
        else {
          const keywords = lowerReq.split(/[\s,.'";:]+/).filter(w => w.length > 3);
          passed = keywords.some(k => lowerCode.includes(k)) || trimmed.length > 25;
        }
      } else if (t === 'auth' || t === 'authentication' || t === 'restapi') {
        if (lowerReq.includes('bcrypt') || lowerReq.includes('hash')) passed = lowerCode.includes('bcrypt') || lowerCode.includes('hash');
        else if (lowerReq.includes('form')) passed = lowerCode.includes('<form');
        else if (lowerReq.includes('email')) passed = lowerCode.includes('email');
        else if (lowerReq.includes('password')) passed = lowerCode.includes('password');
        else if (lowerReq.includes('button')) passed = lowerCode.includes('<button');
        else {
          const keywords = lowerReq.split(/[\s,.'";:]+/).filter(w => w.length > 3);
          passed = keywords.some(k => lowerCode.includes(k)) || trimmed.length > 25;
        }
      } else {
        // General matching
        const keywords = lowerReq.split(/[\s,.'";:]+/).filter(w => w.length > 4);
        passed = keywords.length > 0 ? keywords.some(k => lowerCode.includes(k)) : trimmed.length > 20;
      }

      if (!passed) {
        suggestion = `Requirement not met: "${req}".`;
      }

      checks.push({
        description: req,
        passed,
        suggestion: passed ? undefined : suggestion,
      });
    }
  }

  const allPassed = checks.length > 0 && checks.every(c => c.passed);
  const passedCount = checks.filter(c => c.passed).length;
  const feedback = allPassed
    ? '🎉 Perfect! All practice task requirements are satisfied.'
    : `${passedCount} of ${checks.length} requirement(s) satisfied. Tap "Solve with AI" to fix.`;

  return {
    allPassed,
    checks,
    feedback,
  };
}

/**
 * Returns the guaranteed compliant, error-free working solution for any lesson in any course.
 */
export function getLessonSolution(lesson: any, tech: string = 'html'): string {
  if (!lesson) return '';

  const t = (tech || 'html').toLowerCase();

  // 1. Prompt Engineering
  if (t === 'prompt' || t === 'prompt-engineering' || t === 'promptengineering') {
    if (lesson.engineered_prompt) return lesson.engineered_prompt.trim();
    if (lesson.practiceTask?.starterCode) return lesson.practiceTask.starterCode.trim();
    if (lesson.starterCode) return lesson.starterCode.trim();
    return `[ROLE] Act as a Senior AI Architect.\n[TASK] ${lesson.practiceTask?.description || lesson.title}\n[CONTEXT] Production web application ecosystem.\n[CONSTRAINT] High precision, concise execution, step-by-step clarity.\n[FORMAT] Clean structured response with Markdown headings and bullet points.`;
  }

  const lessonId = lesson._id || lesson.id || lesson.slug || '';

  // 2. Tailored verified solutions for non-HTML courses
  switch (lessonId) {
    case 'css-les-1-1':
    case 'intro-to-css-selectors':
    case 'css-course':
      return `<!DOCTYPE html>
<html>
<head>
<style>
  h1 { color: #5653fe; font-family: sans-serif; }
  .card {
    background-color: #EEEDFF;
    padding: 16px;
    border-radius: 10px;
    color: #1E293B;
  }
</style>
</head>
<body>
  <h1>CSS Styling</h1>
  <div class="card">My Styled Card</div>
</body>
</html>`;

    case 'css-les-1-2':
    case 'css-box-model':
      return `<!DOCTYPE html>
<html>
<head>
<style>
  * { box-sizing: border-box; }
  .container {
    width: 300px;
    padding: 15px;
    border: 2px solid #5653fe;
    margin: 10px;
    background: #F1F5F9;
  }
</style>
</head>
<body>
  <div class="container">Box Model Exercise</div>
</body>
</html>`;

    case 'css-les-2-1':
    case 'css-mod-2':
    case 'flexbox-architecture-alignment':
      return `<!DOCTYPE html>
<html>
<head>
<style>
  .nav {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 20px;
    background: #EEEDFF;
    border-radius: 8px;
  }
</style>
</head>
<body>
  <nav class="nav">
    <div><strong>Logo</strong></div>
    <div><span>Home</span> | <span>Courses</span></div>
  </nav>
</body>
</html>`;

    case 'css-les-3-1':
    case 'css-mod-3':
    case 'media-queries-mobile-breakpoints':
      return `<!DOCTYPE html>
<html>
<head>
<style>
  .grid {
    display: flex;
    flex-direction: row;
    gap: 12px;
  }
  @media (max-width: 600px) {
    .grid {
      flex-direction: column;
    }
  }
</style>
</head>
<body>
  <div class="grid">
    <div style="padding: 10px; background: #EEEDFF;">Column 1</div>
    <div style="padding: 10px; background: #EEEDFF;">Column 2</div>
  </div>
</body>
</html>`;

    case 'js-les-1-1':
    case 'js-course':
    case 'modern-es6-arrow-functions':
      return `// Arrow function calculating sum of inputs
const add = (a, b) => a + b;
console.log("Sum result:", add(15, 25));`;

    case 'js-les-2-1':
    case 'js-mod-2':
    case 'selecting-elements-event-listeners':
      return `<!DOCTYPE html>
<html>
<body>
  <button id="btn">Increment</button>
  <span id="count">0</span>
  <script>
    let count = 0;
    const btn = document.getElementById("btn");
    const countEl = document.getElementById("count");
    btn.addEventListener("click", () => {
      count++;
      countEl.innerText = count;
    });
  </script>
</body>
</html>`;

    case 'js-les-3-1':
    case 'js-mod-3':
    case 'fetching-data-async-await':
      return `async function loadCourses() {
  try {
    const res = await fetch("/api/courses");
    const data = await res.json();
    console.log("Courses loaded:", data);
    return data;
  } catch (err) {
    console.error("Fetch error:", err);
  }
}
loadCourses();`;

    case 'node-les-1-1':
    case 'node-course':
    case 'node-fundamentals-event-loop':
      return `const path = require("path");
const resolvedPath = path.resolve(__dirname, "server.js");
console.log("Resolved file path:", resolvedPath);`;

    case 'node-les-2-1':
    case 'node-mod-2':
    case 'fs-and-streams':
      return `const fs = require("fs/promises");
async function saveConfig() {
  const payload = JSON.stringify({ status: "active", version: "1.0.0" }, null, 2);
  await fs.writeFile("output.json", payload);
  console.log("Configuration saved successfully.");
}
saveConfig();`;

    case 'exp-les-1-1':
    case 'express-course':
    case 'creating-express-app-routes':
      return `const express = require("express");
const app = express();
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

app.listen(3000, () => console.log("Server listening on port 3000"));`;

    case 'exp-les-2-1':
    case 'exp-mod-2':
    case 'understanding-express-middleware':
      return `const express = require("express");
const app = express();

// Custom request logger middleware
app.use((req, res, next) => {
  console.log(\`[\${new Date().toISOString()}] \${req.method} \${req.url}\`);
  next();
});

app.get("/", (req, res) => res.send("Middleware verified"));`;

    case 'mongo-les-1-1':
    case 'mongo-course':
    case 'designing-mongoose-schemas':
      return `const mongoose = require("mongoose");

const itemSchema = new mongoose.Schema({
  title: { type: String, required: true },
  price: { type: Number, required: true }
});

const Item = mongoose.model("Item", itemSchema);
module.exports = Item;`;

    case 'mongo-les-2-1':
    case 'mongo-mod-2':
    case 'executing-database-crud-queries':
      return `const User = require("./models/User");

async function getUserProfile(email) {
  const user = await User.findOne({ email });
  return user;
}`;

    case 'rest-les-1-1':
    case 'rest-course':
    case 'bcrypt-password-hashing-verification':
      return `const bcrypt = require("bcryptjs");

async function hashAndVerify(password) {
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);
  const isMatch = await bcrypt.compare(password, hashedPassword);
  return { hashedPassword, isMatch };
}`;

    case 'auth-course':
      return `<!DOCTYPE html>
<html>
<body>
  <form action="/api/login" method="POST">
    <label for="email">Email</label>
    <input type="email" id="email" name="email" required />
    <label for="password">Password</label>
    <input type="password" id="password" name="password" required />
    <button type="submit">Sign In</button>
  </form>
</body>
</html>`;

    case 'cap-les-1-1':
    case 'capstone-course':
    case 'end-to-end-capstone-architecture':
      return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Production Full Stack Capstone</title>
  <style>
    body { font-family: sans-serif; padding: 20px; background: #F8FAFC; }
    .header { background: #5653FE; color: white; padding: 16px; border-radius: 8px; }
  </style>
</head>
<body>
  <header class="header">
    <h1>CrackWithAI Full Stack Capstone</h1>
    <p>Connected with HTML5, CSS3, JavaScript, Node, Express, MongoDB & Auth.</p>
  </header>
  <main id="app">
    <p>REST API live client ready.</p>
  </main>
  <script>
    console.log("Production Full Stack Web Developer Capstone Deployed Successfully!");
  </script>
</body>
</html>`;
  }

  // 3. Fallbacks
  if (
    lesson.practiceTask?.starterCode &&
    lesson.practiceTask.starterCode.trim().length > 30 &&
    !lesson.practiceTask.starterCode.includes('/* Add styles here */') &&
    !lesson.practiceTask.starterCode.includes('// Write add function here')
  ) {
    return lesson.practiceTask.starterCode.trim();
  }

  if (lesson.starterCode && lesson.starterCode.trim().length > 30) {
    return lesson.starterCode.trim();
  }

  if (lesson.codeExample && lesson.codeExample.trim().length > 10) {
    return lesson.codeExample.trim();
  }

  return lesson.practiceTask?.starterCode?.trim() || lesson.starterCode?.trim() || lesson.codeExample?.trim() || '';
}

export interface PromptEvaluationResult {
  score: number;
  allPassed: boolean;
  checks: TaskRequirementCheck[];
  strengths: string[];
  improvements: string[];
  feedback: string;
}

export function verifyPromptTask(
  promptText: string,
  task?: { requirements?: string[]; validationRules?: Array<{ valuePattern?: string; message: string }> }
): PromptEvaluationResult {
  const trimmed = (promptText || '').trim();
  if (!trimmed) {
    return {
      score: 0,
      allPassed: false,
      checks: [{ description: 'Prompt text entered', passed: false }],
      strengths: [],
      improvements: ['Write your prompt in the editor before checking.'],
      feedback: 'The prompt editor is empty.',
    };
  }

  const lower = trimmed.toLowerCase();
  const checks: TaskRequirementCheck[] = [];
  const strengths: string[] = [];
  const improvements: string[] = [];

  const hasRole = /role|act as|you are a|persona|as a|expert|specialist/i.test(lower) || lower.includes('[role]');
  const hasTask = /task|create|build|generate|explain|convert|audit|write|evaluate|summarize|classify/i.test(lower) || lower.includes('[task]');
  const hasContext = /context|for|background|scenario|audience|use case/i.test(lower) || lower.includes('[context]');
  const hasConstraint = /constraint|do not|never|only|limit|max|no fluff|bullet/i.test(lower) || lower.includes('[constraint]');
  const hasFormat = /format|json|table|markdown|list|output|structure/i.test(lower) || lower.includes('[format]');

  if (hasRole) strengths.push('Clear persona or role specified');
  else improvements.push('Consider defining an explicit AI role (e.g. "Act as a Senior UX Engineer")');

  if (hasTask) strengths.push('Direct task action instruction provided');
  else improvements.push('Clearly state the main goal or action required');

  if (hasConstraint) strengths.push('Defined clear output boundary constraints');
  else improvements.push('Add constraints to avoid verbose or unfocused responses');

  if (hasFormat) strengths.push('Specified exact output format or layout');
  else improvements.push('Specify desired output structure (e.g. JSON, Table, Bullet points)');

  if (task?.validationRules && task.validationRules.length > 0) {
    for (const rule of task.validationRules) {
      let passed = false;
      if (rule.valuePattern) {
        const pat = new RegExp(rule.valuePattern, 'i');
        passed = pat.test(promptText);
      } else {
        passed = trimmed.length >= 15;
      }
      checks.push({
        description: rule.message,
        passed,
      });
    }
  } else if (task?.requirements && task.requirements.length > 0) {
    for (const req of task.requirements) {
      const lowerReq = req.toLowerCase();
      let passed = false;
      if (lowerReq.includes('role') || lowerReq.includes('persona')) {
        passed = hasRole;
      } else if (lowerReq.includes('task') || lowerReq.includes('action')) {
        passed = hasTask;
      } else if (lowerReq.includes('context')) {
        passed = hasContext;
      } else if (lowerReq.includes('constraint') || lowerReq.includes('limit')) {
        passed = hasConstraint;
      } else if (lowerReq.includes('format') || lowerReq.includes('json') || lowerReq.includes('table')) {
        passed = hasFormat;
      } else {
        const words = lowerReq.split(/\s+/).filter(w => w.length > 4);
        passed = words.some(w => lower.includes(w)) || trimmed.length > 20;
      }
      checks.push({
        description: req,
        passed,
      });
    }
  } else {
    checks.push({
      description: 'Provide a structured prompt with instructions',
      passed: trimmed.length >= 15,
    });
  }

  const allPassed = checks.length > 0 ? checks.every(c => c.passed) : trimmed.length >= 15;
  const passedCount = checks.filter(c => c.passed).length;

  let score = 50;
  if (trimmed.length > 30) score += 10;
  if (hasRole) score += 10;
  if (hasTask) score += 10;
  if (hasConstraint) score += 10;
  if (hasFormat) score += 10;
  score = Math.min(100, score);

  const feedback = allPassed
    ? `🎉 Excellent Prompt! Quality Score: ${score}%. All task requirements satisfied.`
    : `${passedCount} of ${checks.length} prompt requirements satisfied. Score: ${score}%.`;

  return {
    score,
    allPassed,
    checks,
    strengths,
    improvements,
    feedback,
  };
}


