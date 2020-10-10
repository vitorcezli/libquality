const axios = require('axios');
const {search: db} = require('../data');
const {github: {token: GITHUB_TOKEN}} = require('../config');
const headers = {Authorization: `token ${GITHUB_TOKEN}`};

/* Search for the main information about the repository, that are returned by
/search/repository endpoint of GitHub API. This information alone contains most
of the information necessary for Phase III (eg. number of stars and contributors).
However even for issues it will be used, because after it is executed it will
return the repository name on format /:owner/:repo, which is necessary to save
information about the issues.
*/
const search = async repository => {
    /* Query parameters are directly defined in URL because Axios would encode
    the '+' character, which is necessary to request the GitHub API. */
    const url = 'https://api.github.com/search/repositories?' +
        `q=${repository}+in:name&per_page=1`;
    try {
        const res = await axios.get(url, {headers});
        if (res.data.total_count) {
            await db({repository: res.data.items[0].full_name}).save();
            return res.data.items[0];
        };
        return null;
    } catch (err) {
        return null;
    }
}

/* Retrieve data of a repository from many pages of GitHub API. This function
has the efficiency of requesting data about many pages in asynchronously. */
const fetchDataPages = async (repository, field, moreParams, numberPages) => {
    const url = `https://api.github.com/repos/${repository}/${field}`;
    let promises = [];
    for (let i = 0; i < numberPages; i++) {
        const params = {per_page: 100, page: i + 1, ...moreParams};
        const promise = axios.get(url, {params, headers});
        promises.push(promise);
    }
    let data = [];
    try {
        const results = await Promise.all(promises);
        for (const result of results) {
            data = data.concat(result.data);
        }
        return data;
    } catch (err) {
        return [];
    }
}

/* Iterates through the pages to retrieve data. It must be used for queries that
do not know the number of necessary pages to retrieve all data. */
const fetchAllData = async (repository, field, moreParams) => {
    const url = `https://api.github.com/repos/${repository}/${field}`;
    let data = [];
    let page = 1;
    while (true) {
        try {
            const params = {per_page: 100, page, ...moreParams};
            const res = await axios.get(url, {params, headers});
            data = data.concat(res.data);
            if (res.data.length < 100) {
                return data;
            }
            page++;
        } catch (err) {
            return [];
        }
    }
}


module.exports = {search, fetchDataPages, fetchAllData};
