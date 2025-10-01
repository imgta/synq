export const getKeyRequirements = (text: string) => `
You are a U.S. Defense Contracting Analyst. Your task is to extract the most critical requirements from the following opportunity description.

Focus on specific, actionable items like certifications (e.g., CMMC Level 2), technologies (e.g., experience with AWS GovCloud), qualifications (e.g., 10 years of experience), and key deliverables. Ignore generic business language like "strong communication skills" or "team player".

Extract the top 5-7 most important requirements.

Respond with a JSON object containing a single key "requirements" which is an array of strings.

---
DOCUMENT TEXT:
${text.substring(0, 8000)}
---

JSON_OUTPUT:
`;

export const getEstimatedValuePrompt = (text: string) => `
Analyze the following document to find the contract's estimated value, ceiling, or budget.

Scan for explicit monetary values. Look for keywords like "estimated value", "ceiling", "budget", "not to exceed", "NTE", or dollar amounts ($). The value might be written as "$10M", "5 million dollars", or "$2,500,000".

Respond with a JSON object containing a single key "estimated_value". The value should be an integer representing the total dollar amount, or null if no value is found.

---
DOCUMENT TEXT:
${text.substring(0, 8000)}
---

JSON_OUTPUT:
`;

export const getAncillaryKeywordsPrompt = (primaryNaicsDesc: string, text: string) => `
You are a contracting analyst. The primary scope of work for this opportunity is "${primaryNaicsDesc}".

Read the document and identify keywords or short phrases (2-4 words) that describe DISTINCT, SECONDARY areas of work not covered by the primary scope. For example, if the primary is "Custom Computer Programming", secondary work might include "cybersecurity consulting", "data analytics services", or "network infrastructure setup".

Return a JSON object with a single key "keywords" which is an array of these strings.

---
DOCUMENT TEXT:
${text.substring(0, 8000)}
---

JSON_OUTPUT:
`;