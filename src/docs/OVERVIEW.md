# OpenAPI Contract Diff 
[![Version](https://img.shields.io/vscode-marketplace/v/knom.vsts-swagger-diff.svg?label=VS%20Marketplace&logo=visual-studio-code&logoColor=white)](https://marketplace.visualstudio.com/items?itemName=knom.vsts-swagger-diff) [![Visual Studio Marketplace Downloads](https://img.shields.io/vscode-marketplace/d/knom.vsts-swagger-diff.svg?logo=visual-studio-code&logoColor=white)](https://marketplace.visualstudio.com/items?itemName=knom.vsts-swagger-diff) [![GitHub License](https://img.shields.io/github/license/mashape/apistatus.svg)](https://github.com/knom/vsts-swagger-tasks/blob/master/LICENSE) ![Build Status](https://knom-msft.visualstudio.com/_apis/public/build/definitions/9d8fcb7c-6c11-4014-9dc2-7966c94af2b2/7/badge)

A build/release task for comparing OpenAPI Contracts.

Pass in URLs or Paths of OpenAPI (3.0) or Swagger (2.0) Contracts.

The task will compare the two contracts "left-side" and "right-side".

It will output any **differences** as **info, warning, errors** depending on the configuration.

You can use the task for making sure a certain Swagger contract still is in compliance with a specification.

**If an ERROR occurs, the task will per default STOP the build or release pipeline. Hence it can act as a quality gate for e.g. a release**

> Note: The task is using the following libraries...
> * https://www.npmjs.com/package/swagger-diff for 2.0
> * https://www.npmjs.com/package/openapi-diff for 3.0


## Usage
Configure the schema version of the contract (both have to have the same version)
* OpenAPI (3.0)
* Swagger (2.0)

Add left- and right-side contract, which can be
* a file on the build agent
* a publicly accessible URL

![Usage](docs/task.png)

## Output
### Sample output of diff-comparison of two **OpenAPI v3 contracts**
![Result1](docs/result1.png)

> Note: Right now OpenAPI DIFF is way less detailed than Swagger one is. This is back to the output of the underlying libraries.

### Sample output of diff-comparison of two **Swagger v2 contracts**
![Result2](docs/result2.png)