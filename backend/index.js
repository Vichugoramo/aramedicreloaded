require('dotenv').config();
const express = require('express');
const cors = require('cors');
const socketIOServer = require('socket.io');
const app = express();

const { connectDB } = require('./src/config/db');
const authMiddleware = require('./src/middlewares/auth');
const notFoundMiddleware = require('./src/middlewares/notFound');
const errorMiddleware = require('./src/middlewares/error');

async function startServer() {
    await connectDB();
    const socketController = require('./src/controllers/socketController');
    const loginRoute = require('./src/routes/login'); // IMPORTANT: load the routes after connecting to the database
    const medicRoutes = require('./src/routes/medicRoutes');// because routes need the database connection already established
    const patientRoutes = require('./src/routes/patientRoute');
    const specialityRoutes = require('./src/routes/specialityRoute');
    const userRoutes = require('./src/routes/userRoutes');
    const emergencyRoutes = require('./src/routes/emergencyRoutes');

    const server = app.listen(process.env.PORT || 3000, () => {
        console.log(`Listening on port ${server.address().port}`);
    });
    const io = socketIOServer(server, {
        cors: {
            origin: '*',
            methods: ['*'],
            credentials: false
        }
    });
    app.use(express.json());
    app.use(express.raw({ limit: '50mb', type: 'application/octet-stream' })); // Para manejar binarios

    app.use(cors());

    // routes which don't need authentication
    app.get('/', function (req, res) { res.sendFile(__dirname + '/' + 'test-index.html'); });
    app.use(loginRoute);
    app.use(medicRoutes);
    app.use(patientRoutes);
    app.use(specialityRoutes);
    io.on('connection', socketController(io));
    
    app.use( (()=>{try{return require('./test/connectedUsersEndpoint')}catch(e){return (req, res, next)=>{next()}}})()  ) // DELETE TEST
    
    app.use(authMiddleware);
    // routes which need authentication
    app.use(userRoutes);
    app.use(emergencyRoutes);
    // error handling middleware
    app.use(notFoundMiddleware);
    app.use(errorMiddleware);

};

startServer();
