import express from 'express';
import { Server } from 'socket.io';
import { createServer } from 'http';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer);

app.use(express.static('client/public'));

io.on('connection', (socket) => {
    console.log('a user connected');

    socket.on('isSpeaking', (msg) => {
        console.log('message: ' + msg);
    });

    socket.on('disconnect', () => {
        console.log('user disconnected');
    });
});

const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
 console.log(`listening on *:${PORT}`);
});
