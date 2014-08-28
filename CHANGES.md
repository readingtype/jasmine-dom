## Changes

### 2014-08-29 Ben Weiner (ben@readingtype.org.uk).

Amends to allow the matchers module to work with Jasmine 2.

The original author who created the matcher and fixtures modules against Jasmine 1 has stated that he does not intend to do further work on the project.

* Renamed toContain matcher to toContainNode

* All specs now pass against Jasmine 2.0.0-rc5. NB I inherited quite a lot of commented out stuff and I have not explored it.

* I've also left in some code in the matchers module that I believe isn't ever executed. That should really go. 