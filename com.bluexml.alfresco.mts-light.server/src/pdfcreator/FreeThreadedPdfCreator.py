# -*- coding: utf-8 -*-
'''
Created on 26 févr. 2013
Processor that uses free-threading COM model to pilot PDFCreator

@author: Brice
'''
import sys, os, threading, queue
sys.coinit_flags=0 # HAS TO BE MADE BEFORE pythoncom initialization 
import logging

from pythoncom import CoInitializeEx, CoUninitialize, COINIT_MULTITHREADED # @UnresolvedImport
from win32com.client import DispatchWithEvents
from win32print import GetDefaultPrinter, SetDefaultPrinter 

LOGGER = logging.getLogger("PdfCreator")

_DEFAULT_OUTPUT_DIRNAME = "C:\temp"
_JOB_TIMEOUT_SEC = 10

class _PdfCreatorCallback(object):
    
    def OneError(self):
        PdfTransformerProcessor._signalReady()
    
    def OneReady(self):
        PdfTransformerProcessor._signalReady()

class _PdfTransformerProcessor(threading.Thread):
    
    _transformationJobQueue = queue.Queue();
    _PDFCreator = None
    _options = None
    _oldOptions = None
    _currentPrinter = None
    _current = None
    
    def __init__(self):
            
        threading.Thread.__init__(self)

        # First create the object
        PDFCreator = DispatchWithEvents('PDFCreator.clsPDFCreator', _PdfCreatorCallback)
        PDFCreator.cStart("/NoProcessingAtStartup", 1)
        self._PDFCreator = PDFCreator
        
        self._oldOptions = PDFCreator.cOptions
        self._currentPrinter = GetDefaultPrinter()
        
        options = PDFCreator.cOptions
        options.UseAutosave = 1
        options.UseAutosaveDirectory = 1
        options.AutosaveFormat = 0 # 0 = PDF
        self._options = options
    
    
    def run(self):
        
        SetDefaultPrinter('PDFCreator')
        self._PDFCreator.cClearCache
        self._PDFCreator.cPrinterStop = 0
        
        while (True):
            self._current = self._transformationJobQueue.get(True)
            if (None == self._current):
                # signal end of processing
                break
            
            self.__process()
    
    def _signalReady(self):
        self.fileAvailable.release()
    
    def __process(self):
        
        self.fileAvailable = threading.Semaphore(0)
        
        ifname, onSuccess, onFailure = self._current
        worker = _Worker(self._PDFCreator, self._options, ifname)
        worker.start()
        worker.join(_JOB_TIMEOUT_SEC) # join(timeout in sec)
        
        errorMessage = None
        outputFileLocation = os.path.normpath(worker.outputDirname + '/' + worker.outputFilename)
        self.outputFileLocation = outputFileLocation
        
        if worker.isAlive():
            # TODO: Process timeout here (should kill process)
            errorMessage = "Time is Out!"
        else:
            
            self.fileAvailable.acquire(True, 5) # Wait for a signal of availability from PDFCreator
                        
            exists = os.path.exists(outputFileLocation)
            if (not exists):
                if None != worker.errorMessage:
                    errorMessage = worker.errorMessage
                else:
                    # The file is not converted, an error has probably occurred originating from PDFCreator
                    errorNumber = self._PDFCreator.cErrorDetail("Number")
                    errorDescription = self._PDFCreator.cErrorDetail("Description")
                    errorMessage = "[%s] %s" % (errorNumber, errorDescription)
            
        if None != errorMessage:
            LOGGER.error(errorMessage)
            if None != onFailure:
                onFailure(errorMessage)
            
        elif None != onSuccess:
            LOGGER.info("File successfully processed to '%s'" % outputFileLocation)
            onSuccess(outputFileLocation)
                
        self._transformationJobQueue.task_done()

    def appendJob(self, ifname, onSuccess = None, onFailure = None):
        if (None == ifname or "" == ifname):
            raise Exception("IllegalArgumentException! The provided filename has to be a non-null and non-empty string!")
        
        self._transformationJobQueue.put((ifname, onSuccess, onFailure))

    def stop(self, discardExistingJobs = False):
        
        if (discardExistingJobs):
            try:
                self._transformationJobQueue.get(False) # Clear the queue
            except queue.Empty:
                pass
        self._transformationJobQueue.put(None) # signal ends to the main loop
        
        self._PDFCreator.cOptions = self._oldOptions
        self._PDFCreator.cSaveOptions(self._previousOptions)
        SetDefaultPrinter(self._previousPrinter)
        
        self._PDFCreator.cClose
        self._PDFCreator = None
        
class _Worker(threading.Thread):
    
    errorMessage = None
    
    def __init__(self, PDFCreator, options, ifname):

        threading.Thread.__init__(self)
        
        self._PDFCreator = PDFCreator
        self._ifname = ifname
        self._options = options
        
        filename = os.path.basename(ifname)
        basefilename = os.path.splitext(filename)[0]
        self.outputFilename = basefilename + ".pdf"

        dirname = os.path.dirname(ifname)
        if dirname == "":
            dirname = os.path.dirname(_DEFAULT_OUTPUT_DIRNAME)
        self.outputDirname = dirname
        
    def run(self):
        
        LOGGER.debug("Processing file '%s'" % self._ifname);
        
        # First step - initialize COM
        CoInitializeEx(COINIT_MULTITHREADED)
        
        self._options.AutosaveDirectory = self.outputDirname
        self._options.AutosaveFilename = self.outputFilename
        self._PDFCreator.cOptions = self._options
        self._PDFCreator.cSaveOptions(self._options)
        
        self._PDFCreator.cPrintFile(self._ifname)
        
        CoUninitialize()

    def stop(self):
        self._PDFCreator = None

        
PdfTransformerProcessor = _PdfTransformerProcessor()
PdfTransformerProcessor.start()
    
