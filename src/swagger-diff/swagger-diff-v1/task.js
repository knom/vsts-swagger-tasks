"use strict";
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
var util = require("util");
// var fail = require("assert").fail;
var task = require("azure-pipelines-task-lib/task");

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
  (diff) => {
    diff.errors.forEach((value) => {
      task.error(
        util.format("Rule: %s, Message %s", value.ruleId, value.message)
      );
      task.debug("Error: " + JSON.stringify(value));
    });

    diff.warnings.forEach((value) => {
      task.warning(
        util.format("Rule: %s, Message %s", value.ruleId, value.message)
      );
      task.debug("Warning: " + JSON.stringify(value));
    });

    diff.infos.forEach((value) => {
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
  (reason) => {
    task.error(
      "An error occurred calling swagger-diff" + JSON.stringify(reason)
    );
    task.setResult(
      task.TaskResult.Failed,
      "An error occurred calling swagger-diff!"
    );
  }
);
