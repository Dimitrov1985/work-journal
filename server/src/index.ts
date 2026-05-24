import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import entriesRouter from './routes/entries';
import workTypesRouter from './routes/workTypes';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use('/api/entries', entriesRouter);
app.use('/api/work-types', workTypesRouter);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
