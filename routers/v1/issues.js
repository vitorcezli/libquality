const express = require('express');
const app = express.Router();
const repository = require('../../services/repository');
const issues = require('../../services/issues');

/* First middleware, that verifies if the data passed by the user is valid,
like if the repository is valid. Then, it retrieves from GitHub the data of
the repository whose information will be returned to the user. */
app.use('/:repo/*', async (req, res, next) => {
    const result = await repository.search(req.params.repo);
    if (!result) {
        return res.sendStatus(400);
    }
    await prepareData(result);
    req.result = result;
    next();
});

const fetchSaveOpenIssues = async (repo, numPages) => {
    const data = await repository.fetchDataPages(
        repo, 'issues', {state: 'open'}, numPages
    );
    await issues.saveIssues(repo, data);
}

const fetchSaveAllIssuesSince = async (repo, since) => {
    const data = await repository.fetchAllData(
        repo, 'issues', {state: 'all', since}
    );
    await issues.saveIssues(repo, data);
}

const prepareData = async result => {
    const since = await issues.dateRecentIssue(result.full_name);
    if (!since) {
        /* Fetch from GitHub all open issues of the repository, in the case
        where no information about the repository is saved on database. */
        const numPages = Math.ceil(result.open_issues / 100);
        await fetchSaveOpenIssues(result.full_name, numPages);
    } else {
        /* Fetch from GitHub just information that are not on database. It makes
        the request much faster. */
        await fetchSaveAllIssuesSince(result.full_name, since);
    }
}

app.get('/:repo/count', async (req, res) => {
    const count = await issues.openIssuesCount(req.result.full_name);
    return res.json({count});
});

app.get('/:repo/stats', async (req, res) => {
    const [mean, std] = await issues.openIssuesStats(req.result.full_name);
    return res.json({mean, std});
});

app.get('/:repo/hist', async (req, res) => {
    const histDict = await issues.hist(req.result.full_name);
    let hist = [];
    for (const key of Object.keys(histDict)) {
        hist.push({day: key, count: histDict[key]});
    }
    return res.json({hist});
});

module.exports = app;
