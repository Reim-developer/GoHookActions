.PHONY: node_modules

release:
	@ncc build src/main.ts -o dist

build:
	@tsc

test-download-clean:
	@$(MAKE) -C src/tests download-clean

test-download:
	@$(MAKE) -C src/tests download

test-extract:
	@$(MAKE) -C src/tests extract