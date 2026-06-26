const { Integration, Activity } = require('../models');

// Get all integrations
exports.getIntegrations = async (req, res) => {
  try {
    // Return all integrations
    const integrations = await Integration.findAll();
    return res.json(integrations);
  } catch (error) {
    console.error('Get Integrations Error:', error);
    return res.status(500).json({ message: 'Failed to retrieve integrations.' });
  }
};

// Configure integration credentials
exports.configureIntegration = async (req, res) => {
  try {
    const { serviceName, apiKey, status } = req.body;

    if (!serviceName) {
      return res.status(400).json({ message: 'serviceName is required.' });
    }

    let integration = await Integration.findOne({ where: { serviceName } });
    if (!integration) {
      integration = await Integration.create({
        serviceName,
        apiKey: apiKey || '',
        status: status || 'Disconnected',
        lastSync: status === 'Connected' ? new Date() : null
      });
    } else {
      await integration.update({
        apiKey: apiKey !== undefined ? apiKey : integration.apiKey,
        status: status !== undefined ? status : integration.status,
        lastSync: status === 'Connected' ? new Date() : integration.lastSync
      });
    }

    await Activity.create({
      type: 'CRM',
      action: 'Configured Integration',
      details: `Updated settings for ${serviceName} integration (${integration.status}).`,
      userId: req.user.id
    });

    return res.json(integration);
  } catch (error) {
    console.error('Configure Integration Error:', error);
    return res.status(500).json({ message: 'Failed to configure integration.' });
  }
};

// Simulate sync/ping tests
exports.testPing = async (req, res) => {
  try {
    const { serviceName } = req.params;
    const integration = await Integration.findOne({ where: { serviceName } });

    if (!integration || integration.status !== 'Connected') {
      return res.status(400).json({ message: `${serviceName} integration is not active or connected.` });
    }

    let pingMessage = `Sync connection verification completed successfully!`;

    // ChatGPT (OpenAI) API Key validation
    if (serviceName === 'ChatGPT') {
      if (!integration.apiKey) {
        return res.status(400).json({ message: 'ChatGPT integration is missing an API Key.' });
      }
      try {
        const testRes = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${integration.apiKey.trim()}`
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [{ role: 'user', content: 'say ok' }],
            max_tokens: 5
          })
        });
        if (!testRes.ok) {
          const errMsg = await testRes.text();
          throw new Error(errMsg);
        }
        pingMessage = `Successfully pinged OpenAI API endpoint. Credentials are fully active and validated!`;
      } catch (err) {
        console.error('OpenAI Ping Validation Error:', err);
        return res.status(400).json({ 
          message: `Failed to authenticate against OpenAI API. Please check your API key. Error: ${err.message}` 
        });
      }
    }

    // Gemini API Key validation
    if (serviceName === 'Gemini') {
      if (!integration.apiKey) {
        return res.status(400).json({ message: 'Gemini integration is missing an API Key.' });
      }
      try {
        const testRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${integration.apiKey.trim()}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            contents: [{ parts: [{ text: 'say ok' }] }],
            generationConfig: { maxOutputTokens: 5 }
          })
        });
        if (!testRes.ok) {
          const errMsg = await testRes.text();
          throw new Error(errMsg);
        }
        pingMessage = `Successfully pinged Google Gemini API endpoint. Credentials are fully active and validated!`;
      } catch (err) {
        console.error('Gemini Ping Validation Error:', err);
        return res.status(400).json({ 
          message: `Failed to authenticate against Google Gemini API. Please check your API key. Error: ${err.message}` 
        });
      }
    }

    // Update lastSync timestamp
    await integration.update({ lastSync: new Date() });

    await Activity.create({
      type: 'CRM',
      action: 'Tested Integration Sync',
      details: `Successfully completed sync audit for ${serviceName} connector.`,
      userId: req.user.id
    });

    return res.json({
      success: true,
      message: pingMessage,
      timestamp: integration.lastSync,
      service: serviceName
    });
  } catch (error) {
    console.error('Sync Test Error:', error);
    return res.status(500).json({ message: 'Failed to trigger sync test.' });
  }
};
