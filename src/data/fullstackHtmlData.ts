// Auto-generated Full Stack HTML static fallback data
import { FullStackTrack, HtmlCourse, HtmlModule, HtmlLesson } from "../types/fullstack";

export const FULLSTACK_TRACKS: FullStackTrack[] = [
  {
    "id": "html",
    "title": "HTML",
    "subtitle": "Foundations of Web Structure",
    "description": "Master HTML5 tags, document hierarchy, forms, semantic elements, and web accessibility.",
    "status": "active",
    "badge": "Track 1",
    "lessonsCount": 25,
    "modulesCount": 4,
    "duration": "3 hours",
    "level": "Beginner",
    "icon": "code",
    "route": "HtmlCourse"
  },
  {
    "id": "css",
    "title": "CSS",
    "subtitle": "Styling & Modern Responsive Layouts",
    "description": "Style beautiful interfaces with Flexbox, CSS Grid, animations, and responsive media queries.",
    "status": "active",
    "badge": "Track 2",
    "lessonsCount": 20,
    "modulesCount": 3,
    "duration": "4 hours",
    "level": "Beginner",
    "icon": "layout",
    "route": "HtmlCourse"
  },
  {
    "id": "javascript",
    "title": "JavaScript",
    "subtitle": "Interactivity & Modern ES6+ Logic",
    "description": "Master variables, functions, async/await, DOM manipulation, and dynamic client-side logic.",
    "status": "active",
    "badge": "Track 3",
    "lessonsCount": 25,
    "modulesCount": 4,
    "duration": "6 hours",
    "level": "Intermediate",
    "icon": "terminal",
    "route": "HtmlCourse"
  },
  {
    "id": "nodejs",
    "title": "Node.js",
    "subtitle": "Server-side JavaScript Runtime",
    "description": "Execute JavaScript outside the browser, read files, handle streams, and build server modules.",
    "status": "active",
    "badge": "Track 4",
    "lessonsCount": 15,
    "modulesCount": 3,
    "duration": "4 hours",
    "level": "Intermediate",
    "icon": "server",
    "route": "HtmlCourse"
  },
  {
    "id": "expressjs",
    "title": "Express.js",
    "subtitle": "Fast Backend Web Framework",
    "description": "Build RESTful APIs, route requests, manage middleware, and handle server error logging.",
    "status": "active",
    "badge": "Track 5",
    "lessonsCount": 15,
    "modulesCount": 3,
    "duration": "4 hours",
    "level": "Intermediate",
    "icon": "cpu",
    "route": "HtmlCourse"
  },
  {
    "id": "mongodb",
    "title": "MongoDB",
    "subtitle": "NoSQL Database & Mongoose ODM",
    "description": "Store JSON-like documents, design data schemas, write queries, and perform aggregations.",
    "status": "active",
    "badge": "Track 6",
    "lessonsCount": 15,
    "modulesCount": 3,
    "duration": "4 hours",
    "level": "Intermediate",
    "icon": "database",
    "route": "HtmlCourse"
  },
  {
    "id": "restapi",
    "title": "REST APIs",
    "subtitle": "Standardized Client-Server Contracts",
    "description": "Design idempotent HTTP endpoints, status codes, request validation, and API versioning.",
    "status": "active",
    "badge": "Track 7",
    "lessonsCount": 15,
    "modulesCount": 3,
    "duration": "5 hours",
    "level": "Advanced",
    "icon": "globe",
    "route": "HtmlCourse"
  },
  {
    "id": "auth",
    "title": "Authentication & Authorization",
    "subtitle": "Security, JWT & OAuth Sessions",
    "description": "Secure applications with password hashing, JSON Web Tokens, cookies, and protected routes.",
    "status": "active",
    "badge": "Track 8",
    "lessonsCount": 12,
    "modulesCount": 3,
    "duration": "4 hours",
    "level": "Advanced",
    "icon": "shield",
    "route": "HtmlCourse"
  },
  {
    "id": "capstone",
    "title": "Final Full Stack Project",
    "subtitle": "End-to-End Production Capstone",
    "description": "Connect HTML, CSS, JavaScript, Node, Express, MongoDB, and Auth into a deployed capstone app.",
    "status": "active",
    "badge": "Track 9",
    "lessonsCount": 10,
    "modulesCount": 2,
    "duration": "8 hours",
    "level": "Capstone",
    "icon": "award",
    "route": "HtmlCourse"
  }
];

const OLD_FALLBACK_MODULES: HtmlModule[] = [
  {
    "_id": "module-1",
    "id": "module-1",
    "title": "Module 1 — HTML Basics",
    "slug": "module-1-html-basics",
    "order": 1,
    "description": "Learn fundamental web page architecture, doctypes, and core text elements.",
    "duration": 45,
    "lessons": [
      {
        "_id": "lesson-1-1",
        "id": "lesson-1-1",
        "moduleId": "module-1",
        "moduleTitle": "Module 1 — HTML Basics",
        "courseId": "html-from-beginner-to-practical",
        "order": 1,
        "title": "Introduction to HTML",
        "slug": "introduction-to-html",
        "description": "Understand what the web is built with and start your full stack journey.",
        "learningObjective": "Learn what HTML stands for, how browsers read HTML, and why it is the backbone of the web.",
        "concept": "HTML stands for HyperText Markup Language. It is the universal language used to create the structure of webpages. Every website you visit—from Google to Instagram—uses HTML to tell the browser what content to display on the screen.",
        "codeExample": "<h1>Hello, Full Stack World!</h1>\n<p>Welcome to CrackWithAI HTML Course.</p>",
        "expectedOutput": "A large bold heading saying \"Hello, Full Stack World!\" followed by a regular paragraph.",
        "starterCode": "<!DOCTYPE html>\n<html>\n<head>\n  <title>My First HTML Page</title>\n</head>\n<body>\n  <!-- Write your first HTML heading and paragraph here -->\n  <h1>Welcome to HTML</h1>\n  <p>I am learning Full Stack development on CrackWithAI.</p>\n</body>\n</html>",
        "practiceTask": {
          "title": "Your First Webpage",
          "description": "Create a simple webpage with a personalized heading and an introductory sentence about yourself.",
          "requirements": [
            "Add an <h1> heading with your name or website title",
            "Add at least one <p> paragraph describing your goal"
          ],
          "starterCode": "<!DOCTYPE html>\n<html>\n<head>\n  <title>About Me</title>\n</head>\n<body>\n  <h1>Full Stack Developer</h1>\n  <p>I am learning HTML on CrackWithAI!</p>\n</body>\n</html>",
          "expectedOutput": "A page displaying your top heading and a descriptive paragraph.",
          "validationRules": [
            {
              "tag": "h1",
              "minCount": 1,
              "message": "Include at least one <h1> element"
            },
            {
              "tag": "p",
              "minCount": 1,
              "message": "Include at least one <p> element"
            }
          ]
        }
      },
      {
        "_id": "lesson-1-2",
        "id": "lesson-1-2",
        "moduleId": "module-1",
        "moduleTitle": "Module 1 — HTML Basics",
        "courseId": "html-from-beginner-to-practical",
        "order": 2,
        "title": "What is HTML?",
        "slug": "what-is-html",
        "description": "Understand tags, opening tags, closing tags, and element anatomy.",
        "learningObjective": "Deconstruct an HTML element into opening tag, content, and closing tag.",
        "concept": "An HTML element usually consists of an opening tag (like <p>), the inner content, and a closing tag (like </p>). The forward slash \"/\" in the closing tag signals to the browser that this element ends here.",
        "codeExample": "<p>This is an opening tag, content, and closing tag.</p>",
        "expectedOutput": "A clean single paragraph of text.",
        "starterCode": "<!DOCTYPE html>\n<html>\n<body>\n  <h2>Understanding HTML Elements</h2>\n  <p>Every element has an opening tag, content, and closing tag.</p>\n</body>\n</html>",
        "practiceTask": {
          "title": "Tag Anatomy Practice",
          "description": "Write two paragraphs explaining what HTML tags and closing tags do.",
          "requirements": [
            "Include an <h2> heading",
            "Include two separate <p> paragraph elements with proper closing tags"
          ],
          "starterCode": "<!DOCTYPE html>\n<html>\n<body>\n  <h2>HTML Anatomy</h2>\n  <p>Paragraph 1: An opening tag starts an element.</p>\n  <p>Paragraph 2: A closing tag ends the element.</p>\n</body>\n</html>",
          "expectedOutput": "An <h2> heading followed by two distinct paragraphs.",
          "validationRules": [
            {
              "tag": "h2",
              "minCount": 1,
              "message": "Include an <h2> heading"
            },
            {
              "tag": "p",
              "minCount": 2,
              "message": "Include at least 2 <p> elements"
            }
          ]
        }
      },
      {
        "_id": "lesson-1-3",
        "id": "lesson-1-3",
        "moduleId": "module-1",
        "moduleTitle": "Module 1 — HTML Basics",
        "courseId": "html-from-beginner-to-practical",
        "order": 3,
        "title": "HTML Document Structure",
        "slug": "html-document-structure",
        "description": "Explore the full anatomy of a complete HTML5 document tree.",
        "learningObjective": "Master the root <html>, <head>, and <body> hierarchy in every webpage.",
        "concept": "Every standard HTML webpage is structured as a tree. The <html> tag is the root container. Inside it, <head> holds metadata (title, character encoding, viewport) and <body> contains everything the user sees on the screen.",
        "codeExample": "<!DOCTYPE html>\n<html>\n<head>\n  <title>Page Title</title>\n</head>\n<body>\n  <h1>Visible Content</h1>\n</body>\n</html>",
        "expectedOutput": "A properly structured page with title in the browser tab and heading on screen.",
        "starterCode": "<!DOCTYPE html>\n<html lang=\"en\">\n<head>\n  <meta charset=\"UTF-8\">\n  <title>My Document</title>\n</head>\n<body>\n  <h1>Document Tree</h1>\n  <p>Head holds metadata, body holds content.</p>\n</body>\n</html>",
        "practiceTask": {
          "title": "Assemble Complete Structure",
          "description": "Construct a full HTML document skeleton with proper html, head, title, and body tags.",
          "requirements": [
            "Include <!DOCTYPE html> declaration",
            "Include <html>, <head>, <title>, and <body> tags",
            "Add an <h1> heading and a <p> inside <body>"
          ],
          "starterCode": "<!DOCTYPE html>\n<html lang=\"en\">\n<head>\n  <meta charset=\"UTF-8\">\n  <title>My Structured Webpage</title>\n</head>\n<body>\n  <h1>Full Structure Complete</h1>\n  <p>This document has head metadata and visible body content.</p>\n</body>\n</html>",
          "expectedOutput": "A fully compliant HTML5 document with title and body elements.",
          "validationRules": [
            {
              "tag": "head",
              "minCount": 1,
              "message": "Must include <head>"
            },
            {
              "tag": "body",
              "minCount": 1,
              "message": "Must include <body>"
            },
            {
              "tag": "h1",
              "minCount": 1,
              "message": "Must include <h1> inside body"
            }
          ]
        }
      },
      {
        "_id": "lesson-1-4",
        "id": "lesson-1-4",
        "moduleId": "module-1",
        "moduleTitle": "Module 1 — HTML Basics",
        "courseId": "html-from-beginner-to-practical",
        "order": 4,
        "title": "DOCTYPE, html, head, body",
        "slug": "doctype-html-head-body",
        "description": "Understand the purpose of DOCTYPE declarations and essential head tags.",
        "learningObjective": "Learn why <!DOCTYPE html> is needed and how meta tags control viewport and responsiveness.",
        "concept": "<!DOCTYPE html> is not an HTML tag; it is an instruction to the web browser about what version of HTML the page is written in. In modern web development, <!DOCTYPE html> tells browsers to render in standard HTML5 mode without quirk mode.",
        "codeExample": "<!DOCTYPE html>\n<html>\n<head>\n  <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">\n  <title>Mobile Ready</title>\n</head>\n<body>\n  <p>Mobile friendly layout.</p>\n</body>\n</html>",
        "expectedOutput": "A responsive webpage formatted for mobile and desktop screens.",
        "starterCode": "<!DOCTYPE html>\n<html lang=\"en\">\n<head>\n  <meta charset=\"UTF-8\">\n  <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">\n  <title>HTML5 Doctype</title>\n</head>\n<body>\n  <h2>HTML5 Standards</h2>\n  <p>Rendered in modern standards mode.</p>\n</body>\n</html>",
        "practiceTask": {
          "title": "Configure Standard Doctype and Head",
          "description": "Build a document with <!DOCTYPE html>, meta charset, viewport, and title.",
          "requirements": [
            "Include <!DOCTYPE html> at line 1",
            "Set <title> tag inside <head>",
            "Add an <h2> heading inside <body>"
          ],
          "starterCode": "<!DOCTYPE html>\n<html lang=\"en\">\n<head>\n  <meta charset=\"UTF-8\">\n  <title>Standard Page</title>\n</head>\n<body>\n  <h2>HTML5 Standards Mode</h2>\n  <p>This page uses the HTML5 DOCTYPE.</p>\n</body>\n</html>",
          "expectedOutput": "Standard HTML5 page rendered without quirks.",
          "validationRules": [
            {
              "tag": "h2",
              "minCount": 1,
              "message": "Include an <h2> tag"
            },
            {
              "tag": "p",
              "minCount": 1,
              "message": "Include a <p> tag"
            }
          ]
        }
      },
      {
        "_id": "lesson-1-5",
        "id": "lesson-1-5",
        "moduleId": "module-1",
        "moduleTitle": "Module 1 — HTML Basics",
        "courseId": "html-from-beginner-to-practical",
        "order": 5,
        "title": "Headings and Paragraphs",
        "slug": "headings-and-paragraphs",
        "description": "Learn the 6 heading levels (h1 to h6) and paragraph flow.",
        "learningObjective": "Use semantic heading hierarchy from h1 down to h6 and format body text with paragraphs.",
        "concept": "HTML provides 6 levels of headings: <h1> is the most important (main page title), followed by <h2> (major sections), down to <h6> (sub-sub sections). Browsers render <h1> in larger text by default and search engines use it to index your page.",
        "codeExample": "<h1>Main Heading (H1)</h1>\n<h2>Sub-Heading (H2)</h2>\n<h3>Topic (H3)</h3>\n<p>This is a paragraph.</p>",
        "expectedOutput": "Heading text cascading from large to small, followed by regular paragraph text.",
        "starterCode": "<!DOCTYPE html>\n<html>\n<body>\n  <h1>Main Story</h1>\n  <p>Introduction paragraph.</p>\n  <h2>Chapter 1: The Beginning</h2>\n  <p>Story paragraph goes here.</p>\n</body>\n</html>",
        "practiceTask": {
          "title": "Article Hierarchy",
          "description": "Create an article outline using h1, h2, h3, and paragraph tags.",
          "requirements": [
            "Include one <h1> for the article title",
            "Include at least one <h2> for a section",
            "Include at least one <h3> for a subsection",
            "Include two <p> paragraphs"
          ],
          "starterCode": "<!DOCTYPE html>\n<html>\n<body>\n  <h1>CrackWithAI Learning Journey</h1>\n  <p>Welcome to our tech article.</p>\n  <h2>Getting Started</h2>\n  <p>Here is what you will learn.</p>\n  <h3>Step 1: HTML</h3>\n</body>\n</html>",
          "expectedOutput": "A clean hierarchical article layout with 3 heading levels.",
          "validationRules": [
            {
              "tag": "h1",
              "minCount": 1,
              "message": "Include one <h1>"
            },
            {
              "tag": "h2",
              "minCount": 1,
              "message": "Include at least one <h2>"
            },
            {
              "tag": "h3",
              "minCount": 1,
              "message": "Include at least one <h3>"
            },
            {
              "tag": "p",
              "minCount": 2,
              "message": "Include at least two <p> elements"
            }
          ]
        }
      },
      {
        "_id": "lesson-1-6",
        "id": "lesson-1-6",
        "moduleId": "module-1",
        "moduleTitle": "Module 1 — HTML Basics",
        "courseId": "html-from-beginner-to-practical",
        "order": 6,
        "title": "Text Formatting",
        "slug": "text-formatting",
        "description": "Style text using strong, em, mark, small, del, ins, sub, and sup.",
        "learningObjective": "Apply inline formatting tags to emphasize, highlight, and format words.",
        "concept": "HTML has built-in tags to format text: <strong> makes text bold and signals importance. <em> emphasizes text with italics. <mark> highlights text with a yellow background. <small> reduces size. <del> strikes through deleted text.",
        "codeExample": "<p>This is <strong>important</strong> and this is <em>italic</em>. Here is <mark>highlighted</mark> text.</p>",
        "expectedOutput": "A sentence containing bold, italicized, and highlighted words.",
        "starterCode": "<!DOCTYPE html>\n<html>\n<body>\n  <h2>Formatting Text in HTML</h2>\n  <p>Mastering <strong>HTML</strong> is <em>crucial</em> for web development.</p>\n  <p>Special deal: <del>$99</del> <ins>$0</ins> for <mark>Students</mark>!</p>\n</body>\n</html>",
        "practiceTask": {
          "title": "Formatted Announcement",
          "description": "Write an announcement utilizing strong, em, and mark formatting elements.",
          "requirements": [
            "Use <strong> for bold importance",
            "Use <em> for italic emphasis",
            "Use <mark> for highlighting text"
          ],
          "starterCode": "<!DOCTYPE html>\n<html>\n<body>\n  <h1>Notice</h1>\n  <p>Registration is <strong>open</strong> today.</p>\n  <p>Please check your <em>email</em> for the <mark>confirmation</mark> link.</p>\n</body>\n</html>",
          "expectedOutput": "Text with visual bold, italic, and yellow highlight styling.",
          "validationRules": [
            {
              "tag": "strong",
              "minCount": 1,
              "message": "Include at least one <strong> tag"
            },
            {
              "tag": "em",
              "minCount": 1,
              "message": "Include at least one <em> tag"
            },
            {
              "tag": "mark",
              "minCount": 1,
              "message": "Include at least one <mark> tag"
            }
          ]
        }
      },
      {
        "_id": "lesson-1-7",
        "id": "lesson-1-7",
        "moduleId": "module-1",
        "moduleTitle": "Module 1 — HTML Basics",
        "courseId": "html-from-beginner-to-practical",
        "order": 7,
        "title": "HTML Comments",
        "slug": "html-comments",
        "description": "Add developer notes and temporarily hide code using HTML comments.",
        "learningObjective": "Write HTML comments using <!-- comment --> syntax.",
        "concept": "Comments in HTML are written with <!-- followed by your comment and closed with -->. Anything inside a comment is ignored by web browsers and will not be displayed to users. Developers use comments to explain code and organize sections.",
        "codeExample": "<!-- This is a comment that will not show in browser -->\n<h1>Visible Content</h1>",
        "expectedOutput": "Only the <h1> content appears on screen; the comment remains invisible.",
        "starterCode": "<!DOCTYPE html>\n<html>\n<body>\n  <!-- Section Header -->\n  <h2>Developer Notes</h2>\n  <p>Check the source code to see comments!</p>\n  <!-- Remember to test on mobile -->\n</body>\n</html>",
        "practiceTask": {
          "title": "Organize Code with Comments",
          "description": "Document your code by adding comments separating header and body sections.",
          "requirements": [
            "Add at least one HTML comment <!-- note -->",
            "Include an <h1> and a <p> tag"
          ],
          "starterCode": "<!DOCTYPE html>\n<html>\n<body>\n  <!-- Header Section Starts -->\n  <h1>Commented Code</h1>\n  <!-- Body Content Starts -->\n  <p>Comments help developers maintain clean code.</p>\n</body>\n</html>",
          "expectedOutput": "Visible heading and paragraph with clean internal developer notes.",
          "validationRules": [
            {
              "tag": "h1",
              "minCount": 1,
              "message": "Include an <h1>"
            },
            {
              "tag": "p",
              "minCount": 1,
              "message": "Include a <p>"
            }
          ]
        }
      }
    ]
  },
  {
    "_id": "module-2",
    "id": "module-2",
    "title": "Module 2 — HTML Elements",
    "slug": "module-2-html-elements",
    "order": 2,
    "description": "Master hyperlinks, images, lists, tables, divs, and modern semantic elements.",
    "duration": 50,
    "lessons": [
      {
        "_id": "lesson-2-1",
        "id": "lesson-2-1",
        "moduleId": "module-2",
        "moduleTitle": "Module 2 — HTML Elements",
        "courseId": "html-from-beginner-to-practical",
        "order": 8,
        "title": "Links",
        "slug": "links",
        "description": "Create hyperlinks with the anchor tag, href attribute, and targets.",
        "learningObjective": "Build internal and external hyperlinks using <a> and target=\"_blank\".",
        "concept": "Links are created using the anchor element <a>. The most important attribute is href (Hypertext Reference), which points to the destination URL. Adding target=\"_blank\" tells the browser to open the link in a new tab.",
        "codeExample": "<a href=\"https://crackwithai.com\" target=\"_blank\">Visit CrackWithAI</a>",
        "expectedOutput": "A clickable blue underlined link that opens the target website.",
        "starterCode": "<!DOCTYPE html>\n<html>\n<body>\n  <h2>Useful Resources</h2>\n  <p>Visit <a href=\"https://crackwithai.com\" target=\"_blank\">CrackWithAI</a> to learn AI.</p>\n</body>\n</html>",
        "practiceTask": {
          "title": "Create Navigation Links",
          "description": "Create two links pointing to external sites with descriptive anchor text.",
          "requirements": [
            "Include at least two <a> elements with valid href attributes",
            "Set target=\"_blank\" on at least one link"
          ],
          "starterCode": "<!DOCTYPE html>\n<html>\n<body>\n  <h2>Web Links</h2>\n  <p><a href=\"https://crackwithai.com\" target=\"_blank\">CrackWithAI Platform</a></p>\n  <p><a href=\"https://developer.mozilla.org\">MDN Web Docs</a></p>\n</body>\n</html>",
          "expectedOutput": "Two clickable links opening target pages.",
          "validationRules": [
            {
              "tag": "a",
              "minCount": 2,
              "message": "Include at least two <a> anchor tags"
            }
          ]
        }
      },
      {
        "_id": "lesson-2-2",
        "id": "lesson-2-2",
        "moduleId": "module-2",
        "moduleTitle": "Module 2 — HTML Elements",
        "courseId": "html-from-beginner-to-practical",
        "order": 9,
        "title": "Images",
        "slug": "images",
        "description": "Embed images with img, src, alt attributes, and responsive sizes.",
        "learningObjective": "Display images cleanly and write accessible alt descriptions.",
        "concept": "The <img> tag is an empty (void) element, meaning it does not have a closing tag. It requires two essential attributes: src (source URL of image) and alt (alternative text read by screen readers and shown if the image fails to load).",
        "codeExample": "<img src=\"https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=300\" alt=\"Laptop on desk\" width=\"300\" />",
        "expectedOutput": "A clean photographic image rendered on the page.",
        "starterCode": "<!DOCTYPE html>\n<html>\n<body>\n  <h2>Image Gallery</h2>\n  <img src=\"https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=300\" alt=\"Code on laptop screen\" width=\"300\" />\n</body>\n</html>",
        "practiceTask": {
          "title": "Display a Photograph with Caption",
          "description": "Add an <img> tag with a meaningful alt attribute and width.",
          "requirements": [
            "Include an <img> tag with src and alt attributes",
            "Include a <p> description below the image"
          ],
          "starterCode": "<!DOCTYPE html>\n<html>\n<body>\n  <h2>Coding Workspace</h2>\n  <img src=\"https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=300\" alt=\"Laptop and coffee on desk\" width=\"300\" />\n  <p>My daily programming setup.</p>\n</body>\n</html>",
          "expectedOutput": "An image with proper alternative text and descriptive paragraph.",
          "validationRules": [
            {
              "tag": "img",
              "minCount": 1,
              "message": "Include an <img> element"
            },
            {
              "tag": "p",
              "minCount": 1,
              "message": "Include a <p> element"
            }
          ]
        }
      },
      {
        "_id": "lesson-2-3",
        "id": "lesson-2-3",
        "moduleId": "module-2",
        "moduleTitle": "Module 2 — HTML Elements",
        "courseId": "html-from-beginner-to-practical",
        "order": 10,
        "title": "Lists",
        "slug": "lists",
        "description": "Organize items with bulleted unordered lists and numbered ordered lists.",
        "learningObjective": "Construct unordered <ul> and ordered <ol> lists with <li> list items.",
        "concept": "HTML provides two main types of lists: <ul> (unordered list) displays items with bullet points, while <ol> (ordered list) numbers items automatically (1, 2, 3). Each item inside must be wrapped in an <li> (list item) tag.",
        "codeExample": "<ul>\n  <li>HTML5</li>\n  <li>CSS3</li>\n  <li>JavaScript</li>\n</ul>",
        "expectedOutput": "A bulleted list of 3 web development technologies.",
        "starterCode": "<!DOCTYPE html>\n<html>\n<body>\n  <h2>Full Stack Roadmap</h2>\n  <h3>Core Languages (Unordered)</h3>\n  <ul>\n    <li>HTML</li>\n    <li>CSS</li>\n    <li>JavaScript</li>\n  </ul>\n</body>\n</html>",
        "practiceTask": {
          "title": "Build Unordered and Ordered Lists",
          "description": "Create a bulleted list of your favorite tools and a numbered list of daily steps.",
          "requirements": [
            "Create an unordered list <ul> with at least 3 <li> items",
            "Create an ordered list <ol> with at least 3 <li> items"
          ],
          "starterCode": "<!DOCTYPE html>\n<html>\n<body>\n  <h2>My Learning Plan</h2>\n  <h3>Technologies to Master</h3>\n  <ul>\n    <li>HTML5</li>\n    <li>CSS3</li>\n    <li>JavaScript</li>\n  </ul>\n  <h3>Daily Routine</h3>\n  <ol>\n    <li>Read Lesson</li>\n    <li>Practice Code</li>\n    <li>Build Project</li>\n  </ol>\n</body>\n</html>",
          "expectedOutput": "One bulleted list and one numbered list cleanly aligned.",
          "validationRules": [
            {
              "tag": "ul",
              "minCount": 1,
              "message": "Include at least one <ul> list"
            },
            {
              "tag": "ol",
              "minCount": 1,
              "message": "Include at least one <ol> list"
            },
            {
              "tag": "li",
              "minCount": 4,
              "message": "Include at least 4 <li> items in total"
            }
          ]
        }
      },
      {
        "_id": "lesson-2-4",
        "id": "lesson-2-4",
        "moduleId": "module-2",
        "moduleTitle": "Module 2 — HTML Elements",
        "courseId": "html-from-beginner-to-practical",
        "order": 11,
        "title": "Tables",
        "slug": "tables",
        "description": "Structure tabular data with table, tr, th, td, and borders.",
        "learningObjective": "Create structured data tables with rows, headers, and cells.",
        "concept": "HTML tables organize information into rows and columns: <table> is the container, <tr> defines a table row, <th> defines a bold centered header cell, and <td> defines standard data cells.",
        "codeExample": "<table border=\"1\">\n  <tr>\n    <th>Technology</th>\n    <th>Role</th>\n  </tr>\n  <tr>\n    <td>HTML</td>\n    <td>Structure</td>\n  </tr>\n</table>",
        "expectedOutput": "A bordered table with a header row and data rows.",
        "starterCode": "<!DOCTYPE html>\n<html>\n<body>\n  <h2>Full Stack Technologies</h2>\n  <table border=\"1\">\n    <tr>\n      <th>Tool</th>\n      <th>Type</th>\n      <th>Status</th>\n    </tr>\n    <tr>\n      <td>HTML</td>\n      <td>Frontend</td>\n      <td>Active</td>\n    </tr>\n  </table>\n</body>\n</html>",
        "practiceTask": {
          "title": "Create a Student Grades Table",
          "description": "Build a table displaying 3 subjects with columns for Subject, Score, and Grade.",
          "requirements": [
            "Include a <table> element",
            "Include at least one header row with <th> cells",
            "Include at least two data rows with <td> cells"
          ],
          "starterCode": "<!DOCTYPE html>\n<html>\n<body>\n  <h2>Student Report</h2>\n  <table border=\"1\">\n    <tr>\n      <th>Subject</th>\n      <th>Score</th>\n      <th>Grade</th>\n    </tr>\n    <tr>\n      <td>HTML Basics</td>\n      <td>95</td>\n      <td>A+</td>\n    </tr>\n    <tr>\n      <td>CSS Styling</td>\n      <td>90</td>\n      <td>A</td>\n    </tr>\n  </table>\n</body>\n</html>",
          "expectedOutput": "A formatted data table with 3 columns and multiple rows.",
          "validationRules": [
            {
              "tag": "table",
              "minCount": 1,
              "message": "Include a <table> element"
            },
            {
              "tag": "th",
              "minCount": 2,
              "message": "Include at least 2 <th> header cells"
            },
            {
              "tag": "td",
              "minCount": 4,
              "message": "Include at least 4 <td> data cells"
            }
          ]
        }
      },
      {
        "_id": "lesson-2-5",
        "id": "lesson-2-5",
        "moduleId": "module-2",
        "moduleTitle": "Module 2 — HTML Elements",
        "courseId": "html-from-beginner-to-practical",
        "order": 12,
        "title": "Div and Span",
        "slug": "div-and-span",
        "description": "Understand the difference between block-level (div) and inline (span) containers.",
        "learningObjective": "Use <div> for layout blocks and <span> for inline text segments.",
        "concept": "A <div> is a block-level element that always starts on a new line and takes up the full available width. A <span> is an inline element that only takes up as much width as its content and does not start on a new line.",
        "codeExample": "<div>\n  <p>This is inside a div container with <span style=\"color: purple;\">colored span</span> text.</p>\n</div>",
        "expectedOutput": "A block section containing inline highlighted text.",
        "starterCode": "<!DOCTYPE html>\n<html>\n<body>\n  <div>\n    <h2>Card Container</h2>\n    <p>Product: <span>Pro Membership</span></p>\n  </div>\n</body>\n</html>",
        "practiceTask": {
          "title": "Build a Card with Div and Span",
          "description": "Construct a profile card block using div as the container and span for special labels.",
          "requirements": [
            "Use at least one <div> container",
            "Use at least one <span> inline element"
          ],
          "starterCode": "<!DOCTYPE html>\n<html>\n<body>\n  <div>\n    <h2>Alex Mercer</h2>\n    <p>Role: <span>Full Stack Developer</span></p>\n    <p>Status: <span>Active</span></p>\n  </div>\n</body>\n</html>",
          "expectedOutput": "A structured profile card with inline role badges.",
          "validationRules": [
            {
              "tag": "div",
              "minCount": 1,
              "message": "Include at least one <div> element"
            },
            {
              "tag": "span",
              "minCount": 1,
              "message": "Include at least one <span> element"
            }
          ]
        }
      },
      {
        "_id": "lesson-2-6",
        "id": "lesson-2-6",
        "moduleId": "module-2",
        "moduleTitle": "Module 2 — HTML Elements",
        "courseId": "html-from-beginner-to-practical",
        "order": 13,
        "title": "Semantic HTML",
        "slug": "semantic-html",
        "description": "Write accessible modern code using header, nav, main, section, and footer.",
        "learningObjective": "Replace generic divs with semantic landmark tags for accessibility and SEO.",
        "concept": "Semantic HTML tags clearly describe their meaning to both the browser and developer: <header> for top branding/nav, <nav> for navigation links, <main> for core content, <section> for thematic groupings, <article> for standalone pieces, and <footer> for bottom credits.",
        "codeExample": "<header>\n  <h1>CrackWithAI</h1>\n  <nav><a href=\"#home\">Home</a></nav>\n</header>\n<main>\n  <section>\n    <h2>Welcome</h2>\n  </section>\n</main>\n<footer>\n  <p>&copy; 2026 CrackWithAI</p>\n</footer>",
        "expectedOutput": "A complete semantic webpage layout with header, nav, main, and footer.",
        "starterCode": "<!DOCTYPE html>\n<html>\n<body>\n  <header>\n    <h1>My Website</h1>\n    <nav>\n      <a href=\"#about\">About</a> | <a href=\"#contact\">Contact</a>\n    </nav>\n  </header>\n  <main>\n    <h2>Welcome</h2>\n    <p>This page uses semantic landmarks.</p>\n  </main>\n  <footer>\n    <p>&copy; 2026</p>\n  </footer>\n</body>\n</html>",
        "practiceTask": {
          "title": "Assemble a Semantic Layout",
          "description": "Build a webpage using header, nav, main, section, and footer elements.",
          "requirements": [
            "Include a <header> element with title",
            "Include a <nav> with at least one link",
            "Include a <main> container with a <section>",
            "Include a <footer> with copyright text"
          ],
          "starterCode": "<!DOCTYPE html>\n<html>\n<body>\n  <header>\n    <h1>CrackWithAI Academy</h1>\n    <nav><a href=\"#learn\">Learn HTML</a></nav>\n  </header>\n  <main>\n    <section>\n      <h2>Introduction</h2>\n      <p>Semantic tags make code readable and accessible.</p>\n    </section>\n  </main>\n  <footer>\n    <p>&copy; 2026 CrackWithAI. All rights reserved.</p>\n  </footer>\n</body>\n</html>",
          "expectedOutput": "A cleanly structured semantic document adhering to HTML5 best practices.",
          "validationRules": [
            {
              "tag": "header",
              "minCount": 1,
              "message": "Include a <header>"
            },
            {
              "tag": "nav",
              "minCount": 1,
              "message": "Include a <nav>"
            },
            {
              "tag": "main",
              "minCount": 1,
              "message": "Include a <main>"
            },
            {
              "tag": "footer",
              "minCount": 1,
              "message": "Include a <footer>"
            }
          ]
        }
      }
    ]
  },
  {
    "_id": "module-3",
    "id": "module-3",
    "title": "Module 3 — HTML Forms",
    "slug": "module-3-html-forms",
    "order": 3,
    "description": "Build interactive user input forms, labels, buttons, select menus, and validations.",
    "duration": 45,
    "lessons": [
      {
        "_id": "lesson-3-1",
        "id": "lesson-3-1",
        "moduleId": "module-3",
        "moduleTitle": "Module 3 — HTML Forms",
        "courseId": "html-from-beginner-to-practical",
        "order": 14,
        "title": "Forms",
        "slug": "forms",
        "description": "Understand the form element, action endpoints, and GET vs POST methods.",
        "learningObjective": "Learn how <form action=\"...\" method=\"...\"> submits data to backend servers.",
        "concept": "An HTML form is used to collect user inputs and send them to a server. The action attribute specifies the destination URL where submitted data will be sent, and the method attribute specifies the HTTP protocol method (usually \"POST\" for creating data or \"GET\" for search queries).",
        "codeExample": "<form action=\"/submit\" method=\"POST\">\n  <label>Your Name: <input type=\"text\" name=\"username\" /></label>\n  <button type=\"submit\">Send</button>\n</form>",
        "expectedOutput": "An interactive form with a text input field and a submit button.",
        "starterCode": "<!DOCTYPE html>\n<html>\n<body>\n  <h2>User Survey</h2>\n  <form action=\"/api/survey\" method=\"POST\">\n    <p>Please fill out this form:</p>\n    <input type=\"text\" name=\"feedback\" placeholder=\"Enter feedback\" />\n    <button type=\"submit\">Submit</button>\n  </form>\n</body>\n</html>",
        "practiceTask": {
          "title": "Build a Feedback Form Container",
          "description": "Construct a form element with method=\"POST\" containing a text input and submit button.",
          "requirements": [
            "Include a <form> element with action and method attributes",
            "Include an <input> element inside the form",
            "Include a <button type=\"submit\"> element"
          ],
          "starterCode": "<!DOCTYPE html>\n<html>\n<body>\n  <h2>Feedback Form</h2>\n  <form action=\"/submit-feedback\" method=\"POST\">\n    <input type=\"text\" name=\"message\" placeholder=\"Type your message\" />\n    <button type=\"submit\">Send Feedback</button>\n  </form>\n</body>\n</html>",
          "expectedOutput": "A working form container ready for submission.",
          "validationRules": [
            {
              "tag": "form",
              "minCount": 1,
              "message": "Include a <form> element"
            },
            {
              "tag": "input",
              "minCount": 1,
              "message": "Include at least one <input>"
            },
            {
              "tag": "button",
              "minCount": 1,
              "message": "Include a <button>"
            }
          ]
        }
      },
      {
        "_id": "lesson-3-2",
        "id": "lesson-3-2",
        "moduleId": "module-3",
        "moduleTitle": "Module 3 — HTML Forms",
        "courseId": "html-from-beginner-to-practical",
        "order": 15,
        "title": "Input Types",
        "slug": "input-types",
        "description": "Explore text, email, password, number, checkbox, radio, and date input fields.",
        "learningObjective": "Utilize specialized input types to capture validated user data.",
        "concept": "The <input> element changes its behavior based on the type attribute: type=\"text\" for standard text, type=\"email\" for email addresses, type=\"password\" to mask characters, type=\"number\" for numeric values, type=\"checkbox\" for toggle selections, and type=\"radio\" for single choices.",
        "codeExample": "<input type=\"text\" placeholder=\"Name\" />\n<input type=\"email\" placeholder=\"Email\" />\n<input type=\"password\" placeholder=\"Password\" />",
        "expectedOutput": "Three distinct input fields for text, email validation, and masked password dots.",
        "starterCode": "<!DOCTYPE html>\n<html>\n<body>\n  <h2>Input Types Showcase</h2>\n  <form>\n    <p>Text: <input type=\"text\" /></p>\n    <p>Email: <input type=\"email\" /></p>\n    <p>Password: <input type=\"password\" /></p>\n    <p>Number: <input type=\"number\" /></p>\n  </form>\n</body>\n</html>",
        "practiceTask": {
          "title": "Create Diverse Inputs",
          "description": "Build a form showcasing at least 4 distinct input types: text, email, password, and checkbox.",
          "requirements": [
            "Include input type=\"text\"",
            "Include input type=\"email\"",
            "Include input type=\"password\"",
            "Include input type=\"checkbox\""
          ],
          "starterCode": "<!DOCTYPE html>\n<html>\n<body>\n  <h2>Registration Inputs</h2>\n  <form>\n    <p><input type=\"text\" placeholder=\"Username\" /></p>\n    <p><input type=\"email\" placeholder=\"Email Address\" /></p>\n    <p><input type=\"password\" placeholder=\"Secure Password\" /></p>\n    <p><input type=\"checkbox\" /> Remember me</p>\n  </form>\n</body>\n</html>",
          "expectedOutput": "Four distinct input fields rendering appropriate mobile/desktop keyboards.",
          "validationRules": [
            {
              "tag": "input",
              "minCount": 4,
              "message": "Include at least 4 <input> elements"
            }
          ]
        }
      },
      {
        "_id": "lesson-3-3",
        "id": "lesson-3-3",
        "moduleId": "module-3",
        "moduleTitle": "Module 3 — HTML Forms",
        "courseId": "html-from-beginner-to-practical",
        "order": 16,
        "title": "Labels",
        "slug": "labels",
        "description": "Connect accessible labels to inputs using the for and id attributes.",
        "learningObjective": "Bind <label for=\"id\"> with <input id=\"id\"> for accessibility and touch targets.",
        "concept": "The <label> tag defines a caption for an input item. When you link a label to an input using the for attribute matching the input id, clicking the label automatically focuses or activates the input. This is vital for mobile usability and accessibility screen readers.",
        "codeExample": "<label for=\"user-email\">Email Address</label>\n<input type=\"email\" id=\"user-email\" />",
        "expectedOutput": "Clicking the label \"Email Address\" automatically focuses the input box.",
        "starterCode": "<!DOCTYPE html>\n<html>\n<body>\n  <h2>Accessible Inputs</h2>\n  <form>\n    <div>\n      <label for=\"full-name\">Full Name</label>\n      <input type=\"text\" id=\"full-name\" />\n    </div>\n  </form>\n</body>\n</html>",
        "practiceTask": {
          "title": "Connect Labels to Inputs",
          "description": "Create two inputs (name and email) with correctly matching label for and input id attributes.",
          "requirements": [
            "Include two <label> elements with for attributes",
            "Include two <input> elements with matching id attributes"
          ],
          "starterCode": "<!DOCTYPE html>\n<html>\n<body>\n  <h2>Sign In</h2>\n  <form>\n    <p>\n      <label for=\"login-email\">Email</label><br />\n      <input type=\"email\" id=\"login-email\" />\n    </p>\n    <p>\n      <label for=\"login-pass\">Password</label><br />\n      <input type=\"password\" id=\"login-pass\" />\n    </p>\n  </form>\n</body>\n</html>",
          "expectedOutput": "Accessible form where clicking labels focuses corresponding inputs.",
          "validationRules": [
            {
              "tag": "label",
              "minCount": 2,
              "message": "Include at least two <label> elements"
            },
            {
              "tag": "input",
              "minCount": 2,
              "message": "Include at least two <input> elements"
            }
          ]
        }
      },
      {
        "_id": "lesson-3-4",
        "id": "lesson-3-4",
        "moduleId": "module-3",
        "moduleTitle": "Module 3 — HTML Forms",
        "courseId": "html-from-beginner-to-practical",
        "order": 17,
        "title": "Buttons",
        "slug": "buttons",
        "description": "Create clickable action triggers with button type submit, reset, and button.",
        "learningObjective": "Use <button type=\"...\"> to trigger form submissions and actions.",
        "concept": "The <button> tag creates a clickable button: type=\"submit\" (default) sends form data, type=\"reset\" clears all inputs to initial values, and type=\"button\" creates a standard trigger for custom JavaScript actions.",
        "codeExample": "<button type=\"submit\">Submit Form</button>\n<button type=\"reset\">Clear Form</button>",
        "expectedOutput": "Two distinct clickable buttons for submitting and resetting.",
        "starterCode": "<!DOCTYPE html>\n<html>\n<body>\n  <form>\n    <input type=\"text\" placeholder=\"Type here\" />\n    <button type=\"submit\">Save</button>\n    <button type=\"reset\">Reset</button>\n  </form>\n</body>\n</html>",
        "practiceTask": {
          "title": "Form Action Buttons",
          "description": "Build a form with submit and reset buttons.",
          "requirements": [
            "Include a <button type=\"submit\">",
            "Include a <button type=\"reset\">"
          ],
          "starterCode": "<!DOCTYPE html>\n<html>\n<body>\n  <h2>Preferences</h2>\n  <form>\n    <p><input type=\"text\" placeholder=\"Favorite tech stack\" /></p>\n    <button type=\"submit\">Save Choice</button>\n    <button type=\"reset\">Start Over</button>\n  </form>\n</body>\n</html>",
          "expectedOutput": "Two functional buttons for saving and resetting the input field.",
          "validationRules": [
            {
              "tag": "button",
              "minCount": 2,
              "message": "Include at least two <button> elements"
            }
          ]
        }
      },
      {
        "_id": "lesson-3-5",
        "id": "lesson-3-5",
        "moduleId": "module-3",
        "moduleTitle": "Module 3 — HTML Forms",
        "courseId": "html-from-beginner-to-practical",
        "order": 18,
        "title": "Select and Textarea",
        "slug": "select-and-textarea",
        "description": "Build dropdown option menus with select and multi-line text areas.",
        "learningObjective": "Implement <select> with <option> tags and <textarea> for long-form comments.",
        "concept": "When users need to choose from a list, use <select> with nested <option> tags. When users need to type long multi-line text (like bio or message), use <textarea> with rows and cols attributes instead of single-line input.",
        "codeExample": "<select name=\"track\">\n  <option value=\"html\">HTML</option>\n  <option value=\"css\">CSS</option>\n</select>\n<textarea rows=\"4\" placeholder=\"Enter message\"></textarea>",
        "expectedOutput": "A dropdown menu with choices and a multi-line resizable text box.",
        "starterCode": "<!DOCTYPE html>\n<html>\n<body>\n  <h2>Application Form</h2>\n  <form>\n    <p>\n      <label for=\"role\">Choose Role:</label>\n      <select id=\"role\">\n        <option>Frontend</option>\n        <option>Backend</option>\n        <option>Full Stack</option>\n      </select>\n    </p>\n    <p>\n      <label for=\"bio\">Bio:</label><br />\n      <textarea id=\"bio\" rows=\"3\" placeholder=\"Tell us about yourself\"></textarea>\n    </p>\n  </form>\n</body>\n</html>",
        "practiceTask": {
          "title": "Build Dropdown and Message Area",
          "description": "Create a form containing a <select> with at least 3 options and a <textarea>.",
          "requirements": [
            "Include a <select> element with at least 3 <option> tags",
            "Include a <textarea> element"
          ],
          "starterCode": "<!DOCTYPE html>\n<html>\n<body>\n  <h2>Feedback Submission</h2>\n  <form>\n    <p>\n      <select name=\"category\">\n        <option>Feedback</option>\n        <option>Question</option>\n        <option>Bug Report</option>\n      </select>\n    </p>\n    <p>\n      <textarea rows=\"4\" cols=\"30\" placeholder=\"Type your detailed message here...\"></textarea>\n    </p>\n    <button type=\"submit\">Submit</button>\n  </form>\n</body>\n</html>",
          "expectedOutput": "An interactive dropdown menu and a multi-line message box.",
          "validationRules": [
            {
              "tag": "select",
              "minCount": 1,
              "message": "Include a <select> tag"
            },
            {
              "tag": "option",
              "minCount": 3,
              "message": "Include at least 3 <option> tags"
            },
            {
              "tag": "textarea",
              "minCount": 1,
              "message": "Include a <textarea> tag"
            }
          ]
        }
      },
      {
        "_id": "lesson-3-6",
        "id": "lesson-3-6",
        "moduleId": "module-3",
        "moduleTitle": "Module 3 — HTML Forms",
        "courseId": "html-from-beginner-to-practical",
        "order": 19,
        "title": "Form Structure and Basic Validation",
        "slug": "form-structure-and-basic-validation",
        "description": "Enforce required fields, minlength, maxlength, and input placeholders.",
        "learningObjective": "Use browser-native validation attributes like required, minlength, and placeholder.",
        "concept": "HTML5 allows you to validate forms before they reach the server. Adding required prevents submission if empty. minlength and maxlength enforce character limits. placeholder provides ghost text hints to the user.",
        "codeExample": "<input type=\"email\" placeholder=\"you@domain.com\" required />\n<input type=\"password\" minlength=\"8\" required />",
        "expectedOutput": "Inputs that trigger browser warning popups if submitted empty or too short.",
        "starterCode": "<!DOCTYPE html>\n<html>\n<body>\n  <h2>Validated Registration</h2>\n  <form>\n    <p><input type=\"text\" placeholder=\"Full Name\" required /></p>\n    <p><input type=\"email\" placeholder=\"Email Address\" required /></p>\n    <p><input type=\"password\" placeholder=\"Password (min 8 chars)\" minlength=\"8\" required /></p>\n    <button type=\"submit\">Register</button>\n  </form>\n</body>\n</html>",
        "practiceTask": {
          "title": "Implement Validated Inputs",
          "description": "Build a secure registration form with required and minlength constraints.",
          "requirements": [
            "Include an input with required attribute",
            "Include an input with minlength attribute",
            "Include a submit button"
          ],
          "starterCode": "<!DOCTYPE html>\n<html>\n<body>\n  <h2>Secure Sign Up</h2>\n  <form action=\"/signup\" method=\"POST\">\n    <p><input type=\"text\" placeholder=\"Username\" required /></p>\n    <p><input type=\"email\" placeholder=\"Email\" required /></p>\n    <p><input type=\"password\" placeholder=\"Password (8+ chars)\" minlength=\"8\" required /></p>\n    <button type=\"submit\">Create Account</button>\n  </form>\n</body>\n</html>",
          "expectedOutput": "A form that blocks empty submissions using built-in HTML5 validation.",
          "validationRules": [
            {
              "tag": "form",
              "minCount": 1,
              "message": "Include a <form>"
            },
            {
              "tag": "input",
              "minCount": 2,
              "message": "Include at least two <input> fields"
            },
            {
              "tag": "button",
              "minCount": 1,
              "message": "Include a <button>"
            }
          ]
        }
      }
    ]
  },
  {
    "_id": "module-4",
    "id": "module-4",
    "title": "Module 4 — Practical HTML",
    "slug": "module-4-practical-html",
    "order": 4,
    "description": "Build complete real-world webpages: profiles, forms, auth pages, and your portfolio.",
    "duration": 40,
    "lessons": [
      {
        "_id": "lesson-4-1",
        "id": "lesson-4-1",
        "moduleId": "module-4",
        "moduleTitle": "Module 4 — Practical HTML",
        "courseId": "html-from-beginner-to-practical",
        "order": 20,
        "title": "Build a Profile Page",
        "slug": "build-a-profile-page",
        "description": "Construct a personal developer profile with image, bio, skills, and links.",
        "learningObjective": "Combine headings, images, lists, and links into a complete developer profile card.",
        "concept": "In this practical lesson, you will assemble everything you have learned into a real profile webpage: an avatar photo, your title, a short biography paragraph, a bulleted list of skills, and social links.",
        "codeExample": "<div class=\"profile\">\n  <img src=\"https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150\" alt=\"Avatar\" width=\"120\" />\n  <h1>Prakash</h1>\n  <p>Full Stack Engineer</p>\n  <h3>Skills:</h3>\n  <ul><li>HTML5</li><li>Git</li></ul>\n</div>",
        "expectedOutput": "A clean developer profile card with photo, bio, skills list, and links.",
        "starterCode": "<!DOCTYPE html>\n<html lang=\"en\">\n<head>\n  <meta charset=\"UTF-8\">\n  <title>Developer Profile</title>\n</head>\n<body>\n  <header>\n    <h1>My Developer Profile</h1>\n  </header>\n  <main>\n    <img src=\"https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150\" alt=\"Profile avatar\" width=\"120\" />\n    <h2>Prakash</h2>\n    <p>Passionate learner mastering Full Stack Development on CrackWithAI.</p>\n    <h3>Core Skills</h3>\n    <ul>\n      <li>HTML5 Markup</li>\n      <li>Webpage Structure</li>\n      <li>Semantic Layouts</li>\n    </ul>\n    <p><a href=\"https://github.com\" target=\"_blank\">View GitHub</a></p>\n  </main>\n</body>\n</html>",
        "practiceTask": {
          "title": "Your Personal Profile Webpage",
          "description": "Build your personal developer profile with photo, bio, skill list, and GitHub link.",
          "requirements": [
            "Include an <h1> profile heading",
            "Include an <img> with alt attribute",
            "Include a <ul> skills list with at least 3 items",
            "Include at least one <a> link"
          ],
          "starterCode": "<!DOCTYPE html>\n<html>\n<body>\n  <h1>Alex - Full Stack Trainee</h1>\n  <img src=\"https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150\" alt=\"Alex avatar\" width=\"120\" />\n  <p>Building real web applications step by step.</p>\n  <h3>Skills</h3>\n  <ul>\n    <li>HTML5</li>\n    <li>Web Forms</li>\n    <li>Semantic HTML</li>\n  </ul>\n  <p><a href=\"https://github.com\">My Projects</a></p>\n</body>\n</html>",
          "expectedOutput": "A complete personal developer profile page.",
          "validationRules": [
            {
              "tag": "h1",
              "minCount": 1,
              "message": "Include an <h1>"
            },
            {
              "tag": "img",
              "minCount": 1,
              "message": "Include an <img>"
            },
            {
              "tag": "ul",
              "minCount": 1,
              "message": "Include a <ul>"
            },
            {
              "tag": "li",
              "minCount": 3,
              "message": "Include at least 3 <li> skills"
            },
            {
              "tag": "a",
              "minCount": 1,
              "message": "Include an <a> link"
            }
          ]
        }
      },
      {
        "_id": "lesson-4-2",
        "id": "lesson-4-2",
        "moduleId": "module-4",
        "moduleTitle": "Module 4 — Practical HTML",
        "courseId": "html-from-beginner-to-practical",
        "order": 21,
        "title": "Build a Contact Form",
        "slug": "build-a-contact-form",
        "description": "Assemble a professional contact inquiry form with name, email, subject, and message.",
        "learningObjective": "Construct a contact page with inputs, labels, textarea, and submit button.",
        "concept": "Contact forms are found on almost every website. You need labels paired with inputs for user name, user email, inquiry subject dropdown or text, and a multi-line textarea for the message.",
        "codeExample": "<form action=\"/contact\" method=\"POST\">\n  <label for=\"name\">Name:</label><input id=\"name\" required />\n  <label for=\"msg\">Message:</label><textarea id=\"msg\" required></textarea>\n  <button type=\"submit\">Send</button>\n</form>",
        "expectedOutput": "A clean contact section with all fields and send button.",
        "starterCode": "<!DOCTYPE html>\n<html lang=\"en\">\n<head>\n  <meta charset=\"UTF-8\">\n  <title>Contact Us</title>\n</head>\n<body>\n  <h1>Get In Touch</h1>\n  <p>We would love to hear from you. Send us a message below.</p>\n  <form action=\"/api/contact\" method=\"POST\">\n    <p>\n      <label for=\"contact-name\">Full Name:</label><br />\n      <input type=\"text\" id=\"contact-name\" placeholder=\"John Doe\" required />\n    </p>\n    <p>\n      <label for=\"contact-email\">Email Address:</label><br />\n      <input type=\"email\" id=\"contact-email\" placeholder=\"john@example.com\" required />\n    </p>\n    <p>\n      <label for=\"contact-msg\">Your Message:</label><br />\n      <textarea id=\"contact-msg\" rows=\"4\" placeholder=\"How can we help you?\" required></textarea>\n    </p>\n    <button type=\"submit\">Send Inquiry</button>\n  </form>\n</body>\n</html>",
        "practiceTask": {
          "title": "Complete Contact Form",
          "description": "Build a contact form with name, email, message textarea, and submit button.",
          "requirements": [
            "Include <form action=\"...\" method=\"POST\">",
            "Include inputs for name and email with matching labels",
            "Include a <textarea> for the message",
            "Include a <button type=\"submit\">"
          ],
          "starterCode": "<!DOCTYPE html>\n<html>\n<body>\n  <h2>Contact Support</h2>\n  <form action=\"/contact\" method=\"POST\">\n    <p>\n      <label for=\"cname\">Name:</label><br />\n      <input type=\"text\" id=\"cname\" required />\n    </p>\n    <p>\n      <label for=\"cemail\">Email:</label><br />\n      <input type=\"email\" id=\"cemail\" required />\n    </p>\n    <p>\n      <label for=\"cmessage\">Message:</label><br />\n      <textarea id=\"cmessage\" rows=\"4\" required></textarea>\n    </p>\n    <button type=\"submit\">Submit Message</button>\n  </form>\n</body>\n</html>",
          "expectedOutput": "A functional contact form with proper validation.",
          "validationRules": [
            {
              "tag": "form",
              "minCount": 1,
              "message": "Include a <form>"
            },
            {
              "tag": "label",
              "minCount": 2,
              "message": "Include at least 2 <label> elements"
            },
            {
              "tag": "input",
              "minCount": 2,
              "message": "Include at least 2 <input> elements"
            },
            {
              "tag": "textarea",
              "minCount": 1,
              "message": "Include a <textarea>"
            },
            {
              "tag": "button",
              "minCount": 1,
              "message": "Include a <button>"
            }
          ]
        }
      },
      {
        "_id": "lesson-4-3",
        "id": "lesson-4-3",
        "moduleId": "module-4",
        "moduleTitle": "Module 4 — Practical HTML",
        "courseId": "html-from-beginner-to-practical",
        "order": 22,
        "title": "Build a Login Page",
        "slug": "build-a-login-page",
        "description": "Construct an authentic authentication login page with email, password, and remember me.",
        "learningObjective": "Implement a login screen form with email validation, password mask, and submit trigger.",
        "concept": "Login pages require clear input constraints: an email input with type=\"email\" to ensure proper address format, a password input with type=\"password\" to mask characters, an optional remember checkbox, and a prominent submit button.",
        "codeExample": "<form action=\"/login\" method=\"POST\">\n  <h1>Login</h1>\n  <label for=\"email\">Email</label>\n  <input type=\"email\" id=\"email\" required />\n  <label for=\"pass\">Password</label>\n  <input type=\"password\" id=\"pass\" required />\n  <button type=\"submit\">Sign In</button>\n</form>",
        "expectedOutput": "A complete login form layout ready for backend authentication.",
        "starterCode": "<!DOCTYPE html>\n<html lang=\"en\">\n<head>\n  <meta charset=\"UTF-8\">\n  <title>Login to CrackWithAI</title>\n</head>\n<body>\n  <main>\n    <h1>Welcome Back</h1>\n    <p>Sign in to continue your full stack learning journey.</p>\n    <form action=\"/api/auth/login\" method=\"POST\">\n      <p>\n        <label for=\"login-email\">Email Address</label><br />\n        <input type=\"email\" id=\"login-email\" placeholder=\"you@domain.com\" required />\n      </p>\n      <p>\n        <label for=\"login-password\">Password</label><br />\n        <input type=\"password\" id=\"login-password\" placeholder=\"Enter password\" required />\n      </p>\n      <p>\n        <label>\n          <input type=\"checkbox\" name=\"remember\" /> Remember me\n        </label>\n      </p>\n      <button type=\"submit\">Sign In</button>\n    </form>\n  </main>\n</body>\n</html>",
        "practiceTask": {
          "title": "Build a Clean Login Interface",
          "description": "Construct a login form containing title, email input, password input, remember checkbox, and login button.",
          "requirements": [
            "Include <h1> heading",
            "Include an email input with label",
            "Include a password input with label",
            "Include a submit button"
          ],
          "starterCode": "<!DOCTYPE html>\n<html>\n<body>\n  <h1>Account Login</h1>\n  <form action=\"/login\" method=\"POST\">\n    <p>\n      <label for=\"user-mail\">Email</label><br />\n      <input type=\"email\" id=\"user-mail\" required />\n    </p>\n    <p>\n      <label for=\"user-pass\">Password</label><br />\n      <input type=\"password\" id=\"user-pass\" required />\n    </p>\n    <button type=\"submit\">Log In</button>\n  </form>\n</body>\n</html>",
          "expectedOutput": "A clean login interface with validated inputs.",
          "validationRules": [
            {
              "tag": "h1",
              "minCount": 1,
              "message": "Include an <h1> heading"
            },
            {
              "tag": "form",
              "minCount": 1,
              "message": "Include a <form>"
            },
            {
              "tag": "input",
              "minCount": 2,
              "message": "Include email and password inputs"
            },
            {
              "tag": "button",
              "minCount": 1,
              "message": "Include a <button>"
            }
          ]
        }
      },
      {
        "_id": "lesson-4-4",
        "id": "lesson-4-4",
        "moduleId": "module-4",
        "moduleTitle": "Module 4 — Practical HTML",
        "courseId": "html-from-beginner-to-practical",
        "order": 23,
        "title": "Build a Registration Form",
        "slug": "build-a-registration-form",
        "description": "Create a new user signup form with name, email, password, confirm, and terms.",
        "learningObjective": "Implement full signup form with minlength password checks and terms agreement checkbox.",
        "concept": "Registration forms gather credentials for new accounts. Crucial elements include full name, email, password with minlength=\"8\", and a required checkbox agreeing to terms and conditions.",
        "codeExample": "<form action=\"/register\" method=\"POST\">\n  <input type=\"text\" placeholder=\"Name\" required />\n  <input type=\"email\" placeholder=\"Email\" required />\n  <input type=\"password\" minlength=\"8\" placeholder=\"Password\" required />\n  <label><input type=\"checkbox\" required /> Agree to Terms</label>\n  <button type=\"submit\">Register</button>\n</form>",
        "expectedOutput": "A complete registration card with inputs and agreement checkbox.",
        "starterCode": "<!DOCTYPE html>\n<html lang=\"en\">\n<head>\n  <meta charset=\"UTF-8\">\n  <title>Register Account</title>\n</head>\n<body>\n  <h1>Create Your Account</h1>\n  <form action=\"/api/auth/register\" method=\"POST\">\n    <p>\n      <label for=\"reg-name\">Full Name</label><br />\n      <input type=\"text\" id=\"reg-name\" placeholder=\"John Doe\" required />\n    </p>\n    <p>\n      <label for=\"reg-email\">Email Address</label><br />\n      <input type=\"email\" id=\"reg-email\" placeholder=\"john@example.com\" required />\n    </p>\n    <p>\n      <label for=\"reg-pass\">Password</label><br />\n      <input type=\"password\" id=\"reg-pass\" minlength=\"8\" required />\n    </p>\n    <p>\n      <label>\n        <input type=\"checkbox\" required /> I accept the Terms of Service\n      </label>\n    </p>\n    <button type=\"submit\">Create Account</button>\n  </form>\n</body>\n</html>",
        "practiceTask": {
          "title": "Complete Registration Form",
          "description": "Build a signup form with name, email, password, terms checkbox, and register button.",
          "requirements": [
            "Include text, email, password, and checkbox inputs",
            "Include at least one input with required and minlength=\"8\"",
            "Include a submit button"
          ],
          "starterCode": "<!DOCTYPE html>\n<html>\n<body>\n  <h2>Sign Up Today</h2>\n  <form action=\"/register\" method=\"POST\">\n    <p><input type=\"text\" placeholder=\"Your Name\" required /></p>\n    <p><input type=\"email\" placeholder=\"Email Address\" required /></p>\n    <p><input type=\"password\" placeholder=\"Password (8+ chars)\" minlength=\"8\" required /></p>\n    <p><label><input type=\"checkbox\" required /> I agree to the terms</label></p>\n    <button type=\"submit\">Register Now</button>\n  </form>\n</body>\n</html>",
          "expectedOutput": "A registration form enforcing browser-level validation.",
          "validationRules": [
            {
              "tag": "form",
              "minCount": 1,
              "message": "Include a <form>"
            },
            {
              "tag": "input",
              "minCount": 4,
              "message": "Include at least 4 <input> elements"
            },
            {
              "tag": "button",
              "minCount": 1,
              "message": "Include a <button>"
            }
          ]
        }
      },
      {
        "_id": "lesson-4-5",
        "id": "lesson-4-5",
        "moduleId": "module-4",
        "moduleTitle": "Module 4 — Practical HTML",
        "courseId": "html-from-beginner-to-practical",
        "order": 24,
        "title": "HTML Mini Project",
        "slug": "html-mini-project",
        "description": "Build a multi-section Personal Portfolio Landing Page combining all HTML skills.",
        "learningObjective": "Synthesize semantic containers, headings, lists, tables, media, and forms into a cohesive site.",
        "concept": "In this mini project, you will build a complete personal landing page for a web developer. It features a header navigation, about me hero section with photo, a skills list, a project experience table, and a contact section.",
        "codeExample": "<header><nav>...</nav></header><main><section>...</section><section><table>...</table></section></main><footer>...</footer>",
        "expectedOutput": "A comprehensive multi-section web portfolio document.",
        "starterCode": "<!DOCTYPE html>\n<html lang=\"en\">\n<head>\n  <meta charset=\"UTF-8\">\n  <title>Prakash - Full Stack Portfolio</title>\n</head>\n<body>\n  <header>\n    <h1>Prakash</h1>\n    <p>Full Stack Developer in Training</p>\n    <nav>\n      <a href=\"#about\">About</a> | <a href=\"#skills\">Skills</a> | <a href=\"#projects\">Projects</a> | <a href=\"#contact\">Contact</a>\n    </nav>\n  </header>\n\n  <main>\n    <section id=\"about\">\n      <h2>About Me</h2>\n      <img src=\"https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150\" alt=\"Avatar\" width=\"120\" />\n      <p>I build clean, modern web applications using full stack technologies.</p>\n    </section>\n\n    <section id=\"skills\">\n      <h2>Core Skills</h2>\n      <ul>\n        <li>HTML5 Semantics</li>\n        <li>Form Architecture</li>\n        <li>Responsive Layouts</li>\n      </ul>\n    </section>\n\n    <section id=\"projects\">\n      <h2>Projects</h2>\n      <table border=\"1\">\n        <tr><th>Project</th><th>Role</th><th>Status</th></tr>\n        <tr><td>Portfolio</td><td>Developer</td><td>Completed</td></tr>\n        <tr><td>HTML Playground</td><td>Engineer</td><td>Live</td></tr>\n      </table>\n    </section>\n\n    <section id=\"contact\">\n      <h2>Contact Me</h2>\n      <form action=\"/contact\" method=\"POST\">\n        <p><input type=\"text\" placeholder=\"Your Name\" required /></p>\n        <p><input type=\"email\" placeholder=\"Your Email\" required /></p>\n        <p><textarea placeholder=\"Your Message\" rows=\"3\" required></textarea></p>\n        <button type=\"submit\">Send Message</button>\n      </form>\n    </section>\n  </main>\n\n  <footer>\n    <p>&copy; 2026 Prakash. Built with CrackWithAI.</p>\n  </footer>\n</body>\n</html>",
        "practiceTask": {
          "title": "Your Complete Landing Page",
          "description": "Construct a full multi-section portfolio containing header, nav, image, skills list, project table, and contact form.",
          "requirements": [
            "Use semantic tags: <header>, <nav>, <main>, <section>, <footer>",
            "Include an <img> with alt attribute",
            "Include a <ul> list and a <table>",
            "Include a <form> with input, textarea, and submit button"
          ],
          "starterCode": "<!DOCTYPE html>\n<html>\n<head><title>My Portfolio</title></head>\n<body>\n  <header>\n    <h1>My Tech Portfolio</h1>\n    <nav><a href=\"#contact\">Contact</a></nav>\n  </header>\n  <main>\n    <section>\n      <h2>About Me</h2>\n      <p>I am learning Full Stack web development.</p>\n      <ul><li>HTML5</li><li>Web Design</li></ul>\n    </section>\n    <section>\n      <h2>Contact</h2>\n      <form>\n        <input type=\"text\" placeholder=\"Name\" />\n        <button type=\"submit\">Submit</button>\n      </form>\n    </section>\n  </main>\n  <footer><p>&copy; 2026</p></footer>\n</body>\n</html>",
          "expectedOutput": "A professional, multi-section web portfolio document.",
          "validationRules": [
            {
              "tag": "header",
              "minCount": 1,
              "message": "Include a <header>"
            },
            {
              "tag": "main",
              "minCount": 1,
              "message": "Include a <main>"
            },
            {
              "tag": "section",
              "minCount": 2,
              "message": "Include at least 2 <section> elements"
            },
            {
              "tag": "footer",
              "minCount": 1,
              "message": "Include a <footer>"
            },
            {
              "tag": "form",
              "minCount": 1,
              "message": "Include a <form>"
            }
          ]
        }
      },
      {
        "_id": "lesson-4-6",
        "id": "lesson-4-6",
        "moduleId": "module-4",
        "moduleTitle": "Module 4 — Practical HTML",
        "courseId": "html-from-beginner-to-practical",
        "order": 25,
        "title": "HTML Assessment & Final Project",
        "slug": "html-assessment-and-final-project",
        "description": "Comprehensive milestone evaluation demonstrating complete mastery of HTML.",
        "learningObjective": "Complete the HTML certification project meeting all structural and accessibility standards.",
        "concept": "Congratulations on reaching the final milestone of the HTML Course! To pass this assessment, you will write a complete, error-free HTML5 webpage featuring semantic layout, headings, media, tables, lists, and an interactive validated form.",
        "codeExample": "<!DOCTYPE html>\n<html lang=\"en\">\n<head>\n  <meta charset=\"UTF-8\">\n  <title>HTML Certification</title>\n</head>\n<body>\n  <!-- Full Document Implementation -->\n</body>\n</html>",
        "expectedOutput": "A flawless, fully validated HTML5 document earning the HTML Course Certificate.",
        "starterCode": "<!DOCTYPE html>\n<html lang=\"en\">\n<head>\n  <meta charset=\"UTF-8\">\n  <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">\n  <title>CrackWithAI — HTML Certification</title>\n</head>\n<body>\n  <header>\n    <h1>Full Stack Development — HTML Certification</h1>\n    <nav>\n      <a href=\"#overview\">Overview</a> | <a href=\"#curriculum\">Curriculum</a> | <a href=\"#enroll\">Enroll</a>\n    </nav>\n  </header>\n\n  <main>\n    <section id=\"overview\">\n      <h2>Course Milestone Completed</h2>\n      <p>I have mastered HTML document structures, elements, tables, and forms.</p>\n      <img src=\"https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=300\" alt=\"Full Stack Coding\" width=\"300\" />\n    </section>\n\n    <section id=\"curriculum\">\n      <h2>Topics Mastered</h2>\n      <ul>\n        <li>HTML5 Doctype & Architecture</li>\n        <li>Headings, Paragraphs & Text Formatting</li>\n        <li>Links, Images, Lists & Tables</li>\n        <li>Interactive Forms & Input Validation</li>\n        <li>Semantic Web Landmarks</li>\n      </ul>\n    </section>\n\n    <section id=\"enroll\">\n      <h2>Certification Sign-off</h2>\n      <form action=\"/api/certify\" method=\"POST\">\n        <p>\n          <label for=\"learner-name\">Student Full Name:</label><br />\n          <input type=\"text\" id=\"learner-name\" placeholder=\"Enter your name\" required />\n        </p>\n        <p>\n          <label for=\"learner-email\">Email:</label><br />\n          <input type=\"email\" id=\"learner-email\" placeholder=\"Enter your email\" required />\n        </p>\n        <button type=\"submit\">Claim HTML Certificate</button>\n      </form>\n    </section>\n  </main>\n\n  <footer>\n    <p>&copy; 2026 CrackWithAI. Certified Full Stack Developer.</p>\n  </footer>\n</body>\n</html>",
        "practiceTask": {
          "title": "Final HTML Certification Challenge",
          "description": "Build a complete, flawless webpage with semantic tags, heading hierarchy, image, list, and interactive form.",
          "requirements": [
            "Valid <!DOCTYPE html> and <html lang=\"en\">",
            "Semantic <header>, <nav>, <main>, <section>, and <footer> tags",
            "At least one <h1> and two <h2> headings",
            "An <img> element with valid alt attribute",
            "A <ul> list with at least 3 <li> items",
            "A validated <form> with label, input, and submit button"
          ],
          "starterCode": "<!DOCTYPE html>\n<html lang=\"en\">\n<head>\n  <meta charset=\"UTF-8\">\n  <title>HTML Final Project</title>\n</head>\n<body>\n  <header>\n    <h1>HTML Master Project</h1>\n    <nav><a href=\"#home\">Home</a></nav>\n  </header>\n  <main>\n    <section>\n      <h2>Overview</h2>\n      <p>Full stack web development foundation complete.</p>\n      <img src=\"https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=300\" alt=\"Code laptop\" width=\"280\" />\n      <ul>\n        <li>Semantic tags</li>\n        <li>Forms & Inputs</li>\n        <li>Clean Structure</li>\n      </ul>\n    </section>\n    <section>\n      <h2>Verification</h2>\n      <form>\n        <label for=\"sname\">Name</label><br />\n        <input type=\"text\" id=\"sname\" required />\n        <button type=\"submit\">Verify</button>\n      </form>\n    </section>\n  </main>\n  <footer>\n    <p>&copy; 2026 CrackWithAI</p>\n  </footer>\n</body>\n</html>",
          "expectedOutput": "A comprehensive, valid HTML5 capstone project.",
          "validationRules": [
            {
              "tag": "header",
              "minCount": 1,
              "message": "Include a <header>"
            },
            {
              "tag": "main",
              "minCount": 1,
              "message": "Include a <main>"
            },
            {
              "tag": "section",
              "minCount": 2,
              "message": "Include at least 2 <section> tags"
            },
            {
              "tag": "h1",
              "minCount": 1,
              "message": "Include an <h1>"
            },
            {
              "tag": "img",
              "minCount": 1,
              "message": "Include an <img>"
            },
            {
              "tag": "ul",
              "minCount": 1,
              "message": "Include a <ul>"
            },
            {
              "tag": "form",
              "minCount": 1,
              "message": "Include a <form>"
            },
            {
              "tag": "footer",
              "minCount": 1,
              "message": "Include a <footer>"
            }
          ]
        }
      }
    ]
  }
];

export const FALLBACK_HTML_COURSE: HtmlCourse = {
  "_id": "html-from-beginner-to-practical",
  "id": "html-from-beginner-to-practical",
  "title": "HTML — From Beginner to Practical",
  "slug": "html-from-beginner-to-practical",
  "description": "Learn HTML step by step and build real webpages using CrackWithAI's own HTML Playground.",
  "shortDescription": "Master HTML markup, forms, semantic tags, and practical web layouts.",
  "category": "Full Stack",
  "level": "beginner",
  "difficulty": "beginner",
  "duration": 180,
  "totalLessonMinutes": 180,
  "totalPracticeMinutes": 120,
  "totalEstimatedMinutes": 300,
  "recommendedMinutesPerDay": 30,
  "durationDays": 10,
  "isFree": true,
  "status": "published",
  "tags": [
    "HTML",
    "Web Development",
    "Full Stack",
    "Frontend",
    "Coding"
  ],
  "learningOutcomes": [
    "Understand fundamental HTML architecture, tags, and document structure",
    "Structure text with headings, paragraphs, lists, and formatting elements",
    "Embed media, links, tables, and organize with semantic containers",
    "Build production-ready user input forms with inputs, labels, and validation",
    "Create complete practical web pages inside the HTML Playground"
  ],
  "modules": [
    {
      "_id": "module-1",
      "id": "module-1",
      "title": "Module 1 — HTML Basics",
      "slug": "module-1-html-basics",
      "order": 1,
      "description": "Learn fundamental web page architecture, doctypes, and core text elements.",
      "duration": 45,
      "lessons": [
        {
          "_id": "lesson-1-1",
          "id": "lesson-1-1",
          "moduleId": "module-1",
          "moduleTitle": "Module 1 — HTML Basics",
          "courseId": "html-from-beginner-to-practical",
          "order": 1,
          "title": "Introduction to HTML",
          "slug": "introduction-to-html",
          "description": "Understand what the web is built with and start your full stack journey.",
          "learningObjective": "Learn what HTML stands for, how browsers read HTML, and why it is the backbone of the web.",
          "concept": "HTML stands for HyperText Markup Language. It is the universal language used to create the structure of webpages. Every website you visit—from Google to Instagram—uses HTML to tell the browser what content to display on the screen.",
          "codeExample": "<h1>Hello, Full Stack World!</h1>\n<p>Welcome to CrackWithAI HTML Course.</p>",
          "expectedOutput": "A large bold heading saying \"Hello, Full Stack World!\" followed by a regular paragraph.",
          "starterCode": "<!DOCTYPE html>\n<html>\n<head>\n  <title>My First HTML Page</title>\n</head>\n<body>\n  <!-- Write your first HTML heading and paragraph here -->\n  <h1>Welcome to HTML</h1>\n  <p>I am learning Full Stack development on CrackWithAI.</p>\n</body>\n</html>",
          "practiceTask": {
            "title": "Your First Webpage",
            "description": "Create a simple webpage with a personalized heading and an introductory sentence about yourself.",
            "requirements": [
              "Add an <h1> heading with your name or website title",
              "Add at least one <p> paragraph describing your goal"
            ],
            "starterCode": "<!DOCTYPE html>\n<html>\n<head>\n  <title>About Me</title>\n</head>\n<body>\n  <h1>Full Stack Developer</h1>\n  <p>I am learning HTML on CrackWithAI!</p>\n</body>\n</html>",
            "expectedOutput": "A page displaying your top heading and a descriptive paragraph.",
            "validationRules": [
              {
                "tag": "h1",
                "minCount": 1,
                "message": "Include at least one <h1> element"
              },
              {
                "tag": "p",
                "minCount": 1,
                "message": "Include at least one <p> element"
              }
            ]
          }
        },
        {
          "_id": "lesson-1-2",
          "id": "lesson-1-2",
          "moduleId": "module-1",
          "moduleTitle": "Module 1 — HTML Basics",
          "courseId": "html-from-beginner-to-practical",
          "order": 2,
          "title": "What is HTML?",
          "slug": "what-is-html",
          "description": "Understand tags, opening tags, closing tags, and element anatomy.",
          "learningObjective": "Deconstruct an HTML element into opening tag, content, and closing tag.",
          "concept": "An HTML element usually consists of an opening tag (like <p>), the inner content, and a closing tag (like </p>). The forward slash \"/\" in the closing tag signals to the browser that this element ends here.",
          "codeExample": "<p>This is an opening tag, content, and closing tag.</p>",
          "expectedOutput": "A clean single paragraph of text.",
          "starterCode": "<!DOCTYPE html>\n<html>\n<body>\n  <h2>Understanding HTML Elements</h2>\n  <p>Every element has an opening tag, content, and closing tag.</p>\n</body>\n</html>",
          "practiceTask": {
            "title": "Tag Anatomy Practice",
            "description": "Write two paragraphs explaining what HTML tags and closing tags do.",
            "requirements": [
              "Include an <h2> heading",
              "Include two separate <p> paragraph elements with proper closing tags"
            ],
            "starterCode": "<!DOCTYPE html>\n<html>\n<body>\n  <h2>HTML Anatomy</h2>\n  <p>Paragraph 1: An opening tag starts an element.</p>\n  <p>Paragraph 2: A closing tag ends the element.</p>\n</body>\n</html>",
            "expectedOutput": "An <h2> heading followed by two distinct paragraphs.",
            "validationRules": [
              {
                "tag": "h2",
                "minCount": 1,
                "message": "Include an <h2> heading"
              },
              {
                "tag": "p",
                "minCount": 2,
                "message": "Include at least 2 <p> elements"
              }
            ]
          }
        },
        {
          "_id": "lesson-1-3",
          "id": "lesson-1-3",
          "moduleId": "module-1",
          "moduleTitle": "Module 1 — HTML Basics",
          "courseId": "html-from-beginner-to-practical",
          "order": 3,
          "title": "HTML Document Structure",
          "slug": "html-document-structure",
          "description": "Explore the full anatomy of a complete HTML5 document tree.",
          "learningObjective": "Master the root <html>, <head>, and <body> hierarchy in every webpage.",
          "concept": "Every standard HTML webpage is structured as a tree. The <html> tag is the root container. Inside it, <head> holds metadata (title, character encoding, viewport) and <body> contains everything the user sees on the screen.",
          "codeExample": "<!DOCTYPE html>\n<html>\n<head>\n  <title>Page Title</title>\n</head>\n<body>\n  <h1>Visible Content</h1>\n</body>\n</html>",
          "expectedOutput": "A properly structured page with title in the browser tab and heading on screen.",
          "starterCode": "<!DOCTYPE html>\n<html lang=\"en\">\n<head>\n  <meta charset=\"UTF-8\">\n  <title>My Document</title>\n</head>\n<body>\n  <h1>Document Tree</h1>\n  <p>Head holds metadata, body holds content.</p>\n</body>\n</html>",
          "practiceTask": {
            "title": "Assemble Complete Structure",
            "description": "Construct a full HTML document skeleton with proper html, head, title, and body tags.",
            "requirements": [
              "Include <!DOCTYPE html> declaration",
              "Include <html>, <head>, <title>, and <body> tags",
              "Add an <h1> heading and a <p> inside <body>"
            ],
            "starterCode": "<!DOCTYPE html>\n<html lang=\"en\">\n<head>\n  <meta charset=\"UTF-8\">\n  <title>My Structured Webpage</title>\n</head>\n<body>\n  <h1>Full Structure Complete</h1>\n  <p>This document has head metadata and visible body content.</p>\n</body>\n</html>",
            "expectedOutput": "A fully compliant HTML5 document with title and body elements.",
            "validationRules": [
              {
                "tag": "head",
                "minCount": 1,
                "message": "Must include <head>"
              },
              {
                "tag": "body",
                "minCount": 1,
                "message": "Must include <body>"
              },
              {
                "tag": "h1",
                "minCount": 1,
                "message": "Must include <h1> inside body"
              }
            ]
          }
        },
        {
          "_id": "lesson-1-4",
          "id": "lesson-1-4",
          "moduleId": "module-1",
          "moduleTitle": "Module 1 — HTML Basics",
          "courseId": "html-from-beginner-to-practical",
          "order": 4,
          "title": "DOCTYPE, html, head, body",
          "slug": "doctype-html-head-body",
          "description": "Understand the purpose of DOCTYPE declarations and essential head tags.",
          "learningObjective": "Learn why <!DOCTYPE html> is needed and how meta tags control viewport and responsiveness.",
          "concept": "<!DOCTYPE html> is not an HTML tag; it is an instruction to the web browser about what version of HTML the page is written in. In modern web development, <!DOCTYPE html> tells browsers to render in standard HTML5 mode without quirk mode.",
          "codeExample": "<!DOCTYPE html>\n<html>\n<head>\n  <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">\n  <title>Mobile Ready</title>\n</head>\n<body>\n  <p>Mobile friendly layout.</p>\n</body>\n</html>",
          "expectedOutput": "A responsive webpage formatted for mobile and desktop screens.",
          "starterCode": "<!DOCTYPE html>\n<html lang=\"en\">\n<head>\n  <meta charset=\"UTF-8\">\n  <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">\n  <title>HTML5 Doctype</title>\n</head>\n<body>\n  <h2>HTML5 Standards</h2>\n  <p>Rendered in modern standards mode.</p>\n</body>\n</html>",
          "practiceTask": {
            "title": "Configure Standard Doctype and Head",
            "description": "Build a document with <!DOCTYPE html>, meta charset, viewport, and title.",
            "requirements": [
              "Include <!DOCTYPE html> at line 1",
              "Set <title> tag inside <head>",
              "Add an <h2> heading inside <body>"
            ],
            "starterCode": "<!DOCTYPE html>\n<html lang=\"en\">\n<head>\n  <meta charset=\"UTF-8\">\n  <title>Standard Page</title>\n</head>\n<body>\n  <h2>HTML5 Standards Mode</h2>\n  <p>This page uses the HTML5 DOCTYPE.</p>\n</body>\n</html>",
            "expectedOutput": "Standard HTML5 page rendered without quirks.",
            "validationRules": [
              {
                "tag": "h2",
                "minCount": 1,
                "message": "Include an <h2> tag"
              },
              {
                "tag": "p",
                "minCount": 1,
                "message": "Include a <p> tag"
              }
            ]
          }
        },
        {
          "_id": "lesson-1-5",
          "id": "lesson-1-5",
          "moduleId": "module-1",
          "moduleTitle": "Module 1 — HTML Basics",
          "courseId": "html-from-beginner-to-practical",
          "order": 5,
          "title": "Headings and Paragraphs",
          "slug": "headings-and-paragraphs",
          "description": "Learn the 6 heading levels (h1 to h6) and paragraph flow.",
          "learningObjective": "Use semantic heading hierarchy from h1 down to h6 and format body text with paragraphs.",
          "concept": "HTML provides 6 levels of headings: <h1> is the most important (main page title), followed by <h2> (major sections), down to <h6> (sub-sub sections). Browsers render <h1> in larger text by default and search engines use it to index your page.",
          "codeExample": "<h1>Main Heading (H1)</h1>\n<h2>Sub-Heading (H2)</h2>\n<h3>Topic (H3)</h3>\n<p>This is a paragraph.</p>",
          "expectedOutput": "Heading text cascading from large to small, followed by regular paragraph text.",
          "starterCode": "<!DOCTYPE html>\n<html>\n<body>\n  <h1>Main Story</h1>\n  <p>Introduction paragraph.</p>\n  <h2>Chapter 1: The Beginning</h2>\n  <p>Story paragraph goes here.</p>\n</body>\n</html>",
          "practiceTask": {
            "title": "Article Hierarchy",
            "description": "Create an article outline using h1, h2, h3, and paragraph tags.",
            "requirements": [
              "Include one <h1> for the article title",
              "Include at least one <h2> for a section",
              "Include at least one <h3> for a subsection",
              "Include two <p> paragraphs"
            ],
            "starterCode": "<!DOCTYPE html>\n<html>\n<body>\n  <h1>CrackWithAI Learning Journey</h1>\n  <p>Welcome to our tech article.</p>\n  <h2>Getting Started</h2>\n  <p>Here is what you will learn.</p>\n  <h3>Step 1: HTML</h3>\n</body>\n</html>",
            "expectedOutput": "A clean hierarchical article layout with 3 heading levels.",
            "validationRules": [
              {
                "tag": "h1",
                "minCount": 1,
                "message": "Include one <h1>"
              },
              {
                "tag": "h2",
                "minCount": 1,
                "message": "Include at least one <h2>"
              },
              {
                "tag": "h3",
                "minCount": 1,
                "message": "Include at least one <h3>"
              },
              {
                "tag": "p",
                "minCount": 2,
                "message": "Include at least two <p> elements"
              }
            ]
          }
        },
        {
          "_id": "lesson-1-6",
          "id": "lesson-1-6",
          "moduleId": "module-1",
          "moduleTitle": "Module 1 — HTML Basics",
          "courseId": "html-from-beginner-to-practical",
          "order": 6,
          "title": "Text Formatting",
          "slug": "text-formatting",
          "description": "Style text using strong, em, mark, small, del, ins, sub, and sup.",
          "learningObjective": "Apply inline formatting tags to emphasize, highlight, and format words.",
          "concept": "HTML has built-in tags to format text: <strong> makes text bold and signals importance. <em> emphasizes text with italics. <mark> highlights text with a yellow background. <small> reduces size. <del> strikes through deleted text.",
          "codeExample": "<p>This is <strong>important</strong> and this is <em>italic</em>. Here is <mark>highlighted</mark> text.</p>",
          "expectedOutput": "A sentence containing bold, italicized, and highlighted words.",
          "starterCode": "<!DOCTYPE html>\n<html>\n<body>\n  <h2>Formatting Text in HTML</h2>\n  <p>Mastering <strong>HTML</strong> is <em>crucial</em> for web development.</p>\n  <p>Special deal: <del>$99</del> <ins>$0</ins> for <mark>Students</mark>!</p>\n</body>\n</html>",
          "practiceTask": {
            "title": "Formatted Announcement",
            "description": "Write an announcement utilizing strong, em, and mark formatting elements.",
            "requirements": [
              "Use <strong> for bold importance",
              "Use <em> for italic emphasis",
              "Use <mark> for highlighting text"
            ],
            "starterCode": "<!DOCTYPE html>\n<html>\n<body>\n  <h1>Notice</h1>\n  <p>Registration is <strong>open</strong> today.</p>\n  <p>Please check your <em>email</em> for the <mark>confirmation</mark> link.</p>\n</body>\n</html>",
            "expectedOutput": "Text with visual bold, italic, and yellow highlight styling.",
            "validationRules": [
              {
                "tag": "strong",
                "minCount": 1,
                "message": "Include at least one <strong> tag"
              },
              {
                "tag": "em",
                "minCount": 1,
                "message": "Include at least one <em> tag"
              },
              {
                "tag": "mark",
                "minCount": 1,
                "message": "Include at least one <mark> tag"
              }
            ]
          }
        },
        {
          "_id": "lesson-1-7",
          "id": "lesson-1-7",
          "moduleId": "module-1",
          "moduleTitle": "Module 1 — HTML Basics",
          "courseId": "html-from-beginner-to-practical",
          "order": 7,
          "title": "HTML Comments",
          "slug": "html-comments",
          "description": "Add developer notes and temporarily hide code using HTML comments.",
          "learningObjective": "Write HTML comments using <!-- comment --> syntax.",
          "concept": "Comments in HTML are written with <!-- followed by your comment and closed with -->. Anything inside a comment is ignored by web browsers and will not be displayed to users. Developers use comments to explain code and organize sections.",
          "codeExample": "<!-- This is a comment that will not show in browser -->\n<h1>Visible Content</h1>",
          "expectedOutput": "Only the <h1> content appears on screen; the comment remains invisible.",
          "starterCode": "<!DOCTYPE html>\n<html>\n<body>\n  <!-- Section Header -->\n  <h2>Developer Notes</h2>\n  <p>Check the source code to see comments!</p>\n  <!-- Remember to test on mobile -->\n</body>\n</html>",
          "practiceTask": {
            "title": "Organize Code with Comments",
            "description": "Document your code by adding comments separating header and body sections.",
            "requirements": [
              "Add at least one HTML comment <!-- note -->",
              "Include an <h1> and a <p> tag"
            ],
            "starterCode": "<!DOCTYPE html>\n<html>\n<body>\n  <!-- Header Section Starts -->\n  <h1>Commented Code</h1>\n  <!-- Body Content Starts -->\n  <p>Comments help developers maintain clean code.</p>\n</body>\n</html>",
            "expectedOutput": "Visible heading and paragraph with clean internal developer notes.",
            "validationRules": [
              {
                "tag": "h1",
                "minCount": 1,
                "message": "Include an <h1>"
              },
              {
                "tag": "p",
                "minCount": 1,
                "message": "Include a <p>"
              }
            ]
          }
        }
      ]
    },
    {
      "_id": "module-2",
      "id": "module-2",
      "title": "Module 2 — HTML Elements",
      "slug": "module-2-html-elements",
      "order": 2,
      "description": "Master hyperlinks, images, lists, tables, divs, and modern semantic elements.",
      "duration": 50,
      "lessons": [
        {
          "_id": "lesson-2-1",
          "id": "lesson-2-1",
          "moduleId": "module-2",
          "moduleTitle": "Module 2 — HTML Elements",
          "courseId": "html-from-beginner-to-practical",
          "order": 8,
          "title": "Links",
          "slug": "links",
          "description": "Create hyperlinks with the anchor tag, href attribute, and targets.",
          "learningObjective": "Build internal and external hyperlinks using <a> and target=\"_blank\".",
          "concept": "Links are created using the anchor element <a>. The most important attribute is href (Hypertext Reference), which points to the destination URL. Adding target=\"_blank\" tells the browser to open the link in a new tab.",
          "codeExample": "<a href=\"https://crackwithai.com\" target=\"_blank\">Visit CrackWithAI</a>",
          "expectedOutput": "A clickable blue underlined link that opens the target website.",
          "starterCode": "<!DOCTYPE html>\n<html>\n<body>\n  <h2>Useful Resources</h2>\n  <p>Visit <a href=\"https://crackwithai.com\" target=\"_blank\">CrackWithAI</a> to learn AI.</p>\n</body>\n</html>",
          "practiceTask": {
            "title": "Create Navigation Links",
            "description": "Create two links pointing to external sites with descriptive anchor text.",
            "requirements": [
              "Include at least two <a> elements with valid href attributes",
              "Set target=\"_blank\" on at least one link"
            ],
            "starterCode": "<!DOCTYPE html>\n<html>\n<body>\n  <h2>Web Links</h2>\n  <p><a href=\"https://crackwithai.com\" target=\"_blank\">CrackWithAI Platform</a></p>\n  <p><a href=\"https://developer.mozilla.org\">MDN Web Docs</a></p>\n</body>\n</html>",
            "expectedOutput": "Two clickable links opening target pages.",
            "validationRules": [
              {
                "tag": "a",
                "minCount": 2,
                "message": "Include at least two <a> anchor tags"
              }
            ]
          }
        },
        {
          "_id": "lesson-2-2",
          "id": "lesson-2-2",
          "moduleId": "module-2",
          "moduleTitle": "Module 2 — HTML Elements",
          "courseId": "html-from-beginner-to-practical",
          "order": 9,
          "title": "Images",
          "slug": "images",
          "description": "Embed images with img, src, alt attributes, and responsive sizes.",
          "learningObjective": "Display images cleanly and write accessible alt descriptions.",
          "concept": "The <img> tag is an empty (void) element, meaning it does not have a closing tag. It requires two essential attributes: src (source URL of image) and alt (alternative text read by screen readers and shown if the image fails to load).",
          "codeExample": "<img src=\"https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=300\" alt=\"Laptop on desk\" width=\"300\" />",
          "expectedOutput": "A clean photographic image rendered on the page.",
          "starterCode": "<!DOCTYPE html>\n<html>\n<body>\n  <h2>Image Gallery</h2>\n  <img src=\"https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=300\" alt=\"Code on laptop screen\" width=\"300\" />\n</body>\n</html>",
          "practiceTask": {
            "title": "Display a Photograph with Caption",
            "description": "Add an <img> tag with a meaningful alt attribute and width.",
            "requirements": [
              "Include an <img> tag with src and alt attributes",
              "Include a <p> description below the image"
            ],
            "starterCode": "<!DOCTYPE html>\n<html>\n<body>\n  <h2>Coding Workspace</h2>\n  <img src=\"https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=300\" alt=\"Laptop and coffee on desk\" width=\"300\" />\n  <p>My daily programming setup.</p>\n</body>\n</html>",
            "expectedOutput": "An image with proper alternative text and descriptive paragraph.",
            "validationRules": [
              {
                "tag": "img",
                "minCount": 1,
                "message": "Include an <img> element"
              },
              {
                "tag": "p",
                "minCount": 1,
                "message": "Include a <p> element"
              }
            ]
          }
        },
        {
          "_id": "lesson-2-3",
          "id": "lesson-2-3",
          "moduleId": "module-2",
          "moduleTitle": "Module 2 — HTML Elements",
          "courseId": "html-from-beginner-to-practical",
          "order": 10,
          "title": "Lists",
          "slug": "lists",
          "description": "Organize items with bulleted unordered lists and numbered ordered lists.",
          "learningObjective": "Construct unordered <ul> and ordered <ol> lists with <li> list items.",
          "concept": "HTML provides two main types of lists: <ul> (unordered list) displays items with bullet points, while <ol> (ordered list) numbers items automatically (1, 2, 3). Each item inside must be wrapped in an <li> (list item) tag.",
          "codeExample": "<ul>\n  <li>HTML5</li>\n  <li>CSS3</li>\n  <li>JavaScript</li>\n</ul>",
          "expectedOutput": "A bulleted list of 3 web development technologies.",
          "starterCode": "<!DOCTYPE html>\n<html>\n<body>\n  <h2>Full Stack Roadmap</h2>\n  <h3>Core Languages (Unordered)</h3>\n  <ul>\n    <li>HTML</li>\n    <li>CSS</li>\n    <li>JavaScript</li>\n  </ul>\n</body>\n</html>",
          "practiceTask": {
            "title": "Build Unordered and Ordered Lists",
            "description": "Create a bulleted list of your favorite tools and a numbered list of daily steps.",
            "requirements": [
              "Create an unordered list <ul> with at least 3 <li> items",
              "Create an ordered list <ol> with at least 3 <li> items"
            ],
            "starterCode": "<!DOCTYPE html>\n<html>\n<body>\n  <h2>My Learning Plan</h2>\n  <h3>Technologies to Master</h3>\n  <ul>\n    <li>HTML5</li>\n    <li>CSS3</li>\n    <li>JavaScript</li>\n  </ul>\n  <h3>Daily Routine</h3>\n  <ol>\n    <li>Read Lesson</li>\n    <li>Practice Code</li>\n    <li>Build Project</li>\n  </ol>\n</body>\n</html>",
            "expectedOutput": "One bulleted list and one numbered list cleanly aligned.",
            "validationRules": [
              {
                "tag": "ul",
                "minCount": 1,
                "message": "Include at least one <ul> list"
              },
              {
                "tag": "ol",
                "minCount": 1,
                "message": "Include at least one <ol> list"
              },
              {
                "tag": "li",
                "minCount": 4,
                "message": "Include at least 4 <li> items in total"
              }
            ]
          }
        },
        {
          "_id": "lesson-2-4",
          "id": "lesson-2-4",
          "moduleId": "module-2",
          "moduleTitle": "Module 2 — HTML Elements",
          "courseId": "html-from-beginner-to-practical",
          "order": 11,
          "title": "Tables",
          "slug": "tables",
          "description": "Structure tabular data with table, tr, th, td, and borders.",
          "learningObjective": "Create structured data tables with rows, headers, and cells.",
          "concept": "HTML tables organize information into rows and columns: <table> is the container, <tr> defines a table row, <th> defines a bold centered header cell, and <td> defines standard data cells.",
          "codeExample": "<table border=\"1\">\n  <tr>\n    <th>Technology</th>\n    <th>Role</th>\n  </tr>\n  <tr>\n    <td>HTML</td>\n    <td>Structure</td>\n  </tr>\n</table>",
          "expectedOutput": "A bordered table with a header row and data rows.",
          "starterCode": "<!DOCTYPE html>\n<html>\n<body>\n  <h2>Full Stack Technologies</h2>\n  <table border=\"1\">\n    <tr>\n      <th>Tool</th>\n      <th>Type</th>\n      <th>Status</th>\n    </tr>\n    <tr>\n      <td>HTML</td>\n      <td>Frontend</td>\n      <td>Active</td>\n    </tr>\n  </table>\n</body>\n</html>",
          "practiceTask": {
            "title": "Create a Student Grades Table",
            "description": "Build a table displaying 3 subjects with columns for Subject, Score, and Grade.",
            "requirements": [
              "Include a <table> element",
              "Include at least one header row with <th> cells",
              "Include at least two data rows with <td> cells"
            ],
            "starterCode": "<!DOCTYPE html>\n<html>\n<body>\n  <h2>Student Report</h2>\n  <table border=\"1\">\n    <tr>\n      <th>Subject</th>\n      <th>Score</th>\n      <th>Grade</th>\n    </tr>\n    <tr>\n      <td>HTML Basics</td>\n      <td>95</td>\n      <td>A+</td>\n    </tr>\n    <tr>\n      <td>CSS Styling</td>\n      <td>90</td>\n      <td>A</td>\n    </tr>\n  </table>\n</body>\n</html>",
            "expectedOutput": "A formatted data table with 3 columns and multiple rows.",
            "validationRules": [
              {
                "tag": "table",
                "minCount": 1,
                "message": "Include a <table> element"
              },
              {
                "tag": "th",
                "minCount": 2,
                "message": "Include at least 2 <th> header cells"
              },
              {
                "tag": "td",
                "minCount": 4,
                "message": "Include at least 4 <td> data cells"
              }
            ]
          }
        },
        {
          "_id": "lesson-2-5",
          "id": "lesson-2-5",
          "moduleId": "module-2",
          "moduleTitle": "Module 2 — HTML Elements",
          "courseId": "html-from-beginner-to-practical",
          "order": 12,
          "title": "Div and Span",
          "slug": "div-and-span",
          "description": "Understand the difference between block-level (div) and inline (span) containers.",
          "learningObjective": "Use <div> for layout blocks and <span> for inline text segments.",
          "concept": "A <div> is a block-level element that always starts on a new line and takes up the full available width. A <span> is an inline element that only takes up as much width as its content and does not start on a new line.",
          "codeExample": "<div>\n  <p>This is inside a div container with <span style=\"color: purple;\">colored span</span> text.</p>\n</div>",
          "expectedOutput": "A block section containing inline highlighted text.",
          "starterCode": "<!DOCTYPE html>\n<html>\n<body>\n  <div>\n    <h2>Card Container</h2>\n    <p>Product: <span>Pro Membership</span></p>\n  </div>\n</body>\n</html>",
          "practiceTask": {
            "title": "Build a Card with Div and Span",
            "description": "Construct a profile card block using div as the container and span for special labels.",
            "requirements": [
              "Use at least one <div> container",
              "Use at least one <span> inline element"
            ],
            "starterCode": "<!DOCTYPE html>\n<html>\n<body>\n  <div>\n    <h2>Alex Mercer</h2>\n    <p>Role: <span>Full Stack Developer</span></p>\n    <p>Status: <span>Active</span></p>\n  </div>\n</body>\n</html>",
            "expectedOutput": "A structured profile card with inline role badges.",
            "validationRules": [
              {
                "tag": "div",
                "minCount": 1,
                "message": "Include at least one <div> element"
              },
              {
                "tag": "span",
                "minCount": 1,
                "message": "Include at least one <span> element"
              }
            ]
          }
        },
        {
          "_id": "lesson-2-6",
          "id": "lesson-2-6",
          "moduleId": "module-2",
          "moduleTitle": "Module 2 — HTML Elements",
          "courseId": "html-from-beginner-to-practical",
          "order": 13,
          "title": "Semantic HTML",
          "slug": "semantic-html",
          "description": "Write accessible modern code using header, nav, main, section, and footer.",
          "learningObjective": "Replace generic divs with semantic landmark tags for accessibility and SEO.",
          "concept": "Semantic HTML tags clearly describe their meaning to both the browser and developer: <header> for top branding/nav, <nav> for navigation links, <main> for core content, <section> for thematic groupings, <article> for standalone pieces, and <footer> for bottom credits.",
          "codeExample": "<header>\n  <h1>CrackWithAI</h1>\n  <nav><a href=\"#home\">Home</a></nav>\n</header>\n<main>\n  <section>\n    <h2>Welcome</h2>\n  </section>\n</main>\n<footer>\n  <p>&copy; 2026 CrackWithAI</p>\n</footer>",
          "expectedOutput": "A complete semantic webpage layout with header, nav, main, and footer.",
          "starterCode": "<!DOCTYPE html>\n<html>\n<body>\n  <header>\n    <h1>My Website</h1>\n    <nav>\n      <a href=\"#about\">About</a> | <a href=\"#contact\">Contact</a>\n    </nav>\n  </header>\n  <main>\n    <h2>Welcome</h2>\n    <p>This page uses semantic landmarks.</p>\n  </main>\n  <footer>\n    <p>&copy; 2026</p>\n  </footer>\n</body>\n</html>",
          "practiceTask": {
            "title": "Assemble a Semantic Layout",
            "description": "Build a webpage using header, nav, main, section, and footer elements.",
            "requirements": [
              "Include a <header> element with title",
              "Include a <nav> with at least one link",
              "Include a <main> container with a <section>",
              "Include a <footer> with copyright text"
            ],
            "starterCode": "<!DOCTYPE html>\n<html>\n<body>\n  <header>\n    <h1>CrackWithAI Academy</h1>\n    <nav><a href=\"#learn\">Learn HTML</a></nav>\n  </header>\n  <main>\n    <section>\n      <h2>Introduction</h2>\n      <p>Semantic tags make code readable and accessible.</p>\n    </section>\n  </main>\n  <footer>\n    <p>&copy; 2026 CrackWithAI. All rights reserved.</p>\n  </footer>\n</body>\n</html>",
            "expectedOutput": "A cleanly structured semantic document adhering to HTML5 best practices.",
            "validationRules": [
              {
                "tag": "header",
                "minCount": 1,
                "message": "Include a <header>"
              },
              {
                "tag": "nav",
                "minCount": 1,
                "message": "Include a <nav>"
              },
              {
                "tag": "main",
                "minCount": 1,
                "message": "Include a <main>"
              },
              {
                "tag": "footer",
                "minCount": 1,
                "message": "Include a <footer>"
              }
            ]
          }
        }
      ]
    },
    {
      "_id": "module-3",
      "id": "module-3",
      "title": "Module 3 — HTML Forms",
      "slug": "module-3-html-forms",
      "order": 3,
      "description": "Build interactive user input forms, labels, buttons, select menus, and validations.",
      "duration": 45,
      "lessons": [
        {
          "_id": "lesson-3-1",
          "id": "lesson-3-1",
          "moduleId": "module-3",
          "moduleTitle": "Module 3 — HTML Forms",
          "courseId": "html-from-beginner-to-practical",
          "order": 14,
          "title": "Forms",
          "slug": "forms",
          "description": "Understand the form element, action endpoints, and GET vs POST methods.",
          "learningObjective": "Learn how <form action=\"...\" method=\"...\"> submits data to backend servers.",
          "concept": "An HTML form is used to collect user inputs and send them to a server. The action attribute specifies the destination URL where submitted data will be sent, and the method attribute specifies the HTTP protocol method (usually \"POST\" for creating data or \"GET\" for search queries).",
          "codeExample": "<form action=\"/submit\" method=\"POST\">\n  <label>Your Name: <input type=\"text\" name=\"username\" /></label>\n  <button type=\"submit\">Send</button>\n</form>",
          "expectedOutput": "An interactive form with a text input field and a submit button.",
          "starterCode": "<!DOCTYPE html>\n<html>\n<body>\n  <h2>User Survey</h2>\n  <form action=\"/api/survey\" method=\"POST\">\n    <p>Please fill out this form:</p>\n    <input type=\"text\" name=\"feedback\" placeholder=\"Enter feedback\" />\n    <button type=\"submit\">Submit</button>\n  </form>\n</body>\n</html>",
          "practiceTask": {
            "title": "Build a Feedback Form Container",
            "description": "Construct a form element with method=\"POST\" containing a text input and submit button.",
            "requirements": [
              "Include a <form> element with action and method attributes",
              "Include an <input> element inside the form",
              "Include a <button type=\"submit\"> element"
            ],
            "starterCode": "<!DOCTYPE html>\n<html>\n<body>\n  <h2>Feedback Form</h2>\n  <form action=\"/submit-feedback\" method=\"POST\">\n    <input type=\"text\" name=\"message\" placeholder=\"Type your message\" />\n    <button type=\"submit\">Send Feedback</button>\n  </form>\n</body>\n</html>",
            "expectedOutput": "A working form container ready for submission.",
            "validationRules": [
              {
                "tag": "form",
                "minCount": 1,
                "message": "Include a <form> element"
              },
              {
                "tag": "input",
                "minCount": 1,
                "message": "Include at least one <input>"
              },
              {
                "tag": "button",
                "minCount": 1,
                "message": "Include a <button>"
              }
            ]
          }
        },
        {
          "_id": "lesson-3-2",
          "id": "lesson-3-2",
          "moduleId": "module-3",
          "moduleTitle": "Module 3 — HTML Forms",
          "courseId": "html-from-beginner-to-practical",
          "order": 15,
          "title": "Input Types",
          "slug": "input-types",
          "description": "Explore text, email, password, number, checkbox, radio, and date input fields.",
          "learningObjective": "Utilize specialized input types to capture validated user data.",
          "concept": "The <input> element changes its behavior based on the type attribute: type=\"text\" for standard text, type=\"email\" for email addresses, type=\"password\" to mask characters, type=\"number\" for numeric values, type=\"checkbox\" for toggle selections, and type=\"radio\" for single choices.",
          "codeExample": "<input type=\"text\" placeholder=\"Name\" />\n<input type=\"email\" placeholder=\"Email\" />\n<input type=\"password\" placeholder=\"Password\" />",
          "expectedOutput": "Three distinct input fields for text, email validation, and masked password dots.",
          "starterCode": "<!DOCTYPE html>\n<html>\n<body>\n  <h2>Input Types Showcase</h2>\n  <form>\n    <p>Text: <input type=\"text\" /></p>\n    <p>Email: <input type=\"email\" /></p>\n    <p>Password: <input type=\"password\" /></p>\n    <p>Number: <input type=\"number\" /></p>\n  </form>\n</body>\n</html>",
          "practiceTask": {
            "title": "Create Diverse Inputs",
            "description": "Build a form showcasing at least 4 distinct input types: text, email, password, and checkbox.",
            "requirements": [
              "Include input type=\"text\"",
              "Include input type=\"email\"",
              "Include input type=\"password\"",
              "Include input type=\"checkbox\""
            ],
            "starterCode": "<!DOCTYPE html>\n<html>\n<body>\n  <h2>Registration Inputs</h2>\n  <form>\n    <p><input type=\"text\" placeholder=\"Username\" /></p>\n    <p><input type=\"email\" placeholder=\"Email Address\" /></p>\n    <p><input type=\"password\" placeholder=\"Secure Password\" /></p>\n    <p><input type=\"checkbox\" /> Remember me</p>\n  </form>\n</body>\n</html>",
            "expectedOutput": "Four distinct input fields rendering appropriate mobile/desktop keyboards.",
            "validationRules": [
              {
                "tag": "input",
                "minCount": 4,
                "message": "Include at least 4 <input> elements"
              }
            ]
          }
        },
        {
          "_id": "lesson-3-3",
          "id": "lesson-3-3",
          "moduleId": "module-3",
          "moduleTitle": "Module 3 — HTML Forms",
          "courseId": "html-from-beginner-to-practical",
          "order": 16,
          "title": "Labels",
          "slug": "labels",
          "description": "Connect accessible labels to inputs using the for and id attributes.",
          "learningObjective": "Bind <label for=\"id\"> with <input id=\"id\"> for accessibility and touch targets.",
          "concept": "The <label> tag defines a caption for an input item. When you link a label to an input using the for attribute matching the input id, clicking the label automatically focuses or activates the input. This is vital for mobile usability and accessibility screen readers.",
          "codeExample": "<label for=\"user-email\">Email Address</label>\n<input type=\"email\" id=\"user-email\" />",
          "expectedOutput": "Clicking the label \"Email Address\" automatically focuses the input box.",
          "starterCode": "<!DOCTYPE html>\n<html>\n<body>\n  <h2>Accessible Inputs</h2>\n  <form>\n    <div>\n      <label for=\"full-name\">Full Name</label>\n      <input type=\"text\" id=\"full-name\" />\n    </div>\n  </form>\n</body>\n</html>",
          "practiceTask": {
            "title": "Connect Labels to Inputs",
            "description": "Create two inputs (name and email) with correctly matching label for and input id attributes.",
            "requirements": [
              "Include two <label> elements with for attributes",
              "Include two <input> elements with matching id attributes"
            ],
            "starterCode": "<!DOCTYPE html>\n<html>\n<body>\n  <h2>Sign In</h2>\n  <form>\n    <p>\n      <label for=\"login-email\">Email</label><br />\n      <input type=\"email\" id=\"login-email\" />\n    </p>\n    <p>\n      <label for=\"login-pass\">Password</label><br />\n      <input type=\"password\" id=\"login-pass\" />\n    </p>\n  </form>\n</body>\n</html>",
            "expectedOutput": "Accessible form where clicking labels focuses corresponding inputs.",
            "validationRules": [
              {
                "tag": "label",
                "minCount": 2,
                "message": "Include at least two <label> elements"
              },
              {
                "tag": "input",
                "minCount": 2,
                "message": "Include at least two <input> elements"
              }
            ]
          }
        },
        {
          "_id": "lesson-3-4",
          "id": "lesson-3-4",
          "moduleId": "module-3",
          "moduleTitle": "Module 3 — HTML Forms",
          "courseId": "html-from-beginner-to-practical",
          "order": 17,
          "title": "Buttons",
          "slug": "buttons",
          "description": "Create clickable action triggers with button type submit, reset, and button.",
          "learningObjective": "Use <button type=\"...\"> to trigger form submissions and actions.",
          "concept": "The <button> tag creates a clickable button: type=\"submit\" (default) sends form data, type=\"reset\" clears all inputs to initial values, and type=\"button\" creates a standard trigger for custom JavaScript actions.",
          "codeExample": "<button type=\"submit\">Submit Form</button>\n<button type=\"reset\">Clear Form</button>",
          "expectedOutput": "Two distinct clickable buttons for submitting and resetting.",
          "starterCode": "<!DOCTYPE html>\n<html>\n<body>\n  <form>\n    <input type=\"text\" placeholder=\"Type here\" />\n    <button type=\"submit\">Save</button>\n    <button type=\"reset\">Reset</button>\n  </form>\n</body>\n</html>",
          "practiceTask": {
            "title": "Form Action Buttons",
            "description": "Build a form with submit and reset buttons.",
            "requirements": [
              "Include a <button type=\"submit\">",
              "Include a <button type=\"reset\">"
            ],
            "starterCode": "<!DOCTYPE html>\n<html>\n<body>\n  <h2>Preferences</h2>\n  <form>\n    <p><input type=\"text\" placeholder=\"Favorite tech stack\" /></p>\n    <button type=\"submit\">Save Choice</button>\n    <button type=\"reset\">Start Over</button>\n  </form>\n</body>\n</html>",
            "expectedOutput": "Two functional buttons for saving and resetting the input field.",
            "validationRules": [
              {
                "tag": "button",
                "minCount": 2,
                "message": "Include at least two <button> elements"
              }
            ]
          }
        },
        {
          "_id": "lesson-3-5",
          "id": "lesson-3-5",
          "moduleId": "module-3",
          "moduleTitle": "Module 3 — HTML Forms",
          "courseId": "html-from-beginner-to-practical",
          "order": 18,
          "title": "Select and Textarea",
          "slug": "select-and-textarea",
          "description": "Build dropdown option menus with select and multi-line text areas.",
          "learningObjective": "Implement <select> with <option> tags and <textarea> for long-form comments.",
          "concept": "When users need to choose from a list, use <select> with nested <option> tags. When users need to type long multi-line text (like bio or message), use <textarea> with rows and cols attributes instead of single-line input.",
          "codeExample": "<select name=\"track\">\n  <option value=\"html\">HTML</option>\n  <option value=\"css\">CSS</option>\n</select>\n<textarea rows=\"4\" placeholder=\"Enter message\"></textarea>",
          "expectedOutput": "A dropdown menu with choices and a multi-line resizable text box.",
          "starterCode": "<!DOCTYPE html>\n<html>\n<body>\n  <h2>Application Form</h2>\n  <form>\n    <p>\n      <label for=\"role\">Choose Role:</label>\n      <select id=\"role\">\n        <option>Frontend</option>\n        <option>Backend</option>\n        <option>Full Stack</option>\n      </select>\n    </p>\n    <p>\n      <label for=\"bio\">Bio:</label><br />\n      <textarea id=\"bio\" rows=\"3\" placeholder=\"Tell us about yourself\"></textarea>\n    </p>\n  </form>\n</body>\n</html>",
          "practiceTask": {
            "title": "Build Dropdown and Message Area",
            "description": "Create a form containing a <select> with at least 3 options and a <textarea>.",
            "requirements": [
              "Include a <select> element with at least 3 <option> tags",
              "Include a <textarea> element"
            ],
            "starterCode": "<!DOCTYPE html>\n<html>\n<body>\n  <h2>Feedback Submission</h2>\n  <form>\n    <p>\n      <select name=\"category\">\n        <option>Feedback</option>\n        <option>Question</option>\n        <option>Bug Report</option>\n      </select>\n    </p>\n    <p>\n      <textarea rows=\"4\" cols=\"30\" placeholder=\"Type your detailed message here...\"></textarea>\n    </p>\n    <button type=\"submit\">Submit</button>\n  </form>\n</body>\n</html>",
            "expectedOutput": "An interactive dropdown menu and a multi-line message box.",
            "validationRules": [
              {
                "tag": "select",
                "minCount": 1,
                "message": "Include a <select> tag"
              },
              {
                "tag": "option",
                "minCount": 3,
                "message": "Include at least 3 <option> tags"
              },
              {
                "tag": "textarea",
                "minCount": 1,
                "message": "Include a <textarea> tag"
              }
            ]
          }
        },
        {
          "_id": "lesson-3-6",
          "id": "lesson-3-6",
          "moduleId": "module-3",
          "moduleTitle": "Module 3 — HTML Forms",
          "courseId": "html-from-beginner-to-practical",
          "order": 19,
          "title": "Form Structure and Basic Validation",
          "slug": "form-structure-and-basic-validation",
          "description": "Enforce required fields, minlength, maxlength, and input placeholders.",
          "learningObjective": "Use browser-native validation attributes like required, minlength, and placeholder.",
          "concept": "HTML5 allows you to validate forms before they reach the server. Adding required prevents submission if empty. minlength and maxlength enforce character limits. placeholder provides ghost text hints to the user.",
          "codeExample": "<input type=\"email\" placeholder=\"you@domain.com\" required />\n<input type=\"password\" minlength=\"8\" required />",
          "expectedOutput": "Inputs that trigger browser warning popups if submitted empty or too short.",
          "starterCode": "<!DOCTYPE html>\n<html>\n<body>\n  <h2>Validated Registration</h2>\n  <form>\n    <p><input type=\"text\" placeholder=\"Full Name\" required /></p>\n    <p><input type=\"email\" placeholder=\"Email Address\" required /></p>\n    <p><input type=\"password\" placeholder=\"Password (min 8 chars)\" minlength=\"8\" required /></p>\n    <button type=\"submit\">Register</button>\n  </form>\n</body>\n</html>",
          "practiceTask": {
            "title": "Implement Validated Inputs",
            "description": "Build a secure registration form with required and minlength constraints.",
            "requirements": [
              "Include an input with required attribute",
              "Include an input with minlength attribute",
              "Include a submit button"
            ],
            "starterCode": "<!DOCTYPE html>\n<html>\n<body>\n  <h2>Secure Sign Up</h2>\n  <form action=\"/signup\" method=\"POST\">\n    <p><input type=\"text\" placeholder=\"Username\" required /></p>\n    <p><input type=\"email\" placeholder=\"Email\" required /></p>\n    <p><input type=\"password\" placeholder=\"Password (8+ chars)\" minlength=\"8\" required /></p>\n    <button type=\"submit\">Create Account</button>\n  </form>\n</body>\n</html>",
            "expectedOutput": "A form that blocks empty submissions using built-in HTML5 validation.",
            "validationRules": [
              {
                "tag": "form",
                "minCount": 1,
                "message": "Include a <form>"
              },
              {
                "tag": "input",
                "minCount": 2,
                "message": "Include at least two <input> fields"
              },
              {
                "tag": "button",
                "minCount": 1,
                "message": "Include a <button>"
              }
            ]
          }
        }
      ]
    },
    {
      "_id": "module-4",
      "id": "module-4",
      "title": "Module 4 — Practical HTML",
      "slug": "module-4-practical-html",
      "order": 4,
      "description": "Build complete real-world webpages: profiles, forms, auth pages, and your portfolio.",
      "duration": 40,
      "lessons": [
        {
          "_id": "lesson-4-1",
          "id": "lesson-4-1",
          "moduleId": "module-4",
          "moduleTitle": "Module 4 — Practical HTML",
          "courseId": "html-from-beginner-to-practical",
          "order": 20,
          "title": "Build a Profile Page",
          "slug": "build-a-profile-page",
          "description": "Construct a personal developer profile with image, bio, skills, and links.",
          "learningObjective": "Combine headings, images, lists, and links into a complete developer profile card.",
          "concept": "In this practical lesson, you will assemble everything you have learned into a real profile webpage: an avatar photo, your title, a short biography paragraph, a bulleted list of skills, and social links.",
          "codeExample": "<div class=\"profile\">\n  <img src=\"https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150\" alt=\"Avatar\" width=\"120\" />\n  <h1>Prakash</h1>\n  <p>Full Stack Engineer</p>\n  <h3>Skills:</h3>\n  <ul><li>HTML5</li><li>Git</li></ul>\n</div>",
          "expectedOutput": "A clean developer profile card with photo, bio, skills list, and links.",
          "starterCode": "<!DOCTYPE html>\n<html lang=\"en\">\n<head>\n  <meta charset=\"UTF-8\">\n  <title>Developer Profile</title>\n</head>\n<body>\n  <header>\n    <h1>My Developer Profile</h1>\n  </header>\n  <main>\n    <img src=\"https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150\" alt=\"Profile avatar\" width=\"120\" />\n    <h2>Prakash</h2>\n    <p>Passionate learner mastering Full Stack Development on CrackWithAI.</p>\n    <h3>Core Skills</h3>\n    <ul>\n      <li>HTML5 Markup</li>\n      <li>Webpage Structure</li>\n      <li>Semantic Layouts</li>\n    </ul>\n    <p><a href=\"https://github.com\" target=\"_blank\">View GitHub</a></p>\n  </main>\n</body>\n</html>",
          "practiceTask": {
            "title": "Your Personal Profile Webpage",
            "description": "Build your personal developer profile with photo, bio, skill list, and GitHub link.",
            "requirements": [
              "Include an <h1> profile heading",
              "Include an <img> with alt attribute",
              "Include a <ul> skills list with at least 3 items",
              "Include at least one <a> link"
            ],
            "starterCode": "<!DOCTYPE html>\n<html>\n<body>\n  <h1>Alex - Full Stack Trainee</h1>\n  <img src=\"https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150\" alt=\"Alex avatar\" width=\"120\" />\n  <p>Building real web applications step by step.</p>\n  <h3>Skills</h3>\n  <ul>\n    <li>HTML5</li>\n    <li>Web Forms</li>\n    <li>Semantic HTML</li>\n  </ul>\n  <p><a href=\"https://github.com\">My Projects</a></p>\n</body>\n</html>",
            "expectedOutput": "A complete personal developer profile page.",
            "validationRules": [
              {
                "tag": "h1",
                "minCount": 1,
                "message": "Include an <h1>"
              },
              {
                "tag": "img",
                "minCount": 1,
                "message": "Include an <img>"
              },
              {
                "tag": "ul",
                "minCount": 1,
                "message": "Include a <ul>"
              },
              {
                "tag": "li",
                "minCount": 3,
                "message": "Include at least 3 <li> skills"
              },
              {
                "tag": "a",
                "minCount": 1,
                "message": "Include an <a> link"
              }
            ]
          }
        },
        {
          "_id": "lesson-4-2",
          "id": "lesson-4-2",
          "moduleId": "module-4",
          "moduleTitle": "Module 4 — Practical HTML",
          "courseId": "html-from-beginner-to-practical",
          "order": 21,
          "title": "Build a Contact Form",
          "slug": "build-a-contact-form",
          "description": "Assemble a professional contact inquiry form with name, email, subject, and message.",
          "learningObjective": "Construct a contact page with inputs, labels, textarea, and submit button.",
          "concept": "Contact forms are found on almost every website. You need labels paired with inputs for user name, user email, inquiry subject dropdown or text, and a multi-line textarea for the message.",
          "codeExample": "<form action=\"/contact\" method=\"POST\">\n  <label for=\"name\">Name:</label><input id=\"name\" required />\n  <label for=\"msg\">Message:</label><textarea id=\"msg\" required></textarea>\n  <button type=\"submit\">Send</button>\n</form>",
          "expectedOutput": "A clean contact section with all fields and send button.",
          "starterCode": "<!DOCTYPE html>\n<html lang=\"en\">\n<head>\n  <meta charset=\"UTF-8\">\n  <title>Contact Us</title>\n</head>\n<body>\n  <h1>Get In Touch</h1>\n  <p>We would love to hear from you. Send us a message below.</p>\n  <form action=\"/api/contact\" method=\"POST\">\n    <p>\n      <label for=\"contact-name\">Full Name:</label><br />\n      <input type=\"text\" id=\"contact-name\" placeholder=\"John Doe\" required />\n    </p>\n    <p>\n      <label for=\"contact-email\">Email Address:</label><br />\n      <input type=\"email\" id=\"contact-email\" placeholder=\"john@example.com\" required />\n    </p>\n    <p>\n      <label for=\"contact-msg\">Your Message:</label><br />\n      <textarea id=\"contact-msg\" rows=\"4\" placeholder=\"How can we help you?\" required></textarea>\n    </p>\n    <button type=\"submit\">Send Inquiry</button>\n  </form>\n</body>\n</html>",
          "practiceTask": {
            "title": "Complete Contact Form",
            "description": "Build a contact form with name, email, message textarea, and submit button.",
            "requirements": [
              "Include <form action=\"...\" method=\"POST\">",
              "Include inputs for name and email with matching labels",
              "Include a <textarea> for the message",
              "Include a <button type=\"submit\">"
            ],
            "starterCode": "<!DOCTYPE html>\n<html>\n<body>\n  <h2>Contact Support</h2>\n  <form action=\"/contact\" method=\"POST\">\n    <p>\n      <label for=\"cname\">Name:</label><br />\n      <input type=\"text\" id=\"cname\" required />\n    </p>\n    <p>\n      <label for=\"cemail\">Email:</label><br />\n      <input type=\"email\" id=\"cemail\" required />\n    </p>\n    <p>\n      <label for=\"cmessage\">Message:</label><br />\n      <textarea id=\"cmessage\" rows=\"4\" required></textarea>\n    </p>\n    <button type=\"submit\">Submit Message</button>\n  </form>\n</body>\n</html>",
            "expectedOutput": "A functional contact form with proper validation.",
            "validationRules": [
              {
                "tag": "form",
                "minCount": 1,
                "message": "Include a <form>"
              },
              {
                "tag": "label",
                "minCount": 2,
                "message": "Include at least 2 <label> elements"
              },
              {
                "tag": "input",
                "minCount": 2,
                "message": "Include at least 2 <input> elements"
              },
              {
                "tag": "textarea",
                "minCount": 1,
                "message": "Include a <textarea>"
              },
              {
                "tag": "button",
                "minCount": 1,
                "message": "Include a <button>"
              }
            ]
          }
        },
        {
          "_id": "lesson-4-3",
          "id": "lesson-4-3",
          "moduleId": "module-4",
          "moduleTitle": "Module 4 — Practical HTML",
          "courseId": "html-from-beginner-to-practical",
          "order": 22,
          "title": "Build a Login Page",
          "slug": "build-a-login-page",
          "description": "Construct an authentic authentication login page with email, password, and remember me.",
          "learningObjective": "Implement a login screen form with email validation, password mask, and submit trigger.",
          "concept": "Login pages require clear input constraints: an email input with type=\"email\" to ensure proper address format, a password input with type=\"password\" to mask characters, an optional remember checkbox, and a prominent submit button.",
          "codeExample": "<form action=\"/login\" method=\"POST\">\n  <h1>Login</h1>\n  <label for=\"email\">Email</label>\n  <input type=\"email\" id=\"email\" required />\n  <label for=\"pass\">Password</label>\n  <input type=\"password\" id=\"pass\" required />\n  <button type=\"submit\">Sign In</button>\n</form>",
          "expectedOutput": "A complete login form layout ready for backend authentication.",
          "starterCode": "<!DOCTYPE html>\n<html lang=\"en\">\n<head>\n  <meta charset=\"UTF-8\">\n  <title>Login to CrackWithAI</title>\n</head>\n<body>\n  <main>\n    <h1>Welcome Back</h1>\n    <p>Sign in to continue your full stack learning journey.</p>\n    <form action=\"/api/auth/login\" method=\"POST\">\n      <p>\n        <label for=\"login-email\">Email Address</label><br />\n        <input type=\"email\" id=\"login-email\" placeholder=\"you@domain.com\" required />\n      </p>\n      <p>\n        <label for=\"login-password\">Password</label><br />\n        <input type=\"password\" id=\"login-password\" placeholder=\"Enter password\" required />\n      </p>\n      <p>\n        <label>\n          <input type=\"checkbox\" name=\"remember\" /> Remember me\n        </label>\n      </p>\n      <button type=\"submit\">Sign In</button>\n    </form>\n  </main>\n</body>\n</html>",
          "practiceTask": {
            "title": "Build a Clean Login Interface",
            "description": "Construct a login form containing title, email input, password input, remember checkbox, and login button.",
            "requirements": [
              "Include <h1> heading",
              "Include an email input with label",
              "Include a password input with label",
              "Include a submit button"
            ],
            "starterCode": "<!DOCTYPE html>\n<html>\n<body>\n  <h1>Account Login</h1>\n  <form action=\"/login\" method=\"POST\">\n    <p>\n      <label for=\"user-mail\">Email</label><br />\n      <input type=\"email\" id=\"user-mail\" required />\n    </p>\n    <p>\n      <label for=\"user-pass\">Password</label><br />\n      <input type=\"password\" id=\"user-pass\" required />\n    </p>\n    <button type=\"submit\">Log In</button>\n  </form>\n</body>\n</html>",
            "expectedOutput": "A clean login interface with validated inputs.",
            "validationRules": [
              {
                "tag": "h1",
                "minCount": 1,
                "message": "Include an <h1> heading"
              },
              {
                "tag": "form",
                "minCount": 1,
                "message": "Include a <form>"
              },
              {
                "tag": "input",
                "minCount": 2,
                "message": "Include email and password inputs"
              },
              {
                "tag": "button",
                "minCount": 1,
                "message": "Include a <button>"
              }
            ]
          }
        },
        {
          "_id": "lesson-4-4",
          "id": "lesson-4-4",
          "moduleId": "module-4",
          "moduleTitle": "Module 4 — Practical HTML",
          "courseId": "html-from-beginner-to-practical",
          "order": 23,
          "title": "Build a Registration Form",
          "slug": "build-a-registration-form",
          "description": "Create a new user signup form with name, email, password, confirm, and terms.",
          "learningObjective": "Implement full signup form with minlength password checks and terms agreement checkbox.",
          "concept": "Registration forms gather credentials for new accounts. Crucial elements include full name, email, password with minlength=\"8\", and a required checkbox agreeing to terms and conditions.",
          "codeExample": "<form action=\"/register\" method=\"POST\">\n  <input type=\"text\" placeholder=\"Name\" required />\n  <input type=\"email\" placeholder=\"Email\" required />\n  <input type=\"password\" minlength=\"8\" placeholder=\"Password\" required />\n  <label><input type=\"checkbox\" required /> Agree to Terms</label>\n  <button type=\"submit\">Register</button>\n</form>",
          "expectedOutput": "A complete registration card with inputs and agreement checkbox.",
          "starterCode": "<!DOCTYPE html>\n<html lang=\"en\">\n<head>\n  <meta charset=\"UTF-8\">\n  <title>Register Account</title>\n</head>\n<body>\n  <h1>Create Your Account</h1>\n  <form action=\"/api/auth/register\" method=\"POST\">\n    <p>\n      <label for=\"reg-name\">Full Name</label><br />\n      <input type=\"text\" id=\"reg-name\" placeholder=\"John Doe\" required />\n    </p>\n    <p>\n      <label for=\"reg-email\">Email Address</label><br />\n      <input type=\"email\" id=\"reg-email\" placeholder=\"john@example.com\" required />\n    </p>\n    <p>\n      <label for=\"reg-pass\">Password</label><br />\n      <input type=\"password\" id=\"reg-pass\" minlength=\"8\" required />\n    </p>\n    <p>\n      <label>\n        <input type=\"checkbox\" required /> I accept the Terms of Service\n      </label>\n    </p>\n    <button type=\"submit\">Create Account</button>\n  </form>\n</body>\n</html>",
          "practiceTask": {
            "title": "Complete Registration Form",
            "description": "Build a signup form with name, email, password, terms checkbox, and register button.",
            "requirements": [
              "Include text, email, password, and checkbox inputs",
              "Include at least one input with required and minlength=\"8\"",
              "Include a submit button"
            ],
            "starterCode": "<!DOCTYPE html>\n<html>\n<body>\n  <h2>Sign Up Today</h2>\n  <form action=\"/register\" method=\"POST\">\n    <p><input type=\"text\" placeholder=\"Your Name\" required /></p>\n    <p><input type=\"email\" placeholder=\"Email Address\" required /></p>\n    <p><input type=\"password\" placeholder=\"Password (8+ chars)\" minlength=\"8\" required /></p>\n    <p><label><input type=\"checkbox\" required /> I agree to the terms</label></p>\n    <button type=\"submit\">Register Now</button>\n  </form>\n</body>\n</html>",
            "expectedOutput": "A registration form enforcing browser-level validation.",
            "validationRules": [
              {
                "tag": "form",
                "minCount": 1,
                "message": "Include a <form>"
              },
              {
                "tag": "input",
                "minCount": 4,
                "message": "Include at least 4 <input> elements"
              },
              {
                "tag": "button",
                "minCount": 1,
                "message": "Include a <button>"
              }
            ]
          }
        },
        {
          "_id": "lesson-4-5",
          "id": "lesson-4-5",
          "moduleId": "module-4",
          "moduleTitle": "Module 4 — Practical HTML",
          "courseId": "html-from-beginner-to-practical",
          "order": 24,
          "title": "HTML Mini Project",
          "slug": "html-mini-project",
          "description": "Build a multi-section Personal Portfolio Landing Page combining all HTML skills.",
          "learningObjective": "Synthesize semantic containers, headings, lists, tables, media, and forms into a cohesive site.",
          "concept": "In this mini project, you will build a complete personal landing page for a web developer. It features a header navigation, about me hero section with photo, a skills list, a project experience table, and a contact section.",
          "codeExample": "<header><nav>...</nav></header><main><section>...</section><section><table>...</table></section></main><footer>...</footer>",
          "expectedOutput": "A comprehensive multi-section web portfolio document.",
          "starterCode": "<!DOCTYPE html>\n<html lang=\"en\">\n<head>\n  <meta charset=\"UTF-8\">\n  <title>Prakash - Full Stack Portfolio</title>\n</head>\n<body>\n  <header>\n    <h1>Prakash</h1>\n    <p>Full Stack Developer in Training</p>\n    <nav>\n      <a href=\"#about\">About</a> | <a href=\"#skills\">Skills</a> | <a href=\"#projects\">Projects</a> | <a href=\"#contact\">Contact</a>\n    </nav>\n  </header>\n\n  <main>\n    <section id=\"about\">\n      <h2>About Me</h2>\n      <img src=\"https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150\" alt=\"Avatar\" width=\"120\" />\n      <p>I build clean, modern web applications using full stack technologies.</p>\n    </section>\n\n    <section id=\"skills\">\n      <h2>Core Skills</h2>\n      <ul>\n        <li>HTML5 Semantics</li>\n        <li>Form Architecture</li>\n        <li>Responsive Layouts</li>\n      </ul>\n    </section>\n\n    <section id=\"projects\">\n      <h2>Projects</h2>\n      <table border=\"1\">\n        <tr><th>Project</th><th>Role</th><th>Status</th></tr>\n        <tr><td>Portfolio</td><td>Developer</td><td>Completed</td></tr>\n        <tr><td>HTML Playground</td><td>Engineer</td><td>Live</td></tr>\n      </table>\n    </section>\n\n    <section id=\"contact\">\n      <h2>Contact Me</h2>\n      <form action=\"/contact\" method=\"POST\">\n        <p><input type=\"text\" placeholder=\"Your Name\" required /></p>\n        <p><input type=\"email\" placeholder=\"Your Email\" required /></p>\n        <p><textarea placeholder=\"Your Message\" rows=\"3\" required></textarea></p>\n        <button type=\"submit\">Send Message</button>\n      </form>\n    </section>\n  </main>\n\n  <footer>\n    <p>&copy; 2026 Prakash. Built with CrackWithAI.</p>\n  </footer>\n</body>\n</html>",
          "practiceTask": {
            "title": "Your Complete Landing Page",
            "description": "Construct a full multi-section portfolio containing header, nav, image, skills list, project table, and contact form.",
            "requirements": [
              "Use semantic tags: <header>, <nav>, <main>, <section>, <footer>",
              "Include an <img> with alt attribute",
              "Include a <ul> list and a <table>",
              "Include a <form> with input, textarea, and submit button"
            ],
            "starterCode": "<!DOCTYPE html>\n<html>\n<head><title>My Portfolio</title></head>\n<body>\n  <header>\n    <h1>My Tech Portfolio</h1>\n    <nav><a href=\"#contact\">Contact</a></nav>\n  </header>\n  <main>\n    <section>\n      <h2>About Me</h2>\n      <p>I am learning Full Stack web development.</p>\n      <ul><li>HTML5</li><li>Web Design</li></ul>\n    </section>\n    <section>\n      <h2>Contact</h2>\n      <form>\n        <input type=\"text\" placeholder=\"Name\" />\n        <button type=\"submit\">Submit</button>\n      </form>\n    </section>\n  </main>\n  <footer><p>&copy; 2026</p></footer>\n</body>\n</html>",
            "expectedOutput": "A professional, multi-section web portfolio document.",
            "validationRules": [
              {
                "tag": "header",
                "minCount": 1,
                "message": "Include a <header>"
              },
              {
                "tag": "main",
                "minCount": 1,
                "message": "Include a <main>"
              },
              {
                "tag": "section",
                "minCount": 2,
                "message": "Include at least 2 <section> elements"
              },
              {
                "tag": "footer",
                "minCount": 1,
                "message": "Include a <footer>"
              },
              {
                "tag": "form",
                "minCount": 1,
                "message": "Include a <form>"
              }
            ]
          }
        },
        {
          "_id": "lesson-4-6",
          "id": "lesson-4-6",
          "moduleId": "module-4",
          "moduleTitle": "Module 4 — Practical HTML",
          "courseId": "html-from-beginner-to-practical",
          "order": 25,
          "title": "HTML Assessment & Final Project",
          "slug": "html-assessment-and-final-project",
          "description": "Comprehensive milestone evaluation demonstrating complete mastery of HTML.",
          "learningObjective": "Complete the HTML certification project meeting all structural and accessibility standards.",
          "concept": "Congratulations on reaching the final milestone of the HTML Course! To pass this assessment, you will write a complete, error-free HTML5 webpage featuring semantic layout, headings, media, tables, lists, and an interactive validated form.",
          "codeExample": "<!DOCTYPE html>\n<html lang=\"en\">\n<head>\n  <meta charset=\"UTF-8\">\n  <title>HTML Certification</title>\n</head>\n<body>\n  <!-- Full Document Implementation -->\n</body>\n</html>",
          "expectedOutput": "A flawless, fully validated HTML5 document earning the HTML Course Certificate.",
          "starterCode": "<!DOCTYPE html>\n<html lang=\"en\">\n<head>\n  <meta charset=\"UTF-8\">\n  <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">\n  <title>CrackWithAI — HTML Certification</title>\n</head>\n<body>\n  <header>\n    <h1>Full Stack Development — HTML Certification</h1>\n    <nav>\n      <a href=\"#overview\">Overview</a> | <a href=\"#curriculum\">Curriculum</a> | <a href=\"#enroll\">Enroll</a>\n    </nav>\n  </header>\n\n  <main>\n    <section id=\"overview\">\n      <h2>Course Milestone Completed</h2>\n      <p>I have mastered HTML document structures, elements, tables, and forms.</p>\n      <img src=\"https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=300\" alt=\"Full Stack Coding\" width=\"300\" />\n    </section>\n\n    <section id=\"curriculum\">\n      <h2>Topics Mastered</h2>\n      <ul>\n        <li>HTML5 Doctype & Architecture</li>\n        <li>Headings, Paragraphs & Text Formatting</li>\n        <li>Links, Images, Lists & Tables</li>\n        <li>Interactive Forms & Input Validation</li>\n        <li>Semantic Web Landmarks</li>\n      </ul>\n    </section>\n\n    <section id=\"enroll\">\n      <h2>Certification Sign-off</h2>\n      <form action=\"/api/certify\" method=\"POST\">\n        <p>\n          <label for=\"learner-name\">Student Full Name:</label><br />\n          <input type=\"text\" id=\"learner-name\" placeholder=\"Enter your name\" required />\n        </p>\n        <p>\n          <label for=\"learner-email\">Email:</label><br />\n          <input type=\"email\" id=\"learner-email\" placeholder=\"Enter your email\" required />\n        </p>\n        <button type=\"submit\">Claim HTML Certificate</button>\n      </form>\n    </section>\n  </main>\n\n  <footer>\n    <p>&copy; 2026 CrackWithAI. Certified Full Stack Developer.</p>\n  </footer>\n</body>\n</html>",
          "practiceTask": {
            "title": "Final HTML Certification Challenge",
            "description": "Build a complete, flawless webpage with semantic tags, heading hierarchy, image, list, and interactive form.",
            "requirements": [
              "Valid <!DOCTYPE html> and <html lang=\"en\">",
              "Semantic <header>, <nav>, <main>, <section>, and <footer> tags",
              "At least one <h1> and two <h2> headings",
              "An <img> element with valid alt attribute",
              "A <ul> list with at least 3 <li> items",
              "A validated <form> with label, input, and submit button"
            ],
            "starterCode": "<!DOCTYPE html>\n<html lang=\"en\">\n<head>\n  <meta charset=\"UTF-8\">\n  <title>HTML Final Project</title>\n</head>\n<body>\n  <header>\n    <h1>HTML Master Project</h1>\n    <nav><a href=\"#home\">Home</a></nav>\n  </header>\n  <main>\n    <section>\n      <h2>Overview</h2>\n      <p>Full stack web development foundation complete.</p>\n      <img src=\"https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=300\" alt=\"Code laptop\" width=\"280\" />\n      <ul>\n        <li>Semantic tags</li>\n        <li>Forms & Inputs</li>\n        <li>Clean Structure</li>\n      </ul>\n    </section>\n    <section>\n      <h2>Verification</h2>\n      <form>\n        <label for=\"sname\">Name</label><br />\n        <input type=\"text\" id=\"sname\" required />\n        <button type=\"submit\">Verify</button>\n      </form>\n    </section>\n  </main>\n  <footer>\n    <p>&copy; 2026 CrackWithAI</p>\n  </footer>\n</body>\n</html>",
            "expectedOutput": "A comprehensive, valid HTML5 capstone project.",
            "validationRules": [
              {
                "tag": "header",
                "minCount": 1,
                "message": "Include a <header>"
              },
              {
                "tag": "main",
                "minCount": 1,
                "message": "Include a <main>"
              },
              {
                "tag": "section",
                "minCount": 2,
                "message": "Include at least 2 <section> tags"
              },
              {
                "tag": "h1",
                "minCount": 1,
                "message": "Include an <h1>"
              },
              {
                "tag": "img",
                "minCount": 1,
                "message": "Include an <img>"
              },
              {
                "tag": "ul",
                "minCount": 1,
                "message": "Include a <ul>"
              },
              {
                "tag": "form",
                "minCount": 1,
                "message": "Include a <form>"
              },
              {
                "tag": "footer",
                "minCount": 1,
                "message": "Include a <footer>"
              }
            ]
          }
        }
      ]
    },
    {
      "_id": "module-3",
      "id": "module-3",
      "title": "Module 3 — CSS & Responsive Layouts",
      "slug": "module-3-css-responsive-layouts",
      "order": 3,
      "description": "Master selectors, Flexbox, CSS Grid, animations, and responsive media queries.",
      "duration": 60,
      "lessons": [
        {
          "_id": "lesson-3-1",
          "id": "lesson-3-1",
          "moduleId": "module-3",
          "moduleTitle": "Module 3 — CSS & Responsive Layouts",
          "courseId": "fullstack-web-development",
          "order": 1,
          "title": "Introduction to CSS & Selectors",
          "slug": "introduction-to-css-selectors",
          "description": "Learn element, class, and ID selectors to style webpage components.",
          "learningObjective": "Understand inline, internal, and external CSS styling and selector specificity.",
          "concept": "CSS (Cascading Style Sheets) describes how HTML elements are presented on screen. Selectors target HTML tags, classes (.class), or IDs (#id).",
          "codeExample": "h1 {\n  color: #4F46E5;\n  font-size: 24px;\n}\n.card {\n  background: #F8FAFC;\n  padding: 16px;\n  border-radius: 12px;\n}",
          "expectedOutput": "Styled heading in indigo with a rounded card container.",
          "starterCode": "<!DOCTYPE html>\n<html>\n<head>\n  <style>\n    h1 { color: #4F46E5; }\n    .box { background: #EEF2FF; padding: 15px; border-radius: 8px; }\n  </style>\n</head>\n<body>\n  <h1>CSS Styling</h1>\n  <div class=\"box\">Styled Container</div>\n</body>\n</html>",
          "practiceTask": {
            "title": "Style Your First Box",
            "description": "Create a styled card using class selectors, padding, background color, and rounded borders.",
            "requirements": ["Include a <style> block", "Define a .card class selector", "Apply background-color and padding"],
            "starterCode": "<!DOCTYPE html>\n<html>\n<head>\n  <style>\n    .card { background-color: #EEF2FF; padding: 16px; border-radius: 8px; }\n  </style>\n</head>\n<body>\n  <div class=\"card\">\n    <h2>Styled Card</h2>\n  </div>\n</body>\n</html>",
            "expectedOutput": "A clean styled card container."
          }
        },
        {
          "_id": "lesson-3-2",
          "id": "lesson-3-2",
          "moduleId": "module-3",
          "moduleTitle": "Module 3 — CSS & Responsive Layouts",
          "courseId": "fullstack-web-development",
          "order": 2,
          "title": "CSS Flexbox & Layout Alignment",
          "slug": "css-flexbox-layout-alignment",
          "description": "Build flexible 1D layouts with flex-direction, justify-content, and align-items.",
          "learningObjective": "Master Flexbox row and column alignment for modern user interfaces.",
          "concept": "Flexbox is a 1-dimensional layout module that aligns items evenly across rows or columns without floats or static positioning.",
          "codeExample": ".container {\n  display: flex;\n  justify-content: space-between;\n  align-items: center;\n}",
          "expectedOutput": "Flexibly spaced navigation bar or card grid.",
          "starterCode": "<!DOCTYPE html>\n<html>\n<head>\n  <style>\n    .flex-row { display: flex; gap: 12px; }\n    .item { background: #4F46E5; color: #FFF; padding: 10px; border-radius: 6px; }\n  </style>\n</head>\n<body>\n  <div class=\"flex-row\">\n    <div class=\"item\">Flex 1</div>\n    <div class=\"item\">Flex 2</div>\n  </div>\n</body>\n</html>",
          "practiceTask": {
            "title": "Build a Flex Navigation Bar",
            "description": "Use display: flex and justify-content: space-between to align header items.",
            "requirements": ["Set display: flex", "Use justify-content: space-between"],
            "starterCode": "<!DOCTYPE html>\n<html>\n<head>\n  <style>\n    nav { display: flex; justify-content: space-between; padding: 10px; background: #1E293B; color: #FFF; }\n  </style>\n</head>\n<body>\n  <nav>\n    <span>Logo</span>\n    <span>Menu</span>\n  </nav>\n</body>\n</html>",
            "expectedOutput": "A dark header bar with logo on left and menu on right."
          }
        }
      ]
    },
    {
      "_id": "module-4",
      "id": "module-4",
      "title": "Module 4 — Modern JavaScript (ES6+)",
      "slug": "module-4-modern-javascript-es6",
      "order": 4,
      "description": "Master const/let, arrow functions, DOM manipulation, promises, and async/await.",
      "duration": 90,
      "lessons": [
        {
          "_id": "lesson-4-1",
          "id": "lesson-4-1",
          "moduleId": "module-4",
          "moduleTitle": "Module 4 — Modern JavaScript (ES6+)",
          "courseId": "fullstack-web-development",
          "order": 1,
          "title": "Variables, Scope & ES6 Arrow Functions",
          "slug": "javascript-variables-arrow-functions",
          "description": "Learn const, let, template literals, and concise ES6 arrow functions.",
          "learningObjective": "Differentiate const vs let block scope and write clean ES6 arrow functions.",
          "concept": "ES6 introduced let and const for block-scoped variables, preventing accidental global overwrites, and arrow functions (() => {}) for concise code.",
          "codeExample": "const add = (a, b) => a + b;\nconsole.log(`Sum: ${add(5, 10)}`);",
          "expectedOutput": "Console log: Sum: 15",
          "starterCode": "<!DOCTYPE html>\n<html>\n<body>\n  <h2 id=\"out\">JS Output</h2>\n  <script>\n    const greet = name => `Hello, ${name}!`;\n    document.getElementById('out').innerText = greet('Full Stack Developer');\n  </script>\n</body>\n</html>",
          "practiceTask": {
            "title": "Write an ES6 Arrow Function",
            "description": "Create an arrow function that returns a formatted greeting string.",
            "requirements": ["Use const variable declaration", "Write an arrow function"],
            "starterCode": "<!DOCTYPE html>\n<html>\n<body>\n  <p id=\"res\"></p>\n  <script>\n    const welcome = name => `Welcome to JS, ${name}`;\n    document.getElementById('res').innerText = welcome('Learner');\n  </script>\n</body>\n</html>",
            "expectedOutput": "Paragraph populated with Welcome to JS, Learner."
          }
        },
        {
          "_id": "lesson-4-2",
          "id": "lesson-4-2",
          "moduleId": "module-4",
          "moduleTitle": "Module 4 — Modern JavaScript (ES6+)",
          "courseId": "fullstack-web-development",
          "order": 2,
          "title": "DOM Manipulation & Event Listeners",
          "slug": "javascript-dom-events",
          "description": "Select HTML elements, modify text/styles dynamically, and handle click events.",
          "learningObjective": "Use document.querySelector and addEventListener to build interactive user interfaces.",
          "concept": "The Document Object Model (DOM) connects scripts to webpage elements. addEventListener allows responding to user interaction such as button clicks.",
          "codeExample": "const btn = document.querySelector('button');\nbtn.addEventListener('click', () => alert('Clicked!'));",
          "expectedOutput": "Interactive button triggering click response.",
          "starterCode": "<!DOCTYPE html>\n<html>\n<body>\n  <button id=\"btn\">Click Me</button>\n  <p id=\"txt\">Initial text</p>\n  <script>\n    document.getElementById('btn').addEventListener('click', () => {\n      document.getElementById('txt').innerText = 'Button Clicked Successfully!';\n    });\n  </script>\n</body>\n</html>",
          "practiceTask": {
            "title": "Interactive Click Handler",
            "description": "Attach a click event listener to update paragraph content dynamically.",
            "requirements": ["Use addEventListener('click', ...)", "Update innerText"],
            "starterCode": "<!DOCTYPE html>\n<html>\n<body>\n  <button id=\"btn\">Change Text</button>\n  <p id=\"msg\">Old Message</p>\n  <script>\n    document.getElementById('btn').addEventListener('click', () => {\n      document.getElementById('msg').innerText = 'New Interactive Message!';\n    });\n  </script>\n</body>\n</html>",
            "expectedOutput": "Paragraph text changes upon button click."
          }
        }
      ]
    },
    {
      "_id": "module-5",
      "id": "module-5",
      "title": "Module 5 — Node.js Server Runtime",
      "slug": "module-5-nodejs-server-runtime",
      "order": 5,
      "description": "Execute JavaScript server-side, work with NPM, Modules, Buffer, and File System.",
      "duration": 75,
      "lessons": [
        {
          "_id": "lesson-5-1",
          "id": "lesson-5-1",
          "moduleId": "module-5",
          "moduleTitle": "Module 5 — Node.js Server Runtime",
          "courseId": "fullstack-web-development",
          "order": 1,
          "title": "Node.js Architecture & Event Loop",
          "slug": "nodejs-architecture-event-loop",
          "description": "Understand non-blocking I/O, single-threaded Event Loop, and Node modules.",
          "learningObjective": "Explain Node.js event-driven architecture and asynchronous I/O execution.",
          "concept": "Node.js uses Google Chrome V8 engine to execute JavaScript outside the browser. Its single-threaded event loop handles thousands of concurrent requests efficiently without thread blocking.",
          "codeExample": "const fs = require('fs');\nfs.readFile('data.txt', 'utf8', (err, data) => {\n  console.log('File Content:', data);\n});",
          "expectedOutput": "Asynchronous file content logged to server terminal.",
          "starterCode": "<!DOCTYPE html>\n<html>\n<body>\n  <h2>Node.js Server Concepts</h2>\n  <p>Non-blocking asynchronous server runtime.</p>\n</body>\n</html>",
          "practiceTask": {
            "title": "Understand Asynchronous I/O",
            "description": "Review Node.js asynchronous event-driven code execution pattern.",
            "requirements": ["Understand require() module imports", "Identify non-blocking callback pattern"],
            "starterCode": "<!DOCTYPE html>\n<html>\n<body>\n  <h3>Node.js Module Pattern</h3>\n  <p>Event-driven architecture powering full stack applications.</p>\n</body>\n</html>",
            "expectedOutput": "Node.js concepts verified."
          }
        }
      ]
    },
    {
      "_id": "module-6",
      "id": "module-6",
      "title": "Module 6 — Express.js Web Framework",
      "slug": "module-6-expressjs-framework",
      "order": 6,
      "description": "Build high-performance RESTful APIs, routing, middleware pipelines, and error handling.",
      "duration": 75,
      "lessons": [
        {
          "_id": "lesson-6-1",
          "id": "lesson-6-1",
          "moduleId": "module-6",
          "moduleTitle": "Module 6 — Express.js Web Framework",
          "courseId": "fullstack-web-development",
          "order": 1,
          "title": "Express Routing & Middleware",
          "slug": "express-routing-middleware",
          "description": "Define HTTP methods (GET, POST, PUT, DELETE) and middleware functions.",
          "learningObjective": "Create Express app routes, parse JSON request body, and use custom middleware.",
          "concept": "Express.js is a minimal and flexible Node.js web application framework providing robust routing and middleware capabilities for building REST APIs.",
          "codeExample": "const express = require('express');\nconst app = express();\napp.use(express.json());\napp.get('/api/users', (req, res) => res.json([{ id: 1, name: 'Learner' }]));\napp.listen(5001);",
          "expectedOutput": "JSON response endpoint returning user list on port 5001.",
          "starterCode": "<!DOCTYPE html>\n<html>\n<body>\n  <h2>Express REST API</h2>\n  <p>GET, POST, PUT, DELETE endpoints with JSON payloads.</p>\n</body>\n</html>",
          "practiceTask": {
            "title": "Express Endpoint Concepts",
            "description": "Understand route parameters, request query string, and JSON responses.",
            "requirements": ["Define GET endpoint route", "Return JSON response"],
            "starterCode": "<!DOCTYPE html>\n<html>\n<body>\n  <h3>Express API Routing</h3>\n  <p>Fast server framework for full stack web development.</p>\n</body>\n</html>",
            "expectedOutput": "Express API structure verified."
          }
        }
      ]
    },
    {
      "_id": "module-7",
      "id": "module-7",
      "title": "Module 7 — MongoDB & Mongoose ODM",
      "slug": "module-7-mongodb-mongoose",
      "order": 7,
      "description": "Store JSON documents, define Mongoose Schemas, models, queries, and JWT auth security.",
      "duration": 90,
      "lessons": [
        {
          "_id": "lesson-7-1",
          "id": "lesson-7-1",
          "moduleId": "module-7",
          "moduleTitle": "Module 7 — MongoDB & Mongoose ODM",
          "courseId": "fullstack-web-development",
          "order": 1,
          "title": "NoSQL Schemas, Mongoose & JWT Auth",
          "slug": "mongodb-mongoose-jwt-auth",
          "description": "Model database collections with Mongoose and secure routes using JWT tokens.",
          "learningObjective": "Define User schemas, hash passwords with bcrypt, and verify JWT auth headers.",
          "concept": "MongoDB is a NoSQL document database. Mongoose provides a straight-forward, schema-based solution to model application data, validate fields, and execute CRUD operations.",
          "codeExample": "const mongoose = require('mongoose');\nconst UserSchema = new mongoose.Schema({ name: String, email: { type: String, unique: true } });\nconst User = mongoose.model('User', UserSchema);",
          "expectedOutput": "Validated Mongoose User model with unique index.",
          "starterCode": "<!DOCTYPE html>\n<html>\n<body>\n  <h2>MongoDB & Authentication</h2>\n  <p>Document database storage with JWT session security.</p>\n</body>\n</html>",
          "practiceTask": {
            "title": "Mongoose Schema Design",
            "description": "Design a Mongoose schema for User profile data including name, email, and password.",
            "requirements": ["Define schema fields", "Set required validation"],
            "starterCode": "<!DOCTYPE html>\n<html>\n<body>\n  <h3>Mongoose Database Schema</h3>\n  <p>Schema validation and secure document storage.</p>\n</body>\n</html>",
            "expectedOutput": "MongoDB Schema concept verified."
          }
        }
      ]
    },
    {
      "_id": "module-8",
      "id": "module-8",
      "title": "Module 8 — Final Full Stack Capstone Project",
      "slug": "module-8-final-fullstack-capstone",
      "order": 8,
      "description": "Connect HTML, CSS, JavaScript, Node, Express, MongoDB, and Auth into a complete production deployment.",
      "duration": 120,
      "lessons": [
        {
          "_id": "lesson-8-1",
          "id": "lesson-8-1",
          "moduleId": "module-8",
          "moduleTitle": "Module 8 — Final Full Stack Capstone Project",
          "courseId": "fullstack-web-development",
          "order": 1,
          "title": "Full Stack Capstone Architecture & Deployment",
          "slug": "fullstack-capstone-architecture-deployment",
          "description": "Architect client-side views, REST API controllers, MongoDB models, and production deployment.",
          "learningObjective": "Integrate end-to-end full stack architecture and pass final capstone verification.",
          "concept": "A production Full Stack application brings together HTML structure, CSS styling, JavaScript interactivity, Node/Express backend APIs, and MongoDB database persistence.",
          "codeExample": "/* Production Full Stack Web Application Capstone */\nconsole.log('Full Stack Web Developer Capstone Deployed Successfully!');",
          "expectedOutput": "Complete production Web Application end-to-end deployment.",
          "starterCode": "<!DOCTYPE html>\n<html lang=\"en\">\n<head>\n  <meta charset=\"UTF-8\">\n  <title>Full Stack Capstone</title>\n</head>\n<body>\n  <header><h1>Full Stack Capstone Project</h1></header>\n  <main><p>HTML + CSS + JS + Node + Express + MongoDB = Production App</p></main>\n</body>\n</html>",
          "practiceTask": {
            "title": "Final Full Stack Capstone",
            "description": "Verify your full stack mastery across client, server, database, and authentication.",
            "requirements": ["Semantic HTML5 structure", "Styled layout", "API integration ready"],
            "starterCode": "<!DOCTYPE html>\n<html>\n<body>\n  <h2>Full Stack Capstone Completed!</h2>\n  <p>Congratulations on completing the Full Stack Web Development course!</p>\n</body>\n</html>",
            "expectedOutput": "Full Stack Web Development Capstone complete."
          }
        }
      ]
    }
  ],
  "totalLessons": 32,
  "completedLessons": 0,
  "progressPercentage": 0
};

export const FALLBACK_HTML_MODULES: HtmlModule[] = FALLBACK_HTML_COURSE.modules;
export const FALLBACK_HTML_LESSONS: HtmlLesson[] = FALLBACK_HTML_COURSE.modules.flatMap(m => m.lessons);

// ==========================================
// CSS3 COURSE DATA
// ==========================================
export const FALLBACK_CSS_COURSE: HtmlCourse = {
  _id: 'css-course',
  id: 'css-course',
  title: 'CSS3 — Styling & Responsive Layouts',
  slug: 'css3-styling-responsive-layouts',
  description: 'Master CSS selectors, colors, Box Model, Flexbox, Grid, keyframe animations, and modern responsive design.',
  category: 'Full Stack Frontend',
  level: 'Beginner to Intermediate',
  totalLessons: 18,
  totalModules: 3,
  duration: 180,
  modules: [
    {
      _id: 'css-mod-1',
      id: 'css-mod-1',
      title: 'Module 1 — CSS Selectors, Colors & Box Model',
      slug: 'css-selectors-colors-box-model',
      order: 1,
      description: 'Learn element styling, specificity, margin, padding, borders, and box-sizing.',
      duration: 60,
      lessons: [
        {
          _id: 'css-les-1-1',
          id: 'css-les-1-1',
          moduleId: 'css-mod-1',
          moduleTitle: 'Module 1 — CSS Selectors, Colors & Box Model',
          courseId: 'css3-course',
          order: 1,
          title: 'Introduction to CSS & Selectors',
          slug: 'intro-to-css-selectors',
          description: 'Learn how CSS connects to HTML elements via class, id, and tag selectors.',
          learningObjective: 'Apply CSS styles to HTML elements using class, id, and descendant selectors.',
          concept: 'CSS (Cascading Style Sheets) formats the presentation of HTML elements. Use class selectors (.btn) for reusable styles and ID selectors (#header) for unique elements.',
          codeExample: 'h1 { color: #5653fe; font-family: sans-serif; }\n.card { padding: 20px; border-radius: 12px; }',
          expectedOutput: 'Styled header text and rounded card element.',
          starterCode: '<!DOCTYPE html>\n<html>\n<head>\n<style>\n  h1 { color: #5653fe; font-family: sans-serif; }\n  .box { padding: 20px; background: #EEEDFF; border-radius: 12px; }\n</style>\n</head>\n<body>\n  <h1>CSS Styling</h1>\n  <div class="box">Styled Box Content</div>\n</body>\n</html>',
          practiceTask: {
            title: 'CSS Selector Practice',
            description: 'Apply a background color and padding to the card element using class selectors.',
            requirements: ['Add .card class style', 'Set padding to 16px', 'Set border-radius to 10px'],
            starterCode: '<!DOCTYPE html>\n<html>\n<head>\n<style>\n  /* Add styles here */\n</style>\n</head>\n<body>\n  <div class="card">My Styled Card</div>\n</body>\n</html>',
            expectedOutput: 'Card styled with background and rounded borders.'
          }
        },
        {
          _id: 'css-les-1-2',
          id: 'css-les-1-2',
          moduleId: 'css-mod-1',
          moduleTitle: 'Module 1 — CSS Selectors, Colors & Box Model',
          courseId: 'css3-course',
          order: 2,
          title: 'The CSS Box Model',
          slug: 'css-box-model',
          description: 'Understand content, padding, border, margin, and box-sizing: border-box.',
          learningObjective: 'Control layout dimensions accurately using box-sizing: border-box.',
          concept: 'Every HTML element is a rectangular box consisting of Content, Padding, Border, and Margin. Setting box-sizing: border-box ensures width includes padding and border.',
          codeExample: '* { box-sizing: border-box; }\n.container { width: 300px; padding: 20px; border: 2px solid #333; }',
          expectedOutput: 'Box model sizing calculated correctly.',
          starterCode: '<!DOCTYPE html>\n<html>\n<head>\n<style>\n  * { box-sizing: border-box; }\n  .box { width: 200px; padding: 20px; border: 4px solid #5653fe; margin: 10px; background: #F1F5F9; }\n</style>\n</head>\n<body>\n  <div class="box">Box Model Demo</div>\n</body>\n</html>',
          practiceTask: {
            title: 'Box Model Layout',
            description: 'Set margin, padding, and border-box sizing on container divs.',
            requirements: ['Set box-sizing: border-box', 'Add 15px padding'],
            starterCode: '<!DOCTYPE html>\n<html>\n<body>\n  <div>Box Model Exercise</div>\n</body>\n</html>',
            expectedOutput: 'Box model applied correctly.'
          }
        }
      ]
    },
    {
      _id: 'css-mod-2',
      id: 'css-mod-2',
      title: 'Module 2 — Flexbox & CSS Grid Layouts',
      slug: 'flexbox-css-grid-layouts',
      order: 2,
      description: 'Master 1D and 2D layout systems for modern responsive user interfaces.',
      duration: 75,
      lessons: [
        {
          _id: 'css-les-2-1',
          id: 'css-les-2-1',
          moduleId: 'css-mod-2',
          moduleTitle: 'Module 2 — Flexbox & CSS Grid Layouts',
          courseId: 'css3-course',
          order: 1,
          title: 'Flexbox Architecture & Alignment',
          slug: 'flexbox-architecture-alignment',
          description: 'Align elements effortlessly using display: flex, justify-content, and align-items.',
          learningObjective: 'Build flex layouts with center alignment and responsive wrapping.',
          concept: 'Flexbox provides efficient layout alignment. Use display: flex on container, justify-content for main-axis alignment, and align-items for cross-axis alignment.',
          codeExample: '.flex-row { display: flex; justify-content: space-between; align-items: center; }',
          expectedOutput: 'Flex container with spaced items.',
          starterCode: '<!DOCTYPE html>\n<html>\n<head>\n<style>\n  .nav { display: flex; justify-content: space-between; align-items: center; background: #1E1B4B; padding: 15px; color: white; }\n</style>\n</head>\n<body>\n  <div class="nav"><span>Logo</span><span>Home</span><span>Contact</span></div>\n</body>\n</html>',
          practiceTask: {
            title: 'Flex Navigation Bar',
            description: 'Build a flexbox navbar with logo on the left and menu on the right.',
            requirements: ['display: flex', 'justify-content: space-between'],
            starterCode: '<!DOCTYPE html>\n<html>\n<body>\n  <nav><div>Logo</div><div>Menu</div></nav>\n</body>\n</html>',
            expectedOutput: 'Flex navbar aligned successfully.'
          }
        }
      ]
    },
    {
      _id: 'css-mod-3',
      id: 'css-mod-3',
      title: 'Module 3 — Responsive Media Queries & Animations',
      slug: 'responsive-media-queries-animations',
      order: 3,
      description: 'Adapt layouts to mobile screens and add smooth hover transitions and animations.',
      duration: 60,
      lessons: [
        {
          _id: 'css-les-3-1',
          id: 'css-les-3-1',
          moduleId: 'css-mod-3',
          moduleTitle: 'Module 3 — Responsive Media Queries & Animations',
          courseId: 'css3-course',
          order: 1,
          title: 'Media Queries & Mobile Breakpoints',
          slug: 'media-queries-mobile-breakpoints',
          description: 'Use @media rules to change styles based on screen width.',
          learningObjective: 'Write responsive CSS for mobile, tablet, and desktop screens.',
          concept: 'Media queries (@media (max-width: 768px)) allow your stylesheet to apply different CSS rules depending on device viewport dimensions.',
          codeExample: '@media (max-width: 768px) { .sidebar { display: none; } .content { width: 100%; } }',
          expectedOutput: 'Layout adapts when screen size changes.',
          starterCode: '<!DOCTYPE html>\n<html>\n<head>\n<style>\n  .box { background: lightblue; padding: 20px; }\n  @media (max-width: 600px) { .box { background: lightcoral; } }\n</style>\n</head>\n<body>\n  <div class="box">Resize screen to test media query</div>\n</body>\n</html>',
          practiceTask: {
            title: 'Mobile Responsive Query',
            description: 'Add a media query for max-width 600px.',
            requirements: ['Add @media query', 'Change flex-direction to column'],
            starterCode: '<!DOCTYPE html>\n<html><body><div class="grid">Responsive Grid</div></body></html>',
            expectedOutput: 'Responsive styles triggered.'
          }
        }
      ]
    }
  ]
};

// ==========================================
// JAVASCRIPT COURSE DATA
// ==========================================
export const FALLBACK_JS_COURSE: HtmlCourse = {
  _id: 'js-course',
  id: 'js-course',
  title: 'JavaScript — Interactivity & Modern ES6+ Logic',
  slug: 'javascript-interactivity-es6-logic',
  description: 'Master JS variables, arrow functions, DOM manipulation, async/await, and API integration.',
  category: 'Full Stack Frontend',
  level: 'Intermediate',
  totalLessons: 20,
  totalModules: 3,
  duration: 180,
  modules: [
    {
      _id: 'js-mod-1',
      id: 'js-mod-1',
      title: 'Module 1 — JS Variables, ES6 & Control Flow',
      slug: 'js-variables-es6-control-flow',
      order: 1,
      description: 'Learn let/const, template literals, arrow functions, and array methods.',
      duration: 60,
      lessons: [
        {
          _id: 'js-les-1-1',
          id: 'js-les-1-1',
          moduleId: 'js-mod-1',
          moduleTitle: 'Module 1 — JS Variables, ES6 & Control Flow',
          courseId: 'js-course',
          order: 1,
          title: 'Modern ES6 Syntax & Arrow Functions',
          slug: 'modern-es6-arrow-functions',
          description: 'Use let, const, arrow functions, and destructuring.',
          learningObjective: 'Write clean modern JavaScript using arrow functions and template literals.',
          concept: 'ES6 introduced let/const for block-scoped variables, arrow functions (() => {}) for concise syntax, and template literals (`Hello ${name}`) for string interpolation.',
          codeExample: 'const greet = (name) => `Welcome to Full Stack JS, ${name}!`;\nconsole.log(greet("Prakash"));',
          expectedOutput: 'Welcome to Full Stack JS, Prakash!',
          starterCode: '<!DOCTYPE html>\n<html>\n<body>\n  <h2 id="output">JS Output</h2>\n  <script>\n    const greet = (name) => `Hello, ${name}!`;\n    document.getElementById("output").innerText = greet("Developer");\n  </script>\n</body>\n</html>',
          practiceTask: {
            title: 'Arrow Function Practice',
            description: 'Write an arrow function that takes two numbers and returns their sum.',
            requirements: ['Use const arrow function syntax', 'Return sum of inputs'],
            starterCode: '<!DOCTYPE html>\n<html><body><script>\n  // Write add function here\n</script></body></html>',
            expectedOutput: 'Sum calculated correctly.'
          }
        }
      ]
    },
    {
      _id: 'js-mod-2',
      id: 'js-mod-2',
      title: 'Module 2 — DOM Manipulation & Event Handling',
      slug: 'dom-manipulation-event-handling',
      order: 2,
      description: 'Select elements, listen for click events, and dynamically update webpage UI.',
      duration: 75,
      lessons: [
        {
          _id: 'js-les-2-1',
          id: 'js-les-2-1',
          moduleId: 'js-mod-2',
          moduleTitle: 'Module 2 — DOM Manipulation & Event Handling',
          courseId: 'js-course',
          order: 1,
          title: 'Selecting Elements & Event Listeners',
          slug: 'selecting-elements-event-listeners',
          description: 'Use querySelector and addEventListener to build interactive web apps.',
          learningObjective: 'Attach event listeners to buttons and modify DOM text content on click.',
          concept: 'The Document Object Model (DOM) represents your HTML structure as objects. Use document.querySelector() to find elements and element.addEventListener("click", callback) to respond to user actions.',
          codeExample: 'const btn = document.querySelector("#btn");\nbtn.addEventListener("click", () => alert("Clicked!"));',
          expectedOutput: 'Interactive button event triggered.',
          starterCode: '<!DOCTYPE html>\n<html>\n<body>\n  <button id="clickBtn">Click Me</button>\n  <p id="msg">Initial Message</p>\n  <script>\n    document.getElementById("clickBtn").addEventListener("click", () => {\n      document.getElementById("msg").innerText = "Button Was Clicked!";\n    });\n  </script>\n</body>\n</html>',
          practiceTask: {
            title: 'Click Counter',
            description: 'Build a button that increments a counter number on every click.',
            requirements: ['addEventListener("click")', 'Update text content'],
            starterCode: '<!DOCTYPE html>\n<html><body><button id="btn">Increment</button><span id="count">0</span></body></html>',
            expectedOutput: 'Counter increments on click.'
          }
        }
      ]
    },
    {
      _id: 'js-mod-3',
      id: 'js-mod-3',
      title: 'Module 3 — Async JS, Promises & Fetch API',
      slug: 'async-js-promises-fetch-api',
      order: 3,
      description: 'Fetch data from backend REST APIs using async/await and handle HTTP responses.',
      duration: 90,
      lessons: [
        {
          _id: 'js-les-3-1',
          id: 'js-les-3-1',
          moduleId: 'js-mod-3',
          moduleTitle: 'Module 3 — Async JS, Promises & Fetch API',
          courseId: 'js-course',
          order: 1,
          title: 'Fetching Data with Async/Await',
          slug: 'fetching-data-async-await',
          description: 'Retrieve JSON data from server APIs asynchronously.',
          learningObjective: 'Use fetch() with async/await to load server data into the DOM.',
          concept: 'JavaScript is single-threaded. Asynchronous operations like fetching network requests use Promises and async/await syntax so the browser UI does not freeze during HTTP calls.',
          codeExample: 'async function loadData() {\n  const res = await fetch("/api/courses");\n  const data = await res.json();\n  console.log(data);\n}',
          expectedOutput: 'JSON response parsed successfully.',
          starterCode: '<!DOCTYPE html>\n<html>\n<body>\n  <h2>Async API Fetch</h2>\n  <p id="data">Loading API...</p>\n  <script>\n    async function fetchDemo() {\n      document.getElementById("data").innerText = "Data Loaded Successfully!";\n    }\n    fetchDemo();\n  </script>\n</body>\n</html>',
          practiceTask: {
            title: 'Async Fetch Task',
            description: 'Write an async function that fetches and logs JSON data.',
            requirements: ['Use async/await', 'Parse JSON response'],
            starterCode: '<!DOCTYPE html>\n<html><body><script>// Async fetch task</script></body></html>',
            expectedOutput: 'Async data fetched.'
          }
        }
      ]
    }
  ]
};

// ==========================================
// NODE.JS COURSE DATA
// ==========================================
export const FALLBACK_NODE_COURSE: HtmlCourse = {
  _id: 'node-course',
  id: 'node-course',
  title: 'Node.js — Server-side JavaScript Runtime',
  slug: 'nodejs-server-side-runtime',
  description: 'Execute JavaScript on servers, process files, manage Streams, and build CLI utilities.',
  category: 'Full Stack Backend',
  level: 'Intermediate',
  totalLessons: 15,
  totalModules: 3,
  duration: 180,
  modules: [
    {
      _id: 'node-mod-1',
      id: 'node-mod-1',
      title: 'Module 1 — Node.js Architecture & Module System',
      slug: 'node-architecture-modules',
      order: 1,
      description: 'Understand V8 engine, CommonJS require vs ES import, and process global object.',
      duration: 60,
      lessons: [
        {
          _id: 'node-les-1-1',
          id: 'node-les-1-1',
          moduleId: 'node-mod-1',
          moduleTitle: 'Module 1 — Node.js Architecture & Module System',
          courseId: 'node-course',
          order: 1,
          title: 'Node.js Fundamentals & Event Loop',
          slug: 'node-fundamentals-event-loop',
          description: 'Learn how Node runs non-blocking I/O operations via the Event Loop.',
          learningObjective: 'Understand asynchronous non-blocking single-threaded execution in Node.js.',
          concept: 'Node.js uses Google Chrome V8 engine to execute JavaScript on servers. Its Event Loop delegates I/O tasks to libuv worker pools for ultra-fast non-blocking performance.',
          codeExample: 'const fs = require("fs");\nconsole.log("Start");\nfs.readFile("file.txt", "utf8", (err, data) => console.log(data));\nconsole.log("End");',
          expectedOutput: 'Output order: Start -> End -> Async file content.',
          starterCode: '<!DOCTYPE html>\n<html>\n<body>\n  <h2>Node.js Server Runtime</h2>\n  <p>Non-blocking asynchronous event loop architecture.</p>\n</body>\n</html>',
          practiceTask: {
            title: 'Node Module Import',
            description: 'Import built-in modules using require syntax.',
            requirements: ['require("path")', 'Log resolved path'],
            starterCode: '<!DOCTYPE html>\n<html><body><p>Node Module Exercise</p></body></html>',
            expectedOutput: 'Module imported successfully.'
          }
        }
      ]
    },
    {
      _id: 'node-mod-2',
      id: 'node-mod-2',
      title: 'Module 2 — File System & Stream Processing',
      slug: 'file-system-streams',
      order: 2,
      description: 'Read, write, update, and stream large files efficiently.',
      duration: 60,
      lessons: [
        {
          _id: 'node-les-2-1',
          id: 'node-les-2-1',
          moduleId: 'node-mod-2',
          moduleTitle: 'Module 2 — File System & Stream Processing',
          courseId: 'node-course',
          order: 1,
          title: 'Working with fs and Streams',
          slug: 'fs-and-streams',
          description: 'Handle file read/write operations and stream data packets.',
          learningObjective: 'Write files asynchronously using fs.promises API.',
          concept: 'The fs module allows Node applications to interact with the local operating system file system asynchronously.',
          codeExample: 'const fs = require("fs/promises");\nawait fs.writeFile("output.json", JSON.stringify({ status: "ok" }));',
          expectedOutput: 'File output.json created successfully.',
          starterCode: '<!DOCTYPE html>\n<html><body><h2>Node File System</h2><p>Asynchronous fs file operations.</p></body></html>',
          practiceTask: {
            title: 'File Writer Task',
            description: 'Write JSON data to a file using fs promises.',
            requirements: ['fs.writeFile', 'JSON.stringify'],
            starterCode: '<!DOCTYPE html>\n<html><body><p>fs task</p></body></html>',
            expectedOutput: 'File written.'
          }
        }
      ]
    }
  ]
};

// ==========================================
// EXPRESS.JS COURSE DATA
// ==========================================
export const FALLBACK_EXPRESS_COURSE: HtmlCourse = {
  _id: 'express-course',
  id: 'express-course',
  title: 'Express.js — Fast Backend Web Framework',
  slug: 'expressjs-backend-framework',
  description: 'Build REST APIs, configure middleware, handle HTTP methods, and format JSON server responses.',
  category: 'Full Stack Backend',
  level: 'Intermediate',
  totalLessons: 15,
  totalModules: 3,
  duration: 180,
  modules: [
    {
      _id: 'exp-mod-1',
      id: 'exp-mod-1',
      title: 'Module 1 — Express Routing & Controllers',
      slug: 'express-routing-controllers',
      order: 1,
      description: 'Create Express app, handle GET/POST routes, and parse request parameters.',
      duration: 60,
      lessons: [
        {
          _id: 'exp-les-1-1',
          id: 'exp-les-1-1',
          moduleId: 'exp-mod-1',
          moduleTitle: 'Module 1 — Express Routing & Controllers',
          courseId: 'express-course',
          order: 1,
          title: 'Creating Express App & API Routes',
          slug: 'creating-express-app-routes',
          description: 'Set up an Express server and define GET/POST endpoints.',
          learningObjective: 'Build a functional Express server listening on port 5001.',
          concept: 'Express is a minimal web application framework for Node.js. It simplifies routing HTTP requests (GET, POST, PUT, DELETE) and returning JSON data.',
          codeExample: 'const express = require("express");\nconst app = express();\napp.get("/api/courses", (req, res) => res.json([{ id: 1, title: "Full Stack" }]));\napp.listen(5001);',
          expectedOutput: 'Express API running on port 5001.',
          starterCode: '<!DOCTYPE html>\n<html><body><h2>Express.js API Framework</h2><p>RESTful endpoints and HTTP request routing.</p></body></html>',
          practiceTask: {
            title: 'Express Route Creation',
            description: 'Define a GET /api/health route that returns status ok.',
            requirements: ['app.get("/api/health")', 'res.json({ status: "ok" })'],
            starterCode: '<!DOCTYPE html>\n<html><body><p>Express Route Exercise</p></body></html>',
            expectedOutput: 'Route returns JSON status ok.'
          }
        }
      ]
    },
    {
      _id: 'exp-mod-2',
      id: 'exp-mod-2',
      title: 'Module 2 — Middleware & Request Body Parsing',
      slug: 'middleware-request-parsing',
      order: 2,
      description: 'Use express.json(), body-parser, and custom logging middleware functions.',
      duration: 60,
      lessons: [
        {
          _id: 'exp-les-2-1',
          id: 'exp-les-2-1',
          moduleId: 'exp-mod-2',
          moduleTitle: 'Module 2 — Middleware & Request Body Parsing',
          courseId: 'express-course',
          order: 1,
          title: 'Understanding Express Middleware',
          slug: 'express-middleware-functions',
          description: 'Execute code, modify request/response objects, and end request-response cycle.',
          learningObjective: 'Write custom middleware for logging HTTP requests.',
          concept: 'Middleware functions have access to req, res, and next. Calling next() passes control to the next handler in the execution pipeline.',
          codeExample: 'app.use((req, res, next) => { console.log(`${req.method} ${req.url}`); next(); });',
          expectedOutput: 'HTTP request logged in console.',
          starterCode: '<!DOCTYPE html>\n<html><body><h2>Express Middleware</h2><p>Request pipeline interception.</p></body></html>',
          practiceTask: {
            title: 'Middleware Logger',
            description: 'Create a middleware function that logs timestamps.',
            requirements: ['Use app.use()', 'Call next()'],
            starterCode: '<!DOCTYPE html>\n<html><body><p>Middleware task</p></body></html>',
            expectedOutput: 'Middleware executed.'
          }
        }
      ]
    }
  ]
};

// ==========================================
// MONGODB COURSE DATA
// ==========================================
export const FALLBACK_MONGO_COURSE: HtmlCourse = {
  _id: 'mongo-course',
  id: 'mongo-course',
  title: 'MongoDB — NoSQL Database & Mongoose ODM',
  slug: 'mongodb-nosql-mongoose-odm',
  description: 'Design JSON schemas, execute MongoDB queries, build Mongoose models, and run aggregations.',
  category: 'Full Stack Database',
  level: 'Intermediate',
  totalLessons: 15,
  totalModules: 3,
  duration: 180,
  modules: [
    {
      _id: 'mongo-mod-1',
      id: 'mongo-mod-1',
      title: 'Module 1 — Documents, Collections & Mongoose Schemas',
      slug: 'documents-collections-mongoose-schemas',
      order: 1,
      description: 'Model application data with Mongoose schemas, types, and field validation.',
      duration: 60,
      lessons: [
        {
          _id: 'mongo-les-1-1',
          id: 'mongo-les-1-1',
          moduleId: 'mongo-mod-1',
          moduleTitle: 'Module 1 — Documents, Collections & Mongoose Schemas',
          courseId: 'mongo-course',
          order: 1,
          title: 'Designing Mongoose Schemas',
          slug: 'designing-mongoose-schemas',
          description: 'Define collection schemas, required fields, and unique indexes.',
          learningObjective: 'Create a Mongoose model for User accounts with schema validation.',
          concept: 'MongoDB stores data in flexible JSON-like BSON documents. Mongoose provides schema validation and ODM convenience methods for Node.js applications.',
          codeExample: 'const mongoose = require("mongoose");\nconst schema = new mongoose.Schema({ email: { type: String, required: true, unique: true } });\nconst User = mongoose.model("User", schema);',
          expectedOutput: 'Validated Mongoose User model ready.',
          starterCode: '<!DOCTYPE html>\n<html><body><h2>MongoDB & Mongoose Schema</h2><p>Document-oriented database persistence.</p></body></html>',
          practiceTask: {
            title: 'Schema Validation Task',
            description: 'Define a Mongoose schema for Course items.',
            requirements: ['title: String', 'price: Number'],
            starterCode: '<!DOCTYPE html>\n<html><body><p>Schema Task</p></body></html>',
            expectedOutput: 'Mongoose schema defined.'
          }
        }
      ]
    },
    {
      _id: 'mongo-mod-2',
      id: 'mongo-mod-2',
      title: 'Module 2 — Mongoose CRUD Operations & Queries',
      slug: 'mongoose-crud-operations',
      order: 2,
      description: 'Perform find(), findOne(), findOneAndUpdate(), and deleteOne() queries.',
      duration: 60,
      lessons: [
        {
          _id: 'mongo-les-2-1',
          id: 'mongo-les-2-1',
          moduleId: 'mongo-mod-2',
          moduleTitle: 'Module 2 — Mongoose CRUD Operations & Queries',
          courseId: 'mongo-course',
          order: 1,
          title: 'Executing Database CRUD Queries',
          slug: 'executing-database-crud-queries',
          description: 'Create, read, update, and delete documents in MongoDB collections.',
          learningObjective: 'Query MongoDB documents using Mongoose findOne() and find().',
          concept: 'Use User.create() to insert documents, User.find() to query matching documents, and User.findOneAndUpdate() to update records atomically.',
          codeExample: 'const user = await User.findOne({ email: "p8012969119@gmail.com" });\nconsole.log(user.fullName);',
          expectedOutput: 'Document retrieved from MongoDB.',
          starterCode: '<!DOCTYPE html>\n<html><body><h2>MongoDB CRUD</h2><p>Find, insert, update, and delete document operations.</p></body></html>',
          practiceTask: {
            title: 'Mongoose Query Task',
            description: 'Write a findOne query to fetch a user by email.',
            requirements: ['User.findOne()', 'Handle promise with async/await'],
            starterCode: '<!DOCTYPE html>\n<html><body><p>CRUD Task</p></body></html>',
            expectedOutput: 'Document found.'
          }
        }
      ]
    }
  ]
};

// ==========================================
// REST API & AUTH COURSE DATA
// ==========================================
export const FALLBACK_REST_COURSE: HtmlCourse = {
  _id: 'rest-course',
  id: 'rest-course',
  title: 'REST API & Authentication — JWT & Security',
  slug: 'rest-api-authentication-jwt-security',
  description: 'Design RESTful API contracts, bcrypt password hashing, JWT session security, and protected routes.',
  category: 'Full Stack Security',
  level: 'Advanced',
  totalLessons: 12,
  totalModules: 2,
  duration: 180,
  modules: [
    {
      _id: 'rest-mod-1',
      id: 'rest-mod-1',
      title: 'Module 1 — Password Hashing & JWT Token Signing',
      slug: 'password-hashing-jwt-signing',
      order: 1,
      description: 'Hash user passwords with bcrypt and sign JWT tokens upon login.',
      duration: 60,
      lessons: [
        {
          _id: 'rest-les-1-1',
          id: 'rest-les-1-1',
          moduleId: 'rest-mod-1',
          moduleTitle: 'Module 1 — Password Hashing & JWT Token Signing',
          courseId: 'rest-course',
          order: 1,
          title: 'Bcrypt Password Hashing & Verification',
          slug: 'bcrypt-password-hashing',
          description: 'Store salted password hashes and verify login credentials securely.',
          learningObjective: 'Hash user passwords before saving to MongoDB and verify with bcrypt.compare.',
          concept: 'Never store plain text passwords. bcrypt adds a unique salt and high cost factor to prevent rainbow table attacks. Use bcrypt.hash and bcrypt.compare for secure user auth.',
          codeExample: 'const hashedPassword = await bcrypt.hash(password, 10);\nconst isMatch = await bcrypt.compare(password, user.password);',
          expectedOutput: 'Password hashed and verified successfully.',
          starterCode: '<!DOCTYPE html>\n<html><body><h2>JWT & Bcrypt Authentication</h2><p>Password hashing and stateless session security.</p></body></html>',
          practiceTask: {
            title: 'Bcrypt Hashing Task',
            description: 'Write code to hash a password with cost factor 10.',
            requirements: ['bcrypt.hash()', 'Verify hash match'],
            starterCode: '<!DOCTYPE html>\n<html><body><p>Auth task</p></body></html>',
            expectedOutput: 'Password hashed.'
          }
        }
      ]
    }
  ]
};

// ==========================================
// CAPSTONE COURSE DATA
// ==========================================
export const FALLBACK_CAPSTONE_COURSE: HtmlCourse = {
  _id: 'capstone-course',
  id: 'capstone-course',
  title: 'Full Stack Capstone — End-to-End Production App',
  slug: 'fullstack-capstone-production-app',
  description: 'Connect HTML, CSS, JavaScript, Node, Express, MongoDB, and Auth into a complete deployed capstone project.',
  category: 'Full Stack Capstone',
  level: 'Advanced',
  totalLessons: 10,
  totalModules: 2,
  duration: 180,
  modules: [
    {
      _id: 'cap-mod-1',
      id: 'cap-mod-1',
      title: 'Module 1 — Production Full Stack Capstone Deployment',
      slug: 'production-fullstack-capstone-deployment',
      order: 1,
      description: 'Build, test, and deploy a complete production-grade web application.',
      duration: 120,
      lessons: [
        {
          _id: 'cap-les-1-1',
          id: 'cap-les-1-1',
          moduleId: 'cap-mod-1',
          moduleTitle: 'Module 1 — Production Full Stack Capstone Deployment',
          courseId: 'capstone-course',
          order: 1,
          title: 'End-to-End Capstone Architecture',
          slug: 'end-to-end-capstone-architecture',
          description: 'Architect client views, REST API controllers, MongoDB models, and production deployment.',
          learningObjective: 'Integrate full stack client, server, database, and authentication into a deployed capstone project.',
          concept: 'A production Full Stack application brings together HTML structure, CSS styling, JavaScript interactivity, Node/Express backend APIs, and MongoDB database persistence.',
          codeExample: 'console.log("Production Full Stack Web Developer Capstone Deployed Successfully!");',
          expectedOutput: 'Complete production Web Application deployed.',
          starterCode: '<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="UTF-8">\n  <title>Full Stack Capstone</title>\n</head>\n<body>\n  <header><h1>Full Stack Capstone Project</h1></header>\n  <main><p>HTML + CSS + JS + Node + Express + MongoDB = Production App</p></main>\n</body>\n</html>',
          practiceTask: {
            title: 'Capstone Verification',
            description: 'Verify your full stack application architecture.',
            requirements: ['HTML5 semantic structure', 'Styled layout', 'REST API ready'],
            starterCode: '<!DOCTYPE html>\n<html><body><h2>Full Stack Capstone Complete!</h2></body></html>',
            expectedOutput: 'Capstone complete.'
          }
        }
      ]
    }
  ]
};

// ==========================================
// AUTHENTICATION COURSE DATA
// ==========================================
export const FALLBACK_AUTH_COURSE: HtmlCourse = {
  _id: 'auth-course',
  id: 'auth-course',
  title: 'Authentication & Authorization — Security, JWT & OAuth',
  slug: 'authentication-jwt-security',
  description: 'Master bcrypt password hashing, JSON Web Tokens, cookies, session security, and authorization middleware.',
  category: 'Authentication',
  level: 'Advanced',
  totalLessons: 12,
  totalModules: 3,
  duration: 240,
  modules: [
    {
      _id: 'auth-mod-1',
      id: 'auth-mod-1',
      title: 'Module 1 — Passwords & JWT Security',
      slug: 'passwords-and-jwt-security',
      order: 1,
      description: 'Learn secure password hashing, salt rounds, JWT sign/verify, and header tokens.',
      duration: 80,
      lessons: [
        {
          _id: 'auth-les-1-1',
          id: 'auth-les-1-1',
          moduleId: 'auth-mod-1',
          moduleTitle: 'Module 1 — Passwords & JWT Security',
          courseId: 'auth-course',
          order: 1,
          title: 'Introduction to Authentication & Passwords',
          slug: 'introduction-to-authentication-and-passwords',
          description: 'Understand authentication vs authorization, hashing with bcrypt, and security best practices.',
          learningObjective: 'Learn how to securely store user credentials using salt hashing and verify login payloads.',
          concept: 'Authentication verifies WHO a user is (e.g. login credentials), while Authorization verifies WHAT a user can access.',
          codeExample: 'const bcrypt = require("bcryptjs");\nconst hash = await bcrypt.hash("userPassword123", 10);',
          expectedOutput: 'Hashed password string produced securely.',
          starterCode: 'const bcrypt = require("bcryptjs");\n\nasync function registerUser(password) {\n  // Hash the password\n  return await bcrypt.hash(password, 10);\n}',
          practiceTask: {
            title: 'Authentication Basics Checkpoint',
            description: 'Write a basic HTML form structure for User Login.',
            requirements: ['Include form tag', 'Include email input', 'Include password input', 'Include submit button'],
            starterCode: '<form action="/login" method="POST">\n  <label>Email:</label>\n  <input type="email" name="email" required />\n  <label>Password:</label>\n  <input type="password" name="password" required />\n  <button type="submit">Sign In</button>\n</form>',
            expectedOutput: 'Clean login form with email and password input fields.'
          }
        }
      ]
    }
  ]
};

/**
 * Returns the exact tailored course curriculum object for any selected technology.
 */
export function getCourseForTech(techId: string | null): HtmlCourse {
  switch (techId) {
    case 'css':
      return FALLBACK_CSS_COURSE;
    case 'javascript':
      return FALLBACK_JS_COURSE;
    case 'nodejs':
      return FALLBACK_NODE_COURSE;
    case 'expressjs':
      return FALLBACK_EXPRESS_COURSE;
    case 'mongodb':
      return FALLBACK_MONGO_COURSE;
    case 'restapi':
      return FALLBACK_REST_COURSE;
    case 'auth':
    case 'authentication':
      return FALLBACK_AUTH_COURSE;
    case 'capstone':
    case 'finalproject':
      return FALLBACK_CAPSTONE_COURSE;
    case 'html':
    default:
      return FALLBACK_HTML_COURSE;
  }
}

export function getFallbackLessonById(id: string): HtmlLesson | undefined {
  if (!id) return undefined;
  const allLessons = [
    ...FALLBACK_HTML_LESSONS,
    ...FALLBACK_CSS_COURSE.modules.flatMap(m => m.lessons),
    ...FALLBACK_JS_COURSE.modules.flatMap(m => m.lessons),
    ...FALLBACK_NODE_COURSE.modules.flatMap(m => m.lessons),
    ...FALLBACK_EXPRESS_COURSE.modules.flatMap(m => m.lessons),
    ...FALLBACK_MONGO_COURSE.modules.flatMap(m => m.lessons),
    ...FALLBACK_REST_COURSE.modules.flatMap(m => m.lessons),
    ...FALLBACK_AUTH_COURSE.modules.flatMap(m => m.lessons),
    ...FALLBACK_CAPSTONE_COURSE.modules.flatMap(m => m.lessons)
  ];
  return allLessons.find(l => l._id === id || l.id === id || l.slug === id);
}
