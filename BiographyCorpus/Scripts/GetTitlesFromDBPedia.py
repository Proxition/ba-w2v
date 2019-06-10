#!/usr/bin/python
# -*- coding: utf-8 -*

"""Wikipedia Title Extractor

Uses SPARQL queries to extract all unique titles and DBPedia URLs from all DBPedia objects with the tag 'person'. Saves the result in the file /WikiCat/Data/titleLinks.csv

This script requires the libraries in lines 12-16 be installed within the Python
environment you are running this script in.
"""

from SPARQLWrapper import SPARQLWrapper, JSON
import math
import threading
from urllib.error import URLError
from SPARQLWrapper.SPARQLExceptions import EndPointInternalError

# executing the SPARQL Query to get all titles and urls. 
# crawling over all results with person tag requires threads and offsets:
# base: 150.000 multiplied by the index of the thread(so thread with index 3 starts at base 450.000)
# i: iteration of the thread. since one SPARQL call can only return up to 10.000 results, 
#	 15 calls have to be made to crawl through all 150.000 results that one thread is responsible for
def executeSparqlQuery(base, i):
	try:
		sparql.setQuery("""
				PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
				select * { ?person a dbo:Person ; rdfs:label ?label FILTER(LANG(?label) = "en")} 
				LIMIT 10000
				OFFSET """ + str(base+i))
		sparql.setReturnFormat(JSON)
		results = sparql.query().convert()
		resultArray = []
		try:
			for result in results["results"]["bindings"]:
				if(result is None):
					continue
				else:
					resultArray.append(result["label"]["value"] + ',' + result["person"]["value"])
			if(resultArray is None):
				print('Thread: ' + self.name + '; repeat Cycle due to resultArray == None: ' + str(i))
				executeSparqlQuery(base, i)
			else:
				return resultArray
		except TypeError:
			print('Thread: ' + self.name + '; Skipped cycle due to TypeError: ' + str(i))
			executeSparqlQuery(base, i)
	except URLError:
		executeSparqlQuery(base, i)
	except EndPointInternalError:
		executeSparqlQuery(base, i)

# one thread, that downloads all assigned 150.000 person titles and urls
class myThread (threading.Thread):
	def __init__(self, threadID, name):
		threading.Thread.__init__(self)
		self.threadID = threadID
		self.name = name
	def run(self):
		print("Worker No. " + self.name + " was started.")
		index = int(name)
		if(index == 0):
			base = 0
		else:
			base = 150000 * index
		for i in range(1, 15):
			resultArray = []
			retries = 0
			while(retries < 10):
				resultArray = executeSparqlQuery(base, i*10000)
				if(resultArray is None):
					print('Thread: ' + self.name + '; Repeat cycle due to results being empty: ' + str(i))
					retries += 1
				else:
					break
			threadLock.acquire(1)
			with open("../Data/titleLinks.csv","a") as f:
				for x in resultArray:
					if(x is None):
						threadLock.release()
						continue
					f.write(x + "\n")
			threadLock.release()
			print('Thread: ' + self.name + '; Cycle processed: ' + str(i))

# get the number of all pages with person tag and save in "count"
sparql = SPARQLWrapper("http://dbpedia.org/sparql")
sparql.setQuery("""
		PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
		select count(*) { ?person a dbo:Person ; rdfs:label ?label FILTER(LANG(?label) = "en")}
		""")
sparql.setReturnFormat(JSON)
results = sparql.query().convert()
count = int(results["results"]["bindings"][0]["callret-0"]["value"])
print('Number of objects with "person tag: "' + str(count))

threadLock = threading.Lock()
threads = []

# use 14 threads to iterate over all pages with person tag
threadList = [format(x,'d') for x in range(14)]
for name in threadList:
	thread = myThread(name, name)
	thread.start()
	threads.append(thread)
	
for t in threads:
    t.join()
print("Exiting Main Thread")
