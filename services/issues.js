const {issues} = require('../data');
const stats = require('stats-lite');

/* This function updates the information of existing issues, or add the new
information if the issue is not already present on database. */
const saveIssues = async (repository, data) => {
    const saveData = data
        .filter(item => !item.hasOwnProperty('pull_request'))
        .map(item => (
            {
                replaceOne: {
                    upsert: true,
                    filter: {
                        issueId: item.id
                    },
                    replacement: {
                        repository: repository,
                        updateTime: new Date(item.updated_at),
                        creationTime: new Date(item.created_at),
                        issueId: item.id,
                        state: item.state,
                        labels: item.labels,
                        metadata: item,
                    }
                }
            }
        ));
    await issues.bulkWrite(saveData);
}

const getIssues = async (repository, state) => {
    const query = state ? {repository, state} : {repository};
    return await issues.find(query).sort([['update_time', -1]]);
}

const numberDays = milli => {
    const minutes = Math.floor(milli / 60000);
    const hours = Math.round(minutes / 60);
    return Math.round(hours / 24);
}

const openIssuesStats = async repository => {
    const res = await issues.find({repository, state: 'open'});
    const currentDate = Date.now();
    const diffTime = res.map(item => currentDate - item.creationTime.getTime());
    const mean = numberDays(stats.mean(diffTime));
    const std = numberDays(stats.stdev(diffTime));
    return [mean, std];
}

const openIssuesCount = async repository => {
    return await issues.find({repository, state: 'open'}).countDocuments();
}

const timeCreationOldestDocument = async repository => {
    const res = await issues.findOne({repository}).sort({_id: 1});
    return res._id.getTimestamp();
}

/* Every issue metadata contains the fields *created_at* and *closed_at*. This
function iterates over all issues and extracts these fields. Then, it increments
the number of issues on day X if there is an issue whose *created_at* metadata
is from day X, and decrements otherwise. The number of issues is accumulated
over the days.
*/
const hist = async repository => {
    const res = await issues.find({repository});
    const hist = res
        .reduce((previous, current) => {
            let date = new Date(current.metadata.created_at);
            previous.push([date, 1]);
            if (current.metadata.closed_at != null) {
                date = new Date(current.metadata.closed_at);
                previous.push([date, -1]);
            }
            return previous;
        }, [])
        .sort((a, b) => a[0] - b[0])
        .map(item => [item[0].toISOString().split('T')[0], item[1]])
        .reduce((previous, current) => {
            previous.total += current[1];
            previous.hist[current[0]] = previous.total;
            return previous;
        }, {hist: {}, total : 0});
    if (Object.keys(hist.hist).length === 0) {
        return {};
    }
    /* Get the creation date of the first document and retrieve the last day
    before this date and all days after this date. */
    const timeOldest = await timeCreationOldestDocument(repository);
    const keys = Object.keys(hist.hist);
    for (let i = 0; i < keys.length - 1; i++) {
        const date = new Date(keys[i]);
        const nextDate = new Date(keys[i + 1]);
        if (date < timeOldest && nextDate < timeOldest) {
            delete hist.hist[keys[i]];
        } else {
            break;
        }
    }
    return hist.hist;
}

const dateRecentIssue = async repository => {
    const res = await issues.findOne({repository}).sort([['updateTime', -1]]);
    return res ? res.updateTime : null;
}

module.exports = {
    getIssues,
    saveIssues,
    openIssuesStats,
    openIssuesCount,
    hist,
    dateRecentIssue,
};
