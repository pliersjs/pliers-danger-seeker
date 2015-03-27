var async = require('async')
  , fs = require('fs')
  , streamGrep = require('stream-grep')
  , relative = require('path').relative

module.exports = function (pliers, path) {

  var dangerConfig = require(path + '/danger-config')

  function processGroup(type, group, callback) {
    var totalFound = 0

    function checkFile(type, file, terms, matcher, errorMessage, callback) {
      pliers.logger.debug('Searching file', file)
      var log = type === 'error' ? pliers.logger.error : pliers.logger.warn
      streamGrep(fs.createReadStream(file), terms, matcher)
        .on('found', function (term, line) {
          log(type, relative(process.cwd(), file) + ':' + line, '-- found', term)
        })
        .on('captured', function (term, line) {
          // matcher.
          log(type, relative(process.cwd(), file) + ':' + line, '-- found "' + term + '"')
        })
        .on('end', function(found) {
          totalFound += found
          callback(null)
        })
    }

    function processRule(type, rule, callback) {
      pliers.logger.info('Searching for', rule.description, 'in fileset', '\'' + rule.fileset + '\'', rule.terms)
      var files = []

      if (Array.isArray(rule.fileset)) {
        rule.fileset.forEach(function(fileset) {
          files = files.concat(pliers.filesets[fileset])
        })
      } else {
        files = pliers.filesets[rule.fileset]
      }

      async.each(files, function(file, cb) {
        checkFile(type, file, rule.terms, rule.matcher, rule.description, cb)
      }, callback)
    }

    async.eachSeries(group, processRule.bind(null, type), function(error) {
      if (error) callback(error)
      callback(null, totalFound)
    })
  }

  pliers('findDanger', function (done) {
    async.series(
      [ async.apply(processGroup, 'error', dangerConfig.error)
      , async.apply(processGroup, 'warning', dangerConfig.warning)
      ], function(error, errors) {
        if (error) done(error)
        if (errors[0] > 0) {
          pliers.logger.error('Errors found exiting - ', errors[0])
          process.exit(1)
        }
        done()
      })
  })
}
