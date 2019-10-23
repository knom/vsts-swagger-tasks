# Swagger Contract Diff [![Version](https://img.shields.io/vscode-marketplace/v/knom.vsts-swagger-diff.svg?label=VS%20Marketplace&logo=visual-studio-code&logoColor=white)](https://marketplace.visualstudio.com/items?itemName=knom.vsts-swagger-diff) [![Visual Studio Marketplace Downloads](https://img.shields.io/vscode-marketplace/d/knom.vsts-swagger-diff.svg?logo=visual-studio-code&logoColor=white)](https://marketplace.visualstudio.com/items?itemName=knom.vsts-swagger-diff) [![GitHub License](https://img.shields.io/github/license/mashape/apistatus.svg)](https://github.com/knom/vsts-swagger-tasks/blob/master/LICENSE) ![Build Status](https://knom-msft.visualstudio.com/_apis/public/build/definitions/9d8fcb7c-6c11-4014-9dc2-7966c94af2b2/7/badge)

A build/release task for comparing Swagger Contracts.

Pass in URLs or Paths of Swagger 2.0 Contracts.

The task will compare the two contracts "left-side" and "right-side".

It will output any **differences** as **info, warning, errors** depending on the configuration.

You can use the task for making sure a certain Swagger contract still is in compliance with a specification.

**If an ERROR occurs, the task will per default STOP the build or release pipeline. Hence it can act as a quality gate for e.g. a release**

> Note: The task is using https://www.npmjs.com/package/swagger-diff - the Swagger-Diff tool by Nicolas Fortin (zallek).


## Sample Output


## Compare Rules
Rules performs a diff/comparison checking.
They are separated in 2 groups:

* breaking change
* smooth change

### Breaking changes
Examples:

* Delete path
* Rename path operationId
* Delete/Rename parameters
* Add a constraint on a parametter (like isRequired)
* Modify a response item


### Smooth changes
Examples:

* Add a path
* Add a param
* Add response item
* Add/Update descriptions

## Configuration
You can override the configuration of how changes are treated by passing in a custom **JSON** configuration override in the **advanced** section of the tasks properties.

### Sample JSON:

```
{
  "changes": {
    "breaks": 3,
    "smooths": 2
  }
}
```

### Log Levels:
The numbers in the sample above map to log levels:

* 3 - Error
* 2 - Warning
* 1 - Info
* 0 - Ignore

### Configure specific rules
You can also configure different log-levels for specific rules:
```
{
  "rules": {
    "delete-path": 0,
    "add-path": {
      "major": 2,
      "minor": 3,
      "patch": 3,
      "unchanged": 3
    }
  }
}
```
