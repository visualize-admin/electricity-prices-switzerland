-include .env.local

.PHONY: content

content: src/domain/wiki/content.json

src/domain/wiki/content.json:
	bun src/wiki-content download
