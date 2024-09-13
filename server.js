// const express = require('express');
// const http = require('http');
// const socketIO = require('socket.io');
// const multer = require('multer');
// const path = require('path');
// const fs = require('fs');
// let userCount=0;
// // Initialize app and server
// const app = express();
// const server = http.createServer(app);
// const io = socketIO(server);

// // Set storage for uploaded files
// const storage = multer.diskStorage({
//     destination: function (req, file, cb) {
//         cb(null, 'uploads/');
//     },
//     filename: function (req, file, cb) {
//         cb(null, path.extname(file.originalname));
//     }
// });

// const upload = multer({ storage: storage });

// // Serve static files
// app.use(express.static('public'));

// // File upload route
// app.post('/upload', upload.single('file'), (req, res) => {
//     const originalName = req.file.originalname;
//     const filePath = `/uploads/${req.file.filename}`;

//     // Emit the file info to all clients with the original file name
//     io.emit('fileUploaded', { fileName: originalName, filePath: filePath });
    
//     res.status(200).json({ filePath: filePath, fileName: originalName });
// });


// // Serve uploaded files
// app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// // Start server
// const PORT = 3000;
// const HOST = '192.168.231.193';  // Listen on all network interfaces

// server.listen(PORT, HOST, () => {
//     console.log(`Server is running on http://${HOST}:${PORT}`);
// });


// // Socket.io connection
// io.on('connection', (socket) => {
//     console.log('A user connected');
//     userCount++;
//     io.emit('userCount', userCount);

//     fs.readdir(path.join(__dirname, 'uploads'), (err, files) => {
//         if (err) {
//             console.error('Could not read uploads directory', err);
//             return;
//         }

//         // Send list of files to the new user
//         const uploadedFiles = files.map(file => {
//             return { fileName: file, filePath: `/uploads/${file}` };
//         });

//         socket.emit('existingFiles', uploadedFiles);
//     });

//     socket.on('disconnect', () => {
//         userCount--;
//         io.emit('userCount', userCount);
//         console.log('A user disconnected');
//     });
// });
const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
let userCount = 0;
// Initialize app and server
const app = express();
const server = http.createServer(app);
const io = socketIO(server);

// Set storage for uploaded files
// const storage = multer.diskStorage({
//     destination: function (req, file, cb) {
//         cb(null, 'uploads/');
//     },
//     filename: function (req, file, cb) {
//         cb(null, Date.now() + path.extname(file.originalname));
//     }
// });

// const upload = multer({ storage: storage });

// const storage = multer.diskStorage({
//     destination: function (req, file, cb) {
//         cb(null, 'uploads/');
//     },
//     filename: function (req, file, cb) {
//         cb(null, file.originalname); // Use original file name
//     }
// });

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/'); // Directory to store the files
    },
    filename: function (req, file, cb) {
        const originalName = file.originalname;
        const uploadDir = 'uploads/';
        let fileName = originalName;
        let counter = 1;

        // Check if a file with the same name already exists
        while (fs.existsSync(path.join(uploadDir, fileName))) {
            // If it exists, append a counter before the file extension
            const fileExt = path.extname(originalName); // Get file extension (e.g., .pdf)
            const fileBaseName = path.basename(originalName, fileExt); // Get file name without extension
            fileName = `${fileBaseName}(${counter})${fileExt}`; // Append counter to file name
            counter++;
        }

        // Once a unique file name is found, pass it to the callback
        cb(null, fileName);
    }
});


const upload = multer({ storage: storage });








// Serve static files
app.use(express.static('public'));

// File upload route
app.post('/upload', upload.single('file'), (req, res) => {
    const filePath = `/uploads/${req.file.filename}`;
    
    // Emit the file info to all clients
    io.emit('fileUploaded', { fileName: req.file.originalname, filePath: filePath });
    
    res.status(200).json({ filePath: filePath });
});

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

//Start server
const PORT = 3000;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});


// const PORT = 3000;
// const HOST = '192.168.231.193';  // Listen on all network interfaces

// server.listen(PORT, HOST, () => {
//     console.log(`Server is running on http://${HOST}:${PORT}`);
// });



// Send list of existing files when a new user connects
io.on('connection', (socket) => {
    userCount++;
    io.emit('userCount', userCount);
    console.log('A user connected');

    // Read files from the 'uploads/' directory
    fs.readdir(path.join(__dirname, 'uploads'), (err, files) => {
        if (err) {
            console.error('Could not read uploads directory', err);
            return;
        }

        // Send list of files to the new user
        const uploadedFiles = files.map(file => {
            return { fileName: file, filePath: `/uploads/${file}` };
        });

        socket.emit('existingFiles', uploadedFiles);
    });

    socket.on('disconnect', () => {
        userCount--;
        io.emit('userCount', userCount);
        console.log('A user disconnected');
    });
});
