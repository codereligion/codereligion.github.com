---
layout: post
author: whiskeysierra
title: Exit strategies
date: '2013-12-27T16:00:00+01:00'
tags:
- java
- effective
- clean
- structure
- refactoring
- improvement
---

- Exit point = Return or exception
  - Single vs. multiple return points
  - Single vs. multiple exception points?
- Single exit point
  - Pro
    - Resource management
    - Allegedly more understandable/readable
  - Contra
    - Additional boolean variables
    - Additional control structures
    - Allegedly less understandable/readable
    - Manual resource management is usually not required in languages with garbage collection or with try-finally support
    - Usually forces one to not use the final keyword
    - Usually higher indentation
  - Multiple exit points
    - Pro
      - Allows Guard clauses, although there are better alternatives, e.g.
        - Annotations and aspects e.g.@Requires(State.ACTIVE)
        - Exceptions
        - Preconditions
      - Or Bouncer pattern
      - Fail fast
      - More in line with the human way of thinking: return as soon as possible: e.g. find element in array
      - Allegedly less code
      - Allegedly more understandable/readable
      - Supposedly faster
    - Contra
      - Allegedly less understandable/readable
      - Allegedly harder to debug
      - Can often be replaced by a ternary expression
      - Often indicates too complicated methods which need to be broken into smaller units anyway
- Conclusion
  - Less return points does not necessarily mean less execution paths, usually even more
  - SESE is a solution to an ancient problem
  - Rigidly confirming to a pattern without fully understanding it's purpose is...
  - Correlation between complexity and number of return points?
  - Big functions are the problem, not multiple exit points
  - Developers should evolve along with the languages they are using.
