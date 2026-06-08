---
permalink: /others/
title: "Others"
author_profile: true
---

<style>
/* 柔和 sans-serif */
.page {
  font-family: "PingFang SC", "Microsoft YaHei", "Hiragino Sans GB", sans-serif;
}

.friends-list {
  list-style: none;
  padding: 0;
  margin: 1.5em 0;
  max-width: 480px;
}
.friends-list li {
  border-bottom: 1px solid #ede4d5;
}
.friends-list li:last-child {
  border-bottom: none;
}
.friends-list a {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.85em 0.4em;
  text-decoration: none;
  color: #4a3728;
  font-size: 1.05em;
  transition: all 0.2s;
}
.friends-list a:hover {
  color: #a08060;
  padding-left: 0.8em;
}
.friends-list .friend-name {
  letter-spacing: 0.06em;
}
.friends-list .friend-arrow {
  font-size: 0.8em;
  color: #c8a97e;
  opacity: 0;
  transform: translateX(-4px);
  transition: all 0.2s;
}
.friends-list a:hover .friend-arrow {
  opacity: 1;
  transform: translateX(0);
}

.friends-empty {
  color: #bbb;
  font-style: italic;
  padding: 1em 0;
}
</style>

## 🔗 Friends

{% if site.data.friends %}
<ul class="friends-list">
  {% for friend in site.data.friends %}
    <li>
      <a href="{{ friend.url }}" target="_blank" rel="noopener noreferrer">
        <span class="friend-name">{{ friend.name }}</span>
        <span class="friend-arrow">→</span>
      </a>
    </li>
  {% endfor %}
</ul>
{% else %}
<p class="friends-empty">暂无友链。</p>
{% endif %}
