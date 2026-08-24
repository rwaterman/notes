---
tags: [aws, ec2, snippet]
---

# EC2 User Data

Script handed to an instance at launch; **cloud-init** runs it on **first boot, as root**. For bootstrapping — packages, config fetch, fleet registration. Bake the base image with EC2 Image Builder or Packer; keep user data for last-mile config.

- Runs once by default. Limit **16 KB** raw — bigger → fetch a script from S3.
- Output: `/var/log/cloud-init-output.log` — first stop when a launch "did nothing".
- To run on every boot, prepend a cloud-config part:

```yaml
#cloud-config
cloud_final_modules:
  - [scripts-user, always]
```

## Example (Amazon Linux 2023)

```bash
#!/bin/bash
set -euxo pipefail
dnf update -y
dnf install -y nginx
systemctl enable --now nginx
echo "<h1>$(hostname -f)</h1>" > /usr/share/nginx/html/index.html
```

## Read user data from inside the instance (IMDSv2)

```bash
TOKEN=$(curl -sX PUT "http://169.254.169.254/latest/api/token" \
  -H "X-aws-ec2-metadata-token-ttl-seconds: 600")
curl -s -H "X-aws-ec2-metadata-token: $TOKEN" \
  http://169.254.169.254/latest/user-data
```

## SSH

```sh
ssh -i key.pem ec2-user@<public-ip>
```
