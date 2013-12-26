---
layout: post
title: Code Smells
date: '2012-08-05T16:32:00+02:00'
tags:
- code smells
- code
- smell
- best practices
- effective
- clean
- structure
- refactoring
- improvement
tumblr_url: http://codereligion.com/post/28765684086/code-smells
---
What is a “Code Smell”?

The term “Code Smell” was first mentioned by Kent Beck and goes back in the late 1990s. Martin Fowler gave it so more thoughts and developed the term further in his book Refactoring: Improving the Design of Existing Code.

A code smell is actually hard to describe, as it is with real smells. It is something about a piece of code that just does not feel right, though you can not always precisely describe what it is.

I like description of Brandon Keepers:

A code smell is a surface indication that usually corresponds to a deeper problem in the system.

So one could say code smells represent known patterns or better “anti-patterns” and heuristics which do indicate the need for refactoring. The important part about this is, that they only indicate, but not determine that there is a definite problem. So a code smell must nearly always be evaluated on a case by case basis.

Differentiation with “Anti-Patterns”

So what is the difference between code smells and anti-patterns? In literature and general linguistic usage the terms are often used synonymously. I think that code smells are actually a subset of anti-patterns, because anti patterns tend to be more abstract and are not only specific to code. For example wikipedia states that there are the following categories of anti-patterns:

organizational
project management
software design
object-oriented design
programming
methodological
configuration management
Where does smell come from?

You probably know that feeling when you finally finished a project. You did not only fit the requirements some manager imposed on you, but you made some real nice piece of code. You feel pride. You feel you did something good, something that other people or even other programmers (yeah there are people too) can enjoy.

… but did you write tests? Did you write sufficient documentation? Did you really made the code “maintainable”?

Chances are that you did not write the best code the world has ever seen. Actually most code is already smelling when it is shipped the first time. This may come from inexperienced programmers, lack of time to refactor or even through requirements which could not be implemented any better due to external dependencies.

Everything starts smelling eventually. Even the best code starts smelling as soon as the newby programmer needs to hack some “urgent feature” into a glorified master piece. This is no need to worry. You need to accept that everything smells, yeah some things do smell more than others but trust me:

It is not all shit what stinks.

Programming is not about making the perfect code, but about keeping the chaos on a good and maintable level.

Examples

Duplicate Code

Some of you may know the term “DRY” which stands for “Don’t Repeat Yourself” which was established by Andy Hunt and Dave Thomas in their book The Pragmatic Programmer. This principle states that:

Every piece of knowledge must have a single, unambiguous, authoritative representation within a system.

So why should we stick to such a principle? In short term there is not much benefit, it even takes longer to be developed. In order to follow that principle you need to think about concepts which introduce abstraction and indirection. You may even end up developing sub-modules and thus introducing more complexity and more dependencies. More dependencies means more communication overhead and more modules to release.

So the natural thing to do is actually not to design code to be DRY, but to structure development cycles so that you will effectively detect “WET”1 code and make it DRY.

Try to find logic that is used in multiple places, especially look out for business logic, error prone and/or overly complicated logic and algorithms. You know what I mean. That pieces of code you definitely want to see only once in the whole application, because a single instance of this logic already makes your brain boil.

A good example for that is working with money/currencies. So you may have different places in your application(s) working with money. Usually you will do conversions and calculations in the backend, the middleware and even the frontend. Try to extract as much of this logic to common components as possible, because then you have one place to test it and make sure that all the common mistakes will at least only be located in one place.

Did he say common mistakes? Yes I did, you may be surprised but floating point data types like float and double are the most used data types when working with money and are highly error prone due to accuracy problems in rounding.

So you may ask now how does duplicate code get produced in the first place? I mean after all when I need to write something that is already existing I will immediately try to refactor the existing code in order to avoid duplicate code creation. 

There are a few problems which prevent this ideal world to exist. The first is that a company may have multiple groups of developers working on similar problems in different areas/projects. This is redundancy on a complete different level. Another cause of redundancy may come from refactoring which introduces redundancy which was not visible/existing before. The good thing about this is that you can always continue and make it even better. Refactoring is always to be seen as something incremental.

The last source of duplicate code, which is actually my favorite, is just plain old laziness, aka. “copy-paste-programming”. We have to constantly remind ourselves that whenever we start copy-pasting something it is usually something wrong about what we are currently doing.

So how can we detect duplicate code? The answer to this question is: Learn your domain language and application structure, because that is the only thing (despite some useful tools) which makes you aware of duplication. Review and refactor your code with every iteration.

Do not be afraid to also work on parts of the application which you do not know yet. Pair with an expert in that area and extend your knowledge.

Big Units

“Big Units” is actually not an official term, but more an aggregation of “Long Method” and “Large Class”. I like to handle these two together, because they are pretty much alike.

So what is bad about big chunks of code, be it a method or a whole class? 

The bad thing about big units is that they will most likely do more than they should. This means they handle different concerns in one place. This may have been convenient at one point but it will definitely be a pain in the ass when you start unit testing or if you do not do unit testing at least when you have to maintain the code.

There are warning signs you could look out for to avoid big units.

Gut Feeling - if it does not feel right, refactor!
Documentation - if it is hard to describe without conjunctions (and, or), refactor!
Unit Testing - if it is hard to test, refactor!
Maintenance - if it is hard to add features or debug, refactor!
So big units arise from disobeying or simply skipping the previously mentioned warnings. When you find yourself skipping one of these rules you better have a really good excuse.

Deadlines and code freezes for example are always good and valid excuses.

The best software does not earn a dime if it is not released to the customer.

The important thing is to be aware of “the skipping” and to take actions in order to solve the problem later. That can be a simple // TODO inside the code, a post-it on your desk or even a ticket in your ticket/bug-tracking system. Eventually there is always a little time for refactoring, even when it is only in babysteps.

When a code freeze is coming up and I discover code which needs to be refactored, I will postpone the refactoring for the time the QA executes their tests. Usually a code freeze means that a RC (release candidate) branch will be created on which the QA will do the testing. So as I am waiting for QA tickets to pop up I will implement my refactoring on another branch or even the trunk. I will prioritize QA tickets, but in the “free-time” I will do something useful and improve the code or increase the (unit) test coverage.

So how do we actually refactor big units when we discover them? The most important and likewise difficult thing to take care of is management of state. The more state variants you have and the more state is shared between sub-components the more difficult it gets to tear them apart. Manage your state by keeping your scope tight.

This means:
keep shared class members at a minimum
define interfaces as lean as possible, this includes input parameters, return values and side effects
reduce method side effects
avoid state over multiple members/variables
do not assign multiple values to one reference inside methods (java’s final modifier is your friend)
If your scope is tight, refactoring feels like playing with a rubik cube. If it is not, it feels like someone super-glued a few pieces together. Not so much fun.

After the scope is tightened the next step is to separate concerns. This means restructuring the code so that you can easily document each method and tell in a few lines what it does without using too much conjunctions.

Now it is time to extract, modularize and compose the logic. Use services, managements, facades and what ever the Gang Of Four has to offer to beautify your code structure and do not forget to document and test all through the way.

One last word of warning about this code smell: Do not go all nuts on slicing up your application, because there is also a code smell which is called “Lazy Unit”, which is the adversary of a big unit. Keep in mind that more abstraction and more indirection can also be seen as “code scattering” and can even make the code more difficult to understand.

Upcoming…

There is quite a bunch of code smells out there and I will try to write about some of them in my next posts. Here is a short preview of what I would still like to talk about:

too many parameters
dead code
primitive obsession & data clumps
feature envy
inappropriate intimacy
indecent exposure
refused bequest
contrived complexity
speculative generality
message chains
divergent change
shotgun surgery
empty catch clauses
arrow anti pattern
comments (not documentation)
conditional complexity
combinatorial explosion
middleman
parallel inheritance hierarchies
inconsistent names
uncommunicative names
excessively long identifier
excessively short identifier
excessive use of literals
How To Smell

The ability to smell can be achieved in many ways. Reading books and blogs about coding, best practices, effectiveness, refactoring, restructuring and alike topics helps you to gain some basics first. Get to know all aspects of the domain and the structure of your application is the next step.

Use documentation and testing to force yourself to reflect what you did. Pair with other developers which are less experienced and share your knowledge with them, also do it the other way around. You can also check out open source projects or other projects owned by your company and have a look how other people code.

Finally develop your own best practices and share it with the team, the department and maybe even the whole company.

There are also many useful tools which help you to “measure” your projects code quality. Some may already come with your IDE like “Compiler Warnings” in Eclipse or “Code Inspections” in Idea. Others can be integrated additionally into the IDE of your choice and your build server system. Examples are:

FindBugs: used for static byte code analysis to find “bugs”
PMD: used for static source code analysis to find “bugs”
Checkstyle: used for static source code analysis to validate “style”
Stan4j: structure analyser
Structure101: structure analyser
to be continued…

References & Further Information

Books

Effective Java by Joshua Bloch
Clean Code: A Handbook of Agile Software Craftsmanship by Robert C. Martin
The Pragmatic Programmer by Andy Hunt and Dave Thomas
Refactoring, Improving The Design Of Existing Code by Martin Fowler
Links

http://c2.com/cgi/wiki?CodeSmell
http://www.codinghorror.com/blog/2006/05/code-smells.html
http://www.soberit.hut.fi/mmantyla/BadCodeSmellsTaxonomy.htm
http://opensoul.org/blog/archives/2012/05/23/why-our-code-smells/
http://en.wikipedia.org/wiki/Code_smell
http://www.soberit.hut.fi/~mmantyla/ESE_2006.pdf
http://sourcemaking.com/
http://wiki.java.net/bin/view/People/SmellsToRefactorings
1 hell yeah, yet another acronym, this one stands for “Write Everything Twice”
