
const elasticsearch = require('elasticsearch');
const client = new elasticsearch.Client({
  host: process.env.ELASTICSEARCH_BASE_URL,
  log: process.env.ELASTICSEARCH_CLIENT_LOG_TYPE
});

function makeElasticService(config) {
  return {
    update,
    create,
    search,
    deleteByQuery,
    deleteById,
    multiSearch,
    elasticsearchStatus,
    createIndex
  }

  function update(body, overwrite) {
    const elasticQuery = Object.assign({ body }, config, overwrite)

    return client.update(elasticQuery)
  }

  function create(body, overwrite) {
    const elasticQuery = Object.assign({ body }, config, overwrite)

    return client.index(elasticQuery)
  }

  function search(body, overwrite) {
    const elasticQuery = Object.assign({ body }, config, overwrite)
    return client.search(elasticQuery).then(response => {
      return response.hits.hits.map(hit => {
        hit._source["_score"] = hit._score
        return hit._source
      })
    })
  }

  function deleteByQuery(body, overwrite) {
    const elasticQuery = Object.assign({ body }, config, overwrite)

    return client.deleteByQuery(elasticQuery)
  }
  
  function deleteById(overwrite) {
    const elasticQuery = Object.assign({}, config, overwrite)

    return client.delete(elasticQuery)
  }

  function multiSearch(queries) {
    if(queries.length > 0) {
      return client.msearch({body: queries}).then(responses => {
        let result = [];
        responses.responses.forEach( response => {
          response.hits.hits.forEach(hit => {
              hit._source["_score"] = hit._score
              result.push( hit._source)
            })
        })
        return result;
      })
    } else {
      return new Promise( (resolve) => {resolve([])} );
    }
  }

  function elasticsearchStatus(callback) {
    try {
        client.ping({
            requestTimeout: 1000
        }, function (error) {
            if (error) {
                console.error("Couldn't ping elastic")
                callback(false);
            } else {
                console.log("elasticSearch ready.")
                callback(true);
            }
        });
    } catch (error) {
        console.error(error)
        callback(false)
    }
    return;
  }

  function createIndex(indexToCreate) {
    return new Promise((resolve, reject) => {
        axios.head(process.env.ELASTICSEARCH_BASE_URL + indexToCreate).then(() => {
            resolve("index " + indexToCreate + " is already created")
        }).catch(error => {
            axios.put(process.env.ELASTICSEARCH_BASE_URL + indexToCreate).then(() => {
                resolve("Index " + indexToCreate + " created")
            }).catch(error => {
                reject(error)
            })
        })
    })
  }
}

module.exports = makeElasticService
