const axios = require('axios');
const MockAdapter = require('axios-mock-adapter');
const mock = new MockAdapter(axios);

const mongoose = require('mongoose');
const {Mockgoose} = require('mockgoose');
const mockgoose = new Mockgoose(mongoose);

const {expect} = require('chai');
const {search: db} = require('../data');
const repository = require('./repository');
const search = require('../test_data/search.json');
const dataIssues = require('../test_data/issues5.json');

const prepareMock = () => {
    mock.onGet('https://api.github.com/search/repositories' +
        '?q=vue+in:name&per_page=1').reply(200, search);
    mock.onGet('https://api.github.com/search/repositories' +
        '?q=react+in:name&per_page=1').reply(500);
    mock.onGet('https://api.github.com/search/repositories' +
        '?q=invalid+in:name&per_page=1').reply(200, {
        total_count: 0, incomplete_results: false, items: []});
    mock.onGet('https://api.github.com/repos' +
        '/isocpp/CppCoreGuidelines/issues', {
        params: {per_page: 100, page: 1, state: 'all'}
    }).reply(200, dataIssues);
    mock.onGet('https://api.github.com/repos' +
        '/isocpp/CppCoreGuidelines/issues', {
        params: {per_page: 100, page: 2, state: 'all'}
    }).reply(200, dataIssues);
    mock.onGet('https://api.github.com/repos' +
        '/angular/angular/issues', {
        params: {per_page: 100, page: 1, state: 'all'}
    }).reply(400);
}

describe('Repository', () => {

    before(async () => {
        prepareMock(); 
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
        mock.restore();
    });

    beforeEach(async () => {
        await mockgoose.helper.reset();
    });

    it('Should return the first repository', async () => {
        const res = await repository.search('vue');
        expect(res).to.deep.equal(search.items[0]);
    });

    it('Should save search information on database', async () => {
        await repository.search('vue');
        const res = await db.findOne({});
        expect(res.repository).to.deep.equal(search.items[0].full_name);
    });

    it('Should return null for a status code different of 200', async () => {
        const res = await repository.search('react');
        expect(res).to.be.null;
    });

    it('Should return null for an invalid repository', async () => {
        const res = await repository.search('invalid');
        expect(res).to.be.null;
    });

    it('Should return all data of CppCoreGuidelines', async () => {
        const res = await repository.fetchAllData(
            'isocpp/CppCoreGuidelines', 'issues', {state: 'all'}, 1
        );
        expect(res).to.deep.equal(dataIssues);
    });

    it('Should return an empty dictionary', async () => {
        const res = await repository.fetchAllData(
            'angular/angular', 'issues', {state: 'all'}, 1
        );
        expect(res).to.be.empty;
    });

    it('Should return all data of CppCoreGuidelines', async () => {
        const res = await repository.fetchDataPages(
            'isocpp/CppCoreGuidelines', 'issues', {state: 'all'}, 2
        );
        expect(res).to.deep.equal([...dataIssues, ...dataIssues]);
    });

    it('Should return an empty dictionary', async () => {
        const res = await repository.fetchDataPages(
            'angular/angular', 'issues', {state: 'all'}, 1
        );
        expect(res).to.be.empty;
    });

});
