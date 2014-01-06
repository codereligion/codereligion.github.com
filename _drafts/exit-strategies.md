---
layout: post
author: whiskeysierra
title: Exit strategies
tags:
- java
- exit point
- effective
- clean
- structure
- refactoring
- improvement
image:
    feature: feature/exit.jpg
    credit: Jesse Millan
    creditlink: http://www.flickr.com/photos/stopdown/404899232/
comments: true
---

You may have learnt it in a programming course, read it in a book or heard it from someone who uses it like a mantra:

> Every method should have only one return statement at the end.

This paradigm is also known as:

- [*The single function exit point rule*](http://c2.com/cgi/wiki?SingleFunctionExitPoint)
- [*The single exit point law*](http://anthonysteele.co.uk/the-single-exit-point-law)

Usually every programmer has come across this one at least once in his/her career and it is still one of the most
disputed programming guidelines to this day.

But to fully understand how it influences you (or how it doesn't) we need to take a closer look, understand what it
really is about and weigh all the pros and cons.

## What is an exit point?
Well, during the time the principle was formed, which is the age of
[structural programming](http://en.wikipedia.org/wiki/Structured_programming), there were only two:

1. the [`return` statement](http://en.wikipedia.org/wiki/Return_statement)
2. the end of a function

But wait, don't forget the `throw` (or `raise`) statement we now have in most modern languages! Right, throwing an
exception surely exits your function, nobody can deny that. How does it relate to the *single exit point* paradigm?
Well, it kind of contradicts it, but more on that later. For now, let's limit our definition of an exit point to the
`return` statement, it's what the rule really is about.

## Single exit point

### Advantages

#### Ensures resource management
A single exit point allows to ensure and enforce cleanup of resources, being it allocated memory or some kind of file
or database handle.

It's pretty hard to come up with a Java example for this kind of problem, but I'll show why that is in a minute. For
demonstration purposes let's use a php function which does a linear search in a file:

{% highlight php startinline %}
function find_line($file_name, $prefix) {
    $handle = fopen($file_name, "r");
    $result = null;

    while (!feof($handle)) {
        $line = fgets($handle);
        if (strpos($line, $prefix) === 0) {
            $result = $line;
            break;
        }
    }

    fclose($handle);
    return $result;
}
{% endhighlight %}

In case you want to use multiple exit points you have to duplicate the cleanup code, which introduces a risk
of forgetting in a future refactoring session and increases maintenance effort.

{% highlight php startinline %}
function find_line($file_name, $prefix) {
    $handle = fopen($file_name, "r");

    while (!feof($handle)) {
        $line = fgets($handle);
        if (strpos($line, $prefix) === 0) {
            fclose($handle);
            return $line;
        }
    }

    fclose($handle);
    return null;
}
{% endhighlight %}

#### Allegedly improves readability
Some argue that having more than one exit point <cite>interrupts the logical flow of the function, and therefor makes
it harder to understand</cite>.

This is of course a very subjective topic and it's pretty hard to back up and to prove wrong based on hard evidence.

### Disadvantages

#### Additional variables, more state
Having a single exit point forces you to introduce more mutable state to your function and when I say state, I'm
talking about local variables. Compare the last two examples, the first one uses a local `$result` variable. The
second doesn't require one.

#### Additional control structures and higher indentation
Enforcing a single exit point almost always requires additional control structures, usually `if`-statements which 
introduce new complexity and increase the indentation of the code, thus reducing readability.

#### Resource management in modern languages
Modern languages, like Java, have a garbage collector, which highly reduces the risk of memory leaks and frees the
developer from manual memory management, and they usually have a `try-finally` statement, or something similar, which
helps ensuring the proper handling of resources and handles. Java 7 recently introduced the `with` block to help
simplify resource management even more.

Check out the following example which is a Java implementation of the linear file search example from above using
multiple exit points and the `with` statement.

{% highlight java %}
public String findLine(File file, String prefix) {
    with (BufferedReader reader = new BufferedReader(new FileReader(file))) {
        while (true) {
            final String line = br.readLine();
            if (line == null) {
                break;
            }
            if (line.startsWith(prefix)) {
                return line;
            }
        }
        return null;
    }
}
{% endhighlight %}

#### Doesn't go well with `final`

When you're using a local variable to hold the state of the return value, you're pretty much forced to
make it non-`final`, which takes away a lot of nice tricks you can use to make the compiler help you
even more. For more on that topic read the *The Final Story*,
[Chapter 2](http://oreilly.com/catalog/hardcorejv/chapter/ch02.pdf) of
[Hardcore Java](http://shop.oreilly.com/product/9780596005689.do).

#### Allegedly reduces readability
Huh? Didn't I just say that it <cite>allegedly improves readability</cite>? Yes, I did. In the attempt to
write this article as objectively as possible I need to take both sides into consideration and regarding readability,
this topic is pretty much equivalent to the ongoing war on where to place the curly braces, which means you'll find
as many people supporting it as you'll find people opposing it.

## Multiple exit points

### Advantages

#### Allows guard clauses
[Guard clauses](http://www.refactoring.com/catalog/replaceNestedConditionalWithGuardClauses.html)
- return fast, e.g. file not present? not found!

#### Allows bouncers
[Bouncer pattern](http://c2.com/cgi/wiki?BouncerPattern)
TODO compare to guards
- Preconditions
- Fail fast

#### Less state

#### *Mental shortcuts*
return as soon as possible: e.g. find element in array

#### Usually less code

#### Supposedly faster
  
### Disadvantages

#### Allegedly harder to debug

#### Often indicates too complicated methods
which need to be broken into smaller units anyway

## Conclusion
- Less return points does not necessarily mean less execution paths, usually even more
- Rigidly confirming to a pattern without fully understanding it's purpose is...
- Correlation between complexity and number of return points?
- Big functions are the problem, not multiple exit points
- SESE is a solution to an ancient problem
- Developers should evolve along with the languages they are using.

## References

- [*The single exit fantasy*](http://www.leepoint.net/JavaBasics/methods/method-commentary/methcom-30-multiple-return.html)
- [*Coding Tip: Have A Single Exit Point*](http://tomdalling.com/blog/coding-tips/coding-tip-have-a-single-exit-point/)

## Attributions

- [Exit](http://www.flickr.com/photos/stopdown/404899232/) by [Jesse Millan](http://www.flickr.com/photos/stopdown/)