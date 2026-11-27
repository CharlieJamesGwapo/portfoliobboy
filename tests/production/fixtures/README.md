The production CSP browser test generates an ephemeral localhost certificate
and key using OpenSSL, in the OS temp directory. Do not add certificate or
private-key fixtures here. Only the test's isolated browser page accepts its
self-signed identity; deployed services keep normal TLS validation.
