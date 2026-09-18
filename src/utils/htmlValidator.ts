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
}

export interface PracticeVerificationResult {
  allPassed: boolean;
  checks: TaskRequirementCheck[];
  feedback: string;
}

export function verifyPracticeTask(
  code: string,
  task?: { requirements?: string[]; validationRules?: Array<{ tag?: string; minCount?: number; attribute?: string; valuePattern?: string; message: string }> }
): PracticeVerificationResult {
  if (!task) {
    return {
      allPassed: true,
      checks: [],
      feedback: 'Free practice mode — all checks passed.',
    };
  }

  const checks: TaskRequirementCheck[] = [];
  const lowerCode = (code || '').toLowerCase();

  // If explicit validation rules exist, test them
  if (task.validationRules && task.validationRules.length > 0) {
    for (const rule of task.validationRules) {
      let passed = false;

      if (rule.tag) {
        const tag = rule.tag.toLowerCase();
        // Match opening tag e.g. <h1 or <h1 ...
        const tagRegex = new RegExp(`<${tag}(\\s+[^>]*)?>`, 'gi');
        const matches = lowerCode.match(tagRegex) || [];
        const minCount = rule.minCount || 1;
        passed = matches.length >= minCount;
      } else if (rule.attribute) {
        const attrRegex = new RegExp(`${rule.attribute.toLowerCase()}\\s*=`, 'i');
        passed = attrRegex.test(lowerCode);
      } else if (rule.valuePattern) {
        const patRegex = new RegExp(rule.valuePattern, 'i');
        passed = patRegex.test(code);
      }

      checks.push({
        description: rule.message,
        passed,
      });
    }
  } else if (task.requirements && task.requirements.length > 0) {
    // Fallback heuristic based on requirement strings
    for (const req of task.requirements) {
      const lowerReq = req.toLowerCase();
      // Extract any tag mentioned like <h1> or <p> or <form>
      const tagMatch = lowerReq.match(/<([a-z0-9]+)>/i);
      let passed = true;
      if (tagMatch) {
        const tagName = tagMatch[1].toLowerCase();
        const tagRegex = new RegExp(`<${tagName}(\\s+[^>]*)?>`, 'gi');
        passed = tagRegex.test(lowerCode);
      }
      checks.push({
        description: req,
        passed,
      });
    }
  }

  const allPassed = checks.length > 0 && checks.every(c => c.passed);
  const passedCount = checks.filter(c => c.passed).length;
  const feedback = allPassed
    ? '🎉 Perfect! All practice task requirements are satisfied.'
    : `${passedCount} of ${checks.length} task requirements met. Keep going!`;

  return {
    allPassed,
    checks,
    feedback,
  };
}

