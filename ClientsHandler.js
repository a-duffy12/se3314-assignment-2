// You may need to add some delectation here
const fs = require('fs');
let ITPpacket = require('./ITPResponse');
let singleton = require('./Singleton');

// variables to track server properties
let currentTime;
let currentSeq;
let extRaw = "";
let fname = "";

module.exports = {

    handleClientJoining: function (sock) {
        
        currentTime = singleton.getTimestamp(); // get current time stamp
        currentSeq = singleton.getSequenceNumber(); // get current sequence number

        console.log(`Client-${currentSeq} is connected at timestamp: ${currentTime}\n`);
        sock.on("data", getData); // output packet info from the socket
        console.log("");
        sock.on("close", (req) => {
            console.log(`Client-${currentTime} closed the connection\n`);
        });

        // function to get packet data from the client and output it
        function getData(data) 
        {
            // get information from packet
            var version = data.slice(0, 2).readUInt16BE(0);
            var type = data.slice(3).readUInt8(0).toString();
            var ext = data.slice(4, 7).readUInt16BE(0);
            var name = data.slice(8).toString();

            // decode file type
            if (ext == 1)
            {
                extRaw = "bmp";
            }
            else if (ext == 2)
            {
                extRaw = "jpg";
            }
            else if (ext == 3)
            {
                extRaw = "gif";
            }
            else if (ext == 4)
            {
                extRaw = "png";
            }
            else if (ext == 5)
            {
                extRaw = "tiff";
            }
            else if (ext == 12)
            {
                extRaw = "jpeg";
            }
            else if (ext == 15)
            {
                extRaw = "raw"
            }
            fname = name + "." + extRaw;

            console.log(`Client-${currentSeq} requests:`);
            console.log(`   --ITP Version: ${version}`);
            //console.log(`   --Image Count:`); // TODO
            if (type == 0)
            {
                console.log(`   --Request Type = Query`);
            }
            else if (type == 1)
            {
                console.log(`   --Request Type = Found`);
            }
            else if (type == 2)
            {
                console.log(`   --Request Type = Not Found`);
            }
            else if (type == 3)
            {
                console.log(`   --Request Type = Busy`);
            }
            console.log(`   --Image File Extension(s): ${extRaw.toUpperCase()}`);
            console.log(`   --Image File Name(s): ${name}\n`);

            var resType = 2; // create query for response
            var resCount = 0; // count how many are returned

            // check packet contents are ok
            var ok = false;

            if (version == 7 && type == 0 && fname !="")
            {
                ok = true; // allow request
            }

            if (!ok) // bad request
            {
                imageData = Buffer.alloc(1); // allocate bit
                ITPpacket.init(version, 0, 3, currentSeq, currentTime, 0, 0, res); // create a packet

                packet = ITPpacket.getPacket(); // build packet
                sock.write(packet); // send packet
            }
            else // good request
            {
                // get requested images
                fs.readdir('./images', (err, list) => {
                
                    for (let i = 0; i < list.length; i++)
                    {
                        if (fname == list[i])
                        {
                            resType = 1;
                            resCount++;
                        }
                    }
                
                    var imageData; // data for image
                    var packet; // packet to send

                    if (resType == 2) // image(s) not found
                    {
                        imageData = Buffer.alloc(1); // allocate bit
                        ITPpacket.init(version, 0, resType, currentSeq, currentTime, 0, 0, imageData); // create a packet

                        packet = ITPpacket.getPacket(); // build packet
                        sock.write(packet); // send packet
                    }
                    else if (resType == 1) // image(s) found
                    {
                        fs.readFile("./images/" + fname, (err, res) => {
                        
                            if (err)
                            {
                                throw err;
                            }

                            let size = res.length; // get size
                            imageData = res;

                            ITPpacket.init(version, 1, resType, currentSeq, currentTime, ext, size, imageData); // create a packet

                            packet = ITPpacket.getPacket(); // build packet
                            sock.write(packet); // send packet
                        })
                    }
                })
            }
        }    
    }
};
