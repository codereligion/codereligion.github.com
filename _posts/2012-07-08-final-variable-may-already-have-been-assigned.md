---
layout: post
author: whiskeysierra
title: Final variable may already have been assigned
date: '2012-07-08T17:22:00+02:00'
tags:
- coding tricks
comments: true
---
You may have encountered this javac compiler error when trying to code something like this

{% highlight java %}
public void work() {
    final byte[] content;

    try {
        content = readContent();
    } catch (IOException e) {
        content = getDefaultContent();
    }

    // do stuff with content here
}
{% endhighlight %}

What happens now is, that the compiler complains about the second assignment of `content`. If you are a fan of 
*The Final Story* ([Chapter 2](http://oreilly.com/catalog/hardcorejv/chapter/ch02.pdf) of 
[Hardcore Java](http://shop.oreilly.com/product/9780596005689.do)) as big as we are, than getting rid of final is not 
an option.

Do this instead:

{% highlight java %}
private byte[] readContentIfPossible() {
    try {
        return readContent();
    } catch (IOException e) {
        return getDefaultContent();
    }
}

public void work() {
    final byte[] content = readContentIfPossible();
    // do stuff with content here
}
{% endhighlight %}
