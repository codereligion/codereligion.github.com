---
layout: page
permalink: /about/index.html
title: About us
modified: 2013-12-25
image:
#  feature: feature/lost-hindu-temple.jpg
---

{% for hash in site.authors %}
{% assign nickname = hash[0] %}
{% assign author = hash[1] %}
<img class="author-photo" src="http://www.gravatar.com/avatar/{{ author.gravatar }}?s=400"/>

## {{ author.name }} ({{ nickname }})
 
{% assign template = nickname | append:'.md' %}
{% include {{template}} %}
{% endfor %}

## How they became friends
They met each other at the Beuthochschule and became friends very soon. They both learned about Java as an object
oriented programming language and developed a strong interest in code quality and related topics.