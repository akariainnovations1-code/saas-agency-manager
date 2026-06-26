const { Integration } = require('../models');

// Helpers to get active AI integration API key
const getAIClient = async (serviceName) => {
  try {
    const integration = await Integration.findOne({ where: { serviceName, status: 'Connected' } });
    if (integration && integration.apiKey) {
      return integration.apiKey.trim();
    }
  } catch (error) {
    console.error(`Error fetching AI integration for ${serviceName}:`, error);
  }
  return null;
};

// Call OpenAI Chat Completion API
const callChatGPT = async (apiKey, prompt, systemPrompt) => {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7
    })
  });
  if (!response.ok) {
    const err = await response.text();
    throw new Error(`OpenAI API error: ${err}`);
  }
  const data = await response.json();
  return data.choices[0].message.content;
};

// Call Google Gemini API
const callGemini = async (apiKey, prompt, systemPrompt) => {
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      contents: [{
        parts: [{ text: `${systemPrompt}\n\nUser Prompt:\n${prompt}` }]
      }],
      generationConfig: {
        temperature: 0.7
      }
    })
  });
  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Gemini API error: ${err}`);
  }
  const data = await response.json();
  if (data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts) {
    return data.candidates[0].content.parts[0].text;
  }
  throw new Error("Invalid Gemini API response structure");
};

// Orchestrate LLM API calling
const callAI = async (prompt, systemPrompt) => {
  // Check ChatGPT
  const chatGptKey = await getAIClient('ChatGPT');
  if (chatGptKey) {
    console.log('🤖 Sending request to live ChatGPT API...');
    return await callChatGPT(chatGptKey, prompt, systemPrompt);
  }

  // Check Gemini
  const geminiKey = await getAIClient('Gemini');
  if (geminiKey) {
    console.log('🤖 Sending request to live Gemini API...');
    return await callGemini(geminiKey, prompt, systemPrompt);
  }

  console.log('🤖 No active AI integrations connected. Falling back to simulations...');
  return null;
};

// Clean markdown syntax around JSON responses
const cleanAndParseJson = (text) => {
  let cleaned = text.trim();
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```(?:json)?\n/, '').replace(/\n```$/, '').trim();
  }
  return JSON.parse(cleaned);
};

// AI Proposal Generator
exports.generateProposal = async (req, res) => {
  try {
    const { clientName, niche, budget } = req.body;
    if (!clientName || !niche || !budget) {
      return res.status(400).json({ message: 'Missing parameters. Please specify client, niche and budget.' });
    }

    const prompt = `Generate a detailed business proposal for "${clientName}" operating in the "${niche}" niche, with an allocated budget of ₹${parseFloat(budget).toLocaleString('en-IN')}. Provide professional sections: Executive Summary, Scope of Work & Phase deliverables, and structured budget allocation percents. Format in high-quality professional Markdown.`;
    const aiText = await callAI(prompt, "You are a professional business development consultant and operations SaaS writer.");

    if (aiText) {
      return res.json({ text: aiText });
    }

    // Default Mock fallback
    const mockProposalText = `### Premium Business Proposal for ${clientName}

**Prepared by**: Akaria Innovations Agency AI Assistant
**Domain Focus**: ${niche} Operations Overhaul & Digital Integration
**Target Investment Plan**: ₹${parseFloat(budget).toLocaleString('en-IN')}

---

#### 1. Executive Summary
After examining ${clientName}'s target positioning and technical roadmap, Akaria Innovations recommends a comprehensive ${niche} execution. Our proposed framework introduces secure system pipelines, modern styling alignments, and automated backend databases to streamline current workloads.

#### 2. Project Scope & Deliverables
* **Phase 1: Architecture Alignment & UI Figma Audits**
  Complete interface audits mapping dark/light design systems, high-fidelity grid layouts, and custom operational diagrams.
* **Phase 2: Full-Stack Integration & Database Provisioning**
  Deploying low-latency database engines supporting high-availability connection failovers, JWT user auth middleware, and data-logging hooks.
* **Phase 3: Automated Marketing Integrations**
  Establishing automated communication triggers linking WhatsApp Webhook APIs and synchronized Google Calendar notification feeds.

#### 3. Structured Investment Ledger
* UI/UX Responsive Mockups: **30% allocation**
* Database Sync and Controller Engineering: **50% allocation**
* Final Deployment, SEO indexing, and handoff training: **20% allocation**

---
*Akaria Innovations secure proposals are valid for 30 calendar days from issue. Authorized signature completes onboarding.*`;

    return res.json({ text: mockProposalText });
  } catch (error) {
    console.error('AI Proposal Error:', error);
    return res.status(500).json({ message: 'AI failed to generate proposal.' });
  }
};

// AI Invoice Description Generator
exports.generateInvoiceDesc = async (req, res) => {
  try {
    const { projectTitle } = req.body;
    if (!projectTitle) {
      return res.status(400).json({ message: 'Project title is required.' });
    }

    const prompt = `Write a short, professional billing description (1-2 sentences) for complete sprint deliverables on the project: "${projectTitle}".`;
    const aiText = await callAI(prompt, "You are a professional billing administrator and SaaS operations manager.");

    if (aiText) {
      return res.json({ text: aiText.trim() });
    }

    const mockDesc = `Comprehensive technical execution for the "${projectTitle}" initiative. This covers system requirement workshops, initial responsive dashboard layouts, Sequelize database model mappings, secure JSON Web Token authentication routers, and deployment verification tasks. Total billing represents scoped sprint deliverables completed under standard agency master service agreements.`;

    return res.json({ text: mockDesc });
  } catch (error) {
    console.error('AI Invoice Desc Error:', error);
    return res.status(500).json({ message: 'AI failed to generate invoice description.' });
  }
};

// AI Email Writer
exports.generateEmail = async (req, res) => {
  try {
    const { recipientName, emailType, invoiceNumber, amount } = req.body;
    if (!recipientName || !emailType) {
      return res.status(400).json({ message: 'Recipient name and email type are required.' });
    }

    const prompt = `Write an email to client "${recipientName}".
Email Type: ${emailType} (${emailType === 'overdue' ? 'an urgent invoice reminder' : 'a welcome onboarding email'}).
Invoice: ${invoiceNumber || 'N/A'}.
Amount: ${amount ? '₹' + parseFloat(amount).toLocaleString('en-IN') : 'N/A'}.

Return ONLY a valid JSON object matching the schema:
{
  "subject": "Email Subject Line",
  "body": "Complete email body content including greetings, spacing, paragraphs, and professional signature from Michael Scott / Sarah Connor."
}`;
    const aiText = await callAI(prompt, "You are a professional client relations communications manager. You output valid raw JSON objects matching the requested schema with no surrounding text.");

    if (aiText) {
      try {
        const parsed = cleanAndParseJson(aiText);
        if (parsed.subject && parsed.body) {
          return res.json(parsed);
        }
      } catch (parseError) {
        console.error("AI Email response JSON parse failed. Raw response:", aiText, parseError);
      }
    }

    // Default Mock fallback
    let emailSubject = '';
    let emailBody = '';

    if (emailType === 'overdue') {
      emailSubject = `URGENT ALERT: Outstanding Balance for Invoice ${invoiceNumber || 'INV-2026-X'} is Overdue`;
      emailBody = `Dear ${recipientName},

I hope this email finds you well.

This is a reminder that invoice ${invoiceNumber || 'INV-2026-X'} in the amount of ₹${parseFloat(amount || 5000).toLocaleString('en-IN')} was due on its designated deadline. According to our billing system, we have not yet received payment confirmation.

We kindly request that you review this outstanding balance as soon as possible. You can download a printable PDF copy of your statement directly from your Client Operations Portal and complete payment via credit card or bank transfer.

If you have any questions or require support, please submit a ticket in the portal or reply directly to this thread. We appreciate your prompt attention to this matter.

Sincerely,
Sarah Connor
Agency Operations Director
Akaria Innovations Support Hub`;
    } else {
      emailSubject = `Welcome to Akaria Innovations: Let's Begin Your Project Journey!`;
      emailBody = `Dear ${recipientName},

On behalf of the entire Akaria Innovations team, I want to welcome you to our operations portal!

We are absolutely thrilled to partner with you. Our core team is already preparing resources to boot your custom dashboard. In the Client Portal, you will be able to download contract PDFs, review task kanban delivery columns, track real-time milestone completions, and check active payment histories.

To initiate the onboarding phase, we will hold a kick-off Zoom session tomorrow. Please keep an eye on your synced Google Calendar invite for details. 

Let's build something exceptional together!

Warm regards,
Michael Scott
Client Experience Lead
Akaria Innovations Operations Center`;
    }

    return res.json({ subject: emailSubject, body: emailBody });
  } catch (error) {
    console.error('AI Email Error:', error);
    return res.status(500).json({ message: 'AI failed to draft email.' });
  }
};

// AI Meeting Summary
exports.generateMeetingSummary = async (req, res) => {
  try {
    const { rawNotes } = req.body;
    if (!rawNotes) {
      return res.status(400).json({ message: 'Raw meeting notes are required.' });
    }

    const prompt = `Draft a professional meeting summary and structured checklist of action items with clear responsibilities/deadlines based on these raw notes: "${rawNotes}". Format in professional Markdown with sections for Key Decisions and Action Items.`;
    const aiText = await callAI(prompt, "You are an executive assistant and project coordinator.");

    if (aiText) {
      return res.json({ text: aiText });
    }

    // Default Mock fallback
    const mockSummary = `### 📝 AI Meeting Summary & Action Items

**Original Notes Analyzed**:
*"${rawNotes.length > 80 ? rawNotes.substring(0, 80) + '...' : rawNotes}"*

---

#### 📌 High-Level Key Decisions
1. **Scope Freeze**: The team has aligned on the core responsive design mockup. Any further design changes will require budget reallocation.
2. **Database Pipeline**: SQLite local config will remain the fallback development driver, while PostgreSQL will handle production server loads.
3. **Communication Sync**: WhatsApp API alert notifications will be triggered upon task completion rather than on every state change.

#### 🚀 Action Items & Assignments
* **Jim Halpert** (Frontend): Refactor current glassmorphic dashboard CSS layout grids to ensure perfect mobile styling scaling. *Deadline: Within 3 business days.*
* **Sarah Connor** (Admin): Review overdue sales invoices and execute automated email notification follow-ups. *Deadline: By end of week.*
* **Michael Scott** (Manager): Reach out to prospective leads regarding custom cloud licenses renewals. *Deadline: Next Monday.*

---
*Summary compiled by Akaria Innovations operations AI engine on ${new Date().toLocaleDateString()}.*`;

    return res.json({ text: mockSummary });
  } catch (error) {
    console.error('AI Meeting Summary Error:', error);
    return res.status(500).json({ message: 'AI failed to summarize meeting.' });
  }
};

// AI Task Recommendations
exports.recommendTasks = async (req, res) => {
  try {
    const { projectScope } = req.body;
    if (!projectScope) {
      return res.status(400).json({ message: 'Project scope/description is required.' });
    }

    const prompt = `We have a project with the following scope/description: "${projectScope}".
Recommend exactly 3 realistic operational/technical deliverables or tasks to execute this scope successfully.

Return ONLY a valid JSON array matching the schema:
[
  {
    "name": "Concise task title",
    "description": "Short explanation of work to be done",
    "priority": "High" or "Medium" or "Low",
    "dueDate": "YYYY-MM-DD"
  }
]
Use appropriate due dates (e.g. 7-14 days from now).`;

    const aiText = await callAI(prompt, "You are a senior technical project lead. You output valid raw JSON arrays matching the requested schema with no surrounding text.");

    if (aiText) {
      try {
        const parsed = cleanAndParseJson(aiText);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return res.json(parsed);
        }
      } catch (parseError) {
        console.error("AI Task Recommendations JSON parse failed. Raw response:", aiText, parseError);
      }
    }

    // Default Mock fallback
    const recommendations = [
      {
        name: 'Design high-fidelity CSS layout grids',
        description: 'Design dynamic grids, sidebar responsive buttons, and light/dark theme switch variables.',
        priority: 'High',
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // 7 days from now
      },
      {
        name: 'Build model schemas and relational index mappings',
        description: 'Map database schemas using robust ORM configurations with appropriate cascade settings.',
        priority: 'High',
        dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      },
      {
        name: 'Configure API health verification endpoints',
        description: 'Expose standard Express router health status codes and log active database connection tests.',
        priority: 'Medium',
        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      }
    ];

    return res.json(recommendations);
  } catch (error) {
    console.error('AI Task Recommendation Error:', error);
    return res.status(500).json({ message: 'AI failed to recommend tasks.' });
  }
};

// AI Revenue Forecast
exports.forecastRevenue = async (req, res) => {
  try {
    const prompt = `Compile a high-fidelity 6-month financial revenue forecast projections model starting from current month (June). Projections should simulate compound monthly growth rate and expected MRR retention values.

Return ONLY a valid JSON object matching the schema:
{
  "summary": "Brief 1-2 sentence high-level overview of the projections and target business strategy.",
  "projections": [
    {
      "month": "June",
      "mrr": 24500,
      "renewalForecast": 23000,
      "growth": "8%"
    }
  ]
}
Return 6 months total of projections.`;

    const aiText = await callAI(prompt, "You are a chief financial analyst. You output valid raw JSON objects matching the requested schema with no surrounding text.");

    if (aiText) {
      try {
        const parsed = cleanAndParseJson(aiText);
        if (parsed.summary && Array.isArray(parsed.projections)) {
          return res.json(parsed);
        }
      } catch (parseError) {
        console.error("AI Forecast Revenue JSON parse failed. Raw response:", aiText, parseError);
      }
    }

    // Default Mock fallback
    const months = ['June', 'July', 'August', 'September', 'October', 'November'];
    const mrrBase = 24500;

    const projections = months.map((month, idx) => {
      const growthRate = 0.08 + (idx * 0.012); // Growth compounding 8% to 14%
      const projectedMrr = Math.round(mrrBase * Math.pow(1 + growthRate, idx));
      const projectedRenewalForecast = Math.round(projectedMrr * 0.94); // Assumes 6% churn
      return {
        month,
        mrr: projectedMrr,
        renewalForecast: projectedRenewalForecast,
        growth: `${Math.round(growthRate * 100)}%`
      };
    });

    return res.json({
      summary: `Projections indicate compound growth over the next two quarters. Driving subscription models and automating reminders are forecasted to increase retention MRR by 34% by Q4.`,
      projections
    });
  } catch (error) {
    console.error('AI Forecast Error:', error);
    return res.status(500).json({ message: 'AI failed to compile revenue forecast.' });
  }
};
