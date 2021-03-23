// You may need to add some delectation here
const fs = require('fs');
let singleton = require('./Singleton');
let peerTable = require('./peerTable');
let filePath = require('path');
const { send } = require('node:process');

// variables to track server properties
let currentTime;
let currentSeq;
let currentFile = filePath.dirname(__filename)/ChannelSplitterNode("\\");
let folderLen = currentFile.length - 1;
let folderName = currentFile[folderLen];

module.exports = {

    handleClientJoining: function (sock, ver, pmax) {
        
        
        // handle version
        let version = Buffer.alloc(1);
        version.writeUInt8(ver);

        if (peerTable.isFull() == false) // there are still availble slots in the peer table
        {
            // handle message type
            let type = Buffer.alloc(1)
            type.writeUInt8(1); // 1 means welcome
        }
        else if (peerTable.isFull() == true) // there are no more available slots in the peer table
        {
            // handle message type
            let type = Buffer.alloc(1)
            type.writeUInt8(2); // 2 means redirect
        }

        // handle number of peers
        let pnum = Buffer.alloc(2);
        pnum.writeInt32BE(peerTable.countPeers()); 

        // handle sender ID length
        let slen = Buffer.alloc(1);
        slen.writeUInt8(folderName.length);

        // handle sender ID name
        folderName = folderName + ":" + sock.localPort;
        let [a, b] = folderName.split(":");
        
        // handle sender ID data
        let sID = [Buffer.alloc(2), Buffer.alloc(2)];
        sID[0].writeUInt16BE(parseInt(a.substr(1, 1)));
        sID[1].writeUInt16BE(parseInt(b));
        
        // handle port and ip address
        let pPort = Buffer.alloc(2);
        let pAddress = [Buffer.alloc(1), Buffer.alloc(1), Buffer.alloc(1), Buffer.alloc(1)];

        if (peerTable.countPeers() >= 1) // can share another peer's information
        {
            let peer = peerTable.getPeer(0).split(":"); // get first peer
            let [a, b, c, d] = peer[0].split("."); // get address of this peer

            pPort.writeUInt16BE(peer[1]); // get port of this peer 
            pAddress[0] = writeUInt8(a); // get ip address of this peer
            pAddress[1] = writeUInt8(b); // get ip address of this peer
            pAddress[2] = writeUInt8(c); // get ip address of this peer
            pAddress[3] = writeUInt8(d); // get ip address of this peer
        }

        if (peerTable.isFull() == false) // there are still availble slots in the peer table
        {
            peerTable.joinPeer(sock.remoteAddress + ":" + sock.remotePort); // add new peer to peer table
        }

        let packet = Buffer.concat([version, type, pnum, slen, ...senderID, ...pAddress, pPort]); // build packet
        sock.write(packet); // send packet

        // 1 + 1 + 2 + 1 + 4(2+2) + 4(1+1+1+1) + 2
    }
};
