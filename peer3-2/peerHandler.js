// You may need to add some delectation here
let peerTable = require('./peerTable');
let filePath = require('path');

// variables to track peer properties
let currentFile = filePath.dirname(__filename).split("\\");
let folderLen = currentFile.length - 1;
let folderName = currentFile[folderLen].slice(0, currentFile[folderLen].indexOf("-"));

module.exports = {

    // function to handle a peer joining
    handlePeerJoining: function (sock, ver, pmax) 
    {
        // handle version
        let version = Buffer.alloc(1);
        version.writeUInt8(ver);

        // handle message type
        let type = Buffer.alloc(1)

        if (peerTable.isFull() == false) // there are still availble slots in the peer table
        {   
            type.writeUInt8(1); // 1 means welcome
        }
        else if (peerTable.isFull() == true) // there are no more available slots in the peer table
        {
            type.writeUInt8(2); // 2 means redirect
        }

        // handle number of peers
        let pnum = Buffer.alloc(2);
        pnum.writeInt16BE(peerTable.countPeers()); 

        // handle sender ID length
        let slen = Buffer.alloc(1);
        slen.writeUInt8(folderName.length);
        
        // handle sender ID data
        let sID = [Buffer.from(folderName, "latin1"), Buffer.alloc(2)]; // latin1 makes each character one byte
        sID[1].writeUInt16BE(parseInt(sock.localPort));
        
        // handle port and ip address 
        let pPort = Buffer.alloc(2);
        let pAddress = [Buffer.alloc(1), Buffer.alloc(1), Buffer.alloc(1), Buffer.alloc(1)];

        for (let i = 1; i <= peerTable.countPeers(); i++) // can share another peer's information
        {
            let peer = peerTable.getPeer(i-1).split(":"); // get first peer
            let [a, b, c, d] = peer[0].split("."); // get address of this peer

            pPort.writeUInt16BE(peer[1]); // get port of this peer 
            pAddress[0].writeUInt8(a); // get ip address of this peer
            pAddress[1].writeUInt8(b); // get ip address of this peer
            pAddress[2].writeUInt8(c); // get ip address of this peer
            pAddress[3].writeUInt8(d); // get ip address of this peer
        }

        if (peerTable.isFull() == false) // there are still availble slots in the peer table
        {
            peerTable.joinPeer(sock.remoteAddress + ":" + sock.remotePort); // add new peer to peer table
        }

        let packet = Buffer.concat([version, type, pnum, slen, ...sID, ...pAddress, pPort]); // build packet
        sock.write(packet); // send packet

        // 1 + 1 + 2 + 1 + 7(5+2) + 4(1+1+1+1) + 2
    }
};
