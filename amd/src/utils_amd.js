/* jshint ignore:start */
define(['jquery','core/log', 'filter_poodll/uploader'], function($, log, uploader) {

    "use strict"; // jshint ;_;

    log.debug('Filter PoodLL: utils initialising');

    return {
		timeouthandles: [],
       // Call Upload file from drawingboard a, first handle autosave bits and pieces
        WhiteboardUploadHandler: function(recid,wboard,opts) {
            // Save button disabling a little risky db perm. fails publish "startdrawing" after mode change
            var savebutton = $('#' + recid + '_btn_upload_whiteboard')[0];
            savebutton.disabled=true;
            clearTimeout(this.timeouthandles[recid]);
            //call the file upload
            var cvs = this.getCvs(recid,wboard,opts);
            this.pokeVectorData(recid,wboard,opts);
            uploader.uploadFile(cvs.toDataURL(),'image');
        },        
        getCvs: function(recid,wboard){
            if(recid.indexOf('drawingboard_')==0){
                var cvs = wboard.canvas;
            }else{
            	var cvs =wboard.canvasForExport();
            }//end of of drawing board
            return cvs;
        },

        escapeColon: function(thestring){
                return thestring.replace(/:/, '\\:');
        },
        
        pokeVectorData: function(recid,wboard,opts){
          	var vectordata = "";
            if(recid.indexOf('drawingboard_')==0){
                vectordata = JSON.stringify(wboard.history , null,2);
            }else{
                //only LC has vector data it seems
                vectordata = JSON.stringify(wboard.getSnapshot());
            }//end of of drawing board
            
            //need to do the poke here
            if(typeof opts['vectorcontrol'] !== 'undefined' && opts['vectorcontrol'] !==''){
                //the moodle question has a colon in the field ids, so we need to escape that away
              $('#' + this.escapeColon(opts['vectorcontrol'])).val(vectordata);
                log.debug('Vectorcontrol:' + opts['vectorcontrol'] );
                log.debug('Vectordata:' + vectordata );
           }
        //end of poke vectordata
        },
        
                
        concatenateWavBlobs: function(blobs,callback){
           
           //fetch our header
           var allbytes = []; //this will be an array of arraybuffers
            var loadedblobs=0;
            var totalbytes=0;
           
            // fetch the blob data
            var lng = blobs.length;
            for (var i = 0; i < lng; i++){
                var fileReader = new FileReader();
                fileReader.onload = function() {
                    //load blob into arraybuffer
                    var ab = this.result;
                    
                    //remove header and add audiodata to the all data array
                    //the slice is from(inclusive) to end(exclusive)
                    var audiodata=ab.slice(44);
                    totalbytes+=audiodata.byteLength;
                    allbytes.push(audiodata);
                    loadedblobs++;
                    
                    //finally add the header and do callback if at end
                    if(loadedblobs==lng){
                        //get header from last blob, and just adjust the data length
                        var header = ab.slice(0,44);
                        var headerview = new DataView(header);
                        headerview.setUint32(40,totalbytes, true);
                        allbytes.unshift(header);
                         
                        //make our final binary blob and pass it to callback
                        var wavblob = new Blob (allbytes, { type : 'audio/wav' } );
                        callback(wavblob);
                    }
                };
                fileReader.readAsArrayBuffer(blobs[i]);
                
            }//end of i loop
            
        } //end of concatenateWavBlobs
        
    };
});