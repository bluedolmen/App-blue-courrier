'''
Created on 4 mars 2013

@author: Brice
'''
import threading
import datetime
import time
import os
import logging

class _TempfileCleaner(threading.Thread):
    '''
    classdocs
    '''
    
    LOGGER = logging.getLogger("TempfileCleaner")
    CHECK_INTERVAL_SEC = 60
    DEFAULT_TTL_SEC = 60 # ms
    _waitingFiles = []
    _lock = threading.Semaphore()

    def __init__(self):
        '''
        Constructor
        '''
        threading.Thread.__init__(self)
    
    def run(self):
        while (True):
            time.sleep(self.CHECK_INTERVAL_SEC)
            self._clean_up_run() 
        
    def _clean_up_run(self):
        self._lock.acquire()
        now = datetime.datetime.now()
        stillWaitingFiles = []
        for expire_date, file_path in self._waitingFiles[:]:
            self.LOGGER.debug("Checking '%s'" % file_path)
            
            if (expire_date - now).total_seconds() <= 0:             
                try:
                    os.remove(file_path)
                    self.LOGGER.info("Removed '%s'" % file_path)
                    continue
                except PermissionError:
                    self.LOGGER.debug("Not yet removeable")
                    pass
            else:
                self.LOGGER.debug("Not expired")

            stillWaitingFiles.append((expire_date, file_path))
            
        self._waitingFiles = stillWaitingFiles
        self._lock.release()        
        
    def add(self, file_path, ttl = None):
        
        now = datetime.datetime.now();
        ttl = ttl if None != ttl else self.DEFAULT_TTL_SEC
        expire_date = now + datetime.timedelta(seconds=ttl)
        
        self._lock.acquire()
        self._waitingFiles.append((expire_date, file_path))
        self._lock.release()

TempFileCleaner = _TempfileCleaner()
TempFileCleaner.start() 
