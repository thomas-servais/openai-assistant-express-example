const express = require('express');
const OpenAI = require('openai');
const dotenv = require('dotenv');

dotenv.config();

const openai = new OpenAI();

const app = express();
const port = process.env.PORT || 3000;

const openaiApiKey = process.env.OPENAI_API_KEY;
const assistantId = process.env.ASSISTANT_ID;


// Middleware pour servir les fichiers statiques (votre page web)
app.use(express.static('public'));

(async () => {

const thread = await openai.beta.threads.create();

// Route pour la requête du chatbot
app.get('/chat', async (req, res) => {
  const { message } = req.query;
    console.log(message)
  try {

    await openai.beta.threads.messages.create(
        thread.id,
        {
          role: "user",
          content: message
        }
      );

      let run = await openai.beta.threads.runs.createAndPoll(
        thread.id,
        { 
          assistant_id: assistantId,
          instructions: "Please request to the user."
        }
      );

      if (run.status === 'completed') {
        const messages = await openai.beta.threads.messages.list(
          run.thread_id
        );
        for (const message of messages.data.reverse()) {
          console.log(`${message.role} > ${message.content[0].text.value}`);
        }

        res.json({ reply: messages.data[messages.data.length - 1].content[0].text.value });
      } else {
        console.log(run.status);
      }


  } catch (error) {
    console.log(error)
    res.status(500).json({ error: 'Une erreur s\'est produite lors de la génération de la réponse.' });
  }
});

})()

// Démarrer le serveur
app.listen(port, () => {
  console.log(`Le serveur écoute sur le port ${port}`);
});
