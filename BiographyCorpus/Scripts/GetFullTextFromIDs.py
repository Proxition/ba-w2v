#!/usr/bin/python
# -*- coding: utf-8 -*

"""Wikipedia Summary & Content Extractor

Uses the IDs and Titles obtained from /WikiCat/DBPedia/Scripts/GetTilesFromDBPedia.py and split by /WikiCat/DBPedia/Scripts/SplitIDs.py
Downloads summary or full content version of Wikipedia articles and saves to CSV file
Change flag summary in line 26 to switch between summary and content

This script requires the libraries in lines 16-22 be installed within the Python
environment you are running this script in.

adapted from https://stackoverflow.com/questions/23351103/extract-the-main-article-text-from-a-wikipedia-page-using-python
"""

import urllib.request
import requests
from urllib.error import URLError
import time
import threading
import wikipedia
import re

url = 'https://en.wikipedia.org/w/api.php?action=query&prop=revisions&rvprop=content&format=json&formatversion=2&pageids='

# set summary to False to extract full content version of files
summary = False

# use threading to increase processing speed
class myThread (threading.Thread):
	def __init__(self, threadID, name):
		threading.Thread.__init__(self)
		self.threadID = threadID
		self.name = name
	def run(self):
		print("Worker No. " + self.name + " was started.")
		filename = "../Data/splitIDFiles/titleLinks" + self.name + ".csv" 
		start_time = time.time()
		counter = 1
		with open(filename, "r") as f:
			resultString = ''
			for line in f:
				try:
					resultString += getFullJSON(line.split(",")[0],0)
				except TypeError:
					print('TyperError for: ' + line)
				# only write after 50 pages have been processed -> speed increase
				if (counter % 50 == 0):
					threadLock.acquire(1)
					if(summary):						
						with open("../Data/fullTextSummary.csv","a") as f:
							f.write(resultString)
							resultString = ''
					else:
						with open("../Data/fullTextContent.csv","a") as f:
							f.write(resultString)
							resultString = ''
					threadLock.release()
					pps = counter/(time.time() - start_time)
					print('Thread: ' + self.name + '; Pages processed: ' + str(counter) + '; Pages per second: ' + str(counter/(time.time() - start_time)))
				counter += 1
			
# extract data from one page with the given pageTitle and 
def getFullJSON(pageTitle, retries):
	result = ""
	try:
		page = wikipedia.page(pageTitle)
		categories = page.categories
		data = ""
		if(summary):
			data = page.summary
		else:
			data = page.content
		data = re.compile(r'\n').sub("", data)
		data = re.compile(r'\t').sub("", data)
		result = str(categories) + '\t' + data + '\n'
	# error handling for various exceptions, often with retry count of up to 3, then the url is ignored
	except wikipedia.exceptions.PageError:
		if(retries > 3):
			print("Error for URL: " + url + str(pageTitle) + " , exceeded retries.")
			return ''
		else:
			print("Error for URL: " + url + str(pageTitle) + " , trying again...")
			retries += 1
			time.sleep(0.5)
			getFullJSON(pageTitle, retries)
	except wikipedia.exceptions.DisambiguationError:
		print("Non-unique URL, will be skipped: " + str(pageTitle) + ', url: ' + url)
		return ''
	except requests.exceptions.ConnectionError:
		if(retries > 3):
			print("Error for URL: " + url + str(pageTitle) + " , exceeded retries.")
			return ''
		else:
			print("Error for URL: " + url + str(pageTitle) + " , trying again...")
			retries += 1
			time.sleep(0.5)
			getFullJSON(pageTitle, retries)
	return(result)

# fixed number of 112 threads, since one thread is tasked with handling 10000 urls
lis = range(112)
threadList = ["{:01d}".format(x) for x in lis]
print(threadList)
threadLock = threading.Lock()
threads = []

# start all threads
for name in threadList:
	thread = myThread(name, name)
	thread.start()
	threads.append(thread)
	
# wait for all threads to finish
for t in threads:
    t.join()
    print('Thread: ' + t.name() + ' is shutting down.')
print("Exiting Main Thread")
