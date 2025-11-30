const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const authRoutes = require('./routes/auth');
const { spawn } = require('child_process');
const path = require('path');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Database Connection
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/mumbai-map', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.log(err));

// Routes
app.use('/api/auth', authRoutes);

app.post('/api/predict', (req, res) => {
    const { location, months_offset } = req.body;

    if (!location || months_offset === undefined) {
        return res.status(400).json({ error: 'Location and months_offset are required' });
    }

    const pythonScript = path.join(__dirname, 'predict.py');
    const pythonProcess = spawn('python', [pythonScript, location, months_offset]);

    let dataString = '';
    let errorString = '';

    pythonProcess.stdout.on('data', (data) => {
        dataString += data.toString();
    });

    pythonProcess.stderr.on('data', (data) => {
        errorString += data.toString();
    });

    pythonProcess.on('close', (code) => {
        if (code !== 0) {
            console.error(`Python script exited with code ${code}`);
            console.error(`Error: ${errorString}`);
            return res.status(500).json({ error: 'Prediction failed', details: errorString });
        }

        try {
            const result = JSON.parse(dataString);
            if (result.error) {
                return res.status(400).json(result);
            }
            res.json(result);
        } catch (e) {
            console.error('Failed to parse Python output:', dataString);
            res.status(500).json({ error: 'Invalid response from prediction model' });
        }
    });
});

app.get('/', (req, res) => {
    res.send('Mumbai Map API is running');
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
