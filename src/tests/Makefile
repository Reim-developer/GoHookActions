pattern = *.tar.gz
extract_t = extract.ts

clean-test:
	@rm -f $(pattern)
	@echo "Clean successfully."

download-clean:
	@ts-node downloadManager.ts
	@echo "Warning: After 3 seconds, all '$(pattern)' files will be deleted"
	@sleep 3
	@$(MAKE) clean-test

download:
	@ts-node downloadManager.ts

extract:
	@$(MAKE) download
	@ts-node $(extract_t)