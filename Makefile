-include .env.local

.PHONY: content

content: src/wiki-content.json

src/wiki-content.json:
	curl -k -o $@ -H PRIVATE-TOKEN:$(GITLAB_WIKI_TOKEN) $(GITLAB_WIKI_URL)?with_content=1
