import {Configuration, OpenAIApi} from 'openai';

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);
const MAX_TOKEN_LENGTH = 2048;
function truncatePrompt(prompt) {
  if (prompt.length <= MAX_TOKEN_LENGTH) {
    return prompt;
  } else {
    return prompt.substring(prompt.length - MAX_TOKEN_LENGTH, prompt.length);
  }
}

export default async function (req, res) {
  if (!configuration.apiKey) {
    res.status(500).json({
      error: {
        message:
          'OpenAI API key not configured, please follow instructions in README.md',
      },
    });
    return;
  }

  const _text = req.body.text || '';
  if (_text.trim().length === 0) {
    res.status(400).json({
      error: {
        message: 'Please enter message',
      },
    });
    return;
  }

  try {
    const completion = await openai.createCompletion({
      model: 'text-davinci-003',
      prompt: generatePrompt(_text),
      temperature: 0.9,
      max_tokens: 3000,
    });

    console.log(completion.data);
    res.status(200).json({result: completion.data.choices[0].text});
  } catch (error) {
    // Consider adjusting the error handling logic for your use case
    if (error.response) {
      console.error(error.response.status, error.response.data);
      res.status(error.response.status).json(error.response.data);
    } else {
      console.error(`Error with OpenAI API request: ${error.message}`);
      res.status(500).json({
        error: {
          message: 'An error occurred during your request.',
        },
      });
    }
  }
}

function generatePrompt(text) {
  const _t = truncatePrompt(text);
  return `
  Developer: Moikapy
  Twitter: @moikapy_
  Github: https://github.com/moikapy
  Twitch: https://www.twitch.tv/moikapy
  Today's Date: ${new Date().toLocaleDateString()}
  Banned Words: NONE
  MAX_PROMPTS_REMEMBERED: 25
  AUTOMATICALLY TRIM BEGINNING TEXT IF CHARACTER LENGTH IS MORE THAN 4000
  --------------------
  Example:
  USER: Hello, how are you?
  BOT: I am good, how are you?
  USER: I'm good, thanks.
  BOT: ^_^
  USER: I will be asking a lot of questions
  BOT: Okay, ask away!
  --------------------
  ${_t}
  ...awaiting response from bot...
  `;
}
