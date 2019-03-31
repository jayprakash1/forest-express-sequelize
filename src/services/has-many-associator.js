'use strict';
var _ = require('lodash');

var forceAdminOption = {requestUser: {role: 'admin'}, authToken: process.env.EXTERNAL_AUTH_KEY};
function HasManyAssociator(model, association, opts, params, data) {
  this.perform = function () {
    return model
      .findById(params.recordId)
      .then(function (record) {
        var associatedIds = _.map(data.data, function (value) {
          return value.id;
        });

        // NOTICE: Deactivate validation to prevent potential issues with custom model validations.
        //         In this case, the full record attributes are missing which may raise an
        //         unexpected validation error.
        return record['add' + _.upperFirst(params.associationName)](
          associatedIds, { validate: false,
            requestUser: forceAdminOption.requestUser, authToken: forceAdminOption.authToken });
      });
  };
}

module.exports = HasManyAssociator;
