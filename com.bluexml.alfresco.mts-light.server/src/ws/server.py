# -*- coding: utf-8 -*-
'''
Created on 15 févr. 2013

@author: Brice
'''

VERSION=1.0

from pdfcreator.FreeThreadedPdfCreator import PdfTransformerProcessor
from ws.bottle import request, route, run, HTTPError, HTTPResponse
import os, tempfile,  threading, mimetypes, logging
from ws.TempfileCleaner import TempFileCleaner

LOGGER = logging.getLogger("WS-Server")

class WorkerOutput(object):
    
    outputFileLocation = None
    errorMessage = None
    
    def getHttpResponse(self):
        
        if (None != self.outputFileLocation):
            return self._httpResponse(self.outputFileLocation)
        
        elif (None != self.errorMessage):
            LOGGER.error(self.errorMessage)
            return HTTPError(500, self.errorMessage)
        
    def _httpResponse(self, fileLocation):
        headers = dict()
    
        if not os.path.exists(fileLocation) or not os.path.isfile(fileLocation):
            message = "File does not exist: '%s'" % fileLocation
            LOGGER.error(message)
            return HTTPError(404, message)
        
        if not os.access(fileLocation, os.R_OK):
            message = "You do not have permission to access this file: '%s'" % fileLocation
            LOGGER.error(message)
            return HTTPError(403, message)
    
        mimetype, encoding = mimetypes.guess_type(fileLocation)
        if mimetype: headers['Content-Type'] = mimetype
        if encoding: headers['Content-Encoding'] = encoding
            
    #        if download:
    #            download = os.path.basename(filename if download == True else download)
    #            headers['Content-Disposition'] = 'attachment; filename="%s"' % download
    
        stats = os.stat(fileLocation)
        headers['Content-Length'] = stats.st_size
        
        body = '' if request.method == 'HEAD' else open(fileLocation, 'rb')
        return HTTPResponse(body, **headers)


@route('/transform', method='POST')
def transform():
    upload = request.files.get('upload')
    name_, ext = os.path.splitext(upload.filename) # @UnusedVariable

    tempFile_ = tempfile.NamedTemporaryFile(suffix = ext, delete = False)
    tempFile_.write(upload.file.read());
    tempFile_.close()
    LOGGER.debug("%s' -> '%s" % (upload.filename, tempFile_.name) )
    
    lock = threading.Semaphore(0)
    workerOutput = WorkerOutput() # Mutable object for callback modifications
        
    def endOfProcess():
        lock.release()
        TempFileCleaner.add(tempFile_.name)
    
    def onSuccess(outputFileLocation_):
        workerOutput.outputFileLocation = outputFileLocation_
        TempFileCleaner.add(outputFileLocation_, ttl = 300) # removed after 5 minutes
        endOfProcess()
    
    def onFailure(message):
        workerOutput.errorMessage = "Transformation failure: " + message
        endOfProcess()
    
    PdfTransformerProcessor.appendJob(tempFile_.name, onSuccess, onFailure)
    lock.acquire()
    
    return workerOutput.getHttpResponse()

@route('/info', method='GET')
def info():
    response = {}
    response["version"] = VERSION
    
    return response

def launch(host = "0.0.0.0", port = "80"):
    run(host=host, port=port)
