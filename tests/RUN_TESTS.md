# Running tests

Tests depend on the [Jasmine](http://jasmine.github.io/) testing framework,
currently using v. 2.3.4, and are run in the browser in two different ways.
 
## Remote mode

In remote mode, the Jasmine files are loaded on the fly from the CloudFlare
CDN. Load the `$TUNA_BRANCH_ROOT/tests/online-runner.html` file in your
browser: you should see a test output page with zero failures.

## Local mode

In local mode, first install the Jasmine files inside your local branch by
using the Bower package manager. Installation instructions for Bower can 
be found at http://bower.io/


```
$ cd $TUNA_BRANCH_ROOT/tests
$ bower install
```

If all went well, there will be a newly created
`$TUNA_BRANCH_ROOT/tests/bower_components` directory. Now load the
`$TUNA_BRANCH_ROOT/tests/offline-runner.html` file in your browser: you should
see the same output page as in remote mode.
