// Some code need to be added here, that are common for the module
// generate timer and sequence number values, and the cap value
let timer = Math.round(Math.random() * (999-1)) + 1;
let seqNum = Math.round(Math.random() * (999-1)) + 1;
let maxTime = Math.pow(2, 32);

module.exports = {
    
    init: function() {
       
        // function to update the timer
        function updateTimer() 
        {
            if (timer >= maxTime) // check if max has been reached
            {
                timer = 0; // reset the time
            }
            
            timer++; // increment timer
        }

        // set updateTimer to run every 10 miliseconds
        setInterval(updateTimer, 10);
    },

    
    //getSequenceNumber: return the current sequence number + 1
    getSequenceNumber: function() {
      
        seqNum++; // increment sequence number
        return seqNum;
    },

    //getTimestamp: return the current timer value
    getTimestamp: function() {

        return timer;
    }
};