const mongoose = require('mongoose');

const issueSchema = new mongoose.Schema({
    repository: {type: String, required: true},
    updateTime: {type: Date, required: true},
    creationTime: {type: Date, required: true},
    state: {type: String, required: true},
    issueId: {type: Number, required: true, unique: true},
    labels: [{type: Object}],
    /* Metadata field is added to save the document retrieved. It is important
    because as the project continues, it may be necessary to retrieve another
    information about the issues. */
    metadata: {type: Object, required: false},
});

/* These indexes are created to retrieve the data necessary for the services
efficiently. */
issueSchema.index({issueId: 1});
issueSchema.index({repository: 1, updateTime: 1, state: 1});

/* This index above is created for Phase III, where the users should see the
issues grouped by labels. */
issueSchema.index({repository: 1, state: 1, labels: 1});

module.exports = mongoose.model('issues', issueSchema);
