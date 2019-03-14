'use strict';
var _ = require('lodash');
var Interface = require('forest-express');
var CompositeKeysManager = require('./composite-keys-manager');

function ResourceFinder(model, params, withIncludes) {
  var schema = Interface.Schemas.schemas[model.name];
  var compositeKeysManager = new CompositeKeysManager(model, schema, params);

  function getIncludes() {
    var includes = [];

    _.values(model.associations).forEach(function (association) {
      // TODO: scope is sometimes defined as function in model defined for modified graphql and sequelize..so this is not proper sequelize usecase
      if (['HasOne', 'BelongsTo'].indexOf(association.associationType) > -1 && _.isFunction(association.scope) == false) {
        includes.push({
          model: association.target.unscoped(),
          as: association.associationAccessor
        });
      }
    });

    // NOTICE: Avoid to inject an empty "include" array inside conditions
    //         otherwise Sequelize 4.8.x won't set the WHERE clause in the SQL
    //         query.
    return includes.length === 0 ? null : includes;
  }

  this.perform = function () {
    var conditions = { where: {} };

    if (withIncludes) {
      conditions.include = getIncludes();
    }

    if (schema.isCompositePrimary) {
      conditions.where = compositeKeysManager
        .getRecordConditions(params.recordId);
    } else {
      conditions.where[schema.idField] = params.recordId;
    }

    conditions.requestUser = {role: 'admin'};
    return model.find(conditions);
  };
}

module.exports = ResourceFinder;
