// MongoDB will be mocked for testing.
const mongoose = require('mongoose');
const {Mockgoose} = require('mockgoose');
const mockgoose = new Mockgoose(mongoose);

// Library that will be used for testing.
const issues = require('./issues');

// Libraries used for testing.
const {issues: db} = require('../data');
const {expect} = require('chai');
const sinon = require('sinon');

// Files used to mock the return of GitHub API requests.
const data1 = require('../test_data/issues1.json');
const data2 = require('../test_data/issues2.json');
const data3 = require('../test_data/issues3.json');
const data4 = require('../test_data/issues4.json');
const data5 = require('../test_data/issues5.json');

describe('Issues', () => {

    before(async () => {
        await mockgoose.prepareStorage();
        await mongoose.connect('mongodb://mocking.com/mockdb', {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useCreateIndex: true,
        });
    });

    after(async () => {
        await mongoose.disconnect();
        await mockgoose.shutdown();
    });

    beforeEach(async () => {
        await mockgoose.helper.reset();
    });

    it('Should save the issues', async () => {
        await issues.saveIssues('isocpp/CppCoreGuidelines', data1);
        const res = await db.find({}).sort([['updateTime', -1]]);
        expect(res.length).to.equal(2);
        expect(res[0].repository).to.deep.equal('isocpp/CppCoreGuidelines');
        expect(res[0].issueId).to.deep.equal(data1[0].id);
        expect(res[0].state).to.deep.equal(data1[0].state);
        expect(res[0].labels).to.deep.equal(data1[0].labels);
        expect(res[0].updateTime).to.deep.equal(new Date(data1[0].updated_at));
        expect(res[0].creationTime).to.deep.equal(new Date(data1[0].created_at));
        expect(res[0].metadata).to.deep.equal(data1[0]);
        expect(res[1].repository).to.deep.equal('isocpp/CppCoreGuidelines');
        expect(res[1].issueId).to.deep.equal(data1[1].id);
        expect(res[1].state).to.deep.equal(data1[1].state);
        expect(res[1].labels).to.deep.equal(data1[1].labels);
        expect(res[1].updateTime).to.deep.equal(new Date(data1[1].updated_at));
        expect(res[1].creationTime).to.deep.equal(new Date(data1[1].created_at));
        expect(res[1].metadata).to.deep.equal(data1[1]);
    });

    it('Should ignore pull requests', async () => {
        await issues.saveIssues('isocpp/CppCoreGuidelines', data3);
        const res = await db.find({});
        expect(res.length).to.equal(1);
        expect(res[0].repository).to.deep.equal('isocpp/CppCoreGuidelines');
        expect(res[0].issueId).to.deep.equal(data3[1].id);
        expect(res[0].state).to.deep.equal(data3[1].state);
        expect(res[0].labels).to.deep.equal(data3[1].labels);
        expect(res[0].updateTime).to.deep.equal(new Date(data3[1].updated_at));
        expect(res[0].creationTime).to.deep.equal(new Date(data3[1].created_at));
        expect(res[0].metadata).to.deep.equal(data3[1]);
    });

    it('Should return null for a repository inexistent on database', async () => {
        const date = await issues.dateRecentIssue('invalid');
        expect(date).to.be.null;
    });

    it('Should return the time and the id of the most recent issue', async () => {
        await issues.saveIssues('isocpp/CppCoreGuidelines', data2);
        const date = await issues.dateRecentIssue('isocpp/CppCoreGuidelines');
        expect(date).to.deep.equal(new Date(data2[1].updated_at));
    });

    it('Should return just the issue with state open', async () => {
        await issues.saveIssues('isocpp/CppCoreGuidelines', data1);
        const res = await issues.getIssues('isocpp/CppCoreGuidelines', 'open');
        expect(res.length).to.equal(1);
        expect(res[0].repository).to.deep.equal('isocpp/CppCoreGuidelines');
        expect(res[0].issueId).to.deep.equal(data1[0].id);
        expect(res[0].state).to.deep.equal(data1[0].state);
        expect(res[0].labels).to.deep.equal(data1[0].labels);
        expect(res[0].updateTime).to.deep.equal(new Date(data1[0].updated_at));
        expect(res[0].creationTime).to.deep.equal(new Date(data1[0].created_at));
        expect(res[0].metadata).to.deep.equal(data1[0]);
    });

    it('Should return just the issue with state close', async () => {
        await issues.saveIssues('isocpp/CppCoreGuidelines', data1);
        const res = await issues.getIssues('isocpp/CppCoreGuidelines', 'closed');
        expect(res.length).to.equal(1);
        expect(res[0].repository).to.deep.equal('isocpp/CppCoreGuidelines');
        expect(res[0].issueId).to.deep.equal(data1[1].id);
        expect(res[0].state).to.deep.equal(data1[1].state);
        expect(res[0].labels).to.deep.equal(data1[1].labels);
        expect(res[0].updateTime).to.deep.equal(new Date(data1[1].updated_at));
        expect(res[0].creationTime).to.deep.equal(new Date(data1[1].created_at));
        expect(res[0].metadata).to.deep.equal(data1[1]);
    });

    it('Should return the issues with all states', async () => {
        await issues.saveIssues('isocpp/CppCoreGuidelines', data1);
        const res = await issues.getIssues('isocpp/CppCoreGuidelines');
        expect(res.length).to.equal(2);
        expect(res[0].repository).to.deep.equal('isocpp/CppCoreGuidelines');
        expect(res[0].issueId).to.deep.equal(data1[0].id);
        expect(res[0].state).to.deep.equal(data1[0].state);
        expect(res[0].labels).to.deep.equal(data1[0].labels);
        expect(res[0].updateTime).to.deep.equal(new Date(data1[0].updated_at));
        expect(res[0].creationTime).to.deep.equal(new Date(data1[0].created_at));
        expect(res[0].metadata).to.deep.equal(data1[0]);
        expect(res[1].repository).to.deep.equal('isocpp/CppCoreGuidelines');
        expect(res[1].issueId).to.deep.equal(data1[1].id);
        expect(res[1].state).to.deep.equal(data1[1].state);
        expect(res[1].labels).to.deep.equal(data1[1].labels);
        expect(res[1].updateTime).to.deep.equal(new Date(data1[1].updated_at));
        expect(res[1].creationTime).to.deep.equal(new Date(data1[1].created_at));
        expect(res[1].metadata).to.deep.equal(data1[1]);
    });

    it('Should replace and existing document', async () => {
        // Use spread to retrieve a shallow copy of each object.
        let data = data1.map(item => ({...item}));
        await issues.saveIssues('isocpp/CppCoreGuidelines', data);
        data[0].updated_at = new Date();
        data[1].state = 'open';
        await issues.saveIssues('isocpp/CppCoreGuidelines', data);
        const res = await issues.getIssues('isocpp/CppCoreGuidelines', 'open');
        expect(res.length).to.equal(2);
        expect(res[0].repository).to.deep.equal('isocpp/CppCoreGuidelines');
        expect(res[0].issueId).to.deep.equal(data[0].id);
        expect(res[0].state).to.deep.equal(data[0].state);
        expect(res[0].labels).to.deep.equal(data[0].labels);
        expect(res[0].updateTime).to.deep.equal(data[0].updated_at);
        expect(res[0].creationTime).to.deep.equal(new Date(data[0].created_at));
        expect(res[0].metadata).to.deep.equal(data[0]);
        expect(res[1].repository).to.deep.equal('isocpp/CppCoreGuidelines');
        expect(res[1].issueId).to.deep.equal(data[1].id);
        expect(res[1].state).to.deep.equal(data[1].state);
        expect(res[1].labels).to.deep.equal(data[1].labels);
        expect(res[1].updateTime).to.deep.equal(new Date(data[1].updated_at));
        expect(res[1].creationTime).to.deep.equal(new Date(data[1].created_at));
        expect(res[1].metadata).to.deep.equal(data[1]);
    });

    it('Should return the statistics about time', async () => {
        sinon.stub(Date, 'now').returns(1602000000000);
        await issues.saveIssues('isocpp/CppCoreGuidelines', data4);
        const [mean, std] = await issues.openIssuesStats('isocpp/CppCoreGuidelines');
        sinon.restore();
        expect(mean).to.deep.equal(1);
        expect(std).to.deep.equal(0);
    });

    it('Should return the number of open issues', async () => {
        await issues.saveIssues('isocpp/CppCoreGuidelines', data4);
        const number = await issues.openIssuesCount('isocpp/CppCoreGuidelines');
        expect(number).to.deep.equal(2);
    });

    it('Should return the historical data of issues', async () => {
        await issues.saveIssues('isocpp/CppCoreGuidelines', data5);
        const res = await issues.hist('isocpp/CppCoreGuidelines');
        expect(res).to.have.ownProperty('2020-10-11');
        expect(res['2020-10-11']).to.deep.equal(2);
    });
});
