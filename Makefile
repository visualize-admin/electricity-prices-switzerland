-include .env.local

.PHONY: content

content: src/wiki-content.json

src/wiki-content.json:
	bun src/wiki-content download
