// You may need to add some delectation here
let singleton = require('./Singleton');
let peerHandler = require('./peerHandler');
let filePath = require('path');
let net = require('net');

// variables to track peer properties
const HOST = "127.0.0.1"; // localhost
const PORT = 3000; // port used for node.js
let port = Math.round((Math.random()*65535 - 1) + 1);
let maxp = 2; // maximum number of peers a peer can connect to // TODO
let version = 7; // version
let table = []; // peer table
let cons = 0; // track number of connections
let currentFile = filePath.dirname(__filename).split("\\");
let folderLen = currentFile.length - 1;
let folderName = currentFile[folderLen].slice(0, currentFile[folderLen].indexOf("-"));

// start a server
singleton.init();
let server = net.createServer();
server.listen(port, HOST); // listen for connections
let client = new net.Socket();

if (typeof(process.argv[3]) === "undefined") // no argument given for -p (initial node)
{
    console.log(`This peer address is ${HOST}:${port} located at ${folderName}`);

    // when the server receives a connection
    server.on("connection", (sock) => { 
        peerHandler.handlePeerJoining(sock, version, maxp); // handle any peers that join
        cons++;

        if (cons > maxp) // peer table is full
        {
            console.log(`Peer table full: ${sock.remoteAddress}:${sock.remotePort} redirected`);
        }
        else // peer table has open slots
        {
            console.log(`Connected from peer ${sock.remoteAddress}:${sock.remotePort}`);
        }

        sock.on("end", (err) => { // TODO
            if (err) throw err;
        })
    });
}
else // argument given for -p (connecting to established node)
{
    let addPort = process.argv[3]; // get command line ip address and port
    let port = addPort.substring(addPort.indexOf(":") + 1); // get port
    let address = addPort.slice(0, addPort.indexOf(":")); // get ip address

    // connect client to server
    client.connect(port, address, () => { 
        singleton.init();
        initPeer();
    });

    // when the client receives a packet
    client.on('data', (res) => {

        if (res.slice(0, 1).readUInt8(0) == 7) // check if version is correct
        {
            if (res.slice(1, 2).readUInt8(0) == 1) // if welcome is received
            {
                console.log(`Connected to peer ${res.slice(5, 10).toString()}:${res.slice(10, 12).readUInt16BE()} at timestamp: ${singleton.getTimestamp()}`);
                console.log(`This peer address is ${HOST}:${client.address().port} located at ${folderName}`);
                console.log(`Received ack from ${res.slice(5, 10).toString()}:${res.slice(10, 12).readUInt16BE()}`);

                if (res.slice(2, 4).readUInt16BE() >= 1)
                {
                    console.log(`   which is peered with:[${res.slice(12, 13).readUInt8()}.${res.slice(13, 14).readUInt8()}.${res.slice(14, 15).readUInt8()}.${res.slice(15, 16).readUInt8()}:${res.slice(16, 18).readUInt16BE()}]`);
                }

            }
            else if (res.slice(1, 2).readUInt8(0) == 2) // if redirect is received
            {
                console.log(`The join has been declined, try joining one of the following peers`);

                let attempts = res.slice(2, 4).readUInt16BE(); // get number of possible attempts 

                if (attempts > 1) // TODO only sends a single option
                {
                    attempts = 1;
                }

                // get all ip and ports sent
                for (let i = 1; i <= attempts; i++)
                {
                    tAddress = res.slice(12+(i*0), 12+(i*1)).readUInt8(0) + "." + res.slice(12+(i*1), 12+(i*2)).readUInt8(0) + "." + res.slice(12+(i*2), 12+(i*3)).readUInt8(0) + "." + res.slice(12+(i*3), 12+(i*4)).readUInt8(0);
                    tPort = Number(res.slice(12+(i*4), 12+(i*6)).readUInt16BE());

                    console.log(`   >> ${tAddress}:${tPort}`);
                }
                client.end(); // get rid of instance and start again
            }
        }
        else
        {
            console.log(`Incorrect version, discarded packet`);
        }
    });

    // when the client closes the connection
    client.on(('close'), () => {
        console.log(`Connection closed`);
    });
}

function initPeer()
{
    let newCons = 1;
        let clientServer = net.createServer();
        clientServer.listen(client.address().port, HOST);
        
        clientServer.on("connection", (sock) => {
            newCons++;

            if (newCons > maxp)
            {
                console.log(`Peer table full: ${sock.remoteAddress}:${sock.remotePort} redirected`);;
                client.end();
            }
            else
            {
                console.log(`Connected from peer ${sock.remoteAddress}:${sock.remotePort}`);
                peerHandler.handlePeerJoining(sock, version, maxp);
            }

            sock.on("end", (err) => { // TODO
                if (err) throw err;
            })
        });
}