# -*- coding: utf-8 -*-
'''
Created on 28 févr. 2013

@author: Brice
'''

import sys
sys.coinit_flags=0 # HAS TO BE MADE BEFORE other initializations 

from ws import server

if __name__ == '__main__':
        
    server.launch(port="8080")
    
    