# OpenAPI Contract Diff

A build/release task for comparing OpenAPI Contracts.

Pass in URLs or Paths of OpenAPI (3.0) or Swagger (2.0) Contracts.

The task will compare the two contracts "left-side" and "right-side".

It will output any **differences** as **info, warning, errors** depending on the configuration.

You can use the task for making sure a certain Swagger contract still is in compliance with a specification.

**If an ERROR occurs, the task will per default STOP the build or release pipeline. Hence it can act as a quality gate for e.g. a release**

> Note: The task is using the following libraries...
* https://www.npmjs.com/package/swagger-diff for 2.0
* https://www.npmjs.com/package/openapi-diff for 3.0

```