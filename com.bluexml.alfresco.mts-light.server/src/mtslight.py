# -*- coding: utf-8 -*-
'''
Created on 28 févr. 2013

@author: Brice
'''

import sys
sys.coinit_flags=0 # HAS TO BE MADE BEFORE other initializations
 
import argparse, logging
from ws import server

args = None

def parseArgs():
    
    global args
    parser = argparse.ArgumentParser(description='Launch the MTS-Light Server')
    parser.add_argument(
        '-p', '--port',
        default="8080", 
        help='the port on which to listen incoming requests'
    )
    parser.add_argument(
        '--host', 
        default="0.0.0.0", 
        help='the host (address) on which to listen incoming requests'
    )
    parser.add_argument(
        '-log', '--log',  
        default="WARNING",
        choices=['DEBUG', 'INFO', 'WARNING', 'ERROR', 'CRITICAL'],
        help='the level of logging verbosity'
    )
    
    
    args = parser.parse_args()
    

if __name__ == '__main__':
        
    parseArgs()
    logging.basicConfig(level=args.log)
    server.launch(host=args.host, port=args.port)

    