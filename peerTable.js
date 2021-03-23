// You may need to add some delectation here
let singleton = require('./Singleton');
//let net = require('net');

let table = [0, 0]; // peer table

module.export = {

    // function to add a new peer to the table
    joinPeer: function (peer)
    {
        for (let p in table)
        {
            if (table[p] == 0) // if the current slot is empty
            {
                table[p] = peer; // add peer
                break; // break once added
            }
        }
    },

    // function to get a specific peer
    getPeer: function (slot)
    {
        return table[slot];
    },
    
    // function to count the number of filled slots in the peer table
    countPeers: function ()
    {
        let count = 0;

        for (let p in table) // for all slots in the table
        {
            if (table[p] != 0) // if the slot has a peer
            {
                count++;
            }
        }

        return count; // return number of peers in the table
    },

    // function to check if the table is full
    isFull: function ()
    {
        let count = 0;

        for (let p in table) // for all slots in the table
        {
            if (table[p] != 0) // if the slot has a peer
            {
                count++;
            }
        } 

        if (count == table.length) // no slots available
        {
            return true;
        }
        else if (count < table.length) // slot(s) available
        {
            return false;
        }
    }
};