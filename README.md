# asa-parse
CLI tool to parse Cisco 8.2 configurations into JSON.

Takes a Cisco ASA <8.2 configuration from STDIN and outputs JSON version of configuration to STDOUT.

```sh
cat example.conf | ./asa-parse.js | jq
```
