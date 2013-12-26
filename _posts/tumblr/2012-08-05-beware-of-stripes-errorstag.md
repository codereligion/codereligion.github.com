---
layout: post
title: Beware of Stripes' ErrorsTag
date: '2012-08-05T14:09:00+02:00'
tags:
- java
- stripes
- jsp
- jstl
- errorstag
- error
- validation
tumblr_url: http://codereligion.com/post/28761532820/beware-of-stripes-errorstag
---
## A little background

[Stripes](http://www.stripesframework.org/) provides a tag called 
[ErrorsTag](http://stripes.sourceforge.net/docs/current/taglib/stripes/errors.html) which could be used like this:

{% highlight xml %}
<stripes:form action="/foo/first.action">
    <stripes:errors/>
    ...
</stripes:form>
{% endhighlight %}

The default setting is to render all errors which includes global errors and field errors. It can be customized to display only one of each.

{% highlight xml %}
<stripes:form action="/foo/fist.action">
  <stripes:errors globalErrorsOnly="true"/>

  <table>
    <tr>
      <td>Username:</td>
      <td>
        <stripes:text name="username"/>
        <stripes:errors field="username"/>
      </td>
    </tr>  
  </table>
</stripes:form>
{% endhighlight %}

It is also possible to define some custom header and footer.

{% highlight xml %}
<stripes:errors>
     <stripes:errors-header><div class="errorHeader">Validation Errors</div><ul></stripes:errors-header>
     <li><stripes:individual-error/></li>
     <stripes:errors-footer></ul></stripes:errors-footer>
</stripes:errors>
{% endhighlight %}

## The problem

Some of you may yawn now and say… dooh I know that already. So here is the part where it gets interesting.

When we were implementing a feature which was rendering a  jsp inside a loop, we were having very strange problems 
while testing the error messages.

Here is an simplified representation of what we did:

{% highlight xml %}
<stripes:form action="SomeActionBean.action">

    <c:forEach items="${actionBean.items}" var="item" varStatus="loopStatus">
        <c:set var="index" value="${loopStatus.index}" />
        <%@ include file="item.jsp"%>
    </c:forEach>

</stripes:form>
{% endhighlight %}

Inside the item.jsp we were referencing the `item` and the `index` variable like this:

{% highlight xml %}
<stripes:errors field="items[${index}].label""/>
<stripes:label for="item${index}" name="item[${index}].label"/>
<stripes:text id="item${index}" name="items[${index}].label" value="${item.label}"/>
{% endhighlight %}

In our case the form does not only render already persistent items, it also allows adding new ones. This is achieved by 
some fancy jquery logic which will render the content of item.jsp into the dom and fill it with some default data when 
the user clicks an *add-button*.

Everything about this approach seems normal. We had no problems creating items nor displaying already persistent items.

The trouble started when we were doing manual testing for error message. The test could be described as follows:

- open the form with one persistent item
- add a new item (leave required fields empty)
- submit form
- check that error message is displayed for the empty required field

The error message was displayed in the right place but to our surprise the empty field was not empty anymore. It 
contained the data from the already persistent item. The rendered html was actually showing that the field showing the 
error message had the wrong index.

So we got a rendered html which looked like this.

{% highlight xml %}
<label for="label0">Label</label>
<input id="label0" name="items[0].label" value="some label" type="text"/>

Please provide a label.
<label for="label0">Label</label>
<input id="label0" name="items[0].label" value="some label" class="error" type="text"/>
{% endhighlight %}

While we were actually expecting it to be like this:

{% highlight xml %}
<pre name="code" class="xml">
<label for="label0">Label</label>
<input id="label0" name="items[0].label" value="some label" type="text"/>

Please provide a label.
<label for="label1">Label</label>
<input id="label1" name="items[1].label" value="" class="error" type="text"/>
{% endhighlight %}

## The cause

Our first thought was that this must be some server side mixup when processing the data. Sadly it was not. So we 
started debugging the jsp rendering and hell was that painful. Infact we were not able to identify how the weird html 
could be produced.

We knew that something was changing the `index` while we were iterating over the items, but the logic was pretty straight 
forward and had no side effects to the `index` variable.

For a few seconds we thought about race conditions, but since jsp rendering is sequential there should not be any 
concurrency issues.

Than a lightning struck me and I remembered how a former colleague of mine was cursing about the `ErrorsTag` of Stripes 
and that it did something very terrible with the page scope. So I went into the `ErrorsTag` and found this:

{% highlight java %}
    /** Sets the context variables for the current error and index */
    public void doInitBody() throws JspException {
        // Apply TEI attributes
        getPageContext().setAttribute("index", this.index);
        getPageContext().setAttribute("error", this.currentError);
    }


    /**
     * Manages iteration, running again if there are more errors to display.  If there is no
     * nested FieldError tag, will ensure that the body is evaluated only once.
     *
     * @return EVAL_BODY_TAG if there are more errors to display, SKIP_BODY otherwise
     */
    public int doAfterBody() throws JspException {
        if (this.display && this.nestedErrorTagPresent && this.errorIterator.hasNext()) {
            this.currentError = this.errorIterator.next();
            this.index++;

            // Reapply TEI attributes
            getPageContext().setAttribute("index", this.index);
            getPageContext().setAttribute("error", this.currentError);
            return EVAL_BODY_BUFFERED;
        }
        else {
            return SKIP_BODY;
        }
    }
{% endhighlight %}

So what happens here? The Stripes tag actually overrides our helper variable `index` for their own purposes and does 
not care to preserve the value afterwards.

## The fix

We fixed it by renaming our variable to something like `itemIndex` but one could also fix the root problem and talk to 
the Stripes guys if they could find a way to preserve the index and re-assign it after the `ErrorsTag` has finished his 
tasks. So far I could not find that this is a known error, but I will spend some more time investigating and maybe open 
a bug ticket in their jira.

## Conclusion

Until this thing is fixed consider `index` and `error` Stripes reserved words and do not use them as page scoped 
variables when working with `ErrorsTag` in your jsps.
