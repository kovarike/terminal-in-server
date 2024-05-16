import express from 'express';
import bodyParser from 'body-parser';
import { executeCommand } from './terminal';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(express.static('public'));

app.post('/exe', (req, res) => {
  const { command } = req.body;
  executeCommand(command, (error, output) => {
    if (error) {
      res.status(500).send(`Erro: ${error.message}`);
      return;
    }
    res.send(output);
  });
});

app.listen(PORT, () => {
  console.log(`Servidor iniciado na porta ${PORT}`);
});
