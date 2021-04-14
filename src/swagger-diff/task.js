"use strict";
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
var util = require("util");
// var fail = require("assert").fail;
var task = require("vsts-task-lib/task");

var swaggerVersion = task.getInput("swaggerVersion", true);

var leftType = task.getInput("leftType", true);
var rightType = task.getInput("rightType", true);

var leftPath = "",
  rightPath = "";

if (leftType === "file") {
  leftPath = task.getPathInput("leftFilePath", true, true);
} else {
  leftPath = task.getInput("leftUrl", true);
}

if (rightType === "file") {
  rightPath = task.getPathInput("rightFilePath", true, true);
} else {
  rightPath = task.getInput("rightUrl", true);
}

var config = null;

var extConfig = task.getInput("config", false);

if (swaggerVersion == "v2") {
  var swaggerDiffLib = require("swagger-diff");

  if (extConfig && extConfig !== "") {
    config = JSON.parse(extConfig);
  } else {
    config = {
      changes: {
        breaks: 3,
        smooths: 2,
      },
    };
  }

  task.debug("Config: " + JSON.stringify(config));

  swaggerDiffLib(leftPath, rightPath, config).then(
    function (diff) {
      diff.errors.forEach(function (value) {
        task.error(
          util.format("Rule: %s, Message %s", value.ruleId, value.message)
        );
        task.debug("Error: " + JSON.stringify(value));
      });

      diff.warnings.forEach(function (value) {
        task.warning(
          util.format("Rule: %s, Message %s", value.ruleId, value.message)
        );
        task.debug("Warning: " + JSON.stringify(value));
      });

      diff.infos.forEach(function (value) {
        console.log(
          util.format("Rule: %s, Message %s", value.ruleId, value.message)
        );
        task.debug("Warning: " + JSON.stringify(value));
      });

      // Handle result
      task.debug(JSON.stringify(diff));

      if (diff.errors && diff.errors.length > 0) {
        task.setResult(
          task.TaskResult.Failed,
          util.format("%s Errors found in Swagger Diff", diff.errors.length)
        );
      }
    },
    function (reason) {
      task.error(
        "An error occurred calling swagger-diff" + JSON.stringify(reason)
      );
      task.setResult(
        task.TaskResult.Failed,
        "An error occurred calling swagger-diff!"
      );
    }
  );
} else {
  (async () => {
    const openapiDiff = require("openapi-diff");
    const fs = require("fs");
    const fetch = require("node-fetch");

    const readFile = util.promisify(fs.readFile);

    var leftcontent = "",
      rightcontent = "";
    if (leftType == "file") {
      leftcontent = (await readFile(leftPath)).toString();
    } else {
      leftcontent = await (await fetch(leftPath)).text();
    }

    if (rightType == "file") {
      rightcontent = (await readFile(rightPath)).toString();
    } else {
      rightcontent = await (await fetch(rightPath)).text();
    }

    const result = await openapiDiff.diffSpecs({
      sourceSpec: {
        content: leftcontent,
        location: leftPath,
        format: "openapi3",
      },
      destinationSpec: {
        content: rightcontent,
        location: rightPath,
        format: "openapi3",
      },
    });

    if (result.breakingDifferencesFound) {
      result.breakingDifferences.forEach((value) => {
        var spec = [];
        if (value.sourceSpecEntityDetails.length > 0)
          spec = spec.concat(value.sourceSpecEntityDetails);
        if (value.destinationSpecEntityDetails.length > 0)
          spec = spec.concat(value.destinationSpecEntityDetails);

        console.log(
          util.format(
            "%s change - %s: %s",
            value.type,
            value.code,
            spec[0].location
          )
        );
        task.error(
          util.format(
            "%s change - %s: %s",
            value.type,
            value.code,
            spec[0].location
          )
        );
        task.debug("Error: " + JSON.stringify(value));
      });
    }

    result.nonBreakingDifferences.forEach((value) => {
      var spec = [];
      if (value.sourceSpecEntityDetails.length > 0)
        spec = spec.concat(value.sourceSpecEntityDetails);
      if (value.destinationSpecEntityDetails.length > 0)
        spec = spec.concat(value.destinationSpecEntityDetails);

      console.log(
        util.format(
          "%s change - %s: %s",
          value.type,
          value.code,
          spec[0].location
        )
      );
      task.warning(
        util.format(
          "%s change - %s: %s",
          value.type,
          value.code,
          spec[0].location
        )
      );
      task.debug("Warning: " + JSON.stringify(value));
    });

    result.unclassifiedDifferences.forEach((value) => {
      var spec = [];
      if (value.sourceSpecEntityDetails.length > 0)
        spec = spec.concat(value.sourceSpecEntityDetails);
      if (value.destinationSpecEntityDetails.length > 0)
        spec = spec.concat(value.destinationSpecEntityDetails);

      console.log(
        util.format(
          "%s change - %s: %s",
          value.type,
          value.code,
          spec[0].location
        )
      );

      task.debug("Warning: " + JSON.stringify(value));
    });

    // Handle result
    task.debug(JSON.stringify(result));

    if (result.breakingDifferencesFound) {
      task.setResult(
        task.TaskResult.Failed,
        util.format(
          "%s breaking differences found",
          result.breakingDifferences.length
        )
      );
    }
    else{
      task.setResult(
        task.TaskResult.Succeeded,
        "0 Breaking differences found",
      )
    }
  })().catch((e) => {
    task.error("An error occurred calling openapi-diff" + JSON.stringify(e));
    task.setResult(
      task.TaskResult.Failed,
      "An error occurred calling openapi-diff!"
    );
  });
}
