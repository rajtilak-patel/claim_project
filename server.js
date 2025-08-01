const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');
const { setupClaimSocket } = require('./src/claim/socket/claim.socket');
const authRoutes = require('./src/auth/routes/auth.route');
const postRoutes = require('./src/post/routes/post.route');
const claimRoutes = require('./src/claim/routes/claim.route');
const reportRoutes = require('./src/report/routes/report.route');
require('dotenv').config();
const http = require('http');
const socketIo = require('socket.io');
dotenv.config();
const app = express();
app.use(cors());
app.use(express.json()); // for JSON body
app.use(express.urlencoded({ extended: true })); // for form-url-encoded
app.use('/uploads', express.static(path.join(__dirname, '/uploads')));


app.get('/', (req, res) => {
  res.send('Welcome to the Claim Management API');
});
// Auth routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/posts', postRoutes);
app.use('/api/v1/claims', claimRoutes);
app.use('/api/v1/reports', reportRoutes);
// Connect DB & Start Server


const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

setupClaimSocket(io);
mongoose.connect(process.env.MONGO_URI, {
//   useNewUrlParser: true,
//   useUnifiedTopology: true
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.error('MongoDB connection error:', err));

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server started on port ${PORT}`));
